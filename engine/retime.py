"""Tighten a finished voice without re-voicing it: shorten long pauses, then speed it up slightly.

    python engine/retime.py projects/<slug> [--tempo 1.08] [--max-pause 0.3] [--floor -40]

Pauses (below --floor dB for longer than --max-pause) are cut down to --max-pause by removing their
middle, then ffmpeg atempo (pitch kept) speeds the whole voice by --tempo. Word timings in
build/timing.js (TOKENS, CAPTIONS, DURATION) are mapped through the same cuts, so the scene's
K.T()/K.N() anchors follow the new voice. transcript.json and transcript.aligned.json are remapped too, so
`make.py review/render` (which rebuild timing.js from them) stay in sync without a new alignment call. The
originals are kept with a -pre-retime suffix; running it again starts from those, so settings do not compound.
Normally run through `python engine/make.py retime <slug> [tempo] [max-pause]`.

Pacing study 2026-10-13: the script-route voice (ElevenLabs at 1.15) runs ~2.3 words/s against
~3.3 in the voice-note Reels, and ElevenLabs caps speed at 1.2. Retiming keeps the approved take
(including spliced re-voiced lines) instead of generating a new one.
"""
import argparse
import hashlib
import json
import re
import shutil
import subprocess
from pathlib import Path
from align import spoken_text
from provenance import audio_hash, current, stamp


def silences(wav, floor, min_len):
    err = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(wav), "-af", f"silencedetect=noise={floor}dB:d={min_len}",
                          "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8").stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    return list(zip(starts, ends))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--tempo", type=float, default=1.08)
    ap.add_argument("--max-pause", type=float, default=0.3)
    ap.add_argument("--floor", type=float, default=-40)
    a = ap.parse_args()
    proj = Path(a.project)
    voice, timing = proj / "audio" / "voice.wav", proj / "build" / "timing.js"
    v0, t0 = proj / "audio" / "voice-pre-retime.wav", proj / "build" / "timing-pre-retime.js"
    trs = [(proj / n, proj / n.replace(".json", "-pre-retime.json")) for n in ("transcript.json", "transcript.aligned.json")]
    state_path = proj / "audio" / "retime.json"
    state = json.loads(state_path.read_text(encoding="utf-8")) if state_path.exists() else {}
    tr_now = proj / "transcript.json"
    now = json.loads(tr_now.read_text(encoding="utf-8")) if tr_now.exists() else {}
    fresh = tr_now.exists() and "retime" not in now
    if state:
        fresh = audio_hash(voice) != state["output_sha256"]
        if fresh:
            print("voice changed since retime; refreshing originals from the current take")
        elif not v0.exists() or audio_hash(v0) != state["source_sha256"]:
            raise SystemExit("retime original is missing or changed; refusing to restore an unverified take")
    elif v0.exists():
        print("warning: retime has no voice provenance; using legacy backup detection")
        if (now.get("audio_sha256") or now.get("sha256")) and not current(now, voice, "retimed transcript", strict_legacy=True):
            fresh = True
            print("voice changed since legacy retime; refreshing originals from the current take")
    text = spoken_text((proj / "script.md").read_text(encoding="utf-8")) if (proj / "script.md").exists() else None
    timing_meta = proj / "build" / "timing.provenance.json"
    pre_meta = proj / "build" / "timing-pre-retime.provenance.json"
    if not v0.exists() or fresh:
        shutil.copy(voice, v0)
        if timing.exists():
            shutil.copy(timing, t0)
        else:
            t0.unlink(missing_ok=True)
        if timing_meta.exists():
            shutil.copy(timing_meta, pre_meta)
        else:
            pre_meta.unlink(missing_ok=True)
        for cur, pre in trs:
            if cur.exists():
                shutil.copy(cur, pre)
            else:
                pre.unlink(missing_ok=True)
    valid_trs = []
    for cur, pre in trs:
        if pre.exists():
            tr = json.loads(pre.read_text(encoding="utf-8"))
            aligned = cur.name == "transcript.aligned.json"
            if current(tr, v0, cur.name, text if aligned else None, strict_legacy=True):
                valid_trs.append((cur, tr))
    timing_valid = t0.exists() and current(
        json.loads(pre_meta.read_text(encoding="utf-8")) if pre_meta.exists() else {}, v0, "timing.js", text)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(v0)],
                               capture_output=True, text=True, encoding="utf-8").stdout)

    # keep-segments: everything except the middle of each long pause (keep max_pause/2 at both edges)
    cuts = []
    for s, e in silences(v0, a.floor, a.max_pause):
        if e >= dur - 0.05:  # trailing silence: leave it, the scene decides the ending
            continue
        h = a.max_pause / 2
        cuts.append((s + h, e - h))
    keep, cur = [], 0.0
    for s, e in cuts:
        keep.append((cur, s))
        cur = e
    keep.append((cur, dur))

    def remap(t):
        """Original time -> new time (inside a removed span, snap to its start)."""
        out = 0.0
        for s, e in keep:
            if t <= s:
                break
            out += min(t, e) - s
            if t <= e:
                break
        return round(out / a.tempo, 3)

    parts = "".join(f"[0:a]atrim={s:.4f}:{e:.4f},asetpts=PTS-STARTPTS[a{i}];" for i, (s, e) in enumerate(keep))
    graph = parts + "".join(f"[a{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=0:a=1[c];[c]atempo={a.tempo}[o]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(v0), "-filter_complex", graph, "-map", "[o]", str(voice)], check=True)

    # transcripts (segments -> words with start/end), remapped the same way
    for cur, tr in valid_trs:
        for seg in tr.get("segments", []):
            for k in ("start", "end"):
                if k in seg:
                    seg[k] = remap(seg[k])
            for w in seg.get("words", []):
                for k in ("start", "end"):
                    if k in w:
                        w[k] = remap(w[k])
        if "duration" in tr:
            tr["duration"] = remap(tr["duration"])
        tr["retime"] = {"tempo": a.tempo, "max_pause": a.max_pause, "pauses_cut": len(cuts)}
        tr.update(stamp(voice))
        if "sha256" in tr:
            if cur.name == "transcript.aligned.json":
                old_text = tr["segments"][0]["text"] if tr.get("segments") else ""
                tr["sha256"] = hashlib.sha256(voice.read_bytes() + old_text.encode("utf-8")).hexdigest()
            else:
                tr["sha256"] = audio_hash(voice)
        cur.write_text(json.dumps(tr, ensure_ascii=False, indent=1), encoding="utf-8")

    state_path.write_text(json.dumps({"source_sha256": audio_hash(v0), "output_sha256": audio_hash(voice)}), encoding="utf-8")
    if not timing_valid:
        print(f"voice retimed; no current build/timing.js (run make.py captions)")
        return
    src = t0.read_text(encoding="utf-8")
    tokens = json.loads(re.search(r"window\.TOKENS=(\[.*?\]);", src, re.S).group(1))
    caps = json.loads(re.search(r"window\.CAPTIONS=(\[.*?\]);", src, re.S).group(1))
    old_d = float(re.search(r"window\.DURATION=([\d.]+)", src).group(1))
    for tk in tokens:
        tk["start"], tk["end"] = remap(tk["start"]), remap(tk["end"])
    for c in caps:
        c["start"], c["end"] = remap(c["start"]), remap(c["end"])
        for w in c.get("words", []):
            for k in ("start", "end"):
                if k in w:
                    w[k] = remap(w[k])
    new_d = remap(old_d)
    timing.write_text(f"window.TOKENS={json.dumps(tokens, ensure_ascii=False)};\nwindow.CAPTIONS={json.dumps(caps, ensure_ascii=False)};\n"
                      f"window.DURATION={new_d};\n", encoding="utf-8")
    timing_meta.write_text(json.dumps(stamp(voice, text)), encoding="utf-8")
    removed = sum(e - s for s, e in cuts)
    print(f"{len(cuts)} pauses shortened ({removed:.2f} s removed), tempo {a.tempo}: {old_d:.2f} s -> {new_d:.2f} s")


if __name__ == "__main__":
    from console import utf8
    utf8()
    main()
