"""Check a scene frame by frame before rendering: python engine/lint.py <project_dir> [--every 0.25]

Reads the live page (no video render) and reports:
  safe   text outside the platform safe zones (K.SAFE, docs/LOOK-V2.md); objects whose centre is outside
  dead   stretches longer than --dead seconds where nothing new appears and the camera holds
  fill   stretches longer than 1.5 s where visible content covers less than --fill of the safe area (MUST FIX
         since 2026-10-11: fill the frame when the voice names a thing, or justify it)
  hook   the first visual arriving later than --hook (0.3 s since 2026-10-11) and a first frame below --fill
  bars   boards where two or more bars use hand-entered heights or different scales (K.scale, docs/LOOK-V2.md)
  covered  a label or headline word hidden under an object (e.g. a carried hero crossing it) or under the caption
  under / caption-band  any OBJS element with over 15% of its height in the occupied caption band
  edge     an object (K.bgObj figures included) with its centre inside but over a quarter of it past the side margin
           (covered / under / edge added 2026-10-13 from the us-dollar-decisions-pace v3 review)
  text-on-text  visible world labels/headline words intersecting captions or other text, even for one sample
  covered-shape  text hidden by .abs shapes, SVG marks or cards (also included in covered)
  brief    a label fully on screen at opacity >= .95 for less than 0.8 s total (sampled at <= 0.1 s)
  half-built-arrival  fill below --fill or a detectable chart less than half drawn 0.3 s after K.go arrives
  markup-crossing-text  SVG marks / .kframe / .kmark boxes crossing text; K.strike is exempt
  structure  K.look without K.pace, missing/non-final K.finish, logo images or slide-counter literals
Dead findings exclude the simple hook (t < K.captionsFrom) and K.footage face windows.
Writes out/lint.json and, when there are findings, out/lint.jpg. Exit code defaults to 0.
--strict exits 1 for findings not justified by lint-ok.json, a list of
{kind, t, why} or {kind, range: [start, end], why}. Ranges must contain the entire finding;
point times match within 0.01 s. Static findings use t: 0. Reasons must be nonempty.
"""
import argparse
import json
import math
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "engine"))
from contact import sheet  # noqa: E402

SAFE = {"top": 270, "bottom": 1440, "left": 120, "right": 960, "upperLeft": 65, "upperRight": 1015, "upperBottom": 1000}
TEXT = "#world .t, #world .tag, #world .card, #world .kcount, #world .ksrc, #headline .w, #overlay .t"
COVER = "#world .t, #world .tag, #headline .w"  # labels that must stay readable (2026-10-13)
OBJS = "#world img.obj,#world .kdoc, #world .kphoto, #world .ksnap, #world img.kmap, #world svg.mk path, #world svg.mk polyline, #world svg.mk rect, #world .kpin, #world .kmark, #world .kframe, #world .abs"
OCCLUDERS = "img.obj, .abs, .card, svg.mk path, svg.mk polyline, svg.mk rect, .kframe, .kmark"

# Runtime helpers are observed before scene.js runs, without modifying runtime or project files.
# K.strike uses the SAME svg.mk class as other marks; there is no strike-specific class.
INSTRUMENT = """() => {
  let runtime;
  window.__lintArrivals = [];
  Object.defineProperty(window, 'K', { configurable: true, get: () => runtime, set: (k) => {
    runtime = k;
    for (const name of ['go', 'strike', 'line', 'area']) {
      let fn;
      Object.defineProperty(k, name, { configurable: true, get: () => fn, set: (impl) => {
        fn = function (...args) {
          const before = name === 'area' ? new Set(document.querySelectorAll('svg.mk')) : null;
          const result = impl.apply(this, args);
          if (name === 'go' && Number.isFinite(result?.arrive))
            window.__lintArrivals.push({t: result.arrive + 0.3, board: args[1]});
          if (name === 'strike' && result) result.dataset.lintStrike = '1';
          if (name === 'line' && result) result.dataset.lintChart = '1';
          if (before) document.querySelectorAll('svg.mk').forEach(s => {
            if (!before.has(s)) s.dataset.lintChart = '1';
          });
          return result;
        };
      }});
    }
  }});
}"""

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
    const cs = getComputedStyle(el), length = el.getTotalLength ? el.getTotalLength() : 0;
    const chart = !!el.closest('[data-lint-chart]');
    const drawn = chart && length && cs.strokeDasharray !== 'none' ?
      Math.max(0, Math.min(1, 1 - Math.abs(parseFloat(cs.strokeDashoffset) || 0) / length)) : null;
    out.push({ id: +el.dataset.lid, kind, opacity: o, label: el.matches(COVERSEL),
      parents: [...(function* () { for (let p = el.parentElement; p; p = p.parentElement)
        if (p.dataset.lid) yield +p.dataset.lid; })()],
      markup: el.matches('svg.mk path, svg.mk polyline, svg.mk rect, .kframe, .kmark') &&
        !el.closest('[data-lint-strike], [data-lint-chart]'), drawn,
      x0: r.left - st.left, y0: r.top - st.top, x1: r.right - st.left, y1: r.bottom - st.top,
      txt: kind === 'text' || kind === 'caption' ? (el.textContent || '').trim().slice(0, 80) :
        (el.getAttribute('src') || el.getAttribute('class') || el.tagName).toString().split('/').pop() });
  });
  TAKE
  window.__lid = next;
  // A 3x3 grid catches partial coverage at the top/bottom, not just the centre line.
  const covered = [];
  // SVG marks normally opt out of hit testing. Restore their exact styles after probing.
  const overrides = [...document.querySelectorAll(OCCLUDERSEL)].map(e =>
    [e, e.style.getPropertyValue('pointer-events'), e.style.getPropertyPriority('pointer-events')]);
  overrides.forEach(([e]) => e.style.setProperty('pointer-events', e instanceof SVGElement ? 'visiblePainted' : 'auto', 'important'));
  document.querySelectorAll(COVERSEL).forEach((el) => {
    if (eff(el) < 0.5) return;
    const r = el.getBoundingClientRect();
    if (r.width < 3 || r.height < 3) return;
    const hits = {};
    for (const yf of [0.25, 0.5, 0.75]) for (const xf of [0.25, 0.5, 0.75]) {
      const xs = r.left + r.width * xf, ys = r.top + r.height * yf;
      for (const e of document.elementsFromPoint(xs, ys)) {
        if (e === el || el.contains(e)) break;
        if (e.closest('#captions')) break; // caption overlap is measured by area in Python
        if (e.matches(OCCLUDERSEL) && !e.contains(el) && !e.matches('.kfg, .kshadow, .kglow') &&
            !e.closest('[data-lint-strike]') && eff(e) >= 0.3) {
          const k = (e.getAttribute('src') || e.getAttribute('class') || e.tagName).split('/').pop();
          const key = (e.matches('img.obj') ? 'image:' : 'shape:') + k;
          hits[key] = (hits[key] || 0) + 1; break; }
      }
    }
    const by = Object.keys(hits).find((k) => hits[k] >= 2);
    if (by) covered.push({ id: +(el.dataset.lid || 0), txt: (el.textContent || '').trim().slice(0, 40), by });
  });
  overrides.forEach(([e, value, priority]) => value ? e.style.setProperty('pointer-events', value, priority) : e.style.removeProperty('pointer-events'));
  const w = document.getElementById('world');
  const cap = document.getElementById('captions'), cr = cap?.getBoundingClientRect();
  const captionBand = cap && cap.textContent.trim() && eff(cap) >= 0.5 ?
    (cr && cr.height ? {y0: cr.top - st.top, y1: cr.bottom - st.top} : {y0:1190,y1:1450}) : null;
  return { items: out, covered, captionBand,
    cam: [gsap.getProperty(w, 'x'), gsap.getProperty(w, 'y'), gsap.getProperty(w, 'scaleX')] };
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


def bar_findings(bars):
    """Boards whose bars are not drawn from values on one shared scale. Illustrative bars are skipped."""
    by_board = {}
    for b in bars:
        if not b.get("illustrative"):
            by_board.setdefault(b["board"], []).append(b)
    out = []
    for board, bs in by_board.items():
        if len(bs) < 2:
            continue
        hand = [b for b in bs if b["value"] is None]
        scales = {b["scale"] for b in bs if b["value"] is not None}
        if hand:
            out.append({"board": board, "why": "hand-entered heights", "at": hand[0]["at"],
                        "detail": "h = " + ", ".join(str(round(b["h"])) for b in hand) + "; pass value + scale"})
        elif len(scales) > 1:
            out.append({"board": board, "why": "different scales", "at": bs[0]["at"],
                        "detail": f"{len(scales)} scales on one board; use one K.scale per comparison"})
    return out


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


def merge_hits(hits, every):
    """Merge adjacent samples of the same finding, never across a missing sample."""
    out, active = [], {}
    for hit in sorted(hits, key=lambda h: h['t']):
        key = (hit['kind'], hit.get('id'), hit.get('by'), hit.get('why'))
        previous = active.get(key)
        if previous and hit['t'] - previous['to'] <= every + 1e-6:
            previous['to'] = hit['t']
            previous['frames'] += 1
        else:
            previous = {**hit, 'from': hit['t'], 'to': hit['t'], 'frames': 1}
            previous.pop('t')
            out.append(previous)
            active[key] = previous
    return out


def intersects(a, b):
    return min(a['x1'], b['x1']) > max(a['x0'], b['x0']) and min(a['y1'], b['y1']) > max(a['y0'], b['y0'])


def exclude_windows(intervals, windows, min_len):
    """Split dead runs at exact hook/face boundaries, then apply the duration threshold."""
    for a, b in windows:
        pieces = []
        for s, e in intervals:
            if b <= s or a >= e:
                pieces.append((s, e))
            else:
                if s < a:
                    pieces.append((s, a))
                if b < e:
                    pieces.append((b, e))
        intervals = pieces
    return [(round(s, 3), round(e, 3)) for s, e in intervals if e - s > min_len]


def frame_findings(t, frame):
    """Geometry-only checks; caption band uses height, not narrow caption glyph area."""
    items = frame['items']
    text = [i for i in items if i['kind'] in ('text', 'caption') and i.get('opacity', 1) >= .5 and i['txt']]
    out = []
    for i, a in enumerate(text):
        for b in text[i + 1:]:
            if not (a.get('label') or b.get('label')) or a['id'] in b.get('parents', []) or b['id'] in a.get('parents', []):
                continue
            if intersects(a, b):
                out.append(dict(kind='text-on-text', t=t, id=a['id'], what=a['txt'],
                                by='caption' if b['kind'] == 'caption' else b['txt']))
    band = frame.get('captionBand')
    for obj in items:
        if obj['kind'] != 'obj':
            continue
        height = obj['y1'] - obj['y0']
        if band and height > 0 and max(0, min(obj['y1'], band['y1']) - max(obj['y0'], band['y0'])) / height > .15:
            out.append(dict(kind='caption-band', t=t, id=obj['id'], what=obj['txt']))
        if obj.get('markup') and obj.get('opacity', 1) >= .5:
            for label in text:
                if intersects(obj, label):
                    out.append(dict(kind='markup-crossing-text', t=t, id=obj['id'], what=obj['txt'], by=label['txt']))
    for c in frame.get('covered', []):
        if c['by'].startswith('shape:'):
            out.append(dict(kind='covered-shape', t=t, id=c['id'], what=c['txt'], by=c['by'][6:]))
    return out


def brief_findings(frames, end, every):
    """Sum visible sample intervals, including separate appearances of the same DOM label."""
    labels = {}
    for n, (t, frame) in enumerate(frames):
        dt = min(every, (frames[n + 1][0] if n + 1 < len(frames) else end) - t)
        for it in frame['items']:
            if not it.get('label') or not it['txt']:
                continue
            label = labels.setdefault(it['id'], dict(kind='brief', id=it['id'], what=it['txt'],
                                                     t=t, duration=0, seen_to=t))
            label['seen_to'] = t
            if it.get('opacity', 1) >= .95 and it['x0'] >= 0 and it['x1'] <= 1080 and it['y0'] >= 0 and it['y1'] <= 1920:
                label['duration'] += max(0, dt)
    return [{**h, 'duration': round(h['duration'], 3)} for h in labels.values() if h['duration'] < .8 - 1e-6]


def arrival_findings(t, frame, fill, board):
    fraction = coverage([i for i in frame['items'] if i.get('opacity', 1) >= .5])
    charts = [i for i in frame['items'] if i.get('drawn') is not None and i['drawn'] < .5]
    why = []
    if fraction < fill:
        why.append(f'fill {fraction:.0%} < {fill:.0%}')
    if charts:
        why.append('chart less than 50% drawn')
    return [dict(kind='half-built-arrival', t=round(t, 3), board=board, why='; '.join(why))] if why else []


# A small lexical scanner, not a JS parser: comments and string contents cannot masquerade as K calls.
JS_TOKENS = re.compile(r'//[^\n]*|/\*[\s\S]*?\*/|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|`(?:\\.|[^`\\])*`|[\s\S]')


def static_scene_findings(source):
    code, strings = [], []
    for m in JS_TOKENS.finditer(source):
        token = m.group()
        if token.startswith(('//', '/*')):
            code.append(' ' * len(token))
        elif token[0] in '\"\'`':
            strings.append((m.start(), token[1:-1]))
            code.append(' ' * len(token))
        else:
            code.append(token)
    code = ''.join(code)
    calls = re.findall(r'\bK\s*\.\s*(\w+)\s*\(', code)
    out = []
    def add(why, **extra):
        out.append(dict(kind='structure', t=0, why=why, **extra))
    if 'look' in calls:
        if 'pace' not in calls:
            add('K.look() without K.pace()')
        if not calls or calls[-1] != 'finish':
            add('K.finish() must be the last K call (missing or followed by another call)')
    for offset, value in strings:
        if re.search(r'\d+\s*/\s*\d+', value) and not re.search(r'\.(png|jpe?g|svg|webp)\b|https?://', value, re.I):
            add('slide-counter text', line=source.count('\n', 0, offset) + 1, what=value[:80])
        if re.search(r'logo', value, re.I) and (re.search(r'\.(png|jpe?g|svg|webp)\b|<img\b', value, re.I) or
                                               re.search(r'\bK\s*\.\s*(?:img|el)\s*\([^;]*$', code[:offset])):
            add('logo image', line=source.count('\n', 0, offset) + 1, what=value[:80])
    return out


def justified(finding, allowances):
    """Require a reason, exact kind and full time containment (no partial-range waivers)."""
    start = finding.get('from', finding.get('t', 0))
    end = finding.get('to', start)
    for allowance in allowances:
        if not isinstance(allowance, dict) or allowance.get('kind') != finding['kind'] or not isinstance(allowance.get('why'), str) or not allowance['why'].strip():
            continue
        span = allowance.get('range', [allowance.get('t'), allowance.get('t')])
        if not isinstance(span, list) or len(span) != 2 or not all(type(v) in (int, float) and math.isfinite(v) for v in span):
            continue
        if span[0] <= span[1] and span[0] - .01 <= start and end <= span[1] + .01:
            return True
    return False


def legacy_findings(report, fill, hook_limit):
    """Expose ALL original report categories to strict mode, retaining old JSON fields."""
    out = []
    for key, kind in [('safe', 'safe'), ('covered', 'covered'), ('edge', 'edge'), ('bars', 'bars')]:
        for h in report[key]:
            if key == 'covered' and h['by'].startswith('shape:'):
                continue  # covered-shape is already represented in the canonical findings
            out.append({**h, 'kind': kind, 't': h.get('at') or h.get('from', 0)})
    for key, kind in [('dead', 'dead'), ('thin', 'fill')]:
        out.extend(dict(kind=kind, **{'from': s, 'to': e}) for s, e in report[key])
    if report['hook_late'] is not None:
        out.append(dict(kind='hook', t=report['hook_late'], why=f'first visual later than {hook_limit}s'))
    if report['first_fill'] < fill:
        out.append(dict(kind='hook', t=0, why='first frame below fill threshold'))
    return out


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--every", type=float, default=0.25)
    ap.add_argument("--dead", type=float, default=2.5)
    ap.add_argument("--fill", type=float, default=0.30)
    ap.add_argument("--hook", type=float, default=0.3)
    ap.add_argument("--no-sheet", action="store_true")
    ap.add_argument("--strict", action="store_true", help="exit 1 for findings without a lint-ok.json justification")
    a = ap.parse_args()
    if not math.isfinite(a.every) or a.every <= 0:
        ap.error('--every must be positive and finite')
    proj = Path(a.project).resolve()
    out_dir = proj / "out"
    out_dir.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--allow-file-access-from-files"])
        page = browser.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        page.add_init_script('(' + INSTRUMENT + ')()')
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto((proj / "index.html").as_uri())
        page.wait_for_function("document.fonts && document.fonts.status === 'loaded' && window.K")
        page.wait_for_function("Array.from(document.images).every(i => i.complete && i.naturalWidth > 0)")
        if errors:
            print("PAGE ERRORS:", *errors, sep="\n  ")
        voice_end = page.evaluate("window.DURATION || K.duration")
        scene_end = max(voice_end, page.evaluate('K.duration'))
        look2 = page.evaluate("!!K.LOOK")
        probe = PROBE.replace("TAKE", f"take({json.dumps(TEXT)}, 'text'); take({json.dumps(OBJS)}, 'obj');"
                                      " take('#captions .box', 'caption');").replace("COVERSEL", json.dumps(COVER)).replace("OCCLUDERSEL", json.dumps(OCCLUDERS))
        # start one sample in: GSAP does not render zero-duration sets on a seek to exactly 0
        step = min(a.every, .1)  # short labels need finer sampling than the general review
        sample_times = [round(i * a.every, 6) for i in range(1, int(voice_end / a.every) + 1)]
        fine_times = [round(i * step, 6) for i in range(1, int(scene_end / step) + 1)]
        arrivals = page.evaluate('window.__lintArrivals')
        arrival_times = [h['t'] for h in arrivals if 0 < h['t'] <= voice_end]
        sampled = {t: page.evaluate(probe, t) for t in sorted(set(sample_times + fine_times + arrival_times))}
        frames = [(t, sampled[t]) for t in sample_times]
        new_findings = merge_hits([h for t, f in frames for h in frame_findings(t, f)], a.every)
        new_findings += brief_findings([(t, sampled[t]) for t in fine_times], scene_end, step)
        for h in arrivals:
            if h['t'] in sampled:
                new_findings += arrival_findings(h['t'], sampled[h['t']], a.fill, h['board'])
        new_findings += static_scene_findings((proj / 'scene.js').read_text(encoding='utf-8'))

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
        windows = page.evaluate('[[0, K.captionsFrom || 0], ...(K.faceWindows || []).map(w => w.slice(0,2))]')
        dead = exclude_windows(dead, windows, a.dead)

        # 3. frame fill (captions excluded)
        cov = []
        for t, f in frames:
            cov.append(round(coverage(f["items"]), 3))
        thin = runs(times, [c < a.fill for c in cov], 1.5)

        # 4. hook
        first = next((t for t, f in frames if any(it["kind"] != "caption" for it in f["items"])), None)
        hook = None if first is not None and first <= a.hook else first
        first_fill = cov[0] if cov else 0

        # 5. bars drawn to scale
        bars = bar_findings(page.evaluate("(K.bars || []).map(b => ({...b}))"))

        # 6. covered text (2026-10-13): a label under an object at a 0.25 s sample (a one-frame crossing during a fast
        #    camera whip is not caught, by design) or under the caption for two samples (a move sliding past is ignored)
        cover_hits = {}
        for t, f in frames:
            for c in f.get("covered", []):
                h = cover_hits.setdefault((c["id"], c["by"]), {"what": c["txt"], "by": c["by"], "from": t, "to": t, "frames": 0})
                h["to"], h["frames"] = t, h["frames"] + 1
        # a label more than a quarter under a caption box (area, not a centre test: half-hidden labels count)
        for t, f in frames:
            caps = [it for it in f["items"] if it["kind"] == "caption"]
            for it in f["items"]:
                if it["kind"] != "text" or it["y0"] < SAFE["top"]:
                    continue
                area = (it["x1"] - it["x0"]) * (it["y1"] - it["y0"])
                ov = sum(max(0, min(it["x1"], c["x1"]) - max(it["x0"], c["x0"])) * max(0, min(it["y1"], c["y1"]) - max(it["y0"], c["y0"]))
                         for c in caps)
                if area and ov > 0.25 * area:
                    h = cover_hits.setdefault((it["id"], "caption"), {"what": it["txt"], "by": "caption", "from": t, "to": t, "frames": 0})
                    h["to"], h["frames"] = t, h["frames"] + 1
        covered = sorted((h for h in cover_hits.values() if h["by"] != "caption" or h["frames"] >= 2), key=lambda h: h["from"])

        # Keep the old report field as an alias. No filename/area filter or two-sample minimum:
        # .png names used to be truncated to 40 chars, and narrow caption text missed side objects.
        under = [h for h in new_findings if h['kind'] == 'caption-band']

        # 8. objects pushed past the side margin: centre inside, but more than a quarter of the width beyond it
        #    (the safe check above only catches objects whose centre is outside). Includes faint K.bgObj figures.
        edge_hits = {}
        for t, f in frames:
            for it in f["items"]:
                if it["kind"] != "obj" or not it["txt"].endswith(".png"):
                    continue
                w = it["x1"] - it["x0"]
                lower = (it["y0"] + it["y1"]) / 2 > SAFE["upperBottom"]
                left, right = (SAFE["left"], SAFE["right"]) if lower else (SAFE["upperLeft"], SAFE["upperRight"])
                beyond = max(0, left - it["x0"]) + max(0, it["x1"] - right)
                cx = (it["x0"] + it["x1"]) / 2
                if w and left <= cx <= right and beyond > 0.25 * w:
                    h = edge_hits.setdefault(it["id"], {"what": it["txt"], "from": t, "to": t, "frames": 0})
                    h["to"], h["frames"] = t, h["frames"] + 1
        edge = sorted((h for h in edge_hits.values() if h["frames"] >= 3), key=lambda h: h["from"])

        report = {"project": proj.name, "look2": look2, "every": a.every, "voice_end": voice_end,
                  "safe": safe, "dead": dead, "thin": thin, "hook_late": hook, "first_fill": first_fill, "bars": bars,
                  "covered": covered, "under_captions": under, "edge": edge,
                  "fill_median": sorted(cov)[len(cov) // 2] if cov else 0}
        findings = legacy_findings(report, a.fill, a.hook) + new_findings
        if errors:
            findings.append(dict(kind='structure', t=0, why='page errors', detail=errors))
        allowances = []
        ok_file = proj / 'lint-ok.json'
        if ok_file.exists():
            try:
                allowances = json.loads(ok_file.read_text(encoding='utf-8'))
                if not isinstance(allowances, list):
                    raise ValueError('expected a list')
            except (ValueError, OSError) as exc:
                allowances = []
                findings.append(dict(kind='structure', t=0, why=f'invalid lint-ok.json: {exc}'))
        for h in findings:
            h['justified'] = justified(h, allowances)
        report['findings'] = findings
        report['unjustified'] = sum(not h['justified'] for h in findings)
        report['brief_every'] = step
        report['brief_end'] = scene_end
        (out_dir / "lint.json").write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")

        print(f"lint {proj.name}: look2={'on' if look2 else 'off'}, {len(frames)} frames to {voice_end:.1f}s, median fill {report['fill_median']:.0%}")
        print(f"  safe zones: {len(safe)} finding(s)")
        for h in safe[:25]:
            what = f"captions in {h['frames']} sampled frames" if h["kind"] == "caption" else h["what"]
            print(f"    {h['from']:6.2f}-{h['to']:6.2f}s  {h['kind']:7} {h['why']:20} {what}")
        print(f"  dead stretches > {a.dead}s: {dead or 'none'}")
        print(f"  thin frames (< {a.fill:.0%} of safe area for 1.5 s+): {('MUST FIX ' + str(thin)) if thin else 'none'}")
        hook_msg = 'first visual at %.2fs (later than %.1f s)' % (hook, a.hook) if hook is not None else 'ok'
        if first_fill < a.fill:
            hook_msg += f'; first frame only {first_fill:.0%} filled (want a complete composition: question + hero object)'
        print(f"  hook: {hook_msg}")
        print(f"  bars to scale: {len(bars) or 'ok'}{' finding(s)' if bars else ''}")
        for b in bars:
            at = f"{b['at']:6.2f}s" if isinstance(b["at"], (int, float)) else "     -"
            print(f"    {at}  {b['why']:22} {b['detail']}")
        print(f"  covered text: {len(covered) or 'none'}")
        for h in covered:
            print(f"    {h['from']:6.2f}-{h['to']:6.2f}s  '{h['what']}' under {h['by']}")
        print(f"  objects behind captions: {len(under) or 'none'}")
        for h in under:
            print(f"    {h['from']:6.2f}-{h['to']:6.2f}s  {h['what']}")
        print(f"  objects past the side margin: {len(edge) or 'none'}")
        for h in edge:
            print(f"    {h['from']:6.2f}-{h['to']:6.2f}s  {h['what']}")
        for kind in ('text-on-text', 'covered-shape', 'caption-band', 'brief', 'half-built-arrival', 'markup-crossing-text', 'structure'):
            hits = [h for h in new_findings if h['kind'] == kind]
            print(f'  {kind}: {len(hits)} finding(s)')
            for h in hits:
                print(f"    {h.get('t', h.get('from', 0)):6.2f}s  {h.get('what', h.get('board', ''))} "
                      f"{h.get('by', h.get('why', ''))}" + (f" ({h['duration']:.2f}s fully visible)" if 'duration' in h else ''))
        print(f"  unjustified: {report['unjustified']} / {len(findings)} (review flags{' / strict mode' if a.strict else ''})")

        shots = sorted({round(h["from"], 2) for h in safe if h["kind"] == "text"}
                       | {round(h["from"], 2) for h in covered + under + edge}
                       | {round((s + e) / 2, 2) for s, e in dead} | {round((s + e) / 2, 2) for s, e in thin})
        shots = sorted(set(shots) | {round(h.get('t', h.get('from', 0)), 2) for h in new_findings if h['kind'] != 'structure'})
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
    return 1 if a.strict and report['unjustified'] else 0


if __name__ == "__main__":
    from console import utf8
    utf8()
    sys.exit(main())
