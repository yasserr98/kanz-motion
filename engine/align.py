"""Time the corrected script word by word against the final voice (ElevenLabs forced alignment).

    python engine/align.py <project_dir> [--force]

Sends audio/voice.wav and the spoken text of script.md (between the caption markers, *marks*
removed) to /v1/forced-alignment and writes <project>/transcript.aligned.json in the transcript
format, with every script word in order. captions.py prefers it over transcript.json, so captions
follow the exact script instead of ASR guesses. Skipped (no API call) when the script and voice
are unchanged since the last alignment, or when the voice came from ElevenLabs TTS (already exact).
"""
import argparse
import hashlib
import json
import re
import sys
import subprocess
from pathlib import Path

import eleven
from provenance import current, stamp


def caption_body(md):
    """The text between the caption markers; a clear stop instead of an IndexError when they are missing."""
    if "<!-- captions:start -->" not in md or "<!-- captions:end -->" not in md:
        sys.exit("script.md has no <!-- captions:start --> / <!-- captions:end --> markers: put the caption text "
                 "between them (make.py script and make.py audio write a stub with both)")
    return md.split("<!-- captions:start -->")[1].split("<!-- captions:end -->")[0]


def spoken_text(md):
    """What the voice says. A line `Arabic translation {{English he speaks}}` (SHORT-14) is aligned on the English."""
    body = re.sub(r"^.*?\{\{(.*?)\}\}[ \t]*$", r"\1", caption_body(md), flags=re.M)
    return re.sub(r"\n{3,}", "\n\n", body.replace("*", "").strip())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    proj = Path(a.project).resolve()
    voice, out = proj / "audio" / "voice.wav", proj / "transcript.aligned.json"
    tr = proj / "transcript.json"
    if not voice.exists() or not (proj / "script.md").exists():
        sys.exit(f"align needs {voice} and script.md")
    text = spoken_text((proj / "script.md").read_text(encoding="utf-8"))
    if tr.exists():
        data = json.loads(tr.read_text(encoding="utf-8"))
        if data.get("source") == "elevenlabs" and current(data, voice, "TTS transcript", text):
            print("voice is ElevenLabs TTS: its timings are already exact, no alignment needed")
            return
    digest = hashlib.sha256(voice.read_bytes() + text.encode()).hexdigest()
    if out.exists() and not a.force and json.loads(out.read_text(encoding="utf-8")).get("sha256") == digest:
        current(json.loads(out.read_text(encoding="utf-8")), voice, out.name, text)
        print("alignment up to date")
        return
    if out.exists():
        print("alignment changed or forced; regenerating from current voice and script")
    r = eleven.upload("/forced-alignment", {"text": text}, {"file": voice})
    words = [{"w": w["text"].strip(), "start": round(w["start"], 3), "end": round(w["end"], 3),
              "p": round(max(0.0, 1 - w.get("loss", 0)), 3)}
             for w in r["words"] if w["text"].strip()]
    if not words:
        sys.exit("alignment returned no words; existing outputs kept")
    if tr.exists() and current(data, voice, "transcript.json"):
        dur = data["duration"]
    else:
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                    "-of", "csv=p=0", str(voice)], capture_output=True, text=True,
                                   encoding="utf-8", check=True).stdout)
    out.write_text(json.dumps({"source": voice.name, "sha256": digest, **stamp(voice, text), "engine": "elevenlabs-forced-alignment",
                               "loss": round(r.get("loss", 0), 4), "duration": dur,
                               "segments": [{"start": words[0]["start"], "end": words[-1]["end"], "text": text,
                                             "words": words}]}, ensure_ascii=False, indent=1), encoding="utf-8")
    # words fitting far worse than the rest (mean + 2 sd of loss): usually digits written differently from
    # how they are spoken, or script words the voice does not say. Check their captions.
    loss = [1 - w["p"] for w in words]
    m = sum(loss) / len(loss)
    sd = (sum((x - m) ** 2 for x in loss) / len(loss)) ** 0.5
    shaky = [w for w, x in zip(words, loss) if x > m + 2 * sd]
    print(f"aligned {len(words)} script words (loss {r.get('loss', 0):.3f}); check these captions: "
          + (", ".join(f"{w['w']}@{w['start']:.1f}s" for w in shaky[:15]) or "none"))


if __name__ == "__main__":
    from console import utf8
    utf8()
    main()
