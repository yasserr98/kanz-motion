"""Check a scene frame by frame before rendering: python engine/lint.py <project_dir> [--every 0.25]

Reads the live page (no video render) and reports:
  safe   text outside the platform safe zones (K.SAFE, docs/LOOK-V2.md); objects whose centre is outside
  dead   stretches longer than --dead seconds where nothing new appears and the camera holds
  fill   stretches longer than 1.5 s where visible content covers less than --fill of the safe area
  hook   the first visual arriving later than 1.0 s
Writes out/lint.json and, when there are findings, out/lint.jpg: one frame per finding with the
unsafe zones shaded red. Exit code is 0 either way: these are review flags, not hard failures.
"""
import argparse
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "engine"))
from contact import sheet  # noqa: E402

SAFE = {"top": 270, "bottom": 1440, "left": 120, "right": 960, "upperLeft": 65, "upperRight": 1015, "upperBottom": 1000}
TEXT = "#world .t, #world .tag, #world .card, #world .kcount, #world .ksrc, #headline .w, #overlay .t"
OBJS = "#world img.obj, #world .kdoc, #world .kphoto, #world img.kmap, #world svg.mk path, #world .kpin, #world .kmark, #world .kframe, #world .abs"

PROBE = """(t) => {
  K.seek(t);
  const st = document.getElementById('stage').getBoundingClientRect();
  const out = [];
  let next = window.__lid || 1;
  const eff = (el) => { let o = 1; for (let e = el; e && e.id !== 'stage'; e = e.parentElement) {
      const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return 0; o *= parseFloat(cs.opacity); }
    return o; };
  const take = (sel, kind) => document.querySelectorAll(sel).forEach((el) => {
    if (el.closest('#safeguide')) return;
    if (el.matches('.kshadow, .kglow, .kfg')) return;
    const r = el.getBoundingClientRect();
    if (r.width < 3 || r.height < 3) return;
    const x0 = Math.max(r.left, st.left), x1 = Math.min(r.right, st.right), y0 = Math.max(r.top, st.top), y1 = Math.min(r.bottom, st.bottom);
    if (x1 <= x0 || y1 <= y0) return;
    const o = eff(el); if (o < 0.15) return;
    if (!el.dataset.lid) el.dataset.lid = String(next++);
    out.push({ id: +el.dataset.lid, kind, x0: r.left - st.left, y0: r.top - st.top, x1: r.right - st.left, y1: r.bottom - st.top,
      txt: kind === 'text' ? (el.textContent || '').trim().slice(0, 40) : (el.getAttribute('src') || el.getAttribute('class') || el.tagName).toString().split('/').pop().slice(0, 40) });
  });
  TAKE
  window.__lid = next;
  const w = document.getElementById('world');
  return { items: out, cam: [gsap.getProperty(w, 'x'), gsap.getProperty(w, 'y'), gsap.getProperty(w, 'scaleX')] };
}"""


GUIDE = """(S) => {
  const st = document.getElementById('stage'), g = document.createElement('div');
  g.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:40';
  const box = (l, t, w, h) => { const d = document.createElement('div');
    d.style.cssText = `position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px;background:rgba(229,83,75,.24)`; g.appendChild(d); };
  box(0, 0, 1080, S.top); box(0, S.bottom, 1080, 1920 - S.bottom);
  box(0, S.top, S.upperLeft, S.upperBottom - S.top); box(S.upperRight, S.top, 1080 - S.upperRight, S.upperBottom - S.top);
  box(0, S.upperBottom, S.left, S.bottom - S.upperBottom); box(S.right, S.upperBottom, 1080 - S.right, S.bottom - S.upperBottom);
  st.appendChild(g);
}"""


def outside(it):
    """How a rectangle breaks the safe zone, or ''."""
    why = []
    if it["y0"] < SAFE["top"] - 1:
        why.append("top")
    if it["y1"] > SAFE["bottom"] + 1:
        why.append("bottom")
    lower = it["y1"] > SAFE["upperBottom"]
    left, right = (SAFE["left"], SAFE["right"]) if lower else (SAFE["upperLeft"], SAFE["upperRight"])
    if it["x0"] < left - 1:
        why.append("left")
    if it["x1"] > right + 1:
        why.append("right")
    return "+".join(why)


def coverage(items):
    """Share of the safe area covered by visible content, on a 20 px grid."""
    cell, x0, x1, y0, y1 = 20, SAFE["upperLeft"], SAFE["upperRight"], SAFE["top"], SAFE["bottom"]
    cols, rows = (x1 - x0) // cell, (y1 - y0) // cell
    hit = set()
    for it in items:
        if it["kind"] == "caption":
            continue
        for cy in range(max(0, int((it["y0"] - y0) // cell)), min(rows, int((it["y1"] - y0) // cell) + 1)):
            for cx in range(max(0, int((it["x0"] - x0) // cell)), min(cols, int((it["x1"] - x0) // cell) + 1)):
                hit.add((cx, cy))
    return len(hit) / (cols * rows)


def runs(times, flags, min_len):
    out, start = [], None
    for t, f in zip(times + [None], flags + [False]):
        if f and start is None:
            start = t
        if not f and start is not None:
            end = t if t is not None else times[-1]
            if end - start >= min_len:
                out.append((round(start, 2), round(end, 2)))
            start = None
    return out


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--every", type=float, default=0.25)
    ap.add_argument("--dead", type=float, default=2.5)
    ap.add_argument("--fill", type=float, default=0.30)
    ap.add_argument("--no-sheet", action="store_true")
    a = ap.parse_args()
    proj = Path(a.project).resolve()
    out_dir = proj / "out"
    out_dir.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--allow-file-access-from-files"])
        page = browser.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto((proj / "index.html").as_uri())
        page.wait_for_function("document.fonts && document.fonts.status === 'loaded' && window.K")
        page.wait_for_function("Array.from(document.images).every(i => i.complete && i.naturalWidth > 0)")
        if errors:
            print("PAGE ERRORS:", *errors, sep="\n  ")
        voice_end = page.evaluate("window.DURATION || K.duration")
        look2 = page.evaluate("!!K.LOOK")
        probe = PROBE.replace("TAKE", f"take({json.dumps(TEXT)}, 'text'); take({json.dumps(OBJS)}, 'obj');"
                                      " take('#captions .box', 'caption');")
        # start one sample in: GSAP does not render zero-duration sets on a seek to exactly 0
        frames, t = [], a.every
        while t <= voice_end + 0.01:
            f = page.evaluate(probe, t)
            frames.append((round(t, 2), f))
            t += a.every

        times = [t for t, _ in frames]
        # 1. safe zones
        safe_hits = {}
        for t, f in frames:
            for it in f["items"]:
                why = outside(it)
                if not why:
                    continue
                if it["kind"] == "obj":
                    cx, cy = (it["x0"] + it["x1"]) / 2, (it["y0"] + it["y1"]) / 2
                    if SAFE["upperLeft"] <= cx <= SAFE["upperRight"] and SAFE["top"] <= cy <= SAFE["bottom"]:
                        continue
                    # an object mostly outside (peeking under the UI) is harmless; one cut in half is not
                    ix = max(0, min(it["x1"], SAFE["upperRight"]) - max(it["x0"], SAFE["upperLeft"]))
                    iy = max(0, min(it["y1"], SAFE["bottom"]) - max(it["y0"], SAFE["top"]))
                    if ix * iy < 0.25 * (it["x1"] - it["x0"]) * (it["y1"] - it["y0"]):
                        continue
                    why = "centre-" + why
                key = ("caption", 0, why) if it["kind"] == "caption" else (it["kind"], it["id"], why)
                h = safe_hits.setdefault(key, {"kind": it["kind"], "what": it["txt"], "why": why, "from": t, "to": t, "frames": 0})
                h["to"] = t
                h["frames"] += 1
        # one-sample hits are elements sliding past an edge during a camera move: ignore them
        safe = sorted((h for h in safe_hits.values() if h["frames"] >= 2), key=lambda h: h["from"])

        # 2. dead stretches: no new element and no camera move
        events, seen_prev, cam_prev = [], set(), None
        for t, f in frames:
            ids = {it["id"] for it in f["items"] if it["kind"] != "caption"}
            new = ids - seen_prev
            cam = f["cam"]
            moved = cam_prev is not None and (abs(cam[0] - cam_prev[0]) > 25 or abs(cam[1] - cam_prev[1]) > 25
                                              or abs(cam[2] - cam_prev[2]) > 0.015)
            if new or moved:
                events.append(t)
            seen_prev, cam_prev = ids, cam
        dead = []
        for e0, e1 in zip(events, events[1:] + [voice_end]):
            if e1 - e0 > a.dead:
                dead.append((round(e0, 2), round(e1, 2)))

        # 3. frame fill (captions excluded)
        cov = []
        for t, f in frames:
            cov.append(round(coverage(f["items"]), 3))
        thin = runs(times, [c < a.fill for c in cov], 1.5)

        # 4. hook
        first = next((t for t, f in frames if any(it["kind"] != "caption" for it in f["items"])), None)
        hook = None if first is not None and first <= 1.0 else first

        report = {"project": proj.name, "look2": look2, "every": a.every, "voice_end": voice_end,
                  "safe": safe, "dead": dead, "thin": thin, "hook_late": hook,
                  "fill_median": sorted(cov)[len(cov) // 2] if cov else 0}
        (out_dir / "lint.json").write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")

        print(f"lint {proj.name}: look2={'on' if look2 else 'off'}, {len(frames)} frames to {voice_end:.1f}s, median fill {report['fill_median']:.0%}")
        print(f"  safe zones: {len(safe)} finding(s)")
        for h in safe[:25]:
            what = f"captions in {h['frames']} sampled frames" if h["kind"] == "caption" else h["what"]
            print(f"    {h['from']:6.2f}-{h['to']:6.2f}s  {h['kind']:7} {h['why']:20} {what}")
        print(f"  dead stretches > {a.dead}s: {dead or 'none'}")
        print(f"  thin frames (< {a.fill:.0%} of safe area for 1.5 s+): {thin or 'none'}")
        print(f"  hook: {'first visual at %.2fs (later than 1.0 s)' % hook if hook is not None else 'ok'}")

        shots = sorted({round(h["from"], 2) for h in safe if h["kind"] == "text"}
                       | {round((s + e) / 2, 2) for s, e in dead} | {round((s + e) / 2, 2) for s, e in thin})
        if shots and not a.no_sheet:
            sd = out_dir / "lint"
            sd.mkdir(exist_ok=True)
            for old in sd.glob("*.png"):
                old.unlink()
            page.evaluate(GUIDE, SAFE)
            for t in shots[:18]:
                page.evaluate("(t) => K.seek(t)", t)
                page.screenshot(path=str(sd / f"t{t:06.2f}s.png"), clip={"x": 0, "y": 0, "width": 1080, "height": 1920})
            print("  lint sheet ->", sheet(sd, out_dir / "lint.jpg"))
        browser.close()


if __name__ == "__main__":
    main()
