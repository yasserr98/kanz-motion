# The image pass: photos, diagrams and supporting icons

Every video, voice note, script or short, gets an image pass before the scene is written (IMG-1). Do not settle for
whatever `library/objects/` already has. Rules: [RULES.md](../RULES.md) IMG and OBJ.

1. **Shot list from the whole script.** For every sentence, decide what the viewer needs to see: a thing, place, person,
   relationship, mechanism or number. Write `projects/<slug>/shots.json` (format in
   `engine/codex_assets.py`): the video's context in two or three sentences, and per shot the line it illustrates, a
   concrete subject, the one lavender detail and a library reference.
2. **Pick the visual type per shot** (IMG-4):

   | Type | Use it for | How | Rules |
   | --- | --- | --- | --- |
   | **Full-screen photo** | a *place or setting* the line puts us in: a casino, a sportsbook, a stadium, a market floor | Codex mode `free` (generic places), or a real photo; a real past-event place/setting may be generated when no photo of that moment exists (IMG-8) | fills the whole frame, darkened top and bottom so the headline and captions read; one per board; headline, captions and explanatory elements such as a live line may overlay it (HOOK-4); no decorative icons; holds 1.5 s or more; generated reconstructions are recorded as generated in `CREDITS.md` |
   | **Slim disposable print** | a *real person or real event*: Messi, the 2022 final, a CEO, a news event | untouched real photo, openly licensed OR a press photo of a real public moment (IMG-8); `K.snap35(board, src, { slim: true, flash: false })` (IMG-11) | source, licence or credit in `CREDITS.md`; no date or credit on screen (IMG-6); readable purple tags on top, never behind; clear of headlines and captions; show the actual moment (the trophy ceremony, not players on the pitch); never generated or repainted people |
   | **Approved Kanz icon** | a *plain object*: a house, bank or wallet | approved `library/objects/` file, or Codex mode `kanz` in the approved icon style, approved before use (OBJ-2) | a plain thing can be the hero; icons only support an explanation (EXPL-2) |
   | **Moving engine diagram** | any *price, percentage or amount* | `K.area`, `K.bar`/`K.delta`, `K.count`, `K.stack`, arrows and flows | animate the numbers with the words, never a still chart picture (EXPL-1, IMG-4) |
   | **Drawn explanatory scene** | *causes, actors and stories* | Codex mode `kanz`, one connected scene per beat; use an approved [Live C v10 reference](../../library/scenes/README.md) as `ref`, e.g. `../scenes/scene-bank-helm.png` | Kanz icon style from the approved sheet; arrives/draws in, then sits still; no idle motion (EXPL-1, PACE-9) |

   Let the sentences set the shot plan: establish a place when it matters, animate the relationship being explained,
   and show an authentic photo when a real person or event is named. The first shot of a voice-note/script Reel is
   always a drawn scene (Live C v10 style) under the headline, moving with the opening words; never a still photo or a
   static icon (HOOK-1..4). Put that opening scene first in `shots.json`. Shorts keep SHORT-4.
   Plan diagrams in the engine; generate only the supporting assets or explanatory drawings that the shot needs,
   keeping the approved references (a new illustration aesthetic is not implied). The template loads
   `runtime/kanz-snap.js`. Because the world stays visible over a photo, a place photo gets a board of its own that holds
   text, tags and any explanatory overlay (`K.go` to it, `K.screen` from `g.start`); never drop a photo behind a board that already has icons.
   Keep a print in its board's upper two thirds (centre y ≤ ~600 at the board's zoom); intentional annotations must stay
   readable and clear of the subject, headline and captions.
3. **Headline lift.** `K.screen` darkens the headline and caption bands as much as each photo needs, and board text gets a
   soft dark halo while a photo fills the screen. Verify on the rendered frame:
   `python engine/contrast.py projects/<slug> <times of every photo moment>`; every line must reach 4.5:1 against the
   brightest background pixels behind it; raise `dark:` or move the text if one fails (IMG-7).
4. **Generate without asking first.** `python engine/codex_assets.py projects/<slug>/shots.json --jobs 4`, each shot's
   `modes` set to its type (`free` for places, `kanz` for icons and drawn scenes). Outputs and `PROVENANCE.md` land in
   `projects/<slug>/assets/codex/`. Compare icons with the approved references and regenerate mismatches (IMG-2, IMG-3);
   check photos for text, logos, identifiable faces and, in gambling scenes, any hijab-wearing person (IMG-9).
   - The references (`approved-editorial-batch-01.png`, `approved-npc-characters-v04.png`) live in the private Kanz repo;
     `codex_assets.py` finds them through `KANZ_REPO` (default: the folder above kanz-motion). `make.py doctor` says
     whether they were found. Without them (editors' copies), skip Codex and use approved `library/objects/`
     and `library/scenes/` assets.
5. **Real people use real photos** (IMG-8). Never generate or repaint a real person. For a past event
   with no real photo of that moment, a generated photo-real image of its real PLACE or setting is allowed
   (Monte Carlo 1913, Gambler's Fallacy v7; quiz 2026-10-20, Q5); record it as generated in `CREDITS.md`.
   When using a real photo, source an openly
   licensed photo (Wikimedia Commons: CC0 / CC BY / CC BY-SA) OR a press photo of a real public moment (standing yes,
   2026-10-18). Record the source URL, licence or press credit and the moment depicted in
   `projects/<slug>/CREDITS.md`, the one credits file per project (photos, screenshots, data series; `engine/data.py`
   appends to it). Show it untouched as a slim print:
   `K.snap35(board, "assets/photos/person.jpg", { slim: true, flash: false })` (IMG-11).
6. **Approval.** Codex output stays in the project. A new object moves into `library/objects/` only after Ahmed approves
   it, with its status in `library/objects/manifest.json` (OBJ-2, OBJ-3). `python engine/objects.py projects/<slug>` lists
   the candidate objects a scene uses. Use several Codex jobs in parallel, and record what was generated in the backlog
   (Ahmed's copy).
