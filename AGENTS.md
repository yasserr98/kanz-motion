# Instructions for agents working on Kanz Motion

This repo turns a voice note into a Kanz Reel. It lives inside the Kanz working folder
(`D:\Claude Projects\Kanz\kanz-motion`) but is its own Git repository
(`github.com/yasserr98/kanz-motion`, private). The Kanz repo holds the brand authority and
research; this repo holds the engine.

## Before a new video

1. Read `README.md` and `docs/VOX-RESEARCH-FINDINGS.md` (what to keep, adapt and drop).
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
