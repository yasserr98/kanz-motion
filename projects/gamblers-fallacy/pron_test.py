"""Pronunciation test clips for Ahmed to pick from (gamblers-fallacy v2, 2026-10-13: "eswed is pronounced wrong").
Writes out/pron/<n>.mp3 and out/pron/all-versions.mp3 (clips in order, 1 s apart). Same voice, model and settings as
make.py tts (instant clone, speed 1.15, stability 0.5)."""
import base64
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "engine"))
import tts as T  # noqa: E402

PROJ = Path(__file__).parent
OUT = PROJ / "out" / "pron"
LINE = "في لعبة الروليت، الكرة وقفت على اللون {w} مرة، واتنين، وتلاتة."
VARIANTS = {
    "1": "الإسوِد",       # Egyptian "el-eswed", kasra marked on the waw
    "2": "الإسود",        # Egyptian spelling, no marks
    "3": "الأَسْوَد",      # Standard "al-aswad", fully marked
    "4": "الاسود",        # bare spelling, no hamza
}


def main():
    e = T.env()
    key, voice = e["ELEVENLABS_API_KEY"], e["ELEVENLABS_VOICE_ID"]
    model = T.pick_model(key)
    OUT.mkdir(parents=True, exist_ok=True)
    files = []
    for n, w in VARIANTS.items():
        body = {"text": LINE.format(w=w), "model_id": model, "language_code": "ar", "output_format": "mp3_44100_192",
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "speed": 1.15}}
        r = T.call(f"/text-to-speech/{voice}/with-timestamps", key, body)
        f = OUT / f"{n}.mp3"
        f.write_bytes(base64.b64decode(r["audio_base64"]))
        files.append(f)
        print(n, w, "->", f.name)
    gap = OUT / "gap.mp3"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", "1",
                    "-b:a", "192k", str(gap)], check=True)
    lst = OUT / "list.txt"
    lst.write_text("".join(f"file '{p.name}'\nfile 'gap.mp3'\n" for p in files), encoding="utf-8")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-ar", "44100",
                    "-ac", "1", "-b:a", "192k", str(OUT / "all-versions.mp3")], check=True)
    print("->", OUT / "all-versions.mp3")


if __name__ == "__main__":
    main()
