"""One command from voice note to video, with the human checkpoints in between.

    python engine/make.py new <name> <voice-note>   # create projects/<name>/, copy audio, raw transcript
    python engine/make.py audio <name>              # apply audio/edl.json (cuts, pauses, speed), final transcript
    python engine/make.py captions <name>           # align script.md to the final voice
    python engine/make.py stills <name> 2,10,30     # review frames
    python engine/make.py render <name> [version]   # full MP4 in projects/<name>/out/

Between steps: read transcript.raw.json and write audio/edl.json (which takes to keep);
correct script.md (caption text + *keywords*); write scene.js (the visuals). See README.md.
"""
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PY = sys.executable
WHISPER = ["uv", "run", "--with", "faster-whisper", "python"]


def run(cmd):
    print("+", " ".join(str(c) for c in cmd))
    subprocess.run(cmd, check=True, cwd=ROOT)


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return
    step, name = sys.argv[1], sys.argv[2]
    proj = ROOT / "projects" / name
    if step == "new":
        src = Path(sys.argv[3])
        (proj / "audio").mkdir(parents=True, exist_ok=False)
        shutil.copy2(src, proj / "audio" / ("source" + src.suffix))
        for f in ["index.html"]:
            shutil.copy2(ROOT / "projects" / "_template" / f, proj / f)
        (proj / "scene.js").write_text((ROOT / "projects" / "_template" / "scene.js").read_text(encoding="utf-8"), encoding="utf-8")
        run(WHISPER + ["engine/transcribe.py", proj / "audio" / ("source" + src.suffix), proj / "transcript.raw.json"])
        print(f"\nNext: write {proj / 'audio' / 'edl.json'} (keep ranges, speed) from transcript.raw.json")
    elif step == "audio":
        run([PY, "engine/edit_audio.py", proj])
        run(WHISPER + ["engine/transcribe.py", proj / "audio" / "voice.wav", proj / "transcript.json"])
        print(f"\nNext: write {proj / 'script.md'} from transcript.json (fix recognition slips, mark *keywords*)")
    elif step == "captions":
        run([PY, "engine/captions.py", proj])
    elif step == "stills":
        run([PY, "engine/render.py", proj, "--stills", sys.argv[3], "--name", "review"])
    elif step == "render":
        version = sys.argv[3] if len(sys.argv) > 3 else "v1"
        run([PY, "engine/captions.py", proj])
        run([PY, "engine/render.py", proj, "--name", f"{name}-{version}"])
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
