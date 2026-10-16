/* short-house-always-wins (short B, 2026-10-16): cut from the Kanz long video "الكازينو بيكسب في الآخر"
 * (01:14.76-01:47.10), Ahmed Shaaban's own voice and face. First short on the footage layer (runtime/kanz-footage.js).
 * Ahmed's brief: alternate between his face and the motion; the first 3 s always show his face; keep the source's
 * burned-in labels ("حجم الرهان" looks cool); trim the last second (ends before "13 يونيو 2018").
 * Face windows carry the lines he delivers to camera; the motion boards explain the three words: the house, the handle
 * (حجم الرهان) and the commission, then why the house only needs people to come in.
 */
const { N, T } = K;
const tl = K.tl;
const OBJ = "../../library/objects/";
const L = "#d5adef";
// Visual types (AGENTS.md, Ahmed 2026-10-16): full-screen photo for a place (Codex `free`), disposable print for a
// real person or moment, Kanz icon (Codex `kanz` / library) for a concept or mechanism on the charcoal board.
const ICON = "assets/codex/kanz/", PHOTO = "assets/codex/free/";

K.look();
K.pace();

// ---------- face / motion rhythm (cuts sit in the pauses before a word) ----------
const c1 = T("دي") - 0.04;                 // 3.0  face (hook) -> house board
const f2 = T("الشركة") - 0.05;             // 5.2  -> face: "الشركة دي اللي بتستقبل حجم الرهان" (source label appears)
const c2a = T("حجم", f2 + 0.6) - 0.04;     // 7.1  -> money board, word 2: "حجم الرهان ده كل الفلوس اللي الناس حطتها"
const c2 = T("والعمولة") - 0.04;           // 9.4  word 3 on the same board
const f3 = T("فعموما") - 0.04;             // 15.0 -> face: "سواء كسبت أو خسرت البيت كده كده كسبان"
const c3 = T("كل", f3) - 0.04;             // 17.9 -> bettors board
const f4 = T("المهم") - 0.04;              // 24.0 -> face: "المهم إن المحل يكون فيه رجل الزبون"
const c4 = T("فبالتالي") - 0.04;           // 27.1 -> full-shop board
const f5 = T("وإن", c4) - 0.04;            // 31.0 -> face to the end: "وإن الزبون تيجي رجليه"
const END = 32.34;                         // the voice file: ends before "13 يونيو"
K.footage({ dir: "assets/face", n: 777, end: END, faceY: 1500, // zoom about the source label so it stays whole
  windows: [[0, c1], [f2, c2a], [f3, c3], [f4, c4, 1.1], [f5, END + 1, 1.05]] }); // no jump zoom at 16 s (Ahmed 2026-10-16)
K.captionsFrom = 0;

const B = {
  house: K.board("house", 0, 0), money: K.board("money", -1100, 0),
  bettors: K.board("bettors", -2200, 0), full: K.board("full", -2200, 1800),
};

// ---------- 1. البيت = شركة المراهنات (3.0-5.2): the concept as an icon, then the place itself ----------
const tCo = T("لشركة");
K.cam(0, "house", { scale: 1.12 });
K.glow(B.house, 500, 470, 820, { at: c1, out: tCo });
const house = K.img(B.house, OBJ + "kanz-house-v01.png", { x: 500, y: 470, w: 520, float: true, shadow: false });
K.settle(house, c1, { fromScale: 1.45, fromY: 70, dur: 0.9 });
// the three words he promises in the hook, each with its own titled beat (Ahmed 2026-10-16: "he only explains one")
const EY = "rgba(255,255,255,.78)";
const word = (board, n, at, out) => K.text(board, n, { x: 500, y: 50, size: 44, color: EY, at, out });
word(B.house, "الكلمة الأولى", c1);
K.text(B.house, "البيت", { x: 500, y: 130, size: 92, head: true, color: L, at: c1, out: tCo - 0.05 });
tl.to(house, { autoAlpha: 0, duration: 0.1 }, tCo - 0.05);
K.screen(PHOTO + "casino-exterior.png", tCo - 0.05, f2);
K.text(B.house, "<span style='color:#d5adef'>البيت</span> = شركة المراهنات", { x: 500, y: 130, size: 74, head: true, at: tCo });

// ---------- 2. حجم الرهان (7.1-9.4), then العمولة on every transaction (9.4-15.0): icons on charcoal ----------
K.cam(c2a - 0.3, "money", { dur: 0.04, sfx: false, scale: 1.08 });
K.frame(T("بياخدها") - 0.2, "money", { scale: 1.12 });
word(B.money, "الكلمة التانية", c2a, c2 - 0.05);
K.text(B.money, "حجم الرهان", { x: 500, y: 130, size: 88, head: true, color: L, at: c2a, out: c2 - 0.05 });
const cash = K.pile(B.money, OBJ + "kanz-cash-v01.png", { x: 500, y: 640, w: 215, n: 6, at: c2a, stagger: 0.22 });
tl.to(cash, { x: "-=200", duration: 0.5, ease: "power2.inOut" }, c2 - 0.1); // makes room for the house
K.text(B.money, "حجم الرهان", { x: 300, y: 260, size: 54, head: true, at: c2 + 0.3 });
word(B.money, "الكلمة التالتة", c2, T("ترانزاكشن") - 0.05);
K.text(B.money, "العمولة", { x: 500, y: 130, size: 88, head: true, color: L, at: c2, out: T("ترانزاكشن") - 0.05 });
K.glow(B.money, 760, 480, 560, { at: c2 });
K.img(B.money, ICON + "casino-exterior.png", { x: 760, y: 470, w: 290, shadow: false, at: c2, enter: "fly" });
K.text(B.money, "البيت", { x: 760, y: 255, size: 54, head: true, at: c2 + 0.2 });
// the commission: one bundle leaves the pile for the house, again on the second "transaction"
const fee = (t) => {
  const b = K.img(B.money, OBJ + "kanz-cash-v01.png", { x: 300, y: 560, w: 150, shadow: false });
  tl.set(b, { autoAlpha: 0 }, 0);
  tl.set(b, { autoAlpha: 1 }, t);
  tl.to(b, { x: 460, y: -60, scale: 0.6, rotation: -12, duration: 0.7, ease: "power2.inOut" }, t);
  tl.to(b, { autoAlpha: 0, duration: 0.15 }, t + 0.62);
  K.sfx(t, "whoosh", 0.25); K.sfx(t + 0.65, "coin", 0.35);
};
fee(T("بياخدها"));
// the phone sits under the house, clear of the cash pile and the captions (Ahmed 2026-10-16: "bad overlap")
K.img(B.money, ICON + "betting-app-phone.png", { x: 775, y: 745, w: 185, at: T("عملية"), enter: "fly", fromY: 120 });
fee(T("ترانزاكشن") - 0.1);
// no snap zoom on "ترانزاكشن" (Ahmed 2026-10-16: a glitch at 14 s)
K.text(B.money, "كل عملية = عمولة", { x: 500, y: 130, size: 64, head: true, color: L, at: T("ترانزاكشن") });

// ---------- 3. people who bet, on whom does not matter (17.9-24.0): the setting, full screen ----------
K.cam(c3 - 0.3, "bettors", { dur: 0.04, sfx: false, scale: 1.0 });
const tPeople = T("ناس", c3);
K.screen(PHOTO + "slot-machines.png", c3 - 0.3, tPeople - 0.05, { sfx: false });
K.screen(PHOTO + "betting-app-phone.png", tPeople - 0.05, f4);
// no headline on "كل اللي محتاجه" (Ahmed 2026-10-16): the photo carries it
K.text(B.bettors, "ناس بتراهن", { x: 500, y: 150, size: 84, head: true, at: tPeople, out: T("بتراهن", T("وخلاص")) - 0.1 });
const tWho = T("بتراهن", T("وخلاص"));
K.text(B.bettors, "على مين؟", { x: 500, y: 150, size: 100, head: true, color: L, at: tWho });
K.strike(B.bettors, 730, 150, 270, 165, { at: T("مهم"), color: "#fff" });
K.tag(B.bettors, "مش مهم", { x: 500, y: 300, size: 54, at: T("مهم") + 0.15 });

// ---------- 4. the goal: a full shop (27.1-31.0): icons for the idea, then the full floor for "مليان" ----------
const tFull = T("مليان");
K.cam(c4 - 0.3, "full", { dur: 0.04, sfx: false, scale: 1.05 });
K.glow(B.full, 500, 470, 760, { at: c4, out: tFull - 0.1 });
const shop = K.img(B.full, ICON + "casino-exterior.png", { x: 500, y: 450, w: 540, shadow: false, at: c4, enter: "fly" });
K.text(B.full, "هدف البيت", { x: 500, y: 120, size: 84, head: true, at: T("هدف") });
const w1 = K.walk(B.full, [OBJ + "kanz-npc-m01-walk-a-v01.png", OBJ + "kanz-npc-m01-walk-b-v01.png"],
  { from: [40, 660], to: [300, 660], at: c4 + 0.1, dur: 2.2, w: 500, appear: c4 });
// a gambler already at the door; never a hijabi woman in gambling content (Ahmed 2026-10-16)
const w2 = K.img(B.full, OBJ + "kanz-npc-g01-neutral-v01.png", { x: 760, y: 680, w: 480, shadow: false, at: c4 + 0.4, enter: "fly" });
tl.to([shop, w1, w2], { autoAlpha: 0, duration: 0.1 }, tFull - 0.1);
K.screen(PHOTO + "casino-floor-crowd.png", tFull - 0.1, f5);
K.tag(B.full, "المحل مليان", { x: 500, y: 250, size: 60, lav: true, at: tFull });

K.duration = END;
K.finish();
