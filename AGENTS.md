# Instructions for agents working on Kanz Motion

This repo turns a voice note into a Kanz Reel. It lives inside the Kanz working folder
(`D:\Claude Projects\Kanz\kanz-motion`) but is its own Git repository
(`github.com/yasserr98/kanz-motion`, private). The Kanz repo holds the brand authority and
research; this repo holds the engine.

## When Ahmed says "create a video" / "make a Reel"

Work in this folder (`D:\Claude Projects\Kanz\kanz-motion`), even if the chat opened in the Kanz
repo or a Kanz worktree (worktrees do not contain this folder; use the absolute path).

1. **Inputs.** Find out which route: a **voice note** (file path) or a **written script** (ElevenLabs
   voice; needs `ELEVENLABS_API_KEY` in `.env` and a voice id). Ask only for what is missing.
   If the chat runs on Opus, mention once that `docs/EFFICIENCY.md` recommends Sonnet 5.5 (medium).
2. **Project.** `python engine/make.py new <slug> <voice-note>` or `python engine/make.py script <slug>`.
   English slug, e.g. `real-estate-never-loses`.
3. **Voice.**
   - Voice note: write `audio/edl.json` (keep the last clean take of each retake, reasons in `_why`),
     then `make.py audio <slug>`; read the new transcript through.
   - Script: paste the copy verbatim into `script.md` (never rewrite; flag doubts), mark `*keywords*`,
     `make.py sample <slug> 1.0` and `1.15` for Ahmed to pick, then `make.py tts <slug> <speed>`.
4. **Breaths and sighs.** `python engine/breaths.py projects/<slug>`; mute real ones via `"mute"` in
   `audio/edl.json` and re-run `engine/edit_audio.py`. Mention any you left in.
5. **Script and captions.** Voice note: correct `script.md` from the transcript and flag uncertain words.
6. **Scene.** New videos use look v2 (`docs/LOOK-V2.md`, `K.look()`; the template has it). Copy the closest finished `scene.js` (pilot-01 for a voice note, real-estate-never-loses
   for a script) and adapt it. Approved `library/objects/` only; new objects go through Codex + Ahmed.
7. **Review.** `python engine/lint.py projects/<slug>` (safe zones, dead stretches, thin frames, hook;
   fix or justify each flag), then `make.py review <slug> <times>` → look at `out/review.jpg`, fix, repeat.
8. **Render and check.** `make.py render <slug> v1` in the background, then `make.py check <slug> v1`
   (frames from the MP4 + loudness ≈ −16 LUFS). Open the MP4 for Ahmed (`ii <path>`).
9. **Record.** Commit the project (not `out/`), push, add a row to the usage log in
   `docs/EFFICIENCY.md`, and update the Kanz backlog. Delivery to Drive + Airtable (`In Review`)
   only when Ahmed asks; rendered ≠ approved ≠ posted.
   Upload: from the Kanz repo, `python scripts/kanz_drive_upload.py <mp4> --parent 1vMk8CG7fRj15FqGpQ0mMbz-vV_MLUhlA
   --folder "<exact Airtable Name>" --name 01.mp4` (Kanz account, size+MD5 readback), then set only the
   record's Drive link to the folder URL and save `projects/<slug>/delivery.json` (see pilot-01).

Ahmed's fix requests come as timestamps ("47s there is a sigh"). Locate the exact moment in the
audio/frames before changing anything, and say where it really was if it differs.

## Before a new video

1. Read `README.md` and `docs/VOX-RESEARCH-FINDINGS.md` (what to keep, adapt and drop).
   Then `docs/LOOK-V2.md` (safe zones, light, depth, evidence and number components; Ahmed 2026-10-10)
   and `projects/_look-demo/scene.js`, which uses each one.
2. Read `projects/pilot-01/scene.js` as the worked example.
3. If the Kanz repo is available alongside, follow its brand authority:
   `docs/21-kanz-visual-identity.md`, `brand/explainer-icons/README.md`,
   `brand/image-treatment/CREATE-A-BRANDED-IMAGE.md`, `brand/KANZ-CONTENT-DELIVERY.md`.

## Standing rules

- **Audio**: cut retakes by keeping the last clean take; record every cut in `audio/edl.json`
  with the reason. Default speed 1.25x (Ahmed, 2026-10-05). Re-transcribe the edited voice and
  read it through to prove no words were lost or doubled.
- **Captions** come from the corrected `script.md`, never raw ASR. Flag uncertain words for Ahmed.
- **Numbers**: show only numbers the voice says. Hypothetical examples carry "مثال افتراضي".
  Real market figures need a source on screen and in the project notes.
- **Look**: approved charcoal grain background, Thmanyah Display headlines, IBM Plex Sans Arabic
  text, lavender `#D5ADEF` as the only pointing colour, red only for genuine losses/risk.
  No slide counters. The Kanz logo stays small top-left and closes the video.
- **Direction**: text, highlights and label sequences run right → left; market charts keep
  time left → right.
- **Objects**: reuse `library/objects/` (copied from the Kanz approved library) first. New
  objects are made with **Codex** following the Kanz MD rules (open the approved references,
  match the fixed icon style exactly) and need Ahmed's approval before use. Never invent a new
  illustration style for a topic.
- **Websites** shown on screen must be genuine screenshots (source URL + capture date).
- **SFX**: only CC0 or explicitly licensed sounds; add each to `engine/sfx_library.py` with its
  source page so `library/sfx/manifest.json` stays complete. Sonniss/Mixkit files may be used
  locally but must not be committed.
- **Review before delivery**: render stills, look at them, render the MP4, then pull frames from
  the MP4 itself and check fonts, Arabic joining, overlaps and timing. Rendered ≠ approved ≠ posted.
- **Delivery** (Drive + Airtable `In Review`) follows the Kanz repo's delivery guide.

## Usage discipline (Claude Pro limits)

- One fresh session per video; default model Sonnet 5.5 at medium effort, Opus only for engine
  work. Follow `docs/EFFICIENCY.md` and add a row to its usage log at the end of every video.
- Review through one contact sheet (`make.py review`, `make.py check`), not image by image.
- Run renders in the background; do not poll them.

## Repo hygiene

- Never commit `node_modules/`, `library/sfx/raw/`, `projects/*/out/` or source voice notes
  (`projects/*/audio/source.*`). Edited `voice.wav` is also ignored; keep it locally.
- Add new reusable components to `runtime/kanz.js` (not inside a project) and document them in README.
