# Route: written script -> Reel (ElevenLabs voice)

Needs `ELEVENLABS_API_KEY` in `.env` and a voice. Rules: [RULES.md](../RULES.md) (VOICE, CAP, then the shared ones).
Worked example: [`examples/us-dollar-decisions-pace`](../../examples/us-dollar-decisions-pace/) (look v2 + pace + finish;
the scene to copy for any new Reel).

1. **Voice.** Ahmed's copy: the instant clone "Ahmed Shaaban Shorts" `UeQ9UTIKgN2rsbnqHH5w` (the `.env` default), never
   the professional clone "Ahmed Shaaban" `zb1ukG6KkE2RYSjMU6b3` (VOICE-4). **Editors' copies:** both clones live in
   Ahmed's ElevenLabs account, so these ids work only with his key. With your own key, `python engine/tts.py
   --list-voices` shows the voices you can use; put the one Ahmed approved for you in `.env` as `ELEVENLABS_VOICE_ID`,
   and ask him if he has not named one.
2. **Project.** `python engine/make.py script <slug>` (English slug). Paste the copy verbatim between the caption markers
   of `script.md`, mark `*keywords*`, flag doubts; never rewrite it (VOICE-6).
3. **Speed.** `make.py sample <slug> 1.0` and `make.py sample <slug> 1.15` for Ahmed to pick.
4. **Voice.** `make.py tts <slug> <speed>`. Before generating, `voicecheck.py --pre` lists script patterns the clone gets
   wrong (`library/voice/lexicon.json`); it voices one paragraph at a time (cached in `audio/_tts`, so fix rounds re-roll
   only changed paragraphs); after, Scribe re-transcribes and prints WORD / STUMBLE / PAUSE / FLAT / EAR findings. Fix with
   voice-only spelling in `say.json` (captions keep `script.md`), delete that paragraph's `audio/_tts/pNN.json`, re-run.
   Tell Ahmed the EAR times; add each failure he hears to the lexicon (`replace` if a respelling fixes it, `watch` if it
   only needs flagging) (VOICE-7).
5. **Retime.** Once the voice is final: `make.py retime <slug>` (pauses to 0.3 s, tempo 1.08; ElevenLabs caps speed at
   1.2), and write the scene against the retimed timings (VOICE-5).
6. Continue with the shared steps in [AGENTS.md](../../AGENTS.md): image pass, scene, review, ship.
