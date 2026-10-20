# Approved drawn scenes

Approved by Ahmed 2026-10-20: Live C v10 approved, quiz 2026-10-20, Q7, "Diagram for numbers, drawing for ideas"
(EXPL-1, IMG-4). These are the four approved references from Live C v10, downscaled to a maximum of 1024 px;
the accompanying `.prompt.txt` files keep their generation prompts (subject, accent and style; the
video's context and voice line are left as placeholders in these public copies).

- `scene-bank-helm.png`: the central bank steering.
- `scene-debt-tower.png`: the debt burden.
- `scene-crossroads.png`: a choice between paths.
- `scene-burning-currency.png`: sacrificing the currency.

A drawn scene explains a cause, actor or story in one connected composition, one scene per beat. It uses the
Kanz icon style from the approved sheet: grayscale material and grain, restrained lavender, transparent margins.
It arrives or draws in, then sits still; the camera and explanatory changes move with the words (PACE-9, EXPL-2).
Prices, percentages and amounts still need moving engine diagrams.

Make new scenes with `engine/codex_assets.py`, mode `kanz`, using one of these as `ref`. References resolve
relative to `library/objects/`, so use `../scenes/scene-bank-helm.png`, for example:

```json
{
  "name": "bank-choice",
  "mode": "kanz",
  "line": "the line this scene explains",
  "subject": "one connected editorial vignette: a central bank at a fork in the road",
  "accent": "the chosen path",
  "ref": "../scenes/scene-crossroads.png"
}
```

The approved icon sheet remains the style authority; these scenes are composition references. New generated
assets stay in the video project until approved for the shared library. Never generate real people (IMG-8).
