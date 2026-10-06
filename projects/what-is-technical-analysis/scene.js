/* What is technical analysis (Ahmed's voice note, 2026-10-06).
 * One continuous world of boards; the camera travels between them as the argument moves on.
 * Times are anchored to words in the voice (K.T). The two 65% moves are spoken about unnamed stocks,
 * so their charts are schematic and tagged "توضيحي"; every other chart is illustrative too.
 */
const { T, num } = K;
const OBJ = "../../library/objects/";

// ---------- world layout (boards advance right -> left, like reading Arabic) ----------
const b1 = K.board("hook", 0, 0);
const b2 = K.board("auction", -1400, 0);
const b3 = K.board("people", -2800, 0);
const b4 = K.board("define", 0, 1400);
const b5 = K.board("motives", -1400, 1400);
const b6 = K.board("plan", -2800, 1400);
const b7 = K.board("odds", 0, 2800);
const b8 = K.board("use", -1400, 2800);
K.cam(0, "hook");

// ---------- 1. hook: one stock +65%, another -65%, same week ----------
K.headline([
  { html: "نفس الأسبوع:", at: T("السهم") },
  { html: "سهم طلع", at: T("طلع") },
  { html: "وسهم خسر", kw: true, at: T("خسر") },
], { out: 9.6 });
K.tag(b1, "توضيحي", { x: 500, y: 40, at: 0.6 });
K.axis(b1, 560, 940, 640, { at: 0.3 });
K.line(b1, [[580, 600], [640, 580], [700, 540], [760, 500], [820, 400], [880, 330], [930, 250]], { at: T("طلع"), dur: 1.2, color: "#d5adef" });
K.text(b1, num("+65%"), { x: 750, y: 760, size: 120, color: "#d5adef", at: T("65%"), from: "pop", sfx: "pop", gain: 0.5 });
K.axis(b1, 60, 440, 640, { at: T("وفي") });
K.line(b1, [[80, 260], [140, 300], [200, 280], [260, 380], [320, 450], [380, 520], [430, 600]], { at: T("سهم", 3.8), dur: 1.0 });
K.text(b1, num("−65%"), { x: 250, y: 760, size: 120, at: T("65%", 4.5), from: "pop", sfx: "hit", gain: 0.4 });
// the question: what made each move, and could you tell?
K.oval(b1, 760, 425, 190, 215, { at: T("طلّع", 6) });
K.oval(b1, 250, 425, 190, 215, { at: T("نزّل", 7), seed: 4 });
K.text(b1, "؟", { x: 500, y: 430, size: 240, head: true, color: "#d5adef", at: T("الفرق"), from: "pop", sfx: "hit", gain: 0.35 });

// ---------- 2. the exchange is an open auction ----------
const tAuc = T("حاجة", 11) - 0.2;
K.cam(tAuc, "auction");
K.img(b2, OBJ + "kanz-auction-gavel-v01.png", { x: 500, y: 380, w: 430, at: T("مزاد"), sfx: "hit", gain: 0.4 });
K.text(b2, "مزاد مفتوح", { x: 500, y: 90, size: 96, head: true, color: "#d5adef", at: T("مزاد") + 0.2 });
const tMil = T("ملايين", 14.5);
K.text(b2, "ملايين المعاملات اللحظية", { x: 500, y: 690, size: 46, at: tMil });
const bids = [["بيع", 820, 250], ["شرا", 170, 300], ["بيع", 150, 520], ["مزايدة", 850, 520], ["شرا", 300, 170], ["بيع", 700, 170], ["شرا", 880, 380], ["مزايدة", 130, 410]];
bids.forEach(([w, x, y], i) => K.tag(b2, w, { x, y, lav: w === "شرا", rot: (i % 3 - 1) * 4, at: tMil + 0.35 + i * 0.27, gain: 0.25 }));

// ---------- 3. people act on motives; their actions move the price ----------
const tPpl = T("كل", 17);
K.cam(tPpl - 0.3, "people");
const pF = K.img(b3, OBJ + "kanz-npc-f01-neutral-v01.png", { x: 250, y: 330, w: 300, at: T("الناس", 17) });
const pM = K.img(b3, OBJ + "kanz-npc-m01-neutral-v01.png", { x: 500, y: 330, w: 300, at: T("الناس", 17) + 0.2 });
const pP = K.img(b3, OBJ + "kanz-npc-m01-phone-choice-v01.png", { x: 750, y: 330, w: 300, at: T("الناس", 17) + 0.4 });
K.text(b3, "دوافع", { x: 500, y: 40, size: 70, head: true, color: "#d5adef", at: T("بدوافع") });
K.tag(b3, "عاطفية", { x: 750, y: 120, lav: true, at: T("عاطفية") });
K.tag(b3, "منطقية", { x: 250, y: 120, at: T("منطقية") });
const tAct = T("أفعالهم", 21);
K.arrow(b3, 250, 520, 430, 640, { at: tAct, bend: 20 });
K.arrow(b3, 500, 520, 500, 640, { bend: 0.001, at: tAct + 0.15, seed: 5 });
K.arrow(b3, 750, 520, 570, 640, { at: tAct + 0.3, bend: -20, seed: 6 });
K.img(b3, OBJ + "kanz-price-tag-v01.png", { x: 500, y: 740, w: 170, at: T("السعر", 23) });
K.tag(b3, "السعر", { x: 640, y: 760, lav: true, at: T("السعر", 23) + 0.15 });
// we can't know each person's motive...
const tQ = T("دافع", 24.5);
[[340, 210], [590, 210], [840, 210]].forEach(([x, y], i) => K.text(b3, "؟", { x, y, size: 90, head: true, at: tQ + i * 0.18, from: "pop", sfx: "pop", gain: 0.25, out: T("نقدر", 26.5) }));
// ...but we can analyse their effect on prices
const tEff = T("نحلل", 27.5);
[pF, pM, pP].forEach((e) => K.fadeTo(e, tEff, 0.3, { scale: 0.92 }));
K.oval(b3, 540, 750, 170, 90, { at: T("تأثير", 28), seed: 9 });

// ---------- 4. "that, my friend, is technical analysis" ----------
K.punch("التحليل الفني", T("التحليل", 30.5), T("التكنيكال") - 0.04, { size: 150 });

// ---------- 5. definition: price behaviour and context ----------
const tDef = T("التكنيكال");
K.cam(tDef - 0.2, "define", { via: 0.42, dur: 0.9 });
K.text(b4, "التحليل الفني", { x: 500, y: 60, size: 84, head: true, at: tDef });
K.text(b4, "Technical Analysis", { x: 500, y: 150, size: 40, cls: "muted", at: tDef + 0.25 });
K.axis(b4, 80, 920, 740, { at: T("تحليل", 33.5) });
const path = [[100, 640], [180, 600], [250, 620], [330, 520], [400, 545], [480, 450], [560, 480], [640, 390], [720, 420], [800, 330], [900, 300]];
K.line(b4, path, { at: T("السلوك", 33.8), dur: 2.4, fill: "rgba(213,173,239,.18)", fillAt: T("والسياق"), base: 740 });
K.tag(b4, "السلوك السعري", { x: 300, y: 400, lav: true, at: T("السعري") });
// every point on the line is people trading
const tMil2 = T("ملايين", 36);
[2, 4, 6, 8, 10].forEach((i, k) => K.dot(b4, path[i][0], path[i][1], { at: tMil2 + k * 0.12 }));
K.tag(b4, "ملايين البشر", { x: 760, y: 220, at: tMil2 + 0.2 });

// ---------- 6. every motive is inside the price ----------
const tMot = T("جوه", 37);
K.cam(tMot - 0.3, "motives");
K.text(b5, "جوه السعر", { x: 500, y: 50, size: 80, head: true, color: "#d5adef", at: tMot });
K.axis(b5, 80, 920, 780, { at: tMot + 0.2 });
const mp = [[100, 430], [190, 390], [280, 540], [360, 500], [440, 650], [530, 470], [620, 250], [700, 300], [780, 590], [900, 420]];
K.line(b5, mp, { at: T("الدوافع", 38.5), dur: 2.0 });
const emo = [
  K.text(b5, "الخوف", { x: 280, y: 610, size: 48, at: T("الخوف") }),
  K.text(b5, "الرعب", { x: 440, y: 720, size: 48, at: T("الرعب") }),
  K.text(b5, "النشوة", { x: 620, y: 175, size: 54, head: true, color: "#d5adef", at: T("النشوة") }),
  K.text(b5, "الهلع", { x: 780, y: 660, size: 48, at: T("الهلع") }),
];
const calc = K.img(b5, OBJ + "kanz-calculator-v01.png", { x: 140, y: 230, w: 170, at: T("المنطق", 43.5) });
const calcTag = K.tag(b5, "المنطق الحسابي", { x: 150, y: 345, at: T("المنطق", 43.5) + 0.15 });
// ...and each one ends as a buy or a sell
const tAll = T("كل", 44.8);
[...emo, calc, calcTag].forEach((e) => { K.fadeTo(e, tAll, 0.35); K.out(e, T("بيع", 48.5) - 0.1); });
K.tag(b5, "بيع", { x: 620, y: 170, at: T("بيع", 48.5) });
K.tag(b5, "شرا", { x: 440, y: 720, lav: true, at: T("شرا", 49) });
// we can see them in the price, so we analyse them
K.rect(b5, 70, 140, 860, 670, { at: T("نشوفهم") });

// ---------- 7. it helps you enter with a plan ----------
const tPlan = T("يساعدك", 52.5);
K.cam(tPlan - 0.5, "plan");
K.text(b6, "خطة", { x: 500, y: 50, size: 96, head: true, color: "#d5adef", at: T("خطة", 53.5) });
K.tag(b6, "توضيحي", { x: 500, y: 150, at: tPlan + 0.2 });
K.axis(b6, 80, 920, 760, { at: tPlan });
K.line(b6, [[100, 420], [190, 470], [280, 560], [360, 600], [440, 540], [530, 480], [610, 500], [700, 400], [800, 330], [900, 280]], { at: tPlan + 0.1, dur: 1.6 });
const tBuy = T("تشتري", 55);
K.dot(b6, 360, 600, { at: tBuy });
K.tag(b6, "إمتى تشتري", { x: 360, y: 690, lav: true, at: tBuy + 0.1 });
const tBack = T("تتراجع", 56.3);
K.dashed(b6, 120, 650, 880, 650, { at: tBack, color: "#fff", dur: 0.5 });
K.tag(b6, "إمتى تتراجع", { x: 760, y: 700, at: tBack + 0.2 });

// ---------- 8. does it predict every move exactly? No: probabilities ----------
const tAsk = T("هل", 57.5);
K.cam(tAsk - 0.3, "odds", { via: 0.42, dur: 1.0 });
K.text(b7, "بتتوقع كل حركة بالظبط؟", { x: 500, y: 60, size: 64, head: true, at: tAsk + 0.3, out: T("الإجابة") });
K.axis(b7, 80, 920, 760, { at: tAsk + 0.2 });
K.line(b7, [[100, 560], [180, 520], [250, 580], [330, 480], [400, 500], [480, 440]], { at: tAsk + 0.4, dur: 1.2 });
K.punch("لا.", T("الإجابة"), T("التحليل", 62) - 0.04, { size: 220 });
const tOdds = T("احتمالات", 63.5);
K.dot(b7, 480, 440, { at: T("بيساعدك", 62.8) });
K.dashed(b7, 480, 440, 900, 230, { at: tOdds, color: "#d5adef", dur: 0.6 });
K.dashed(b7, 480, 440, 900, 450, { at: tOdds + 0.15, color: "rgba(255,255,255,.7)", dur: 0.6 });
K.dashed(b7, 480, 440, 900, 680, { at: tOdds + 0.3, color: "#d5adef", dur: 0.6 });
K.text(b7, "احتمالات", { x: 500, y: 60, size: 84, head: true, color: "#d5adef", at: tOdds + 0.2 });
const noGuar = K.text(b7, "مش ضمان", { x: 500, y: 160, size: 54, at: T("بيضمن") });

// ---------- 9. use it next to market understanding and your risk tolerance ----------
const tUse = T("تستخدمه");
K.cam(tUse - 0.3, "use");
K.img(b8, OBJ + "kanz-balance-scale-v01.png", { x: 500, y: 430, w: 520, at: tUse });
K.tag(b8, "التحليل الفني", { x: 500, y: 110, lav: true, at: tUse + 0.2 });
K.tag(b8, "فهمك للسوق", { x: 770, y: 720, at: T("فهمك") });
K.tag(b8, "المخاطر اللي تقدر تتحملها", { x: 280, y: 720, at: T("والمخاطر") });

// ---------- outro ----------
const tEnd = window.DURATION + 0.05;
K.captionsTo = tEnd;
K.wipe(tEnd, { hold: true });
K.tl.set("#logo", { zIndex: 30 }, tEnd);
K.tl.to("#logo", { left: 390, top: 900, width: 300, duration: 0.5, ease: "power3.inOut" }, tEnd + 0.25);
K.tl.to("#headline", { autoAlpha: 0, duration: 0.2 }, tEnd);
K.duration = tEnd + 1.6;
