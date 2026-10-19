/* us-dollar-decisions, PACE version (2026-10-13): the delivered v4 rebuilt with every change from the short-form
 * pacing study (Kanz repo reports/shorts-pacing-study-2026-10-13). Same script, voice take, objects and look; only
 * timing, camera and continuity change, plus the decisions Ahmed asked to apply ("apply all the changes"):
 *  - voice retimed: long pauses cut to 0.3 s and 1.08x tempo (engine/retime.py), 75.0 -> 65.8 s
 *  - K.pace(): 24 fps motion, camera drift between moves, 0.5 s moves inside the voice's pauses, room-tone bed
 *  - every board arrives built (K.go + `at: g.lead`), starts close on its first object and pulls out
 *  - one dollar is carried from board to board instead of being rebuilt; obsolete objects dim, never clear
 *  - hook hero settles from oversized from frame 1; no caption under the question headline
 *  - three paper chapters (mechanism, key idea, "one factor"); snap zooms on the emphasis words
 *  - ends 0.4 s after the last word (PACE-6, 2026-10-18: the last line builds its own diagram; no cut back to the hook,
 *    no silent tail). The Fed's rate and the cost of making it rise as growing bars, not arrow icons (EXPL-1)
 * Review fixes (v4 of this rebuild, 2026-10-13): "أمريكا مش طرف" as K.punch with the riser (the carried dollar crossed
 * it); debt board raised (حكومات sat under the caption); faint F01 off the edge; dollar stack beside the demand chart;
 * labels dimmed before the dollar leaves the salary board; price tag inside the frame; container ship for "مستوردة".
 * Delivered v4 stays the reference: projects/us-dollar-decisions.
 */
const { N, T } = K;
const tl = K.tl;
const OBJ = "../../library/objects/";
const L = "#d5adef", RED = "#e5534b";
const WHITE = "rgba(255,255,255,.55)";
const USD = OBJ + "kanz-usd-banknote-v01.png";

K.look();
K.pace();

// ---------- world: snake layout, neighbours 1,100 px apart in a row, rows 1,800 apart, no diagonal whips ----------
const B = {
  hook: K.board("hook", 0, 0), egp: K.board("egp", -1100, 0), border: K.board("border", -2200, 0),
  fed: K.board("fed", -2200, 1800), demand: K.board("demand", -1100, 1800), trade: K.board("trade", 0, 1800),
  debt: K.board("debt", 0, 3600), web: K.board("web", -1100, 3600), made: K.board("made", -2200, 3600),
  factor: K.board("factor", -2200, 5400), bill: K.board("bill", -1100, 5400),
};
K.cam(0, "hook");

// ---------- 1. hook: question headline + one hero, complete from frame 1; the hero settles from oversized ----------
const gEgp = K.go(T("إنت"), "egp", { scale: 1.32, dx: 230, dy: -70 }); // start close on the salary envelope
K.headline([{ html: "ليه رفع سعر الفايدة" }, { html: "في أمريكا ممكن يأثّر" }, { html: "على فلوسك؟", kw: true }], { out: gEgp.start });
K.captionsFrom = gEgp.start; // the headline already says the question: no duplicate caption under it
K.glow(B.hook, 500, 500, 870, { out: gEgp.start });
const hookSh = K.shadow(B.hook, 500, 680, 500, { out: gEgp.start });
const dollar = K.img(B.hook, USD, { x: 500, y: 500, w: 600, float: true, rot: -5, shadow: false });
K.settle(dollar, 0, { fromScale: 1.45, fromY: 70, dur: 1.2 });

// ---------- 2. you earn and spend in pounds; maybe you never bought a dollar ----------
// the hook dollar rides the move and waits, dimmed, where the "never bought a dollar" line will need it
K.carry(dollar, "egp", gEgp.start, { x: 500, y: 720, w: 240, rot: -2, opacity: 0.3, dur: 0.55 });
K.img(B.egp, OBJ + "kanz-salary-envelope-v01.png", { x: 760, y: 330, w: 380, at: gEgp.lead, enter: "fly" });
const egpLabels = [K.text(B.egp, "بتقبض بالجنيه", { x: 760, y: 570, size: 58, head: true, at: N("بالجنيه", 0) })];
const tSpend = N("وبتصرف");
K.frame(tSpend - 0.25, "egp"); // pull out to the whole board as the second idea arrives
K.img(B.egp, OBJ + "kanz-grocery-basket-v01.png", { x: 260, y: 330, w: 400, at: tSpend - 0.1, enter: "fly", fromX: -60 });
const egpLabel2 = K.text(B.egp, "وبتصرف بالجنيه", { x: 260, y: 570, size: 58, head: true, at: N("بالجنيه") });
K.img(B.egp, OBJ + "kanz-egp-banknote-v01.png", { x: 500, y: 130, w: 300, at: tSpend + 0.3, shadow: false });
const tNever = N("اشتريت");
tl.to(dollar, { opacity: 1, duration: 0.3 }, tNever - 0.1);
K.strike(B.egp, 380, 765, 620, 675, { at: N("دولار") + 0.1, color: "#fff" });
K.tag(B.egp, "ولا دولار", { x: 760, y: 780, size: 42, at: K.T("حياتك") });
K.fg(B.egp, OBJ + "kanz-egp-banknote-stack-v01.png", { x: 980, y: 860, w: 360, at: gEgp.start });

// ---------- 3. the dollar does not stop at America's border ----------
const gBorder = K.go(T("عشان", tNever), "border", { scale: 1.2, dy: -20 });
K.dim([...egpLabels, egpLabel2], gBorder.start, 0, 0.2); // the carried dollar crosses them on its way out
K.carry(dollar, "border", gBorder.start, { x: 640, y: 370, w: 260, rot: 0, opacity: 1, dur: 0.55 });
K.img(B.border, OBJ + "kanz-map-usa-v01.png", { x: 660, y: 360, w: 640, at: gBorder.lead, shadow: false, enter: "fly", fromScale: 1.4 });
K.glow(B.border, 640, 370, 420, { at: gBorder.arrive });
N("الدولار");
const tOut = N("واقف");
K.frame(tOut - 0.15, "border", { dur: 0.6 });
tl.to(dollar, { x: "-=410", y: "+=50", rotation: -8, duration: 0.7, ease: "power2.inOut" }, tOut - 0.1);
K.sfx(tOut - 0.1, "whoosh", 0.3);
[[170, 190], [150, 640], [430, 720]].forEach(([x, y], i) =>
  K.img(B.border, USD, { x, y, w: 200, at: tOut + 0.35 + i * 0.18, shadow: false, rot: -10 + i * 8 }));
K.text(B.border, "مش واقف عند حدود أمريكا", { x: 500, y: 830, size: 50, head: true, color: L, at: N("حدود") });

// ---------- 4. paper chapter: the Fed raises rates; investors buy dollars and put their money there ----------
const tFed = N("لما");
const gFed = K.go(tFed, "fed", { scale: 1.28, dx: 170, dy: -40, dur: 0.6 });
K.world(gFed.start, "paper");
K.carry(dollar, "fed", gFed.start, { x: 260, y: 300, w: 230, rot: -6, opacity: 0, dur: 0.6 }); // off-frame while close: hidden, not a stray at the edge
const fedBank = K.img(B.fed, OBJ + "kanz-bank-v01.png", { x: 700, y: 380, w: 520, at: gFed.lead, glow: true, enter: "fly" });
const fedTitle = K.text(B.fed, "البنك المركزي الأمريكي", { x: 600, y: 80, size: 56, head: true, at: N("الأمريكي") - 0.3 });
const tRaise = N("يرفع");
// the rate rises as a bar that grows, then steps up again on "الفايدة" (EXPL-1: a mechanism moves, not an arrow icon)
const rateUp = K.bar(B.fed, { x: 860, y: 540, w: 70, h: 110, at: tRaise, dur: 0.35, color: L, illustrative: true });
const tRate = N("الفايدة");
tl.to(rateUp, { scaleY: 1.9, duration: 0.45, ease: "power2.out" }, tRate);
const rateTag = K.tag(B.fed, "الفايدة", { x: 840, y: 590, lav: true, size: 44, at: tRate });
const tInv = N("مستثمرين");
K.frame(tInv - 0.3, "fed");
K.img(B.fed, OBJ + "kanz-npc-m01-counting-money-v01.png", { x: 210, y: 560, w: 380, at: tInv - 0.1, enter: "fly", fromX: -80 });
K.bgObj(B.fed, OBJ + "kanz-npc-f01-neutral-v01.png", { x: 125, y: 470, w: 260, opacity: 0.28, at: tInv + 0.2 });
const tBuy = N("دولارات");
const buy = K.img(B.fed, OBJ + "kanz-usd-banknote-stack-v01.png", { x: 260, y: 300, w: 260, at: tBuy, shadow: false });
tl.to(dollar, { opacity: 0, duration: 0.2 }, tBuy); // the carried note becomes the investors' stack
const tPut = N("ويحطّوا");
K.dim([fedBank, fedTitle, rateUp, rateTag], tPut - 0.35, 0, 0.3);
K.img(B.fed, OBJ + "kanz-map-usa-v01.png", { x: 680, y: 400, w: 620, at: tPut - 0.25, shadow: false, glow: 600 });
tl.to(buy, { x: 420, y: 100, scale: 0.85, duration: 0.8, ease: "power2.inOut" }, tPut + 0.1); // x/y, not left/top: K.carry reads left/top
K.arrow(B.fed, 360, 300, 520, 380, { at: tPut + 0.1, bend: 40, color: K.INK });
K.text(B.fed, "فلوسهم في أمريكا", { x: 640, y: 120, size: 60, head: true, color: L, at: N("هناك") });

// ---------- 5. demand for dollars rises; the dollar gets stronger (still paper) ----------
const tDem = N("فالطلب");
const gDem = K.go(tDem, "demand", { scale: 1.15, dx: 0, dy: -20 }); // centred: the stack sits at the left edge
K.carry(buy, "demand", gDem.start, { x: 215, y: 520, w: 230, opacity: 1, dur: 0.5 }); // in view: the chart is about it
const rise = [2, 2.2, 2.1, 2.6, 3.1, 3.0, 3.8, 4.5, 4.4, 5.3, 6.2];
const ch = K.area(B.demand, { x: 650, y: 360, w: 580, h: 420, data: rise, min: 1.5, max: 7, at: gDem.lead, dur: 1.0 });
K.text(B.demand, "الطلب على الدولار", { x: 650, y: 90, size: 56, head: true, at: gDem.lead + 0.1 });
K.tag(B.demand, "يزيد", { x: ch.x(10) - 70, y: ch.y(6.2) - 70, lav: true, size: 46, at: N("يزيد") });
const tStrong = N("والدولار");
K.frame(tStrong - 0.2, "demand", { scale: 1.1, dx: -70, dy: 40 }); // towards the stack as it becomes the subject
tl.to(buy, { opacity: 1, scale: "+=0.12", duration: 0.35, ease: "back.out(2)" }, tStrong);
K.glow(B.demand, 215, 520, 440, { at: tStrong });
const tStronger = N("اقوى");
K.text(B.demand, "أقوى", { x: 215, y: 780, size: 96, head: true, color: L, at: tStronger - 0.1, from: "pop", sfx: "hit", gain: 0.3 });
K.snap(tStronger, 1.3, 0.55);

// ---------- 6. charcoal again: an Egyptian company buys from another country, both pay in dollars ----------
const tCo = N("ولما");
const gTrade = K.go(tCo, "trade", { scale: 1.3, dx: 230, dy: -50 });
K.world(gTrade.start, "charcoal");
K.carry(buy, "trade", gTrade.start, { x: 500, y: 440, w: 230, opacity: 0, dur: 0.5 });
K.img(B.trade, OBJ + "kanz-company-trading-v01.png", { x: 780, y: 320, w: 420, at: gTrade.lead, enter: "fly" });
const ring = K.pointer(B.trade);
ring.to(N("مصرية") - 0.1, 780, 330, 470, 400);
K.tag(B.trade, "شركة مصرية", { x: 790, y: 560, size: 44, at: K.T("مصرية", tCo) });
const tGoods = N("بضاعة");
K.frame(tGoods - 0.25, "trade");
const goods = K.img(B.trade, OBJ + "kanz-raw-material-sack-v01.png", { x: 210, y: 380, w: 230, at: tGoods - 0.1 });
K.img(B.trade, OBJ + "kanz-company-office-v01.png", { x: 220, y: 290, w: 380, at: N("شركة") - 0.1, enter: "fly", fromX: -60 });
gsap.set(goods, { zIndex: 4 });
const tOther = N("تانية");
K.tag(B.trade, "بلد تانية", { x: 210, y: 560, size: 44, at: tOther - 0.1 });
ring.to(tOther - 0.1, 220, 320, 420, 400);
K.arrow(B.trade, 330, 220, 660, 220, { at: tGoods + 0.3, bend: 50, color: WHITE });
const tBill1 = N("هيحاسبوا");
tl.to(buy, { opacity: 1, duration: 0.3 }, tBill1 - 0.1);
K.glow(B.trade, 500, 440, 520, { at: tBill1 - 0.1 });
const tPay = N("بالدولار");
ring.to(tPay - 0.1, 500, 440, 300, 300);
K.arrow(B.trade, 620, 540, 380, 540, { at: tPay, bend: -40 });
const tUS = N("أمريكا");
ring.out(tUS - 0.1);
// big type for the key sentence (review 2026-10-13): it was a 60 px label, and the dollar carried to the next board
// flew straight across it at 31.35 s. The punch holds until the move, so the carry happens behind it.
N("طرف");

// ---------- 7. companies and governments borrow in dollars but earn in another currency ----------
const tDebt = N("غير");
const gDebt = K.go(tDebt, "debt", { scale: 1.28, dx: 250, dy: 0, dur: 0.6 });
K.punch("أمريكا<br>مش طرف", tUS - 0.05, gDebt.start + 0.25, { size: 170, riser: true });
K.carry(buy, "debt", gDebt.start, { x: 470, y: 400, w: 220, opacity: 0.3, dur: 0.6 });
K.img(B.debt, OBJ + "kanz-company-office-v01.png", { x: 800, y: 200, w: 260, at: gDebt.lead, enter: "fly" });
K.tag(B.debt, "شركات", { x: 800, y: 365, size: 42, at: N("الشركات") + 0.1 });
K.img(B.debt, OBJ + "kanz-bank-v01.png", { x: 800, y: 520, w: 260, at: N("والحكومات") - 0.1, enter: "fly", fromY: 120 });
K.tag(B.debt, "حكومات", { x: 800, y: 680, size: 42, at: K.T("والحكومات", tDebt) + 0.1 });
const tBorrow = N("بتستلف");
K.frame(tBorrow - 0.25, "debt");
K.img(B.debt, OBJ + "kanz-loan-agreement-v01.png", { x: 330, y: 300, w: 360, at: tBorrow - 0.1, enter: "fly", fromX: -60 });
const tDebtUsd = N("بالدولار");
tl.to(buy, { opacity: 1, duration: 0.3 }, tDebtUsd - 0.1);
K.text(B.debt, "قرض بالدولار", { x: 330, y: 80, size: 52, head: true, color: L, at: tDebtUsd + 0.1 });
const tInc = N("دخلها");
K.img(B.debt, OBJ + "kanz-egp-banknote-stack-v01.png", { x: 330, y: 640, w: 300, at: tInc });
K.text(B.debt, "دخلها بعملة مختلفة", { x: 330, y: 820, size: 46, head: true, at: N("بعملة") });

// ---------- 8. paper chapter, key idea: the dollar sits inside trade and debt; any change in it reaches them ----------
const tWeb = N("فالدولار");
const gWeb = K.go(tWeb, "web", { scale: 1.3, dy: 0 });
K.world(gWeb.start, "paper");
K.carry(buy, "web", gWeb.start, { x: 500, y: 430, w: 400, opacity: 1, dur: 0.55 });
K.glow(B.web, 500, 430, 580, { at: gWeb.arrive });
const tTrade = N("التجارة");
K.frame(tTrade - 0.3, "web");
K.dashed(B.web, 640, 380, 790, 260, { at: tTrade - 0.1, color: K.INK });
K.img(B.web, OBJ + "kanz-raw-material-sack-v01.png", { x: 830, y: 190, w: 200, at: tTrade, shadow: false, enter: "fly" });
K.text(B.web, "التجارة", { x: 830, y: 330, size: 50, head: true, color: K.INK, at: tTrade });
const tDebts = N("والديون");
K.dashed(B.web, 360, 380, 210, 260, { at: tDebts - 0.1, color: K.INK });
K.img(B.web, OBJ + "kanz-loan-agreement-v01.png", { x: 170, y: 190, w: 210, at: tDebts, shadow: false, enter: "fly" });
K.text(B.web, "الديون", { x: 170, y: 330, size: 50, head: true, color: K.INK, at: tDebts });
K.text(B.web, "بين بلاد كتير", { x: 500, y: 80, size: 62, head: true, color: L, at: N("بلاد") });
const tChange = N("تغيير");
K.frame(tChange - 0.2, "web", { scale: 1.1, dy: 90 });
K.tag(B.web, "قيمته", { x: 690, y: 650, lav: true, size: 46, at: N("قيمته") });
K.tag(B.web, "تكلفة الاقتراض بيه", { x: 300, y: 650, lav: true, size: 46, at: N("الاقتراض") });
const tHit = N("يأثّر");
[[790, 260], [210, 260]].forEach(([x, y], i) => K.arrow(B.web, 500 + (i ? -110 : 110), 330, x + (i ? 40 : -40), y + 30, { at: tHit + i * 0.15, bend: i ? -30 : 30, color: K.INK }));
K.text(B.web, "ممكن يأثّر عليها", { x: 500, y: 790, size: 56, head: true, color: K.INK, at: tHit + 0.1 });

// ---------- 9. charcoal: even a product made in Egypt can use imported materials, so making it here costs more ----------
const tEven = N("وحتى");
const gMade = K.go(tEven, "made", { scale: 1.3, dx: 180, dy: -40 });
K.world(gMade.start, "charcoal");
K.carry(buy, "made", gMade.start, { x: 520, y: 800, w: 170, opacity: 0, rot: -8, dur: 0.5 });
K.img(B.made, OBJ + "kanz-grocery-basket-v01.png", { x: 740, y: 330, w: 460, at: gMade.lead, enter: "fly" });
N("المنتج");
K.img(B.made, OBJ + "kanz-price-tag-v01.png", { x: 820, y: 175, w: 200, at: N("غلي"), shadow: false, rot: 10 });
K.arrow(B.made, 875, 330, 875, 230, { at: K.T("غلي", tEven) + 0.2, bend: 0.001, color: RED, width: 9 });
K.text(B.made, "سعره غلي عليك", { x: 740, y: 580, size: 52, head: true, at: K.T("عليك", tEven) });
const tEg = N("بيتصنّع");
K.frame(tEg - 0.3, "made", { dur: 0.6 }); // pull back to reveal the factory
K.img(B.made, OBJ + "kanz-factory-v01.png", { x: 260, y: 330, w: 400, at: tEg - 0.15, glow: true, enter: "fly", fromX: -60 });
K.tag(B.made, "بيتصنّع في مصر", { x: 260, y: 580, size: 44, at: N("مصر") });
const tImp = N("خامات");
K.frame(tImp - 0.2, "made", { scale: 1.05, dx: -30, dy: 110 });
// imported parts: the container ship (Codex candidate 2026-10-13) instead of a raw-material sack
K.img(B.made, OBJ + "kanz-container-ship-v01.png", { x: 250, y: 770, w: 320, at: tImp, enter: "fly", fromX: -80 });
tl.to(buy, { opacity: 1, duration: 0.3 }, N("مكوّنات") - 0.1);
K.tag(B.made, "مستوردة", { x: 690, y: 770, lav: true, size: 46, at: N("مستوردة") });
K.arrow(B.made, 100, 690, 110, 470, { at: K.T("مستوردة", tEven) + 0.3, bend: -30 });
const tCost = N("فتزيد");
K.frame(tCost - 0.2, "made");
K.text(B.made, "تكلفة تصنيعه تزيد", { x: 500, y: 90, size: 60, head: true, color: L, at: tCost });
// the cost climbs with the words: a red bar that grows on "فتزيد" and again on "تصنيعه" (EXPL-1)
const costUp = K.bar(B.made, { x: 460, y: 330, w: 46, h: 110, at: tCost + 0.1, dur: 0.4, color: RED, illustrative: true });
tl.to(costUp, { scaleY: 1.5, duration: 0.45, ease: "power2.out" }, N("تصنيعه"));

// ---------- 10. paper chapter: the US decision is one factor; its effect depends on each country ----------
const tFac = N("فالقرار");
const gFac = K.go(tFac, "factor", { scale: 1.35, dy: -150 });
K.world(gFac.start, "paper");
K.img(B.factor, OBJ + "kanz-bank-v01.png", { x: 500, y: 260, w: 340, at: gFac.lead, glow: true, enter: "fly" });
const tFactor = N("عامل");
K.text(B.factor, "عامل مؤثّر", { x: 500, y: 70, size: 76, head: true, color: L, at: tFactor });
K.snap(tFactor, 1.25, 0.6);
const tDiff = N("بيختلف");
K.frame(tDiff - 0.3, "factor");
[["kanz-landmark-egypt-v01.png", 790], ["kanz-landmark-uk-v01.png", 500], ["kanz-landmark-japan-v01.png", 210]].forEach(([img, x], i) => {
  K.arrow(B.factor, 500, 550, x, 640, { at: tDiff + i * 0.2, bend: i === 1 ? 0.001 : (x > 500 ? 30 : -30), width: [10, 6, 3][i], color: K.INK });
  K.img(B.factor, OBJ + img, { x, y: 770, w: 270, at: tDiff + 0.1 + i * 0.2, enter: "fly", fromScale: 1.6 });
});
K.text(B.factor, "حسب ظروف كل بلد", { x: 500, y: 485, size: 50, head: true, at: N("ظروف") - 0.2 });

// ---------- 11. charcoal: no dollar in your pocket, but part of your bill is priced in dollars ----------
const tBill = N("وده");
const gBill = K.go(tBill, "bill", { scale: 1.25, dx: 220 });
K.world(gBill.start, "charcoal");
const wal = K.img(B.bill, OBJ + "kanz-wallet-open-empty-v01.png", { x: 720, y: 360, w: 460, at: gBill.lead, glow: true, enter: "fly" });
N("انك");
const noUsd = K.text(B.bill, "ولا دولار واحد", { x: 790, y: 570, size: 54, head: true, at: N("دولار") });
const tPart = N("جزء");
K.frame(tPart - 0.35, "bill", { dur: 0.6 });
K.img(B.bill, OBJ + "kanz-receipt-v01.png", { x: 300, y: 400, w: 420, at: tPart - 0.2, glow: true, enter: "fly", fromX: -60 });
const tYourBill = N("فاتورتك");
K.text(B.bill, "فاتورتك", { x: 300, y: 80, size: 70, head: true, color: L, at: tYourBill });
K.snap(tYourBill, 1.25, 0.55);
K.tl.to(wal, { left: 860, top: 300, scale: 0.6, opacity: 0.35, duration: 0.6, ease: "power2.inOut" }, tPart - 0.3);
K.dim(noUsd, tPart - 0.3, 0, 0.3);
// ---------- ending (PACE-6, 2026-10-18): the last line builds its own diagram into the last word, no cut back ----------
// The bill is a column; the dollar-priced part fills it on "بالدولار", then flows out as pounds that keep landing until
// "بالجنيه". The camera keeps pushing towards the pile to the end, and the video stops 0.4 s after the last word.
const bill = K.bar(B.bill, { x: 590, y: 640, w: 110, h: 400, at: tPart, dur: 0.5, outline: true, color: "rgba(255,255,255,.08)", illustrative: true });
const tUsd = N("بالدولار");
const usdPart = K.bar(B.bill, { x: 590, y: 640, w: 110, h: 170, at: tUsd - 0.1, dur: 0.5, color: L, illustrative: true });
K.tag(B.bill, "بالدولار", { x: 590, y: 195, lav: true, size: 44, at: tUsd + 0.1 });
const tBefore = N("قبل");
const tLast = (window.TOKENS || []).slice(-1)[0].end;
K.frame(tBefore - 0.1, "bill", { scale: 1.12, dx: 110, dy: 50, dur: tLast + 0.4 - tBefore }); // a slow push into the end
const tReach = N("يوصلك");
K.arrow(B.bill, 650, 560, 730, 610, { at: tReach - 0.1, bend: -30 });
tl.to(usdPart, { scaleY: 0.35, duration: tLast - tReach, ease: "power1.in" }, tReach); // the dollar part drains into pounds
const tEgp = N("بالجنيه");
const pile = 6, stagger = (tLast - 0.3 - tReach) / (pile - 1); // K.stack: each note lands 0.3 s after its start
K.stack(B.bill, OBJ + "kanz-egp-banknote-v01.png", { x: 820, y: 640, n: pile, w: 210, step: 46, at: tReach, stagger });
K.text(B.bill, "يوصلك بالجنيه", { x: 800, y: 800, size: 50, head: true, at: tEgp });
K.duration = tLast + 0.4;
K.finish();
