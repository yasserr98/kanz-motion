/* 3D demo: worked example for runtime/kanz-3d.js, on fixed seconds, no voice. Not an audience-facing video.
 * 2026-10-13 review: Ahmed kept the card flip, tilted screenshot and paper fold ("everything else is great",
 * 2026-10-14) and rejected the coin toss, isometric bars and depth camera (no longer in this scene). */
const OBJ = "../../library/objects/";
K.look();
K.pace();
const B = { f: K.board("f", 0, 0), s: K.board("s", -1100, 0), p: K.board("p", -2200, 0) };
K.cam(0, "f");

// 1. card flip on a word: myth -> fact
K.flip(B.f, { label: "خرافة", text: "الفلوس في البيت<br>أأمن" }, { label: "حقيقة", text: "التضخم<br>بياكلها" },
  { x: 500, y: 450, w: 640, h: 560, at: 0.2, flip: 2.3 });

// 2. genuine screenshot (tradingview.com, captured 2026-09-28) rising into a slow 3D sway, oval on the page
K.cam(5.5, "s");
const win = K.browser(B.s, "assets/tradingview.png", { x: 500, y: 450, w: 900, at: 6.1, url: "tradingview.com",
  source: "tradingview.com · 2026-09-28" });
K.pageOval(win, 720, 176, 640, 92, { at: 7.6 });

// 3. folded note with a torn edge opens toward the camera
K.cam(11.0, "p");
K.fold(B.p, { x: 500, y: 440, w: 620, h: 660, at: 11.3, open: 12.4,
  cover: { text: "افتح الورقة" }, top: { label: "اللي بيكسب في السوق", text: "هو اللي" }, bottom: { text: "بيستنى" } });
K.underline(B.p, 680, 320, 820, { at: 13.8, color: "#d5adef", width: 10 });

K.finish();
