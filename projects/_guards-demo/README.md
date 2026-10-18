# _guards-demo

Engine demo for the review hardening of 2026-10-18 (docs/RULES.md SHORT-3, -4, -10, -12..17, NUM-5, TXT-5, SND-5,
REV-1, REV-7). A synthetic workshop short: a drawn head, a noise "voice" shaped like words, no source media and nobody's
face or voice. Face 0-3 s with the title, split 3-6.5 s, full-screen board 6.5-9.5 s, split again to the end.

```bash
python projects/_guards-demo/make_demo.py          # build the inputs (frames, voice, transcript, faces, freezes)
python engine/lint.py projects/_guards-demo --strict
python engine/make.py review _guards-demo 0.6,2.9,3.05,6.6,9.6
python engine/make.py ship _guards-demo v1         # renders on the render host; cut strips, ending, notes
```

The clean version passes `lint --strict` (`lint-ok.json` only excuses the face-only first frame). The title moves off
the drawn face by itself (`K.title()` with the face boxes), the subtitles sit on the seam in the split, the split eases
to and from the full board, and every change to or from the full face is a clean cut.

`python projects/_guards-demo/make_demo.py --bad` breaks each guarded rule once; run lint again to see them caught:

| What it breaks | Caught by |
| --- | --- |
| an English word in the subtitles | `captions.py` stops: SHORT-14 |
| the title at y 560, on his eyes | `on-face` |
| the split starting at 3.3 s, inside a word | `mid-word-cut` |
| the stream frozen 4.0-4.8 s inside the split | `freeze` (and ship's duplicate-frame count) |
| `الرهان 39.8$` | `stray-currency` |
| a subheadline ~15 px under its headline | `tight-gap` |
| two effects 0.1 s apart, one on nothing | `sfx-overlap`, `sfx-orphan` |
| `K.duration` 0.3 s before the voice ends | `end-cut` (and ship's ending check) |

Run `make_demo.py` without `--bad` afterwards to restore the clean version. Generated files (frames, voice,
transcript, script, build, variant.js, faces/freezes) are ignored by `.gitignore` here.
