# Route: shorts cut from a long Kanz video

For "make shorts from this YouTube video". Work locally. Rules: [RULES.md](../RULES.md) SHORT-1..18, plus the shared ones
for the motion boards. Worked example: [`examples/short-house-always-wins`](../../examples/short-house-always-wins/)
(`K.footage` with clean cuts, Codex photos and icons; its face frames are git-ignored, so a fresh clone can read the
scene but not render it).

1. **Source.** `yt-dlp --js-runtimes node -f "bv*[height<=1080]+ba" --merge-output-format mp4` into
   `shorts/<video-slug>/source/` (git-ignored: source media never goes to this public repo).
2. **Transcript.** Codex runs it: extract audio, then `engine/transcribe.py` (Scribe v2, word timings) ->
   `shorts/<video-slug>/transcript.raw.json`.
3. **Moments.** Score 30-60 s candidates on hook / standalone / payoff / motion, add ffmpeg scene-cut density, cut 9:16
   previews and a picker page (`shorts/casino-wins-in-the-end/work/picker.py`). Leave out passages that attack people by
   religion or repeat unproven allegations and say why (SHORT-2). Ahmed picks.
4. **Project.** Copy `projects/_template/` to a new `projects/short-<slug>/` first (PowerShell:
   `Copy-Item -Recurse projects/_template projects/short-<slug>`; do not overwrite an existing project).
   Then `python engine/footage.py projects/short-<slug> <source.mp4> <transcript.raw.json> <start> <end>
   --video-from <first clean frame>`: face frames (git-ignored), voice and word timings. Start on a word, drop lines that
   point back to the long video, end before the next sentence starts (SHORT-3). The ending guard is automatic: the audio
   aims for 0.4 s after the last word, with a 0.05 s next-word margin and the fade inside the tail. Listen to the untrimmed
   source: the whole audible last word wins over that margin; a guard conflict needs a human ear. Add quiet after a
   verified cut, never cut into the word or leak the next sentence (SHORT-3; `--exact-end` retains the old behaviour).
   Join passages with `--also S E` (repeatable); aim for total silence about 0.25 s at each join (SHORT-13).
   Confirm boundaries on the source waveform and by listening, never from transcript edges alone. If a syllable sounds
   clipped, check for the source's own jump cut and show short listening options before choosing (Casino H v12 used 0.2 s).
   Workshop footage: `engine/footage_track.py` with the same
   arguments; it tightens dead air by default (`--no-tighten` keeps it). Both finish with `engine/faces.py`:
   `assets/faces.json` (his eyes-and-mouth box per frame) and `assets/freezes.json` (frozen source stretches: choose
   other seconds if one falls where his face shows, SHORT-17). Skip the source's transitions and glitch
   frames with `--video-from` (the first frame is held until then). When the source opens on a styled shot of the speaker
   (the TV set in casino-wins-in-the-end), keep it: `--tv-until <first clean second>` shows the whole source frame across
   the width, then zooms into the 9:16 face through the source's own transition (SHORT-5). A frozen frame at the start
   reads as a glitch. Remove accidental stutters, false starts and repeated phrases only where a natural cut preserves
   the meaning; record every cut and disclose what remains (SHORT-18). Listen from source to final.
   Write `script.md` with corrected Egyptian Arabic captions between `<!-- captions:start -->` and
   `<!-- captions:end -->`, one phrase per line with `*keywords*`; keep the verbatim transcript in a comment (CAP-1, SHORT-14).
   The footage tools supply `assets/faces.json` and `assets/freezes.json`; keep them with this project.
   If `shorts/_titles.json` does not exist, copy `shorts/_titles.example.json` to it (git-ignored); never overwrite
   existing picks. Replace the fake entry with this project's exact `short-<slug>`, three `options` and a 1-based `pick`
   (1 until Ahmed chooses). An optional `text` overrides the chosen option. Run
   `python engine/captions.py projects/short-<slug>` after caption or title edits: it writes `build/timing.js`,
   including `window.TITLE`, face boxes and freezes. Follow the [image pass](images.md) before writing the scene.
5. **Scene.** Adapt the worked example into the scaffold. In `index.html`, load `runtime/kanz-footage.js` after the
   existing runtime scripts and before `scene.js` (also `runtime/kanz-split.js` for workshops);
   `K.footage({dir: "assets/face", n, windows})`, with `n` from the extracted frame count.
   - Subtitles are Egyptian Arabic throughout, translating any English he speaks (SHORT-14); script.md keeps the verbatim
     transcript in a comment for the record.
   - `K.pace({ defaults: "2026-10-18" })`. The first 3 s always show his face with the reel's title over it:
     `K.title()` with no text takes the pick from `shorts/_titles.json` and finds a height off his face (white sticker;
     it hides the subtitles until 3 s by itself). Never copy the title by hand. Call it after any line that sets
     `K.captionsFrom` (SHORT-4). Leave `K.duration` and `end` unset: they follow the voice and its ending guard. In the 50/50 split, subtitles sit on the seam (SHORT-12, automatic in `kanz-split.js`).
     Workshop title placement starts at y 330, then follows the face boxes wherever his eyes and mouth stay clear
     through all three seconds (Live E used y 190); never treat either coordinate as fixed (SHORT-4).
   - Alternate face and motion: cut in the pauses before a word; face for the lines he delivers to camera, boards for the
     mechanism. Windows can carry a jump zoom `[a, b, 1.16]`, but none by default (PACE-5).
   - The last board runs to the last frame; no cut back to the face, no takeaway tail (SHORT-7).
   - Workshop/live footage (his X Live workshops): motion inserts alternate between a 50/50 split screen (his tracked
     face in one half, the board in the other) and a full-screen board, still with clean cuts in the pauses; the camera
     tracks him around the 16:9 frame. The shared helpers exist: `engine/footage_track.py` extracts tracked crops and
     `runtime/kanz-split.js` (`K.split`) displays them; reuse them (SHORT-11).
   - Keep the source's burned-in text (lower-third labels such as "حجم الرهان"); keep the face un-zoomed while a label
     shows, or zoom about it (`faceY`) (SHORT-5).
   - Transitions: the clean cut (`xstyle: "cut"`, the default) in the pause before a word, onto a board that is already
     built. Build each board's opening objects ~0.3 s before its cut (`const PRE = 0.3`; headline, hero, glow at
     `c - PRE`). Prints use `K.snap35(board, src, { slim: true, flash: false })` (IMG-11); no flash or white frames
     on a cut (SHORT-6). Whip, zoom-through and TV-glitch
     styles exist but were not picked (comparison: `projects/short-house-always-wins`, transition-options, local).
   - Pay off what the hook promises: "three words" -> each gets its own titled beat ("الكلمة الأولى / التانية / التالتة")
     (SHORT-8). Every picture belongs to the line; not every line needs a headline (SHORT-9).
   - Workshop shorts: his face (full or in the split) at least 50% of the runtime; boards only for mechanisms, numbers
     and names (SHORT-15). Changes to or from his full face are clean cuts, never inside a word; split <-> board eases
     (SHORT-16). Dollar amounts on screen with `K.money(39.8)`; subheadlines with `K.under(head, html)` (NUM-5, TXT-5).
6. **Review.** Lint (dead stretches are not flagged inside face and split windows), review, then `make.py ship`. Write
   each of Ahmed's review notes into `notes.json` (`make.py note <slug> 39.8 "his words"`, then `make.py note <slug>
   fixed 1`). Ship pulls 12-frame strips around every cut into `out/cuts-<version>.jpg` and fails on charcoal, flash,
   half-built and one-frame flags (SHORT-10), checks the ending, the next-sentence leak, the title, duplicate frames in
   face windows and the frame rate, and writes a still for every note into `out/notes-<version>.jpg`; look at both
   sheets. Proof must match the complaint: layout gets a final-MP4 still, audio a listened final-MP4 interval with
   source comparison when edited, motion/cuts a played interval or frame strip. Record the version and interval;
   mark an accepted defect `accepted`, never `fixed` (REV-7). Demo of every check: `projects/_guards-demo`.
