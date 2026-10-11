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
  hook: K.board("hook", 0, 0), study: K.board("study", -1400, 0, { h: 900 }), define: K.board("define", -2800, 0),
  three: K.board("three", 0, 1400), anyone: K.board("anyone", -1400, 1400), scale: K.board("scale", -2800, 1400),
  plan: K.board("plan", 0, 2800), q1: K.board("q1", -1400, 2800), luck: K.board("luck", -2800, 2800),
};
K.cam(0, "hook");

// ---------- 1. hook: lost money in the market? Complete first frame ----------
N("البورصة");
K.headline([{ html: "خسرت فلوس في" }, { html: "البورصة؟", kw: true }], { out: K.T("طيب") - 0.25 });
const crash = [[120, 330], [240, 370], [340, 345], [450, 450], [550, 425], [660, 590], [770, 560], [890, 780]];
K.line(B.hook, crash, { at: 0, dur: 1.6, color: RED, width: 10 });
K.img(B.hook, OBJ + "kanz-share-certificate-v01.png", { x: 600, y: 520, w: 540, glow: true, rot: -6 });
K.img(B.hook, OBJ + "kanz-npc-m02-worried-v01.png", { x: 210, y: 560, w: 400 });
K.fg(B.hook, OBJ + "kanz-egp-banknote-stack-v01.png", { x: 980, y: 830, w: 380 });
K.push(0.4, "hook", 1.1, 1.6);

// ---------- 3. so why did that happen? ----------
const tWhy = N("طيب");
K.punch("طيب ليه ده حصل؟", tWhy, K.T("دراسة") - 0.45, { size: 110 });

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
N("Emotional");
K.text(B.define, "Emotional Trading", { x: 500, y: 90, size: 60, head: true, at: tDef + 0.4 });
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

// ---------- 16. before the strategy, ask yourself: why, what goal, how long ----------
const tBefore = N("وقبل");
K.world(tBefore - 0.3, "charcoal");
K.cam(tBefore - 0.3, "q1");
const tAsk = N("اسأل");
K.text(B.q1, "اسأل نفسك", { x: 500, y: 70, size: 96, head: true, color: L, at: tAsk });
const row = (b, w, html, img, i, o = {}) => {
  const t = o.t || N(w), y = 270 + i * 230;
  K.img(b, OBJ + img, { x: 800, y, w: 250, at: t, shadow: false, glow: o.glow });
  K.text(b, html, { x: 390, y, size: 72, head: true, at: t + 0.05 });
};
row(B.q1, "ليه", "داخل ليه؟", "kanz-share-certificate-v01.png", 0);
row(B.q1, "هدفي", "هدفي منه إيه؟", "kanz-savings-jar-v01.png", 1);
row(B.q1, "ولمدة", "لمدة قد إيه؟", "kanz-calendar-v01.png", 2, { glow: true });

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
