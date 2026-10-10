# Look v2: fuller, lit, evidence-led Reels

Approved by Ahmed 2026-10-10 for **new videos only** (finished Reels are not re-timed or re-rendered).
No music: that was his decision on 2026-10-10, so sound stays voice + SFX.

New projects copied from `projects/_template` load `runtime/kanz-look.css` + `runtime/kanz-look.js`
and call `K.look()` before the first `K.cam()`. Older projects don't load them and render exactly as before.
A project that started before look v2 can opt in by adding those two lines to its `index.html`
(after `kanz.css` / `kanz.js`) and `K.look()` at the top of `scene.js`. Expect to re-place things:
the camera now centres boards higher (y 765 instead of 960) and captions move up.

Worked example of every component: `projects/_look-demo/` (fixed seconds, no voice; not for posting).

## 1. Safe zones (all platforms)

The 1080×1920 frame is shared with the platform's interface: the top bar, the caption and username at
the bottom, and the like/comment/share column. That column is on the right in English interfaces and on
the **left in Arabic interfaces**, so Kanz keeps both sides clear.

| Zone | Keep text out of | Why |
| --- | --- | --- |
| Top | y < 270 | Meta's Reels guidance: top 14% (≈270 px) |
| Bottom | y > 1440 | Caption, username, audio line: 250–480 px bottom on TikTok / Reels / Shorts (organic) |
| Sides, lower half (y > 1000) | x < 120 or x > 960 | Action-button column, about 100–200 px wide depending on platform |
| Sides, upper half | x < 65 or x > 1015 | Meta's 6% side margin |

So text lives in **x 120–960 × y 270–1440** (wider, 65–1015, above y 1000). Captions sit at y 1268–1432,
the headline starts at y 300, and `K.look()` centres boards in the space between them (view y 765).
Objects can bleed off the edge (decorative foreground, a pile running out of frame) but a focal object
should not be cut by the UI.

These figures are a conservative working default, not an official spec: Meta publishes margins for
Reels **ads** (14% top, 35% bottom, 6% sides); TikTok and YouTube publish no organic pixel spec, so
the bottom/side numbers come from third-party measurements, which vary. Ads would need the larger
35% (670 px) bottom margin. Sources: [Hopper HQ](https://www.hopperhq.com/blog/instagram-reel-size/),
[House of Marketers](https://houseofmarketers.com/guide-to-safe-zones-tiktok-facebook-instagram-stories-reels/),
[Reap](https://reap.video/blog/short-form-video-safe-zones),
[Adaptlypost](https://adaptlypost.com/blog/social-media-safe-zones-2026-complete-guide),
[Poster.ly](https://www.poster.ly/tools/safe-zone-checker), [AdKit (Shorts)](https://adkit.so/tools/safe-zones/youtube),
[Inro](https://www.inro.social/tools/instagram-reels-safe-zone-checker). Checked 2026-10-10.
After the first posts, screenshot a real Reel/TikTok/Short on a phone in both Arabic and English UI and
tighten these numbers if needed.

**Check:** `python engine/lint.py projects/<slug>` before every render (step 7 of the checklist).

## 2. Lint: catch problems before rendering

`engine/lint.py` steps through the scene every 0.25 s (no video render, about a minute) and reports:

- **safe**: text outside the zones above; focal objects cut by them.
- **dead**: more than 2.5 s with nothing new on screen and the camera still (Vox rule: something new every 1.5–3 s).
- **thin**: 1.5 s or longer where content covers less than 30% of the safe area.
- **hook**: the first visual arriving after 1.0 s.

It writes `out/lint.json` and `out/lint.jpg` (one frame per finding, the unsafe zones shaded red).
These are review flags, not hard failures. Fix them or say why they stay. For calibration,
the-cost-of-a-mistake v5 (old look) scores: median fill 31%, 4 dead stretches, 6 thin stretches.

## 3. Fill the frame

- Hero object or character at **450–600 board px wide** (the old videos used 120–330), on its own board.
- Use `K.push()` to move in on the detail being discussed (1.2–1.6×), not only at board changes.
- Taller compositions: `K.board(id, x, y, { h: 1000 })`; the camera centres on the real height.
- Depth layers:
  - `K.fg(board, src, { x, y, w, at, depth: 0.45, blur: 7, dim: 0.5 })`: a blurred object close to the
    lens at a frame edge. It moves faster than the world when the camera moves. Lint ignores it.
  - `K.bgObj(board, src, { x, y, w, at, opacity: 0.22, depth: -0.3 })`: a faint object far behind.
  - `K.depth(el, f)` gives any element parallax (f > 0 foreground, f < 0 background).
  - `K.img(..., { depth })` does the same for an object with its shadow.

## 4. Light and shadow

`K.look()` turns on a soft key light behind the content, a deeper vignette, and a two-layer object shadow.

- **Contact shadow** under every `K.img` (default on). It follows the object's entrance, movement and fade.
  When the PNG has empty space under the object, pass `ground: <board y of its base>`. Use `shadow: false`
  for floating things (icons in the air, tags).
- **Glow**: `K.img(..., { glow: true })` (or a diameter) puts a pulsing lavender light behind the focus.
  Standalone: `K.glow(board, x, y, size, { at, out })`. One focus at a time; lavender stays the only pointer.
- **Float**: `K.img(..., { float: true })` (or px) gives a slow idle bob, so held shots don't freeze.
- Standalone contact shadow: `K.shadow(board, cx, groundY, w, { at, out })`.

## 5. Evidence on screen (Vox's credibility device, Kanz version)

- `K.doc(board, src, { x, y, w, at, out, rot, source })`: a **genuine** screenshot on paper with tape.
  `source` is the line under it, e.g. `"رويترز · ٥/١٠/٢٠٢٦"`. Record URL + capture date in `assets/SOURCE.md`.
  Crop the screenshot to the relevant paragraph or headline. A full page is unreadable on a phone even when zoomed.
- `K.docMark(doc, x, y, w, h, { at })`: a lavender highlighter sweeps right → left over the phrase
  **as it is spoken**. Coordinates are in the screenshot's own pixels. `{ frame: true }` draws a box instead.
- `K.docFocus(t, doc, x, y, scale, dur)`: camera push onto that point of the screenshot. Don't use
  `{ via }` on the `K.cam()` right after it.
- `K.photo(board, src, { x, y, w, h, at, out, credit, graded, pos, kb })`: a real photo, slow push-in,
  credit line. Without `graded: true` it applies a reversible CSS grade (grayscale, quiet edges, light
  purple-black). The full treatment in Kanz `brand/image-treatment/CREATE-A-BRANDED-IMAGE.md` is done on
  the file beforehand, then passed with `graded: true`.
- `K.map(board, src, { x, y, w, at })` + `K.pin(board, x, y, label, { at, side })` +
  `K.outline(board, svgPath, { at })`: a grayscale base map, lavender pins with labels, drawn region outlines.
  **Base maps still need a source:** Natural Earth (public domain) is the proposed one; it isn't downloaded yet.

Screenshots must be real captures (Kanz rule). Never recreate a website or a headline.

## 6. Numbers become things

Only numbers the voice says. Hypothetical examples carry "مثال افتراضي".

- `K.count(board, { x, y, from, to, at, dur, size, digits: "ar" | "en", step, prefix, suffix })`:
  counts up with soft clicks and lands on a coin sound. Arabic-Indic digits by default.
- `K.pile(board, src, { x, y, n, w, at })`: n copies drop into a heap, bottom row first, with coin sounds.
- `K.stack(board, src, { x, y, n, w, at })`: a bar built from objects (banknotes, coins), growing upward.
  Use two stacks of different n for a comparison at true relative scale.

## 7. The first two seconds

Open on the most dramatic image of the story, then rewind into it. The first visual must land by 1.0 s
(lint checks this). Big hero object + headline + glow by 0.3 s. Not a single word on an empty board.

## 8. Characters and objects that act

New assets still come from Codex under the Kanz icon-style rules, and Ahmed approves each one first.
The request list is `docs/CODEX-ASSET-REQUESTS.md`: more poses for M01/F01/M02, and objects split
into parts (like the balance scale) so they can move.
