# Codex objects 2026-10-11: provenance

Requested for `projects/emotional-trading` (hook rework). Ahmed 2026-10-11: "if you want to create more icons or images you're
free to do so". Status: `kanz-trading-screen-blank-v01` and `kanz-npc-crowd-back-v01` **approved in use** (Ahmed picked hook "F", which shows both,
2026-10-11). `kanz-investment-chart-down-v01` is still a **candidate** (not yet shown in a video).
Tool: Codex CLI 0.159.2 built-in image generation (`codex exec --skip-git-repo-check -s read-only`, prompt on stdin, references with `-i`).
Checks: 1254x1254 RGBA, transparent outside the subject; compared side by side with their references on charcoal
(`projects/emotional-trading/out/new-objects/compare.jpg`, local): paper/arrow finish of the chart icon, metal and LED of the calculator,
identity and wardrobe of M01/F01/M02. The screen is front-on on purpose (live charts are drawn on its blank screen).

| File | References | Codex session | Transparent |
| --- | --- | --- | --- |
| `kanz-trading-screen-blank-v01.png` | approved-editorial-batch-01.png + kanz-calculator-blank-v01.png | `01a1295d-598c-71d3-a022-b60d2f192a41` | 47% |
| `kanz-investment-chart-down-v01.png` | approved-editorial-batch-01.png + kanz-investment-chart-v01.png | `01a1295d-5927-71a3-b3ec-20d2067ff543` | 44% |
| `kanz-npc-crowd-back-v01.png` | approved-npc-characters-v04.png + M01/F01/M02 neutral PNGs | `01a1295d-58b2-7c82-bdee-a61bbdea1419` | 47% |

## Prompts

### kanz-trading-screen-blank-v01

```text
Attachments: image 1 = the APPROVED Kanz editorial icon sheet (style authority). Image 2 = an approved Kanz library icon with a blank screen (finish, material and blank-screen authority).

Create ONE Kanz explainer icon: a large STOCK EXCHANGE DISPLAY SCREEN, a wide freestanding monitor in a thick weathered dark-metal frame on a short sturdy stand, like a trading-floor board. The screen itself is completely BLANK: an even, plain, very dark charcoal rectangle with no chart, no glare pattern, no digits and no symbols, so a live chart can be placed on it later. View: FRONT-ON, almost straight, camera only slightly above, so the screen reads as a clean flat rectangle (this is the one exception to the usual three-quarter view, needed to place content on the screen).
Lavender accent: one small power LED on the bottom bezel only.
Treatment identical to the references: photographic grayscale editorial cutout with real material texture and the same fine tactile grain, same lighting from upper left; restrained lavender #D5ADEF only on the detail named; neutral grayscale everything else. The Kanz icon style is fixed for every topic: match line weight, shapes, perspective, dimensionality, shading, texture and palette treatment exactly; no topic-specific style, no glossy colours, no cartoon.
Output: one centered subject on a SQUARE canvas (1254x1254 if available, else highest native square), comfortable transparent margins. TRUE RGBA PNG TRANSPARENCY everywhere outside the subject. No background, no floor, no drop shadow, no fake checkerboard, no text, letters, numbers, logos or watermark.
Return only the image.
```

### kanz-investment-chart-down-v01

```text
Attachments: image 1 = the APPROVED Kanz editorial icon sheet (style authority). Image 2 = the approved Kanz investment chart icon (finish, paper, perspective, scale and framing authority).

Create ONE Kanz explainer icon: the SAME paper chart sheet as image 2, same paper, curl, axes and three-quarter view from slightly above, but the line now FALLS: a jagged zig-zag line that starts high on the left and drops steeply to the lower right, ending in an arrowhead pointing down-right. No numbers, letters or labels.
Lavender accent: the falling line and its arrowhead only, exactly like the rising line in image 2.
Treatment identical to the references: photographic grayscale editorial cutout with real material texture and the same fine tactile grain, same lighting from upper left; restrained lavender #D5ADEF only on the detail named; neutral grayscale everything else. The Kanz icon style is fixed for every topic: match line weight, shapes, perspective, dimensionality, shading, texture and palette treatment exactly; no topic-specific style, no glossy colours, no cartoon.
Output: one centered subject on a SQUARE canvas (1254x1254 if available, else highest native square), comfortable transparent margins. TRUE RGBA PNG TRANSPARENCY everywhere outside the subject. No background, no floor, no drop shadow, no fake checkerboard, no text, letters, numbers, logos or watermark.
Return only the image.
```

### kanz-npc-crowd-back-v01

```text
Attachments: image 1 = the APPROVED Kanz anonymous-people reference sheet v04 (style authority). Images 2, 3 and 4 = the approved production PNGs of M01, F01 and M02 (identity, wardrobe, finish and scale authority). Match their rendering exactly.

Create ONE group image: these SAME three people seen FROM BEHIND, standing side by side close together, looking slightly UP and forward at something large in front of them (as if watching a big screen). Left: M01 (dark wavy hair, open light-gray overshirt with rolled sleeves over his lavender T-shirt, dark trousers, gray sneakers). Middle: F01 (fully lavender hijab, light blouse, dark trousers, flat shoes). Right: M02 in his usual clothes from image 4. Backs of heads, shoulders and clothes only; postures slightly tense (one hand on the back of the neck for M01). Only their own lavender items are lavender (M01's T-shirt barely visible at the collar, F01's hijab).
Style (identical to the references): photographic grayscale editorial cutout, realistic fabric texture, fine tactile grain, natural proportions, crisp antialiased edges; not shiny clay, not cartoon. No faces visible.
Output: the three full-body figures centered on a SQUARE canvas (1254x1254 if available, else highest native square), feet near the lower edge with a small margin, comfortable transparent margins. TRUE RGBA PNG TRANSPARENCY everywhere outside the people, including gaps between them. No background, no floor, no glow, no drop shadow, no text, logo or watermark. No fake checkerboard pixels.
Return only the image.
```

## Batch 2 (2026-10-11, us-dollar-decisions v3)

Requested by Ahmed in his v2 review: two different company icons (the factory was standing in for companies), a real map of America
(border board and 'فلوسهم هناك'), and pictures of different countries ('حسب ظروف كل بلد'). Status: **candidates** until Ahmed reviews
them in us-dollar-decisions v3. Same tool and checks as above; all 1254x1254 RGBA, compared on charcoal with the bank, factory and
loan-agreement references (local sheet in the session scratchpad). The US map outline was checked by eye for the lower-48 shape
(Florida, Great Lakes, Texas, Pacific coast). Prompts: `projects/us-dollar-decisions/assets/*.txt`.

| File | References | Codex session |
| --- | --- | --- |
| `kanz-company-office-v01.png` | approved-editorial-batch-01.png + kanz-bank-v01.png | `01a129b6-29cd-7572-b496-895ed637b2ef` |
| `kanz-company-trading-v01.png` | approved-editorial-batch-01.png + kanz-factory-v01.png | `01a129b6-29ca-7f21-ba13-c0405b2cd91f` |
| `kanz-map-usa-v01.png` | approved-editorial-batch-01.png + kanz-loan-agreement-v01.png | `01a129b6-29d6-75e1-aae7-3b6a1c7e63b8` |
| `kanz-landmark-egypt-v01.png` | approved-editorial-batch-01.png + kanz-bank-v01.png | `01a129b6-29d5-7721-9568-7232d01555ff` |
| `kanz-landmark-uk-v01.png` | approved-editorial-batch-01.png + kanz-bank-v01.png | `01a129b6-29f1-7be0-a933-92d6e7e3ff58` |
| `kanz-landmark-japan-v01.png` | approved-editorial-batch-01.png + kanz-bank-v01.png | `01a129b6-29cd-7ff3-9912-670df1d1921e` |
