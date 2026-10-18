"""Cut a short from a long Kanz video into a project: face frames, voice and word timings.

    python engine/footage.py <project_dir> <source.mp4> <transcript.raw.json> <start> <end> [--also S E ...]
        [--video-from S] [--tv-until S] [--tail 0.4] [--exact-end]

  start, end    seconds in the source. The audio ends after the last word that ends inside start..end, plus the ending
                guard (--tail, default 0.4 s: Arabic final consonants decay past the ASR word end; Ahmed's "last word
                cut off" on casino A/E/F/H and live shorts), stopped 0.05 s before the next source word so no part of
                the next sentence leaks in. The fade (at most 0.15 s) sits inside that tail, never on the word.
                --exact-end keeps the old behaviour: the audio runs to <end> exactly, with a 0.08 s fade.
  --also S E    another source range joined after the first (repeatable, SHORT-13): each range gets its own ending
                guard, and a 0.25 s pause (--join) opens every join so the sound has room to turn; the picture cuts
                clean at the join (the pause shows the next range's own lead-in frames).
  --video-from  first source second with clean footage (e.g. after a transition); the first frame is held
                until then so the short opens on the face (Ahmed 2026-10-16: first 3 s always show his face)
  --tv-until    keep the source's own wide opening (e.g. the speaker inside a TV set) up to this source second:
                the whole 16:9 frame is shown across the width on black, then zooms into the 9:16 face over the
                last 0.35 s (Ahmed 2026-10-16: "leave the TV part and the zoom in")

Writes <project>/assets/face/000001.jpg... (centre 9:16 crop, 1080x1920, 24 fps), <project>/audio/voice.wav
(the source sound, 48 kHz stereo) and <project>/transcript.json (the source words in those ranges, on the short's
timeline, with cut_from.ranges recording each range's last word and the next source word), then the face boxes and
freezes (engine/faces.py: assets/faces.json, assets/freezes.json) and prints the frame count for K.footage({n}).
Burned-in text in the source stays in the frames.
"""
import argparse
import json
import subprocess
from pathlib import Path

import numpy as np

from provenance import stamp

TAIL = 0.4    # s of ending guard after the last word (P0, 2026-10-18)
GAP = 0.05    # s the audio stops before the next source word
JOIN = 0.25   # s of pause opened at every voice join (SHORT-13)
FADE = 0.15   # s, the longest fade-out; it always sits inside the tail
SR = 48000


def source_words(tr):
    return sorted((w for s in tr["segments"] for w in s["words"]), key=lambda w: w["start"])


def plan_segments(words, ranges, tail=TAIL, gap=GAP, join=JOIN, exact=False):
    """Where each source range really ends, and where it lands in the short.

    words: every source word ({start, end}), sorted. ranges: [(start, end), ...] in source seconds.
    Returns one dict per range: src_start, src_end (where its audio stops), last_word_end, next_word_start (None at
    the end of the source), lead (pause before it in the short: 0 for the first, `join` after), out_start (where its
    first source second lands in the short), words (the range's words) and clamped (True when the next word cut the
    tail short)."""
    segs, out = [], 0.0
    for k, (s, e) in enumerate(ranges):
        inside = [w for w in words if w["start"] >= s - 0.05 and w["end"] <= e + 0.05]
        if not inside:
            raise ValueError(f"range {s}-{e}: no transcript word ends inside it")
        last, mine = max(w["end"] for w in inside), {id(w) for w in inside}
        nxt = next((w["start"] for w in words if w["start"] >= last - 1e-6 and id(w) not in mine), None)
        if exact:
            end, clamped = e, False
        else:
            end = last + tail
            clamped = nxt is not None and nxt - gap < end
            if clamped:
                end = max(last, nxt - gap)
        lead = join if k else 0.0
        out += lead
        segs.append({"src_start": s, "src_end": round(end, 3), "last_word_end": last, "next_word_start": nxt,
                     "lead": lead, "out_start": round(out, 3), "words": inside, "clamped": clamped})
        out += end - s
    return segs


def short_duration(segs):
    return round(segs[-1]["out_start"] + segs[-1]["src_end"] - segs[-1]["src_start"], 3)


def decode(src, t0, dur):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t0:.3f}", "-i", str(src), "-t", f"{dur:.3f}", "-vn", "-ac", "2",
                          "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).reshape(-1, 2).copy()


def ramp(n, up):
    r = np.linspace(0, 1, max(n, 1), dtype=np.float32)[:, None]
    return r if up else r[::-1]


def voice_audio(src, segs, exact=False):
    """The short's voice as float32 stereo: each range's audio with a 0.02 s fade-in, a fade-out inside its tail
    (never before its last word ends; 0.08 s at the exact end with --exact-end), and digital silence for each join
    pause (render.py lays the room tone under every pause)."""
    parts = []
    for g in segs:
        if g["lead"]:
            parts.append(np.zeros((int(round(g["lead"] * SR)), 2), np.float32))
        a = decode(src, g["src_start"], g["src_end"] - g["src_start"])
        fi = min(len(a), int(0.02 * SR))
        a[:fi] *= ramp(fi, True)
        if exact:
            fade = 0.08
        else:
            fade = min(FADE, max(0.0, g["src_end"] - g["last_word_end"]) / 2)
        fo = min(len(a), int(fade * SR))
        if fo:
            a[-fo:] *= ramp(fo, False)
        parts.append(a)
    return np.concatenate(parts)


def write_wav(a, path):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s16le",
                    str(path)], input=a.astype("<f4").tobytes(), check=True)


def write_transcript(proj, tr, source, segs, video_from):
    """transcript.json on the short's timeline; cut_from.ranges keeps what the ship check needs (each range's last
    word end, its audio end and the next source word, in source seconds; out_start on the short's timeline)."""
    segments = []
    for g in segs:
        off, mine = g["out_start"] - g["src_start"], {id(w) for w in g["words"]}
        for s in tr["segments"]:
            ws = [{**w, "start": round(w["start"] + off, 3), "end": round(w["end"] + off, 3)} for w in s["words"] if id(w) in mine]
            if ws:
                segments.append({"start": ws[0]["start"], "end": ws[-1]["end"], "text": " ".join(w["w"] for w in ws), "words": ws})
    out = {k: v for k, v in tr.items() if k not in ("segments", "events", "sha256", "script_sha256")}
    out.update({**stamp(proj / "audio" / "voice.wav"),
                "cut_from": {"source": str(source), "start": segs[0]["src_start"], "end": segs[-1]["src_end"], "video_from": video_from,
                             "ranges": [{"start": g["src_start"], "end": g["src_end"], "last_word_end": g["last_word_end"],
                                         "next_word_start": g["next_word_start"], "out_start": g["out_start"], "lead": g["lead"]}
                                        for g in segs]},
                "duration": short_duration(segs), "segments": segments, "events": []})
    (proj / "transcript.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    return out


def report(segs):
    for g in segs:
        tail = g["src_end"] - g["last_word_end"]
        why = f" (stopped {GAP:.2f} s before the next word)" if g["clamped"] else ""
        print(f"range {g['src_start']:.2f}-{g['src_end']:.2f}: last word ends {g['last_word_end']:.2f}, tail {tail:.2f} s{why}"
              + (f", {g['lead']:.2f} s pause before it" if g["lead"] else ""))
        if g["clamped"] and tail < 0.15:
            print(f"  WARNING: only {tail:.2f} s after the last word before the next one starts: check the ending by ear")


def tv_open(a, v0, face, zoom_s=0.35, mask_top=0.16):
    """Frames v0..tv_until with the whole source frame across the width, easing into the centre 9:16 crop."""
    import tempfile
    from PIL import Image
    tmp = Path(tempfile.mkdtemp())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{v0:.3f}", "-t", f"{a.tv_until - v0:.3f}", "-i", a.source,
                    "-vf", f"fps={a.fps}", "-q:v", "2", str(tmp / "%06d.jpg")], check=True)
    frames = sorted(tmp.glob("*.jpg"))
    n = len(frames)
    for i, f in enumerate(frames):
        im = Image.open(f).convert("RGB")
        sw, sh = im.size
        fit, fill = 1836 / sw, 1920 / sh            # whole frame across the width (a little cropped), 9:16 crop
        t = (i / a.fps - (n / a.fps - zoom_s)) / zoom_s
        e = 0 if t <= 0 else 1 if t >= 1 else t * t * (3 - 2 * t)
        z = fit * (fill / fit) ** e
        if mask_top and e == 0:  # hide burned-in corner text (hashtag, logo) that the wide view would cut in half
            band = Image.new("RGB", (sw, round(sh * mask_top)), (8, 8, 10))
            im.paste(band, (0, 0))
        w, h = round(sw * z), round(sh * z)
        big = im.resize((w, h), Image.LANCZOS)
        out = Image.new("RGB", (1080, 1920), (8, 8, 10))
        out.paste(big, ((1080 - w) // 2, (1920 - h) // 2))
        out.save(face / f"{i + 1:06d}.jpg", quality=92)
        f.unlink()
    tmp.rmdir()
    return n


def add_range_args(ap):
    ap.add_argument("project")
    ap.add_argument("source")
    ap.add_argument("transcript")
    ap.add_argument("start", type=float)
    ap.add_argument("end", type=float)
    ap.add_argument("--also", nargs=2, type=float, action="append", default=[], metavar=("S", "E"),
                    help="another source range joined after the previous one (repeatable)")
    ap.add_argument("--video-from", type=float)
    ap.add_argument("--fps", type=int, default=24)
    ap.add_argument("--tail", type=float, default=TAIL)
    ap.add_argument("--join", type=float, default=JOIN)
    ap.add_argument("--exact-end", action="store_true")


def main():
    ap = argparse.ArgumentParser()
    add_range_args(ap)
    ap.add_argument("--tv-until", type=float)
    ap.add_argument("--no-analyse", action="store_true", help="skip the face boxes and freeze scan (engine/faces.py)")
    a = ap.parse_args()
    if a.video_from is not None and a.tv_until is not None:
        ap.error("--video-from and --tv-until cannot be combined; choose a held opening or the TV opening")
    proj = Path(a.project)
    face = proj / "assets" / "face"
    face.mkdir(parents=True, exist_ok=True)
    for f in face.glob("*.jpg"):
        f.unlink()
    (proj / "audio").mkdir(exist_ok=True)
    tr = json.loads(Path(a.transcript).read_text(encoding="utf-8"))
    segs = plan_segments(source_words(tr), [(a.start, a.end)] + [tuple(r) for r in a.also], a.tail, GAP, a.join, a.exact_end)
    report(segs)
    crop = "crop=ih*9/16:ih,scale=1080:1920:flags=lanczos"
    first, v0_first = 1, None
    for k, g in enumerate(segs):
        s, e = g["src_start"] - g["lead"], g["src_end"]   # a join pause shows the next range's own lead-in frames
        v0 = s
        vf = f"fps={a.fps},{crop}"
        if k == 0:
            v0 = max(s, a.video_from or s)
            hold = v0 - s
            if hold > 0:
                vf += f",tpad=start_duration={hold:.3f}:start_mode=clone"
            if a.tv_until and a.tv_until > v0:
                first = tv_open(a, v0, face) + 1
                v0 = a.tv_until
            v0_first = v0
        nf = int(round((g["out_start"] + e - g["src_start"]) * a.fps)) - (first - 1)  # frames up to this range's end
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{v0:.3f}", "-t", f"{e - v0 + 0.5:.3f}", "-i", a.source,
                        "-vf", vf, "-frames:v", str(max(nf, 1)), "-q:v", "3", "-start_number", str(first),
                        str(face / "%06d.jpg")], check=True)
        first += max(nf, 1)
    write_wav(voice_audio(a.source, segs, a.exact_end), proj / "audio" / "voice.wav")
    write_transcript(proj, tr, a.source, segs, v0_first)
    n = len(list(face.glob("*.jpg")))
    dur = short_duration(segs)
    print(f"{n} frames ({n / a.fps:.2f} s), voice {dur:.2f} s, {sum(len(g['words']) for g in segs)} words -> {proj}")
    if not a.no_analyse:
        import faces
        faces.analyse(proj, fps=a.fps, kind="youtube", source=a.source)


if __name__ == "__main__":
    from console import utf8
    utf8()
    main()
