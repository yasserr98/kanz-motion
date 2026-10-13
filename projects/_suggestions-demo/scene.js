/* Suggestions demo (2026-10-13): built-but-unused components and one new idea, on fixed seconds, no voice.
 * Not an audience-facing video. Sections: punch (big type), stack, swap, walk, wipe + map.
 * Ahmed 2026-10-13 approved all of these as defaults (docs/PACE.md, Variety); the ground-plane prototype was rejected and removed. */
const tl = K.tl;
const OBJ = "../../library/objects/";
const USD = OBJ + "kanz-usd-banknote-v01.png", EGP = OBJ + "kanz-egp-banknote-v01.png";
const WHITE = "rgba(255,255,255,.55)";
K.look();
K.pace();

const B = {
  p: K.board("p", 0, 0), s: K.board("s", -1100, 0), w: K.board("w", -2200, 0),
  k: K.board("k", -2200, 1800), m: K.board("m", -1100, 1800), 
};
K.cam(0, "p");

// 1. big type in the middle of a video (K.punch, used in older videos, not in the pace rebuild)
K.img(B.p, OBJ + "kanz-company-trading-v01.png", { x: 780, y: 320, w: 420 });
K.img(B.p, OBJ + "kanz-company-office-v01.png", { x: 220, y: 290, w: 380 });
K.img(B.p, OBJ + "kanz-raw-material-sack-v01.png", { x: 210, y: 380, w: 230 });
K.tag(B.p, "شركة مصرية", { x: 790, y: 560, size: 44 });
K.tag(B.p, "بلد تانية", { x: 210, y: 560, size: 44 });
K.arrow(B.p, 330, 220, 660, 220, { at: 0.2, bend: 50, color: WHITE });
K.punch("أمريكا<br>مش طرف", 2.2, 4.6, { size: 170 });

// 2. numbers become things: stacks at true relative size (K.stack, never used in a delivered video)
K.cam(5.2, "s");
K.img(B.s, USD, { x: 290, y: 690, w: 260, at: 5.5, glow: 380, shadow: true });
K.tag(B.s, "دولار", { x: 290, y: 820, size: 44, at: 5.9 });
K.stack(B.s, EGP, { x: 700, y: 760, n: 6, w: 210, at: 6.3 });
K.stack(B.s, EGP, { x: 700, y: 760 - 6 * 55, n: 4, w: 210, at: 9.1, shadow: false });
K.tag(B.s, "جنيه", { x: 700, y: 840, size: 44, at: 6.8 });
K.text(B.s, "أكتر", { x: 470, y: 330, size: 90, head: true, color: K.LAV || "#d5adef", at: 9.6, from: "pop", sfx: "hit", gain: 0.3 });

// 3. objects and characters that act (K.swap, never used in a delivered video)
K.cam(11.3, "w");
const wallet = K.img(B.w, OBJ + "kanz-wallet-v01.png", { x: 680, y: 430, w: 460, at: 11.6, glow: true, enter: "fly" });
const man = K.img(B.w, OBJ + "kanz-npc-m01-neutral-v01.png", { x: 250, y: 470, w: 440, at: 11.8 });
K.swap(wallet, OBJ + "kanz-wallet-open-empty-v01.png", 13.6);
K.swap(man, OBJ + "kanz-npc-m01-shrug-v01.png", 14.1);
K.text(B.w, "فاضية", { x: 680, y: 760, size: 80, head: true, color: "#d5adef", at: 14.0 });

// 4. a character crosses the board (K.walk, never used in a delivered video)
K.cam(17.2, "k");
K.img(B.k, OBJ + "kanz-bank-v01.png", { x: 230, y: 400, w: 440, at: 17.4, glow: true });
K.text(B.k, "البنك", { x: 230, y: 700, size: 70, head: true, at: 18.2 });
K.walk(B.k, [OBJ + "kanz-npc-m01-walk-a-v01.png", OBJ + "kanz-npc-m01-walk-b-v01.png"],
  { from: [960, 470], to: [560, 470], at: 17.8, dur: 3.2, w: 400, rest: OBJ + "kanz-npc-m01-neutral-v01.png" });

// 5. chapter wipe + map with pins (K.wipe, K.pin: never used in a delivered video)
K.wipe(22.8);
K.cam(23.15, "m", { dur: 0.05, sfx: false });
K.img(B.m, OBJ + "kanz-map-usa-v01.png", { x: 560, y: 330, w: 760, at: 23.3, shadow: false });
K.pin(B.m, 830, 300, "واشنطن", { at: 24.6, side: "left" });
K.img(B.m, OBJ + "kanz-landmark-egypt-v01.png", { x: 210, y: 690, w: 300, at: 26.4, enter: "fly" });
K.arrow(B.m, 800, 360, 330, 620, { at: 26.7, bend: -120, color: "#d5adef", width: 9 });
K.pin(B.m, 210, 560, "القاهرة", { at: 27.6, side: "right" });

K.finish();
