"""Generate the voice with ElevenLabs and write word timings in the engine's transcript format.

    python engine/tts.py <project_dir> [--voice VOICE_ID] [--model MODEL_ID] [--speed 1.0] [--sample]
    python engine/tts.py --list-models | --list-voices

Reads ELEVENLABS_API_KEY (and optionally ELEVENLABS_VOICE_ID) from kanz-motion/.env.
Text = the caption block of <project>/script.md with *keyword* marks removed; blank lines
become paragraph pauses. Uses the /with-timestamps endpoint, so every character comes back with
start/end times; words are rebuilt from those, so captions.py works exactly as for a voice note.
Outputs <project>/audio/voice.wav (loudness-normalised) and <project>/transcript.json.
--sample renders only the first two paragraphs to audio/sample-<speed>.wav for choosing a voice/speed.
--model defaults to the newest model id containing "v4" that the account can use.
"""
import argparse
import base64
import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = "https://api.elevenlabs.io/v1"


def env():
    vals = {}
    f = ROOT / ".env"
    if f.exists():
        for line in f.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                vals[k.strip()] = v.strip()
    return vals


def call(path, key, body=None):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body else None,
                                 headers={"xi-api-key": key, "Content-Type": "application/json"},
                                 method="POST" if body else "GET")
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.loads(r.read())


def pick_model(key):
    models = call("/models", key)
    ids = [m["model_id"] for m in models if m.get("can_do_text_to_speech", True)]
    v4 = [i for i in ids if "v4" in i and "turbo" not in i and "flash" not in i] or [i for i in ids if "v4" in i]
    if not v4:
        sys.exit("No v4 model on this account. Models: " + ", ".join(ids))
    return v4[0]


def spoken_text(md):
    body = md.split("<!-- captions:start -->")[1].split("<!-- captions:end -->")[0]
    return re.sub(r"\n{3,}", "\n\n", body.replace("*", "").strip())


def words_from_alignment(al):
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    words, cur = [], None
    for c, s, e in zip(chars, st, en):
        if c.isspace():
            if cur:
                words.append(cur)
            cur = None
            continue
        if cur is None:
            cur = {"w": "", "start": s, "end": e, "p": 1.0}
        cur["w"] += c
        cur["end"] = e
    if cur:
        words.append(cur)
    return [{**w, "start": round(w["start"], 3), "end": round(w["end"], 3)} for w in words]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project", nargs="?")
    ap.add_argument("--voice")
    ap.add_argument("--model")
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--stability", type=float, default=0.5)
    ap.add_argument("--sample", action="store_true")
    ap.add_argument("--list-models", action="store_true")
    ap.add_argument("--list-voices", action="store_true")
    a = ap.parse_args()
    e = env()
    key = e.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("Add ELEVENLABS_API_KEY=... to kanz-motion/.env (see .env.example)")
    if a.list_models:
        for m in call("/models", key):
            print(m["model_id"], "|", m.get("name"), "| languages:", len(m.get("languages", [])))
        return
    if a.list_voices:
        for v in call("/voices", key)["voices"]:
            print(v["voice_id"], "|", v["name"], "|", v.get("category"), "|", json.dumps(v.get("labels", {}), ensure_ascii=False))
        return
    proj = Path(a.project).resolve()
    voice = a.voice or e.get("ELEVENLABS_VOICE_ID")
    if not voice:
        sys.exit("Pass --voice VOICE_ID or set ELEVENLABS_VOICE_ID in .env (python engine/tts.py --list-voices)")
    model = a.model or pick_model(key)
    text = spoken_text((proj / "script.md").read_text(encoding="utf-8"))
    if a.sample:
        text = "\n\n".join(text.split("\n\n")[:2])
    body = {"text": text, "model_id": model, "language_code": "ar",
            "voice_settings": {"stability": a.stability, "similarity_boost": 0.75, "speed": a.speed},
            "output_format": "mp3_44100_192"}
    res = call(f"/text-to-speech/{voice}/with-timestamps", key, body)
    (proj / "audio").mkdir(exist_ok=True)
    mp3 = proj / "audio" / ("_sample.mp3" if a.sample else "tts.mp3")
    mp3.write_bytes(base64.b64decode(res["audio_base64"]))
    out = proj / "audio" / (f"sample-{a.speed}.wav" if a.sample else "voice.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp3), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                    "-ar", "48000", str(out)], check=True)
    if a.sample:
        print(f"sample -> {out}  (model {model}, speed {a.speed})")
        return
    words = words_from_alignment(res.get("alignment") or res["normalized_alignment"])
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)],
                               capture_output=True, text=True).stdout)
    tr = {"source": "elevenlabs", "engine": "elevenlabs-with-timestamps", "model": model, "voice_id": voice,
          "speed": a.speed, "language": "ar", "duration": round(dur, 3),
          "segments": [{"start": words[0]["start"], "end": words[-1]["end"], "text": text, "words": words}]}
    (proj / "transcript.json").write_text(json.dumps(tr, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"voice -> {out}  ({dur:.1f}s, {len(words)} words, model {model}, speed {a.speed})")


if __name__ == "__main__":
    main()
