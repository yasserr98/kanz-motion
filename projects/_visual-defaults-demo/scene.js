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

K.duration = 21;
K.finish();
