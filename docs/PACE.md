# Pace: arrive built, never freeze, carry the hero

Built 2026-10-13 from the short-form pacing study (Kanz repo `reports/shorts-pacing-study-2026-10-13/`:
conversion.doc, Vox Shorts and 0x100x against our 7 Reels). Ahmed asked to "apply all the changes"; the first
video built with it is `projects/us-dollar-decisions-pace/` (the delivered v4 rebuilt; v4 itself is unchanged).
Opt-in: a project loads `runtime/kanz-pace.js` after `kanz-look.js` and calls `K.pace()` after `K.look()`.
Projects that don't load it render exactly as before.

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

`python engine/retime.py projects/<slug> --tempo 1.08 --max-pause 0.3` cuts pauses longer than 0.3 s down to 0.3 s and
speeds the voice 1.08× (pitch kept), mapping `build/timing.js`. Originals are kept (`voice-pre-retime.wav`,
`timing-pre-retime.js`). After retiming, render with `python engine/render.py` directly: `make.py review/render`
re-run captions and rebuild `timing.js` from the new voice (correct, but it needs the ElevenLabs alignment call).

## Sound

`K.bed = "room"` (set by `K.pace()`): `engine/render.py` mixes a generated, non-musical room tone (filtered brown +
pink noise, seeded, fully owned) 21 dB under the voice's median speech level, so pauses never drop to digital
silence. No music (Ahmed 2026-10-10). `K.pace({ bed: null })` turns it off.
