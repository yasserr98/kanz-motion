# Video production: start here

Repository: https://github.com/yasserr98/kanz-motion (private; the recipient needs repository access).

**Use Claude with the Codex plugin installed, enabled and authenticated.** This is the operator workflow selected for this handover: Claude works through the video-production steps, with Codex available through its plugin for the required production work. Confirm that Claude can invoke Codex before starting; this guide does not install or configure the plugin for you.

The engine itself uses local Python, Node.js, Chromium and ffmpeg. Claude and its Codex plugin are the chosen assistant setup, rather than Python package dependencies.

## Setup

1. Clone this repository and open it in Claude with the Codex plugin enabled.
2. Read `AGENTS.md`, `README.md` and `docs/EFFICIENCY.md`. Follow the current production checklist; historical research notes are not new approval.
3. Install Python 3.11+, Node.js 18+ and ffmpeg, then run the following from the repository folder:

```sh
npm ci
python -m pip install -r requirements.txt
python -m playwright install chromium
```

4. Supply an approved script or an authorized recording. For text-to-speech, configure your own ElevenLabs key and voice locally using `.env.example`; never commit `.env` or share credentials. Source voice recordings and generated MP4s are separate deliveries.
5. Follow the `make.py` recording or script route in `AGENTS.md`; review transcript/captions, visual contact sheets and the final MP4 before delivery. Keep supplied copy unchanged except for reviewed transcription corrections.

## Privacy and scope

This handover provides visual/video production tooling and finished examples, not private Arabic writing prompts or reusable voice formulas. Keep the repository private, retain asset credits and verify recipient permissions separately; credentials and private source recordings are not included.

For static carousels, use the separate [Kanz Carousels repository](https://github.com/yasserr98/kanz-carousels): **Codex only**, with its included Markdown guides; Claude is not required for that workflow.
