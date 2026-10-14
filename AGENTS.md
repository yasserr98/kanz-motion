# Instructions for agents working on Kanz Motion

This repo turns a voice note into a Kanz Reel. It lives inside the Kanz working folder
(`D:\Claude Projects\Kanz\kanz-motion`) but is its own Git repository
(`github.com/yasserr98/kanz-motion`, **public**). The Kanz repo holds the brand authority and
research; this repo holds the engine.

## Two repos, two rules (Ahmed 2026-10-14)

| | Kanz (`github.com/yasserr98/kanz`) | Kanz Motion (`github.com/yasserr98/kanz-motion`) |
|---|---|---|
| Visibility | private, Ahmed only | **public**: anyone can read and clone it, no GitHub account needed |
| Purpose | Ahmed's production home: anything produced may be committed there | the engine and settings the video editors pull |
| Who pushes | Ahmed's sessions, freely | Ahmed's sessions only (engine, runtime, docs, template, examples) |
| Editors | no access | pull only (`docs/UPDATE.md`); their projects and videos stay on their machine |

Everything pushed to kanz-motion is world-readable. Push engine changes, settings and docs there; keep private
material (unreleased scripts, keys, voice recordings, renders) out of it. Open item: Thmanyah Display's
redistribution terms are still unchecked (README, Licences) while the font files are public.

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
   - **Voice (Ahmed 2026-10-11, every script video):** the instant clone "Ahmed Shaaban Shorts" `UeQ9UTIKgN2rsbnqHH5w`
     (the `.env` default). Never use the professional clone "Ahmed Shaaban" `zb1ukG6KkE2RYSjMU6b3`: compared on
     us-dollar-decisions, Ahmed said the old one "was way better".
   - Script: paste the copy verbatim into `script.md` (never rewrite; flag doubts), mark `*keywords*`,
     `make.py sample <slug> 1.0` and `1.15` for Ahmed to pick, then `make.py tts <slug> <speed>`.
     `tts` runs the voice checks itself: before generating, `voicecheck.py --pre` lists script patterns
     the cloned voice is known to get wrong (`library/voice/lexicon.json`); it generates one paragraph at
     a time with real pauses (cached in `audio/_tts`, so fix rounds re-roll only changed paragraphs); after,
     Scribe re-transcribes the voice and prints WORD / STUMBLE / PAUSE / FLAT / EAR findings. Fix them with
     voice-only spelling in `projects/<slug>/say.json` (captions keep script.md), delete that paragraph's
     `audio/_tts/pNN.json`, re-run. Tell Ahmed the EAR times to listen to. When he hears a new failure,
     add it to the lexicon (`replace` if a respelling fixes it, `watch` if it only needs flagging).
   - **Retime (pace, 2026-10-13):** once the voice is final, `make.py retime <slug>` (pauses to 0.3 s, tempo 1.08; ElevenLabs
     caps speed at 1.2) and write the scene against the retimed timings. Voice notes are already at 1.25x: use
     `make.py retime <slug> 1.0` to tighten pauses only.
4. **Breaths and sighs.** `python engine/breaths.py projects/<slug>`; mute real ones via `"mute"` in
   `audio/edl.json` and re-run `engine/edit_audio.py`. Mention any you left in.
5. **Script and captions.** Voice note: correct `script.md` from the transcript and flag uncertain words.
6. **Scene.** New videos use look v2 (`docs/LOOK-V2.md`, `K.look()`; the template has it). Copy the closest finished `scene.js` (pilot-01 for a voice note, real-estate-never-loses
   for a script) and adapt it. Approved `library/objects/` only; new objects go through Codex + Ahmed.
   Defaults since 2026-10-11 (`docs/LOOK-V2.md` section 9): complete first frame, fill the frame, charts with
   weight, bars to scale, paper world (`K.world`) for 1-2 chapters, takeaway ending, smooth camera
   (`K.camSmooth`), sound mix 2 (`K.mix = 2`).
   **Simple hook (Ahmed 2026-10-11, every video):** the hook is the question headline plus ONE hero object,
   nothing else: no second object, character, tag, arrow, label, foreground blur or extra beat until the question
   ends. Glow, float and one slow push are the only movement. Ignore lint's hook `dead` flag for this stretch.
   Approved default (Ahmed, 2026-10-11, "this can be the default"): copy the hook of `projects/us-dollar-decisions`
   (v4): three-line question headline, keyword last in lavender, one 600 px hero with glow + float.
   Pace (2026-10-13): the hero settles from oversized on frame 1 (`K.settle`) instead of the slow push, and
   `K.captionsFrom` hides the caption until the question ends (copy `projects/us-dollar-decisions-pace`, section 1).
   **Pace is the default (Ahmed 2026-10-13: "apply all the changes", then "update the engine locally and the github repo"):**
   `runtime/kanz-pace.js` + `K.pace()` after `K.look()` (the template has both; read `docs/PACE.md`). Boards arrive built
   (`K.go` + `at: g.lead`), each board opens close on its first object and pulls out (`K.frame`), one hero is carried between
   boards (`K.carry`, `K.dim`, never clear before building), hero entrances fly in (`enter: "fly"`), a few snap zooms
   (`K.snap`), camera drift between moves (`K.finish()` as the last line), 24 fps motion, room-tone bed, paper world at
   chapter turns, ending = cut back to the hook on the last word, ~1.3 s tail. Worked example: `projects/us-dollar-decisions-pace`.
   **Variety (Ahmed 2026-10-13, "apply all"):** read `docs/PACE.md` section Variety. One `K.punch` (with `riser: true`) on the
   key sentence; amounts as `K.stack`/`K.pile`; state changes as `K.swap`; places as map/globe + `K.pin`; real series through
   `engine/data.py` with a source line. Worked example: `projects/_suggestions-demo`. No ground plane (rejected 2026-10-13).
   **3D (Ahmed 2026-10-14, picked from `projects/_3d-demo`):** `runtime/kanz-3d.js` (the template loads it): `K.flip` for
   myth -> fact / question -> answer, `K.browser` + `K.pageOval` for genuine website screenshots, `K.fold` for a reveal.
   Rejected, do not rebuild: coin toss, isometric 3D bars, depth camera (objects at depth).
7. **Review.** `python engine/lint.py projects/<slug>` (safe zones, dead stretches, thin frames, hook, covered text,
   objects behind captions, objects past the side margin; fix or justify each flag), then `make.py review <slug> <times>` → look at `out/review.jpg`, fix, repeat.
8. **Render and check.** `make.py render <slug> v1` in the background, then `make.py check <slug> v1`
   (frames from the MP4 + loudness ≈ −16 LUFS). Open the MP4 for Ahmed (`ii <path>`).
   Cover (style A): write `projects/<slug>/cover.json`, run `python engine/cover.py projects/<slug>`, and check
   the crop lines in `out/cover-review.jpg`.
9. **Record.** Only in Ahmed's own copy (`D:\Claude Projects\Kanz\kanz-motion`); in any other clone (editors) skip
   this step entirely, see "Editors' copies" below. Commit the project (not `out/`), push, add a row to the usage log in
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
- **Numbers**: show only numbers the voice says. No "مثال افتراضي" tag on screen when the voice itself
  frames the figures as an example ("خلينا نقول", "لو"...) (Ahmed, 2026-10-11, all videos).
  Real market figures need a source on screen and in the project notes.
- **Look**: approved charcoal grain background, Thmanyah Display headlines, IBM Plex Sans Arabic
  text, lavender `#D5ADEF` as the only pointing colour, red only for genuine losses/risk.
  No slide counters. **Logo: none by default** (the recent Reels carry no logo, Ahmed 2026-10-06/07; reconfirmed
  2026-10-11, the template no longer has it). When a video does add it, it must contrast with whatever is behind it:
  the white logo turns dark automatically on the paper world (`runtime/kanz-look.css`); check every other light
  background (paper cards, photos, screenshots) in the review sheet (Ahmed 2026-10-11: white on white).
- **Direction**: text, highlights and label sequences run right → left; market charts keep
  time left → right.
- **Objects**: reuse `library/objects/` (copied from the Kanz approved library) first. New
  objects are made with **Codex** following the Kanz MD rules (open the approved references,
  match the fixed icon style exactly) and need Ahmed's approval before use. Never invent a new
  illustration style for a topic.
- **Websites** shown on screen must be genuine screenshots (source URL + capture date).
- **SFX**: only CC0 or explicitly licensed sounds; add each to `engine/sfx_library.py` with its
  source page so `library/sfx/manifest.json` stays complete. Sonniss/Mixkit files may be used
  locally but must not be committed. When the library lacks a sound, generate it with
  `engine/sfx_gen.py <new-category> <name> "<prompt>"` (ElevenLabs, paid-plan licence, recorded in
  `library/sfx/generated.json`). Always a new category: a file added to an existing one changes which
  sound finished videos pick on re-render. No generated music.
- **Transcripts and captions**: with a key, `make.py` transcribes with ElevenLabs Scribe v2 (its
  `"events"` list coughs/sighs/laughs for the EDL) and times captions to the corrected `script.md`
  with forced alignment; read the "check these captions" words it prints (usually digits).
- **Review before delivery**: render stills, look at them, render the MP4, then pull frames from
  the MP4 itself and check fonts, Arabic joining, overlaps and timing. Rendered ≠ approved ≠ posted.
- **Delivery** (Drive + Airtable `In Review`) follows the Kanz repo's delivery guide.

## Usage discipline (Claude Pro limits)

- One fresh session per video; default model Sonnet 5.5 at medium effort, Opus only for engine
  work. Follow `docs/EFFICIENCY.md` and add a row to its usage log at the end of every video.
- Review through one contact sheet (`make.py review`, `make.py check`), not image by image.
- Run renders in the background; do not poll them.

## Editors' copies: videos stay local (Ahmed 2026-10-14)

Any clone other than Ahmed's `D:\Claude Projects\Kanz\kanz-motion` is an editor's working copy. There, projects,
voices and rendered videos stay on the editor's machine: never `git add`, commit or push them (or anything else), and
never ask the editor to. GitHub flows one way, Ahmed -> editors. The editor hands over the MP4 directly (Drive or
however Ahmed asked), not through the repo. Steps 1-8 work the same. Skip step 9 (commit, push, usage log, Kanz backlog,
Drive/Airtable delivery) unless Ahmed asks for it.
To get engine updates, follow [docs/UPDATE.md](docs/UPDATE.md): a fast-forward pull that keeps every local project
untouched. Never `reset --hard`, `clean`, `checkout -- .` or drop a stash in an editor's copy.

## Repo hygiene

- Never commit `node_modules/`, `library/sfx/raw/`, `projects/*/out/` or source voice notes
  (`projects/*/audio/source.*`). Edited `voice.wav` is also ignored; keep it locally.
- Add new reusable components to `runtime/kanz.js` (not inside a project) and document them in README.
