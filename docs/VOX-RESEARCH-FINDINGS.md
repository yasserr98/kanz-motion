> Copied from the Kanz repo (`reports/vox-style-research-2026-10-05/FINDINGS.md`). Links to `research/` point to evidence that stays in the Kanz repo.

# Vox style for Kanz: research findings

Date: 2026-10-05 · Status: **findings, awaiting Ahmed's review** · Plan: [PLAN.md](PLAN.md)

## What was studied

| Source | Count | How |
| --- | --- | --- |
| Vox long-form (2015–2024), finance and economics first | 14 | cut detection over the whole video + labelled frames every 2–2.5 s for the first 60–90 s |
| Johnny Harris (ex-Vox Borders) | 3 | same |
| Vox's own vertical Shorts (2026) | 5 | whole video |
| Ahmed's vertical references (Instagram, Reddit, YouTube Shorts) | 7 | whole video, frames every 1.5–2 s |
| Tutorials (Vox Creative, Chris Moran, Claude Code + Remotion, After Effects builds) | 9 | captions read; key techniques extracted |

Apify spend: about $0.67 of the $2 (video lists only). All downloads, frames and captions were done locally for free.
Evidence: [notes.md](research/notes.md) (per-video observations), [measurements.md](research/measurements.md) (cut statistics),
`research/out/<id>/` (labelled frame sheets). Raw videos stay local in `research/raw/` (gitignored, study only).

## The ten things that make it "Vox"

1. **One continuous world, not a slideshow.** The best finance explainers (*Who pays the lowest taxes*, *How the rich avoid
   paying taxes*, *the microchip war*) have only 1–5 hard cuts per minute. The camera pushes, pans and pulls back inside one
   composed space, and new elements arrive into it. (The cut counts in measurements.md come from this; they under-count
   graphic-led videos.)
2. **Something new appears every 1.5–3 s, timed to the narration.** A name in the narration brings in its label; a number
   brings in its number; a list item brings in its object. Observed in every frame strip; this is a qualitative rule,
   not a measured average.
3. **Sources are shown as objects.** Article headlines, studies, court filings and book covers appear on screen with a
   highlighter on the exact phrase being spoken. This is Vox's credibility device and the most-repeated element across
   2015–2024.
4. **Hand-made markup on top of real material.** Ovals, underlines, arrows and highlighter strokes are drawn *on* photos,
   maps, charts and documents. They animate on like a pen and "boil" (re-jitter 4–12 times a second) so they look drawn.
5. **Tactile, never digital-clean.** No pure white, paper grain, slight vignette, light chromatic aberration, and graphic
   motion stepped at about **12 fps ("on twos")** with no motion blur. All archival material is homogenised (B&W/duotone + grain)
   so mismatched sources cut together.
6. **Numbers become things.** "$19 in 1965" becomes a dot that turns into a chart; wealth becomes a pile of stock certificates
   under the curve; "the average EV" becomes a wallpaper of identical car cutouts with one price tag; $25M vs $25k become
   piles of cash at true relative scale.
7. **Recurring token objects and a persistent cast.** A "STOCK" certificate stands for shares all through a video; ten
   figures stand for income deciles and are reused for every chart.
8. **Photo cutouts lifted off a quieted background.** Subjects are cut out and separated by contrast (colour subject on a
   desaturated background, or an outline stroke), with a name label + one-line descriptor.
9. **Maps as zooms with pinned labels.** Continent → country → city, with one pin label per named place and outlined
   regions. Uses satellite imagery or a dark map with a bright outline.
10. **One accent colour does all the pointing.** Vox uses yellow for highlights and labels; everything else is quiet.

### For vertical Reels specifically
- **Vox's own 2026 Shorts are not animated explainers** (all five were a correspondent on a phone camera). They contribute
  *packaging* only: a headline box over the first image for 0–5 s, and captions with one keyword highlighted per phrase.
- **Ahmed's references show the vertical visual system** (best fit: the Turkish Reddit documentary):
  a calm canvas, a **centred media window** (square to 4:5) where the photo/map/chart lives, **one subtitle line
  under the window in the brand colour**, big serif years/numbers over cutouts, brand-colour shape wipes and light-leak
  flashes between sections, a hook before the logo sting.
- Vertical pace in the references: a new idea every 1.5–2.5 s; Chris Moran's technique reels run 30–60 cuts/min.

## What fits Kanz, and what doesn't

Kanz's positioning is calm, evidence-led and Arabic-first; the motion brief says "one clear focal idea per frame … one simple
movement, followed by enough time to understand the idea". So the filter is: keep Vox's *evidence and markup grammar*,
skip its *pace extremes and live-action*.

### Keep (maps directly onto approved Kanz assets)

| Vox device | Kanz version | Already exists? |
| --- | --- | --- |
| Continuous world + camera moves | One scene per beat-group on the approved charcoal grain background; the camera pushes and pans between elements instead of cutting | Background A approved (motion system) |
| Source document + highlighter | Real article/report screenshot on a paper surface, **lavender** highlighter sweeping **right→left** across the Arabic phrase as it's spoken; outlet + date tag | Paper surface, tape, photo-wash (editorial lane); real-screenshot rule already applies |
| Hand-drawn ovals, underlines, arrows | Editorial components 01 underline, 02 oval, 03 curved arrow, drawn on in step with the narration, light "boil" | Yes, SVG components 01/02/03 |
| Labels and name plates | Component 05 offset label; torn-paper label from the animator brief | Yes (torn-paper artwork still under review) |
| Object cutouts with one accent | The 47 approved grayscale editorial PNGs with lavender detail | Yes |
| Numbers become things | Number lands as a big Thmanyah numeral → morphs into a chart point or into a pile of library objects (coins, notes) | Objects yes; chart component to build |
| Recurring token object | One library object per video stands for the core concept (e.g. a share certificate), reused across scenes | Add per topic via Codex |
| Photo of a real person/place | Approved photo treatment: grayscale subject, quiet background, 8% purple wash, credit tag | Yes (CREATE-A-BRANDED-IMAGE.md, editorial 14/15) |
| Maps with pins | Grayscale map, lavender pin labels, one per named place; zoom in steps | Map base to source (see open items) |
| Stepped 12 fps graphics, no motion blur, grain | Engine default for graphic layers; fine grain overlay | Engine setting |
| Reel packaging | Hook headline (Thmanyah) over the first visual for 0–3 s; Arabic captions with one keyword in lavender | To build |
| Centred media window (vertical) | 1080×1350 window centred in 1080×1920, subtitle line under it | To build |

### Adapt (change before use)

- **Pace**: Vox long-form hits 25–40 cuts/min in cold opens; the references go up to 60. For Kanz Reels use a fast hook
  (new visual every ~1 s for the first 3 s), then a new element every 1.5–3 s inside continuous scenes. That's faster than the
  current motion brief's "enough time to understand", and is the main thing to confirm.
- **Colour**: Vox's yellow becomes lavender `#D5ADEF`. Red only for genuine losses/risk (existing Kanz rule). No orange/green labels.
- **Direction**: text reveals, highlighter sweeps, lists and label sequences run right→left. **Market charts keep the
  standard left→right time axis** (it matches TradingView/Koyfin screenshots Kanz already uses), which needs your confirmation.
- **Markup on Arabic**: underlines and ovals must clear dots and diacritics (existing editorial rule). Highlighter sits behind text.
- **Duotone archival**: Kanz uses grayscale + 8% purple wash instead of Vox's olive/blue duotones.

### Drop (doesn't fit)

- On-camera hosts, video calls and correspondent-style Shorts (Kanz explainers are voiceover only).
- Cable-news and film/TV clips as evidence (licensing, and off-tone for Kanz).
- Montage pace of 40+ cuts/min (*2023 in 7 minutes*, Chris Moran reels): too frantic for "calm, evidence-led".
- On-location documentary footage (Johnny Harris's Saudi piece).
- Vox's flat cartoon characters: Kanz uses library objects first, M01/F01 NPCs only when a human situation needs them.
- AI-generated video as the engine (the Sanjar/Higgsfield approach). It can't guarantee exact Arabic text, numbers or brand.
  Generated clips may be used later as optional B-roll assets only.
- Slide counters and logo-heavy frames (standing Kanz rules).

## Sound effects

**What Vox does** (from tutorials; the audio analysis couldn't separate effects from narration): a click or switch sound on
hard-cut callouts, mouse clicks when cutting between web pages, soft whooshes on camera moves, paper and pen sounds on markup,
a low hit or riser under the key reveal. Music bed underneath.

**Kanz SFX library** (built into the engine repo, every file with a licence record):

| Category | Use |
| --- | --- |
| paper (slide, rustle, place) | paper surfaces entering, documents |
| tape (stick, rip) | tape component, label placement |
| pen/marker (scribble, squeak) | ovals, underlines, highlighter |
| click/switch | contrast callouts, hard cuts |
| whoosh (soft, short) | camera moves, wipes |
| pop/drop | pins, labels, objects landing |
| coin/cash | finance objects, number reveals |
| typewriter key, camera shutter | dates, archival photos |
| low hit, short riser | the key reveal (max one or two per video) |

**Sources, in order of preference:**
1. **Kenney.nl audio packs**: CC0, can be committed to the shareable repo. Verified on the pack pages: Interface Sounds,
   Impact Sounds, UI Audio, Digital Audio.
2. **BigSoundBank**: CC0, can be committed. Direct downloads; paper, tape, mechanical and click categories.
3. **Freesound API**, filtered to CC0 only: biggest catalogue, scriptable. Needs a free API key that **you** create at
   freesound.org/apiv2/apply (I can't create accounts).
4. **Sonniss GDC bundles**: professional quality, royalty-free, no attribution needed, but **no redistribution** of the raw
   files and AI/ML training prohibited. Kept outside the repo; the engine references them by path.
5. **Mixkit**: free licence, but no standalone redistribution, so treated the same as Sonniss.
6. **Generated in code** (filtered-noise whooshes, clicks, pops): fully owned, used as fallback.

Avoided: BBC Sound Effects (non-commercial licence) and YouTube Audio Library (YouTube-only).
Music is a separate open item (a source with a commercial licence for Instagram is still needed).

## What this means for the engine (to build after your approval)

- **Separate shareable Git repo** (proposed name `kanz-motion`, private on GitHub under yasserr98), versioned so new
  components, SFX and templates are added over time. This research folder stays in the Kanz repo as the evidence base.
- **Stack**: HTML/CSS + GSAP on one deterministic timeline → Playwright captures frames → ffmpeg muxes voice note + SFX + music.
  It's the same stack as the carousels, so Arabic text joins correctly. Remotion (used in the Claude Code tutorial) would work too,
  but its licence is free only for individuals and companies of up to 3 people, so Kanz would likely need a paid company licence. Not recommended unless that's checked and accepted.
- **Components** (from the Keep list): `scene` (continuous world + camera), `cutout-enter`, `doc-highlight`, `markup`
  (oval/underline/arrow with boil), `label`, `number-to-chart`, `object-pile`, `photo-cutout`, `map-zoom-pin`, `media-window`
  (vertical), `hook-headline`, `captions-ar` (word-timed, keyword highlight), transitions (`push`, `wipe`, `purple-shape-wipe`, `flash`).
- **Input**: voice note → word-timed Arabic transcript → beat sheet (you approve) → missing assets from Codex using
  the existing MD rules (you approve) → render → review → Drive/Airtable delivery as `In Review`.

## Decisions for Ahmed

1. **Pace**: accept "fast hook, then a new element every 1.5–3 s" for Reels? (Faster than the current motion brief.)
2. **Background**: approved charcoal grain (the motion system's Background A) with editorial paper surfaces on top, or the
   editorial lane's deep purple? (Recommended: charcoal, since it's already approved for explainer video.)
3. **Charts**: keep market charts left→right in time while everything else runs right→left?
4. **Repo**: OK to create a private `kanz-motion` repo for the engine? Fonts: IBM Plex Sans Arabic is open source (OFL);
   Thmanyah's redistribution terms need checking before the repo is shared outside the team.
5. **Freesound key** if you want the large CC0 catalogue (optional; Kenney + BigSoundBank + generated sounds cover the start).
