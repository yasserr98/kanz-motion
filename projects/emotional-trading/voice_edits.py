# v11 (2026-10-11): edits on top of the TTS voice + splice.py. Run from the kanz-motion root after splice.py.
# 1) Ahmed picked test clip k-4 ("...عشان لازم ترجع اللي خسرتو.") for the losing-trade sentence: it replaces that sentence.
# 2) Pauses: full stops the voice read straight through (0.03 s) get real silence; two commas get a short one.
# Needs the local clip out/pron/k-4.mp3 (out/ is not committed). Word timings are shifted to match.
import sys, json, subprocess, wave, re
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path("engine").resolve()))
import eleven
P = Path("projects/emotional-trading"); A = P / "audio"; SR = 48000
def read(p):
    with wave.open(str(p)) as f: return np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32)
tr = json.loads((P / "transcript.json").read_text(encoding="utf-8"))
ws = [w for s in tr["segments"] for w in s["words"]]
v = read(A / "voice.wav")
# 1) clip k-4 replaces "أو تخسر ... خسرته."
i0 = next(i for i, w in enumerate(ws) if w["w"] == "أو" and ws[i + 1]["w"] == "تخسر")
i1 = next(i for i in range(i0, len(ws)) if ws[i]["w"].startswith("خسرته"))
clip = A / "clip-k4.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(P / "out/pron/k-4.mp3"), "-ar", str(SR), "-ac", "1", "-sample_fmt", "s16", str(clip)], check=True)
spoken = "أو تخسر في صفقة، فتحط فلوس أكتر في اللي بعدها، عشان لازم ترجع اللي خسرتو."
r = eleven.upload("/forced-alignment", {"text": spoken}, {"file": clip})
cw = [w for w in r["words"] if w["text"].strip()]
assert len(cw) == i1 - i0 + 1, (len(cw), i1 - i0 + 1)
c = read(clip)
c0, c1 = max(0, cw[0]["start"] - 0.04), cw[-1]["end"] + 0.1
c = c[int(c0 * SR):int(c1 * SR)]
a = (ws[i0 - 1]["end"] + ws[i0]["start"]) / 2
b = (ws[i1]["end"] + ws[i1 + 1]["start"]) / 2
rms = lambda x: float(np.sqrt(np.mean(x[np.abs(x) > 300] ** 2)))
g = rms(v[int(a * SR):int(b * SR)]) / rms(c); c *= g
f = int(0.01 * SR); c[:f] *= np.linspace(0, 1, f); c[-f:] *= np.linspace(1, 0, f)
shift = len(c) / SR - (b - a)
for w, n in zip(ws[i0:i1 + 1], cw):
    w["start"], w["end"] = round(n["start"] - c0 + a, 3), round(n["end"] - c0 + a, 3)
for w in ws[i1 + 1:]:
    w["start"], w["end"] = round(w["start"] + shift, 3), round(w["end"] + shift, 3)
v = np.concatenate([v[:int(a * SR)], c, v[int(b * SR):]])
print(f"clip k-4 at {a:.2f}-{b:.2f}s, gain {g:.2f}, length change {shift:+.2f}s")
# 2) pauses where the voice runs through punctuation
want = {".": 0.32, "؟": 0.32, ":": 0.28, "،": 0.14}
cuts = []
for j in range(len(ws) - 1):
    m = re.search(r"[.؟:،]$", ws[j]["w"])
    if not m or ws[j]["w"] in ("الخوف،", "الطمع،"):  # the list "الخوف، أو الطمع" stays quick
        continue
    gap = ws[j + 1]["start"] - ws[j]["end"]
    need = want[m.group(0)] - gap
    if need > 0.08:
        cuts.append((ws[j]["end"] + gap / 2, need, j))
added = 0.0
for t, need, j in cuts:  # left to right; t in original-after-clip time
    pos = int((t + added) * SR)
    v = np.concatenate([v[:pos], np.zeros(int(need * SR), np.float32), v[pos:]])
    for w in ws[j + 1:]:
        w["start"], w["end"] = round(w["start"] + need, 3), round(w["end"] + need, 3)
    added += need
    print(f"pause +{need:.2f}s after '{ws[j]['w']}' at {t:.2f}s")
with wave.open(str(A / "voice.wav"), "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes(np.clip(v, -32768, 32767).astype(np.int16).tobytes())
tr["segments"][-1]["end"] = ws[-1]["end"]
tr["duration"] = round(len(v) / SR, 2)
tr["voice_edits"] = {"clip": "out/pron/k-4.mp3 (Ahmed's pick)", "pauses_added_s": round(added, 2),
                     "note": "re-run splice.py then voice_edits.py after any make.py tts"}
(P / "transcript.json").write_text(json.dumps(tr, ensure_ascii=False, indent=1), encoding="utf-8")
print("duration", tr["duration"])
