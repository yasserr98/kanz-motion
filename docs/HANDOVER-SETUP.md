# Video production: start here

Repository: https://github.com/yasserr98/kanz-motion (public: no GitHub account needed, only [Git](https://git-scm.com/downloads) installed).

**Use Claude with the Codex plugin installed, enabled and authenticated.** This is the operator workflow selected for this handover: Claude works through the video-production steps, with Codex available through its plugin for the required production work. Confirm that Claude can invoke Codex before starting; this guide does not install or configure the plugin for you.

The engine itself uses local Python, Node.js, Chromium and ffmpeg. Claude and its Codex plugin are the chosen assistant setup, rather than Python package dependencies.

## Setup

1. Clone this repository (`git clone https://github.com/yasserr98/kanz-motion.git`; no account or login needed) and
   open the folder in Claude with the Codex plugin enabled. "Download ZIP" also works; [UPDATE.md](UPDATE.md) updates either.
2. Read `AGENTS.md` (the checklist) and `docs/RULES.md` (the rules in force). Historical research notes are not new approval.
3. Install Python 3.11+, Node.js 18+ and ffmpeg, then run the following from the repository folder:

```sh
npm ci
python -m pip install -r requirements.txt
python -m playwright install chromium
python engine/make.py doctor
```

   `doctor` lists anything still missing. Codex's reference sheets live in Kanz's private repo, so without them use the
   approved objects in `library/objects/` (`docs/routes/images.md`).

4. Supply an approved script or an authorized recording. For text-to-speech, configure your own ElevenLabs key and voice locally using `.env.example`; never commit `.env` or share credentials. Source voice recordings and generated MP4s are separate deliveries.
5. Follow the route in `docs/routes/` (voice note, script or shorts) and the checklist in `AGENTS.md`; finish with `make.py ship`; review transcript/captions, visual contact sheets and the final MP4 before delivery. Keep supplied copy unchanged except for reviewed transcription corrections.

6. **Your videos stay on your machine.** Nothing you make is committed or pushed to GitHub: projects, voices and MP4s
   stay in your local `projects/` folder, and you hand the finished MP4 over directly. GitHub only brings you engine updates.
7. **Getting the latest engine:** paste the prompt in [UPDATE.md](UPDATE.md) into Claude. It pulls the update and leaves
   your projects as they are.

## Privacy and scope

This handover provides visual/video production tooling and finished examples, not private Arabic writing prompts or reusable voice formulas. The repository is public; retain asset credits and verify recipient permissions separately; credentials and private source recordings are not included.

For static carousels, use the separate [Kanz Carousels repository](https://github.com/yasserr98/kanz-carousels): **Codex only**, with its included Markdown guides; Claude is not required for that workflow.
