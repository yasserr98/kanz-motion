"""Cut dead air out of a short made with footage.py / footage_track.py (Ahmed 2026-10-17: "a lot of dead silence in the
workshop videos"): every pause between two words longer than --max-gap (default 0.3 s) is shortened to that length by
removing part of the pause, on frame boundaries, so every cut sits at a clean word boundary (the kept lead-in and
lead-out are room tone, no word is touched). It keeps more after a word (--keep-after, 0.2 s: an Arabic final
consonant rings past the ASR word end) than before the next one (0.1 s), and the kept pause stays at least 0.25 s
(SHORT-13). engine/footage_track.py runs it by default for workshop shorts (since 2026-10-18); engine/faces.py then
re-measures the face boxes and freezes on the kept frames.

    python engine/tighten_footage.py <project_dir> [--max-gap 0.3] [--keep-after 0.2]

What it rewrites (the untouched originals are kept once, as assets/face_full, assets/half_full, audio/voice_full.wav,
transcript_full.json; running it again always starts from them):
  assets/face, assets/half   the kept frames, renumbered 000001...   (jump cuts at the seams)
  audio/voice.wav            the kept audio, 6 ms crossfade at each seam
  transcript.json            word / segment times mapped to the new timeline, provenance re-stamped
  assets/track.json          every per-frame list (cx, cy, diff) resampled, joins moved
Then run `make.py captions <project>` (script.md unchanged) and set the scene's N / windows from T() as usual.
"""
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from provenance import stamp  # noqa: E402

FPS = 24


def tighten(proj, max_gap=0.3, min_removed=0.12, keep_after=0.2, analyse=True, fps=FPS):
    proj = Path(proj)
    FPS = fps
    keep_after = min(keep_after, max_gap)
    face, half = proj / "assets" / "face", proj / "assets" / "half"
    face0, half0 = proj / "assets" / "face_full", proj / "assets" / "half_full"
    wav, wav0 = proj / "audio" / "voice.wav", proj / "audio" / "voice_full.wav"
    tr, tr0 = proj / "transcript.json", proj / "transcript_full.json"
    trk = proj / "assets" / "track.json"
    if not face0.exists():
        shutil.copytree(face, face0)
        if half.exists():
            shutil.copytree(half, half0)
        shutil.copy2(wav, wav0)
        shutil.copy2(tr, tr0)
        shutil.copy2(trk, proj / "assets" / "track_full.json")
    t = json.loads(tr0.read_text(encoding="utf-8"))
    n = len(list(face0.glob("*.jpg")))
    dur = n / FPS
    words = [w for s in t["segments"] for w in s["words"]]
    words.sort(key=lambda w: w["start"])
    # kept intervals in source seconds: a gap g > max_gap keeps lead/2 after the previous word and lead/2 before the next
    keep = []  # [start, end) in frame units
    keep_before = max_gap - keep_after
    prev_end = 0.0
    cur_start = 0.0
    for w in words:
        gap = w["start"] - prev_end
        if gap > max_gap + min_removed:
            cut_a = round((prev_end + keep_after) * FPS)
            cut_b = round((w["start"] - keep_before) * FPS)
            if cut_b > cut_a:
                keep.append((round(cur_start * FPS), cut_a))
                cur_start = cut_b / FPS
        prev_end = max(prev_end, w["end"])
    keep.append((round(cur_start * FPS), n))
    keep = [(x, y) for x, y in keep if y > x]
    new_n = sum(y - x for x, y in keep)
    print(f"{n} frames ({dur:.2f} s) -> {new_n} frames ({new_n / FPS:.2f} s); {len(keep) - 1} cuts, removed {(n - new_n) / FPS:.2f} s")

    # map: old time -> new time
    starts, acc = [], 0
    for x, y in keep:
        starts.append((x, y, acc))
        acc += y - x

    def remap(sec):
        f = sec * FPS
        for x, y, o in starts:
            if x <= f <= y:
                return (o + f - x) / FPS
        # inside a removed stretch: snap to the next kept start
        for x, y, o in starts:
            if f < x:
                return o / FPS
        return new_n / FPS

    # frames
    for d, d0 in ((face, face0), (half, half0)):
        if not d0.exists():
            continue
        for f in d.glob("*.jpg"):
            f.unlink()
        k = 1
        for x, y in keep:
            for i in range(x, y):
                shutil.copy2(d0 / f"{i + 1:06d}.jpg", d / f"{k:06d}.jpg")
                k += 1
    # audio: trim + 6 ms crossfade, one ffmpeg filter graph
    parts = []
    for i, (x, y) in enumerate(keep):
        parts.append(f"[0:a]atrim=start={x / FPS:.4f}:end={y / FPS:.4f},asetpts=PTS-STARTPTS[a{i}]")
    chain, last = "", "a0"
    for i in range(1, len(keep)):
        chain += f"[{last}][a{i}]acrossfade=d=0.006:c1=tri:c2=tri[x{i}];"
        last = f"x{i}"
    fc = ";".join(parts) + (";" + chain.rstrip(";") if chain else "")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav0), "-filter_complex", fc, "-map", f"[{last}]" if chain else "[a0]",
                    "-ar", "48000", "-ac", "2", str(wav)], check=True)
    # transcript
    for s in t["segments"]:
        s["start"], s["end"] = round(remap(s["start"]), 3), round(remap(s["end"]), 3)
        for w in s["words"]:
            w["start"], w["end"] = round(remap(w["start"]), 3), round(remap(w["end"]), 3)
    t["duration"] = round(new_n / FPS, 3)
    t["tightened"] = {"max_gap": max_gap, "removed_s": round((n - new_n) / FPS, 2), "cuts_at_s": [round(o / FPS, 3) for _, _, o in starts[1:]]}
    t.update(stamp(wav))
    tr.write_text(json.dumps(t, ensure_ascii=False, indent=1), encoding="utf-8")
    # track.json: keep the kept samples
    j = json.loads((proj / "assets" / "track_full.json").read_text(encoding="utf-8"))
    for key, v in list(j.items()):
        if isinstance(v, list) and len(v) == n:  # every per-frame list: cx, cy, diff
            j[key] = [x for a0, b0 in keep for x in v[a0:b0]]
    if j.get("joins"):
        j["joins"] = sorted({round(remap(f / FPS) * FPS) for f in j["joins"]})
    trk.write_text(json.dumps(j), encoding="utf-8")
    print("seams at (new timeline, s):", t["tightened"]["cuts_at_s"])
    for r in t.get("cut_from", {}).get("ranges", []):
        r["out_start"] = round(remap(r["out_start"]), 3)
    tr.write_text(json.dumps(t, ensure_ascii=False, indent=1), encoding="utf-8")
    if analyse:
        import faces
        faces.analyse(proj, fps=FPS, kind="live", source=j.get("source"))
    print("next: python engine/make.py captions", proj.name)
    return t


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--max-gap", type=float, default=0.3)
    ap.add_argument("--keep-after", type=float, default=0.2, help="pause kept after a word; the rest goes before the next")
    ap.add_argument("--min-removed", type=float, default=0.12, help="do not bother cutting less than this")
    ap.add_argument("--no-analyse", action="store_true")
    a = ap.parse_args()
    tighten(a.project, a.max_gap, a.min_removed, a.keep_after, not a.no_analyse)


if __name__ == "__main__":
    main()
