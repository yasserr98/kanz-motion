/* Current copy example (2026-10-20): PACE-1..6, HOOK-1..3, EXPL-1, TXT-3/6/7, SND-5. The delivered Reel used an older look.
 * us-dollar-decisions, PACE version (2026-10-13): the delivered v4 rebuilt with every change from the short-form
 * pacing study (Kanz repo reports/shorts-pacing-study-2026-10-13). Same script, voice take, objects and look; only
 * timing, camera and continuity change, plus the decisions Ahmed asked to apply ("apply all the changes"):
 *  - voice retimed: long pauses cut to 0.3 s and 1.08x tempo (engine/retime.py), 75.0 -> 65.8 s
 *  - K.pace({ defaults: "2026-10-18" }): 24 fps motion, camera drift, moves inside the voice's pauses, room-tone bed
 *  - every board arrives built (K.go + `at: g.lead`), starts close on its first object and pulls out
 *  - one dollar is carried from board to board instead of being rebuilt; obsolete objects dim, never clear
 *  - hook hero settles from oversized from frame 1; no caption under the question headline
 *  - three paper chapters (mechanism, key idea, "one factor"); no snap zooms (PACE-5)
 *  - ends 0.4 s after the last word (PACE-6, 2026-10-18: the last line builds its own diagram; no cut back to the hook,
 *    no silent tail). The Fed's rate and the cost of making it rise as growing bars, not arrow icons (EXPL-1)
 * Lint pass (2026-10-20, `lint.py --strict` clean): the patterns every new scene copies.
 *  - TXT-6: board headlines are marked headline(...) (data-role="headline"); whatever sits under one starts K.GAP below it
 *  - TXT-3: a label names what the caption doesn't say (مرتبك بالجنيه, الاحتياطي الفيدرالي, مشتري مصري), never the caption
 *  - TXT-7: a label lands early enough to stay 0.8 s on screen before the camera leaves its board
 *  - SND-5: one cue per visual event. A board's arrival is one event: chapter turns keep the K.world paper sound and pass
 *    `sfx: false` to K.go; the object landing with the camera (`at: g.lead`) is silent; a label that names a thing
 *    as it appears is silent; marks drawn with their object are silent; quick runs (three notes, a pile) get one cue
 *  - the punch dims the board's tags and marks under it, so nothing reads through the dark
 * Delivered v4 stays the reference: projects/us-dollar-decisions.
 */
const { N, T } = K;
const tl = K.tl;
const OBJ = "../../library/objects/";
const L = "#d5adef", RED = "#e5534b";
const WHITE = "rgba(255,255,255,.55)";
const USD = OBJ + "kanz-usd-banknote-v01.png";
const headline = (el) => { el.dataset.role = "headline"; return el; }; // TXT-6: lint keeps everything K.GAP below it

K.look();
K.pace({ defaults: "2026-10-18" });

// ---------- world: snake layout, neighbours 1,100 px apart in a row, rows 1,800 apart, no diagonal whips ----------
const B = {
  hook: K.board("hook", 0, 0), egp: K.board("egp", -1100, 0), border: K.board("border", -2200, 0),
  fed: K.board("fed", -2200, 1800), demand: K.board("demand", -1100, 1800), trade: K.board("trade", 0, 1800),
  debt: K.board("debt", 0, 3600), web: K.board("web", -1100, 3600), made: K.board("made", -2200, 3600),
  factor: K.board("factor", -2200, 5400), bill: K.board("bill", -1100, 5400),
};
K.cam(0, "hook");

// ---------- 1. hook: question headline + one hero, complete from frame 1; the hero settles from oversized ----------
// The hero sits K.GAP under the three-line headline even while it settles (TXT-6), so it is lower and settles from 1.2x.
const gEgp = K.go(T("إنت"), "egp", { scale: 1.32, dx: 230, dy: -70 }); // start close on the salary envelope
K.headline([{ html: "ليه رفع سعر الفايدة" }, { html: "في أمريكا ممكن يأثّر" }, { html: "على فلوسك؟", kw: true }], { out: gEgp.start });
K.captionsFrom = T("إنت"); // the headline already says the question: captions start with the next line, never under it
K.glow(B.hook, 500, 665, 820, { out: gEgp.start });
K.shadow(B.hook, 500, 835, 470, { out: gEgp.start });
const dollar = K.img(B.hook, USD, { x: 500, y: 665, w: 560, rot: -4, shadow: false });
K.settle(dollar, 0, { fromScale: 1.2, fromY: 70, dur: 1.2 });

// ---------- 2. you earn and spend in pounds; maybe you never bought a dollar ----------
// the hook dollar rides the move and waits where the "never bought a dollar" line will need it: gone within 0.2 s (it
// would cross the first label and, under the close framing, the captions), dim once the camera pulls out
K.carry(dollar, "egp", gEgp.start, { x: 500, y: 720, w: 240, rot: -2, dur: 0.55 });
tl.to(dollar, { opacity: 0, duration: 0.2, ease: "power1.in" }, gEgp.start);
K.img(B.egp, OBJ + "kanz-salary-envelope-v01.png", { x: 760, y: 330, w: 420, at: gEgp.lead, enter: "fly", sfx: false });
const egpLabels = [K.text(B.egp, "مرتبك بالجنيه", { x: 760, y: 585, size: 58, head: true, at: gEgp.lead })];
const tSpend = N("وبتصرف");
K.frame(tSpend - 0.25, "egp"); // pull out to the whole board as the second idea arrives
tl.to(dollar, { opacity: 0.3, duration: 0.4 }, tSpend - 0.25);
K.img(B.egp, OBJ + "kanz-grocery-basket-v01.png", { x: 260, y: 330, w: 400, at: tSpend - 0.1, enter: "fly", fromX: -60 });
egpLabels.push(K.text(B.egp, "مصاريفك بالجنيه", { x: 260, y: 585, size: 58, head: true, at: N("بالجنيه") }));
K.img(B.egp, OBJ + "kanz-egp-banknote-v01.png", { x: 500, y: 130, w: 300, at: tSpend + 0.3, shadow: false });
const tNever = N("اشتريت");
tl.to(dollar, { opacity: 1, duration: 0.3 }, tNever - 0.1);
K.tag(B.egp, "ولا دولار", { x: 760, y: 780, size: 42, at: tNever }); // early enough to read before the camera leaves
K.strike(B.egp, 380, 765, 620, 675, { at: N("دولار") + 0.1, color: "#fff" });
K.fg(B.egp, OBJ + "kanz-egp-banknote-stack-v01.png", { x: 980, y: 860, w: 360, at: gEgp.start });

// ---------- 3. the dollar does not stop at America's border ----------
const gBorder = K.go(T("عشان", tNever), "border", { scale: 1.2, dy: -20 });
K.dim(egpLabels, gBorder.start, 0, 0.2); // the carried dollar crosses them on its way out
K.carry(dollar, "border", gBorder.start, { x: 640, y: 370, w: 260, rot: 0, opacity: 1, dur: 0.55 });
K.img(B.border, OBJ + "kanz-map-usa-v01.png", { x: 660, y: 360, w: 640, at: gBorder.lead, shadow: false, enter: "fly", fromScale: 1.4, sfx: false });
K.glow(B.border, 640, 370, 420, { at: gBorder.arrive });
// pull out before the label: under the close framing its line sits in the caption band
const tNot = N("مش");
K.frame(tNot - 0.15, "border", { dur: 0.6 });
K.text(B.border, "بره أمريكا كمان", { x: 500, y: 815, size: 50, head: true, color: L, at: tNot + 0.1 });
const tOut = N("واقف");
tl.to(dollar, { x: "-=410", y: "+=50", rotation: -8, duration: 0.7, ease: "power2.inOut" }, tOut - 0.1);
K.sfx(tOut - 0.1, "whoosh", 0.3);
// three notes land around the map: one spread, one cue
[[170, 190], [150, 600], [400, 660]].forEach(([x, y], i) =>
  K.img(B.border, USD, { x, y, w: 190, at: tOut + 0.35 + i * 0.18, shadow: false, rot: -10 + i * 8, sfx: i ? false : undefined }));

// ---------- 4. paper chapter: the Fed raises rates; investors buy dollars and put their money there ----------
const tFed = N("لما");
const gFed = K.go(tFed, "fed", { scale: 1.28, dx: 170, dy: -40, dur: 0.6, sfx: false }); // the paper wipe is the sound
K.world(gFed.start, "paper");
K.carry(dollar, "fed", gFed.start, { x: 260, y: 300, w: 230, rot: -6, opacity: 0, dur: 0.6 }); // off-frame while close: hidden, not a stray at the edge
const fedBank = K.img(B.fed, OBJ + "kanz-bank-v01.png", { x: 700, y: 400, w: 480, at: gFed.lead, glow: true, enter: "fly", sfx: false });
// after the bank's fly-in (an oversized bank crosses the headline), so later than the board's lead window
const fedTitle = headline(K.text(B.fed, "الاحتياطي الفيدرالي", { x: 600, y: 80, size: 56, head: true, at: N("الأمريكي") - 0.2 }));
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
K.dim([fedBank, fedTitle, rateUp, rateTag], tPut - 0.4, 0, 0.3);
K.img(B.fed, OBJ + "kanz-map-usa-v01.png", { x: 680, y: 490, w: 540, at: tPut - 0.25, shadow: false, glow: 520 });
headline(K.text(B.fed, "فلوسهم في أمريكا", { x: 640, y: 120, size: 60, head: true, color: L, at: tPut - 0.2 }));
tl.to(buy, { x: 400, y: 180, scale: 0.85, duration: 0.8, ease: "power2.inOut" }, tPut + 0.1); // x/y, not left/top: K.carry reads left/top
K.arrow(B.fed, 360, 330, 520, 420, { at: tPut + 0.1, bend: 40, color: K.INK });

// ---------- 5. demand for dollars rises; the dollar gets stronger (still paper) ----------
const tDem = N("فالطلب");
const gDem = K.go(tDem, "demand", { scale: 1.15, dx: 0, dy: -20 }); // centred: the stack sits at the left edge
K.carry(buy, "demand", gDem.start, { x: 215, y: 520, w: 230, opacity: 1, dur: 0.5 }); // in view: the chart is about it
const rise = [2, 2.2, 2.1, 2.6, 3.1, 3.0, 3.8, 4.5, 4.4, 5.3, 6.2];
const ch = K.area(B.demand, { x: 650, y: 400, w: 580, h: 380, data: rise, min: 1.5, max: 7, at: gDem.lead, dur: 1.0, sfx: false });
headline(K.text(B.demand, "الطلب على الدولار", { x: 650, y: 90, size: 56, head: true, at: gDem.lead }));
K.tag(B.demand, "يزيد", { x: ch.x(8) - 40, y: ch.y(6.2), lav: true, size: 46, at: N("يزيد") });
const tStrong = N("والدولار");
K.frame(tStrong - 0.2, "demand", { scale: 1.1, dx: -70, dy: 40 }); // towards the stack as it becomes the subject
tl.to(buy, { opacity: 1, scale: "+=0.12", duration: 0.35, ease: "back.out(2)" }, tStrong);
K.glow(B.demand, 215, 520, 440, { at: tStrong });
// with the stack growing, not on "اقوى" itself: the camera leaves 0.2 s after that word (TXT-7)
K.text(B.demand, "أقوى", { x: 215, y: 780, size: 96, head: true, color: L, at: tStrong + 0.15, from: "pop", sfx: "hit", gain: 0.3 });

// ---------- 6. charcoal again: an Egyptian company buys from another country, both pay in dollars ----------
const tCo = N("ولما");
const gTrade = K.go(tCo, "trade", { scale: 1.3, dx: 230, dy: -50, sfx: false });
K.world(gTrade.start, "charcoal");
K.carry(buy, "trade", gTrade.start, { x: 500, y: 440, w: 230, opacity: 0, dur: 0.5 });
K.img(B.trade, OBJ + "kanz-company-trading-v01.png", { x: 760, y: 310, w: 460, at: gTrade.lead, enter: "fly", sfx: false });
const ring = K.pointer(B.trade);
const tMasr = N("مصرية");
ring.to(tMasr - 0.1, 760, 320, 500, 420);
const tradeMarks = [K.tag(B.trade, "مشتري مصري", { x: 770, y: 575, size: 44, at: tMasr - 0.1, sfx: false })];
const tGoods = N("بضاعة");
K.frame(tGoods - 0.25, "trade");
const goods = K.img(B.trade, OBJ + "kanz-raw-material-sack-v01.png", { x: 210, y: 380, w: 230, at: tGoods - 0.1 });
K.img(B.trade, OBJ + "kanz-company-office-v01.png", { x: 220, y: 290, w: 380, at: N("شركة") - 0.1, enter: "fly", fromX: -60 });
gsap.set(goods, { zIndex: 4 });
tradeMarks.push(K.arrow(B.trade, 330, 220, 660, 220, { at: tGoods + 0.3, bend: 50, color: WHITE }));
const tOther = N("تانية");
ring.to(tOther - 0.1, 220, 320, 420, 400);
tradeMarks.push(K.tag(B.trade, "بايع أجنبي", { x: 210, y: 560, size: 44, at: tOther - 0.1, sfx: false }));
const tBill1 = N("هيحاسبوا");
// the dollar comes back, glows and gets the ring in one beat (one cue: the ring's)
tl.to(buy, { opacity: 1, duration: 0.3 }, tBill1 - 0.1);
K.glow(B.trade, 500, 440, 520, { at: tBill1 - 0.1 });
ring.to(tBill1 - 0.1, 500, 440, 300, 300);
const tPay = N("بالدولار");
tradeMarks.push(K.arrow(B.trade, 620, 540, 380, 540, { at: tPay, bend: -40, sfx: false })); // inside the punch's riser
const tUS = N("أمريكا");
ring.out(tUS - 0.1);
// big type for the key sentence (review 2026-10-13): it was a 60 px label, and the dollar carried to the next board
// flew straight across it at 31.35 s. The punch holds until the move, so the carry happens behind it. The board's tags
// and marks go first, so none of them reads through the dark (text-on-text, covered-shape).
K.dim(tradeMarks, tUS - 0.1, 0, 0.1);
N("طرف");

// ---------- 7. companies and governments borrow in dollars but earn in another currency ----------
const tDebt = N("غير");
const gDebt = K.go(tDebt, "debt", { scale: 1.28, dx: 250, dy: 0, dur: 0.6 });
// held until the camera has landed: the debt board's icons fly in under it, never through the caption band
K.punch("أمريكا<br>مش طرف", tUS - 0.05, gDebt.arrive - 0.1, { size: 170, riser: true });
K.carry(buy, "debt", gDebt.start, { x: 470, y: 400, w: 220, opacity: 0.3, dur: 0.6 });
// both borrowers arrive with the camera (fill); their tags wait until it has landed, clear of the captions
K.img(B.debt, OBJ + "kanz-company-office-v01.png", { x: 800, y: 200, w: 340, at: gDebt.lead, enter: "fly", sfx: false });
K.img(B.debt, OBJ + "kanz-bank-v01.png", { x: 800, y: 570, w: 340, at: gDebt.lead, enter: "fly", fromY: 120, sfx: false });
K.tag(B.debt, "شركات", { x: 530, y: 200, size: 42, at: gDebt.arrive + 0.55, sfx: false });
K.tag(B.debt, "حكومات", { x: 530, y: 570, size: 42, at: N("والحكومات"), sfx: false });
const tBorrow = N("بتستلف");
K.frame(tBorrow - 0.25, "debt", { dx: 40 });
K.img(B.debt, OBJ + "kanz-loan-agreement-v01.png", { x: 300, y: 340, w: 300, at: tBorrow - 0.1, enter: "fly", fromX: -60 });
const tDebtUsd = N("بالدولار");
tl.to(buy, { opacity: 1, duration: 0.3 }, tDebtUsd - 0.1);
headline(K.text(B.debt, "قرض بالدولار", { x: 300, y: 80, size: 52, head: true, color: L, at: tDebtUsd + 0.1 }));
const tInc = N("دخلها");
K.img(B.debt, OBJ + "kanz-egp-banknote-stack-v01.png", { x: 300, y: 620, w: 240, at: tInc - 0.1 });
K.text(B.debt, "دخلها بالجنيه", { x: 300, y: 790, size: 46, head: true, at: tInc - 0.1 });

// ---------- 8. paper chapter, key idea: the dollar sits inside trade and debt; any change in it reaches them ----------
const tWeb = N("فالدولار");
const gWeb = K.go(tWeb, "web", { scale: 1.3, dy: 0, sfx: false });
K.world(gWeb.start, "paper");
K.carry(buy, "web", gWeb.start, { x: 500, y: 420, w: 360, opacity: 1, dur: 0.55 });
K.glow(B.web, 500, 420, 540, { at: gWeb.arrive });
// "the dollar is inside": routes spread from it to many countries as the board arrives, so the close open never shows
// a lone stack (lint fill, PACE-3, EXPL-1); trade and debts attach on their words, the extra routes fade at "تغيير"
const route = (x2, y2, bend) => {
  const mx = (500 + x2) / 2 - (y2 - 430) * bend, my = (430 + y2) / 2 + (x2 - 500) * bend;
  return Array.from({ length: 13 }, (_, i) => {
    const u = i / 12, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
    return [a * 500 + b * mx + c * x2, a * 430 + b * my + c * y2];
  });
};
const web = [], webDots = [];
[[170, 480, 0.12], [830, 480, -0.12], [250, 690, -0.15], [750, 690, 0.15], [500, 750, 0.1], [500, 200, -0.1]].forEach(([x, y, bend], i) => {
  const at = gWeb.lead + i * 0.06;
  web.push(K.line(B.web, route(x, y, bend), { at, dur: 0.4, color: K.INK, width: 4, ease: "power2.out" }));
  const d = K.el("div", "abs", B.web);
  gsap.set(d, { left: x - 12, top: y - 12, width: 24, height: 24, borderRadius: "50%", background: L, autoAlpha: 0 });
  tl.fromTo(d, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: "back.out(3)", immediateRender: false }, at + 0.35);
  webDots.push(d);
});
web.push(...webDots);
// trade and debts hang at the top corners, each named under its icon; the dashed link stays above the name
const tTrade = N("التجارة");
K.frame(tTrade - 0.3, "web");
K.dashed(B.web, 650, 290, 730, 225, { at: tTrade - 0.1, color: K.INK, sfx: false });
const sack = K.img(B.web, OBJ + "kanz-raw-material-sack-v01.png", { x: 830, y: 190, w: 200, at: tTrade, shadow: false, enter: "fly" });
K.text(B.web, "التجارة", { x: 830, y: 330, size: 50, head: true, color: K.INK, at: tTrade });
const tDebts = N("والديون");
K.dashed(B.web, 350, 290, 270, 225, { at: tDebts - 0.1, color: K.INK, sfx: false });
const loan = K.img(B.web, OBJ + "kanz-loan-agreement-v01.png", { x: 170, y: 190, w: 210, at: tDebts, shadow: false, enter: "fly" });
K.text(B.web, "الديون", { x: 170, y: 330, size: 50, head: true, color: K.INK, at: tDebts });
const tCountries = N("بلاد");
const many = headline(K.text(B.web, "بين بلاد كتير", { x: 500, y: 80, size: 62, head: true, color: L, at: tCountries }));
tl.to(webDots, { scale: 1.5, duration: 0.18, yoyo: true, repeat: 1, stagger: 0.05, ease: "power1.inOut" }, tCountries); // the many countries
const tChange = N("تغيير");
tl.to([...web, many], { autoAlpha: 0, duration: 0.3 }, tChange - 0.2); // the countries' headline leaves with their routes
K.frame(tChange - 0.2, "web", { scale: 1.1, dy: 90 });
K.tag(B.web, "قيمته", { x: 690, y: 690, lav: true, size: 46, at: N("قيمته") });
K.tag(B.web, "سعر فايدته", { x: 300, y: 690, lav: true, size: 46, at: N("الاقتراض") }); // the cost of borrowing it is its rate
// the change reaches both: arrows sized to their targets (they stop 16 px short)
const tHit = N("يأثّر");
K.arrow(B.web, 610, 300, sack, { at: tHit, bend: 30, color: K.INK });
K.arrow(B.web, 390, 300, loan, { at: tHit, bend: -30, color: K.INK, sfx: false });

// ---------- 9. charcoal: even a product made in Egypt can use imported materials, so making it here costs more ----------
const tEven = N("وحتى");
const gMade = K.go(tEven, "made", { scale: 1.3, dx: 180, dy: -40, sfx: false });
K.world(gMade.start, "charcoal");
K.carry(buy, "made", gMade.start, { x: 520, y: 800, w: 170, opacity: 0, rot: -8, dur: 0.5 });
K.img(B.made, OBJ + "kanz-grocery-basket-v01.png", { x: 740, y: 410, w: 460, at: gMade.lead, enter: "fly", sfx: false });
N("المنتج");
K.img(B.made, OBJ + "kanz-price-tag-v01.png", { x: 870, y: 215, w: 160, at: N("غلي"), shadow: false, rot: 10 });
K.arrow(B.made, 760, 300, 760, 190, { at: K.T("غلي", tEven) + 0.2, bend: 0.001, color: RED, width: 9, sfx: false });
K.text(B.made, "سعره غلي عليك", { x: 740, y: 655, size: 52, head: true, at: K.T("عليك", tEven) });
const tEg = N("بيتصنّع");
K.frame(tEg - 0.3, "made", { dur: 0.6 }); // pull back to reveal the factory
K.img(B.made, OBJ + "kanz-factory-v01.png", { x: 260, y: 370, w: 360, at: tEg - 0.15, glow: true, enter: "fly", fromX: -60 });
K.tag(B.made, "صناعة مصرية", { x: 260, y: 600, size: 44, at: N("مصر") });
const tImp = N("خامات");
K.frame(tImp - 0.2, "made", { scale: 1.05, dx: -30, dy: 110 });
// imported parts: the container ship (approved 2026-10-17) instead of a raw-material sack
K.img(B.made, OBJ + "kanz-container-ship-v01.png", { x: 250, y: 780, w: 280, at: tImp, enter: "fly", fromX: -140, fromY: 0, fromScale: 1.1 });
tl.to(buy, { opacity: 1, duration: 0.3 }, N("مكوّنات") - 0.1);
const tImported = N("مستوردة");
K.tag(B.made, "مستوردة", { x: 690, y: 770, lav: true, size: 46, at: tImported });
K.arrow(B.made, 100, 690, 110, 470, { at: tImported + 0.35, bend: -30 });
const tCost = N("فتزيد");
K.frame(tCost - 0.2, "made");
headline(K.text(B.made, "تكلفة أعلى", { x: 500, y: 90, size: 60, head: true, color: L, at: tCost }));
// the cost climbs with the words: a red bar that grows on "فتزيد" and again on "تصنيعه" (EXPL-1)
const costUp = K.bar(B.made, { x: 490, y: 400, w: 46, h: 110, at: tCost + 0.1, dur: 0.4, color: RED, illustrative: true });
tl.to(costUp, { scaleY: 1.5, duration: 0.45, ease: "power2.out" }, N("تصنيعه"));

// ---------- 10. paper chapter: the US decision is one factor; its effect depends on each country ----------
const tFac = N("فالقرار");
const gFac = K.go(tFac, "factor", { scale: 1.35, dy: -150, sfx: false });
K.world(gFac.start, "paper");
// the bank arrives big enough to fill the close open, then makes room for the countries as the camera pulls out
const facBank = K.img(B.factor, OBJ + "kanz-bank-v01.png", { x: 500, y: 390, w: 440, at: gFac.lead, glow: true, enter: "fly", sfx: false });
headline(K.text(B.factor, "واحد من العوامل", { x: 500, y: 70, size: 76, head: true, color: L, at: N("عامل") }));
const tDiff = N("بيختلف");
K.frame(tDiff - 0.3, "factor");
tl.to(facBank, { scale: 0.72, y: -55, duration: 0.6, ease: "power2.inOut" }, tDiff - 0.3);
// one arrow + country per beat, 0.35 s apart: one cue each (the country's)
[["kanz-landmark-egypt-v01.png", 790], ["kanz-landmark-uk-v01.png", 500], ["kanz-landmark-japan-v01.png", 210]].forEach(([img, x], i) => {
  K.arrow(B.factor, 500, 520, x, 610, { at: tDiff + i * 0.35, bend: i === 1 ? 0.001 : (x > 500 ? 30 : -30), width: [10, 6, 3][i], color: K.INK, sfx: false });
  K.img(B.factor, OBJ + img, { x, y: 720, w: 210, at: tDiff + 0.1 + i * 0.35, enter: "fly", fromScale: 1.6 });
});

// ---------- 11. charcoal: no dollar in your pocket, but part of your bill is priced in dollars ----------
const tBill = N("وده");
const gBill = K.go(tBill, "bill", { scale: 1.25, dx: 220, sfx: false });
K.world(gBill.start, "charcoal");
const wal = K.img(B.bill, OBJ + "kanz-wallet-open-empty-v01.png", { x: 720, y: 360, w: 460, at: gBill.lead, glow: true, enter: "fly", sfx: false });
N("انك");
const noUsd = K.text(B.bill, "ولا دولار واحد", { x: 790, y: 590, size: 54, head: true, at: N("معاك") });
const tPart = N("جزء");
K.frame(tPart - 0.35, "bill", { dur: 0.6 });
K.img(B.bill, OBJ + "kanz-receipt-v01.png", { x: 300, y: 400, w: 420, at: tPart - 0.2, glow: true, enter: "fly", fromX: -60 });
const tYourBill = N("فاتورتك");
headline(K.text(B.bill, "فاتورتك", { x: 300, y: 80, size: 70, head: true, color: L, at: tYourBill }));
K.tl.to(wal, { left: 860, top: 300, scale: 0.6, opacity: 0.35, duration: 0.6, ease: "power2.inOut" }, tPart - 0.3);
K.dim(noUsd, tPart - 0.3, 0, 0.3);
// ---------- ending (PACE-6, 2026-10-18): the last line builds its own diagram into the last word, no cut back ----------
// The bill is a column; the dollar-priced part fills it on "بالدولار", then flows out as pounds that keep landing until
// "بالجنيه". The camera keeps pushing towards the pile to the end, and the video stops 0.4 s after the last word.
const bill = K.bar(B.bill, { x: 590, y: 640, w: 110, h: 400, at: tPart, dur: 0.5, outline: true, color: "rgba(255,255,255,.08)", illustrative: true, sfx: false });
const tUsd = N("بالدولار");
const usdPart = K.bar(B.bill, { x: 590, y: 640, w: 110, h: 170, at: tUsd - 0.1, dur: 0.5, color: L, illustrative: true });
K.tag(B.bill, "بالدولار", { x: 590, y: 195, lav: true, size: 44, at: tUsd + 0.1, sfx: false });
const tBefore = N("قبل");
const tLast = (window.TOKENS || []).slice(-1)[0].end;
K.frame(tBefore - 0.1, "bill", { scale: 1.12, dx: 110, dy: 50, dur: tLast + 0.4 - tBefore }); // a slow push into the end
K.text(B.bill, "بتدفعها بالجنيه", { x: 750, y: 800, size: 46, head: true, at: tBefore + 0.15 }); // 0.8 s before the end
const tReach = N("يوصلك");
K.arrow(B.bill, 650, 560, 730, 610, { at: tReach - 0.1, bend: -30 });
tl.to(usdPart, { scaleY: 0.35, duration: tLast - tReach, ease: "power1.in" }, tReach); // the dollar part drains into pounds
const pile = 6, stagger = (tLast - 0.3 - tReach) / (pile - 1); // K.stack: each note lands 0.3 s after its start
K.stack(B.bill, OBJ + "kanz-egp-banknote-v01.png", { x: 820, y: 640, n: pile, w: 210, step: 46, at: tReach, stagger, sfx: false });
K.sfx(tReach + 0.28, "coin", 0.2); // the pile gets two coins, its first and its last note, not one per note (SND-5)
K.sfx(tLast, "coin", 0.2);
K.duration = tLast + 0.4;
K.finish();
