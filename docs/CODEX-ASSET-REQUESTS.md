# Codex asset requests for look v2 (2026-10-10)

Ahmed approved this direction on 2026-10-10: characters that react and objects that can move, so scenes
act instead of just appearing. **These are requests, not approved assets.** Each file is made in Codex
and reviewed by Ahmed before it goes into `library/objects/`.

## Rules for Codex (unchanged Kanz rules)

- Open and look at the approved references first: the existing `library/objects/kanz-npc-*.png`
  (same character, same face, same clothes) and the Kanz approved icon library (Kanz repo
  `brand/explainer-icons/README.md` and its reference images). Match line weight, shading, grain,
  perspective and the single lavender accent exactly. Never invent a topic-specific style.
- Transparent PNG, the subject only, no ground shadow (the engine adds a contact shadow), no text.
- Same scale and framing as the existing pose of that character, so poses can swap in place.
- Name: `kanz-<subject>-<pose-or-part>-v01.png`. Compare each result with the references before
  delivery and redo any mismatch.

## 1. Character poses (same characters, new actions)

Each character has one to three poses today. Priority order:

| Character | New poses |
| --- | --- |
| M01 (main man, lavender shirt) | pointing to the side, shrugging, celebrating (arms up), regret (hand on forehead), thinking (hand on chin), counting money, walking (2 frames) |
| F01 (woman) | pointing to the side, thinking, celebrating, worried, holding a phone, walking (2 frames) |
| M02 | pointing, shrugging, worried, celebrating |

Two-frame walks and the pointing poses matter most: they let a character cross a board and direct the eye.

## 2. Objects split into parts (like the balance scale)

The balance scale (`base` / `beam` / `pan`) shows the pattern: separate layers, aligned on one canvas
size, so the engine can rotate or move one part.

| Object | Parts | What it does in a scene |
| --- | --- | --- |
| Wallet | closed, open (or body + flap) | opens to show it is empty or full |
| Safe | body, door | door swings open |
| Savings jar | jar (glass), lid, contents at 3 fill levels | fills up over time |
| Money bag | bag, tie | coins spill out |
| House | house, "for sale" sign | sign appears or swaps |
| Hourglass | frame, top sand, bottom sand | time running out |
| Calculator | body, screen (blank) | engine types live digits on the screen |
| Price tag | tag, string | swings, flips |

## 3. Recurring token objects

Per the Vox findings, one object stands for the core concept all through a video. Request the token
when a topic needs one that the library lacks (for example a share certificate for stock videos).
