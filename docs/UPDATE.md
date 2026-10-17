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
   Show me the new commits: `git log --oneline HEAD..FETCH_HEAD`. If there are none, say I'm up to date and stop.
2. If tracked files have local changes, list them, then `git stash push -m "before update <today>"`.
3. `git merge --ff-only FETCH_HEAD`. If a stash was made, `git stash pop`; if that conflicts, stop, show me the files
   and keep the stash.
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
7. Re-read AGENTS.md, README.md and the "Recent changes" list in docs/UPDATE.md, then tell me in a few lines what is new
   and which of my videos I should re-render to get a fix.
```

Recent workflow changes (2026-10-17, no re-render needed):

- **Rules in one place.** `AGENTS.md` is now a short checklist; the rules in force are `docs/RULES.md` (each with an id,
  e.g. NUM-3), the routes are in `docs/routes/`, and Ahmed's dated decisions in `docs/DECISIONS.md`.
- **New rules for new videos:** Western digits with ٪ (`35`, `65٪`), source lines 28 px and labels 34 px minimum, at most
  four labels on a board, no label that repeats the caption, contrast kept on the paper world, no snap zooms. Chart colours
  stay as they are. The template turns these on; lint reports `digits`, `small-text`, `crowded-board` and `caption-repeat`.
- **Worked examples** are in `examples/` (`us-dollar-decisions-pace` to copy for a voice note or script,
  `short-house-always-wins` for shorts). Don't copy older projects: most predate pace.
- **New commands:** `python engine/make.py doctor` checks your setup; `python engine/make.py ship <name> v1` lints,
  renders, checks the frames and the loudness, and stops at the first failure. With `KANZ_RENDER_HOST` in `.env`, renders
  go to that server (`--local` renders on your machine).
- **Objects:** `library/objects/manifest.json` says which objects are approved; `make.py check` and `ship` warn when a
  scene uses a candidate. Ask Ahmed before shipping one.
- **Your projects stay yours:** Git now ignores `projects/` (except the template and demos), so nothing you make can be
  committed by accident.

Recent changes worth a re-render:

- **2026-10-14, frame guard** (`docs/PACE.md` "Frame guard"): on videos using `K.pace()`, the camera no longer pushes
  people, labels, chart marks or arrows past the side of the frame. Re-render a pace video to get it; nothing in its
  scene needs to change.
