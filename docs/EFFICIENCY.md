# Making videos at volume on a Claude plan

How to produce Reels without running out of Claude usage, and the log that tells us the real
cost per video. Written 2026-10-05 for Ahmed's Claude **Pro** plan (5-hour window + weekly cap).

## Where the usage goes

Only the thinking work uses Claude: writing `script.md` keywords, writing `scene.js`, looking at
the review sheet and fixing what it shows. These cost **no Claude usage**: the ElevenLabs voice,
captions, rendering frames, mixing sound, and pulling check frames, because they are Python/ffmpeg
running on the computer.

The biggest hidden cost is **conversation length**: every reply re-reads the whole conversation.
Measured in the 2026-10-05 session (from the session log, not an estimate):

| Phase | Model calls | Output tokens | Conversation re-read (cached input) |
| --- | --- | --- | --- |
| Research | ~84 | ~74k | ~17.8M |
| Engine + pilot-01 | ~57 | ~91k | ~23.8M |
| Real-estate scene (script → tested scene) | ~21 | ~30k | ~9.4M |

The real-estate scene re-read ~9.4M tokens for ~30k written, because it ran at the end of a long
research conversation. The same work in a **fresh session** re-reads far less.

## The lean way to make one video

1. **New session per video** (Code tab → new session in `kanz-motion`). Never continue the research
   or a previous video's conversation.
2. **Model: Sonnet 5.5, effort medium.** Opus draws down plan limits faster than Sonnet; Anthropic
   does not publish the exact ratio. Switch to Opus only for engine work: new runtime components,
   render bugs, anything Sonnet fails at twice.
3. Give everything in the first message: the script, the voice/speed, and "follow AGENTS.md and
   docs/EFFICIENCY.md". Asking the agent to go and find things costs extra turns.
4. The agent writes `scene.js` by copying the closest finished project, not from a blank page.
5. Review with **one contact sheet** (`make.py review`, then `make.py check`), never one image per
   frame. Each image the agent looks at costs as much as a long message.
6. Render runs in the background; the agent does not poll it.
7. Fix rounds: name the moment and the change ("at 0:23 the tag overlaps the bar, move it up").
   Vague feedback means more turns.

### First message for a video session (copy, fill in, send)

```text
New Kanz Reel in kanz-motion. Follow AGENTS.md and docs/EFFICIENCY.md.
Project name: <english-slug>
Route: script (ElevenLabs voice <name or id>, speed <1.0>)   |   voice note: <path>
Closest example to copy: projects/real-estate-never-loses
Script (do not rewrite; flag anything doubtful):
<paste the Arabic copy>
Deliver: review sheet, then render v1 and check sheet. Log usage at the end.
```

## Can we make 5 a day on Pro?

**Not known yet; we measure it on the next two videos.** Usage when this was written: 5-hour
window 13% used, weekly cap 32% used (resets 2026-10-10), on top of all other Kanz work.

The test: the 5/day plan must fit **both** limits:
- **Weekly:** 5/day × 7 days = 35 videos. To leave room for other Claude work, one video must
  cost **about 2% or less** of the weekly cap. At 5/day on 5 working days (25/week), about **3%**.
- **5-hour window:** spread the 5 videos over at least two windows; don't batch all five in one.

If a lean Sonnet video costs more than that, the options are:
- move to **Max** (the $100 plan, which Anthropic sells as 5× Pro usage);
- let **Codex** write some scenes (this repo is agent-agnostic: `AGENTS.md` works for Codex too) and
  keep Claude for review;
- make fewer, or reuse scenes as templates for recurring formats so new videos need less writing.

ElevenLabs is billed separately: one ~90 s script is ~1,000 characters (the real-estate script
is 985), so 5/day is ~150k characters a month, plus samples and retakes. Check that the ElevenLabs
plan covers it; v4 may bill per character differently from older models.

## Usage log

Agents: read the plan usage (the usage card in the Claude app, or the `get_usage` tool) at the
**start and end** of every video session and add a row. Two or three rows answer "how many a day".

| Date | Project | Model / effort | Fresh session? | Fix rounds | 5-hour window Δ | Weekly Δ | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-05 | pilot-01 (with engine build) | Opus 5.5 / high | no | v1→v2 | not measured | not measured | includes research and engine; not representative |
| 2026-10-06 | what-is-technical-analysis (voice note, 128 s → 69.7 s) | Opus 5.5 / low | yes | v1 (1 review fix round) | start not read; end 12% | start not read; end 56% | local Whisper failed (Windows out of commit memory, mkl_malloc); transcribed on Yasser VPS `/root/projects/kanz-motion-transcribe` instead. No new objects: reused gavel (27 Sept, review pending), balance scale, NPC M01 neutral |
| 2026-10-06 | what-is-inflation (voice note, 156.7 s → 97.1 s) | Opus 5.5 / low | yes | v2 (1 review fix round + 1 anchor fix found in the MP4 check) | start not read; ~38% at end | start not read (previous row ended 56%); 59% at end, ≈ +3% | Transcribed on Yasser VPS again. No new objects: the approved inflation batch 04 (tomato, Pepsi can, sack, factory, thief hand, scale parts) plus savings jar and safe copied into library/objects |
| 2026-10-07 | the-cost-of-a-mistake (voice note, 186.0 s → 83.5 s) | Opus 5.5 / low | no (same session as what-is-inflation) | v1 (1 review fix round + 1 POV plate regenerated) | not read separately | not read separately | First POV opening: 2 generated image plates (treatment 01) via Codex in its read-only sandbox (workspace-write sandbox fails on Windows). VAD dropped 6 s of the edited voice; re-transcribed with VAD off. Reused the 27 Sept risk-management plank/crater cutouts |
| 2026-10-10 | real-estate-never-loses (script = Airtable reccX24eL2BeitWut Brief, Ahmed Shaaban instant clone `UeQ9UTIKgN2rsbnqHH5w`, 1.15 → 75.8 s) | Opus 5.5 / low | yes | v1 (1 review fix round: 2 empty boards filled) | start not read; 56% at end (shared with a concurrent kanz-motion session) | start not read; ~7% → 8% during the session | First script-route Reel with Ahmed's cloned voice. Scene from 2026-10-05 reused; closing logo/wipe and top-left logo removed to match the recent Reels. 180/180 script words matched by TTS timestamps. -16.9 LUFS |
| 2026-10-10 | real-estate-never-loses v2 (voice fix round, same session) | Opus 5.5 / low | no | v2 | not read separately | not read separately | Ahmed asked to find the VO faults: Scribe re-transcription vs script found all 7 he heard. Built engine/voicecheck.py (pre: script patterns; post: Scribe diff), library/voice/lexicon.json, per-paragraph TTS with real pauses + cache in tts.py. One fault still flagged FLAT (0:49.6 'تحت الإنشاء؟') after 3 tries; left for the ear. 86.0 s, -16.6 LUFS |
| 2026-10-11 | emotional-trading (script = Airtable recN49BA2awknaqVF Brief, Ahmed Shaaban clone, 1.15 → 151.2 s) | Opus 5.5 / low | yes | v1 (storyboard first, 2 review rounds before render) | start not read; 28% at end | start not read; 4% at end (weekly reset 2026-10-10) | Longest Reel so far (331 words). Storyboard shown before building. Genuine NBER w11243 screenshot for the 2005 study. Paper world twice, takeaway ending, cover style A. `make.py tts` crashed in voicecheck when its output was redirected (transcribe.py prints '→' under cp1252); ran with PYTHONIOENCODING=utf-8. 6 questions still FLAT after one re-roll. 153.5 s, -16.7 LUFS |
| 2026-10-11 | us-dollar-decisions (script = Airtable recuuRJ8eXF5mSCD4 Brief, Ahmed Shaaban clone, 1.15 → 75.1 s) | Opus 5.5 / low | yes (started in the Kanz repo chat) | v4 (v2: 0.6 s empty frame fix; v3: Ahmed's review — simple hook (now the default), US map, company icons, country landmarks via 6 Codex icons; v4: his pick of 4 'يوصلك' clips spliced in; pro-voice A/B rejected). Delivered to Drive + Airtable Ready to be posted, 77.4 s, -16.0 LUFS | not read | not read | Typos in the Brief fixed in captions/voice only and 'طبعا' → 'غالبًا' (Ahmed: "ok finish"); two lone 'و ' joined after voicecheck --pre. USD banknote/stack/cent-stack, bank and ATM copied from the approved Kanz explainer library into library/objects. Rows 1800 apart so the next row no longer shows under the takeaway. Lint: one off-screen safe flag during a pan, chapter build-up thin frames left. Cover style A. 77.5 s, -16.0 LUFS (v1) |
| 2026-10-11 | emotional-trading v2-v9 (same session) | Opus 5.5 / low | no | 8 more versions | not read separately | not read separately | Ahmed's rounds: cut to his shorter copy, then to 1:20 (whole-sentence cut), last sentence removed, 'متهوّر' fixed by splicing his chosen test clip, new hook copy (fact-checked), new defaults (smooth camera, mix 2), visual hook picked from 6 side-by-side renders; 3 new Codex objects. Voice paragraphs reused from cache each round (little ElevenLabs cost). 75.4 s, -16.1 LUFS |
| 2026-10-13 | gamblers-fallacy (script pasted in chat, Ahmed Shaaban Shorts clone, 1.15 → 99.6 s, retimed → 86.9 s) | Opus 5.5 / low | yes (started in the Kanz repo chat; one restart mid-render) | v1 (2 lint/review rounds before render) | start not read; 10% at end | start not read; 19% at end | First new video on the pace defaults. No roulette object: spins drawn as black/red result discs (data device) with the approved poker chips as hero. Numbers spelled out for the voice in say.json. v1 render crashed twice on Windows commit memory (WinError 1455) while another session rendered; passed once that render finished. 88.2 s, -16.0 LUFS. Cover style A |
| 2026-10-14 | gamblers-fallacy v2 (same session) | Opus 5.5 / low | no | v2 | not read | not read | Ahmed's v1 notes: room tone too loud (now `K.bedUnder`, 30 dB), gamblers that look like gamblers (men), roulette board + table with attendant, 'الأسود' wrong (picked clip 1 'الإسوِد', now in the lexicon). 8 Codex candidates (casino provenance file); drawn betting layout. Found and fixed retime.py re-timing the old take after a tts fix round. 88.2 s, -16.1 LUFS |
| 2026-10-14 | portfolio-rebalancing (script pasted in chat, hook line changed by Ahmed, Ahmed Shaaban Shorts clone, 1.15 → 69.9 s, retimed → 60.2 s) | Opus 5.5 / low | yes (started in the Kanz repo chat) | v1 (2 lint/review rounds + 1 MP4-check fix before delivery to Ahmed) | 8% mid-session → 9% at end (start not read) | 20% mid-session → 20% at end (start not read) | No new objects: EGP bundles as true-scale piles, balance scale from parts (emotional-trading code), approved chart/shield/office/M01. A pile's contact shadow on the neighbouring board showed under the scale during a camera move: `shadow: false` on that pile. 61.5 s, -16.0 LUFS. Cover style A |
| 2026-10-14 | portfolio-rebalancing v2 (same session) | Opus 5.5 / low | no | v2 | not read separately | not read separately | Ahmed's v1 notes: snap zoom at 10-11 s "suck" (all `K.snap` removed from this video) and props not stock-market. 4 Codex candidates in parallel (~2 min): share-certificate bundle, bull, bear, quote board (`library/objects/PROVENANCE-2026-10-14-stocks.md`); drawn candlesticks on the trading screen and stock cards. 61.5 s, -16.0 LUFS, bull cover |
