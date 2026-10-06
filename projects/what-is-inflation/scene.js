/* What is inflation (Ahmed's voice note, 2026-10-06).
 * One continuous world of boards; the camera travels between them as the argument moves on.
 * Times are anchored to words in the voice (K.T). Numbers on screen: tomato 20 -> 40 (sourced, Al Mal News 2026),
 * ~2% a year (sourced, the Federal Reserve's 2% target), 10,000 جنيه (hypothetical, tagged). The Pepsi rise is shown
 * without a figure. All icons come from the approved inflation batch 04 and earlier approved batches.
 */
const { T, num } = K;
const OBJ = "../../library/objects/";
const RED = "#e5534b"; // genuine losses only

// ---------- world layout (boards advance right -> left, like reading Arabic) ----------
const b1 = K.board("tomato", 0, 0);
const b2 = K.board("pepsi", -1400, 0);
const b3 = K.board("value", -2800, 0);
const b4 = K.board("scale", 0, 1400);
const b5 = K.board("factory", -1400, 1400);
const b6 = K.board("target", -2800, 1400);
const b7 = K.board("thief", 0, 2800);
const b8 = K.board("savings", -1400, 2800);
const b9 = K.board("idle", -2800, 2800);
const b10 = K.board("markets", -1400, 4200);
K.cam(0, "tomato");

// ---------- 1. hook: tomatoes 20 -> 40 جنيه ----------
K.img(b1, OBJ + "kanz-tomato-basket-v01.png", { x: 500, y: 330, w: 440, at: 0.15 });
K.tag(b1, num("20") + " جنيه", { x: 790, y: 640, size: 52, at: T("20", 1.5) });
K.strike(b1, 690, 662, 890, 618, { at: T("لـ40") - 0.15, color: "#d5adef" });
K.arrow(b1, 660, 580, 470, 580, { at: T("لـ40") - 0.1, bend: 25, seed: 3 });
K.text(b1, num("40") + " جنيه", { x: 230, y: 640, size: 96, head: true, color: "#d5adef", at: T("لـ40"), from: "pop", sfx: "pop", gain: 0.5 });
K.text(b1, "المصدر: المال نيوز، أسعار الخضروات 2026", { x: 500, y: 790, size: 26, cls: "muted", at: T("لـ40") + 0.3 });

// ---------- 2. Pepsi almost doubled in under 6 months (no figure shown) ----------
const tPep = T("وكان");
K.cam(tPep - 0.3, "pepsi");
K.img(b2, OBJ + "kanz-pepsi-can-v01.png", { x: 560, y: 380, w: 380, at: tPep });
K.arrow(b2, 280, 640, 280, 170, { at: T("ضاعف"), bend: 0.001, width: 8, color: "#d5adef", sfx: "whoosh", gain: 0.3 });
K.text(b2, "شبه الضعف", { x: 560, y: 690, size: 80, head: true, color: "#d5adef", at: T("ضاعف") + 0.1 });
K.tag(b2, "في أقل من " + num("6") + " شهور", { x: 560, y: 790, at: T("أقل") });
// the question
K.headline([
  { html: "ليه الأسعار", at: T("تفتكر") },
  { html: "بتعلى كده؟", kw: true, at: T("يعلى") },
], { out: T("ده", 10.5) - 0.1 });

// ---------- 3. the answer: inflation, the currency losing value ----------
K.punch("التضخم", T("التضخم"), T("بس", 13.3) - 0.04, { size: 190 });
const tVal = T("بس", 13.3);
K.cam(tVal - 0.2, "value");
K.text(b3, "يعني إيه التضخم؟", { x: 500, y: 60, size: 72, head: true, at: tVal + 0.2 });
const note = K.img(b3, OBJ + "kanz-egp-banknote-v01.png", { x: 500, y: 400, w: 560, at: T("العملة", 15.5) });
const tLoss = T("بتفقد");
K.fadeTo(note, tLoss, 0.35, { scale: 0.7, dur: 0.9 });
K.arrow(b3, 880, 250, 860, 520, { at: tLoss, bend: 20, seed: 4 });
K.tag(b3, "العملة بتفقد قيمتها", { x: 500, y: 700, lav: true, at: T("قيمتها") });

// ---------- 4. the balance scale: goods on one pan, money on the other ----------
// Assembly from the batch 04 animator notes (1254 px composition), scaled to a 600 px scale on the board.
const F = 600 / 1254, CX = 500, CY = 470;
const PIV = [CX, CY + (597 - 627) * F];          // beam pivot on the board
const ARM = 352 * F;                              // pivot -> pan support
const PAN_W = 1254 * 0.42 * F, PAN_DY = -68.9 * F; // pan centre sits above its support
const tSc = T("كل", 17);
K.cam(tSc - 0.35, "scale");
K.text(b4, "الميزان", { x: 500, y: 40, size: 72, head: true, at: T("ميزان") });
const base = K.img(b4, OBJ + "kanz-balance-scale-base-v01.png", { x: CX, y: CY, w: 600, at: tSc });
const beamW = 1254 * 0.8 * F;
const beam = K.img(b4, OBJ + "kanz-balance-scale-beam-v01.png", { x: CX, y: PIV[1] - 27 * 0.8 * F, w: beamW, at: tSc + 0.1 });
gsap.set(beam, { transformOrigin: `${beamW / 2}px ${beamW / 2 + 27 * 0.8 * F}px`, zIndex: 0 });
gsap.set(base, { zIndex: 1 });
// right pan = goods (named first), left pan = money
const panAt = (side, deg) => { const a = deg * Math.PI / 180, d = side * ARM; return [PIV[0] + d * Math.cos(a), PIV[1] + d * Math.sin(a)]; };
const pans = {}, loads = { 1: [], [-1]: [] };
[1, -1].forEach((s) => {
  const [x, y] = panAt(s, 0);
  pans[s] = K.img(b4, OBJ + "kanz-balance-scale-pan-v01.png", { x, y: y + PAN_DY, w: PAN_W, at: tSc + 0.2 });
  gsap.set(pans[s], { zIndex: 2 });
});
function load(side, src, o) { // an object resting on a pan; moves with it
  const [x, y] = panAt(side, 0);
  const e = K.img(b4, OBJ + src, { x: x + (o.dx || 0), y: y + PAN_DY - o.h, w: o.w, at: o.at, sfx: o.sfx });
  gsap.set(e, { zIndex: 3 });
  loads[side].push([e, o.dx || 0, o.h]);
  return e;
}
let tilt = 0;
function tiltTo(t, deg, dur = 0.8) {
  K.tl.to(beam, { rotation: deg, duration: dur, ease: "back.out(1.4)" }, t);
  [1, -1].forEach((s) => {
    const [x, y] = panAt(s, deg);
    K.tl.to(pans[s], { left: x, top: y + PAN_DY, duration: dur, ease: "back.out(1.4)" }, t);
    loads[s].forEach(([e, dx, h]) => K.tl.to(e, { left: x + dx, top: y + PAN_DY - h, duration: dur, ease: "back.out(1.4)" }, t));
  });
  K.sfx(t, "click", 0.3);
  tilt = deg;
}
const sack = load(1, "kanz-raw-material-sack-v01.png", { w: 170, h: 70, at: T("مادة") });
K.tag(b4, "مادة خام أو سلعة", { x: 790, y: 160, at: T("سلعة", 18.8) });
load(-1, "kanz-egp-banknote-stack-v01.png", { w: 180, h: 55, at: T("الفلوس", 21.5) });
K.tag(b4, "الفلوس", { x: 210, y: 160, lav: true, at: T("الفلوس", 21.5) + 0.1 });
// goods stay the same, money grows: the money pan goes down
const tMore = T("زاد", 30);
const m2 = load(-1, "kanz-egp-banknote-stack-v01.png", { w: 180, h: 110, dx: -8, at: tMore - 0.5 });
const m3 = load(-1, "kanz-egp-banknote-stack-v01.png", { w: 180, h: 165, dx: 6, at: tMore - 0.1 });
tiltTo(tMore, -8);
K.text(b4, "السعر زاد", { x: 500, y: 760, size: 76, head: true, color: "#d5adef", at: T("السعر", 31.4), from: "pop" });
const tFix = K.tag(b4, "السلعة ثابتة", { x: 790, y: 240, at: T("ثابتة") });
const tUp = K.tag(b4, "الفلوس زادت", { x: 210, y: 240, lav: true, at: T("عددها") });
// reset: money stays the same, but goods shrink; same result
const tReset = T("ممكن", 35);
[m2, m3, tFix, tUp].forEach((e) => K.out(e, tReset));
tiltTo(tReset + 0.1, 0, 0.6);
const tLess = T("يقل");
K.fadeTo(sack, tLess - 0.2, 1, { scale: 0.6, dur: 0.5 });
tiltTo(tLess + 0.2, -8);
K.tag(b4, "السلعة قلّت", { x: 790, y: 240, at: tLess });
K.oval(b4, 500, 430, 380, 300, { at: T("العبرة"), seed: 6 });

// ---------- 5. raw materials and manufacturing cost more, so companies raise prices ----------
const tFac = T("بالتالي");
K.cam(tFac - 0.2, "factory");
K.img(b5, OBJ + "kanz-raw-material-sack-v01.png", { x: 820, y: 330, w: 230, at: T("والمواد", 44.5) });
K.img(b5, OBJ + "kanz-factory-v01.png", { x: 470, y: 300, w: 380, at: T("التصنيع") });
K.tag(b5, "تكلفة التصنيع", { x: 470, y: 520, at: T("التصنيع") + 0.15 });
K.tag(b5, "المواد الخام", { x: 820, y: 500, at: T("والمواد", 44.5) + 0.15 });
K.text(b5, "بتغلى", { x: 660, y: 90, size: 70, head: true, color: "#d5adef", at: T("تغلى") });
K.arrow(b5, 300, 560, 170, 640, { at: T("ترفع"), bend: 30, seed: 2 });
K.img(b5, OBJ + "kanz-price-tag-v01.png", { x: 160, y: 700, w: 170, at: T("سعر", 47.5) });
K.tag(b5, "سعر المنتج ↑", { x: 360, y: 760, lav: true, at: T("المنتج", 47.8) });
K.img(b5, OBJ + "kanz-npc-m01-worried-wallet-v01.png", { x: 840, y: 690, w: 260, at: T("عليك") });

// ---------- 6. part of the system: ~2% a year is the target; trouble starts when it breaks out ----------
const tSys = T("دي", 49);
K.cam(tSys - 0.2, "target");
K.text(b6, "جزء أساسي من النظام", { x: 500, y: 60, size: 66, head: true, at: T("الرأسمالي") });
K.axis(b6, 80, 920, 760, { at: T("لو", 53) });
K.line(b6, [[100, 690], [250, 665], [400, 640], [550, 612], [650, 590]], { at: T("لو", 53) + 0.1, dur: 2.6, ease: "power1.inOut" });
K.text(b6, "حوالي " + num("2%") + " كل سنة", { x: 400, y: 450, size: 84, head: true, color: "#d5adef", at: T("2%", 58), from: "pop", sfx: "pop", gain: 0.5 });
K.text(b6, "المصدر: الاحتياطي الفيدرالي الأمريكي، هدف التضخم " + num("2%"), { x: 500, y: 810, size: 26, cls: "muted", at: T("2%", 58) + 0.3 });
const tCrisis = T("تخرج");
K.line(b6, [[650, 590], [740, 500], [810, 340], [870, 190], [910, 110]], { at: tCrisis - 0.2, dur: 0.8, color: RED, ease: "power2.in" });
K.text(b6, "خارج السيطرة", { x: 560, y: 250, size: 60, head: true, color: RED, at: T("السيطرة"), from: "pop", sfx: "hit", gain: 0.4 });

// ---------- 7. the hidden thief eating your purchasing power ----------
const tThief = T("هنا", 62.3);
K.cam(tThief - 0.2, "thief", { via: 0.42, dur: 0.9 });
K.text(b7, "الحرامي الخفي", { x: 500, y: 60, size: 84, head: true, color: "#d5adef", at: T("لـالحرامي") });
const cash = K.img(b7, OBJ + "kanz-egp-banknote-v01.png", { x: 470, y: 470, w: 480, at: tThief + 0.1 });
const hand = K.img(b7, OBJ + "kanz-thief-hand-v01.png", { x: 760, y: 300, w: 380, at: T("لـالحرامي") + 0.2, sfx: "whoosh" });
K.tag(b7, "القوة الشرائية لفلوسك", { x: 470, y: 690, at: T("الشرائية") });
const tFast = T("أسرع");
K.fadeTo(cash, tFast, 0.45, { scale: 0.72, dur: 1.0 });
K.tl.to(hand, { left: 700, top: 380, duration: 0.9, ease: "power2.inOut" }, tFast);
K.img(b7, OBJ + "kanz-npc-m01-neutral-v01.png", { x: 150, y: 640, w: 230, at: T("وإنت", 67.5) });

// ---------- 8. 10,000 saved for a year: same number, less value ----------
const tSave = T("تخيّل");
K.cam(tSave - 0.2, "savings");
K.tag(b8, "مثال افتراضي", { x: 500, y: 40, at: tSave });
K.img(b8, OBJ + "kanz-savings-jar-v01.png", { x: 760, y: 300, w: 300, at: T("حوّشت") });
K.text(b8, num("10,000") + " جنيه", { x: 760, y: 520, size: 64, head: true, at: T("10,000") });
K.img(b8, OBJ + "kanz-calendar-v01.png", { x: 500, y: 250, w: 170, at: T("بعد", 70.5) });
K.tag(b8, "بعد سنة", { x: 500, y: 360, at: T("بعد", 70.5) + 0.15 });
K.text(b8, "لسه " + num("10,000"), { x: 250, y: 520, size: 64, head: true, at: T("10,000", 71.8) });
K.text(b8, "قيمتهم الحقيقية قلّت", { x: 250, y: 610, size: 44, color: "#d5adef", at: T("الحقيقية") });
K.img(b8, OBJ + "kanz-grocery-basket-v01.png", { x: 210, y: 320, w: 220, at: T("تجيبه") });
const tExtra = T("أكتر", 78);
K.img(b8, OBJ + "kanz-egp-banknote-v01.png", { x: 500, y: 740, w: 200, rot: -6, at: tExtra - 0.3 });
K.img(b8, OBJ + "kanz-egp-banknote-v01.png", { x: 330, y: 760, w: 200, rot: 5, at: tExtra });
K.tag(b8, "محتاج تحط أكتر", { x: 760, y: 750, lav: true, at: tExtra + 0.1 });

// ---------- 9. saving alone isn't enough; idle money loses ----------
const tIdle = T("ده", 80.4);
K.cam(tIdle - 0.2, "idle");
K.img(b9, OBJ + "kanz-safe-v01.png", { x: 560, y: 380, w: 380, at: tIdle });
K.text(b9, "التوفير لوحده مش كفاية", { x: 500, y: 60, size: 62, head: true, at: T("التوفير") });
K.img(b9, OBJ + "kanz-hourglass-v01.png", { x: 200, y: 420, w: 200, at: T("قاعدة", 84) });
K.tag(b9, "فلوس قاعدة", { x: 560, y: 640, at: T("قاعدة", 84) + 0.1 });
K.text(b9, "بتخسر", { x: 500, y: 750, size: 96, head: true, color: RED, at: T("بتخسر"), from: "pop", sfx: "hit", gain: 0.45 });

// ---------- 10. asset markets rise too: take back with the right what inflation took with the left ----------
const tMk = T("بما");
K.cam(tMk - 0.2, "markets", { via: 0.42, dur: 0.9 });
K.text(b10, "أسواق الأصول", { x: 500, y: 50, size: 76, head: true, at: T("فأسواق") });
K.tag(b10, "توضيحي", { x: 500, y: 140, at: T("فأسواق") + 0.2 });
K.axis(b10, 80, 920, 560, { at: tMk });
K.line(b10, [[100, 500], [200, 470], [280, 490], [370, 420], [450, 440], [540, 360], [620, 380], [710, 300], [800, 320], [900, 230]],
  { at: T("بيزيد") - 0.6, dur: 1.6, fill: "rgba(213,173,239,.18)", fillAt: T("بيزيد"), base: 560 });
K.img(b10, OBJ + "kanz-wallet-v01.png", { x: 500, y: 720, w: 210, at: T("فرصة") });
K.arrow(b10, 400, 720, 120, 720, { at: T("بالشمال") - 0.2, bend: 30, seed: 5 });
K.tag(b10, "التضخم بياخد", { x: 200, y: 640, at: T("بالشمال") });
K.arrow(b10, 900, 640, 610, 700, { at: T("باليمين") - 0.2, bend: -30, seed: 8, color: "#d5adef" });
K.tag(b10, "الأسواق بترجّع", { x: 820, y: 800, lav: true, at: T("باليمين") });
K.text(b10, "+", { x: 620, y: 600, size: 140, head: true, color: "#d5adef", at: T("زايد"), from: "pop", sfx: "coin", gain: 0.45 });

// ---------- end: no closing logo or wipe (as on what-is-technical-analysis, Ahmed 2026-10-06) ----------
K.duration = window.DURATION + 0.5;
