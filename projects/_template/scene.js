/* Scene template. Boards are areas of one continuous world; the camera moves between them.
 * Anchor every entrance to a word in the voice: N("word") in script order, or T("word", afterSeconds).
 * Defaults for new videos (Ahmed, 2026-10-11; docs/LOOK-V2.md section 9): complete first frame, fill the frame,
 * charts with weight, bars to scale, paper world for chapter turns, takeaway ending.
 * Pace (Ahmed 2026-10-13, docs/PACE.md): boards arrive built (K.go + at: g.lead), camera drift, one hero carried
 * between boards, 24 fps motion, room-tone bed; script-route voices are retimed (make.py retime) before the scene.
 * Variety (Ahmed 2026-10-13, docs/PACE.md): one K.punch({riser: true}) on the key sentence, K.stack/K.pile for amounts,
 * K.swap for state changes, map/globe + K.pin for places, real series via engine/data.py with `source`. No ground plane.
 * Worked example: projects/us-dollar-decisions-pace/ (also _sample-real-estate-v3/, _paper-demo/, _chart-demo/). */
const { N, T, num } = K;
const tl = K.tl;
const OBJ = "../../library/objects/";
K.look(); // look v2 (docs/LOOK-V2.md): safe zones, light, contact shadows. Call before the first K.cam()
K.pace(); // pace (docs/PACE.md): smooth camera, 24 fps motion, mix 2, room tone, drift between moves (K.finish)
// snake layout: neighbours 1,100 px apart in a row, rows 1,800 apart (closer rows show under the captions)
const hook = K.board("hook", 0, 0), b2 = K.board("two", -1100, 0);
K.cam(0, "hook");

// ---------- hook: complete from frame 1 (no `at` on the hero or the headline parts) ----------
// Simple hook (Ahmed 2026-10-11): the headline + ONE hero object, nothing else. Pace: the hero settles from oversized,
// and the caption waits until the question is over (the headline already says it).
const g2 = K.go(T("الكلمة"), "two", { scale: 1.3, dx: 220, dy: -60 }); // first word of the next chapter; start close
K.headline([{ html: "عنوان" }, { html: "السؤال؟", kw: true }], { out: g2.start });
K.captionsFrom = g2.start;
K.glow(hook, 500, 500, 840, { out: g2.start });
const hero = K.img(hook, OBJ + "kanz-house-v01.png", { x: 500, y: 500, w: 580, float: true, shadow: false }); // 500-600 px
K.settle(hero, 0, { fromScale: 1.45, fromY: 70, dur: 1.2 });

// ---------- next chapter: arrives built, starts close, pulls out as the next idea arrives ----------
// K.carry(hero, "two", g2.start, { x: 500, y: 760, w: 260, opacity: 0.3 }); // carry the hero when it returns later
K.img(b2, OBJ + "kanz-house-v01.png", { x: 760, y: 330, w: 420, at: g2.lead, enter: "fly" });
// K.frame(N("التالية") - 0.25, "two");                 // pull out to the whole board on the second idea
// K.snap(N("مهم"), 1.25, 0.6);                         // snap zoom on an emphasis word (a few per video)
// K.world(g2.start, "paper");  // paper world for chapter turns; K.world(t, "charcoal") to return
// K.area(b2, { x: 500, y: 470, w: 760, h: 420, data: [100, 104, 103, 110, 120], min: 96, max: 121, at: g2.lead, dur: 1.2 });
// const S = K.scale(1200000, 390); // one scale per comparison; bars share the zero baseline y
// const a = K.bar(b2, { x: 560, y: 720, w: 190, value: 1100000, scale: S, at: g2.lead });

// ---------- visual types (AGENTS.md, "Images and icons: always ask Codex"; shots.json -> engine/codex_assets.py) ----------
// PLACE -> full-screen photo on a board of its own that holds only text/tags (board icons would sit on the photo):
// const gPlace = K.go(T("الكازينو"), "place");
// K.screen("assets/codex/free/casino-exterior.png", gPlace.start, T("التالية"));
// K.text(K.boards.place.el, "عنوان", { x: 500, y: 130, size: 80, head: true, at: gPlace.lead });
// REAL PERSON or MOMENT -> disposable print of a licensed photo (never generated); credit goes to CREDITS.md, not the frame.
// Keep it in the board's upper two thirds so it clears the captions; tags on it sit on top:
// K.snap35(b2, "assets/photos/person.jpg", { x: 500, y: 560, w: 520, h: 640, rot: -4, at: g2.lead, flash: false });
// CONCEPT, MECHANISM or NUMBER -> Kanz icon on charcoal (Codex `kanz` or library/objects), as above.

// ---------- ending: cut back to the hook on the last word, the thesis big, ~1.3 s after the voice ----------
const tLast = (window.TOKENS || []).slice(-1)[0]?.end || 4;
K.cam(tLast - 0.15, "hook", { dur: 0.04, sfx: false });
K.glow(hook, 500, 500, 760, { at: tLast - 0.15 });
K.settle(hero, tLast - 0.15, { fromScale: 1.4, fromY: 60, dur: 0.9 }); // the hook hero lands again on the cut
// if the hero was carried away (K.carry), bring a copy instead: K.img(hook, src, { ..., at: tLast - 0.19, enter: "fly" })
K.takeaway(hook, "الفكرة <span class='kw'>الأساسية</span>", { x: 500, y: 90, size: 96, at: tLast - 0.05, glow: false }); // words the voice said
K.duration = tLast + 1.3;
K.finish(); // last line: adds the camera drift between moves
