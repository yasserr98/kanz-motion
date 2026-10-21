# Dollar: current scene example

Copy this scene for script and voice-note Reels. It demonstrates PACE-1..6, HOOK-1..3 and EXPL-1 with the
2026-10-18 defaults. The delivered Reel used an older look; this teaching copy is not its archival scene.

Its opening is the question-hero (still allowed). The preferred opening for new Reels is a photo of the story's place
with the headline and captions from frame 1 (HOOK-4): replace section 1 with `K.screen(<photo>, 0, <end of the opening>)`
on the first board, its headline, and `K.captionsFrom = 0` ([the image pass](../../docs/routes/images.md), step 2).

Stills can render from the tracked timings and assets without local voice media. A full MP4 needs the private voice
audio. The setup smoke command is `python engine/make.py review us-dollar-decisions-pace 3,20,45`.
