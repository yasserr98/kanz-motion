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

## Setup (once)

- Python 3.11+ with `numpy`, `Pillow`, `playwright` (`python -m playwright install chromium`)
- `ffmpeg` on PATH, Node.js, and [`uv`](https://docs.astral.sh/uv/) (runs faster-whisper on demand)
- `npm install` (GSAP)
- Optional: copy `.env.example` to `.env` and add a Freesound key for more sounds

## Make a video

```bash
python engine/make.py new my-video "path/to/voice-note.m4a"
# 1. read projects/my-video/transcript.raw.json, write projects/my-video/audio/edl.json (keep last good takes)
python engine/make.py audio my-video
# 2. write projects/my-video/script.md (fix recognition slips, mark *keywords*) and scene.js (the visuals)
python engine/make.py captions my-video
python engine/make.py stills my-video 2,10,30
python engine/make.py render my-video v1
```

`projects/pilot-01/` is the complete worked example (Ahmed's "good news, falling stock" note).

## Layout

| Path | What |
| --- | --- |
| `engine/` | transcribe, edit_audio, captions, render, sfx_library, contact (review sheets), make |
| `runtime/` | `kanz.js` (timeline + components) and `kanz.css` (brand tokens, layout) |
| `brand/` | Kanz fonts, logo and colour tokens (copied from the Kanz repo's `assets/kanz-brand-current`) |
| `library/objects/` | approved grayscale editorial objects used so far (from the Kanz motion library) |
| `library/sfx/` | 122 CC0 one-shots + `manifest.json` (source page and licence for each file) |
| `projects/<name>/` | one video: audio edit list, transcripts, script, scene, outputs |

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
