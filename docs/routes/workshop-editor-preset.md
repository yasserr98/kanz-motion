# Workshop editor preset (opt-in, 2026-10-23)

An editor's preset for shorts cut from Ahmed's workshop recordings, from the review of six shorts cut from the
2026-09-27 workshop ("ورشة طوارئ: ماذا يحدث في السوق المصري الان"). It sits on top of the shorts route
([shorts.md](shorts.md)) and changes nothing for a scene that does not opt in. Where it differs from
[RULES.md](../RULES.md) (SHORT-6 and SHORT-16: clean face cuts), it is a proposal for Ahmed, not a rule in force;
RULES.md still wins for Ahmed's own projects.

Start from [`projects/_workshop-template`](../../projects/_workshop-template/) and the helpers in
[`runtime/kanz-workshop.js`](../../runtime/kanz-workshop.js).

## What the preset changes

| Area | Preset | The editor's note (2026-10-23) |
| --- | --- | --- |
| Face <-> motion | `K.footage({ xstyle: "dissolve", xfade: 0.35 })` | "Smooth out the animation in and out, don't make it hard cutted" |
| Board to board on screen | `K.boardSwap(from, to, id, t)`: the old board fades out, the camera moves, the new one fades in | "Do not overlap text or images between scenes that are unrelated" |
| Sound effects | `K.onScreenSounds()` before `K.finish()`: no cue under his face for pieces built before a cut | "Sound effects are misaligned" |
| Price moves | `K.candles` with `K.candleSeries(closes, start)` instead of `K.area` lines | "Make the charts candles" |
| Characters | Men only: `kanz-npc-m01-*`, `m02-*`, `g01-*`, `g02-*`; never `kanz-npc-crowd-back-v01.png` (a woman from behind) or `kanz-npc-f01-*` | "Don't show the girl from her back ever again", "replace the girl with another man" |
| Stutters | Cut repeated words ("اللي اللي", "العوايد العوايد") with `--also` joins at measured pauses (SHORT-18) | "ظبطها بحيث الكلام ميبانش متلخبط او بيتهتهته" |

## Footage for a close 1080p webcam

The workshops are filmed on a 1920x1080 webcam with Ahmed close to it. `footage_track.py --half-h 900` keeps his head
and shoulders in the split half (the default 560 crops his face); keep the 9:16 crop at full height (`--zoom 1`:
`--zoom 1.2` lost his face at the edge when he looks sideways). Skip screen-share stretches: his face is a small corner
box there; check a strip of frames every 2 s across a range before cutting it.

With his face that large, the subtitles in a long face window sit on the lowest line `kanz-footage.js` allows (y 1500,
SHORT-12), on his chin under his mouth; lint reports `on-face`. Look at `out/lint.jpg`, and justify it in
`lint-ok.json` only where the mouth stays clear.

## Cut points without an ElevenLabs key

Local Whisper glues words in fast speech, so its word times cannot place a cut and the SHORT-3 ship check reads a
next-word leak that is not there. Use [`engine/pauses.py`](../../engine/pauses.py):

1. `python engine/pauses.py quiet <source.mp4> <t> ...` lists the quiet runs near each planned cut (or `levels` for
   the dB in 50 ms steps); put the start and end of every range inside one.
2. Cut with `footage_track.py ... --exact-end` (the tail is your measured pause, not Whisper's).
3. `python engine/pauses.py fix projects/short-<slug> <range> <last_end> <next_start> ...` writes the measured word
   end and next word start into `transcript.json` (Whisper's values stay under `cut_from.whisper_ranges`).

A word Whisper ends past the cut is missing from `transcript.json`; add it at its measured end so captions and the
`tail` check see the real last word. A breath right before the next word cannot be cut cleanly: the ship check reads
it as the voice still sounding, and it needs an ear. With an ElevenLabs key, Scribe's word times and audio events make
most of this section unnecessary.

## Layout checks to plan for

- Candle and line charts are SVG: the lint fill check does not count them, so a full-screen board that is mostly a
  chart reads as thin. Put chart boards in the split, where fill is not checked, or give the board a large image too.
- A dead stretch is "no new element and no camera move over 2.5 s"; a slow drift does not count. Give each board a
  beat every 2 s (a tag on a word, a quick `K.frame` of 0.7 s).
- `K.T()` skips the shown words of a translated line (`Arabic {{English}}`): anchor on the spoken words in `{{ }}`.
- `K.arrow(board, fromEl, toEl)` with elements clears both by 16 px; arrows by coordinates between stacked tags cross
  them (`markup-crossing-text`).
