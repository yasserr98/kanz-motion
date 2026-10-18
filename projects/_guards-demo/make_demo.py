"""Build the _guards-demo inputs: synthetic face frames, a synthetic voice and its transcript (no source media, no
voice recording: nothing here is anyone's face or voice). Engine demo for the 2026-10-18 review hardening.

    python projects/_guards-demo/make_demo.py          # the clean version: lint finds none of the new kinds
    python projects/_guards-demo/make_demo.py --bad    # breaks every guarded rule on purpose (see README.md)

Writes assets/face (1080x1920) and assets/half (1080x960) frames of a drawn head, audio/voice.wav (noise bursts shaped
like words, each ringing ~0.1 s past its word end like an Arabic final consonant), transcript.json (cut_from, so the
engine treats it as a cut-out short; "no_align": true keeps make.py off the alignment API), script.md, variant.js,
assets/faces.json (the drawn eyes-and-mouth box) and assets/freezes.json (engine/faces.py on the frames), then runs
engine/captions.py. In --bad mode captions.py stops on the English word (SHORT-14) after writing build/timing.js.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(ROOT / "engine"))
import faces  # noqa: E402
from footage import SR, write_wav  # noqa: E402
from provenance import stamp  # noqa: E402

FPS = 24
BAD = "--bad" in sys.argv
# four phrases; the picture changes in the pauses at 3.0, 6.5 and 9.5 s
PHRASES = [
    (0.20, ["حجم", "الرهان", "مش", "هو", "المهم"]),
    (3.10, ["المهم", "مين", "بياخد", "العمولة", "من", "كل", "رهان"]),
    (6.70, ["البنك", "بيكسب", "Polymarket" if BAD else "دايما", "مهما", "كانت", "النتيجة"]),
    (9.70, ["وده", "اللي", "بيفرق", "معاك"]),
]
WORD, STEP = 0.38, 0.45
TAIL = 0.4


def words():
    out = []
    for t0, ws in PHRASES:
        for i, w in enumerate(ws):
            s = round(t0 + i * STEP, 3)
            out.append({"w": w, "start": s, "end": round(s + WORD, 3)})
    return out


def voice(ws, dur):
    rng = np.random.default_rng(7)
    n = int(dur * SR)
    a = rng.normal(0, 0.002, n).astype(np.float32)  # the room
    for w in ws:
        i0, i1 = int(w["start"] * SR), int(w["end"] * SR)
        ring = int(0.12 * SR)  # the final consonant rings past the ASR word end
        k = np.arange(i1 - i0 + ring)
        env = np.minimum(1, k / (0.015 * SR)) * np.where(k < i1 - i0, 1.0, np.exp(-(k - (i1 - i0)) / (0.03 * SR)))
        burst = rng.normal(0, 1, len(k)) * env * 0.25
        burst = np.convolve(burst, np.ones(6) / 6, mode="same")  # a little darker than white noise
        j = min(n, i0 + len(k))
        a[i0:j] += burst[: j - i0].astype(np.float32)
    return np.repeat(a[:, None], 2, axis=1)


def head(t, w, h, cy, scale=1.0):
    """A drawn head that sways a little; returns the image and its eyes-and-mouth box."""
    rng = np.random.default_rng(int(t * 1000))
    cx = 540 + 70 * np.sin(t * 0.9)
    im = Image.new("RGB", (w, h), (198, 184, 170))
    d = ImageDraw.Draw(im)
    rx, ry = 230 * scale, 300 * scale
    d.rectangle([0, cy + ry * 0.8, w, h], fill=(120, 60, 70))  # shirt
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(214, 168, 138))
    ey, my = cy - 60 * scale, cy + 130 * scale
    for ex in (cx - 85 * scale, cx + 85 * scale):
        d.ellipse([ex - 32 * scale, ey - 20 * scale, ex + 32 * scale, ey + 20 * scale], fill=(40, 30, 30))
    op = 18 + 14 * np.sin(t * 9)  # the mouth moves
    d.ellipse([cx - 70 * scale, my - op * scale / 2, cx + 70 * scale, my + op * scale / 2], fill=(90, 30, 40))
    noise = rng.integers(-6, 7, (h, w, 1), dtype=np.int16)  # sensor noise: a live picture never repeats exactly
    arr = np.clip(np.asarray(im, np.int16) + noise, 0, 255).astype(np.uint8)
    box = [int(cx - 150 * scale), int(ey - 70 * scale), int(cx + 150 * scale), int(my + 60 * scale)]
    return Image.fromarray(arr), box


def main():
    ws = words()
    dur = round(ws[-1]["end"] + TAIL, 3)
    n = int(round(dur * FPS))
    for d in ("face", "half"):
        (HERE / "assets" / d).mkdir(parents=True, exist_ok=True)
        for f in (HERE / "assets" / d).glob("*.jpg"):
            f.unlink()
    (HERE / "audio").mkdir(exist_ok=True)
    boxes = {"face": [], "half": []}
    frozen = (int(4.0 * FPS), int(4.8 * FPS)) if BAD else (0, 0)
    for i in range(n):
        t = (frozen[0] if frozen[0] <= i < frozen[1] else i) / FPS  # --bad: the stream stalls 4.0-4.8 s
        for k, (w, h, cy, sc) in {"face": (1080, 1920, 680, 1.0), "half": (1080, 960, 430, 0.9)}.items():
            im, box = head(t, w, h, cy, sc)
            im.save(HERE / "assets" / k / f"{i + 1:06d}.jpg", quality=90)
            boxes[k].append(box)
    fj = {"fps": FPS, "kind": "live", "box": "drawn (projects/_guards-demo/make_demo.py)"}
    for k, (w, h) in {"face": (1080, 1920), "half": (1080, 960)}.items():
        fj[k] = {"w": w, "h": h, "detected": 1.0, "typical": boxes[k][0], "boxes": boxes[k]}
    (HERE / "assets" / "faces.json").write_text(json.dumps(fj, separators=(",", ":")), encoding="utf-8")
    runs = faces.freeze_runs(faces.frame_diffs(HERE / "assets" / "face"), FPS)
    (HERE / "assets" / "freezes.json").write_text(json.dumps({"fps": FPS, "measured_on": "face frames", "runs": runs}), encoding="utf-8")
    write_wav(voice(ws, dur), HERE / "audio" / "voice.wav")
    last = ws[-1]["end"]
    tr = {"engine": "synthetic", "no_align": True, **stamp(HERE / "audio" / "voice.wav"), "duration": dur,
          "cut_from": {"source": "synthetic", "start": 0, "end": dur, "video_from": 0,
                       "ranges": [{"start": 0, "end": dur, "last_word_end": last, "next_word_start": None, "out_start": 0, "lead": 0}]},
          "segments": [{"start": p[0], "end": round(p[0] + (len(p[1]) - 1) * STEP + WORD, 3), "text": " ".join(p[1]),
                        "words": [w for w in ws if p[0] - 1e-6 <= w["start"] <= p[0] + len(p[1]) * STEP]} for p in PHRASES],
          "events": []}
    (HERE / "transcript.json").write_text(json.dumps(tr, ensure_ascii=False, indent=1), encoding="utf-8")
    body = "\n".join(" ".join(p[1]) for p in PHRASES)
    (HERE / "script.md").write_text("# _guards-demo (synthetic, engine demo)\n\n<!-- captions:start -->\n" + body +
                                    "\n<!-- captions:end -->\n", encoding="utf-8")
    (HERE / "variant.js").write_text(f"window.GUARDS_BAD = {str(BAD).lower()};\n", encoding="utf-8")
    print(f"{n} frames, voice {dur} s, freezes {runs}, mode {'bad' if BAD else 'clean'}")
    r = subprocess.run([sys.executable, str(ROOT / "engine" / "captions.py"), str(HERE)])
    if BAD and r.returncode:
        print("captions.py stopped on the English word, as it should (SHORT-14); build/timing.js was written")


if __name__ == "__main__":
    main()
