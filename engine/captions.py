"""Align the corrected script to the voice's word timings and cut it into caption chunks.

    python engine/captions.py <project_dir>

Inputs:  <project>/script.md (text between <!-- captions:start/end -->, *keyword* marks)
         <project>/transcript.json (word timings of the final edited voice)
Output:  <project>/build/timing.js  ->  window.TOKENS (every script word with start/end)
                                       window.CAPTIONS (chunks of <= 4 words / 24 chars)
         and, for a short cut from a long video, window.CUT / FACES / FREEZES / TITLE (engine/shortinfo.py).
A cut-out short whose shown captions contain Latin letters fails (exit 1, outputs written): SHORT-14, subtitles are
Egyptian Arabic even where he speaks English; write the line as `Arabic translation {{English he says}}`.

Alignment uses difflib on normalised Arabic tokens; script words the recogniser missed get
times interpolated from their neighbours.
"""
import difflib
import json
import re
import sys
from pathlib import Path

from align import caption_body, spoken_text
from provenance import current, stamp
import shortinfo

PUNCT = "،؟?!.,:؛\"«»()…"


def norm(t):
    t = re.sub(r"[ً-ْـ*]", "", t)  # harakat, tatweel, keyword marks
    t = t.strip(PUNCT + " ")
    t = re.sub("[إأآ]", "ا", t).replace("ى", "ي").replace("ة", "ه")
    t = t.replace("%", "").replace("٪", "")
    t = re.sub(r"^(فال|وال|بال|لل|ال)(?=\d)", "", t)
    return t


TRANS = re.compile(r"^(.*?)\s*\{\{(.*?)\}\}\s*$")


def script_tokens(md):
    """Caption tokens. A line `Arabic translation {{what he actually says}}` (SHORT-14: subtitles are Egyptian Arabic
    even where he speaks English) is timed on the spoken words: those become hidden tokens (hid) for the aligner and for
    K.T(), the translation words (tr) are spread over their span and are the only ones shown."""
    body = caption_body(md)
    toks = []
    for n, line in enumerate(l.strip() for l in body.strip().splitlines() if l.strip()):
        m = TRANS.match(line)
        if m:
            for w in m.group(2).split():
                toks.append({"w": w, "key": False, "eol": False, "hid": True, "line": n})
            line = m.group(1)
        words = line.split()
        for i, w in enumerate(words):
            key = "*" in w
            t = {"w": w.replace("*", ""), "key": key, "eol": i == len(words) - 1}
            if m:
                t["tr"], t["line"] = True, n
            toks.append(t)
    return toks


def main(proj):
    proj = Path(proj)
    toks = script_tokens((proj / "script.md").read_text(encoding="utf-8"))
    tr = json.loads((proj / "transcript.json").read_text(encoding="utf-8"))
    aligned = proj / "transcript.aligned.json"  # engine/align.py: the script itself, timed against the voice
    voice = proj / "audio" / "voice.wav"
    text = spoken_text((proj / "script.md").read_text(encoding="utf-8"))
    timing = None
    if aligned.exists():
        data = json.loads(aligned.read_text(encoding="utf-8"))
        if current(data, voice, aligned.name, text):
            timing = data
    if timing is None:
        if not current(tr, voice, "transcript.json"):
            sys.exit("no current timings: re-transcribe or align the current voice; existing outputs kept")
        timing = tr
    asr = [w for s in timing["segments"] for w in s["words"] if norm(w["w"])]
    if not asr or not toks:
        sys.exit("captions need nonempty script and word timings; existing outputs kept")
    core = [t for t in toks if not t.get("tr")]
    a = [norm(t["w"]) for t in core]
    b = [norm(w["w"]) for w in asr]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    times = [None] * len(core)
    for blk in sm.get_opcodes():
        tag, i1, i2, j1, j2 = blk
        if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
            for k in range(i2 - i1):
                times[i1 + k] = (asr[j1 + k]["start"], asr[j1 + k]["end"])
    matched = sum(t is not None for t in times)
    # interpolate gaps
    for i, t in enumerate(times):
        if t is None:
            prev = next((times[j][1] for j in range(i - 1, -1, -1) if times[j]), 0.0)
            nxt_i = next((j for j in range(i + 1, len(times)) if times[j]), None)
            nxt = times[nxt_i][0] if nxt_i is not None else prev + 0.4
            span = (nxt_i - i + 1) if nxt_i is not None else 1
            step = (nxt - prev) / span
            times[i] = (prev, prev + step)
    for t, (s, e) in zip(core, times):
        t["start"], t["end"] = round(s, 3), round(e, 3)
    for ln in {t["line"] for t in toks if t.get("tr")}:  # translation words spread over the spoken span
        sp = [t for t in core if t.get("hid") and t["line"] == ln]
        tr_ = [t for t in toks if t.get("tr") and t["line"] == ln]
        a0, b0 = sp[0]["start"], sp[-1]["end"]
        step = (b0 - a0) / len(tr_)
        for i, t in enumerate(tr_):
            t["start"], t["end"] = round(a0 + i * step, 3), round(a0 + (i + 1) * step, 3)

    chunks, cur = [], []
    for t in (x for x in toks if not x.get("hid")):
        cur.append(t)
        text = " ".join(x["w"] for x in cur)
        if t["eol"] or t["w"][-1] in "،,؟?:." or len(cur) >= 4 or len(text) >= 24:
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    caps = []
    for i, c in enumerate(chunks):
        start = c[0]["start"]
        end = chunks[i + 1][0]["start"] if i + 1 < len(chunks) else c[-1]["end"] + 0.6
        caps.append({"start": round(start, 3), "end": round(min(end, c[-1]["end"] + 0.9), 3),
                     "words": [{"w": x["w"], "key": x["key"]} for x in c]})
    out = proj / "build"
    out.mkdir(exist_ok=True)
    (out / "timing.js").write_text(
        "window.TOKENS=" + json.dumps(toks, ensure_ascii=False) + ";\nwindow.CAPTIONS=" +
        json.dumps(caps, ensure_ascii=False) + ";\nwindow.DURATION=" + str(timing["duration"]) + ";\n" + shortinfo.extras_js(proj),
        encoding="utf-8")
    if voice.exists():
        (out / "timing.provenance.json").write_text(json.dumps(stamp(voice, text)), encoding="utf-8")
    print(f"{len(toks)} script words, {matched} matched to the voice, {len(caps)} caption chunks, {timing['duration']:.1f}s")
    latin = shortinfo.latin_words(toks) if shortinfo.cut_from(proj) else []
    if latin:
        sys.exit("SHORT-14: subtitles of a cut-out short are Egyptian Arabic; Latin words shown: "
                 + ", ".join(f"{w} ({t:.1f}s)" for t, w in latin[:12])
                 + ". Write each line as `Arabic translation {{English he says}}` in script.md.")


if __name__ == "__main__":
    from console import utf8
    utf8()
    main(sys.argv[1])
