# POV plates: provenance

Status: **candidate** (generated 2026-10-07; not yet approved by Ahmed).
Lane: generated creative images, brand/image-treatment/PROMPTING-GENERATED-IMAGES.md, treatment 01 selective lavender.
Tool: Codex CLI 0.159.2 built-in image generation, read-only sandbox (its workspace-write sandbox failed to start on Windows; running unsandboxed was declined), so the prompt was passed inline and the files were copied out by Claude.
Reference attached: reports/kanz-image-prompt-lab-2026-09-27/images/01-selective-lavender.png (colour/material/finish only). Codex also used plate A as the continuity reference for plate B.

| File | Source | Pixels | sha256 |
|---|---|---|---|
| pov-plank-ground.png | exec-e73232fb-588b-4960-aa04-65883c478c47.png in ~/.codex/generated_images/01a1132d-a166-7370-ac34-0044e1b94f44 | 1024x1536 | f816fc834d27d1863ff28eb2bd434a714bfeee815dcdd4b3debe8e5f9c5fa468 |
| pov-plank-volcano.png | exec-72633b4b-2e08-4020-9a39-16d0954191b2.png in ~/.codex/generated_images/01a1132d-a166-7370-ac34-0044e1b94f44 | 1024x1536 | be09a6c7ec83a7de356a9c0b4e6f80dd064603c88052252b1723b638d7754bab |

Review: same POV geometry in both; two sneakers/legs, anatomically plausible; plank continuous; no text/logos; only the plank is coloured. The lavender is stronger than "restrained"; regenerate if Ahmed wants it quieter. No regeneration was needed.

## Exact prompt

```text
Do not run any shell commands or read files; just use your built-in image generation tool twice (one image per prompt), then reply with the two generated file paths. The attached image is a Kanz colour/material/finish reference only (treatment 01 "selective lavender"): match its finish, do not copy its subject.

PROMPT A (pov-plank-ground):
Create ONE standalone editorial image for Kanz, a financial education brand.
Use: explainer video plate.
Meaning: an easy, safe task with nothing at stake.
Subject and action: first-person POV from a camera mounted on the viewer's chest, looking slightly down and ahead. The viewer's own two sneakers and lower legs are visible at the bottom edge of the frame, standing at the near end of one long narrow wooden plank that runs straight away from the camera, about two steps long.
Scene: the plank lies flat on an ordinary sunlit paved courtyard. Calm, ordinary, quiet.
Style: photograph, about 24 mm lens, slight action-camera feel, no fisheye distortion.
Composition: portrait 2:3, plank centred running up the frame. Keep the top third quiet (sky / distant wall) for editable typography added later; the image must feel complete without text.
Treatment: Use selective-color editorial photography. Keep the person and integrated surroundings in nuanced neutral grayscale, preserving natural texture and clear detail. Color only the wooden plank in restrained lavender #D5ADEF. Let it respond naturally to the scene's light and material. Use ink-black #08070B and purple-black #11081A in quiet supporting shadows, soft daylight and very fine monochrome grain. No purple skin, blanket wash, halo or sticker outline.
Keep: plank continuous and believable; exactly two legs and two sneakers, anatomically correct.
Avoid: fisheye, extra feet or legs, a second person, cartoon rendering.
Return only the image. No text, numbers, logos, watermarks, signs, charts, borders or mockup UI.

PROMPT B (pov-plank-volcano):
Identical camera, lens, height, angle, sneakers, legs and plank as prompt A, so the two images cut together as one continuous moment.
Meaning: the same task, but a mistake now costs everything.
Subject and action: the same first-person chest-camera POV looking slightly down and ahead; the viewer's own sneakers at the bottom edge standing at the near end of the same long narrow wooden plank. The plank now spans the full diameter of an active volcano crater: its near end rests on the rocky crater rim under the viewer's feet, its far end on the opposite rim.
Scene: far below the plank, glowing molten lava, rising smoke and heat haze; a strong sense of height and vertigo. Calm daylight.
Style, composition, treatment, keep and avoid: exactly as prompt A (selective lavender: everything neutral grayscale, only the plank in restrained lavender #D5ADEF; the lava glow stays grayscale-bright, not orange). Keep the top third quiet (smoke / sky) for text.
Return only the image. No text, numbers, logos, watermarks, signs, charts, borders or mockup UI.
```

## Regeneration 2026-10-07: pov-plank-volcano-v02.png (used in the video; v01 kept)

Ahmed: "separate the wood thing from the bottom" (confirmed: the plank must float over the crater, not lie on its floor).
Source: exec-5346f13f-c75f-4634-af2f-ac4d60ca6a47.png in ~/.codex/generated_images/01a11333-d61c-7db3-88b8-a39ce1104d22, 1024x1536, sha256 497fca1c99abefe129458a6f5f74576f5783b060ef1b3f302e86465c15cd6ccc.
Attachments: 01-selective-lavender.png (finish), pov-plank-ground.png (continuity), pov-plank-volcano.png (the failure to fix).

```text
Do not run any shell commands or read files; use your built-in image generation tool once, then reply with the generated file path.

Attachments: image 1 = Kanz finish reference (treatment 01 selective lavender, finish only). Image 2 = plate A, the approved camera/feet/plank continuity reference. Image 3 = the previous volcano plate, which FAILED: its plank looks like it is lying flat on the crater floor, pasted onto the lava, instead of floating high above it.

Regenerate the volcano plate (pov-plank-volcano v02):
Same first-person chest-camera POV, lens, height, sneakers, legs and lavender plank as image 2.
The plank is a narrow bridge suspended in mid-air: its near end rests on the rocky rim under the viewer's feet, its far end rests on the opposite rim, and in between there is NOTHING under it but a deep empty drop. Make the separation unmistakable: show the plank's thickness and its side edge, a thin shadow line under its edges, the crater walls dropping away steeply on both sides of the plank and visibly continuing BELOW the plank, the glowing lava lake small and very far down, with smoke and heat haze between the plank and the lava so the depth reads. The far rim where the plank lands is clearly visible. Strong vertigo, calm daylight.
Composition: portrait 2:3, plank centred, top third quiet (smoke / sky) for text added later.
Treatment: selective-color editorial photography, everything nuanced neutral grayscale with very fine monochrome grain; colour only the plank in restrained lavender #D5ADEF following its light and material; lava glow stays grayscale-bright, not orange; ink-black #08070B and purple-black #11081A in deep shadows.
Keep: exactly two legs and two sneakers, plank continuous and straight.
Avoid: plank touching the lava or crater floor, plank painted onto the ground, fisheye, extra limbs, text, numbers, logos, watermarks.
Return only the image.
```
