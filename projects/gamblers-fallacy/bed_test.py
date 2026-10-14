"""Room-tone level preview (gamblers-fallacy v2, Ahmed 2026-10-13: "the background sound is extremely cool but too loud").
The first 16 s of the voice with the room tone at several levels under the voice's median speech level, 1 s apart.
v1 used 21 dB. Writes out/bed/bed-levels.mp3."""
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "engine"))
import render as R  # noqa: E402

PROJ = Path(__file__).parent
OUT = PROJ / "out" / "bed"
LEVELS = [21, 26, 30, 34]
SECONDS = 16


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(PROJ / "audio" / "voice.wav"), "-t", str(SECONDS), "-f", "s16le",
                          "-ac", "2", "-ar", str(R.SR), "-"], capture_output=True, check=True).stdout
    v = np.frombuffer(pcm, dtype=np.int16).astype(np.float32).reshape(-1, 2) / 32768
    n, hop = len(v), R.SR // 100
    frames = v[: n // hop * hop].mean(axis=1).reshape(-1, hop)
    db = 10 * np.log10(np.mean(frames ** 2, axis=1) + 1e-12)
    vref = float(np.median(db[db > db.max() - 30]))  # median level of the speech frames
    rt = R.room_tone(n)
    rdb = 10 * np.log10(np.mean(rt.mean(axis=1) ** 2) + 1e-12)
    gap = np.zeros((R.SR, 2), np.float32)
    parts = []
    for lv in LEVELS:
        parts += [v + rt * np.float32(10 ** (((vref - lv) - rdb) / 20)), gap]
    out = np.clip(np.concatenate(parts), -1, 1)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(R.SR), "-ac", "2", "-i", "-", "-b:a", "192k",
                    str(OUT / "bed-levels.mp3")], input=(out * 32767).astype(np.int16).tobytes(), check=True)
    print("levels", LEVELS, "->", OUT / "bed-levels.mp3")


if __name__ == "__main__":
    main()
