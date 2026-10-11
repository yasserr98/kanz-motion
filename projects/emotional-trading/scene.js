/* "خسرت فلوس في البورصة؟" (Emotional Trading and Investment Strategy): Airtable recN49BA2awknaqVF Brief,
 * voiced by the Ahmed Shaaban clone (ElevenLabs v4, 1.15). Look v2 + the 2026-10-11 defaults (LOOK-V2 section 9):
 * complete first frame, paper world for the definition and the strategy, takeaway ending, no logo/wipe.
 * The only real figures (2005, five weeks) come from the study on screen: Lo, Repin & Steenbarger, NBER w11243
 * (assets/SOURCE.md). Sequential anchors: K.N finds each word after the previous one.
 */
const { N, num } = K;
const OBJ = "../../library/objects/";
const L = "#d5adef", RED = "#e5534b"; // red: genuine losses only
const card = (html, size = 56) => `<div style="height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 40px">
  <div class="head" style="font-size:${size}px;color:#141217;line-height:1.3">${html}</div></div>`;
const tick = (b, x, y, at, color = L) => K.line(b, [[x - 34, y - 4], [x - 10, y + 22], [x + 34, y - 30]], { at, dur: 0.3, width: 9, color });

K.look();
// ---------- world: boards advance right -> left, row by row ----------
const B = {
  hook: K.board("hook", 0, 0), did: K.board("did", -1400, 0), moment: K.board("moment", -2800, 0),
  study: K.board("study", 0, 1650, { h: 900 }), define: K.board("define", -1400, 1400), three: K.board("three", -2800, 1400),
  logic: K.board("logic", 0, 2800), anyone: K.board("anyone", -1400, 2800), scale: K.board("scale", -2800, 2800),
  hold: K.board("hold", 0, 4200), plank: K.board("plank", -1400, 4200), calm: K.board("calm", -2800, 4200),
  plan: K.board("plan", 0, 5600), price: K.board("price", -1400, 5600), q1: K.board("q1", -2800, 5600),
  q2: K.board("q2", 0, 7000), write: K.board("write", -1400, 7000), check: K.board("check", -2800, 7000),
  log: K.board("log", 0, 8400), luck: K.board("luck", -1400, 8400),
};
K.cam(0, "hook");

// ---------- 1. hook: lost money in the market? Complete first frame ----------
N("البورصة");
K.headline([{ html: "خسرت فلوس في" }, { html: "البورصة؟", kw: true }], { out: K.T("متابع") - 0.25 });
const crash = [[120, 330], [240, 370], [340, 345], [450, 450], [550, 425], [660, 590], [770, 560], [890, 780]];
K.line(B.hook, crash, { at: 0, dur: 1.6, color: RED, width: 10 });
K.img(B.hook, OBJ + "kanz-share-certificate-v01.png", { x: 600, y: 520, w: 540, glow: true, rot: -6 });
K.img(B.hook, OBJ + "kanz-npc-m02-worried-v01.png", { x: 210, y: 560, w: 400 });
K.fg(B.hook, OBJ + "kanz-egp-banknote-stack-v01.png", { x: 980, y: 830, w: 380 });
K.push(0.4, "hook", 1.1, 1.6);

// ---------- 2. you follow the news, read about companies, do everything right… and still lost? ----------
const tNews = N("متابع");
K.cam(tNews - 0.3, "did");
const m1 = K.img(B.did, OBJ + "kanz-npc-m01-neutral-v01.png", { x: 500, y: 660, w: 420, at: tNews });
[["الأخبار", "الأخبار", 790], ["الشركات", "الشركات", 500], ["صح", "كل حاجة صح", 210]].forEach(([w, html, x], i) => {
  const t = N(w);
  K.card(B.did, card(html, 46), { x, y: 230, w: 260, h: 170, rot: i === 1 ? 1.5 : -1.5, at: t - 0.15, tape: true });
  tick(B.did, x + 95, 135, t + 0.3);
});
const tLost = N("خسرت");
K.swap(m1, OBJ + "kanz-npc-m01-worried-wallet-v01.png", tLost);
K.text(B.did, "خسرت؟", { x: 500, y: 420, size: 120, head: true, color: RED, at: tLost, from: "pop", sfx: "hit", gain: 0.4 });

// ---------- 3. so why did that happen? ----------
const tWhy = N("طيب");
K.punch("طيب ليه ده حصل؟", tWhy, K.T("جزء") - 0.1, { size: 110 });

// ---------- 4. part of the answer: the moment you decide to buy or sell ----------
const tPart = N("جزء");
K.cam(tPart - 0.3, "moment", { sfx: false, dur: 0.3 });
const phone = K.img(B.moment, OBJ + "kanz-npc-m01-phone-choice-v01.png", { x: 610, y: 470, w: 580, at: tPart, glow: true });
const tMom = N("اللحظة");
K.img(B.moment, OBJ + "kanz-hourglass-v01.png", { x: 200, y: 470, w: 300, at: tMom, float: true });
K.text(B.moment, "اللحظة", { x: 240, y: 150, size: 72, head: true, color: L, at: tMom });
K.push(N("قرار") - 0.2, "moment", 1.12, 2.0, { dx: 80 });
K.tag(B.moment, "البيع", { x: 760, y: 780, at: N("البيع"), size: 46 });
K.tag(B.moment, "الشراء", { x: 470, y: 780, lav: true, at: N("الشراء"), size: 46 });

// ---------- 5. the 2005 study (genuine screenshot, NBER w11243) ----------
const tStudy = N("دراسة");
K.cam(tStudy - 0.35, "study");
const docT = K.doc(B.study, "assets/nber-w11243-title.png", { x: 500, y: 170, w: 880, at: tStudy, rot: -1 });
const t05 = N("2005");
K.docMark(docT, 1172, 530, 280, 40, { at: t05 });
const docA = K.doc(B.study, "assets/nber-w11243-abstract.png", { x: 500, y: 560, w: 880, at: N("تابعوا") - 0.1, rot: 1,
  source: "NBER · Lo, Repin &amp; Steenbarger · ٢٠٠٥" });
K.docMark(docA, 300, 60, 510, 42, { at: N("المتداولين") });
K.docMark(docA, 205, 106, 305, 42, { at: N("خمس") });
K.docMark(docA, 680, 154, 250, 42, { at: N("مشاعرهم") });
const tEmo = N("التأثر");
K.docMark(docA, 22, 250, 1110, 42, { at: tEmo, dur: 0.9 });
K.docFocus(tEmo - 0.2, docA, 640, 290, 1.2, 1.6);
K.docMark(docA, 405, 298, 570, 42, { at: N("أسوأ"), frame: true });
K.tag(B.study, "أداء أسوأ", { x: 500, y: 800, lav: true, size: 52, at: K.T("أسوأ") + 0.15 });

// ---------- 6. definition on paper: Emotional Trading = fear, greed, the urge to win it back ----------
const tDef = N("وهنا");
K.cam(tDef - 0.3, "define");
K.world(tDef - 0.3, "paper");
K.text(B.define, "Emotional Trading", { x: 500, y: 90, size: 60, head: true, at: N("Emotional") });
K.text(B.define, "التداول العاطفي", { x: 500, y: 220, size: 120, head: true, color: L, at: N("التداول") });
K.underline(B.define, 170, 830, 300, { at: K.T("العاطفي", tDef) + 0.2, color: L });
K.text(B.define, "قرارات البيع والشراء", { x: 500, y: 380, size: 46, cls: "muted", at: N("قرارات") });
[["الخوف", "الخوف", "kanz-npc-m02-worried-v01.png", 790, 360], ["الطمع", "الطمع", "kanz-money-bag-spill-v01.png", 500, 320],
  ["تعوض", "إنك تعوّض", "kanz-poker-chips-v01.png", 220, 310]].forEach(([w, html, img, x, size]) => {
  const t = N(w);
  K.img(B.define, OBJ + img, { x, y: 590, w: size, at: t - 0.1 });
  K.text(B.define, html, { x, y: 810, size: 52, head: true, at: t });
});

// ---------- 7. buy in a rush, sell in a panic, bet more to win it back ----------
const tRush = N("تشتري");
K.world(tRush - 0.3, "charcoal");
K.cam(tRush - 0.3, "three");
const run = [3, 3.1, 3.4, 4.1, 5.2, 6.4, 7.4, 6.5, 5.3, 4.4, 3.6];
const ch = K.area(B.three, { x: 520, y: 400, w: 740, h: 460, data: run, min: 2.5, max: 8, at: tRush, dur: 3.6, out: K.T("تخسر", tRush) - 0.3 });
const tMiss = N("تفوتك");
K.dot(B.three, ch.x(6), ch.y(7.4), { at: tRush + 2.2 });
K.tag(B.three, "تشتري بسرعة", { x: ch.x(6), y: ch.y(7.4) - 80, lav: true, size: 40, at: tMiss, out: K.T("تخسر", tRush) - 0.3 });
const tNerv = N("اتوترت");
K.dot(B.three, ch.x(10), ch.y(3.6), { at: tNerv, color: RED });
K.tag(B.three, "تبيع", { x: ch.x(10) - 100, y: ch.y(3.6) + 70, size: 40, at: tNerv + 0.1, out: K.T("تخسر", tRush) - 0.3 });
const tLose = N("تخسر");
K.img(B.three, OBJ + "kanz-poker-chips-v01.png", { x: 760, y: 560, w: 260, at: N("صفقة") });
K.text(B.three, "خسارة", { x: 760, y: 360, size: 60, head: true, color: RED, at: K.T("صفقة") + 0.1 });
const tMore = N("أكتر");
K.arrow(B.three, 620, 520, 450, 520, { at: tMore - 0.2, bend: 40 });
K.img(B.three, OBJ + "kanz-poker-chips-v01.png", { x: 280, y: 520, w: 460, at: tMore, glow: true, sfx: "coin" });
K.text(B.three, "فلوس أكتر", { x: 280, y: 230, size: 64, head: true, color: L, at: tMore + 0.1 });
K.tag(B.three, "عشان ترجع اللي خسرته", { x: 500, y: 820, lav: true, size: 44, at: N("ترجع") });

// ---------- 8. ...while you still believe your decisions are logical ----------
const tAll = N("وكل");
K.cam(tAll - 0.3, "logic");
K.img(B.logic, OBJ + "kanz-npc-m01-thinking-v01.png", { x: 640, y: 500, w: 560, at: tAll, float: true });
K.img(B.logic, OBJ + "kanz-calculator-v01.png", { x: 220, y: 600, w: 300, at: N("مقتنع") });
const tLog = N("منطقية");
K.text(B.logic, "«قرارات منطقية»", { x: 500, y: 110, size: 92, head: true, at: K.T("قرارات", tLog - 1) });
K.oval(B.logic, 500, 110, 400, 90, { at: tLog });

// ---------- 9. why can any of us fall into this? ----------
const tAny = N("طب");
K.cam(tAny - 0.3, "anyone");
[["kanz-npc-m01-neutral-v01.png", 800], ["kanz-npc-f01-neutral-v01.png", 500], ["kanz-npc-m02-neutral-v01.png", 200]].forEach(([img, x], i) =>
  K.img(B.anyone, OBJ + img, { x, y: 540, w: 400, at: tAny + i * 0.25 }));
K.text(B.anyone, "أي حد فينا", { x: 500, y: 110, size: 110, head: true, color: L, at: N("فينا") - 0.2 });

// ---------- 10. a loss weighs more than a gain of the same size: the scale tips to the loss ----------
const tLoss = N("الخسارة");
K.cam(tLoss - 0.35, "scale");
const F = 640 / 1254, CX = 500, CY = 520;
const PIV = [CX, CY + (597 - 627) * F], ARM = 352 * F, PAN_W = 1254 * 0.42 * F, PAN_DY = -68.9 * F;
const base = K.img(B.scale, OBJ + "kanz-balance-scale-base-v01.png", { x: CX, y: CY, w: 640, at: tLoss });
const beamW = 1254 * 0.8 * F;
const beam = K.img(B.scale, OBJ + "kanz-balance-scale-beam-v01.png", { x: CX, y: PIV[1] - 27 * 0.8 * F, w: beamW, at: tLoss + 0.1, shadow: false });
gsap.set(beam, { transformOrigin: `${beamW / 2}px ${beamW / 2 + 27 * 0.8 * F}px`, zIndex: 0 });
gsap.set(base, { zIndex: 1 });
const panAt = (side, deg) => { const a = deg * Math.PI / 180, d = side * ARM; return [PIV[0] + d * Math.cos(a), PIV[1] + d * Math.sin(a)]; };
const pans = {}, loads = { 1: [], [-1]: [] };
[1, -1].forEach((s) => {
  const [x, y] = panAt(s, 0);
  pans[s] = K.img(B.scale, OBJ + "kanz-balance-scale-pan-v01.png", { x, y: y + PAN_DY, w: PAN_W, at: tLoss + 0.2, shadow: false });
  gsap.set(pans[s], { zIndex: 2 });
});
function load(side, src, o) {
  const [x, y] = panAt(side, 0);
  const e = K.img(B.scale, OBJ + src, { x, y: y + PAN_DY - o.h, w: o.w, at: o.at, sfx: "coin", shadow: false });
  gsap.set(e, { zIndex: 3 });
  loads[side].push([e, o.h]);
  return e;
}
function tiltTo(t, deg, dur = 0.9) {
  K.tl.to(beam, { rotation: deg, duration: dur, ease: "back.out(1.4)" }, t);
  [1, -1].forEach((s) => {
    const [x, y] = panAt(s, deg);
    K.tl.to(pans[s], { left: x, top: y + PAN_DY, duration: dur, ease: "back.out(1.4)" }, t);
    loads[s].forEach(([e, h]) => K.tl.to(e, { left: x, top: y + PAN_DY - h, duration: dur, ease: "back.out(1.4)" }, t));
  });
  K.sfx(t, "hit", 0.3);
}
// right pan = the loss (named first), left pan = the gain; the same banknote stack on both
load(1, "kanz-egp-banknote-stack-v01.png", { w: 170, h: 60, at: tLoss + 0.3 });
K.text(B.scale, "خسارة", { x: 790, y: 110, size: 76, head: true, color: RED, at: tLoss + 0.3 });
const tGain = N("مكسب");
load(-1, "kanz-egp-banknote-stack-v01.png", { w: 170, h: 60, at: tGain });
K.text(B.scale, "مكسب", { x: 210, y: 110, size: 76, head: true, color: L, at: tGain });
const tSame = N("بنفس");
K.tag(B.scale, "نفس القيمة", { x: 500, y: 820, size: 46, at: tSame });
tiltTo(tSame + 0.5, 11);

// ---------- 11. holding a losing stock: selling would make the loss real ----------
const tHold = N("تتمسك");
K.cam(tHold - 0.4, "hold");
K.img(B.hold, OBJ + "kanz-npc-f01-worried-v01.png", { x: 680, y: 500, w: 520, at: tHold - 0.1 });
K.line(B.hold, [[90, 200], [200, 240], [290, 230], [380, 360], [470, 400]], { at: N("خسران") - 0.3, dur: 0.9, color: RED, width: 9 });
K.img(B.hold, OBJ + "kanz-share-certificate-v01.png", { x: 300, y: 470, w: 380, at: K.T("بسهم", tHold), rot: 5 });
const tReal = N("حقيقة");
K.img(B.hold, OBJ + "kanz-receipt-v01.png", { x: 260, y: 700, w: 230, at: K.T("بيعه", tHold) + 0.1, sfx: "paper" });
K.text(B.hold, "الخسارة بقت حقيقة", { x: 500, y: 90, size: 76, head: true, color: RED, at: tReal - 0.2 });

// ---------- 12. a gain raises your confidence: more risk than you planned (plank over the crater) ----------
const tWin = N("والمكسب");
K.cam(tWin - 0.3, "plank");
K.img(B.plank, OBJ + "kanz-volcano-crater-v01.png", { x: 380, y: 650, w: 620, at: tWin, shadow: false });
const plank = K.img(B.plank, OBJ + "kanz-wooden-plank-v01.png", { x: 500, y: 520, w: 800, at: tWin + 0.1, shadow: false });
gsap.set(plank, { zIndex: 3 });
const cele = K.img(B.plank, OBJ + "kanz-npc-m01-celebrating-v01.png", { x: 840, y: 340, w: 320, at: tWin + 0.2, shadow: false });
gsap.set(cele, { zIndex: 4 });
K.tag(B.plank, "ثقة أكبر", { x: 840, y: 90, lav: true, size: 48, at: N("ثقتك") });
const tStep = N("تاخد");
K.out(cele, tStep);
K.walk(B.plank, [OBJ + "kanz-npc-m01-walk-a-v01.png", OBJ + "kanz-npc-m01-walk-b-v01.png"],
  { from: [840, 340], to: [330, 340], at: tStep, dur: 2.2, w: 320, appear: tStep, sfx: "hit", gain: 0.08, shadow: false, z: 5 });
K.text(B.plank, "مخاطرة أكبر", { x: 380, y: 90, size: 84, head: true, color: RED, at: N("أكبر") });

// ---------- 13. these feelings are normal; what matters is how you decide with them ----------
const tFeel = N("المشاعر");
K.cam(tFeel - 0.3, "calm");
K.img(B.calm, OBJ + "kanz-npc-f01-explain-v01.png", { x: 500, y: 520, w: 540, at: tFeel, glow: true });
[["الخوف", 800, 300], ["الطمع", 200, 330], ["تعوّض", 790, 640]].forEach(([w, x, y], i) =>
  K.text(B.calm, w, { x, y, size: 56, head: true, cls: "muted", at: tFeel + 0.2 + i * 0.15, from: "fade" }));
K.text(B.calm, "طبيعية", { x: 500, y: 90, size: 100, head: true, color: L, at: N("طبيعية") });
K.tag(B.calm, "إزاي تاخد قرارك؟", { x: 500, y: 830, lav: true, size: 48, at: N("قرارك") - 0.3 });

// ---------- 14. strategy on paper: a clear, written, researched plan that fits your goal and risk ----------
const tStrat = N("وهنا");
K.cam(tStrat - 0.3, "plan");
K.world(tStrat - 0.3, "paper");
K.text(B.plan, "الاستراتيجية", { x: 500, y: 70, size: 110, head: true, color: L, at: N("الاستراتيجية") });
K.card(B.plan, "", { x: 560, y: 510, w: 620, h: 620, rot: -1, at: N("خطة") - 0.1 });
[["واضحة", "واضحة"], ["ومكتوبة", "مكتوبة"], ["بحث", "مبنية على بحث"], ["لهدفك", "مناسبة لهدفك"], ["المخاطرة", "قدرتك على المخاطرة"]].forEach(([w, html], i) => {
  const t = N(w), y = 290 + i * 110;
  K.text(B.plan, html, { x: 530, y, size: 50, head: true, color: K.INK, at: t });
  tick(B.plan, 800, y, t + 0.15);
});
K.img(B.plan, OBJ + "kanz-security-shield-v01.png", { x: 150, y: 640, w: 240, at: K.T("تحمّل", tStrat), shadow: false });

// ---------- 15. before putting money in: what is a stock market and what moves the price? ----------
const tBefore = N("قبل");
K.world(tBefore - 0.3, "charcoal");
K.cam(tBefore - 0.3, "price");
K.img(B.price, OBJ + "kanz-wallet-open-cash-v01.png", { x: 820, y: 640, w: 300, at: N("فلوسك") });
const cd = [[5, 5.6, 4.7, 5.4], [5.4, 6.2, 5.2, 6], [6, 6.3, 5.1, 5.3], [5.3, 5.5, 4.4, 4.6], [4.6, 5.8, 4.5, 5.6], [5.6, 7, 5.5, 6.8],
  [6.8, 7.1, 5.8, 6], [6, 6.4, 5, 5.2], [5.2, 6.6, 5.1, 6.4], [6.4, 7.6, 6.2, 7.3]];
const cdl = K.candles(B.price, { x: 420, y: 470, w: 640, h: 440, data: cd, at: N("تفهم"), dur: 2.0 });
K.text(B.price, "يعني إيه بورصة؟", { x: 500, y: 90, size: 76, head: true, at: N("بورصة") - 0.2 });
const tMove = N("السعر");
K.text(B.price, "؟", { x: cdl.x(9) + 60, y: cdl.y(7.6) - 40, size: 150, head: true, color: L, at: tMove, from: "pop", sfx: "pop" });
K.tag(B.price, "إيه اللي بيحرك السعر؟", { x: 420, y: 800, lav: true, size: 46, at: K.T("بيحرك", tBefore) });

// ---------- 16. ask yourself: why, what goal, how long / what makes me exit, how much, the rest of my money ----------
const tAsk = N("اسأل");
K.cam(tAsk - 0.3, "q1");
K.text(B.q1, "اسأل نفسك", { x: 500, y: 70, size: 96, head: true, color: L, at: tAsk });
const row = (b, w, html, img, i, o = {}) => {
  const t = o.t || N(w), y = 270 + i * 230;
  K.img(b, OBJ + img, { x: 800, y, w: 260, at: t, shadow: false, glow: o.glow });
  K.text(b, html, { x: 390, y, size: 72, head: true, at: t + 0.05 });
};
row(B.q1, "ليه", "داخل ليه؟", "kanz-share-certificate-v01.png", 0);
row(B.q1, "هدفي", "هدفي منه إيه؟", "kanz-savings-jar-v01.png", 1);
row(B.q1, "ولمدة", "لمدة قد إيه؟", "kanz-calendar-v01.png", 2);
const tExit = N("وإيه");
K.cam(tExit - 0.3, "q2");
row(B.q2, "", "إيه يخلّيني أخرج؟", "kanz-security-shield-v01.png", 0, { t: tExit });
row(B.q2, "بكام", "هدخل بكام؟", "kanz-wallet-open-cash-v01.png", 1);
K.oval(B.q2, 390, 270, 290, 90, { at: K.T("أخرج", tExit) });
row(B.q2, "وانخفاض", "باقي فلوسك؟", "kanz-pie-chart-v01.png", 2, { glow: true });
K.arrow(B.q2, 640, 650, 640, 760, { at: N("يأثّر"), bend: 0.001, color: RED });

// ---------- 17. write the answers while calm, before the price puts you under pressure ----------
const tAns = N("الإجابات");
K.cam(tAns - 0.3, "write");
K.img(B.write, OBJ + "kanz-npc-f01-neutral-v01.png", { x: 700, y: 520, w: 500, at: tAns });
K.card(B.write, card("الإجابات<br>مكتوبة", 52), { x: 270, y: 470, w: 340, h: 300, rot: 2, at: N("تتكتب") - 0.1 });
K.text(B.write, "وإنت هادي", { x: 500, y: 90, size: 96, head: true, color: L, at: N("هادي") - 0.1 });
const tPress = N("حركة");
const jag = [[60, 700], [130, 640], [190, 760], [260, 610], [320, 790], [400, 600], [460, 780], [540, 630], [610, 800], [690, 590], [760, 770], [850, 620], [940, 760]];
gsap.set(K.line(B.write, jag, { at: tPress, dur: 1.2, color: "rgba(255,255,255,.35)", width: 6 }), { zIndex: -1 });
K.tag(B.write, "تحت ضغط", { x: 500, y: 850, size: 46, at: N("ضغط") - 0.1 });

// ---------- 18. when nervous: go back to what you wrote. New information, or just want relief? ----------
const tNervous = N("ولما");
K.cam(tNervous - 0.3, "check");
K.img(B.check, OBJ + "kanz-npc-m02-worried-v01.png", { x: 790, y: 520, w: 420, at: tNervous + 0.1 });
K.card(B.check, card("ارجع للي كتبته", 50), { x: 400, y: 160, w: 520, h: 170, rot: -2, at: N("ارجع") });
K.card(B.check, card("ظهرت معلومة جديدة؟", 44), { x: 400, y: 450, w: 520, h: 160, rot: 1.5, at: N("ظهرت"), tape: false });
K.text(B.check, "ولا", { x: 400, y: 590, size: 50, head: true, cls: "muted", at: N("ولا") });
K.card(B.check, card("عايز أرتاح؟", 52), { x: 400, y: 730, w: 520, h: 160, rot: -1.5, at: N("عايز"), tape: false });
K.oval(B.check, 400, 730, 300, 105, { at: N("أرتاح"), seed: 4 });

// ---------- 19. if the information changed, review the plan; log decisions and results after costs ----------
const tRev = N("ولو");
K.cam(tRev - 0.3, "log");
K.text(B.log, "راجع خطتك", { x: 500, y: 70, size: 96, head: true, at: N("راجع") - 0.1 });
K.card(B.log, "", { x: 560, y: 480, w: 640, h: 520, rot: 1, at: N("وسجّل") - 0.1 });
K.text(B.log, "قراراتك", { x: 700, y: 290, size: 50, head: true, color: K.INK, at: N("قراراتك") });
K.text(B.log, "النتيجة", { x: 400, y: 290, size: 50, head: true, color: K.INK, at: N("ونتايجها") });
[0, 1, 2].forEach((i) => {
  const y = 400 + i * 100, t = K.T("ونتايجها") + 0.25 + i * 0.2;
  K.line(B.log, [[820, y], [580, y]], { at: t, dur: 0.25, width: 6, color: "rgba(20,18,23,.35)" });
  if (i === 1) K.line(B.log, [[380, y - 26], [430, y + 24]], { at: t + 0.1, dur: 0.15, width: 9, color: RED }),
    K.line(B.log, [[430, y - 26], [380, y + 24]], { at: t + 0.2, dur: 0.15, width: 9, color: RED });
  else tick(B.log, 405, y, t + 0.1, "#38104d");
});
const tCost = N("التكاليف");
K.img(B.log, OBJ + "kanz-receipt-v01.png", { x: 150, y: 640, w: 240, at: tCost, rot: -6 });
K.tag(B.log, "بعد التكاليف", { x: 560, y: 790, lav: true, size: 46, at: tCost });
K.tag(B.log, "بتلتزم بيها؟", { x: 740, y: 850, size: 40, at: N("بتلتزم") });
K.tag(B.log, "محتاجة تتعدّل؟", { x: 340, y: 850, size: 40, at: N("تتعدّل") - 0.2 });

// ---------- 20. a studied decision can lose; a reckless one can win by luck ----------
const tLuck = N("لأن");
K.cam(tLuck - 0.3, "luck");
K.text(B.luck, "قرار مدروس", { x: 750, y: 120, size: 72, head: true, at: N("مدروس") - 0.2 });
K.img(B.luck, OBJ + "kanz-calculator-v01.png", { x: 750, y: 380, w: 300, at: K.T("مدروس") - 0.1 });
K.text(B.luck, "وتخسر", { x: 750, y: 640, size: 96, head: true, color: RED, at: N("وتخسر"), from: "pop", sfx: "hit", gain: 0.3 });
K.text(B.luck, "قرار متهوّر", { x: 250, y: 120, size: 72, head: true, at: N("متهوّر") - 0.2 });
K.img(B.luck, OBJ + "kanz-poker-chips-v01.png", { x: 250, y: 380, w: 340, at: K.T("متهوّر") - 0.1 });
K.text(B.luck, "وتكسب بالحظ", { x: 290, y: 640, size: 64, head: true, color: L, at: N("وتكسب"), from: "pop", sfx: "coin", gain: 0.3 });
K.dashed(B.luck, 500, 80, 500, 760, { at: K.T("وممكن", tLuck), color: "rgba(255,255,255,.3)" });

// ---------- 21. ending: back to the opening; the thesis in the voice's words ----------
const tOne = N("نتيجة");
K.cam(tOne - 0.2, "hook", { via: 0.42, dur: 0.9 });
K.takeaway(B.hook, "صفقة واحدة <span class='kw'>ما تقولكش</span><br>إنت ماشي صح ولا لأ", { x: 500, y: 90, size: 84, at: tOne + 0.6, glow: false });

// ---------- end: no closing logo or wipe, no top-left logo (Ahmed, 2026-10-06/07, as on the recent Reels) ----------
K.duration = window.DURATION + 2.4;
