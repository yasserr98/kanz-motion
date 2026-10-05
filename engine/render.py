"""Render a project to MP4 (or a few stills for review).

    python engine/render.py <project_dir>                 # full video -> <project>/out/<name>.mp4
    python engine/render.py <project_dir> --stills 2,8,30  # PNG stills  -> <project>/out/stills/
    python engine/render.py <project_dir> --from 20 --to 30  # partial render for quick checks

Loads <project>/index.html in headless Chromium (Playwright), calls K.seek(t) for every frame
at K.fps (12 unique frames per second, written as 24 fps), pipes JPEG frames to ffmpeg, mixes the
voice with the SFX cues the scene registered (library/sfx/manifest.json), and muxes the result.
"""
import argparse
import json
import random
import subprocess
from pathlib import Path

import numpy as np
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SR = 48000


def decode(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "2", "-ar", str(SR), "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.int16).astype(np.float32).reshape(-1, 2) / 32768


def mix_audio(proj, cues, duration, out, t0=0.0):
    voice = decode(proj / "audio" / "voice.wav")
    n = int((duration - t0) * SR) + SR
    bus = np.zeros((n, 2), np.float32)
    v = voice[int(t0 * SR):][:n]
    bus[: len(v)] += v
    lib = json.loads((ROOT / "library" / "sfx" / "manifest.json").read_text(encoding="utf-8"))
    by_cat = {}
    for m in lib:
        by_cat.setdefault(m["category"], []).append(m["file"])
    cache = {}
    rng = random.Random(7)
    used = set()
    for c in sorted(cues, key=lambda c: c["t"]):
        files = by_cat.get(c["cat"])
        if not files or c["t"] < t0:
            continue
        f = files[(c["pick"] * 7 + rng.randrange(3)) % len(files)]
        used.add(f)
        if f not in cache:
            cache[f] = decode(ROOT / "library" / "sfx" / f)
        s = cache[f] * float(c["gain"]) * 0.55  # SFX sit well under the voice
        i = int((c["t"] - t0) * SR)
        j = min(n, i + len(s))
        if i < n:
            bus[i:j] += s[: j - i]
    peak = np.abs(bus).max()
    if peak > 0.98:
        bus *= 0.98 / peak
    pcm = (bus * 32767).astype(np.int16).tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", str(out)],
                   input=pcm, check=True)
    return sorted(used)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--stills")
    ap.add_argument("--from", dest="t0", type=float, default=0.0)
    ap.add_argument("--to", dest="t1", type=float)
    ap.add_argument("--name", default=None)
    a = ap.parse_args()
    proj = Path(a.project).resolve()
    out_dir = proj / "out"
    out_dir.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--allow-file-access-from-files"])
        page = browser.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto((proj / "index.html").as_uri())
        page.wait_for_function("document.fonts && document.fonts.status === 'loaded' && window.K")
        page.wait_for_function("Array.from(document.images).every(i => i.complete && i.naturalWidth > 0)")
        fonts = page.evaluate("Array.from(document.fonts).filter(f => f.status === 'loaded').map(f => f.family)")
        if errors:
            print("PAGE ERRORS:", *errors, sep="\n  ")
        duration = page.evaluate("K.duration")
        fps = page.evaluate("K.fps")
        stage = page.locator("#stage")
        if a.stills:
            sd = out_dir / ("stills-" + (a.name or "review"))
            sd.mkdir(exist_ok=True)
            for t in [float(x) for x in a.stills.split(",")]:
                page.evaluate(f"K.seek({t})")
                stage.screenshot(path=str(sd / f"t{t:06.2f}.png"))
            print("fonts:", sorted(set(fonts)), "| stills ->", sd)
            browser.close()
            return
        t1 = a.t1 if a.t1 is not None else duration
        name = a.name or proj.name
        silent = out_dir / f"_{name}-video.mp4"
        ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(fps), "-i", "-",
                               "-r", "24", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "9M", "-bufsize", "18M",
                               "-pix_fmt", "yuv420p",
                               str(silent)], stdin=subprocess.PIPE)
        frames = int((t1 - a.t0) * fps)
        for i in range(frames):
            page.evaluate(f"K.seek({a.t0 + i / fps})")
            ff.stdin.write(stage.screenshot(type="jpeg", quality=93))
            if i % (fps * 10) == 0:
                print(f"  frame {i}/{frames}", flush=True)
        ff.stdin.close()
        ff.wait()
        cues = page.evaluate("K.cues")
        browser.close()
    audio = out_dir / f"_{name}-audio.wav"
    used = mix_audio(proj, cues, t1, audio, a.t0)
    final = out_dir / f"{name}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(silent), "-i", str(audio), "-c:v", "copy", "-c:a", "aac",
                    "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(final)], check=True)
    silent.unlink()
    audio.unlink()
    (out_dir / f"{name}.sfx-used.json").write_text(json.dumps({"cues": len(cues), "files": used}, indent=1), encoding="utf-8")
    print(f"done -> {final}  ({t1 - a.t0:.1f}s, {len(cues)} sfx cues, fonts: {sorted(set(fonts))})")


if __name__ == "__main__":
    main()
