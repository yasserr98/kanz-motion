/* Visual-defaults demo (2026-10-17): the five runtime defaults from the visual review of 7 shipped Reels, on fixed
 * seconds, no voice. Not an audience-facing video. Open index.html for the new defaults, index.html?old for the same
 * scene with them off (K.pace() without `defaults`, as finished projects call it). Section 5 is the one place the two
 * differ in scene code: the old runtime has no target form, so ?old uses hand-entered coordinates the way shipped
 * scenes did. Guide: docs/PACE.md, "Visual defaults (2026-10-17)". */
const tl = K.tl;
const OBJ = "../../library/objects/";
const OLD = /[?&]old\b/.test(location.search);
K.look();
K.pace(OLD ? {} : { defaults: "2026-10-17" });

const B = {
  low: K.board("low", 0, 0), chart: K.board("chart", -1100, 0), dim: K.board("dim", -2200, 0),
  fly: K.board("fly", -2200, 1800), marks: K.board("marks", -1100, 1800),
};
K.cam(0, "low");

// 1. caption band: an object and its label low on the board sit where the captions are (us-dollar-decisions-pace 57 s)
K.img(B.low, OBJ + "kanz-house-v01.png", { x: 520, y: 620, w: 440, at: 0.2 });
K.tag(B.low, "تحت الكابشن", { x: 520, y: 880, size: 46, lav: true, at: 0.6 });
K.text(B.low, "البيت", { x: 520, y: 150, size: 90, head: true, at: 0.3 });

// 2. arrive built: elements scheduled just after the camera lands are brought forward to g.lead; the chart opens drawn
const g2 = K.go(5.0, "chart", { scale: 1.15 });
K.text(B.chart, "عشر سنين", { x: 500, y: 110, size: 84, head: true, at: g2.arrive + 0.3 });
K.area(B.chart, { x: 500, y: 470, w: 760, h: 420, data: [100, 104, 101, 112, 118, 116, 131, 140], min: 96, max: 142,
  at: g2.arrive, dur: 1.6 });
K.img(B.chart, OBJ + "kanz-usd-banknote-v01.png", { x: 790, y: 760, w: 240, at: g2.arrive + 0.4 });

// 3. punch hides the caption; dim takes text to 0 (ghost text: short-biggest-betting-event 30 s, real-estate 46-50 s)
K.punch("الفكرة<br>الأساسية", 9.3, 11.8, { size: 170 });
const g3 = K.go(9.25, "dim");
const wallet = K.img(B.dim, OBJ + "kanz-wallet-open-cash-v01.png", { x: 300, y: 420, w: 380, at: g3.lead });
const label = K.tag(B.dim, "المحفظة مليانة", { x: 300, y: 680, size: 46, at: g3.lead });
K.dim([wallet, label], 12.1, 0.3);
K.img(B.dim, OBJ + "kanz-wallet-open-empty-v01.png", { x: 720, y: 420, w: 380, at: 12.2 });
K.tag(B.dim, "فضيت", { x: 720, y: 680, size: 46, lav: true, at: 12.4 });

// 4. fly: a 620 px hero in the lower half of the board (old: from 1.9x and 170 px below, across the captions)
const g4 = K.go(13.9, "fly");
K.text(B.fly, "الدهب", { x: 500, y: 120, size: 90, head: true, at: g4.lead });
K.img(B.fly, OBJ + "kanz-gold-bars-v01.png", { x: 500, y: 560, w: 620, at: g4.lead, enter: "fly" });

// 5. marks sized to their target, behind it, one arrowhead; the arrow names its target
const g5 = K.go(16.6, "marks");
const word = K.text(B.marks, "الكلمة دي", { x: 640, y: 230, size: 76, head: true, at: g5.lead });
const house = K.img(B.marks, OBJ + "kanz-house-for-sale-v01.png", { x: 300, y: 560, w: 300, at: g5.lead });
if (OLD) {
  K.oval(B.marks, 640, 230, 150, 52, { at: 17.2, width: 8 });
  K.arrow(B.marks, 640, 320, 360, 470, { at: 19.2, width: 8 });
} else {
  K.oval(B.marks, word, { at: 17.2, width: 8 });
  K.arrow(B.marks, word, house, { at: 19.2, width: 8 });
}

// 6-9. review-sample defaults Ahmed approved (2026-10-17). One digit system: Western digits with ٪ (K.DIGITS);
// source lines 28 px / labels 34 px; no snap zooms (old: the snap at 23.6 s zooms 1.3x)
const B2 = { nums: K.board("nums", 0, 1800), paper: K.board("paper", 0, 3600), crowd: K.board("crowd", -1100, 3600) };
const g6 = K.go(21.6, "nums");
K.tag(B2.nums, "الفايدة 35%", { x: 760, y: 120, size: 46, lav: true, at: g6.lead });
K.count(B2.nums, { x: 300, y: 130, to: 65, suffix: "%", size: 120, at: g6.lead });
K.area(B2.nums, { x: 500, y: 520, w: 760, h: 380, data: [4, 5, 4.5, 6, 7, 6.5, 8, 10], min: 3, max: 10.5, at: g6.lead,
  source: "FRED · FEDFUNDS · ١٧/١٠/٢٠٢٦" });
K.snap(23.6, 1.3, 0.6);

// paper world: objects and figures keep their contrast
const g7 = K.go(25.0, "paper");
K.world(g7.start, "paper");
K.img(B2.paper, OBJ + "kanz-house-v01.png", { x: 300, y: 420, w: 380, at: g7.lead });
K.img(B2.paper, OBJ + "kanz-npc-m01-neutral-v01.png", { x: 720, y: 440, w: 380, at: g7.lead });
K.text(B2.paper, "عالم الورق", { x: 500, y: 110, size: 84, head: true, at: g7.lead });

// lint only: five labels on one board and a label that repeats the caption (crowded-board, caption-repeat)
const g8 = K.go(28.6, "crowd");
K.world(g8.start, "charcoal");
K.img(B2.crowd, OBJ + "kanz-wallet-v01.png", { x: 500, y: 420, w: 360, at: g8.lead });
[["خمس حاجات", 500, 120], ["محفظة", 230, 300], ["كارت", 780, 300], ["فلوس", 230, 600], ["فاتورة", 780, 600]].forEach(([h, x, y]) =>
  K.tag(B2.crowd, h, { x, y, size: 44, at: g8.lead }));

K.duration = 31.5;
K.finish();
