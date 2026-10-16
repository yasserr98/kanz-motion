/* short-biggest-betting-event (short D, 2026-10-16): cut from the Kanz long video "الكازينو بيكسب في الآخر"
 * (04:26.82-04:57.73; v5 ends on the punch, Ahmed: "leave it as أكبر حدث مراهنات في تاريخ الكورة كله"), Ahmed Shaaban's own voice and face, on the footage layer (runtime/kanz-footage.js).
 * Ahmed: "this is amazing use it too". Same rules as short B: first 3 s his face, alternate face and motion, keep the
 * source's burned-in text, end on the last word. The motion windows cover the source's own TV inserts and glitch
 * transitions (t 12.0-19.2 and 25.95-29.4), so no face window shows them.
 * Figures: projections, sourced on screen (script.md has the links). "ميسي لوحده" vs the source's "the final": flagged.
 */
const { N, T } = K;
const tl = K.tl;
const OBJ = "../../library/objects/";
const L = "#d5adef";
const SRC = "rgba(255,255,255,.62)";
// Visual types (AGENTS.md, Ahmed 2026-10-16): full-screen photo for a place (Codex `free`), disposable print for a
// real person or moment (licensed Commons photo, untouched, no date stamp), Kanz icon for a concept on the charcoal board.
// Real people are never generated. Photos + licences: shorts/casino-wins-in-the-end/photos/SOURCES.md
const ICON = "assets/codex/kanz/", PHOTO = "assets/codex/free/";
const PH = "../../shorts/casino-wins-in-the-end/photos/";
const MESSI_A = window.MESSI_A, MESSI_B = window.MESSI_B; // variant.js
const print = (board, ph, o) => K.snap35(board, PH + ph.file, { pos: ph.pos, ...o }); // no on-screen credit: CREDITS.md

K.look();
K.pace();

// ---------- face / motion rhythm ----------
const c1 = T("لبراند") - 0.04;             // 3.3  face -> brand board
const f2 = T("ارتفعت") - 0.05;             // 7.35 -> face: "ارتفعت عدد المراهنات ... روسيا في 2018"
const c2 = T("بأكثر") - 0.29;              // 11.95, before the source's chart insert -> numbers board
const f3 = T("ميسي", c2) - 0.05;           // 19.75 -> face: "ميسي لوحده جذب ما يقارب"
const c3 = T("اتنين") - 0.04;              // 21.7 -> 2.5 billion
const f4 = T("بالمناسبة") - 0.04;          // 23.64 -> face: "بالمناسبة ده مكنش طول البطولة كان في ماتش"
const c4 = T("واحد،") - 0.04;              // 25.76, before the source's stadium insert -> one match board
const END = 30.91;                         // the voice ends on "كله" (Ahmed 2026-10-16); no face at the end
const HOLD = END + 0.15;                   // no empty hold after "كله" (Ahmed 2026-10-16: trim the empty half second)
K.footage({ dir: "assets/face", n: 743, end: END, faceY: 1500, xstyle: "cut", // Ahmed 2026-10-16: the clean cut
  windows: [[0, c1], [f2, c2, 1.08], [f3, c3, 1.14], [f4, c4]] });
K.captionsFrom = 0;

const B = {
  brand: K.board("brand", 0, 0), numbers: K.board("numbers", -1100, 0),
  final: K.board("final", -2200, 0), one: K.board("one", -2200, 1800),
};

// ---------- 1. the real test of Messi's brand in American betting (3.3-7.35) ----------
// the person as a print on charcoal; America arrives as the place, full screen, behind the print
const tUS = T("أمريكا");
K.cam(0, "brand", { scale: 1.0 });
// boards build ~0.3 s before their cut, under the face, so the dissolve lands on a finished board (2026-10-16)
const PRE = 0.3;
K.glow(B.brand, 500, 560, 820, { at: c1 - PRE, out: tUS - 0.3 });
K.text(B.brand, "براند ميسي", { x: 500, y: 140, size: 104, head: true, color: L, at: c1 - PRE });
const shot = print(B.brand, MESSI_A, { x: 500, y: 530, w: 440, h: 470, rot: -4, at: c1 - 0.35, flash: false }); // no white flash on the cut
tl.to(shot, { y: -20, scale: 0.74, rotation: -7, duration: 0.5, ease: "power2.inOut" }, tUS - 0.35); // clear of the captions
K.screen(PHOTO + "us-sportsbook.png", tUS - 0.3, f2);
K.tag(B.brand, "في أمريكا", { x: 500, y: 290, size: 54, lav: true, at: tUS });
K.tag(B.brand, "الواجهة", { x: 770, y: 420, size: 52, lav: true, at: T("كواجهة"), rot: 5 });

// ---------- 2. +65% vs 2018, about $35B (11.95-19.75) ----------
K.cam(c2 - 0.3, "numbers", { dur: 0.04, sfx: false, scale: 1.35, dy: 90 }); // opens close on the bars
K.frame(T("35") - 0.25, "numbers"); // pulls out as the total arrives
const S = K.scale(35, 430); // billions; 2018 drawn to scale from the voice's +65% (35 / 1.65), unlabeled
const y0 = 740;
const b18 = K.bar(B.numbers, { x: 700, y: y0, w: 280, value: 35 / 1.65, scale: S, at: c2 - 0.8, color: "#8d8794" });
const b22 = K.bar(B.numbers, { x: 320, y: y0, w: 280, value: 35, scale: S, at: c2 + 0.1, color: L });
K.text(B.numbers, "روسيا 2018", { x: 700, y: y0 + 50, size: 44, at: c2 - 0.8 });
K.text(B.numbers, "قطر 2022", { x: 320, y: y0 + 50, size: 44, at: c2 + 0.1 });
K.delta(B.numbers, b22, b18, { x: 520, label: "<bdi class='num'>+65%</bdi>", labelDx: 0, size: 48, at: T("65") + 0.1 });
K.count(B.numbers, { x: 500, y: 150, to: 35, suffix: " مليار دولار", size: 92, at: T("35"), dur: 0.9, digits: "en" });
K.text(B.numbers, "تقديرات قبل البطولة: Barclays / H2 Gambling Capital · Bloomberg، نوفمبر 2022",
  { x: 500, y: 240, size: 24, color: SRC, w: 820, at: T("35") });
K.tag(B.numbers, "حجم المراهنات", { x: 700, y: 610, size: 44, lav: true, at: T("وحجم") });

// ---------- 3. ~$2.5B (21.7-23.64): the amount, icons on charcoal ----------
K.cam(c3 - 0.3, "final", { dur: 0.04, sfx: false, scale: 1.08 });
K.glow(B.final, 500, 560, 760, { at: c3 - PRE });
K.pile(B.final, OBJ + "kanz-cash-v01.png", { x: 470, y: 700, w: 200, n: 10, at: c3 - 0.4, stagger: 0.05 });
K.img(B.final, ICON + "betting-slip.png", { x: 800, y: 580, w: 320, shadow: false, at: c3 - 0.25, enter: "fly", fromX: 80, rot: 8 });
K.count(B.final, { x: 500, y: 260, from: 0, to: 2.5, decimals: 1, suffix: " مليار دولار", size: 112, at: T("فاصل") - 0.3, dur: 0.9, digits: "en" });
K.text(B.final, "توقعات Macquarie / H2 للمراهنات على النهائي · casino.org، نوفمبر 2022",
  { x: 500, y: 360, size: 24, color: SRC, w: 820, at: T("مليار", c3) });

// ---------- 4. one match, the final (25.76-30.9): the stadium full screen, the real moment as a print, the punch ----------
K.cam(c4 - 0.3, "one", { dur: 0.04, sfx: false, scale: 1.0 });
K.screen(PHOTO + "stadium-final.png", c4 - 0.3, HOLD + 1, { sfx: false });
K.text(B.one, "ماتش واحد", { x: 500, y: 150, size: 104, head: true, at: c4 - 0.25 });
K.tag(B.one, "النهائي", { x: 500, y: 300, size: 58, lav: true, at: T("نهائي", c4) });
print(B.one, MESSI_B, { x: 520, y: 570, w: 580, h: 370, rot: 4, at: T("ميسي", c4) - 0.05 });
K.punch("أكبر حدث مراهنات<br>في تاريخ <span class='kw'>الكورة</span> كله", T("أكبر") - 0.05, HOLD + 1, { size: 104, riser: true });

K.duration = HOLD;
K.finish();
