# Rules in force

One line per rule, with an id that lint findings, reviews and fix requests can cite ("HOOK-1 at 2 s"). Only current
rules are here; where each came from, Ahmed's words and what it replaced are in [DECISIONS.md](DECISIONS.md). The
**Check** column names the `engine/lint.py` finding kind (or tool) that enforces a rule; "eye" means the review sheet.
Component how-tos stay in [LOOK-V2.md](LOOK-V2.md) and [PACE.md](PACE.md). New videos only: finished Reels render as
they were.

## Repo and delivery

| Id | Rule | Check |
| --- | --- | --- |
| REPO-1 | kanz-motion is public. Engine, runtime, docs, template, demos and `examples/` only; never keys, voice recordings, renders, unreleased scripts, record ids, Drive ids or emails | `.gitignore` |
| REPO-2 | Editors' copies: projects, voices and MP4s stay on the editor's machine; never `git add`, commit or push there, never ask them to | |
| REPO-3 | Updates come one way through `docs/UPDATE.md`; never `reset --hard`, `clean`, `checkout -- .` or drop a stash in an editor's copy | |
| REPO-4 | `projects/` is local (git-ignored) except `_template` and the `_*-demo` engine demos; worked examples live in `examples/` | `.gitignore` |
| REPO-5 | New reusable components go in `runtime/` (not inside a project) and are documented in README | eye |
| REPO-6 | One local Chromium job (lint, render, stills, cover, contrast) at a time per machine, across all checkouts; full renders go to the render host | `engine/slot.py` waits on a lock in the user's local app data |
| DEL-1 | Rendered ≠ approved ≠ posted. Deliver to Drive + Airtable (`In Review`) only when Ahmed asks | |
| DEL-2 | Delivery runs from the private Kanz repo: `reports/kanz-motion-deliveries/README.md` (Ahmed's copy only) | |
| DEL-3 | Receipts and the usage log are written in the Kanz repo, never in kanz-motion | `.gitignore` (`delivery.json`) |

## Voice and captions

| Id | Rule | Check |
| --- | --- | --- |
| VOICE-1 | Voice notes: cut retakes by keeping the last clean take; every cut in `audio/edl.json` with its reason (`_why`) | eye |
| VOICE-2 | Voice notes play at 1.25x | `edl.json` |
| VOICE-3 | Re-transcribe the edited voice and read it through: no word lost or doubled | eye |
| VOICE-4 | Script videos: Ahmed's copy uses the instant clone "Ahmed Shaaban Shorts"; never the professional clone. Editors use the voice Ahmed names for their own key | `.env` |
| VOICE-5 | Once the voice is final: `make.py retime <slug>` (script) or `make.py retime <slug> 1.0` (voice note), then write the scene | |
| VOICE-6 | Scripts are pasted verbatim into `script.md`; never rewrite them; flag doubts | eye |
| VOICE-7 | TTS failures: fix in `say.json` (voice-only spelling), add new ones to `library/voice/lexicon.json`; tell Ahmed the EAR times | `voicecheck.py` |
| VOICE-8 | Mute real breaths and sighs (`breaths.py`, `"mute"` in `edl.json`); say which you left in | `breaths.py` |
| VOICE-9 | Once Ahmed picks a pronunciation take, splice that exact audio from its cache/take file; never regenerate the same spelling and assume it matches | ear, cache/take file |
| CAP-1 | Captions come from the corrected `script.md`, never raw ASR; flag uncertain words for Ahmed | `captions.py` |
| CAP-2 | Read the "check these captions" words `make.py` prints (usually digits) | eye |

## Hook and pace

| Id | Rule | Check |
| --- | --- | --- |
| HOOK-1 | The hook is the question headline plus ONE hero object, nothing else until the question ends | eye (lint `dead` is expected here) |
| HOOK-2 | Hook layout: three-line question headline, keyword last in lavender, one ~600 px hero with glow + float. When the hook is about something that moves (a price, a percentage, a loss), the hero is a live diagram already moving on frame 1 (EXPL-1), never a still chart icon | eye |
| HOOK-3 | The hero is complete on frame 1 and settles from oversized (`K.settle`); `K.captionsFrom` = end of the question | `hook` |
| PACE-1 | New scenes: `K.look()`, then `K.pace({ defaults: "2026-10-18" })`, and `K.finish()` as the last line | `structure`, `make.py check` |
| PACE-2 | The 2026-10-17 defaults stay on: caption band kept clear, boards arrive built, punch hides the caption, capped fly-ins, marks sized to their element | `caption-band`, `half-built-arrival`, `markup-crossing-text` |
| PACE-3 | Boards arrive built (`K.go` + `at: g.lead`), open close and pull out (`K.frame`); never land on an empty board | `half-built-arrival`, `dead` |
| PACE-4 | Carry one hero between boards (`K.carry`, `K.dim`); never clear a board before building the next | eye |
| PACE-5 | No snap zooms (`K.snap`) or face jump zooms by default; the camera drifts and pulls out | `K.snap` warns |
| PACE-6 | Paper world (`K.world`) at chapter turns. Ending: never cut back to the hook or replay an earlier picture. The last line gets its own moving visual that keeps building into the last word, and the video ends about 0.4 s after that word (`K.duration = tLast + 0.4`): no silent tail, no static end card | lint `long-tail`, `hook-replay`; ship `tail`; eye |
| PACE-7 | Variety where the script gives a reason: one `K.punch` on the thesis, `K.stack`/`K.pile` for amounts, `K.swap` for state changes, map/globe + `K.pin` for places | eye |
| PACE-8 | 3D: `K.flip` for myth -> fact, `K.browser` for genuine website screenshots, `K.fold` for a reveal | eye |

## Pictures

| Id | Rule | Check |
| --- | --- | --- |
| IMG-1 | Every video gets an image pass before the scene is written: `shots.json` from the whole script, then Codex | `codex_assets.py` |
| IMG-2 | Generate with Codex without asking first (`codex_assets.py --jobs 4`); compare icons with the references, regenerate mismatches | eye |
| IMG-3 | Icons follow the approved Kanz icon style whatever the topic; no topic-specific aesthetic | eye |
| IMG-4 | Place or setting -> full-screen photo; real person or moment -> disposable print (`K.snap35`); concept, mechanism or number -> animated diagram or drawn illustration (EXPL-1), with Kanz icons only as supporting props | eye |
| EXPL-1 | A line about something that moves or works (a price rising and falling, a loss, risk, a percentage, a flow of money, cause and effect, a comparison) is explained by an animated diagram built in the engine: `K.area` drawing the real path with its dips, `K.bar`/`K.delta`, `K.count`, `K.stack`, arrows and flows. A drawn illustration also works. Never a still icon or a picture of a chart | eye |
| EXPL-2 | Icons support, they don't explain: an icon can be the hero only for a plain thing (a house, a bank, a wallet). No board holds one unchanging picture while the voice explains for more than about 2 s; something on it moves with the words | eye, lint `still-image` (a warning), `dead` |
| IMG-5 | Voice-note and script Reels use the same three types; a place photo gets a board of its own with only text and tags | eye |
| IMG-6 | No date stamp or credit line on screen; credits for the post caption go in `projects/<slug>/CREDITS.md` | eye |
| IMG-7 | Text over a photo reaches 4.5:1 against its brightest background pixels | `contrast.py` |
| IMG-8 | Real people and real events: real photos only, never generated or repainted: openly licensed ones, or press photos of real public moments (standing yes, 2026-10-18); source, licence or credit in `CREDITS.md` | eye |
| IMG-9 | Gambling content: never a hijab-wearing character, generated person or photo | eye |
| IMG-10 | Websites on screen are genuine screenshots (URL + capture date in `CREDITS.md`), the main visual of their slide | eye |
| IMG-11 | Disposable prints (`K.snap35`) use the slim frame, `slim: true`: a thin border all round and only a modest strip underneath, not the wide Polaroid margins; the photo stays untouched | eye |
| OBJ-1 | Objects: approved `library/objects/` or new Codex objects in the fixed icon style; never invent a style for a topic | eye |
| OBJ-2 | Only objects marked `approved` in `library/objects/manifest.json` ship; a candidate needs Ahmed's approval first | `objects.py`; `make.py ship` stops on a library object that is not approved |
| OBJ-3 | New objects move into `library/objects/` only after Ahmed approves them, with their status in the manifest | |

## Look, numbers and text

| Id | Rule | Check |
| --- | --- | --- |
| LOOK-1 | Charcoal grain background, Thmanyah Display headlines, IBM Plex Sans Arabic text | eye |
| LOOK-2 | Lavender `#D5ADEF` is the only pointing colour; red only for genuine losses or risk | eye |
| LOOK-3 | On the paper world, objects and figures keep their contrast (the default darkens them and adds a thin edge) | eye |
| LOOK-4 | No logo by default; if a video adds it, it contrasts with what is behind it (it turns dark on the paper world by itself; check photos, cards and screenshots) | `structure` |
| LOOK-5 | Chart colours stay varied as they are (one neutral chart style was rejected) | |
| LOOK-6 | Rejected, do not rebuild: ground plane, coin toss, isometric 3D bars, depth camera | eye |
| LOOK-7 | No slide counters | `structure` |
| LOOK-8 | Text and label sequences run right -> left; market charts keep time left -> right | eye |
| LOOK-9 | Text stays inside the safe zones (x 120-960 × y 270-1440; 65-1015 above y 1000) | `safe`, `edge` |
| NUM-1 | Show only numbers the voice says; real market figures carry a source on screen and in `CREDITS.md` | eye, `data.py` |
| NUM-2 | No "مثال افتراضي" tag when the voice frames the figures as an example ("خلينا نقول", "لو") | eye |
| NUM-3 | One digit system: Western digits with the Arabic percent sign (`35`, `65٪`), on screen and in captions | `digits` |
| NUM-4 | Bars that compare numbers share one scale and zero baseline (`K.scale`); small true gaps get a bracket | `bars` |
| NUM-5 | A dollar amount is written `$39.8`, the $ on the left of its digits and on their line: `K.money(39.8)` on screen; captions do it by themselves with the 2026-10-18 defaults | `stray-currency` |
| TXT-1 | Size floors in board px: source lines 28 px, labels 34 px | `small-text` |
| TXT-2 | At most four labelled elements on a board at once; split a busier board into two beats | `crowded-board` |
| TXT-3 | No label that repeats the caption word for word; a label adds what the caption doesn't say | `caption-repeat` |
| TXT-4 | No text under objects, captions or other text | `covered`, `text-on-text`, `covered-shape` |
| TXT-5 | Breathing room: a subheadline sits at least `K.GAP` (40 board px) under its headline; `K.under(head, html)` places it | `tight-gap` |
| TXT-6 | Nothing crosses a headline: panel and card edges, grid and chart lines, objects and diagrams start at least `K.GAP` below its last line (move or shrink the panel, not the headline) | `headline-cross` |
| TXT-7 | A label stays fully visible for at least 0.8 s, except word-timed punch labels | `brief` |

## Sound

| Id | Rule | Check |
| --- | --- | --- |
| SND-1 | No music: voice + SFX + room tone only; no generated music | eye |
| SND-2 | SFX only CC0 or explicitly licensed, each in `engine/sfx_library.py` with its source; Sonniss/Mixkit files local only, never committed; generated ones (`sfx_gen.py`) always in a new category, so finished videos keep their sounds | `manifest.json` |
| SND-3 | Room tone under every pause (`K.bed = "room"`), 40% quieter since 2026-10-18 (amplitude x0.6, after any `K.bedUnder`); set `K.bedUnder` per video when it is still too loud | ear, `render.py` `BED_TRIM` |
| SND-4 | Loudness -16 LUFS (± 1) | `make.py check/ship` |
| SND-5 | Mix and master: one sound effect at a time (cues under 0.3 s apart keep the louder; the next effect chokes the last; none longer than 1.4 s), the voice high-passed and gently compressed, effects ducked under speech and kept 6 dB under it, two-pass loudness to -16 LUFS with a -1.5 dBTP ceiling. An approved render gets new sound with `make.py remix <name> <from> <to>` (picture copied bit for bit) whenever a delivered reel is touched again (a revision or a re-upload); no bulk re-run. Scenes write one cue per visual event: none within 0.3 s of another, none on nothing | `render.py` mix 2, `sfx-overlap`, `sfx-orphan` |

## Shorts cut from a long video

| Id | Rule | Check |
| --- | --- | --- |
| SHORT-1 | Source media, photos, face frames and full transcripts stay local (git-ignored) | `.gitignore` |
| SHORT-2 | Leave out passages that attack people by religion or repeat unproven allegations; say why | eye |
| SHORT-3 | Start on a word, drop lines that point back to the long video, end before the next sentence. The ending guard aims for 0.4 s after the last word with a 0.05 s next-word margin and the fade inside the tail; the scene runs to the voice end. Listen to the untrimmed source: the whole audible last word always wins over that margin; add quiet after a verified cut instead of cutting into the word, never leak the next sentence. The guard reports a conflict for a human ear | `footage.py`, `end-cut`, ship ending + leak, ear |
| SHORT-4 | The first 3 s always show his face with a title over it: `K.title()`, a white sticker, no purple; text from `shorts/_titles.json` (3 options per reel, Ahmed picks, option 1 until he does); no subtitles while it shows (`K.title` sets `K.captionsFrom`); long-video (YouTube) shorts: middle of the frame just above the subtitle band (default `y` 1150); workshop/live titles start at y 330, then move wherever the face boxes leave his eyes and mouth clear through all 3 s (Live E used y 190), never a fixed coordinate; Ahmed edits the text and approves on the review page. With the 2026-10-18 defaults `K.title()` takes the text from `_titles.json` and its height from the face boxes (`assets/faces.json`) | `title`, `on-face`, ship title |
| SHORT-5 | Keep a styled TV-set opening (`--tv-until`) and the source's burned-in labels | eye |
| SHORT-6 | Every face <-> motion change is a clean cut in a pause, onto a board built ~0.3 s before; no flash, no white frames | `mid-word-cut`, ship cut strips |
| SHORT-7 | Don't cut back to his face at the end; no takeaway tail | eye |
| SHORT-8 | Pay off what the hook promises ("three words" -> three titled beats) | eye |
| SHORT-9 | Every picture belongs to the line; no decorative props | eye |
| SHORT-10 | Before delivery, check 12-frame strips around every cut in the final MP4: `make.py ship` writes `out/cuts-<version>.jpg` and fails on charcoal, flash, half-built and one-frame flags and face-track jumps | ship cut strips |
| SHORT-11 | Workshop/live footage: motion inserts alternate between a 50/50 split screen (tracked face + board) and a full-screen board, clean cuts in the pauses; reuse the shared split/tracking helpers | eye |
| SHORT-12 | In the 50/50 split the subtitles sit in the middle, centred on the seam (on its board side when his face is right under it); on face-only and board-only moments they return to their usual place, never over his eyes or mouth; when his face reaches the band they move down (below his chin, at most to y 1500), never up over his head (`kanz-footage.js` capTopFor) (`kanz-split.js`, `kanz-footage.js`) | `caption-switch`, `on-face` |
| SHORT-13 | Where the voice is joined (two passages or a removed pause), total silence is about 0.25 s (Casino H v12 used a 0.2 s gap); the picture cuts clean. Never place a join or pause from transcript word edges alone: confirm it on the source waveform and by listening. When a syllable sounds clipped, check the source for its own jump cut and show short source/context listening options before choosing | `footage.py`, `tighten_footage.py`, waveform + ear |
| SHORT-14 | Shorts cut from long videos and lives: subtitles are always Egyptian Arabic, even where he speaks English (translate the meaning; keep his voice as is). Only for cut-out shorts, not voice-note or script Reels | `captions.py` (Latin words fail) |
| SHORT-15 | Workshop shorts: his face, full screen or in the split, is on screen at least 50% of the runtime; boards only where the line explains a mechanism, says a number or names something, and those inserts move | `face-share` |
| SHORT-16 | Every change to or from his full face is a clean cut (face <-> board and face <-> split), in a pause, never inside a word; no dissolve, crossfade or see-through frame anywhere. Split <-> full-screen board moves ease over 0.35 s (2026-10-18 defaults) | `mid-word-cut` |
| SHORT-17 | No frozen source picture in a face or split window (a stalled stream reads as lag): `assets/freezes.json` from the footage tools; choose other source seconds | `freeze`, ship duplicate frames |
| SHORT-18 | In cut-out shorts, remove accidental stutters, false starts and repeated phrases where a natural cut preserves the meaning; no rewriting speech or deleting deliberate emphasis. Listen from source to final, record each cut and say which could not be removed | cut record, ear |

## Review

| Id | Rule | Check |
| --- | --- | --- |
| REV-1 | Lint every scene; fix each finding or justify it in `lint-ok.json`. With the current defaults, dead stretches are detected from 1.5 s (legacy: 2.5 s). An empty stretch (dead or fill) over 1.5 s outside the 0-3 s title window cannot be justified | `lint.py --strict` |
| REV-2 | Review through one contact sheet (`make.py review`), not image by image | |
| REV-3 | Before delivery, `make.py ship <slug> <version>` passes (lint, render, MP4 frames, loudness) and the check sheet is looked at | `make.py ship` |
| REV-4 | Renders go to the render host when one is set (`KANZ_RENDER_HOST`); run them in the background, never poll | `make.py render` |
| REV-5 | Fix requests come as timestamps: find the exact moment in the audio/frames first and say where it really was | |
| REV-6 | Check fonts, Arabic joining, overlaps and timing on frames pulled from the MP4 itself | `make.py check` |
| REV-7 | Every review note goes in `projects/<slug>/notes.json` (`make.py note`): time, his words, status and evidence with version/interval. Proof matches the complaint: layout -> still from the final MP4 (`out/notes-<version>.jpg`); audio -> listened interval of the final MP4, with the source when edited; motion/cuts -> played interval or frame strip from the final MP4. An accepted defect is marked `accepted`, never `fixed` | ship notes, ear/playback |
