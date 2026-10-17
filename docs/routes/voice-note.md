# Route: voice note -> Reel

Ahmed sends a recording. Rules: [RULES.md](../RULES.md) (VOICE, CAP, then the shared ones). Worked example for the audio
steps: [`examples/what-is-inflation`](../../examples/what-is-inflation/) (the one Posted Reel: `transcript.raw.json`,
`audio/edl.json`, the corrected `script.md`; its scene is the old look and is not included). For the scene, copy
[`examples/us-dollar-decisions-pace`](../../examples/us-dollar-decisions-pace/): once the voice exists, a voice-note scene
is written exactly like a script one.

1. **Project.** `python engine/make.py new <slug> "<voice-note>"` (English slug). Copies the audio, writes
   `transcript.raw.json` (Scribe with an ElevenLabs key, local Whisper otherwise; its `"events"` list coughs/sighs/laughs).
   Noisy note: `make.py clean <slug>` makes an isolated copy to compare.
2. **Edit list.** Write `audio/edl.json`: keep the last clean take of each retake, reason per cut in `_why`, speed 1.25
   (VOICE-1, VOICE-2). Then `make.py audio <slug>`: cuts, speed, final `transcript.json`, and a `script.md` prefilled from
   the transcript between the caption markers (never overwrites one). Read the new transcript through (VOICE-3).
3. **Breaths.** `make.py breaths <slug>`; mute real ones via `"mute"` in `audio/edl.json`, re-run `make.py audio` (VOICE-8).
4. **Script.** Correct `script.md` against what was said (recognition slips only), mark one `*keyword*` per line, list
   uncertain words at the top for Ahmed (CAP-1).
5. **Retime.** `make.py retime <slug> 1.0` (tightens pauses only; the voice is already 1.25x) (VOICE-5).
6. Continue with the shared steps in [AGENTS.md](../../AGENTS.md): image pass, scene, review, ship.
