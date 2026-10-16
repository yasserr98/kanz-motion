# Kanz Motion

**Handover workflow: Claude with the Codex plugin.** Start with [HANDOVER-SETUP.md](docs/HANDOVER-SETUP.md) for assistant setup and installation. Static carousels use the separate [Codex-only carousel repository](https://github.com/yasserr98/kanz-carousels).

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
- **Sound**: every element registers a cue (paper, tape, marker, click, pop, whoosh, coin, hit, fire);
  the renderer mixes them under the voice from the CC0 library in `library/sfx/`.
- **Effects**: `K.fire(board, cx, baseY, w, {at, out, h})` draws brand-coloured fire (lavender core to deep plum,
  flickering tongues, rising embers, pulsing glow) with a CC0 crackle (BigSoundBank s0987); first used in
  `projects/the-cost-of-a-mistake` for the volcano.

- **Shorts from a long video** (2026-10-16): `engine/footage.py` cuts the speaker's face, voice and word timings
  from a long Kanz video into a project; `runtime/kanz-footage.js` (`K.footage`) alternates that face with the motion
  boards, captions running across both, with a 0.2 s dissolve at every change (`xfade`); `--tv-until` keeps a styled
  source opening (the speaker in a TV set) and zooms into the face. Route and rules: `AGENTS.md`, "Shorts cut from a long Kanz video".
- **Photos and Codex images** (2026-10-16): `K.screen()` (`runtime/kanz-snap.js`) fills the frame with a photo of a
  place and darkens the headline and caption bands as much as that photo needs; `K.snap35()` shows a real, licensed
  photo of a person or moment as a disposable-camera print (no date). `engine/codex_assets.py` generates a video's
  photos and icons with Codex from `shots.json`; `engine/contrast.py` checks every headline on the rendered frame (4.5:1).
- **Render on a server** (2026-10-16): `bash engine/vps_render.sh <slug> <name>` with `KANZ_RENDER_HOST` in `.env`.

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

For ElevenLabs copy `.env.example` to `.env` and fill in the key (never commit `.env`). With a key,
the engine also uses ElevenLabs for transcription (Scribe v2, which tags coughs/sighs), for timing
captions to the exact script (forced alignment, cached), for the optional voice isolator and for
generated sound effects. Without one it falls back to local faster-whisper. A Freesound key is optional.

## Make a video from a voice note

```bash
python engine/make.py new my-video "path/to/voice-note.m4a"
python engine/make.py clean my-video            # optional, noisy notes: isolated voice to compare
# 1. read projects/my-video/transcript.raw.json, write projects/my-video/audio/edl.json (keep last good takes)
python engine/make.py audio my-video
python engine/make.py breaths my-video          # sighs/breaths to mute: audio/edl.json "mute"
# 2. write projects/my-video/script.md (fix recognition slips, mark *keywords*) and scene.js (the visuals)
python engine/lint.py projects/my-video         # safe zones, dead stretches, thin frames: out/lint.jpg
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
python engine/make.py retime my-video           # pace: pauses to 0.3 s, 1.08x, captions re-timed (docs/PACE.md)
# write scene.js, then review / render / check as above
```

`projects/pilot-01/` (voice note) and `projects/real-estate-never-loses/` (written script) are the
worked examples. Their voice audio is not in the repo (Ahmed's voice stays private), so a fresh clone
can render their stills but not their full MP4. **Before making videos in volume read [docs/EFFICIENCY.md](docs/EFFICIENCY.md)**:
which model to use, how to keep each video cheap, and the usage log.

## Layout

| Path | What |
| --- | --- |
| `engine/` | make (step runner), transcribe (Scribe / Whisper), tts, align (forced alignment), edit_audio, captions, render, sfx_library, sfx_gen (generated SFX), eleven (API client), contact (review sheets), lint (pre-render checks), data (real series for charts, with sources) |
| `runtime/` | `kanz.js` (timeline + components) and `kanz.css` (brand tokens, layout); `kanz-look.js/.css` look v2 for new videos (safe zones, light, depth, documents, photos, maps, counting numbers, piles), see [docs/LOOK-V2.md](docs/LOOK-V2.md); `kanz-pace.js` pacing layer (arrive built, drift, carry, snap zooms, room tone, frame guard that keeps objects inside the frame), see [docs/PACE.md](docs/PACE.md); `kanz-3d.js` 3D components `K.flip` (card turns over), `K.browser` (genuine screenshot tilted in a browser frame, marks on the page) and `K.fold` (folded note opens), worked example `projects/_3d-demo` |
| `brand/` | Kanz fonts, logo and colour tokens (copied from the Kanz repo's `assets/kanz-brand-current`) |
| `library/objects/` | approved grayscale editorial objects used so far (from the Kanz motion library) |
| `library/sfx/` | 124 CC0 one-shots + generated effects (register, riser, shutter) (`generated.json`, prompt per file) + `manifest.json` (source page and licence for each file) |
| `projects/<name>/` | one video: audio edit list, transcripts, script, scene; `out/` (renders) is not committed |
| `docs/` | Vox research findings, efficiency guide and usage log |

## Rules

Read [AGENTS.md](AGENTS.md) before changing anything. In short: keep the approved Kanz visual
identity, make new objects only through Codex following the Kanz MD rules, and never put real
market numbers on screen without a source.

## Licences

- SFX: CC0 (Kenney.nl and BigSoundBank), plus effects generated with ElevenLabs on a paid plan (commercial use), each in its own category and listed with its prompt in `library/sfx/generated.json`. See `library/sfx/manifest.json`.
- GSAP: free under the GreenSock standard licence (npm).
- Fonts: IBM Plex Sans Arabic is OFL. **Thmanyah Display's redistribution terms have not been
  checked**, and this repository is public, so its font files are downloadable by anyone. Open item for Ahmed.
- Objects, logo and brand assets belong to Kanz.

## Sharing this repo

The repo is public: send the link. No GitHub account is needed to clone or update it, only Git installed
(`git clone https://github.com/yasserr98/kanz-motion.git`). A "Download ZIP" copy works too: `docs/UPDATE.md`
updates either kind of folder, with or without Git. Editors only pull; their projects and videos stay on their
machine and never go back to GitHub (AGENTS.md, "Editors' copies"). They get everything needed to render:
engine, brand fonts, objects, sounds and the worked examples. They do **not** get `.env` (keys), voice-note audio,
or rendered videos; each person uses their own ElevenLabs key. Treat Kanz objects and logo as Kanz-only, not for
other brands.
