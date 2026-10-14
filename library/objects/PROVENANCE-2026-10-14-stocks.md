# Stock-market objects 2026-10-14: provenance

Requested by Ahmed for `projects/portfolio-rebalancing` v2 (2026-10-14): "all props arent related to the actual stock maket,
create whatever elements you need to adjust that". Status: **candidates** until Ahmed reviews them
(sheet: `prompts-2026-10-14-stocks/out/compare.jpg`, local).

Tool: Codex CLI built-in image generation (`codex exec --skip-git-repo-check -s read-only`, prompt on stdin, references with
`-i`), run by `prompts-2026-10-14-stocks/run.sh` (copied from the casino batch); prompts in `prompts-2026-10-14-stocks/*.txt`.
References (opened and inspected before prompting): the approved editorial icon sheet (Kanz repo
`reports/kanz-motion-system-2026-09-20/chatgpt-handoff-ar-v01/references/approved-editorial-batch-01.png`) for every object,
plus: certificate bundle = `kanz-egp-banknote-stack-v01` + `kanz-share-certificate-v01`; bull and bear = `kanz-safe-v01`
(metal finish); quote board = `kanz-trading-screen-blank-v01`.
Checks: all 1254x1254 RGBA, transparent outside the subject; compared on charcoal with the banknote stack, the safe and the
screen: grayscale photographic cutouts, same grain and upper-left light, lavender on one detail only, no text or digits.

| File | Lavender detail | Codex session | Transparent |
| --- | --- | --- | --- |
| `kanz-share-certificate-stack-v01.png` (bundle of share certificates, banknote-stack framing) | paper band | `01a1384e-f883-7902-9893-7bed9d9bf075` | 57% |
| `kanz-bull-v01.png` (charging bull statue on a stone plinth, faces left) | plinth plaque | `01a1384e-f884-73d3-a322-b991456e2543` | 54% |
| `kanz-bear-v01.png` (bear statue swiping down, matching plinth, faces left) | plinth plaque | `01a1384e-f883-7032-879e-d34c00a36480` | 57% |
| `kanz-ticker-board-v01.png` (wall quote board, blank segment rows, up/down triangles) | one highlighted row | `01a1384e-f883-7590-b86c-b22591664afd` | 50% |

Drawn in the scene, not generated: candlesticks on the approved trading screen (`K.candles`, up candles lavender) and stock
cards (name + sparkline + triangle, no prices because the voice says none).
