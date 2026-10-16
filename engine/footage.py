"""Cut a short from a long Kanz video into a project: face frames, voice and word timings.

    python engine/footage.py <project_dir> <source.mp4> <transcript.raw.json> <start> <end> [--video-from S]

  start, end    seconds in the source: the short's audio runs start..end (fade out over the last 0.08 s)
  --video-from  first source second with clean footage (e.g. after a transition); the first frame is held
                until then so the short opens on the face (Ahmed 2026-10-16: first 3 s always show his face)

Writes <project>/assets/face/000001.jpg... (centre 9:16 crop, 1080x1920, 24 fps), <project>/audio/voice.wav
(the source sound, 48 kHz stereo) and <project>/transcript.json (the source words in that range, shifted to 0),
then prints the frame count for K.footage({n}). Burned-in text in the source stays in the frames.
"""
import argparse
import json
import subprocess
from pathlib import Path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("source")
    ap.add_argument("transcript")
    ap.add_argument("start", type=float)
    ap.add_argument("end", type=float)
    ap.add_argument("--video-from", type=float)
    ap.add_argument("--fps", type=int, default=24)
    a = ap.parse_args()
    proj = Path(a.project)
    face = proj / "assets" / "face"
    face.mkdir(parents=True, exist_ok=True)
    for f in face.glob("*.jpg"):
        f.unlink()
    (proj / "audio").mkdir(exist_ok=True)
    dur = a.end - a.start
    v0 = max(a.start, a.video_from or a.start)
    hold = v0 - a.start
    vf = f"fps={a.fps},crop=ih*9/16:ih,scale=1080:1920:flags=lanczos"
    if hold > 0:
        vf += f",tpad=start_duration={hold:.3f}:start_mode=clone"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{v0:.3f}", "-t", f"{a.end - v0:.3f}", "-i", a.source,
                    "-vf", vf, "-q:v", "3", "-start_number", "1", str(face / "%06d.jpg")], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a.start:.3f}", "-i", a.source, "-t", f"{dur:.3f}", "-vn",
                    "-af", f"afade=t=in:d=0.02,afade=t=out:st={dur - 0.08:.3f}:d=0.08", "-ar", "48000", "-ac", "2",
                    str(proj / "audio" / "voice.wav")], check=True)
    tr = json.loads(Path(a.transcript).read_text(encoding="utf-8"))
    segs = []
    for s in tr["segments"]:
        ws = [{**w, "start": round(w["start"] - a.start, 3), "end": round(w["end"] - a.start, 3)}
              for w in s["words"] if w["start"] >= a.start - 0.05 and w["end"] <= a.end + 0.05]
        if ws:
            segs.append({"start": ws[0]["start"], "end": ws[-1]["end"], "text": " ".join(w["w"] for w in ws), "words": ws})
    out = {k: v for k, v in tr.items() if k not in ("segments", "events")}
    out.update({"cut_from": {"source": a.source, "start": a.start, "end": a.end, "video_from": v0},
                "duration": round(dur, 3), "segments": segs, "events": []})
    (proj / "transcript.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    n = len(list(face.glob("*.jpg")))
    print(f"{n} frames ({n / a.fps:.2f} s), voice {dur:.2f} s, {sum(len(s['words']) for s in segs)} words -> {proj}")


if __name__ == "__main__":
    main()
