# Getting the latest Kanz Motion (editors)

Paste the prompt below into Claude, opened in your `kanz-motion` folder. It brings in Ahmed's latest engine and keeps
every video you made exactly where it is. Your projects and renders never go to GitHub.

**Nothing to sign up for.** The repository is public: no GitHub account, login, token or GitHub MCP is needed, only an
internet connection. It works whether your folder is a Git clone or came from "Download ZIP", and whether or not Git is
installed.

```text
Update my Kanz Motion folder (this folder) to the latest version from the public GitHub repo
https://github.com/yasserr98/kanz-motion (branch main). It is public: no GitHub account, login, token or GitHub MCP
is needed, so do not ask me for any. My own projects, voices, renders and .env stay on this machine: never commit,
push, delete or overwrite them.

Pick the route:
- Route A if this folder has a `.git` folder and the `git` command works.
- Route B otherwise (the folder came from a ZIP, or Git is not installed). Do not install Git just for this.

Route A (Git, no account):
1. `git status --short`, then `git fetch https://github.com/yasserr98/kanz-motion.git main`.
   If `git merge-base HEAD FETCH_HEAD` prints nothing, this copy predates the 2026-10-21 history clean-up and cannot
   merge: do not merge, rebase or `reset --hard`. Instead follow Route B steps 1-5 on this folder, then run
   `git reset FETCH_HEAD` (plain, never `--hard`: it moves only Git's pointer and index, and changes no file in the
   folder), show me `git status --short`, and go on with "Then (both routes)". Skip the rest of Route A.
   Show me the new commits: `git log --oneline HEAD..FETCH_HEAD`. If there are none, say I'm up to date and stop.
   Then list files the update would delete: `git diff --name-status HEAD FETCH_HEAD | grep "^D"`. Ahmed's old
   projects left GitHub on 2026-10-17, so an older copy loses `projects/<name>/` folders it still tracks. Before going on,
   copy every folder under `projects/` that appears there to `_update-backup-<today>/` outside `projects/`, tell me,
   and after the update put the copies back in `projects/` (Git ignores them there now).
2. If tracked files have local changes, list them, then `git stash push -m "before update <today>"`.
3. `git merge --ff-only FETCH_HEAD`. If a stash was made, `git stash apply`; if that conflicts, stop and show me the
   files. Keep the stash after success too (REPO-3).
4. If the merge refuses because a file from GitHub would overwrite one of my untracked files (same project name),
   stop and tell me which; do not move, rename or delete anything without asking.
5. Never run `git reset --hard`, `git clean`, `git checkout -- .`, `git push` or `git commit`; never drop a stash.

Route B (no Git, download the ZIP):
1. Download https://github.com/yasserr98/kanz-motion/archive/refs/heads/main.zip into a new temporary folder outside
   this one (PowerShell: Invoke-WebRequest + Expand-Archive; macOS/Linux: curl -L + unzip). It unpacks to
   `kanz-motion-main/`.
2. Compare it with this folder and list for me: files that are new, files that changed, and which of my projects
   would be affected. Ignore node_modules/, .env, every out/ folder, and audio files.
3. Back up every file that is about to be replaced into `_update-backup-<today>/` inside this folder (same paths).
4. Copy from the download into this folder:
   - everything outside `projects/` (runtime/, engine/, docs/, library/, brand/, AGENTS.md, README.md,
     package.json, package-lock.json, requirements.txt, ...): new and changed files;
   - inside `projects/`: only files that do not exist here yet. Never replace a file inside an existing project
     folder of mine, except `projects/_template/` and the `projects/_*-demo/` engine demos shipped in the download,
     which are replaced (they are backed up in step 3). `examples/` is Ahmed's: new and changed files.
   Do not delete any file from this folder, even one that no longer exists upstream.
5. Delete only the temporary download folder.

Then (both routes):
6. If package-lock.json changed, run `npm ci`; if requirements.txt changed, `python -m pip install -r requirements.txt`.
   If I make shorts and requirements-shorts.txt is new or changed, `python -m pip install -r requirements-shorts.txt`,
   then `python engine/make.py doctor --shorts`.
   After a Playwright upgrade, run `python -m playwright install chromium`, then `python engine/make.py doctor`.
7. Re-read AGENTS.md, README.md and the "Recent changes" list in docs/UPDATE.md, then tell me in a few lines what is new
   and which of my videos I should re-render to get a fix.
```

Recent changes (2026-10-21, no re-render needed):

- **Openings are a moving illustration (HOOK-1..4):** voice-note and script Reels start on a drawn scene in the Live C
  v10 style under the headline, moving with the opening words; never a still photo or a static icon. The template shows
  it. Shorts still open on his face.
- **History cleaned:** old video projects, private ids and a server path were removed from every past commit, so a copy
  cloned before today cannot merge: the prompt above moves it over without touching your files.
- **What to connect:** README "What to connect" lists each account (Claude, Codex, ElevenLabs, Ahmed's voice, shorts
  tools; Airtable, Drive, Metricool and Apify on Ahmed's side) and what it unlocks.
- **Docs audit:** stale numbers and superseded rules fixed across README, LOOK-V2, PACE and the routes; the shorts route
  deletes the template's stub `lint-ok.json` after copying it.

Recent changes (2026-10-18 to 2026-10-20). Every rule below is a line in `docs/RULES.md`; the reasons are in
`docs/DECISIONS.md`.

- **Local renders (Q8):** one job at a time, even when `KANZ_RENDER_HOST` is set. Use `--host` on render/ship/remix
  only when Ahmed asks for that VPS job; `--local` is still accepted as a no-op.
- **Short endings (Q1):** pick by the last line: face for his opinion/punchline (~0.2 s after the last word), a moving
  last board for an explanation/number; never replay the hook or hold a static board (SHORT-7).
- **No idle pictures (Q2):** arrivals settle, then pictures sit still, hook hero included; camera drift and real
  explanatory changes move. Current-profile lint warns `idle-motion` on `float`; old scenes still render (PACE-9).
- **50% face for all shorts (Q3):** YouTube and workshop cut-outs, counting full face and split together. New
  enforcement uses the 2026-10-18 profile; legacy checks stay unchanged (SHORT-15).
- **Photo openings (Q4):** replaced on 2026-10-21 by the illustrated opening (see above).
- **Past-event places (Q5):** photo-real generated settings are allowed when no real photo of that moment exists;
  record them as generated in `CREDITS.md`. Real people are never generated or repainted (IMG-8).
- **Re-dos keep the take, update the pace (Q6):** `make.py retime <slug>` (1.08, pauses to 0.3 s); voice notes retain
  1.25x and use `make.py retime <slug> 1.0` (VOICE-10).
- **Diagrams for numbers, drawings for ideas (Q7):** prices, percentages and amounts use moving engine diagrams;
  causes, actors and stories use the four approved Live C v10 references in `library/scenes/` (EXPL-1, IMG-4).
- **Small revisions (Q9):** render + `make.py check <slug> <version> --partial` + the changed-seconds notes sheet may replace a full ship.
  Follow [the exact commands](../README.md#small-revisions); receipts say "partial checks passed" (REV-3).
- **Opus plans, Sonnet builds (Q10):** Opus (medium) storyboards and reviews; Sonnet 5.5 (medium) builds, renders
  and fixes notes. Keep one fresh session per video.

- **New template defaults** (`K.pace({ defaults: "2026-10-18" })`, already in `projects/_template`): `K.title()` for the
  shorts title sticker, subtitles that move down (never up over his face), eased split moves, `K.money(39.8)` for dollar
  amounts and `K.under(head, html)` for a subheadline with breathing room. Older scenes render as before.
- **Endings and explanations:** no replay of the hook at the end; board endings get their own moving last visual and end about 0.4 s
  after the last word (PACE-6; face endings use SHORT-7 above). Numbers use moving diagrams; causes, actors and
  stories use drawn scenes, icons only support (EXPL-1, EXPL-2). Real people use real photos in the slim print
  (`K.snap35({ slim: true })`, IMG-8, IMG-11); the past-event setting exception is above.
- **Nothing crosses a headline** (TXT-6): panels, chart lines and objects start at least 40 px below it. A label stays
  fully visible for at least 0.8 s (TXT-7).
- **Sound:** one effect at a time, the voice gently compressed, two-pass loudness to -16 LUFS; room tone 40% quieter.
  `python engine/make.py remix <name> <from> <to>` gives an approved render the new sound without touching its picture.
  `K.fire()` now plays one sound (`legacyPair: true` keeps the old two).
- **Stricter checks:** lint flags headline crossings (the main headline, and board headlines you mark with
  `data-role="headline"`), titles over the face,
  frozen footage, overlapping sound effects and stray `$` signs; `make.py check` now fails when it finds a problem and
  `make.py ship` stops on a library object that is not approved. Fix the finding or justify it in `lint-ok.json`.
- **One browser job at a time:** render, lint, stills, cover and contrast queue for one slot per computer, across every
  copy of the folder. "waiting for the local render slot" means queued, not stuck.
- **Voice notes:** an `audio/edl.json` without `"speed"` now plays at 1.25x (VOICE-2); it was silently 1.0x. If one of
  your voice notes must stay at its old pace, add `"speed": 1.0` before re-running the edit. A chosen pronunciation take is
  spliced as that exact audio, never regenerated (VOICE-9).
- **Shorts:** install `requirements-shorts.txt` (OpenCV, yt-dlp) and run `make.py doctor --shorts`; copy
  `shorts/_titles.example.json` to `shorts/_titles.json` for the title options. Tightened workshop footage no longer lets the
  sound drift ahead of the picture (about 6 ms per cut before), a voice join gets about 0.25 s of silence in all, and the
  ending never cuts into the last word. Re-cut and re-render a tightened workshop short if its sound looked out of sync
  toward the end. Stutters and repeated phrases come out where a natural cut exists (SHORT-18).

Recent workflow changes (2026-10-17, no re-render needed):

- **Rules in one place.** `AGENTS.md` is now a short checklist; the rules in force are `docs/RULES.md` (each with an id,
  e.g. NUM-3), the routes are in `docs/routes/`, and Ahmed's dated decisions in `docs/DECISIONS.md`.
- **New rules for new videos:** Western digits with ٪ (`35`, `65٪`), source lines 28 px and labels 34 px minimum, at most
  four labels on a board, no label that repeats the caption, contrast kept on the paper world, no snap zooms. Chart colours
  stay as they are. The template turns these on; lint reports `digits`, `small-text`, `crowded-board` and `caption-repeat`.
- **Worked examples** are in `examples/` (`us-dollar-decisions-pace` to copy for a voice note or script,
  `short-house-always-wins` for shorts). Don't copy older projects: most predate pace.
- **New commands:** `python engine/make.py doctor` checks your setup; `python engine/make.py ship <name> v1` lints,
  renders, checks the frames and the loudness, and stops at the first failure. Renders are local by default;
  explicit `--host` uses `KANZ_RENDER_HOST` only when Ahmed asks for that job (updated 2026-10-20).
- **Objects:** `library/objects/manifest.json` says which objects are approved; `make.py ship` stops when a
  scene uses a library object that is not approved (OBJ-2). Ask Ahmed before shipping one.
- **Your projects stay yours:** Git now ignores `projects/` (except the template and demos), so nothing you make can be
  committed by accident.

Recent changes worth a re-render:

- **2026-10-17, visual defaults** (`docs/PACE.md` "Visual defaults"): new videos from the template keep objects out of
  the captions, arrive on built boards, hide the caption under `K.punch`, cap fly-ins and size marks to their element.
  Existing videos are unchanged on re-render; to opt one in, change its `K.pace()` to
  `K.pace({ defaults: "2026-10-17" })` and review it, since boards and timings move.

- **2026-10-14, frame guard** (`docs/PACE.md` "Frame guard"): on videos using `K.pace()`, the camera no longer pushes
  people, labels, chart marks or arrows past the side of the frame. Re-render a pace video to get it; nothing in its
  scene needs to change.
