# Runtime review verification

Baseline: `33d2ba0`, branch `fix/runtime-review`. Changes remain uncommitted in this worktree.
No files in `engine/` or the main checkout were edited. The 814 missing face JPEGs were copied
from the main checkout into the worktree's ignored project assets. No other missing inputs were needed.

| Finding | Result |
| --- | --- |
| 1 | Warned only: overlapping `K.cam`/`K.push` intervals emit both ranges through `console.warn` and `K.warnings`. Camera interpolation is unchanged. Overlapping scenes can still depend on seek history. |
| 2 + 5 | Fixed: displayed frame and pending request are separate; duplicates return the pending promise; generations discard stale completions; HTTP/network/decode failures reject and remain retryable. Bitmaps are closed. |
| 3 | Fixed: cuts leave guard transforms alone; whip/zoom/glitch transitions use separate wrappers. |
| 4 | Fixed: document focus reserves its interval synchronously; drift waits for pending focus coordinates before scheduling. |
| 6 + 7 | Fixed: replacement poses inherit the logical original's animated transform and opacity; one pose is selected by time; shadow/glow followers resolve that pose. Chained and repeated swaps are covered. |
| 8 | Fixed: photo measurement includes CSS object-position and the bounding union of Ken Burns crops, plus endpoint measurements. The stronger scrim wins. |
| 9 | Fixed: screen halo state is derived from the union of screen intervals at the graphics frame time. |
| 10 | Fixed: earlier snap intervals are clamped at the next snap's start; earlier resets cannot interrupt later snaps. Scale has an explicit initial state. |
| 11 | Fixed: every subsequent pointer `to()` restores opacity/visibility. |

The original's `K.world` already initializes `data-world` at zero. Its rewind behavior and carry
stacking restoration pass dedicated checks; no additional visible runtime defects were confirmed.
The camera/seek wrapper chain was inspected directly; this worktree has no Graphify helper or agent-memory index.

## Golden results

Each project was loaded from its actual `index.html` with Python Playwright, local-file access,
the renderer's font/image readiness waits, and awaited `K.seek(t)`. Twelve times spanning the video
were captured forward, then shuffled with seed 701, at 1080x1920 CSS pixels and device scale 0.5.
Every Chromium was closed before starting the next project. Original JS was served in memory
from `git show HEAD:runtime/<file>` without rewriting project or runtime files.

| Project | Unique times | Forward identical before/after | Fixed shuffled = forward |
| --- | ---: | ---: | ---: |
| us-dollar-decisions-pace | 12 | 12/12 | 12/12 |
| real-estate-never-loses | 12 | 12/12 | 12/12 |
| short-house-always-wins | 12 | 5/12; seven explained fixes | 12/12 |
| _3d-demo | 12 | 12/12 | 12/12 |

There were no page/load errors. Real-estate produces two overlap warnings, at
`[0.4, 2.4] / [2.03, 2.78]` and `[13.22, 14.82] / [14.05, 15.05]`.
These are sampled-frame checks, not an assertion that every frame of every project is identical.

The short's changed samples were isolated by restoring one original runtime file at a time:

- Finding 8, crop-aware scrims: **6.1455, 21.5091, 33.8 seconds**.
- Finding 3, preserved frame guard: **12.2909, 15.3636, 18.4364, 30.7273 seconds**.

Each isolated result exactly matches the corresponding fixed hash. At 18.4364 s, the face covers
the board; only 267 pixels on the rightmost output column change (maximum channel difference 5).
The other guard samples visibly correct board framing. The before/after contact sheet was inspected
and is saved locally as `projects/short-house-always-wins/out/golden-review.jpg`.

For exact hashes, the harness briefly removes and restores stage display after seeking to invalidate
retained Chromium raster tiles. It restores the same display value and does not seek again or change
timeline state. Without that fresh paint, the original and fixed runtimes both have tiny order-dependent
raster differences: 4 pixels in real-estate at 47.6891 s, and 109 pixels in the short at 15.3636 s,
maximum channel difference 2, with identical visible computed styles. `--raw-raster` reproduces that
renderer behavior. The fresh-paint baseline and fixed capture use the same procedure and exact PNG hashes,
with no image tolerance or quantization.

## Reproduce

```powershell
python tests/runtime_checks.py
python tests/runtime_checks.py --original
python tests/golden_stills.py --original --output tests/_golden_before.json
python tests/golden_stills.py --output tests/_golden_after.json --compare tests/_golden_before.json --expected-differences tests/golden_expected.json
git diff --check
```

- Fixed focused checks: **13 passed**, exit 0.
- Original focused checks: **12 failed as expected**, the existing world/carry initialization check passed, exit 1.
- Original golden capture: exit 0. Fixed golden comparison with exact documented exceptions: exit 0.
- All five changed runtime files pass `node --check`; both Python files parse; `git diff --check` passes.
- `golden_expected.json` accepts only seven specific fixed hashes with reasons. An unexplained hash,
  seek-order mismatch, page error, or missing expected change fails the comparison.

To reproduce the visual isolation, run the golden command for `--project short-house-always-wins`
with `--original-file kanz-footage.js` (scrim changes only), or `--original-file kanz-snap.js`
(guard changes only), writing to a separate output JSON without the expected-differences argument.
Those comparisons intentionally exit 1 to report their changed samples.

## Changed files

- `runtime/kanz.js`
- `runtime/kanz-footage.js`
- `runtime/kanz-look.js`
- `runtime/kanz-pace.js`
- `runtime/kanz-snap.js`
- `tests/golden_stills.py`
- `tests/runtime_checks.py`
- `tests/_golden_before.json`
- `tests/_golden_after.json`
- `tests/golden_expected.json`
- `tests/RUNTIME-REVIEW.md`
