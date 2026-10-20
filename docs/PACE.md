# Pace: arrive built, never freeze, carry the hero

> **2026-10-17:** snap zooms are off by default (Ahmed rejected them twice; RULES PACE-5): `K.snap` only warns under the
> template's defaults, `{ force: true }` overrides one call. Rules in force: [RULES.md](RULES.md).

Built 2026-10-13 from the short-form pacing study (Kanz repo `reports/shorts-pacing-study-2026-10-13/`:
conversion.doc, Vox Shorts and 0x100x against our 7 Reels). Ahmed asked to "apply all the changes"; the first
video built with it is `projects/us-dollar-decisions-pace/` (the delivered v4 rebuilt; v4 itself is unchanged).
**Default for new videos since 2026-10-13** (Ahmed approved the before/after: "update the engine locally and the
github repo"). The template loads `runtime/kanz-pace.js` after `kanz-look.js` and calls
`K.pace({ defaults: "2026-10-18" })` after `K.look()`. Bare `K.pace()` is legacy compatibility.
Finished projects keep their existing calls and render as before.

**Quiz 2026-10-20:** pictures arrive and sit still, including the hook hero; only camera drift and explanatory
changes move (PACE-9). `float` stays available for legacy scenes; current-profile lint warns `idle-motion`.
Voice-note/script Reels prefer photo openings (`K.screen` from 0, `K.captionsFrom = 0`, optionally a live line).
Question-hero openings stay allowed; only those hold captions until the question ends (HOOK-1..4).

## What the study found (why this exists)

| Problem in our Reels | What the references do | Pace tool |
| --- | --- | --- |
| The camera lands on an empty board; objects wait for their noun (us-dollar v4: empty 26.08–26.75 s) | never empty for more than a frame or two | `K.go()` + `at: g.lead` |
| Pop, then freeze: ~half the frames identical | the camera never stops (0x100x drifts 2–3 %/s) | drift in `K.finish()` |
| Each board rebuilt from scratch (the dollar 6 times) | one hero carried and transformed | `K.carry()`, `K.dim()` |
| Board change = frozen pause + 0.75 s move + wait for the noun (1.6–2 s) | change inside the breath, 0.35–0.6 s | `K.go()` starts at the pause |
| First icons at 10–15 % of the frame width | start big, pull out as the board fills | `K.go(..., {scale, dx, dy})` then `K.frame()` |
| Static 4.4 s hook; caption repeats the headline | first change by 0.25 s | `K.settle()`, `K.captionsFrom` |
| Dead silence ~23 times a minute | a bed under every pause | `K.bed = "room"` |
| 2.3 words/s ElevenLabs voice | ~3 words/s | `engine/retime.py` |

## Recipe

```js
K.look();
K.pace({ defaults: "2026-10-18" });           // 24 fps motion, smooth camera, mix 2, room tone, drift
// boards in a snake: neighbours 1,100 px apart in a row, rows 1,800 apart (less is visible under the captions)
const g = K.go(T("word"), "board2", { scale: 1.3, dx: 230, dy: -60 }); // close on the first object
K.img(B.board2, src, { x, y, w, at: g.lead, enter: "fly" });            // lands with the camera
K.frame(N("next") - 0.25, "board2");                                    // pull out as the second idea arrives
K.carry(hero, "board2", g.start, { x, y, w, opacity: 0.3 });            // the hero rides the move, dimmed, until its line
// ... last line of scene.js:
K.finish();                                                             // adds the drift between camera moves
```

- `K.go(tWord, id, o)` starts the move at the end of the previous word (inside the pause), 0.5 s long, landing by
  ~0.2 s after the word. Returns `{start, arrive, lead}`. Give the board's first element `at: g.lead`.
- `K.frame(t, id, o)` is a 0.55 s reframe on the same board, silent. Keep reframes at scale ≤ 1.1 on boards whose
  objects reach the edges, or labels get cut (review 2026-10-13).
- `K.carry(el, toId, t, o)` moves `el` from its board to `(x, y)` on another board with `w`, `rot`, `opacity`.
  Animate carried objects with `x`/`y`/`scale` only (never `left`/`top`), and create them with `shadow: false`.
- `K.dim(els, t, op)` fades obsolete objects (to 0 when replacing) while their replacement arrives: never clear first.
- `K.img(..., { enter: "fly", fromScale, fromX, fromY })`: from 1.9× and 170 px low, settles in 0.85 s (`power3.out`).
  Small tags and labels keep the bounce.
- `K.settle(el, 0, {fromScale})`: the hook hero is complete on frame 1 and settles from oversized (simple-hook
  composition unchanged: headline + one hero). For this question-hero opening only, set `K.captionsFrom` to the end of the question.
- `K.pointer(board)`: one lavender ring that hops `p.to(t, x, y, w, h)` between targets, `p.out(t)`.
- Drift: 2 %/s scale, capped at 7 %, 8 px/s sideways, alternating. Higher crops edge objects.
- Grain stays at 12 steps/s and boil at 8, so the texture keeps its hand-made step while motion is smooth.

## Voice

`python engine/make.py retime <slug> [tempo=1.08] [max-pause=0.3]` cuts pauses longer than 0.3 s down to 0.3 s,
speeds the voice by `tempo` (pitch kept), remaps `transcript.json`, `transcript.aligned.json` and `build/timing.js`,
then rebuilds the captions. Originals are kept with a `-pre-retime` suffix and every run starts from them, so settings
never compound. Script route: run it right after `make.py tts` (and after any voice fix round). A transcript without a
`retime` stamp (a new `tts`/`audio`) refreshes the saved originals first (fixed 2026-10-14: a fix round was retimed from the old take). Voice notes are already
1.25x: `make.py retime <slug> 1.0` tightens the pauses only. `make.py review/render` stay in sync afterwards
(verified on us-dollar-decisions-pace: 171/171 words, identical timings).

## Sound

`K.bed = "room"` (set by pace): `engine/render.py` mixes a generated, non-musical room tone (filtered brown +
pink noise, seeded, fully owned) 21 dB under the voice's median speech level, so pauses never drop to digital
silence. No music (Ahmed 2026-10-10). `K.pace({ defaults: "2026-10-18", bed: null })` turns it off.
`K.bedUnder = 30` (after the pace call) sets the level
per video in dB under the voice (Ahmed 2026-10-13 on gamblers-fallacy v1 at 21 dB: "extremely cool but too loud").

## Variety (2026-10-13, default for new videos)

From the visual review of `us-dollar-decisions-pace` v3: pace was fixed, but almost every frame was one grey object on
charcoal with a small label. Ahmed approved everything in the review ("love everything, apply all") except the ground
plane. Worked example of each device: `projects/_suggestions-demo/` (fixed seconds, no voice, not for posting; render with
`python engine/render.py projects/_suggestions-demo --from <s> --to <s> --name <clip>`).

Use these where the script gives a reason; the aim is that a video uses several kinds of picture, not every device:

| When the voice... | Use | Note |
| --- | --- | --- |
| says the video's key sentence (the thesis) | `K.punch(html, t0, t1, { size: 170, riser: true })` | once per video; `riser` plays the generated swell that lands on `t0` (max one riser per video). Hold it over the next board move so a carry happens behind it |
| compares amounts | `K.stack` / `K.pile` at true relative size | numbers only if the voice says them |
| says something changes state (opens, empties, gives up) | `K.swap(img, src, t)` | wallet open/empty, savings jar levels, safe open, poses |
| says someone goes somewhere | `K.walk(board, [walkA, walkB], { from, to, at, dur, w, rest })` | right to left reads naturally |
| names places | `K.img(... kanz-map-usa ...)` / `kanz-globe` + `K.pin` + `K.arrow` | base map: Natural Earth still to download |
| turns a chapter | `K.wipe(t)` (fixed 2026-10-13: it left a 200 px band) or `K.world` paper | |
| cites a real series | `K.area({ ..., source })` with data from `engine/data.py` | source line on screen + `CREDITS.md` |
| shows a real photo | `K.photo` (now with a camera-shutter sound) | needs a licensed, sourced photo file first |

**Approved 2026-10-17 ([DECISIONS](DECISIONS.md#2026-10-17)); generation-time status below.**
New objects 2026-10-13 (`library/objects/PROVENANCE-2026-10-13.md`): approved copies from the Kanz explainer library
(bank card, cash, EGP coin, payment terminal, empty tomato basket, F01 checking a receipt) and Codex **candidates** until Ahmed
reviews them: container ship, globe, gold bars, oil barrel, phone with a blank screen, rate dial, stock exchange.

New sounds: `riser` (generated swell, for the one key reveal) and `shutter` (camera, used by `K.photo`), both in their own
categories in `library/sfx/generated.json`.

Lint (`engine/lint.py`) also reports, since 2026-10-13: **covered** text (a label under an object at a sampled frame, or
more than a quarter under a caption), objects **behind captions**, and objects pushed **past the side margin** (faint
`K.bgObj` figures included). On the v3 baseline it caught the hidden `حكومات` label (32.75 s), the edge figure (16.5 s)
and three problems the eye review missed (the dollar on the labels at 7.75–9 s, the stack at the left edge at 20 s, the
price tag off the right edge at 48–54 s). A one-frame crossing during a fast camera whip is not reported, by design.

## Frame guard (2026-10-14, on by default)

An editor's neckline Reel showed the camera pushing people, chart labels and an arrow past the frame edge: drift keeps
panning 8 px/s for the whole gap and zooms up to 7 %, `K.snap` zooms 1.3x on the frame centre, and close framing does not
know how wide the board is. `runtime/kanz-pace.js` guards every pace video, including legacy bare `K.pace()`. Before the first frame it steps
through the video (every 1/12 s, held shots only) and measures each visible object, label, card and chart mark. Where
one would cross lint's side margin (x 65..1015 above y 1000, 120..960 below), it adds the smallest pan, then a zoom-out
(never below 0.8x), on `#camwrap`. It starts ~0.45 s early and eases, so it reads as camera work. Camera moves blend from
one board's correction to the next. During a snap it is measured live, which softens a snap that would crop.
On gamblers-fallacy / us-dollar-decisions-pace the frame-edge cuts in held shots went to zero (before/after stills
reviewed 2026-10-14).

- Ignored: `K.fg` blur, glows, shadows, maps (`.kmap`), elements mostly (>70 %) outside the frame, and elements still
  oversized from a fly-in or `K.settle`.
- A framing that should crop on purpose: `K.cam(t, id, { crop: true })` / `K.frame(..., { crop: true })` (no guard until
  the next camera move). One element: `K.free(el)`. The whole video: `K.pace({ defaults: "2026-10-18", keep: false })`.
- Lint and renders use the guard automatically (they call `K.seek`). `K._keepKind(t)` says whether a time is a held
  shot, a move, a snap or a free framing, for review scripts.

## Visual defaults (2026-10-17, new videos)

From a visual review of 7 shipped Reels (2026-10-17). The template now calls `K.pace({ defaults: "2026-10-18" })`,
which includes these defaults and the shorts refinements. Legacy finished projects call `K.pace()` without `defaults`
and render exactly as before (golden stills of 7 finished projects, byte for byte, before/after the original change).
Each default switches off on its own: `K.pace({ defaults: "2026-10-18", fly: false })`.
Before/after stills of all five: `projects/_visual-defaults-demo` (`index.html` vs `index.html?old`).

| Key | What it fixes (seen in) | What it does |
| --- | --- | --- |
| `band` | objects and labels under the captions (us-dollar-decisions-pace 57 s, gamblers-fallacy 8 / 74 s, portfolio-rebalancing 46 s) | the frame guard keeps `img.obj`, `.t` and `.tag` out of `K.CAPBAND` (screen y 1190..1450) while captions can show: pan up first (never pushing anything above the safe top that was not there), then zoom out, never below 0.8x, starting 0.45 s early |
| `lead` | the camera lands on a half-built board | every element of the board scheduled after `g.lead` and before `g.arrive + 0.5` is moved to `g.lead`. A chart (`K.area`, `K.line`, `K.candles`) that starts there is ~40 % drawn when the camera lands and finishes 0.6 s later. Marks (`K.oval`, `K.arrow`, highlights) stay on their word. Call `K.go` before the board's elements |
| `punch` | ghost text (short-biggest-betting-event 30 s, real-estate 46-50 s) | `K.punch` hides the caption for its duration; `K.dim` takes text, tags, cards and marks to 0, objects to `op` (0.3) |
| `fly` | huge fly-ins across the captions | `enter: "fly"` starts at most 1.4x for objects wider than 500 px, from above when the object sits in the board's lower half, and falls back to scale-only (only as big as fits) when the start box would cross the caption band or the headline |
| `marks` | rings and frames that miss or cut the text; arrows pointing at guessed coordinates | see below |

Marks sized to an element (the element forms work in every project; only the warning and the arrowhead need `marks`):

- `K.oval(board, el, { at })`: the smallest oval of the element's proportions that clears its box + 16 px.
- `K.rect(board, el, { at })`, or `K.frame(el, { at })`: the hand-drawn frame at the box + 16 px.
- `K.arrow(board, fromEl, toEl, { at })` or `K.arrow(board, x1, y1, toEl, { at })`: stops 16 px short of the target's
  box. With `marks`, an arrow without a target logs a warning (in `K.warnings`), and every arrow uses one arrowhead: an
  open chevron 3.6x the stroke width (min 22 px) on the curve's tangent.
- `K.docMark(doc, { x, y, w, h }, { frame: true })`: a frame on a screenshot stands 16 px clear of the phrase.
- `pad` changes the 16 px. The box is the element's layout (entrance transforms ignored), measured on the first
  `K.seek` once fonts and images are ready, and the mark is inserted behind the element.

**Rejected (Ahmed 2026-10-13): a ground plane** (a faint floor and horizon under objects). Objects stay on the plain
charcoal/paper world; don't add floors or horizons.

Rendering: `engine/render.py` reopens the page and redoes the frame when Chromium fails a screenshot ("Unable to capture
screenshot", seen at ~7.7 s with 1.5 GB of memory free); stills retry the same way.
