/* _guards-demo (2026-10-18): engine demo for the review hardening (docs/RULES.md SHORT-4, -10, -12..16, SND-5, NUM-3).
 * A synthetic workshop short (drawn head, noise "voice"; make_demo.py builds them): face 0-3 s with the title, split
 * 3-6.5 s, full board 6.5-9.5 s, split again to the end. The clean version passes lint; `make_demo.py --bad`
 * (window.GUARDS_BAD) breaks each guarded rule once: title on his face, a split cut inside a word, a frozen stream in
 * a split window, a stray $, a subheadline with no breathing room, two stacked effects and one on nothing, and a scene
 * that ends before the voice. Expected findings: README.md. */
const { T } = K;
const OBJ = "../../library/objects/";
const BAD = !!window.GUARDS_BAD;
K.look();
K.pace({ defaults: "2026-10-18" });
const a = K.board("a", 0, 0);
K.cam(0, "a");

const PRE = 0.3;
const s1 = BAD ? 3.3 : 3.0, s2 = 6.5, s3 = 9.5;     // --bad: the split starts inside "المهم" (3.10-3.48)
K.footage({ dir: "assets/face", n: 286, windows: [[0, s1]] });
K.split({ dir: "assets/half", n: 286, windows: [[s1, s2], [s3, 11.9]] });
K.title(BAD ? "حجم الرهان مش هو المهم" : "حجم الرهان مش هو المهم", BAD ? { y: 560 } : {}); // --bad: on his eyes

// ---------- split 1: who takes the commission ----------
const head = K.text(a, "العمولة لمين؟", { x: 500, y: 300, size: 72, head: true, w: 820, at: s1 - PRE, out: s2 - 0.4 });
const sub = BAD
  ? K.text(a, "على كل رهان", { x: 500, y: 395, size: 40, at: s1 - PRE, out: s2 - 0.4 })   // --bad: ~15 px under the headline
  : K.under(head, "على كل رهان", { at: s1 - PRE, out: s2 - 0.4 });
K.img(a, OBJ + "kanz-coins-v01.png", { x: 500, y: 540, w: 300, at: s1 - PRE, out: s2 - 0.4 });
K.text(a, BAD ? "الرهان 39.8$" : "الرهان " + K.money(39.8), { x: 500, y: 720, size: 44, at: T("مين"), out: s2 - 0.4 });

// ---------- full board: the bank always wins ----------
K.img(a, OBJ + "kanz-bank-v01.png", { x: 500, y: 430, w: 540, at: s2 - 0.1, out: s3 - 0.4 });
K.tag(a, "دايما", { x: 500, y: 830, at: T("بيكسب"), out: s3 - 0.4, lav: true });
K.text(a, "مهما كانت النتيجة", { x: 500, y: 150, size: 48, at: T("مهما"), out: s3 - 0.4 });
if (BAD) { K.sfx(7.0, "pop", 0.3); K.sfx(7.1, "click", 0.3); K.sfx(8.8, "hit", 0.3); } // stacked, and on nothing

// ---------- split 2: what makes the difference ----------
K.img(a, OBJ + "kanz-calculator-v01.png", { x: 500, y: 560, w: 360, at: s3 - 0.1 });
K.text(a, "الفرق الحقيقي", { x: 500, y: 300, size: 64, head: true, at: T("بيفرق") });

if (BAD) K.duration = 11.55;   // --bad: ends 0.4 s before the voice does
K.finish();
