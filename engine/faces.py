"""Face boxes and freezes for a footage short: python engine/faces.py <project> [--kind live|youtube] [--fps 24]

Run by engine/footage.py, engine/footage_track.py and engine/tighten_footage.py after they write the frames; run it by
hand after changing frames any other way. It reads the final frame sets and writes:

  assets/faces.json    per frame, the box around his eyes and mouth (frame pixels, or null where no face was found),
                       for assets/face (1080x1920) and assets/half (1080x960, the split half) when it exists, plus the
                       kind of source ("live" = workshop, "youtube" = long video). K.title, the subtitles and lint's
                       `on-face` finding read it (through build/timing.js) so no text lands on his eyes or mouth (SHORT-4).
  assets/freezes.json  runs of 0.5 s or more where the source picture does not change (a stalled stream that
                       ffmpeg's fps filter filled with copies of one frame: Ahmed's "lag" on live C). Measured on the
                       source frames the tracker saw (assets/track.json "diff") when there are, otherwise on the frames
                       themselves (a fixed crop, so a repeated source frame is a repeated JPEG). lint's `freeze` finding
                       fails a face or split window over one.

Faces: OpenCV Haar (frontal, then profile), every 6th frame on a 360 px wide copy, outliers dropped against a running
median (and boxes under 55% of the median width), gaps up to 1 s filled; the eyes-and-mouth box is the detected face
widened 6% each side, from 10% down to 12% below its bottom (BOX). `typical` is the median box, used
where a frame has none. The thresholds are in FREEZE_* below.
"""
import argparse
import json
import sys
from pathlib import Path

import numpy as np

FREEZE_DIFF = 0.35   # mean absolute difference (0-255 grey, 135x240) under which two frames count as the same picture
FREEZE_MIN = 0.5     # s: shorter runs are not reported (SHORT, P0 2026-10-18)
EVERY = 6            # detect on every 6th frame (4 per second at 24 fps)
GAP_FILL = 1.0       # s: longer gaps without a face stay null
BOX = (-0.06, 0.10, 1.06, 1.12)  # eyes-and-mouth box from a Haar face rectangle (x0, y0, x1, y1 as fractions): generous,
                                 # since Haar sits a little off the eyes when his head turns
MIN_FACE = 0.13      # a face narrower than this share of the frame width is a false hit (an ear, a hand)


def frame_files(d):
    return sorted(Path(d).glob("*.jpg"))


_CASC = {}


def detect(img):
    """Largest face rectangle (x, y, w, h) in a BGR image, or None."""
    import cv2
    m = max(24, int(MIN_FACE * img.shape[1]))
    if not _CASC:
        base = cv2.data.haarcascades
        _CASC["f"] = [cv2.CascadeClassifier(base + n) for n in ("haarcascade_frontalface_default.xml", "haarcascade_frontalface_alt2.xml")]
        _CASC["p"] = cv2.CascadeClassifier(base + "haarcascade_profileface.xml")
    g = cv2.equalizeHist(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))
    hits = []
    for c in _CASC["f"]:
        hits = c.detectMultiScale(g, 1.1, 5, minSize=(m, m))
        if len(hits):
            break
    if not len(hits):
        hits = _CASC["p"].detectMultiScale(g, 1.1, 5, minSize=(m, m))
    if not len(hits):
        hits = [(img.shape[1] - x - w, y, w, h) for x, y, w, h in _CASC["p"].detectMultiScale(g[:, ::-1], 1.1, 5, minSize=(m, m))]
    if not len(hits):
        return None
    return tuple(float(v) for v in max(hits, key=lambda r: r[2] * r[3]))


def inner(rect, scale=1.0):
    x, y, w, h = rect
    return [(x + BOX[0] * w) * scale, (y + BOX[1] * h) * scale, (x + BOX[2] * w) * scale, (y + BOX[3] * h) * scale]


def fill_boxes(samples, n, every=EVERY, fps=24, gap=GAP_FILL):
    """Per-frame boxes from boxes sampled every `every` frames (None = no face): outliers against a running median of
    the box centre are dropped, then each coordinate is interpolated between samples no more than `gap` s apart; a
    frame with no sample within reach stays None. Returns a list of [x0, y0, x1, y1] (ints) or None, length n."""
    idx = [i * every for i in range(len(samples))]
    pts = [(i, b) for i, b in zip(idx, samples) if b is not None]
    if len(pts) >= 3:
        cx = np.array([(b[0] + b[2]) / 2 for _, b in pts])
        w = np.array([b[2] - b[0] for _, b in pts])
        med = np.array([np.median(cx[max(0, k - 4):k + 5]) for k in range(len(cx))])
        medw = np.median(w)
        pts = [p for p, c, m, ww in zip(pts, cx, med, w) if abs(c - m) <= 0.6 * medw and ww >= 0.55 * medw]
    out = [None] * n
    if not pts:
        return out
    reach = gap * fps
    for f in range(n):
        lo = max((p for p in pts if p[0] <= f), default=None, key=lambda p: p[0])
        hi = min((p for p in pts if p[0] >= f), default=None, key=lambda p: p[0])
        if lo and hi and hi[0] - lo[0] <= reach:
            u = 0 if hi[0] == lo[0] else (f - lo[0]) / (hi[0] - lo[0])
            out[f] = [int(round(a + (b - a) * u)) for a, b in zip(lo[1], hi[1])]
        else:
            near = min((p for p in (lo, hi) if p), key=lambda p: abs(p[0] - f))
            if abs(near[0] - f) <= every:
                out[f] = [int(round(v)) for v in near[1]]
    return out


def boxes_for(d, fps):
    import cv2
    files = frame_files(d)
    samples = []
    for f in files[::EVERY]:
        img = cv2.imread(str(f))
        k = img.shape[1] / 360          # detect on a 360 px wide copy: faces stay 90 px or more, 4x faster than half size
        small = cv2.resize(img, (360, round(img.shape[0] / k)), interpolation=cv2.INTER_AREA)
        r = detect(small)
        samples.append(inner(r, k) if r else None)
    boxes = fill_boxes(samples, len(files), EVERY, fps)
    found = sum(b is not None for b in samples)
    return boxes, found / max(len(samples), 1)


def frame_diffs(d):
    """Mean absolute grey difference between each frame and the one before it (first = large)."""
    import cv2
    prev, out = None, []
    for f in frame_files(d):
        g = cv2.resize(cv2.imread(str(f), cv2.IMREAD_GRAYSCALE), (135, 240), interpolation=cv2.INTER_AREA).astype(np.float32)
        out.append(255.0 if prev is None else float(np.abs(g - prev).mean()))
        prev = g
    return out


def freeze_runs(diffs, fps, thr=FREEZE_DIFF, min_len=FREEZE_MIN):
    """[[start, end], ...] in seconds where consecutive frames stay under thr for min_len or more. A frame i whose
    diff is under thr repeats frame i-1, so the frozen picture shows from frame i-1 to the end of the run."""
    runs, start = [], None
    for i, v in enumerate(list(diffs) + [1e9]):
        if v < thr:
            if start is None:
                start = i - 1
        elif start is not None:
            a, b = max(start, 0) / fps, i / fps
            if b - a >= min_len - 1e-6:
                runs.append([round(a, 3), round(b, 3)])
            start = None
    return runs


def analyse(proj, fps=24, kind=None, source=None):
    proj = Path(proj)
    sets = {k: proj / "assets" / k for k in ("face", "half") if frame_files(proj / "assets" / k)}
    if "face" not in sets:
        print("faces: no assets/face frames", file=sys.stderr)
        return None
    kind = kind or ("live" if "half" in sets else "youtube")
    out = {"fps": fps, "kind": kind, "box": "eyes and mouth (engine/faces.py)"}
    for k, d in sets.items():
        boxes, share = boxes_for(d, fps)
        w, h = (1080, 1920) if k == "face" else (1080, 960)
        known = np.array([b for b in boxes if b], float)
        typical = [int(v) for v in np.median(known, axis=0)] if len(known) else None
        out[k] = {"w": w, "h": h, "detected": round(share, 3), "typical": typical, "boxes": boxes}
        print(f"faces: {k} {len(boxes)} frames, face found in {share:.0%} of samples")
    (proj / "assets" / "faces.json").write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")
    track = proj / "assets" / "track.json"
    tj = json.loads(track.read_text(encoding="utf-8")) if track.exists() else {}
    diffs, how = (tj["diff"], "source frames (assets/track.json)") if tj.get("diff") else (frame_diffs(sets["face"]), "face frames")
    runs = freeze_runs(diffs, fps)
    hold = tj.get("hold_frames", 0)
    fr = {"fps": fps, "measured_on": how, "threshold": FREEZE_DIFF, "min_s": FREEZE_MIN, "runs": runs,
          "hold": [0, round(hold / fps, 3)] if hold else None}
    if source:
        fr["source"] = str(source)
    (proj / "assets" / "freezes.json").write_text(json.dumps(fr, indent=1), encoding="utf-8")
    print(f"freezes: {len(runs)} run(s) of {FREEZE_MIN} s or more on the {how}: {runs or 'none'}")
    return out, fr


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--kind", choices=["live", "youtube"])
    ap.add_argument("--fps", type=int, default=24)
    a = ap.parse_args()
    if analyse(a.project, a.fps, a.kind) is None:
        sys.exit(1)


if __name__ == "__main__":
    from console import utf8
    utf8()
    main()
