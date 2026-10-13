# Pace: arrive built, never freeze, carry the hero

Built 2026-10-13 from the short-form pacing study (Kanz repo `reports/shorts-pacing-study-2026-10-13/`:
conversion.doc, Vox Shorts and 0x100x against our 7 Reels). Ahmed asked to "apply all the changes"; the first
video built with it is `projects/us-dollar-decisions-pace/` (the delivered v4 rebuilt; v4 itself is unchanged).
**Default for new videos since 2026-10-13** (Ahmed approved the before/after: "update the engine locally and the
github repo"). The template loads `runtime/kanz-pace.js` after `kanz-look.js` and calls `K.pace()` after `K.look()`.
Finished projects don't load it and render exactly as before.

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
K.pace();                                   // 24 fps motion, smooth camera, mix 2, room tone, drift
// boards in a snake: neighbours 1,100 px apart in a row, rows 1,800 apart (less is visible under the captions)
const g = K.go(T("word"), "board2", { scale: 1.3, dx: 230, dy: -60 }); // close on the first object
K.img(B.board2, src, { x, y, w, at: g.lead, enter: "fly" });            // lands with the camera
K.frame(N("next") - 0.25, "board2");                                    // pull out as the second idea arrives
K.carry(hero, "board2", g.start, { x, y, w, opacity: 0.3 });            // the hero rides the move, dimmed, until its line
K.snap(N("emphasis"), 1.25, 0.6);                                       // one-frame snap zoom on an emphasis word
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
  composition unchanged: headline + one hero). Set `K.captionsFrom` to the end of the question.
- `K.pointer(board)`: one lavender ring that hops `p.to(t, x, y, w, h)` between targets, `p.out(t)`.
- Drift: 2 %/s scale, capped at 7 %, 8 px/s sideways, alternating. Higher crops edge objects.
- Grain stays at 12 steps/s and boil at 8, so the texture keeps its hand-made step while motion is smooth.

## Voice

`python engine/make.py retime <slug> [tempo=1.08] [max-pause=0.3]` cuts pauses longer than 0.3 s down to 0.3 s,
speeds the voice by `tempo` (pitch kept), remaps `transcript.json`, `transcript.aligned.json` and `build/timing.js`,
then rebuilds the captions. Originals are kept with a `-pre-retime` suffix and every run starts from them, so settings
never compound. Script route: run it right after `make.py tts` (and after any voice fix round). Voice notes are already
1.25x: `make.py retime <slug> 1.0` tightens the pauses only. `make.py review/render` stay in sync afterwards
(verified on us-dollar-decisions-pace: 171/171 words, identical timings).

## Sound

`K.bed = "room"` (set by `K.pace()`): `engine/render.py` mixes a generated, non-musical room tone (filtered brown +
pink noise, seeded, fully owned) 21 dB under the voice's median speech level, so pauses never drop to digital
silence. No music (Ahmed 2026-10-10). `K.pace({ bed: null })` turns it off.

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
| cites a real series | `K.area({ ..., source })` with data from `engine/data.py` | source line on screen + `assets/SOURCE.md` |
| shows a real photo | `K.photo` (now with a camera-shutter sound) | needs a licensed, sourced photo file first |

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

**Rejected (Ahmed 2026-10-13): a ground plane** (a faint floor and horizon under objects). Objects stay on the plain
charcoal/paper world; don't add floors or horizons.

Rendering: `engine/render.py` reopens the page and redoes the frame when Chromium fails a screenshot ("Unable to capture
screenshot", seen at ~7.7 s with 1.5 GB of memory free); stills retry the same way.
