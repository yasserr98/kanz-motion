"""Use a take Ahmed picked from the test clips as one paragraph's voice (gamblers-fallacy v4, 2026-10-14).
Ahmed: "you still didnt change the word المُقامِر": the respelling regenerated the paragraph, but ElevenLabs gives a new
take every time, and that take still sounded wrong. This writes the chosen clip into audio/_tts/pNN.json (timed by
ElevenLabs forced alignment), keeping the paragraph's cache key, so make.py tts re-joins it like any cached paragraph.

Usage: python projects/gamblers-fallacy/use_take.py <pNN> <clip.mp3>
"""
import base64
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "engine"))
import eleven  # noqa: E402

PROJ = Path(__file__).parent


def main():
    para, clip = sys.argv[1], Path(sys.argv[2]).resolve()
    cache = PROJ / "audio" / "_tts" / f"{para}.json"
    old = json.loads(cache.read_text(encoding="utf-8"))
    al = old.get("alignment") or old["normalized_alignment"]
    text = "".join(al["characters"])  # exactly the text this paragraph is spoken from
    r = eleven.upload("/forced-alignment", {"text": text}, {"file": clip})
    chars = r["characters"]
    new = {
        "audio_base64": base64.b64encode(clip.read_bytes()).decode(),
        "alignment": {"characters": [c["text"] for c in chars],
                      "character_start_times_seconds": [c["start"] for c in chars],
                      "character_end_times_seconds": [c["end"] for c in chars]},
        "_sig": old["_sig"],
        "_take": {"clip": str(clip.relative_to(PROJ)), "why": "Ahmed's pick from the test clips (2026-10-14)"},
    }
    (cache.with_name(cache.stem + "-generated.json")).write_text(json.dumps(old), encoding="utf-8")
    cache.write_text(json.dumps(new), encoding="utf-8")
    print(f"{para}: {text}\n  <- {clip.name}, {len(chars)} characters aligned (generated take kept as {para}-generated.json)")


if __name__ == "__main__":
    main()
