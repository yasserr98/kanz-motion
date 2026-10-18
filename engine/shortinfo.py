"""What the engine knows about a short cut from a long video, shared by captions.py, lint.py and make.py.

A project is a cut-out short when its transcript.json has `cut_from` (written by engine/footage.py and
engine/footage_track.py). For those, build/timing.js also carries (only when the files exist, so finished projects
render as before):
  window.CUT     cut_from from transcript.json (ranges, last word, next source word)
  window.FACES   assets/faces.json (eyes-and-mouth box per frame; engine/faces.py)
  window.FREEZES assets/freezes.json (runs where the source picture stands still)
  window.TITLE   the reel's title from shorts/_titles.json: its edited `text`, else option `pick` (1-based; option 1
                 until Ahmed picks). K.title() with no text uses it, so the title is never copied by hand (SHORT-4).
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TITLES = ROOT / "shorts" / "_titles.json"
LATIN = re.compile(r"[A-Za-z]")


def load(path):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def cut_from(proj):
    tr = load(Path(proj) / "transcript.json") or {}
    return tr.get("cut_from")


def title_entry(slug, titles=None):
    data = load(TITLES) if titles is None else titles
    for key, r in ((data or {}).get("reels") or {}).items():
        if r.get("slug") == slug:
            return key, r
    return None, None


def title_text(entry):
    """The title Ahmed chose: his edited `text`, else option `pick` (1-based), option 1 until he picks."""
    if not entry:
        return None
    if entry.get("text"):
        return entry["text"]
    opts = entry.get("options") or []
    pick = entry.get("pick") or 1
    return opts[pick - 1] if 0 < pick <= len(opts) else None


def latin_words(tokens):
    """Shown caption words with Latin letters (SHORT-14: cut-out shorts subtitle in Egyptian Arabic)."""
    return [(t.get("start"), t["w"]) for t in tokens if not t.get("hid") and LATIN.search(t["w"])]


def extras_js(proj):
    """Lines appended to build/timing.js for a cut-out short; empty for every other project."""
    proj = Path(proj)
    cut = cut_from(proj)
    if not cut:
        return ""
    out = ["window.CUT=" + json.dumps(cut, ensure_ascii=False) + ";"]
    for name, file in (("FACES", "faces.json"), ("FREEZES", "freezes.json")):
        data = load(proj / "assets" / file)
        if data is not None:
            out.append(f"window.{name}=" + json.dumps(data, separators=(",", ":")) + ";")
    text = title_text(title_entry(proj.name)[1])
    if text:
        out.append("window.TITLE=" + json.dumps(text, ensure_ascii=False) + ";")
    return "\n".join(out) + "\n"
