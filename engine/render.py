"""Render a project to MP4 (or a few stills for review).

    python engine/render.py <project_dir>                 # full video -> <project>/out/<name>.mp4
    python engine/render.py <project_dir> --stills 2,8,30  # PNG stills  -> <project>/out/stills/
    python engine/render.py <project_dir> --from 20 --to 30  # partial render for quick checks

Loads <project>/index.html in headless Chromium (Playwright), calls K.seek(t) for every frame
at K.fps (12 unique frames per second, written as 24 fps), pipes JPEG frames to ffmpeg, mixes the
voice with the SFX cues the scene registered (library/sfx/manifest.json), and muxes the result.
"""
import argparse
import hashlib
import inspect
import json
import random
import shutil
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


def env_db(x, win):
    """Running RMS level in dBFS over `win` samples (mono)."""
    sq = np.convolve(x * x, np.ones(win, np.float32) / win, "same")
    return 10 * np.log10(sq + 1e-10)


def smooth_gain(g_db, attack, release):
    """One-pole smoothing of a gain curve in dB: fast when it drops, slow when it recovers."""
    out = np.empty_like(g_db)
    a, r, cur = np.exp(-1 / attack), np.exp(-1 / release), 0.0
    for i, g in enumerate(g_db):
        k = a if g < cur else r
        cur = k * cur + (1 - k) * g
        out[i] = cur
    return out


SFX_TARGET = -18.0  # loudest-50 ms RMS every SFX file is levelled to before its scene gain (mix 2)

# Mix and master (Ahmed 2026-10-18: "mix and master all videos properly because the sound effects sometimes overlap").
# One effect sounds at a time: cues closer than SFX_MIN_GAP keep only the stronger one, an effect still ringing when
# the next one starts is faded out over SFX_CHOKE, and no effect runs longer than SFX_MAX_LEN.
SFX_MIN_GAP = 0.30   # s between kept SFX onsets
SFX_CHOKE = 0.06     # s fade on the previous effect when the next starts
SFX_MAX_LEN = 1.4    # s; a longer file fades out over SFX_TAIL ending here
SFX_TAIL = 0.20      # s
SFX_DUCK = -7.0      # dB on the SFX bus while he speaks
SFX_UNDER_VOICE = 6.0  # dB the SFX bus stays under his median speech level
VOICE_CHAIN = "highpass=f=70,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=160:makeup=2dB"
MASTER = (-16.0, -1.5, 11.0)  # integrated LUFS (SND-4), true peak dBTP, loudness range


def schedule_sfx(resolved):
    """Thin the cue list so effects never stack: of two cues closer than SFX_MIN_GAP keep the louder (the earlier on a tie)."""
    kept = []
    for c, f in sorted(resolved, key=lambda cf: cf[0]["t"]):
        if kept and c["t"] - kept[-1][0]["t"] < SFX_MIN_GAP:
            if float(c["gain"]) > float(kept[-1][0]["gain"]):
                kept[-1] = (c, f)
            continue
        kept.append((c, f))
    return kept


def master(raw, out):
    """Two-pass EBU R128 loudness normalisation to MASTER with a true-peak ceiling, 48 kHz 16-bit."""
    i, tp, lra = MASTER
    first = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(raw), "-af", f"loudnorm=I={i}:TP={tp}:LRA={lra}:print_format=json",
                            "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8").stderr
    m = json.loads(first[first.rindex("{"): first.rindex("}") + 1])
    af = (f"loudnorm=I={i}:TP={tp}:LRA={lra}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,"
          f"aresample={SR}")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", af, "-ar", str(SR), "-c:a", "pcm_s16le", str(out)], check=True)


BED_UNDER_VOICE = 21.0  # room tone sits this many dB under the voice's median speech level
BED_TRIM = 0.6  # Ahmed 2026-10-18: "make it less by 40%": room tone amplitude x0.6 (-4.4 dB), after K.bedUnder


def room_tone(n, seed=7):
    """A quiet, non-musical room tone (Kanz pace, 2026-10-13): brown noise with the rumble and hiss filtered off,
    plus a fainter pink layer for air. Generated, so it is fully owned and identical on every render."""
    d = n / SR + 0.1
    graph = (f"anoisesrc=color=brown:seed={seed}:amplitude=0.6:sample_rate={SR}:duration={d:.3f},highpass=f=80,lowpass=f=700[b];"
             f"anoisesrc=color=pink:seed={seed + 1}:amplitude=0.08:sample_rate={SR}:duration={d:.3f},highpass=f=300,lowpass=f=3500[p];"
             "[b][p]amix=inputs=2:normalize=0,aformat=channel_layouts=stereo")
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-filter_complex", graph, "-f", "s16le", "-ac", "2", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(pcm, dtype=np.int16).astype(np.float32).reshape(-1, 2) / 32768
    a = a[:n] if len(a) >= n else np.pad(a, ((0, n - len(a)), (0, 0)))
    fade = np.ones(n, np.float32)
    k = min(n // 4, int(0.4 * SR))
    fade[:k] = np.linspace(0, 1, k)
    fade[n - k:] = np.linspace(1, 0, k)
    return a * fade[:, None]


def resolve_cues(cues, t0=0.0):
    lib = json.loads((ROOT / "library" / "sfx" / "manifest.json").read_text(encoding="utf-8"))
    by_cat = {}
    for m in lib:
        by_cat.setdefault(m["category"], []).append(m["file"])
    rng, resolved = random.Random(7), []
    for c in sorted(cues, key=lambda c: c["t"]):
        files = by_cat.get(c["cat"])
        if not files or c["t"] < t0:
            continue
        f = files[(c["pick"] * 7 + rng.randrange(3)) % len(files)]
        if not (ROOT / "library" / "sfx" / f).is_file():
            raise FileNotFoundError(f"missing SFX: {f}")
        resolved.append((c, f))
    return resolved


def check_video(path, frames, fps):
    result = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_frames",
                             "-show_entries", "stream=nb_read_frames,duration", "-of", "json", str(path)],
                            capture_output=True, text=True, encoding="utf-8", check=True)
    streams = json.loads(result.stdout).get("streams", [])
    if not streams:
        raise RuntimeError("encoder produced no video stream")
    stream = streams[0]
    expected = frames / fps
    try:
        count, duration = int(stream["nb_read_frames"]), float(stream["duration"])
    except (KeyError, ValueError, TypeError) as e:
        raise RuntimeError("cannot verify encoded frame count/duration") from e
    if abs(count - expected * 24) > 2 or abs(duration - expected) > max(2 / 24, 0.01):
        raise RuntimeError(f"incomplete encoded video: {count} frames, {duration:.3f}s; expected ~{expected * 24:.0f}, {expected:.3f}s")


def close_encoder(ff):
    try:
        if not ff.stdin.closed:
            ff.stdin.close()
    finally:
        if ff.poll() is None:
            ff.terminate()
            try:
                ff.wait(timeout=5)
            except subprocess.TimeoutExpired:
                ff.kill()
                ff.wait()


def mix_audio_v2(proj, cues, duration, out, t0=0.0, bed=None, resolved=None):
    """Mix 2 (Ahmed 2026-10-11: "sometimes the sound effects are too loud"; mastered 2026-10-18: "the sound effects
    sometimes overlap"). The voice gets a high-pass and gentle compression (VOICE_CHAIN). Library files differ by up
    to 20 dB inside one category, so every file is levelled first; schedule_sfx keeps one effect at a time, each
    choked by the next and capped at SFX_MAX_LEN; the SFX bus ducks under speech and stays under the voice; then the
    whole mix is loudness-normalised in two passes to -16 LUFS with a -1.5 dBTP true-peak ceiling (master)."""
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(proj / "audio" / "voice.wav"), "-af", VOICE_CHAIN,
                          "-ac", "2", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    voice = np.frombuffer(pcm, dtype=np.int16).astype(np.float32).reshape(-1, 2) / 32768
    n = int((duration - t0) * SR) + SR
    vbus = np.zeros((n, 2), np.float32)
    v = voice[int(t0 * SR):][:n]
    vbus[: len(v)] += v
    sbus = np.zeros((n, 2), np.float32)
    cache, used = {}, set()
    w50 = int(0.05 * SR)
    plan = schedule_sfx(resolve_cues(cues, t0) if resolved is None else resolved)
    starts = [int((c["t"] - t0) * SR) for c, _ in plan]
    for k, (c, f) in enumerate(plan):
        used.add(f)
        if f not in cache:
            a = decode(ROOT / "library" / "sfx" / f)
            loud = env_db(a.mean(axis=1), w50).max() if len(a) else SFX_TARGET
            cache[f] = a * np.float32(10 ** (min(SFX_TARGET - loud, 6.0) / 20))  # level it; boost at most +6 dB
        s = (cache[f] * float(c["gain"]) * 0.55)[: int(SFX_MAX_LEN * SR)].copy()
        fade = int(SFX_TAIL * SR)
        if len(s) == int(SFX_MAX_LEN * SR) and len(s) > fade:  # cut by the cap: fade into it
            s[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)[:, None]
        i = starts[k]
        if k + 1 < len(starts):  # choke: fade out as the next effect starts
            stop = starts[k + 1] - i + int(SFX_CHOKE * SR)
            if stop < len(s):
                s = s[:max(stop, 1)]
                ch = min(int(SFX_CHOKE * SR), len(s))
                s[-ch:] *= np.linspace(1, 0, ch, dtype=np.float32)[:, None]
        j = min(n, i + len(s))
        if 0 <= i < n:
            sbus[i:j] += s[: j - i]
    # duck under speech and keep the SFX bus SFX_UNDER_VOICE dB under the voice's typical speech level
    hop = int(0.01 * SR)
    vdb = env_db(vbus.mean(axis=1), int(0.03 * SR))[::hop]
    speech = vdb > -42
    vref = np.median(vdb[speech]) if speech.any() else -20.0
    sdb = env_db(sbus.mean(axis=1), w50)[::hop]
    g = np.where(speech, SFX_DUCK, 0.0)
    g = np.minimum(g, (vref - SFX_UNDER_VOICE) - sdb)  # ceiling: never near the voice
    g = smooth_gain(np.minimum(g, 0.0), attack=2, release=25)  # 10 ms steps: 20 ms attack, 250 ms release
    gain = np.repeat(10 ** (g / 20), hop)[:n].astype(np.float32)
    if len(gain) < n:
        gain = np.pad(gain, (0, n - len(gain)), constant_values=gain[-1] if len(gain) else 1.0)
    bus = vbus + sbus * gain[:, None]
    if bed == "room":  # never digital silence between phrases (pacing study 2026-10-13)
        rt = room_tone(n)
        rdb = 10 * np.log10(np.mean(rt.mean(axis=1) ** 2) + 1e-12)
        bus += rt * np.float32(BED_TRIM * 10 ** (((vref - BED_UNDER_VOICE) - rdb) / 20))
    raw = out.with_name(out.stem + "-raw.wav")
    pcm = bus.astype("<f4").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_f32le", str(raw)],
                   input=pcm, check=True)
    master(raw, out)
    raw.unlink()
    return sorted(used)


def mix_audio(proj, cues, duration, out, t0=0.0, mix=1, bed=None, resolved=None):
    if mix == 2:
        return mix_audio_v2(proj, cues, duration, out, t0, bed, resolved)
    voice = decode(proj / "audio" / "voice.wav")
    n = int((duration - t0) * SR) + SR
    bus = np.zeros((n, 2), np.float32)
    v = voice[int(t0 * SR):][:n]
    bus[: len(v)] += v
    cache, used = {}, set()
    for c, f in resolve_cues(cues, t0) if resolved is None else resolved:
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


MIX_CACHE_KEEP = 3  # newest cached mixes kept per project


def mix_key(proj, cues, duration, t0, mix, bed, resolved):
    """Content hash of everything the mix depends on: the voice, the resolved cues and their files, the timing, the
    mix settings and the mixing code itself (workflow review M8, 2026-10-17)."""
    h = hashlib.sha256()
    h.update((proj / "audio" / "voice.wav").read_bytes())
    files = sorted({f for _, f in resolved})
    for f in files:
        h.update(f.encode() + (ROOT / "library" / "sfx" / f).read_bytes())
    h.update(json.dumps([[c, f] for c, f in resolved], sort_keys=True).encode())
    h.update(json.dumps([round(duration, 4), round(t0, 4), mix, bed, BED_UNDER_VOICE, BED_TRIM, SFX_TARGET, SR, SFX_MIN_GAP, SFX_CHOKE,
                         SFX_MAX_LEN, SFX_TAIL, SFX_DUCK, SFX_UNDER_VOICE, VOICE_CHAIN, MASTER]).encode())
    for fn in (mix_audio, mix_audio_v2, room_tone, decode, env_db, smooth_gain, schedule_sfx, master):
        h.update(inspect.getsource(fn).encode())
    return h.hexdigest()[:24]


def cached_mix(proj, cues, duration, out, t0=0.0, mix=1, bed=None, resolved=None):
    """mix_audio, reusing out/_mix-cache/<hash>.wav when nothing the mix depends on has changed."""
    resolved = resolve_cues(cues, t0) if resolved is None else resolved
    cache = proj / "out" / "_mix-cache"
    key = mix_key(proj, cues, duration, t0, mix, bed, resolved)
    wav, meta = cache / f"{key}.wav", cache / f"{key}.json"
    if wav.is_file() and meta.is_file():
        shutil.copyfile(wav, out)
        print(f"  audio mix: cached ({key})")
        return json.loads(meta.read_text(encoding="utf-8"))
    used = mix_audio(proj, cues, duration, out, t0, mix, bed, resolved)
    cache.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(out, wav)
    meta.write_text(json.dumps(used), encoding="utf-8")
    for old in sorted(cache.glob("*.wav"), key=lambda f: f.stat().st_mtime)[:-MIX_CACHE_KEEP]:
        old.unlink()
        old.with_suffix(".json").unlink(missing_ok=True)
    return used


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--stills")
    ap.add_argument("--from", dest="t0", type=float, default=0.0)
    ap.add_argument("--to", dest="t1", type=float)
    ap.add_argument("--name", default=None)
    ap.add_argument("--cam24", action="store_true", help="smooth camera even if the scene does not set K.camSmooth")
    ap.add_argument("--remix", help="an existing MP4 in <project>/out: keep its picture, redo only the sound with the current "
                                    "mix (the scene must be unchanged since that render)")
    a = ap.parse_args()
    proj = Path(a.project).resolve()
    out_dir = proj / "out"
    out_dir.mkdir(exist_ok=True)
    import slot
    slot.hold("render")  # one local Chromium at a time (AGENTS.md, usage discipline)
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--allow-file-access-from-files"])
        errors, page_errors = [], []

        def check_page():
            if page_errors:
                raise RuntimeError("PAGE ERRORS:\n  " + "\n  ".join(page_errors))

        def open_page():
            pg = browser.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
            pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            pg.on("pageerror", lambda e: page_errors.append(str(e)))
            pg.goto((proj / "index.html").as_uri())
            check_page()
            pg.wait_for_function("document.fonts && document.fonts.status === 'loaded' && window.K")
            check_page()
            pg.wait_for_function("Array.from(document.images).every(i => i.complete && i.naturalWidth > 0)")
            if a.cam24:
                pg.evaluate("K.camSmooth = true")
            check_page()
            return pg

        page = open_page()
        fonts = page.evaluate("Array.from(document.fonts).filter(f => f.status === 'loaded').map(f => f.family)")
        if errors:
            print("CONSOLE ERRORS:", *errors, sep="\n  ")
        check_page()
        duration = page.evaluate("K.duration")
        fps = page.evaluate("K.fps")
        # smooth camera (Ahmed 2026-10-11, new videos): scenes set K.camSmooth = true; capture every 24 fps frame
        # so the camera glides while graphics stay on twos. Older scenes leave it off and render as before.
        if a.cam24:
            page.evaluate("K.camSmooth = true")
        if page.evaluate("!!K.camSmooth"):
            fps = 24
        # The stage fills the 1080x1920 viewport: capture that region directly. A locator screenshot
        # waits for the element to be "stable", which intermittently times out on long renders.
        clip = {"x": 0, "y": 0, "width": 1080, "height": 1920}
        if a.stills:
            sd = out_dir / ("stills-" + (a.name or "review"))
            sd.mkdir(exist_ok=True)
            for old in sd.glob("t*.png"):
                old.unlink()
            for t in [float(x) for x in a.stills.split(",")]:
                for attempt in range(4):  # same intermittent capture failure as the video loop below
                    try:
                        check_page()
                        page.evaluate(f"K.seek({t})")
                        check_page()
                        page.screenshot(path=str(sd / f"t{t:06.2f}.png"), clip=clip)
                        check_page()
                        break
                    except Exception as e:  # noqa: BLE001
                        check_page()
                        if attempt == 3:
                            raise
                        print(f"  still {t}: {str(e).splitlines()[0]} -> reopening the page", flush=True)
                        page.close()
                        page = open_page()
            print("fonts:", sorted(set(fonts)), "| stills ->", sd)
            browser.close()
            return
        t1 = a.t1 if a.t1 is not None else duration
        name = a.name or proj.name
        silent = out_dir / f"_{name}-video.mp4"
        voice = proj / "audio" / "voice.wav"
        if not voice.is_file():
            raise FileNotFoundError(f"missing voice: {voice}")
        cues = page.evaluate("K.cues")
        resolved = resolve_cues(cues, a.t0)
        mix = page.evaluate("K.mix || 1")
        bed = page.evaluate("K.bed || null")
        under = page.evaluate("K.bedUnder || null")
        if under:
            globals()["BED_UNDER_VOICE"] = float(under)
        check_page()
        if a.remix:  # sound only (2026-10-18): the picture is copied from the approved MP4, bit for bit
            src = (out_dir / Path(a.remix).name).resolve()
            if not src.is_file():
                raise FileNotFoundError(f"--remix: no {src}")
            browser.close()
            audio = out_dir / f"_{name}-audio.wav"
            used = cached_mix(proj, cues, t1, audio, a.t0, mix, bed, resolved)
            final = out_dir / f"{name}.mp4"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-i", str(audio), "-map", "0:v:0", "-map", "1:a:0",
                            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(final)], check=True)
            audio.unlink()
            (out_dir / f"{name}.sfx-used.json").write_text(json.dumps({"cues": len(cues), "files": used, "remix_of": src.name},
                                                                      indent=1), encoding="utf-8")
            print(f"done -> {final}  (remix of {src.name}: {len(schedule_sfx(resolved))}/{len(cues)} sfx cues kept)")
            return
        frames = int((t1 - a.t0) * fps)
        if frames <= 0:
            raise ValueError("render range contains no frames")
        ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(fps), "-i", "-",
                               "-r", "24", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "9M", "-bufsize", "18M",
                               "-pix_fmt", "yuv420p",
                               str(silent)], stdin=subprocess.PIPE)
        try:
            for i in range(frames):
                # Chromium sometimes fails a screenshot after a few hundred frames when memory is low ("Unable to capture
                # screenshot", 2026-10-13 at ~7.7 s on a 1.5 GB-free machine). Reopen the page and redo that frame.
                for attempt in range(4):
                    try:
                        check_page()
                        page.evaluate(f"K.seek({a.t0 + i / fps})")
                        check_page()
                        shot = page.screenshot(type="jpeg", quality=93, clip=clip)
                        check_page()
                        break
                    except Exception as e:  # noqa: BLE001 - playwright raises its own Error type
                        check_page()
                        if attempt == 3:
                            raise
                        print(f"  frame {i}: {str(e).splitlines()[0]} -> reopening the page", flush=True)
                        try:
                            page.close()
                        except Exception:  # noqa: BLE001
                            pass
                        page = open_page()
                ff.stdin.write(shot)
                if i % (fps * 10) == 0:
                    print(f"  frame {i}/{frames}", flush=True)
            ff.stdin.close()
            code = ff.wait()
            if code:
                raise RuntimeError(f"video encoder failed (exit {code})")
            check_video(silent, frames, fps)
        finally:
            close_encoder(ff)
        browser.close()
    audio = out_dir / f"_{name}-audio.wav"
    used = cached_mix(proj, cues, t1, audio, a.t0, mix, bed, resolved)
    final = out_dir / f"{name}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(silent), "-i", str(audio), "-c:v", "copy", "-c:a", "aac",
                    "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(final)], check=True)
    silent.unlink()
    audio.unlink()
    (out_dir / f"{name}.sfx-used.json").write_text(json.dumps({"cues": len(cues), "files": used}, indent=1), encoding="utf-8")
    print(f"done -> {final}  ({t1 - a.t0:.1f}s, {len(cues)} sfx cues, fonts: {sorted(set(fonts))})")


if __name__ == "__main__":
    from console import utf8
    utf8()
    main()
