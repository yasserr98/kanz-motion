"""Generate a sound effect from a text prompt (ElevenLabs) and add it to the SFX library.

    python engine/sfx_gen.py <new-category> <name> "<English prompt>" [--seconds 1.5] [--takes 3] [--influence 0.5]

Writes library/sfx/<category>/<name>-NN.wav (trimmed, faded, peak-normalised like the CC0 hits),
records each file with its prompt in library/sfx/generated.json and appends it to manifest.json, so
K.sfx(t, "<category>") can use it immediately. sfx_library.py merges generated.json back in when it
rebuilds. Licence: generated on the paid ElevenLabs plan, which grants commercial use; keep the
record so the source of every sound stays traceable. Several takes give choice; delete the weak ones
from both JSON files (or rerun with a better prompt). No music: this is for one-shot effects.
"""
import argparse
import datetime
import json

import eleven
from sfx_library import OUT, SOURCES, KENNEY, decode, finish, write

GEN = OUT / "generated.json"
LICENCE = "ElevenLabs sound effects, generated on a paid plan (commercial use)"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("category")
    ap.add_argument("name")
    ap.add_argument("prompt")
    ap.add_argument("--seconds", type=float, default=1.5)
    ap.add_argument("--takes", type=int, default=2)
    ap.add_argument("--influence", type=float, default=0.5, help="0-1: how literally to follow the prompt")
    a = ap.parse_args()
    gen = json.loads(GEN.read_text(encoding="utf-8")) if GEN.exists() else []
    man = json.loads((OUT / "manifest.json").read_text(encoding="utf-8"))
    taken = {m["file"] for m in man} | {g["file"] for g in gen}
    categories = {m["category"] for m in man + gen} | {s[0] for s in SOURCES + KENNEY}
    if a.category in categories or (OUT / a.category).exists():
        raise SystemExit(f'"{a.category}" is an existing category; always use a new category')
    (OUT / "raw" / "generated").mkdir(parents=True, exist_ok=True)
    for _ in range(a.takes):
        k = 1
        while f"{a.category}/{a.name}-{k:02d}.wav" in taken:
            k += 1
        rel = f"{a.category}/{a.name}-{k:02d}.wav"
        mp3 = OUT / "raw" / "generated" / rel.replace("/", "_").replace(".wav", ".mp3")
        mp3.write_bytes(eleven.json_call("/sound-generation", {"text": a.prompt, "duration_seconds": a.seconds,
                                                                "prompt_influence": a.influence}, raw=True))
        write(OUT / rel, finish(decode(mp3), a.seconds + 0.2))
        entry = {"file": rel, "category": a.category, "source_file": mp3.name, "source_page": "https://elevenlabs.io/sound-effects",
                 "license": LICENCE, "author": "ElevenLabs (generated)", "prompt": a.prompt, "seconds": a.seconds,
                 "created": datetime.date.today().isoformat()}
        gen.append(entry); man.append(entry); taken.add(rel)
        print("->", OUT / rel)
    GEN.write_text(json.dumps(gen, indent=1, ensure_ascii=False), encoding="utf-8")
    (OUT / "manifest.json").write_text(json.dumps(man, indent=1, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    from console import utf8
    utf8()
    main()
