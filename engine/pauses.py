"""Measured pauses for footage cuts: where the voice really stops and starts (editor preset, 2026-10-23).

    python engine/pauses.py levels <source.mp4> <start> <end>          # dB RMS in 50 ms steps, with a bar
    python engine/pauses.py quiet <source.mp4> <t> [<t> ...]           # quiet runs >= 80 ms within +-1.2 s of each t
    python engine/pauses.py fix <project> <range> <last_end> <next_start> [<range> <last_end> <next_start> ...]

Local Whisper (no ElevenLabs key) glues words in fast speech: each next word "starts" the instant the last one ends, so
footage.py records next_word_start == last_word_end at every cut and the ship check (SHORT-3) reads a next-word leak
that is not in the audio. Pick each cut inside a quiet run (`quiet`, `levels`), cut with `--exact-end`, then write the
measured word end and next word start into the short's transcript.json (`fix`). The originals stay under
cut_from.whisper_ranges; audio and frames are untouched. A breath right before the next word has no quiet run long
enough to end in: the ship check reads it as the voice still sounding (needs an ear, or a different end).
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 16000


def pcm(src, t0, dur):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{max(0.0, t0):.3f}", "-i", str(src), "-t", f"{dur:.3f}", "-vn",
                          "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def levels(src, t0, t1):
    a, hop = pcm(src, t0, t1 - t0), SR // 20
    for i in range(0, len(a) - hop + 1, hop):
        db = 20 * np.log10(np.sqrt(np.mean(a[i:i + hop] ** 2)) + 1e-9)
        print(f"{t0 + i / SR:9.2f}  {db:6.1f} dB  " + "#" * max(0, int((db + 60) / 2)))


def quiet(src, times):
    """Quiet runs (10 ms frames below 12% of the window's loud level, 80 ms or more) near each time, and the nearest."""
    for t in times:
        t0 = max(0.0, t - 1.2)
        a, hop = pcm(src, t0, 2.4), SR // 100
        rms = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) for i in range(0, len(a) - hop, hop)])
        low = rms < 0.12 * np.percentile(rms, 90)
        runs, start = [], None
        for i, q in enumerate(list(low) + [False]):
            if q and start is None:
                start = i
            elif not q and start is not None:
                if i - start >= 8:
                    runs.append((t0 + start / 100, t0 + i / 100))
                start = None
        best = min(runs, key=lambda r: abs((r[0] + r[1]) / 2 - t)) if runs else None
        shown = "  ".join(f"{a:.2f}-{b:.2f}" for a, b in runs) or "none"
        print(f"{t:9.2f}: quiet {shown}" + (f"   -> nearest {best[0]:.2f}-{best[1]:.2f}" if best else ""))


def fix(proj, triples):
    p = Path(proj) / "transcript.json"
    tr = json.loads(p.read_text(encoding="utf-8"))
    cut = tr["cut_from"]
    cut.setdefault("whisper_ranges", json.loads(json.dumps(cut["ranges"])))
    for i, last, nxt in triples:
        r = cut["ranges"][int(i)]
        r["last_word_end"], r["next_word_start"] = float(last), float(nxt)
        print(f"range {i}: last word end {last}, next word start {nxt} (was {cut['whisper_ranges'][int(i)]['next_word_start']})")
    cut["boundary_fix"] = "last_word_end / next_word_start measured on the source audio (engine/pauses.py)"
    p.write_text(json.dumps(tr, ensure_ascii=False, indent=1), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    lv = sub.add_parser("levels")
    lv.add_argument("source")
    lv.add_argument("start", type=float)
    lv.add_argument("end", type=float)
    qt = sub.add_parser("quiet")
    qt.add_argument("source")
    qt.add_argument("times", type=float, nargs="+")
    fx = sub.add_parser("fix")
    fx.add_argument("project")
    fx.add_argument("values", nargs="+", help="<range> <last_end> <next_start>, repeated")
    a = ap.parse_args()
    if a.cmd == "levels":
        levels(a.source, a.start, a.end)
    elif a.cmd == "quiet":
        quiet(a.source, a.times)
    else:
        if len(a.values) % 3:
            sys.exit("fix takes <range> <last_end> <next_start> triples")
        fix(a.project, [a.values[i:i + 3] for i in range(0, len(a.values), 3)])


if __name__ == "__main__":
    from console import utf8
    utf8()
    main()
