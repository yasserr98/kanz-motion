# v12 (2026-10-11): Ahmed chose 1.1x from a speed comparison. Run from the kanz-motion root after splice.py and
# voice_edits.py. Stretches audio/voice.wav with rubberband (pitch kept) and divides every word time by the factor.
import json, subprocess, shutil
from pathlib import Path
F = 1.10
P = Path("projects/emotional-trading"); A = P / "audio"
src, out = A / "voice.wav", A / "voice-fast.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-af", f"rubberband=tempo={F}:pitch=1",
                "-ar", "48000", "-ac", "1", "-sample_fmt", "s16", str(out)], check=True)
shutil.move(out, src)
tr = json.loads((P / "transcript.json").read_text(encoding="utf-8"))
for s in tr["segments"]:
    s["start"], s["end"] = round(s["start"] / F, 3), round(s["end"] / F, 3)
    for w in s["words"]:
        w["start"], w["end"] = round(w["start"] / F, 3), round(w["end"] / F, 3)
tr["duration"] = round(tr["duration"] / F, 2)
tr["speed_up"] = {"factor": F, "filter": "rubberband, pitch kept", "note": "run after splice.py and voice_edits.py"}
(P / "transcript.json").write_text(json.dumps(tr, ensure_ascii=False, indent=1), encoding="utf-8")
print("duration", tr["duration"])
