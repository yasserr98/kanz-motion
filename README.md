# Kanz Motion

**Handover workflow: Claude with the Codex plugin.** Start with [HANDOVER-SETUP.md](docs/HANDOVER-SETUP.md) for assistant setup and installation. Static carousels use the separate [Codex-only carousel repository](https://github.com/yasserr98/kanz-carousels).

Turns a voice note into a Kanz-branded, Vox-style explainer Reel (1080×1920), using Kanz's
approved fonts, colours and editorial objects, with timed Arabic captions and sound effects.

The visual system started from the 2026-10-05 research on how Vox builds its explainers
([docs/VOX-RESEARCH-FINDINGS.md](docs/VOX-RESEARCH-FINDINGS.md), historical: where it differs, `docs/LOOK-V2.md`,
`docs/PACE.md` and `AGENTS.md` win).

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
  boards, captions running across both, with a clean cut onto an already-built board at every change (`xstyle`); `--tv-until` keeps a styled
  source opening (the speaker in a TV set) and zooms into the face. Route: [docs/routes/shorts.md](docs/routes/shorts.md).
- **Photos and Codex images** (2026-10-16): `K.screen()` (`runtime/kanz-snap.js`) fills the frame with a photo of a
  place and darkens the headline and caption bands as much as that photo needs; `K.snap35()` shows a real, licensed
  photo of a person or moment as a disposable-camera print (no date). `engine/codex_assets.py` generates a video's
  photos and icons with Codex from `shots.json`; `engine/contrast.py` checks every headline on the rendered frame (4.5:1).
  The template loads it, so voice-note and script Reels use the same three visual types as the shorts (2026-10-17).
- **Render on a server** (2026-10-16): `bash engine/vps_render.sh <slug> <name>` with `KANZ_RENDER_HOST` in `.env`.

## Setup (once, on a new computer)

Needs Python 3.11+, Node.js 18+, `ffmpeg` on PATH and (for voice notes) [`uv`](https://docs.astral.sh/uv/).

```bash
git clone https://github.com/yasserr98/kanz-motion.git
cd kanz-motion
npm ci
python -m pip install -r requirements.txt
python -m playwright install chromium
python engine/make.py doctor                    # checks tools, fonts, keys, render host, Codex, references
python engine/make.py review us-dollar-decisions-pace 3,20,45   # smoke test: examples/us-dollar-decisions-pace/out/review.jpg
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
python engine/make.py audio my-video            # also writes script.md, prefilled from the transcript
python engine/make.py breaths my-video          # sighs/breaths to mute: audio/edl.json "mute"
# 2. correct projects/my-video/script.md (fix recognition slips, mark *keywords*), write scene.js (the visuals)
python engine/lint.py projects/my-video         # safe zones, dead stretches, thin frames: out/lint.jpg
python engine/make.py review my-video 2,10,30   # one contact sheet: out/review.jpg
python engine/make.py ship my-video v1          # lint --strict, render, MP4 frames, loudness; stops at the first failure
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

Worked examples, one per route, all on look v2 + pace: `examples/us-dollar-decisions-pace` (script, and the scene to
copy for a voice note too), `examples/short-house-always-wins` (shorts) and `examples/what-is-inflation` (the voice-note
audio steps only). Their voice audio is not in the repo (Ahmed's voice stays private), so a fresh clone can render their
stills but not their full MP4. Your own videos live in `projects/`, which Git ignores. **Before making videos in volume read [docs/EFFICIENCY.md](docs/EFFICIENCY.md)**:
which model to use, how to keep each video cheap, and the usage log.

## Live/workshop shorts: tracking and split

For shorts cut from Ahmed's 16:9 X Live workshops (Ahmed 2026-10-17: the camera tracks him; inserts alternate between a
50/50 split and a full-screen board). Built for `projects/short-volume-doesnt-matter`; reuse it, do not rebuild it.

1. **Frames (use instead of `footage.py`, same arguments):**
   `python engine/footage_track.py projects/short-<slug> shorts/<live>/source/video.mp4 shorts/<live>/transcript.raw.json <start> <end> [--video-from S]`
   Writes `assets/face/` (1080x1920 tracked 9:16), `assets/half/` (1080x960 tracked crop for one split half), `audio/voice.wav`,
   `transcript.json`, `assets/track.json`, and `assets/track-check.jpg` (8 source frames, yellow = 9:16 crop, pink = half
   crop): open it and confirm his face stays inside both. It prints the share of samples where a face was found and the
   largest camera step; a step under ~3 px/frame glides. Slow: about 5 s of work per second of video, run it in the
   background. Options: `--zoom` (tighter 9:16), `--half-h` (source px high in the half, default 560; smaller = tighter on
   the face), `--face-y` (face height in the half, default 0.42), `--no-half`. No `--tv-until` (use `footage.py` for a TV opening).
2. **Scene:** load `runtime/kanz-footage.js` and `runtime/kanz-split.js` in `index.html` (after kanz-3d.js), then, after
   `K.look(); K.pace();`:
   ```js
   K.footage({ dir: "assets/face", n: N, end: END, windows: [[0, 3.2], ...] });   // full-screen face (first 3 s always)
   K.split({ dir: "assets/half", n: N, windows: [[a, b], ...] });                // split: face half + board half
   // anywhere outside both = full-screen board
   ```
   Face windows and split windows must not overlap; alternate split and full-screen boards, cutting in the pauses, and
   build each board ~0.3 s before its cut (`PRE = 0.3`). `K.split` options: `face: "bottom"` (default: board on top,
   his face below, the captions cover his chest; `"top"` puts the face under the platform bar), `boardScale` (0.8),
   `boardY` (board centre: 590 / 1205), `sfx: true` for whooshes. The board half is the normal world scaled and clipped,
   so the same K.* objects work in both layouts; keep board objects between y 250 and 930 of the 1000x860 board's
   centre and a headline short.
3. **Check:** `python engine/make.py review <slug> <times>` and pull a split moment, a full-board moment and a face moment.
   Source overlays (the Kanz logo, the "WARSHA1015" promo box, the name tag) can fall inside the crop when he leans right;
   they are the source's own, check them in the stills. Demo: `projects/_split-demo`.

## Review guards (2026-10-18)

The notes Ahmed kept repeating on the shorts are engine defaults and failing checks now (docs/RULES.md lists each rule
with its check; `projects/_guards-demo` shows every one, clean and broken):

- **Footage tools** (`footage.py`, `footage_track.py`): the ending guard (last word + 0.4 s, stopped before the next
  source word), `--also S E` voice joins with a 0.25 s pause, dead air tightened by default for workshops, then
  `engine/faces.py`: `assets/faces.json` (eyes-and-mouth box per frame) and `assets/freezes.json`.
- **Runtime** with `K.pace({ defaults: "2026-10-18" })`: `K.title()` takes its text from `shorts/_titles.json` and its
  height off his face; subtitles move off his face; `K.split` eases to and from a full board (cuts to and from his
  face stay clean); `K.money(39.8)` keeps `$39.8` together in Arabic text; `K.under(head, html)` leaves `K.GAP` px of
  breathing room. Each can be switched on alone in an older scene (`ease: true`, `faces: true`, `gap: true`).
- **Lint** (`engine/guards.py`): on-face, freeze, title, end-cut, face-share, mid-word-cut, caption-switch, sfx-overlap,
  sfx-orphan, stray-currency, tight-gap; `lint-ok.json` cannot excuse an empty stretch over 1.5 s after the title.
- **Ship** (`engine/shipcheck.py`): the ending, the next-sentence leak, the title pick, duplicate frames in face windows,
  frame rate, face-track jumps, `out/cuts-<version>.jpg` (12 frames around every cut, flagged frames outlined) and
  `out/notes-<version>.jpg` (a still for every note in `notes.json`; `make.py note`). `make.py remix` runs the sound
  checks only.

## Layout

| Path | What |
| --- | --- |
| `engine/` | `make.py` (step runner), `transcribe` (Scribe / Whisper), `tts`, `align` (forced alignment), `captions`, `edit_audio`, `breaths` (sighs to mute), `retime` (pace: pauses + tempo), `voicecheck` (TTS failures, `library/voice/lexicon.json`), `render`, `contact` (review sheets), `lint` (pre-render checks), `doctor` (setup check), `objects` (object approval status), `contrast` (headline contrast over photos), `cover` (Reel cover, style A), `data` (real series for charts, with sources), `codex_assets` (images and icons through Codex, from `shots.json`), `footage` (shorts cut from a long video), `sfx_library`, `sfx_gen` (generated SFX), `eleven` (API client), `provenance` (hashes for voice-derived timings), `console` (UTF-8 output), `vps_render.sh` (render on a server) |
| `runtime/` | `kanz.js` (timeline + components) and `kanz.css` (brand tokens, layout); `kanz-look.js/.css` look v2 (safe zones, light, depth, documents, photos, maps, counting numbers, piles), see [docs/LOOK-V2.md](docs/LOOK-V2.md); `kanz-pace.js` pacing layer (arrive built, drift, carry, room tone, frame guard), see [docs/PACE.md](docs/PACE.md); `kanz-3d.js` (`K.flip`, `K.browser`, `K.fold`, worked example `projects/_3d-demo`); `kanz-snap.js` (`K.screen` full-screen photos, `K.snap35` disposable prints); `kanz-footage.js` (`K.footage`, face windows for shorts) |
| `brand/` | Kanz fonts, logo and colour tokens (copied from the Kanz repo's `assets/kanz-brand-current`) |
| `library/objects/` | grayscale editorial objects (from the Kanz motion library), `manifest.json` (approved / candidate status of each) and their `PROVENANCE-*.md` generation records |
| `library/backgrounds/` | the approved charcoal grain background |
| `library/sfx/` | 124 CC0 one-shots + generated effects (register, riser, shutter) (`generated.json`, prompt per file) + `manifest.json` (source page and licence for each file) |
| `library/voice/` | `lexicon.json`: words the cloned voice gets wrong (`replace` respellings, `watch` flags) |
| `projects/_template/` | what `make.py new` / `make.py script` copy into a new project; `projects/_*-demo/` engine demos (no voice, not for posting) |
| `projects/<name>/` | one video: audio edit list, transcripts, `script.md`, `scene.js`, `shots.json`, `CREDITS.md` (sources, licences, post-caption credits). Local only: Git ignores your projects |
| `examples/<name>/` | the curated worked examples (approved for posting, without record ids or receipts) |
| `shorts/<video>/` | candidate moments and picker pages for shorts cut from a long video; source media, photos and full transcripts stay local |
| `tests/` | `python -m pytest tests` (engine), `runtime_checks.py` and `golden_stills.py` (runtime), `RUNTIME-REVIEW.md` |
| `docs/` | `RULES.md` (rules in force, with ids), `DECISIONS.md` (Ahmed's dated decisions), `routes/` (voice note, script, shorts, image pass), `LOOK-V2.md`, `PACE.md` (look and pace components), `HANDOVER-SETUP.md` and `UPDATE.md` (editors), `EFFICIENCY.md` (model choice, lean sessions), `CODEX-ASSET-REQUESTS.md` (object batches), `VOX-RESEARCH-FINDINGS.md` (2026-10-05 research, historical) |
| `voice-clone/` | local only (git-ignored) |

## Rules

Read [AGENTS.md](AGENTS.md) (the checklist) and [docs/RULES.md](docs/RULES.md) (the rules in force) before changing
anything. In short: keep the approved Kanz visual identity, make new objects only through Codex following the Kanz MD
rules, and never put real market numbers on screen without a source.

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
