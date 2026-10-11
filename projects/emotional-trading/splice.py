# v7 (2026-10-11): splices out/pron/r2-2.mp3 (Ahmed's pick) over the end of the TTS voice. Run from the kanz-motion root
# right after `make.py tts emotional-trading 1.15` if the voice is ever regenerated. Needs the local clip (out/ is not committed).
import sys, json, subprocess, wave, shutil
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path("engine").resolve()))
import eleven
P = Path("projects/emotional-trading"); A = P / "audio"
voice, clip_mp3 = A / "voice.wav", P / "out/pron/r2-2.mp3"
clip_wav = A / "clip-r2-2.wav"
subprocess.run(["ffmpeg","-v","error","-y","-i",str(clip_mp3),"-ar","48000","-ac","1","-sample_fmt","s16",str(clip_wav)],check=True)
# word timings inside the clip (forced alignment on the clip alone; spoken spelling as sent to the voice)
r = eleven.upload("/forced-alignment", {"text": "وممكن تاخد قرار مِت-هَوَّر وتكسب بالحظ."}, {"file": clip_wav})
cw = [w for w in r["words"] if w["text"].strip()]
print([(w["text"], round(w["start"],2), round(w["end"],2)) for w in cw])
def read(p):
    with wave.open(str(p)) as f: return np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32)
v, c = read(voice), read(clip_wav)
sr = 48000
tr = json.loads((P/"transcript.json").read_text(encoding="utf-8"))
ws = [w for s in tr["segments"] for w in s["words"]]
k = len(ws) - 6
assert ws[k]["w"] == "وممكن", ws[k]
cut = (ws[k-1]["end"] + ws[k]["start"]) / 2
c0, c1 = max(0, cw[0]["start"] - 0.04), cw[-1]["end"] + 0.12
c = c[int(c0*sr):int(c1*sr)]
old = v[int(cut*sr):]
rms = lambda x: float(np.sqrt(np.mean(x[np.abs(x) > 300] ** 2)))  # speech-only RMS
g = rms(old) / rms(c); print("gain", round(g, 3))
c = c * g
fade = int(0.01*sr); c[:fade] *= np.linspace(0, 1, fade)
tail = v[int(cut*sr)+0:][-0:] if False else None
out = np.concatenate([v[:int(cut*sr)], c, np.zeros(int(0.3*sr), np.float32)])
shutil.copy(voice, A / "voice-v6-generated.wav")
with wave.open(str(voice), "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(sr)
    f.writeframes(np.clip(out, -32768, 32767).astype(np.int16).tobytes())
off = cut - c0
for w, n in zip(ws[k:], cw):
    w["start"], w["end"] = round(n["start"] + off, 3), round(n["end"] + off, 3)
seg = tr["segments"][-1]; seg["end"] = ws[-1]["end"]
tr["duration"] = round(len(out) / sr, 2)
tr["splice"] = {"at": round(cut, 3), "from": "out/pron/r2-2.mp3 (Ahmed's pick, 2026-10-11)", "gain": round(g, 3),
                "note": "do not re-run make.py tts without re-applying this splice"}
(P/"transcript.json").write_text(json.dumps(tr, ensure_ascii=False, indent=1), encoding="utf-8")
print("cut", round(cut,2), "new duration", tr["duration"], ws[k:])
