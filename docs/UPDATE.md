# Getting the latest Kanz Motion (editors)

Paste this into Claude, opened in your `kanz-motion` folder. It brings in Ahmed's latest engine and keeps every video
you made exactly where it is. Your projects and renders never go to GitHub.

```text
Update Kanz Motion to the latest version from GitHub. My own projects, voices and videos stay on this machine:
do not commit, push, delete or overwrite any of them.

1. Run `git status --short` and `git fetch origin`. Show me how many new commits there are
   (`git log --oneline HEAD..origin/main`).
2. If only untracked files show up (my projects under projects/, renders in out/), run
   `git pull --ff-only origin main`.
3. If tracked files have local changes, list them first. Then `git stash push -m "before update <today>"`,
   `git pull --ff-only origin main`, `git stash pop`. If the pop conflicts, stop and show me the files; keep the stash.
4. If the pull refuses because a file from GitHub would overwrite one of my untracked files (same project name),
   stop and tell me which project; do not move, rename or delete anything without asking.
5. Never run `git reset --hard`, `git clean`, `git checkout -- .`, `git push` or `git commit`, and never drop a stash.
6. If package-lock.json changed, run `npm ci`; if requirements.txt changed, run
   `python -m pip install -r requirements.txt`.
7. Re-read AGENTS.md and README.md (they may have changed), then tell me in a few lines what is new and whether I
   should re-render a video I'm working on to get a fix.
```

Recent changes worth a re-render:

- **2026-10-14, frame guard** (`docs/PACE.md` "Frame guard"): on videos using `K.pace()`, the camera no longer pushes
  people, labels, chart marks or arrows past the side of the frame. Re-render a pace video to get it; nothing in its
  scene needs to change.
