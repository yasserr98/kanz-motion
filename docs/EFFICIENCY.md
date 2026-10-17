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

## Usage log

The plan-usage measurements and the per-video usage log are private (Ahmed's Kanz repo,
`reports/kanz-motion-deliveries/USAGE-LOG.md`, since 2026-10-17). In Ahmed's copy, add a row there at the end of every
video; editors don't log usage.
