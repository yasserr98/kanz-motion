"""Check that this machine can make a Kanz Reel (workflow review M6, 2026-10-17).

    python engine/make.py doctor              # tools, fonts, keys, render host, Codex, reference sheets
    python engine/make.py doctor <name>       # also the project's scene structure and object approvals
    python engine/make.py doctor --shorts     # also OpenCV and yt-dlp for shorts; not needed for voice notes

Prints OK / WARN / FAIL per line; FAIL means a step of the checklist cannot run. Exit code 1 when anything FAILs.
Never prints key values.
"""
import importlib.util
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "engine"))


def version(cmd):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", timeout=20)
    except (OSError, subprocess.TimeoutExpired):
        return None
    out = (r.stdout or r.stderr).strip().splitlines()
    return out[0] if r.returncode == 0 and out else None


def checks(proj=None, shorts=False):
    """Yield (level, what, detail)."""
    py = sys.version_info
    yield ("OK" if py >= (3, 11) else "FAIL", "Python", f"{py.major}.{py.minor}.{py.micro} (needs 3.11+)")
    for mod, why in [("numpy", "render mix"), ("PIL", "contact sheets"), ("playwright", "render, lint")]:
        ok = importlib.util.find_spec(mod) is not None
        yield ("OK" if ok else "FAIL", f"python module {mod}", why if ok else "python -m pip install -r requirements.txt")
    if shorts:
        for mod, why in [("cv2", "shorts face tracking"), ("yt_dlp", "shorts source downloads")]:
            ok = importlib.util.find_spec(mod) is not None
            yield ("OK" if ok else "FAIL", f"python module {mod}",
                   why if ok else "python -m pip install -r requirements-shorts.txt")
    for tool in ("ffmpeg", "ffprobe"):
        v = version([tool, "-version"])
        yield ("OK" if v else "FAIL", tool, v.split(" Copyright")[0] if v else "not on PATH (install ffmpeg)")
    node = version(["node", "--version"])
    major = int(re.sub(r"\D", "", node.split(".")[0]) or 0) if node else 0
    yield ("OK" if major >= 18 else "FAIL", "Node.js", node or "not on PATH (needs 18+)")
    gsap = ROOT / "node_modules" / "gsap" / "package.json"
    yield ("OK" if gsap.exists() else "FAIL", "GSAP",
           json.loads(gsap.read_text(encoding="utf-8"))["version"] if gsap.exists() else "run npm ci")
    if importlib.util.find_spec("playwright"):
        # in a child process: a broken Playwright driver must not take the doctor down with it
        probe = ("from pathlib import Path; from playwright.sync_api import sync_playwright\n"
                 "with sync_playwright() as p: print(Path(p.chromium.executable_path).exists())")
        try:
            r = subprocess.run([sys.executable, "-c", probe], capture_output=True, text=True, encoding="utf-8", timeout=90)
            ok = r.returncode == 0 and r.stdout.strip().endswith("True")
            why = ("installed" if ok else "python -m playwright install chromium" if r.returncode == 0 else
                   f"Playwright could not start ({sys.executable}); reinstall requirements in this Python")
        except subprocess.TimeoutExpired:
            ok, why = False, "Playwright did not answer in 90 s"
        yield ("OK" if ok else "FAIL", "Playwright Chromium", why)
    for font in ("ThmanyahDisplay-Bold.woff2", "IBM-Regular.ttf", "IBM-Medium.ttf"):
        f = ROOT / "brand" / "fonts" / font
        yield ("OK" if f.exists() else "FAIL", f"font {font}", "brand/fonts" if f.exists() else "missing from brand/fonts")
    import eleven
    env = eleven.env()
    yield ("OK" if (ROOT / ".env").exists() else "WARN", ".env", "found" if (ROOT / ".env").exists()
           else "missing: copy .env.example to .env")
    yield ("OK" if env.get("ELEVENLABS_API_KEY") else "WARN", "ELEVENLABS_API_KEY",
           "set" if env.get("ELEVENLABS_API_KEY") else "not set: no script route, transcription falls back to local Whisper")
    yield ("OK" if env.get("ELEVENLABS_VOICE_ID") else "WARN", "ELEVENLABS_VOICE_ID",
           "set" if env.get("ELEVENLABS_VOICE_ID") else "not set: pass --voice or ask Ahmed which voice to use")
    if not env.get("ELEVENLABS_API_KEY"):
        uv = version(["uv", "--version"])
        yield ("OK" if uv else "WARN", "uv (local Whisper)", uv or "not found: voice notes need uv or an ElevenLabs key")
    import make
    host = make.render_host()
    if host:
        ssh = shutil.which("ssh")
        r = subprocess.run([ssh, "-o", "BatchMode=yes", "-o", "ConnectTimeout=8", host, "true"],
                           capture_output=True, timeout=30) if ssh else None
        bash = shutil.which("bash")
        yield ("OK" if r is not None and r.returncode == 0 and bash else "WARN", "render host",
               f"{host} reachable, renders go there (--local to render here)" if r is not None and r.returncode == 0 and bash
               else f"{host} set but bash not found: renders run locally" if not bash
               else f"{host} not reachable over ssh: host renders fail; use --local explicitly to render here")
    else:
        yield ("OK", "render host", "none set: renders run on this machine (KANZ_RENDER_HOST in .env to use a server)")
    codex = version(["codex", "--version"])
    yield ("OK" if codex else "WARN", "Codex CLI", codex or "not found: the image pass (engine/codex_assets.py) needs it")
    import codex_assets
    for ref in (codex_assets.ICON_SHEET, codex_assets.NPC_SHEET):
        yield ("OK" if ref.exists() else "WARN", f"reference {ref.name}",
               "found" if ref.exists() else f"not at {ref}: set KANZ_REPO to the Kanz repo, or skip Codex and use "
                                            "approved library/objects only")
    if proj is not None:
        if not (proj / "scene.js").exists():
            yield ("FAIL", f"project {proj.name}", "no scene.js")
        else:
            warns = make.project_warnings(proj)
            yield ("OK" if not warns else "WARN", f"project {proj.name}", "scene structure and objects approved"
                   if not warns else f"{len(warns)} warning(s) below")
            for w in warns:
                yield ("WARN", "  -", w)


def main(proj=None, shorts=False):
    fails = 0
    for level, what, detail in checks(proj, shorts=shorts):
        fails += level == "FAIL"
        print(f"{level:4}  {what}: {detail}")
    print("doctor:", "ready" if not fails else f"{fails} FAIL(s): fix them before making a video")
    return 1 if fails else 0


if __name__ == "__main__":
    from console import utf8
    utf8()
    args = [a for a in sys.argv[1:] if a != "--shorts"]
    sys.exit(main(Path(args[0]) if args else None, shorts="--shorts" in sys.argv))
