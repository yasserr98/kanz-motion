# Workshop-short template (editor preset)

Opt-in starting point for shorts cut from Ahmed's workshop recordings, with the editor's review choices of 2026-10-23
built in. The rules and why: [docs/routes/workshop-editor-preset.md](../../docs/routes/workshop-editor-preset.md).
This folder is a stub with no voice: it is not linted or rendered as it stands.

1. Cut the clip with `engine/footage_track.py` (preset flags in the route doc), measured cut points from
   `engine/pauses.py`.
2. Copy this folder into the project (`Copy-Item -Recurse projects/_workshop-template projects/short-<slug>` before the
   footage step, or copy `index.html` and `scene.js` into it after), set `N`, and write `script.md`.
3. Replace the anchor words in `scene.js`, run `python engine/captions.py projects/short-<slug>`, then lint and ship as in
   [docs/routes/shorts.md](../../docs/routes/shorts.md).
