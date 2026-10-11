# v4 (2026-10-11): splices out/pron/3.mp3 (Ahmed's pick: 'يوصل لك', "the one before the last") over the last paragraph
# of the TTS voice. Run from the kanz-motion root right after `make.py tts us-dollar-decisions 1.15` if the voice is ever
# regenerated. Needs the local clip (out/ is not committed). Adapted from projects/emotional-trading/splice.py.
import sys, json, subprocess, wave, shutil
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path("engine").resolve()))
import eleven
P = Path("projects/us-dollar-decisions"); A = P / "audio"
voice, clip_mp3 = A / "voice.wav", P / "out/pron/3.mp3"
clip_wav = A / "clip-3.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(clip_mp3), "-ar", "48000", "-ac", "1", "-sample_fmt", "s16", str(clip_wav)], check=True)
said = "وده اللي بيفسّر انك ممكن ميكونش معاك دولار واحد… بس جزء من فاتورتك بيتحسب بالدولار، قبل ما يوصل لك بالجنيه."
r = eleven.upload("/forced-alignment", {"text": said}, {"file": clip_wav})
cw = [w for w in r["words"] if w["text"].strip()]
# the voice said 'يوصل لك' (two words) where the caption keeps 'يوصلك' (one): merge them
i = next(j for j, w in enumerate(cw) if w["text"].startswith("يوصل"))
cw[i:i + 2] = [{"text": "يوصلك", "start": cw[i]["start"], "end": cw[i + 1]["end"]}]
def read(p):
    with wave.open(str(p)) as f: return np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32)
sr = 48000
v, c = read(voice), read(clip_wav)
tr = json.loads((P / "transcript.json").read_text(encoding="utf-8"))
ws = [w for s in tr["segments"] for w in s["words"]]
k = max(j for j, w in enumerate(ws) if w["w"].startswith("وده"))
assert len(ws) - k == len(cw), (len(ws) - k, len(cw))
cut = (ws[k - 1]["end"] + ws[k]["start"]) / 2
c0, c1 = max(0, cw[0]["start"] - 0.04), cw[-1]["end"] + 0.12
c = c[int(c0 * sr):int(c1 * sr)]
old = v[int(cut * sr):]
rms = lambda x: float(np.sqrt(np.mean(x[np.abs(x) > 300] ** 2)))  # speech-only RMS
g = rms(old) / rms(c); print("gain", round(g, 3))
c = c * g
fade = int(0.01 * sr); c[:fade] *= np.linspace(0, 1, fade)
out = np.concatenate([v[:int(cut * sr)], c, np.zeros(int(0.3 * sr), np.float32)])
shutil.copy(voice, A / "voice-v3-generated.wav")
with wave.open(str(voice), "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(sr)
    f.writeframes(np.clip(out, -32768, 32767).astype(np.int16).tobytes())
off = cut - c0
for w, n in zip(ws[k:], cw):
    w["start"], w["end"] = round(n["start"] + off, 3), round(n["end"] + off, 3)
tr["segments"][-1]["end"] = ws[-1]["end"]
tr["duration"] = round(len(out) / sr, 2)
tr["splice"] = {"at": round(cut, 3), "from": "out/pron/3.mp3 (Ahmed's pick, 2026-10-11)", "gain": round(g, 3),
                "note": "do not re-run make.py tts without re-applying this splice"}
(P / "transcript.json").write_text(json.dumps(tr, ensure_ascii=False, indent=1), encoding="utf-8")
print("cut", round(cut, 2), "new duration", tr["duration"], [(w["w"], w["start"]) for w in ws[k:]])
