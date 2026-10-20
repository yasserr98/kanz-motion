# Casino objects 2026-10-13: provenance

> Approved 2026-10-17 ([DECISIONS](../../docs/DECISIONS.md#2026-10-17)); generation-time status below.

Requested by Ahmed for `projects/gamblers-fallacy` v2 (2026-10-13): "generate people that would actually look like gamblers
rather than the ones we're using ... let do men", "a roulette board ... or even a table with an attendant".
Status: **candidates** until Ahmed reviews them (sheet: `projects/gamblers-fallacy/out/casino-objects.jpg`, local).

Tool: Codex CLI built-in image generation (`codex exec --skip-git-repo-check -s read-only`, prompt on stdin, references with
`-i`), run by `prompts-2026-10-13-casino/run.sh`; prompts written by `prompts-2026-10-13-casino/make_prompts.py`.
References: people = the approved anonymous-people sheet v04 (Kanz repo
`reports/kanz-motion-system-2026-09-20/chatgpt-handoff-ar-v01/references/approved-npc-characters-v04.png`) + M01 neutral;
G01 poses also take `kanz-npc-g01-neutral-v01` as identity reference; the wheel = the approved editorial icon sheet
(`approved-editorial-batch-01.png`) + poker chips. All opened and inspected before prompting.
Checks: all 1254x1254 RGBA, transparent outside the subject; compared on charcoal with M01, the crowd-back group and the poker
chips: faceless grayscale photographic cutouts, same fabric grain and upper-left light, lavender on one garment only.

| File | Lavender detail | Codex session | Transparent |
| --- | --- | --- | --- |
| `kanz-npc-g01-neutral-v01.png` (gambler, dark three-piece suit, beard) | necktie | `01a136a6-f053-7493-8921-084440031599` | 80% |
| `kanz-npc-g01-betting-v01.png` (pushes a chip tower as tall as he is) | necktie | `01a136a9-655e-71c2-b1de-b6935fa849d6` | 67% |
| `kanz-npc-g01-pointing-v01.png` | necktie | `01a136a9-6577-74d0-9029-8d8ecbbaeee8` | 81% |
| `kanz-npc-g01-lost-v01.png` (hand over face, empty pocket) | necktie | `01a136ab-9f71-78c2-91cf-567427d9b702` | 79% |
| `kanz-npc-g02-neutral-v01.png` (older gambler, light-gray suit) | bow tie | `01a136a8-b037-79e1-83ed-9d0cc660a17f` | 81% |
| `kanz-npc-gamblers-back-v01.png` (G01, G02 and a third man from behind) | none visible (ties face away) | `01a136ab-4f48-7601-b60f-efd5958b74e4` | 49% |
| `kanz-roulette-wheel-v01.png` (pockets in two grays, no digits) | ball | `01a136a6-f04d-7533-a239-4b7d9cb03d96` | 45% |
| `kanz-roulette-table-croupier-v01.png` (croupier with rake behind a plain-felt table) | bow tie | `01a136a8-af79-7fc0-b1a6-c3ff4d724bba` | 58% |

Notes: the wheel's pockets are gray, not red/black, because the fixed icon style is grayscale + lavender; red on a roulette
wheel needs Ahmed's explicit exception. The red/black betting layout in the scene is drawn in HTML (a diagram like the
result discs), not generated. `prompts-2026-10-13-casino/out/` keeps the raw outputs and logs.
