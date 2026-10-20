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
import hashlib
import json
import math
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


def defaults_profile(proj):
    """Literal K.pace defaults profile; comments and strings containing fake calls do not opt a legacy scene in."""
    path = Path(proj) / "scene.js"
    if not path.exists():
        return ""
    source = path.read_text(encoding="utf-8")
    tokens = re.findall(r'//[^\n]*|/\*[\s\S]*?\*/|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|`(?:\\.|[^`\\])*`|[\s\S]', source)
    code = "".join(" " * len(t) if t.startswith(("//", "/*", '"', "'", "`")) else t for t in tokens)
    profiles = []
    for m in re.finditer(r"\bK\s*\.\s*pace\s*\(\s*\{([^}]*?)\}", code):
        opts = source[m.start(1):m.end(1)]
        opts = re.sub(r"//[^\n]*|/\*[\s\S]*?\*/", "", opts)
        p = re.search(r'\bdefaults\s*:\s*["\'](\d{4}-\d\d-\d\d)["\']', opts)
        if p:
            profiles.append(p[1])
    return max(profiles, default="")


def metadata_findings(proj, profile=None):
    """SHORT-4/17: new cut-out shorts require face/freeze metadata. Legacy scenes explicitly remain optional."""
    proj = Path(proj)
    profile = defaults_profile(proj) if profile is None else profile
    if not cut_from(proj) or profile < "2026-10-18":
        return []
    out = []
    for name in ("faces", "freezes"):
        data = load(proj / "assets" / f"{name}.json")
        valid = isinstance(data, dict) and isinstance(data.get("fps"), (int, float)) and math.isfinite(data["fps"]) and data["fps"] > 0
        if valid and name == "faces":
            face = data.get("face")
            boxes = face.get("boxes") if isinstance(face, dict) else None
            valid = isinstance(boxes, list) and any(boxes) and all(b is None or (
                isinstance(b, list) and len(b) == 4 and all(isinstance(v, (int, float)) and math.isfinite(v) for v in b)
                and b[0] < b[2] and b[1] < b[3]) for b in boxes)
        elif valid:
            runs = data.get("runs")
            valid = isinstance(runs, list) and all(isinstance(r, list) and len(r) == 2 and
                all(isinstance(v, (int, float)) and math.isfinite(v) for v in r) and 0 <= r[0] < r[1] for r in runs)
        if not valid:
            out.append(dict(kind="short-metadata", t=0,
                            why=f"missing or invalid assets/{name}.json: run engine/faces.py for this new short (SHORT-4/17)"))
    return out


def review_stamp(proj):
    """Bind the ship review to its scene, timing, metadata and checker/runtime versions, without private paths."""
    proj = Path(proj)
    paths = ["scene.js", "index.html", "transcript.json", "build/timing.js", "assets/faces.json", "assets/freezes.json"]
    digest = hashlib.sha256()
    for base, names in ((proj, paths), (ROOT, ["engine/lint.py", "engine/guards.py", "engine/shortinfo.py"] +
                        sorted(p.relative_to(ROOT).as_posix() for p in (ROOT / "runtime").glob("*") if p.is_file()))):
        for name in names:
            path = base / name
            digest.update(name.encode())
            digest.update(path.read_bytes() if path.is_file() else b"<missing>")
    return {"version": 1, "sha256": digest.hexdigest()}


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
    problems = metadata_findings(proj)
    if problems:
        out.append("window.SHORT_METADATA_FINDINGS=" + json.dumps(problems) + ";")
    for name, file in (("FACES", "faces.json"), ("FREEZES", "freezes.json")):
        data = load(proj / "assets" / file)
        if data is not None:
            out.append(f"window.{name}=" + json.dumps(data, separators=(",", ":")) + ";")
    text = title_text(title_entry(proj.name)[1])
    if text:
        out.append("window.TITLE=" + json.dumps(text, ensure_ascii=False) + ";")
    return "\n".join(out) + "\n"
