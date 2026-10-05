# Kanz Motion

Turns a voice note into a Kanz-branded, Vox-style explainer Reel (1080×1920), using Kanz's
approved fonts, colours and editorial objects, with timed Arabic captions and sound effects.

The visual system comes from the 2026-10-05 research on how Vox builds its explainers:
[docs/VOX-RESEARCH-FINDINGS.md](docs/VOX-RESEARCH-FINDINGS.md).

## What it does

```
voice note ─► transcribe (word timings) ─► cut retakes, tighten pauses, speed 1.25x
           ─► corrected script + keywords ─► scene (boards, camera, marks, charts)
           ─► render frames in Chromium ─► mix voice + SFX ─► MP4
```

- **One continuous world**: each beat lives on a "board"; the camera travels between boards
  (right → left, like reading Arabic) instead of cutting between slides.
- **Everything is timed to the voice**: `T("word")` returns when that word is spoken.
- **Vox devices, Kanz look**: hand-drawn ovals, underlines and arrows that "boil", lavender
  highlights, paper cards with tape, charts that draw on, big numbers, a hook headline,
  captions with one keyword in lavender, 12 fps stepped motion and fine grain.
- **Sound**: every element registers a cue (paper, tape, marker, click, pop, whoosh, coin, hit);
  the renderer mixes them under the voice from the CC0 library in `library/sfx/`.

## Setup (once, on a new computer)

Needs Python 3.11+, Node.js 18+, `ffmpeg` on PATH and (for voice notes) [`uv`](https://docs.astral.sh/uv/).

```bash
git clone https://github.com/yasserr98/kanz-motion.git
cd kanz-motion
npm ci
python -m pip install -r requirements.txt
python -m playwright install chromium
python engine/make.py review pilot-01 3,20,45   # smoke test: writes projects/pilot-01/out/review.jpg
```

For ElevenLabs voices copy `.env.example` to `.env` and fill in the key (never commit `.env`).
A Freesound key there is optional.

## Make a video from a voice note

```bash
python engine/make.py new my-video "path/to/voice-note.m4a"
# 1. read projects/my-video/transcript.raw.json, write projects/my-video/audio/edl.json (keep last good takes)
python engine/make.py audio my-video
# 2. write projects/my-video/script.md (fix recognition slips, mark *keywords*) and scene.js (the visuals)
python engine/make.py review my-video 2,10,30   # one contact sheet: out/review.jpg
python engine/make.py render my-video v1
python engine/make.py check my-video v1         # frames from the MP4 + loudness: out/check-v1.jpg
```

## Make a video from a written script (ElevenLabs)

```bash
python engine/make.py script my-video           # then paste the copy into script.md, mark *keywords*
python engine/tts.py --list-voices              # pick a voice; put it in .env as ELEVENLABS_VOICE_ID
python engine/make.py sample my-video 1.0       # first two paragraphs, to choose voice and speed
python engine/make.py tts my-video 1.0          # full voice + word timings + captions
# write scene.js, then review / render / check as above
```

`projects/pilot-01/` (voice note) and `projects/real-estate-never-loses/` (written script) are the
worked examples. Their voice audio is not in the repo (Ahmed's voice stays private), so a fresh clone
can render their stills but not their full MP4. **Before making videos in volume read [docs/EFFICIENCY.md](docs/EFFICIENCY.md)**:
which model to use, how to keep each video cheap, and the usage log.

## Layout

| Path | What |
| --- | --- |
| `engine/` | make (step runner), transcribe, tts (ElevenLabs), edit_audio, captions, render, sfx_library, contact (review sheets) |
| `runtime/` | `kanz.js` (timeline + components) and `kanz.css` (brand tokens, layout) |
| `brand/` | Kanz fonts, logo and colour tokens (copied from the Kanz repo's `assets/kanz-brand-current`) |
| `library/objects/` | approved grayscale editorial objects used so far (from the Kanz motion library) |
| `library/sfx/` | 122 CC0 one-shots + `manifest.json` (source page and licence for each file) |
| `projects/<name>/` | one video: audio edit list, transcripts, script, scene; `out/` (renders) is not committed |
| `docs/` | Vox research findings, efficiency guide and usage log |

## Rules

Read [AGENTS.md](AGENTS.md) before changing anything. In short: keep the approved Kanz visual
identity, make new objects only through Codex following the Kanz MD rules, and never put real
market numbers on screen without a source.

## Licences

- SFX: all CC0 (Kenney.nl and BigSoundBank). See `library/sfx/manifest.json`.
- GSAP: free under the GreenSock standard licence (npm).
- Fonts: IBM Plex Sans Arabic is OFL. **Thmanyah Display's redistribution terms have not been
  checked**, so keep this repository private until they are.
- Objects, logo and brand assets belong to Kanz.

## Sharing this repo

Share it by adding the person as a collaborator on the private GitHub repo, not by sending a ZIP.
They get everything needed to render: engine, brand fonts, objects, sounds and the two worked
examples. They do **not** get `.env` (keys), voice-note audio, or rendered videos; each person uses
their own ElevenLabs key. Do not make the repo public until the Thmanyah licence is checked, and
treat Kanz objects and logo as Kanz-only, not for other brands.
