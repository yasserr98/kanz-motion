"""Catch voice (TTS) failures before Ahmed hears them.

    python engine/voicecheck.py projects/<slug> --pre     # free: scan script.md for known clone failure patterns
    python engine/voicecheck.py projects/<slug>           # after tts: Scribe re-transcribes voice.wav and diffs it

--pre reads library/voice/lexicon.json "watch" patterns (lines that will be auto-respelled are listed too).
The post check writes out/voicecheck.json and prints only problems:
  WORD    the voice said something other than the script (wrong / missing / extra words)
  STUMBLE a word Scribe heard as hesitant or cut ("…"), or one held unusually long
  PAUSE   a paragraph break with < 0.3 s of silence, or any silence > 1.3 s
  FLAT    a script question that Scribe did not punctuate as a question (likely flat intonation)
  EAR     words Scribe is unsure of (confidence < 0.8): listen to these
Text checks cannot judge accent or tone; the EAR list says where to listen.
"""
import argparse
import difflib
from decimal import Decimal
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from captions import norm  # noqa: E402
from tts import LEXICON, apply_say, spoken_text  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")


SAME = {"انت": "انتا", "انتي": "انتا", "ومتين": "وميتين", "متين": "ميتين"}  # Scribe spells Egyptian "enta" the Standard way
MSA_NUM = re.compile("مائ|مئة|ملايين|آلاف")  # Standard Arabic number forms in an Egyptian script


def key(w):
    k = norm(w).translate(DIGITS) if w else ""
    return SAME.get(k, k)


NUMBERS = {
    "صفر": 0, "واحد": 1, "واحده": 1, "اتنين": 2, "اثنين": 2, "اثنان": 2,
    "تلاته": 3, "ثلاثه": 3, "اربعه": 4, "خمسه": 5, "سته": 6, "سبعه": 7,
    "تمانيه": 8, "ثمانيه": 8, "تسعه": 9, "عشره": 10, "عشر": 10,
    "حداشر": 11, "اتناشر": 12, "تلتاشر": 13, "اربعتاشر": 14, "خمستاشر": 15,
    "ستاشر": 16, "سبعتاشر": 17, "تمنتاشر": 18, "تسعتاشر": 19,
    "عشرين": 20, "عشرون": 20, "تلاتين": 30, "ثلاثين": 30, "ثلاثون": 30,
    "اربعين": 40, "اربعون": 40, "خمسين": 50, "خمسون": 50, "ستين": 60, "ستون": 60,
    "سبعين": 70, "سبعون": 70, "تمانين": 80, "ثمانين": 80, "ثمانون": 80, "تسعين": 90, "تسعون": 90,
    "ميه": 100, "مائه": 100, "مئه": 100, "ميتين": 200, "مائتين": 200, "مئتين": 200,
    "تلتميه": 300, "تلاتميه": 300, "ثلاثمائه": 300, "ربعمية": 400, "اربعمائه": 400,
    "خمسمية": 500, "خمسمائه": 500, "ستميه": 600, "ستمائه": 600,
    "سبعميه": 700, "سبعمائه": 700, "تمنميه": 800, "ثمانمائه": 800, "تسعميه": 900, "تسعمائه": 900,
}
NUMBERS = {key(k): v for k, v in NUMBERS.items()}
SCALES = {"الف": 1000, "الاف": 1000, "مليون": 1000000, "ملايين": 1000000}


def number_tokens(text):
    """Conservative number phrases; unknown words stay in the comparison."""
    out, total, group, active = [], 0, 0, False
    for raw in text.split():
        word = key(raw)
        joined = False
        if word.startswith("و") and word[1:] in (NUMBERS.keys() | SCALES.keys()):
            word, joined = word[1:], True
        if word in NUMBERS:
            value = NUMBERS[word]
            additive = joined and (group == 0 or (value < 100 and (
                group >= 100 or (group < 10 and value % 10 == 0) or (group % 10 == 0 and value < 10))))
            teen = not joined and value == 10 and 1 <= group <= 9 and total == 0
            if active and not (additive or teen):
                out.append(total + group)
                total, group = 0, 0
            group += value
            active = True
        elif word in SCALES:
            if active and group == 0:
                out.append(total)
                total, active = 0, False
            total += (group if active else 1) * SCALES[word]
            group, active = 0, True
        else:
            if active:
                out.append(total + group)
                total, group, active = 0, 0, False
            if re.fullmatch(r"[0-9]+(?:[.٫][0-9]+)?", word):
                out.append(Decimal(word.replace("٫", ".")))
            else:
                out.append(word)
    if active:
        out.append(total + group)
    return out


def merge_negation(asr):
    """Scribe writes Egyptian 'مبيخسرش' as 'ما بيخسرش': join them back."""
    out = []
    for w in asr:
        if out and key(out[-1]["w"]) in ("ما", "م") and key(w["w"]).endswith("ش") and key(w["w"])[:1] in "بتمي":
            out[-1] = {**w, "w": "م" + w["w"], "start": out[-1]["start"]}
        else:
            out.append(w)
    return out


def pre(proj):
    md = (proj / "script.md").read_text(encoding="utf-8")
    lex = json.loads(LEXICON.read_text(encoding="utf-8")) if LEXICON.exists() else {}
    body = spoken_text(md)
    n = 0
    for i, line in enumerate(body.splitlines(), 1):
        for r in lex.get("replace", []):
            if r["from"] in line:
                print(f"line {i}: auto-respelled for the voice: {r['from']!r} -> {r['to']!r}")
        for wch in lex.get("watch", []):
            for m in re.finditer(wch["re"], line):
                n += 1
                print(f"line {i}: {m.group(0).strip()!r}: {wch['why']}")
    print(f"{n} pattern(s) to consider; voice-only fixes go in {proj.name}/say.json")


def post(proj):
    wav = proj / "audio" / "voice.wav"
    asr_path = proj / "out" / "voicecheck-asr.json"
    asr_path.parent.mkdir(exist_ok=True)
    subprocess.run([sys.executable, str(ROOT / "engine" / "transcribe.py"), str(wav), str(asr_path)],
                   check=True, capture_output=True, text=True, encoding="utf-8")
    asr = merge_negation([w for s in json.loads(asr_path.read_text(encoding="utf-8"))["segments"] for w in s["words"]])
    if not asr:
        raise SystemExit("voice check: transcription returned no words; existing report kept")
    text = apply_say(spoken_text((proj / "script.md").read_text(encoding="utf-8")), proj)
    paras = [p.split() for p in text.split("\n\n") if p.strip()]
    script = [(w, pi, wi == len(p) - 1) for pi, p in enumerate(paras) for wi, w in enumerate(p)]
    a, b = [key(w) for w, _, _ in script], [key(w["w"]) for w in asr]
    found = []
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    at = {}
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                at[i1 + k] = j1 + k
            continue
        said = " ".join(w["w"] for w in asr[j1:j2])
        wrote = " ".join(w for w, _, _ in script[i1:i2])
        t = asr[j1]["start"] if j1 < len(asr) else asr[-1]["end"]
        expected, heard = number_tokens(wrote), number_tokens(said)
        if any(isinstance(x, (int, Decimal)) for x in expected):
            if MSA_NUM.search(said):
                found.append(("WORD", t, f"number {wrote!r} heard in Standard Arabic: {said!r}"))
            if expected == heard:
                continue
        found.append(("WORD", t, f"script {wrote!r} / heard {said!r}"))
    for i, (w, pi, last) in enumerate(script):
        j = at.get(i)
        if j is None:
            continue
        h = asr[j]
        dur, chars = h["end"] - h["start"], max(len(key(h["w"])), 1)
        if not re.search(r"\d", w.translate(DIGITS)) and not (last or w.endswith(":")) and ("…" in h["w"] or dur / chars > 0.28):
            found.append(("STUMBLE", h["start"], f"{w!r} held {dur:.2f}s"))
        if h.get("p", 1) < 0.8:
            found.append(("EAR", h["start"], f"{w!r} confidence {h['p']:.2f}"))
        if last and pi + 1 < len(paras) and j + 1 < len(asr):
            gap = asr[j + 1]["start"] - h["end"]
            if gap < 0.3:
                found.append(("PAUSE", h["end"], f"paragraph break after {w!r}: only {gap:.2f}s"))
        if w.endswith("؟") and not re.search(r"[؟?]", h["w"]):
            found.append(("FLAT", h["start"], f"{w!r} not heard as a question"))
    for x, y in zip(asr, asr[1:]):
        if y["start"] - x["end"] > 1.3:
            found.append(("PAUSE", x["end"], f"{y['start'] - x['end']:.2f}s silence after {x['w']!r}"))
    found.sort(key=lambda f: f[1])
    for kind, t, msg in found:
        print(f"{kind:8s}{int(t // 60)}:{t % 60:04.1f}  {msg}")
    print(f"{len(found)} finding(s) in {asr[-1]['end']:.1f}s of voice" if found else "voice check: clean")
    (proj / "out" / "voicecheck.json").write_text(
        json.dumps([{"kind": k, "t": round(t, 2), "msg": m} for k, t, m in found], ensure_ascii=False, indent=1),
        encoding="utf-8")


if __name__ == "__main__":
    from console import utf8
    utf8()
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--pre", action="store_true")
    a = ap.parse_args()
    (pre if a.pre else post)(Path(a.project).resolve())
