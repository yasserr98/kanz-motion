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

- **Workshop/live footage: alternate split screen and full screen.** "all of workshop videos inserts should alternate
  between the split screen and full"; the split is 50/50 ("yeah 50 50": his tracked face in one half, the board in the
  other). In shorts cut from his X Live workshops, motion inserts alternate between that split screen and a full-screen
  board, still with clean cuts in the pauses; the camera tracks him (he moves around the 16:9 frame). Use the shared
  split/tracking helpers built for `projects/short-volume-doesnt-matter` once they exist; do not build a second version.
  Rule: SHORT-11.
- **Title in the first 3 seconds; subtitles off under it.** "add a caption in the first 3 seconds and that caption cancels the
  subtitles when its there". Every short opens with a title over his face for 3 s and no subtitles while it shows; three
  title options per reel go to Ahmed ("extract 3 different options for the titles and show me"), and five on-screen
  treatments were shown for him to choose ("show me 5 different ways"). **Supersedes** the 2026-10-16 "no headline hook
  over it; captions run from 0" part of the shorts route; his face in the first 3 s stays. Rule: SHORT-4.
  Treatment chosen from the five shown: the sticker, white ("3a but remove the purple, looks way better with the white
  thing"); built as `K.title` in `runtime/kanz.js`. Title picks go on the main review page next to each reel ("add the
  title choices with the main review page and build it after they're all done").
  Placement (same day): "the headlines are placed in a good placement like for example on the youtube video Casino headline
  can be placed in the middle of the video near the captions so that we avoid adding it on his face": `K.title` defaults to
  y 1150, just above the subtitle band. "make the headlines editable": the review page lets Ahmed type his own title;
  an Approve button there marks a rendered version for Drive + Airtable delivery, whose Brief carries the captions.
- **Workshop titles at the top.** "titles for workshop video should be on the same level as this one" (live A v3, title under
  the platform bar). Live/workshop shorts use `K.title(text, { y: 330 })`; long-video shorts keep the mid-frame default. Rule: SHORT-4.
- **Egyptian Arabic subtitles on cut-out shorts.** "subtitles should be arabic egyptian arabic even if it was said in
  English for these so that people can understand; this rule is only valid for things we cut out" (live H v1, 10 s).
  Rule: SHORT-14. Replaces the verbatim-English caption lines in the live shorts.
- **A breath at every voice join.** "the clean cut was great but there should've been a short moment of silence just
  enough to allow the transition ... between the sounds not the visuals" (casino H v4, 20 s). Rule: SHORT-13. The
  dead-air trim (pauses over ~0.3 s) still applies; it must not butt two phrases together.
- **Subtitles in the middle during the split.** "subtitles need to be in the middle in the 50 50 split then gets back to
  its place if only him is showing". Rule: SHORT-12.
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
- **Old projects untracked** ("untrack the old projects and the delivery.json receipts from the public kanz-motion repo,
  keep the files on my disk ... No history rewrite"): 14 finished projects and their 9 receipts left the index in
  `96606bb`; the files stay on Ahmed's disk, git-ignored. Old commits stay public. Rule: REPO-4.
- **All library objects approved** ("approve the objects of course"): the 51 candidates in
  `library/objects/manifest.json` (the 2026-10-10 sheet, batch 2 of 2026-10-11, the 2026-10-13 and casino batches, the
  2026-10-14 stocks batch) are approved. The hijabi character `kanz-npc-f01-*` stays out of gambling scenes. New Codex
  objects still start as candidates until Ahmed approves them. Rule: OBJ-2.

## 2026-10-18

- **Mix and master** ("mix and master all videos properly because the sound effects sometimes overlap ...
  even the ones you're uploading now fix it then re-upload"): mix 2 now schedules one effect at a time, compresses the
  voice and masters in two loudness passes to -16 LUFS / -1.5 dBTP (replacing a single gain step and a -1 dBFS sample
  limiter). Delivered reels are re-sounded with `make.py remix` so their approved picture is unchanged; live B v6 -> v7
  dropped 16 of 40 overlapping cues. Rule: SND-5.
- **Open decisions from the review hardening** (asked in one message, answered the same day):
  - (a) Face vs. animation in workshop shorts (live F: "show Ahmed's face more and less animation"; live H: "more dynamic
    animation"): his face, full screen or in the split, is on screen at least 50% of a workshop short; boards only where
    the line explains a mechanism, says a number or names something, and those inserts move. Rule: SHORT-15.
  - (b) Transitions (casino: the clean cut; live C: "make the transitions more smooth"): clean picture cuts between face
    and board, eased moves into and out of the 50/50 split, and never a cut or move inside a word. Rule: SHORT-16.
  - (c) Press photos of real moments (Mandi, Messi): a standing yes. Press photos of real public moments may be used in
    `K.snap35` with source and credit in `CREDITS.md`; never generated or repainted. **Changes** IMG-8 (openly licensed
    only). Rule: IMG-8.
  - (d) Re-running delivered reels through `make.py remix`: only when a reel is touched again (a revision or a
    re-upload); no bulk re-run. Rule: SND-5.
- **Room tone 40% quieter** ("sound of white noise the one you added, make it less by 40%"; "make sure to brief the
  hardening about the 40% thing because the sound was too loud", relayed by the reels coordinator session): the room
  tone bed is multiplied by 0.6 (-4.4 dB) after its per-scene level (`K.bedUnder`), in every mix 2 render; the trim is
  part of the mix cache key, so cached mixes refresh. Rule: SND-3.
- **Face <-> split stays a clean cut** (relayed the same day): asked first for a smoother face <-> split change, then,
  shown the 0.2 s dissolve of live C v4, "I hate this transition basically", then "can it be a clean cut?". Every change
  to or from his full face is a clean cut (face <-> board and face <-> split); no dissolve, crossfade or see-through
  frame anywhere. The eased move between the split and a full-screen board stays. Rule: SHORT-16.
- **Review hardening** (asked by the coordinating session from Ahmed's notes on ~15 shorts, 2026-10-05..18): the notes
  that kept coming back became engine defaults and failing checks, so a fix stays fixed. The last word cut off
  (casino A v4, F v3, H v2, E v4) -> the ending guard in `footage.py` and the ship ending/leak checks (SHORT-3); the
  title over his eyes (A, C, E, G, H) and a title that never rendered (live D) -> face boxes, `K.title()` from
  `_titles.json`, `on-face` and the ship title check (SHORT-4); source freezes read as lag (live C) -> `freezes.json`,
  `freeze` and the duplicate-frame check (SHORT-17), and `K.split` now waits for the full-face frame too (a face
  window under a split scene could be captured one frame late); visual errors in transitions (live H) -> the cut strips
  (SHORT-10); English subtitles left in -> `captions.py` fails (SHORT-14); the $ placed wrong after it was reported
  fixed (casino E 39.8 s) -> `K.money`, `$` inside the caption isolate, `stray-currency` (NUM-5); empty seconds on
  screen -> no lint-ok excuse over 1.5 s (REV-1) and K.duration ends with the voice; breathing room (casino C, F) ->
  `K.under`, `tight-gap` (TXT-5); effects stacking -> `sfx-overlap`, `sfx-orphan` (SND-5); dead air in workshops ->
  `tighten_footage.py` by default (SHORT-13); notes reported fixed without a picture -> the notes ledger (REV-7).
  Runtime changes switch on with `K.pace({ defaults: "2026-10-18" })` (the template); finished projects render as before.
- **(c) and (d) confirmed** (asked again here because the coordinating chat relayed different answers): press photos
  of real moments stay a standing yes (IMG-8). Remixing delivered reels: "nah its ok", then confirmed here: the new mix
  is for new renders only; a delivered reel keeps its sound unless Ahmed asks for that reel. **Replaces** (d) above
  ("only when a reel is touched again"). The five delivered reels remixed earlier today on his morning request stay as
  they are. Rule: SND-5.
- **(d) final** (same day, a minute later): "sorry lets make it whenever I touch it again". A delivered reel goes
  through `make.py remix` whenever it is touched again (a revision or a re-upload); no bulk re-run. **Replaces** the
  "new renders only" line above. Rule: SND-5.
- **Subtitles never move up onto his head** (live H v4: "why did you move the caption so upward on his face", "the
  captions up is soo bad"; on the v5 stills with the subtitles low over his chest: "this was super we can stick to it"):
  on face-only moments the subtitles stay at the usual height or move down toward y 1500 when his face reaches the band;
  the 2026-10-18 `faces` default no longer lifts them above his face. Rule: SHORT-12.
- **Explain with moving diagrams, not icons** (re-do review of rising-stock v1 and portfolio-rebalancing v4: "in the future
  I want there to be more illustrations and drawings that explain stuff rather than the icons, like when there is
  something technical and dynamic we need to explain it visually", "for these and the ones in the future"; on the hook's
  still chart icon: "this needs to be dynamic to show the stock rising and falling etc rather than just an image"; on a
  still monitor icon: "not explanatory at all"). Mechanisms, prices, percentages and comparisons are animated diagrams or
  drawn illustrations; icons only support. **Replaces** "concept, mechanism or number -> Kanz icon" in IMG-4.
  Rules: EXPL-1, EXPL-2, IMG-4, HOOK-2.
- **No replica ending, no dead silence** (same review: "the fact that we end the video with the same pic as the hook
  sucks I want it to be more dynamic", "last frame sucks we don't need a replica we need to keep the video going and
  remove the dead silence"). The last line gets its own moving visual and the video ends about 0.4 s after the last word.
  **Replaces** "ending = cut back to the hook on the last word, ~1.3 s tail" (2026-10-17). Rule: PACE-6.

## 2026-10-19

- **Local renders one at a time** (after five parallel local renders and lints ran his 16 GB PC out of memory and
  crashed Claude, asked how to run them: "Local, one at a time"). Every engine script that opens Chromium waits for one
  machine-wide slot (`engine/slot.py`, lock file `.local-render.lock`); a crashed job frees it. Full renders still go
  to the render host when `KANZ_RENDER_HOST` is set. Rule: REPO-6.

## 2026-10-20

- **Nothing overlaps the headline** (approving Why Sell Part of a Winning Stock v6, with a screenshot of the hook where
  the chart panel's top edge runs through the last headline line "ممكن تاخده؟": "ship it but for future reference I
  dont want that overlap"). Panel and card edges, chart and grid lines, objects and diagrams sit fully below the
  headline with `K.GAP` to spare. v6 shipped as it is; this applies from the next video. Rule: TXT-6.
