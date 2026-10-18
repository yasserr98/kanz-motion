"""Checks that turn Ahmed's recurring review notes into failures (review hardening, 2026-10-18).

Pure functions over data the lint page or the MP4 already gave: lint.py and make.py call them; tests call them with
made-up data. Each docstring names the note it stops coming back.
"""
import re

TITLE_END = 3.0        # s: the opening title window (SHORT-4)
EMPTY_LIMIT = 1.5      # s: an empty stretch longer than this outside the title window cannot be excused (P1-7)
SFX_GAP = 0.3          # s: cues closer than this stack (SND-5)
SFX_REACH = 0.25       # s: a cue this far from any visual event lands on nothing
FREEZE_SHOWN = 0.12    # s (3 frames) of a freeze inside a face/split window is visible
FACE_SHARE = 0.5       # workshop shorts: his face on screen at least this share of the runtime (SHORT-15)
WORD_EDGE = 0.03       # s: a cut this far inside a word is a cut in the word (SHORT-16)


def overlap(a, b):
    return max(0.0, min(a[1], b[1]) - max(a[0], b[0]))


def box_hit(r, box):
    """Area of rectangle r (dict x0..y1) inside box [x0, y0, x1, y1]."""
    return max(0, min(r["x1"], box[2]) - max(r["x0"], box[0])) * max(0, min(r["y1"], box[3]) - max(r["y0"], box[1]))


# ---------- lint: frames from the page ----------

def on_face_findings(t, frame, box):
    """Text drawn over his eyes or mouth (`on-face`): the title over his eyes (casino A, C, E, G, H)."""
    if not box:
        return []
    out = []
    for it in frame["items"]:
        if it["kind"] not in ("text", "caption", "title") or it.get("opacity", 1) < .5 or not it.get("over_face", it["kind"] != "text"):
            continue
        area = (it["x1"] - it["x0"]) * (it["y1"] - it["y0"])
        if area and box_hit(it, box) > 0.02 * area:
            out.append(dict(kind="on-face", t=t, id=it["id"], what=it["txt"][:40], by=it["kind"]))
    return out


def freeze_findings(face_windows, split_windows, runs, min_shown=FREEZE_SHOWN):
    """Face or split windows showing a source freeze (`freeze`): live C's "lag"."""
    out = []
    for kind, wins in (("face", face_windows), ("split", split_windows)):
        for w in wins or []:
            for r in runs or []:
                ov = overlap((w[0], w[1]), r)
                if ov >= min_shown:
                    out.append({"kind": "freeze", "from": round(max(w[0], r[0]), 3), "to": round(min(w[1], r[1]), 3),
                                "why": f"{kind} window {w[0]:.2f}-{w[1]:.2f} shows a frozen source picture {r[0]:.2f}-{r[1]:.2f} s"})
    return out


def outside_title(start, end, title_end=TITLE_END):
    return max(0.0, end - max(start, title_end))


def excusable(finding, title_end=TITLE_END, limit=EMPTY_LIMIT):
    """lint-ok.json may not excuse an empty stretch (dead / fill) over `limit` s outside the title window (P1-7:
    "empty seconds on screen" kept coming back as justified findings)."""
    if finding.get("kind") not in ("dead", "fill"):
        return True
    return outside_title(finding.get("from", 0), finding.get("to", 0), title_end) <= limit


def tight_gap_findings(t, frame, gap):
    """A subheadline closer than `gap` px under its headline on the same board (`tight-gap`): "breathing room" on
    casino C and F."""
    items = [i for i in frame["items"] if i["kind"] == "text" and i.get("opacity", 1) >= .5 and i["txt"]]
    heads = [i for i in items if i.get("head")]
    out = []
    for h in heads:
        for s in items:
            if s is h or s.get("head") or s.get("board") != h.get("board"):
                continue
            if min(h["x1"], s["x1"]) - max(h["x0"], s["x0"]) <= 0.3 * min(h["x1"] - h["x0"], s["x1"] - s["x0"]):
                continue
            d = (s["y0"] - h["y1"]) / (h.get("sc") or 1)  # in board px: the split shows the board at 0.8x
            if -0.25 * (s["y1"] - s["y0"]) / (h.get("sc") or 1) < d < gap - 0.5:
                out.append(dict(kind="tight-gap", t=t, id=s["id"], what=s["txt"][:30], by=h["txt"][:30],
                                why=f"{max(d, 0):.0f} px under the headline < {gap:.0f} px"))
    return out


CURRENCY_OK = re.compile(r"\$[⁦‎]?[\d٠-٩]")


def currency_findings(t, frame):
    """A $ not attached on the left of its digits (`stray-currency`): casino E 39.8 s, reported fixed, still wrong.
    `pos` (from the page) says where the $ glyph really landed relative to its number."""
    out = []
    for it in frame["items"]:
        if it["kind"] not in ("text", "caption", "title") or "$" not in it["txt"] or it.get("opacity", 1) < .5:
            continue
        txt = it["txt"]
        bad = [m.start() for m in re.finditer(r"\$", txt) if not CURRENCY_OK.match(txt, m.start())]
        why = "a $ not followed by its digits (use K.money)" if bad else None
        pos = it.get("currency")
        if not why and pos and not pos.get("ok", True):
            why = f"the $ renders {pos.get('where', 'away from its digits')} (use K.money)"
        if why:
            out.append(dict(kind="stray-currency", t=t, id=it["id"], what=txt[:40], why=why))
    return out


def sfx_findings(cues, events, gap=SFX_GAP, reach=SFX_REACH):
    """Cues within `gap` s of each other (`sfx-overlap`; the mixer drops one, so it should not be written) and cues
    more than `reach` s from any visual event (`sfx-orphan`). Effects stacking: Ahmed 2026-10-18."""
    out = []
    cs = sorted(cues, key=lambda c: c["t"])
    for a, b in zip(cs, cs[1:]):
        if b["t"] - a["t"] < gap - 1e-6:
            out.append(dict(kind="sfx-overlap", t=round(b["t"], 3), what=f"{a['cat']} {a['t']:.2f}s + {b['cat']} {b['t']:.2f}s",
                            why=f"{b['t'] - a['t']:.2f} s apart < {gap} s"))
    ev = sorted(events)
    for c in cs:
        near = min((abs(e - c["t"]) for e in ev), default=1e9)
        if near > reach:
            out.append(dict(kind="sfx-orphan", t=round(c["t"], 3), what=c["cat"],
                            why=f"no visual event within {reach} s (nearest {near:.2f} s)" if near < 1e8 else "no visual event"))
    return out


def face_share(face_windows, split_windows, duration):
    shown = sum(max(0.0, min(b, duration) - a) for a, b, *_ in (face_windows or [])) + \
            sum(max(0.0, min(b, duration) - a) for a, b, *_ in (split_windows or []))
    return shown / duration if duration else 0.0


def face_share_findings(face_windows, split_windows, duration, live, share=FACE_SHARE):
    """Workshop shorts: his face (full or in the split) at least half the runtime (`face-share`, SHORT-15; live F:
    "show Ahmed's face more and less animation")."""
    if not live:
        return []
    got = face_share(face_windows, split_windows, duration)
    if got + 1e-6 >= share:
        return []
    return [dict(kind="face-share", t=0, why=f"his face shows {got:.0%} of {duration:.1f} s < {share:.0%} (SHORT-15)")]


def window_edges(face_windows, split_windows, duration):
    """Every time the picture changes between face, split and board."""
    edges = set()
    for a, b, *_ in list(face_windows or []) + list(split_windows or []):
        for x in (a, b):
            if 0.05 < x < duration - 0.05:
                edges.add(round(x, 3))
    return sorted(edges)


def mid_word_findings(edges, words, edge=WORD_EDGE):
    """A cut or split move inside a spoken word (`mid-word-cut`, SHORT-16)."""
    out = []
    for x in edges:
        for w in words:
            if w["start"] + edge < x < w["end"] - edge:
                out.append(dict(kind="mid-word-cut", t=x, what=w["w"], why=f"cut at {x:.2f} s inside a word {w['start']:.2f}-{w['end']:.2f}"))
                break
    return out


def end_cut_findings(duration, voice_end, cut):
    """The scene ends before the voice does (`end-cut`): the last word cut off (casino A v4, F v3, H v2, E v4)."""
    if cut and duration < voice_end - 0.05:
        return [dict(kind="end-cut", t=round(duration, 3), why=f"K.duration {duration:.2f} s < voice {voice_end:.2f} s")]
    return []


def caption_switch_findings(samples):
    """Subtitles on the seam exactly when the split shows (`caption-switch`, SHORT-12). samples: [(t, split_shown,
    caption_top_px or None)]."""
    out = []
    for t, shown, top in samples:
        on_seam = top is not None and 940 <= top <= 980
        if shown != on_seam:
            out.append(dict(kind="caption-switch", t=t, why=f"split {'on' if shown else 'off'} but subtitles at {top}"))
    return out


# ---------- ship: the MP4 and the source ----------

def env_db(x, win):
    import numpy as np
    x = np.asarray(x, dtype=np.float64)
    if len(x) < win:
        return np.array([-120.0])
    c = np.cumsum(np.concatenate([[0.0], x * x]))
    p = (c[win:] - c[:-win]) / win
    return 10 * np.log10(np.maximum(p, 1e-12))


def ending_problems(mono, sr, last=0.15, margin=6.0):
    """Voice still sounding in the final `last` s of the MP4 (the last word cut off): the loudest 20 ms there must stay
    within `margin` dB of the room-tone floor (the 10th percentile of 20 ms levels over the file)."""
    import numpy as np
    win = int(0.02 * sr)
    lv = env_db(mono, win)
    floor = float(np.percentile(lv, 10))
    tail = env_db(mono[-int(last * sr) - win:], win)
    peak = float(tail.max())
    if peak > floor + margin:
        return [f"voice still sounding in the last {last} s ({peak:.0f} dB, room tone {floor:.0f} dB): the last word is cut off"]
    return []


def leak_problems(cut, gap=0.0):
    """No part of the next source sentence inside the short: every range stops before the next source word."""
    out = []
    for r in (cut or {}).get("ranges", []):
        nxt = r.get("next_word_start")
        if nxt is not None and r["end"] > nxt - gap + 1e-6:
            out.append(f"range {r['start']:.2f}-{r['end']:.2f} runs {r['end'] - nxt:.2f} s into the next source word ({nxt:.2f} s)")
        if r["end"] < r["last_word_end"] - 1e-6:
            out.append(f"range {r['start']:.2f}-{r['end']:.2f} ends before its last word ({r['last_word_end']:.2f} s)")
    return out


def decimate_runs(flags, fps):
    """From mpdecimate's keep/drop sequence (True = drop, a repeat of the frame before): (drops, longest run in s)."""
    longest = cur = 0
    for f in flags:
        cur = cur + 1 if f else 0
        longest = max(longest, cur)
    return sum(flags), (longest + 1) / fps if longest else 0.0


def fps_problems(source_fps, frames_fps, render_fps):
    out = []
    if frames_fps and abs(frames_fps - render_fps) > 0.01:
        out.append(f"footage frames are {frames_fps:g} fps but the render runs at {render_fps:g} fps (frames skip or repeat)")
    warn = None
    if source_fps and render_fps and abs(source_fps / render_fps - round(source_fps / render_fps)) > 0.02:
        warn = (f"source is {source_fps:.3g} fps, the render {render_fps:g} fps: ffmpeg drops frames unevenly (a slight "
                f"judder on fast moves)")
    return out, warn


CHARCOAL = 22   # grey level of the charcoal board


def frame_stats(g):
    """(mean, spread, content) of a small grey frame; content = share of pixels well away from the charcoal board."""
    import numpy as np
    g = np.asarray(g, dtype=np.float32)
    return float(g.mean()), float(g.std()), float((np.abs(g - CHARCOAL) > 30).mean())


def strip_flags(frames, cut_index, fps=24, charcoal=(52, 7.0), flash=55, big=28.0, small=10.0):
    """Frames around one cut (small grey arrays, the cut between cut_index - 1 and cut_index). Flags (SHORT-10):
      charcoal   near-empty charcoal (mean < 52, spread < 7): the cut landed before the board was built
      flash      a frame `flash` levels brighter than both neighbours
      half-built the first frame after the cut has under half the content the board has 0.25 s later
      one-frame  a single frame unlike both neighbours while they match each other (a wrong board for one frame)
    Returns [(flag, index), ...]."""
    import numpy as np
    st = [frame_stats(f) for f in frames]
    flags = []
    for i, (m, s, c) in enumerate(st):
        if m < charcoal[0] and s < charcoal[1]:
            flags.append(("charcoal", i))
        if 0 < i < len(st) - 1 and m - st[i - 1][0] > flash and m - st[i + 1][0] > flash:
            flags.append(("flash", i))
    later = min(len(st) - 1, cut_index + int(0.25 * fps))
    if cut_index < len(st) and st[later][2] > 0.08 and st[cut_index][2] < 0.5 * st[later][2]:
        flags.append(("half-built", cut_index))
    d = lambda i, j: float(np.abs(np.asarray(frames[i], np.float32) - np.asarray(frames[j], np.float32)).mean())
    for k in range(1, len(frames) - 1):
        if d(k - 1, k) > big and d(k, k + 1) > big and d(k - 1, k + 1) < small:
            flags.append(("one-frame", k))
    return flags


def track_jumps(cx, windows, fps, limit=6.0, seams=()):
    """Face-track jumps inside face/split windows: a camera step over `limit` source px per frame (SHORT-10). `seams`
    are frame indices where the picture cuts on purpose (voice joins, tighten_footage cuts)."""
    out, skip = [], {int(x) for x in seams}
    for a, b, *_ in windows or []:
        i0, i1 = int(a * fps), min(len(cx) - 1, int(b * fps))
        steps = [0.0 if i + 1 in skip else abs(cx[i + 1] - cx[i]) for i in range(i0, i1)]
        if steps and max(steps) > limit:
            k = i0 + steps.index(max(steps))
            out.append(f"face track jumps {max(steps):.1f} px at {k / fps:.2f} s")
    return out
