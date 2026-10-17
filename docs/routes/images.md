# The image pass: photos and icons through Codex

Every video, voice note, script or short, gets an image pass before the scene is written (IMG-1). Do not settle for
whatever `library/objects/` already has. Rules: [RULES.md](../RULES.md) IMG and OBJ.

1. **Shot list from the whole script.** For every line that names a thing, place, person or setting (a casino, a stadium,
   Messi, a betting app), decide what the viewer should see. Write `projects/<slug>/shots.json` (format in
   `engine/codex_assets.py`): the video's context in two or three sentences, and per shot the line it illustrates, a
   concrete subject, the one lavender detail and a library reference.
2. **Pick the visual type per shot** (IMG-4):

   | Type | Use it for | How | Rules |
   | --- | --- | --- | --- |
   | **Full-screen photo** | a *place or setting* the line puts us in: a casino, a sportsbook, a stadium, a market floor | Codex mode `free` (generic places), or a licensed real photo when the line names a specific real place | fills the whole frame, darkened top and bottom so the headline and captions read; one per board; only text, tags and strikes over it, never icons; holds 1.5 s or more; never presented as a specific real event |
   | **Disposable print** | a *real person or real moment*: Messi, the 2022 final, a CEO, a news event | `K.snap35()` on an untouched licensed real photo | no date stamp, no credit line on screen (IMG-6); purple tags and text on top of it, never behind; clear of the headline and the captions; for a big moment pick the photo that shows the moment (the trophy ceremony, not players on the pitch); never generated, never repainted |
   | **Kanz icon** | a *concept, mechanism, object or number*: money, commission, a transaction, the house as a metaphor, charts | Codex mode `kanz` (approved icon style, transparent cutout) or an approved `library/objects/` file | lives on the charcoal board, where it can move (piles, swaps, flights); charts and numbers always on charcoal |

   Rhythm in a short: face -> place photo -> icon mechanism -> face. In a voice-note or script Reel: hook (HOOK-1 still
   holds) -> place photo -> icon mechanism -> print for a real person -> back to charcoal (IMG-5). The template loads
   `runtime/kanz-snap.js`. Because the world stays visible over a photo, a place photo gets a board of its own that holds
   only text and tags (`K.go` to it, `K.screen` from `g.start`); never drop a photo behind a board that already has icons.
   Keep a print in its board's upper two thirds (centre y ≤ ~600 at the board's zoom), and keep other board text off it.
3. **Headline lift.** `K.screen` darkens the headline and caption bands as much as each photo needs, and board text gets a
   soft dark halo while a photo fills the screen. Verify on the rendered frame:
   `python engine/contrast.py projects/<slug> <times of every photo moment>`; every line must reach 4.5:1 against the
   brightest background pixels behind it; raise `dark:` or move the text if one fails (IMG-7).
4. **Generate without asking first.** `python engine/codex_assets.py projects/<slug>/shots.json --jobs 4`, each shot's
   `modes` set to its type (`free` for places, `kanz` for icons). Outputs and `PROVENANCE.md` land in
   `projects/<slug>/assets/codex/`. Compare icons with the approved references and regenerate mismatches (IMG-2, IMG-3);
   check photos for text, logos, identifiable faces and, in gambling scenes, any hijab-wearing person (IMG-9).
   - The references (`approved-editorial-batch-01.png`, `approved-npc-characters-v04.png`) live in the private Kanz repo;
     `codex_assets.py` finds them through `KANZ_REPO` (default: the folder above kanz-motion). `make.py doctor` says
     whether they were found. Without them (editors' copies), skip Codex and use approved `library/objects/` only.
5. **Real people and real events use real photos** (IMG-8). Never generate a real person. Source an openly licensed photo
   (Wikimedia Commons: CC0 / CC BY / CC BY-SA) and record its source URL, licence and credit line in
   `projects/<slug>/CREDITS.md`, the one credits file per project (photos, screenshots, data series; `engine/data.py`
   appends to it). Show it as a disposable print (`K.snap35`, untouched); `K.photo()`'s CSS grade is the Kanz-look
   fallback. The OpenAI image tool refuses to edit public figures. Keep CC BY-SA edits under CC BY-SA.
6. **Approval.** Codex output stays in the project. A new object moves into `library/objects/` only after Ahmed approves
   it, with its status in `library/objects/manifest.json` (OBJ-2, OBJ-3). `python engine/objects.py projects/<slug>` lists
   the candidate objects a scene uses. Use several Codex jobs in parallel, and record what was generated in the backlog
   (Ahmed's copy).
