"""Transcribe a voice note to word-timed JSON (Arabic by default).

    uv run --with faster-whisper python engine/transcribe.py <audio> <out.json> [--lang ar]

Uses faster-whisper "turbo" with VAD and word timestamps, the same engine used for
the 2026-09-27 Kanz voice scripts. Output keeps every word with start/end seconds
so beats, captions and cuts can be timed to the voice.
"""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

import numpy as np

from faster_whisper import WhisperModel


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("out")
    ap.add_argument("--lang", default="ar")
    ap.add_argument("--model", default="turbo")
    a = ap.parse_args()

    # decode with ffmpeg (16 kHz mono float) rather than PyAV, whose API drifts between versions
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", a.audio, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768
    model = WhisperModel(a.model, device="cpu", compute_type="int8")
    segments, info = model.transcribe(audio, language=a.lang, vad_filter=True,
                                      word_timestamps=True, beam_size=5)
    segs = []
    for s in segments:
        segs.append({
            "start": round(s.start, 3), "end": round(s.end, 3), "text": s.text.strip(),
            "words": [{"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3),
                       "p": round(w.probability, 3)} for w in (s.words or [])],
        })
        print(f"[{s.start:7.2f} → {s.end:7.2f}] {s.text.strip()}")
    out = {
        "source": Path(a.audio).name,
        "sha256": hashlib.sha256(Path(a.audio).read_bytes()).hexdigest(),
        "engine": "faster-whisper", "model": a.model, "language": a.lang,
        "duration": round(info.duration, 3), "segments": segs,
    }
    Path(a.out).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
