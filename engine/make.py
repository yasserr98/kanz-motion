"""One command per step, from voice note or written script to video, with human checkpoints between.

Voice-note route
    python engine/make.py new <name> <voice-note>   # create projects/<name>/, copy audio, raw transcript
    python engine/make.py clean <name>              # optional: ElevenLabs voice isolator on a noisy note
    python engine/make.py audio <name>              # apply audio/edl.json (cuts, pauses, speed), final transcript
Script route (ElevenLabs voice, needs .env)
    python engine/make.py script <name>             # create projects/<name>/ with a script.md to fill in
    python engine/make.py sample <name> [speed]     # first two paragraphs only, to choose voice/speed
    python engine/make.py tts <name> [speed] [pause] # script check, voice per paragraph joined by [pause] s (0.25),
                                                    # captions, then the voice check (Scribe vs script)
    python engine/make.py voicecheck <name>         # re-run the voice check alone
Both routes
    python engine/make.py breaths <name>            # list audible breaths/sighs to mute (audio/edl.json "mute")
    python engine/make.py captions <name>           # time script.md against the final voice (forced alignment)
    python engine/make.py retime <name> [tempo] [max-pause]  # pace (docs/PACE.md): pauses -> 0.3 s, tempo 1.08
                                                    # (script route default; voice notes: tempo 1.0), then captions
    python engine/sfx_gen.py <category> <name> "<prompt>"   # generate a missing sound effect into library/sfx
    python engine/make.py review <name> 2,10,30     # stills -> one contact sheet out/review.jpg
    python engine/make.py render <name> [version] [--local]  # full MP4 in projects/<name>/out/; on the render host
                                                    # (KANZ_RENDER_HOST in .env) when one is set, --local renders here
    python engine/make.py check <name> [version]    # 12 frames pulled from the MP4 -> out/check-<version>.jpg + loudness
    python engine/make.py ship <name> [version] [--local]  # the gate: lint --strict, render, frame check, loudness;
                                                    # stops at the first failure
    python engine/make.py remix <name> <from> <to> [--local]  # sound only: copy <from>'s picture bit for bit, redo the
                                                    # mix with the current engine (scene and voice unchanged), check
Setup
    python engine/make.py doctor [name]             # check tools, fonts, keys, render host, Codex, references

<name> is a folder in projects/ (your videos, never committed) or examples/ (the curated worked examples).

Between steps: write audio/edl.json (voice route), correct script.md (caption text + *keywords*),
write scene.js (the visuals). See README.md and docs/EFFICIENCY.md.
"""
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PY = sys.executable
WHISPER = ["uv", "run", "--with", "faster-whisper", "python"]
sys.path.insert(0, str(ROOT / "engine"))
import eleven  # noqa: E402

# ElevenLabs Scribe when a key is set (cloud, tags coughs/sighs); local faster-whisper otherwise
TRANSCRIBE = [PY, "engine/transcribe.py"] if eleven.has_key() else WHISPER + ["engine/transcribe.py", "--engine", "whisper"]
SCRIPT_STUB = """# Title (Arabic title)

Source: who wrote it, date. Voice: ElevenLabs (`engine/make.py tts`). The text between the markers is
spoken exactly as written and is also the caption source; `*word*` marks the caption keyword (stripped
before TTS). Blank lines are paragraph pauses.

<!-- captions:start -->
<!-- captions:end -->
"""
VOICE_STUB = """# Title (Arabic title)

Source: voice note, date. The text between the markers is the caption source, prefilled from the raw
transcript: correct recognition slips (never change what was said), mark one `*keyword*` per line,
and list uncertain words here for Ahmed.

<!-- captions:start -->
{body}
<!-- captions:end -->
"""


def voice_script_stub(proj):
    """Voice-note route: script.md with the caption markers, prefilled from transcript.json. Never overwrites."""
    md = proj / "script.md"
    if md.exists():
        return False
    segs = json.loads((proj / "transcript.json").read_text(encoding="utf-8"))["segments"]
    md.write_text(VOICE_STUB.format(body="\n".join(s["text"] for s in segs if s["text"].strip())), encoding="utf-8")
    return True


def run(cmd):
    print("+", " ".join(str(c) for c in cmd), flush=True)
    subprocess.run(cmd, check=True, cwd=ROOT)


def scaffold(proj):
    proj.mkdir(parents=True, exist_ok=False)
    (proj / "audio").mkdir()
    for f in ["index.html", "scene.js"]:
        shutil.copy2(ROOT / "projects" / "_template" / f, proj / f)


def captions(proj):
    # forced alignment first (cached by hash, so unchanged script + voice costs no API call)
    if eleven.has_key() and (proj / "script.md").exists() and (proj / "audio" / "voice.wav").exists():
        run([PY, "engine/align.py", proj])
    run([PY, "engine/captions.py", proj])


def sheet(src, out):
    sys.path.insert(0, str(ROOT / "engine"))
    from contact import sheet as make_sheet
    return make_sheet(src, out)


def warn_stale_lint(proj):
    """Review reminder only; never blocks a render."""
    report, scene = proj / 'out' / 'lint.json', proj / 'scene.js'
    reason = 'missing' if not report.exists() else (
        'older than scene.js' if scene.exists() and report.stat().st_mtime_ns < scene.stat().st_mtime_ns else None)
    if reason:
        print(f'\nWARNING: VISUAL REVIEW IS STALE — out/lint.json is {reason}.\n'
              f'Run python engine/lint.py {proj.relative_to(ROOT).as_posix() if proj.is_relative_to(ROOT) else proj} and review its findings. Rendering continues.\n',
              file=sys.stderr)


def project_dir(name):
    """projects/<name> (local videos) unless only examples/<name> exists."""
    proj, example = ROOT / "projects" / name, ROOT / "examples" / name
    return example if not proj.exists() and example.exists() else proj


def render_host():
    return os.environ.get("KANZ_RENDER_HOST") or eleven.env().get("KANZ_RENDER_HOST") or None


def render(proj, name, local=False):
    """Render the MP4 (workflow review M7): on the render host when KANZ_RENDER_HOST is set, here with --local or without one."""
    host, bash = render_host(), shutil.which("bash")
    if host and not local and bash:
        print(f"render: on {host} (engine/vps_render.sh); --local renders on this machine", flush=True)
        run([bash, "engine/vps_render.sh", proj.name, name])
        return
    if host and not local:
        print("render: KANZ_RENDER_HOST is set but bash was not found; rendering locally", file=sys.stderr)
    run([PY, "engine/render.py", proj, "--name", name])


def find_mp4(out, name, version):
    mp4 = out / f"{name}-{version}.mp4"
    if not mp4.exists():  # renders named by hand, e.g. kanz-pilot-01-v2.mp4 or just v5.mp4
        found = sorted([*out.glob(f"*-{version}.mp4"), *out.glob(f"{version}.mp4")], key=lambda f: f.stat().st_mtime)
        if not found:
            sys.exit(f"no MP4 for {version} in {out}")
        mp4 = found[-1]
    return mp4


def frame_stats(mp4, t):
    """Mean and spread of one frame (54x96 greyscale): a blank or black frame has almost no spread."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", str(mp4), "-frames:v", "1", "-vf", "scale=54:96",
                          "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True, check=True).stdout
    if not raw:
        return None
    vals = list(raw)
    mean = sum(vals) / len(vals)
    return mean, (sum((v - mean) ** 2 for v in vals) / len(vals)) ** 0.5


LUFS_TOLERANCE = 1.0


def check(proj, name, version):
    """12 frames from the MP4 -> out/check-<version>.jpg, plus loudness. Returns (problems, lufs)."""
    out = proj / "out"
    mp4 = find_mp4(out, name, version)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp4)],
                               capture_output=True, text=True, encoding="utf-8", check=True).stdout)
    cd = out / f"check-{version}"
    cd.mkdir(exist_ok=True)
    for f in cd.glob("*.*"):
        f.unlink()
    problems = []
    for i in range(12):
        t = round(dur * (i + 0.5) / 12, 1)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", str(mp4), "-frames:v", "1",
                        str(cd / f"f{i:02d}-{t:05.1f}s.jpg")], check=True)
        stats = frame_stats(mp4, t)
        if stats is None:
            problems.append(f"no frame at {t}s")
        elif stats[1] < 2.0:
            problems.append(f"blank frame at {t}s (mean {stats[0]:.0f}, spread {stats[1]:.1f})")
    log = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(mp4), "-af", "ebur128", "-f", "null", "-"],
                         capture_output=True, text=True, encoding="utf-8").stderr
    found = re.findall(r"I:\s+(-?[\d.]+) LUFS", log)
    lufs = float(found[-1]) if found else None
    if lufs is None:
        problems.append("loudness not measured")
    elif abs(lufs + 16.0) > LUFS_TOLERANCE:
        problems.append(f"loudness {lufs} LUFS, outside -16 +/- {LUFS_TOLERANCE}")
    print(f"{mp4.name}: {dur:.1f}s, integrated loudness {lufs if lufs is not None else '?'} LUFS (target -16)")
    print("check sheet ->", sheet(cd, out / f"check-{version}.jpg"))
    return problems, lufs


def project_warnings(proj):
    """Warnings, never failures: a new scene's structure, and objects that still need Ahmed's approval."""
    import objects
    warns = []
    scene = proj / "scene.js"
    if scene.exists():
        src = scene.read_text(encoding="utf-8", errors="replace")
        if "K.look(" in src and "K.pace(" not in src:
            warns.append("scene.js calls K.look() without K.pace(): new videos use pace (docs/RULES.md PACE-1)")
        if "K.pace(" in src and "K.finish()" not in src:
            warns.append("scene.js calls K.pace() without K.finish() as its last line (docs/RULES.md PACE-1)")
    warns += [f"object {line}" for line in objects.findings(proj)]
    return warns


def ship(proj, name, version, local=False):
    """The gate before delivery (workflow review M5): every step must pass; stops at the first failure."""
    def stop(step, why):
        print(f"\nSHIP STOPPED at {step}: {why}", file=sys.stderr)
        sys.exit(1)
    for w in project_warnings(proj):
        print("WARNING:", w, file=sys.stderr)
    print("ship 1/4: lint --strict", flush=True)
    code = subprocess.run([PY, "engine/lint.py", proj, "--strict"], cwd=ROOT).returncode
    if code:
        stop("lint", f"engine/lint.py --strict exited {code}: fix each finding or justify it in lint-ok.json")
    print("ship 2/4: render", flush=True)
    try:
        captions(proj)
        render(proj, f"{name}-{version}", local)
    except subprocess.CalledProcessError as e:
        stop("render", f"{' '.join(str(c) for c in e.cmd[:3])} exited {e.returncode}")
    print("ship 3/4 + 4/4: frames from the MP4, loudness", flush=True)
    problems, _ = check(proj, name, version)
    if problems:
        stop("check", "; ".join(problems))
    print(f"\nSHIP PASSED: {name}-{version}. Look at out/check-{version}.jpg before delivery; rendered is not approved.")


def remix(proj, name, src_version, version, local=False):
    """Redo only the sound of an approved render (Ahmed 2026-10-18: "mix and master all videos properly ... even the
    ones you're uploading now fix it then re-upload"): the picture is copied, so it stays exactly what he approved."""
    src = find_mp4(proj / "out", name, src_version)
    newest = max([proj / "scene.js", proj / "audio" / "voice.wav"], key=lambda f: f.stat().st_mtime)
    if newest.stat().st_mtime > src.stat().st_mtime:
        sys.exit(f"{newest.name} changed after {src.name} was rendered: its cues may not match the picture. Ship a new version instead.")
    out_name = f"{name}-{version}"
    host, bash = render_host(), shutil.which("bash")
    if host and not local and bash:
        run([bash, "engine/vps_render.sh", proj.name, out_name, "--remix", src.name])
    else:
        run([PY, "engine/render.py", proj, "--name", out_name, "--remix", src.name])
    problems, _ = check(proj, name, version)
    if problems:
        sys.exit("REMIX CHECK FAILED: " + "; ".join(problems))
    print(f"\nREMIX PASSED: {out_name} (picture of {src.name}, new mix). Rendered is not approved.")


def main():
    if len(sys.argv) >= 2 and sys.argv[1] == "doctor":
        import doctor
        sys.exit(doctor.main(project_dir(sys.argv[2]) if len(sys.argv) > 2 else None))
    if len(sys.argv) < 3:
        print(__doc__)
        return
    local = "--local" in sys.argv
    argv = [a for a in sys.argv if a != "--local"]
    step, name = argv[1], argv[2]
    arg = argv[3] if len(argv) > 3 else None
    proj = project_dir(name)
    out = proj / "out"
    if step in ("captions", "retime", "stills", "review", "render", "ship") and not (proj / "transcript.json").exists():
        sys.exit(f"{name} has no voice yet: run `make.py tts {name}` (script route) or `make.py audio {name}` first.")
    if step == "new":
        src = Path(arg)
        scaffold(proj)
        shutil.copy2(src, proj / "audio" / ("source" + src.suffix))
        run(TRANSCRIBE + [proj / "audio" / ("source" + src.suffix), proj / "transcript.raw.json"])
        print(f"\nNext: write {proj / 'audio' / 'edl.json'} (keep ranges, speed) from transcript.raw.json"
              ' (its "events" list coughs, sighs and laughs to cut)')
    elif step == "clean":
        src = next((proj / "audio").glob("source.*"))
        clean = proj / "audio" / "source-clean.mp3"
        clean.write_bytes(eleven.upload("/audio-isolation", {}, {"audio": src}, raw=True))
        run(TRANSCRIBE + [clean, proj / "transcript.raw.json"])
        print(f"\nIsolated voice -> {clean}. Compare it with {src.name}; if it sounds better, set"
              f' "source": "{clean.name}" in audio/edl.json (timings are unchanged).')
    elif step == "audio":
        run([PY, "engine/edit_audio.py", proj])
        run(TRANSCRIBE + [proj / "audio" / "voice.wav", proj / "transcript.json"])
        wrote = voice_script_stub(proj)
        print(f"\nNext: correct {proj / 'script.md'}" + (" (prefilled from transcript.json between the caption markers)"
              if wrote else " (kept as it was)") + ": fix recognition slips, mark *keywords*")
    elif step == "script":
        scaffold(proj)
        (proj / "script.md").write_text(SCRIPT_STUB, encoding="utf-8")
        print(f"Next: paste the copy into {proj / 'script.md'} between the markers, mark *keywords*, then sample/tts")
    elif step == "sample":
        run([PY, "engine/tts.py", proj, "--sample", "--speed", arg or "1.0"])
    elif step == "tts":
        run([PY, "engine/voicecheck.py", proj, "--pre"])
        pause = argv[4] if len(argv) > 4 else "0.25"
        run([PY, "engine/tts.py", proj, "--speed", arg or "1.0", "--pause", pause])
        captions(proj)
        run([PY, "engine/voicecheck.py", proj])
    elif step == "voicecheck":
        run([PY, "engine/voicecheck.py", proj])
    elif step == "breaths":
        run([PY, "engine/breaths.py", proj])
    elif step == "captions":
        captions(proj)
    elif step == "retime":
        mp = argv[4] if len(argv) > 4 else "0.3"
        run([PY, "engine/retime.py", proj, "--tempo", arg or "1.08", "--max-pause", mp])
        captions(proj)
    elif step in ("stills", "review"):
        captions(proj)
        run([PY, "engine/render.py", proj, "--stills", arg, "--name", "review"])
        print("review sheet ->", sheet(out / "stills-review", out / "review.jpg"))
    elif step == "render":
        warn_stale_lint(proj)
        for w in project_warnings(proj):
            print("WARNING:", w, file=sys.stderr)
        captions(proj)
        render(proj, f"{name}-{arg or 'v1'}", local)
    elif step == "check":
        for w in project_warnings(proj):
            print("WARNING:", w, file=sys.stderr)
        problems, _ = check(proj, name, arg or "v1")
        for prob in problems:
            print("CHECK:", prob, file=sys.stderr)
    elif step == "ship":
        ship(proj, name, arg or "v1", local)
    elif step == "remix":
        if len(argv) < 5:
            sys.exit("usage: make.py remix <name> <from-version> <to-version>")
        remix(proj, name, arg, argv[4], local)
    else:
        print(__doc__)


if __name__ == "__main__":
    from console import utf8
    utf8()
    main()
