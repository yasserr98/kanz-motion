# Decisions log

Every dated decision Ahmed made about Kanz Motion, oldest first, with his words where they were recorded. Moved here
from `AGENTS.md` on 2026-10-17 (workflow review M2) so the checklist only carries the rules in force; nothing was
dropped. The rules themselves, one line each, are in [RULES.md](RULES.md). A decision that a later one replaced is marked
**Superseded** with what replaced it; the original text stays.

Component details and the reasons behind look v2 and pace stay in [LOOK-V2.md](LOOK-V2.md) and [PACE.md](PACE.md).

## 2026-10-05

- **Audio speed.** Default speed 1.25x for voice notes (Ahmed, 2026-10-05). Rule: VOICE-2.
- **Research.** The Vox research (`VOX-RESEARCH-FINDINGS.md`) started the visual system. **Historical** since
  2026-10-17: background, not current rules.

## 2026-10-06 / 07

- **Logo: none by default.** "the recent Reels carry no logo" (Ahmed 2026-10-06/07); reconfirmed 2026-10-11, the
  template no longer has it. Rule: LOOK-4.

## 2026-10-10

- **Look v2** for new videos (safe zones, light, depth, evidence and number components; `LOOK-V2.md`). Rule: LOOK-1.
- **No music.** Sound stays voice + SFX. Rule: SND-1.
- **Codex objects.** "create whatever you need from codex" (batch 2026-10-10, `library/objects/PROVENANCE-2026-10-10.md`).
  The batch is still marked candidate; statuses now live in `library/objects/manifest.json` (2026-10-17).

## 2026-10-11

- **Voice for every script video.** "Voice (Ahmed 2026-10-11, every script video): the instant clone "Ahmed Shaaban
  Shorts" `UeQ9UTIKgN2rsbnqHH5w` (the `.env` default). Never use the professional clone "Ahmed Shaaban"
  `zb1ukG6KkE2RYSjMU6b3`: compared on us-dollar-decisions, Ahmed said the old one "was way better"." Rule: VOICE-4.
- **Style review defaults** (`LOOK-V2.md` section 9): complete first frame, fill the frame, charts with weight, bars to
  scale, paper world (`K.world`), takeaway ending, smooth camera (`K.camSmooth`), sound mix 2 (`K.mix = 2`), cover style A.
  Rejected: on-screen source documents as a default device, bigger characters with object stacks.
  - "paper world (`K.world`) for 1-2 chapters": **Superseded** 2026-10-13 by "paper world at chapter turns" (pace).
  - "takeaway ending": **Superseded** 2026-10-13 by the pace ending (cut back to the hook on the last word, ~1.3 s tail).
- **Simple hook (every video).** "the hook is the question headline plus ONE hero object, nothing else: no second
  object, character, tag, arrow, label, foreground blur or extra beat until the question ends. Glow, float and one slow
  push are the only movement. Ignore lint's hook `dead` flag for this stretch." Rule: HOOK-1.
  - "one slow push": **Superseded** 2026-10-13 by `K.settle` (the hero settles from oversized on frame 1).
- **Hook reference.** "this can be the default": copy the hook of `projects/us-dollar-decisions` (v4): three-line
  question headline, keyword last in lavender, one 600 px hero with glow + float. Rule: HOOK-2 (now via
  `examples/us-dollar-decisions-pace`, section 1).
- **Numbers.** No "مثال افتراضي" tag on screen when the voice itself frames the figures as an example ("خلينا نقول",
  "لو"...) (Ahmed, 2026-10-11, all videos). Rule: NUM-2.
- **Logo contrast.** When a video does add the logo, it must contrast with whatever is behind it (Ahmed 2026-10-11:
  white on white). Rule: LOOK-4.

## 2026-10-13

- **Retime (pace).** Once the voice is final, `make.py retime <slug>` (pauses to 0.3 s, tempo 1.08); voice notes
  `make.py retime <slug> 1.0`. Rule: VOICE-5.
- **Pace is the default.** Ahmed: "apply all the changes", then "update the engine locally and the github repo".
  `runtime/kanz-pace.js` + `K.pace()` after `K.look()`: boards arrive built (`K.go` + `at: g.lead`), each board opens
  close on its first object and pulls out (`K.frame`), one hero is carried between boards (`K.carry`, `K.dim`, never
  clear before building), hero entrances fly in (`enter: "fly"`), a few snap zooms (`K.snap`), camera drift between moves
  (`K.finish()` as the last line), 24 fps motion, room-tone bed, paper world at chapter turns, ending = cut back to the
  hook on the last word, ~1.3 s tail. Worked example: `projects/us-dollar-decisions-pace`. Rules: PACE-1..6.
  - "a few snap zooms (`K.snap`)": **Superseded** 2026-10-17 (snap zooms off by default).
- **Hook under pace.** The hero settles from oversized on frame 1 (`K.settle`) instead of the slow push, and
  `K.captionsFrom` hides the caption until the question ends (copy `projects/us-dollar-decisions-pace`, section 1).
  Rule: HOOK-3.
- **Variety.** "apply all": one `K.punch` (with `riser: true`) on the key sentence; amounts as `K.stack`/`K.pile`;
  state changes as `K.swap`; places as map/globe + `K.pin`; real series through `engine/data.py` with a source line.
  Worked example: `projects/_suggestions-demo`. Rule: PACE-7.
- **Rejected: a ground plane** (a faint floor and horizon under objects). Rule: LOOK-6.
- **Room tone level.** "extremely cool but too loud" (gamblers-fallacy v1 at 21 dB): `K.bedUnder` per video. Rule: SND-3.

## 2026-10-14

- **Two repos, two rules.** kanz-motion is public (anyone can clone it, no GitHub account); Ahmed's sessions push engine,
  runtime, docs, template and examples; editors pull only. Rule: REPO-1.
- **Editors' copies: videos stay local.** Any clone other than Ahmed's is an editor's working copy: projects, voices and
  rendered videos stay on the editor's machine; never `git add`, commit or push them, and never ask the editor to. GitHub
  flows one way, Ahmed -> editors. The editor hands over the MP4 directly. Updates: `docs/UPDATE.md`; never
  `reset --hard`, `clean`, `checkout -- .` or drop a stash in an editor's copy. Rules: REPO-2, REPO-3.
- **3D** (picked from `projects/_3d-demo`): `K.flip` for myth -> fact / question -> answer, `K.browser` + `K.pageOval`
  for genuine website screenshots, `K.fold` for a reveal. Rejected, do not rebuild: coin toss, isometric 3D bars, depth
  camera (objects at depth). Rules: PACE-8, LOOK-6.
- **Snap zooms rejected in a video** (portfolio-rebalancing v1: the snap zoom at 10-11 s "suck"; all `K.snap` removed
  from that video). Led to the 2026-10-17 default.

## 2026-10-16

- **Images and icons: always ask Codex.** "if the video needs images or icons, it doesn't hesitate to grab the context
  of the whole thing and talk to Codex to generate this stuff ... we need to use Codex, we're not using it that much."
  Every video gets an image pass before the scene is written; do not settle for whatever `library/objects/` already has.
  Rules: IMG-1..3. This replaces the earlier "reuse `library/objects/` first" standing rule as the default order; approved
  library objects stay usable where they are the right picture (OBJ-1).
- **Three visual types.** "the MD files were meant for icons rather than photos; free photos are great; the Kanz
  disposable is super great too but without the date". Full-screen photo for a place, disposable print for a real person
  or moment, Kanz icon for a concept. Rule: IMG-4.
- **No credit line on screen.** "just the image" / "don't add the image source, just the image": credits go in the post
  caption from `projects/<slug>/CREDITS.md`. Rule: IMG-6.
- **Headline lift.** "make sure the text of the headline doesn't blend in the image": `K.screen` darkens the bands each
  photo needs; `engine/contrast.py` must reach 4.5:1. Rule: IMG-7.
- **Gambling content: never a hijabi woman.** "we don't need to involve hijabis in gambling at all". Rule: IMG-9.
- **Shorts route** (cut from a long Kanz video), all from 2026-10-16: work locally ("we can do it locally here"); Codex
  runs the transcript ("use Codex for the transcription"); first 3 s always show his face ("always always"); trim the
  trailing second; keep a styled TV-set opening ("leave the TV part and the zoom in"); don't cut back to his face at the
  end; keep the source's burned-in labels ("leave it, it looks cool"); the clean cut at every change (he hated the soft
  dissolve; whip, zoom-through and TV-glitch exist but were not picked); no snap zooms or face jump zooms by default
  ("glitch at 14 s", "weird zoom at 16 s"); pay off what the hook promises; every picture belongs to the line (the phone
  icon under the house was "irrelevant"). Rules: SHORT-1..10.

## 2026-10-17

- **Voice-note and script Reels use the same three visual types.** "can this flow be incorporated in the VNs too".
  Rule: IMG-5.
- **Workflow review approved** ("do everything except for the colors of the charts leave them with different colors I
  like it"), review samples page 2026-10-17:
  - M1: projects local, curated `examples/`, receipts, the upload step and the usage log in the private Kanz repo.
    Untracking the already-tracked projects and receipts, and any history scrub, wait for Ahmed's explicit go-ahead;
    old commits stay public. Rules: REPO-4, DEL-3.
  - M2: this log, `RULES.md`, the route files and an ~80-line `AGENTS.md`.
  - M3: one current worked example per route; warnings when a scene has `K.look` without `K.pace`. Rule: PACE-1.
  - M4: `library/objects/manifest.json` with approved/candidate status. Rule: OBJ-2.
  - M5-M8: `make.py ship`, `make.py doctor`, renders on the render host when one is set, cached audio mix. Rules: REV-3,
    REV-4.
  - V6 one digit system: Western digits with the Arabic percent sign (`35`, `65٪`). Rule: NUM-3.
  - V7 size floors: source lines 28 px, labels 34 px. Rule: TXT-1.
  - V8 at most four labelled elements per board; split a busier board into two beats. Rule: TXT-2.
  - V9 no label that repeats the caption word for word. Rule: TXT-3.
  - V10 one neutral chart style: **rejected**. Chart colours stay varied as they are. Rule: LOOK-5.
  - V11 keep contrast on the paper world. Rule: LOOK-3.
  - V12 snap zooms off by default (drift and pull-outs only). Rule: PACE-5.
  - V1-V5 visual defaults (caption band, built arrivals, punch hides the caption, capped fly-ins, marks sized to their
    element): in `K.pace({ defaults: "2026-10-17" })`, the template's default. Rule: PACE-2.
