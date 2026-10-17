/* "ليه قرار زي رفع سعر الفايدة في أمريكا ممكن يأثّر على فلوسك؟" (How US Dollar Decisions Affect Your Money):
 * Airtable Brief, voiced by the Ahmed Shaaban clone (ElevenLabs v4, 1.15). Look v2 + the
 * 2026-10-11 defaults (LOOK-V2 section 9): complete first frame, paper world for the key idea, takeaway ending,
 * smooth camera, sound mix 2, no logo. The voice says no figures, so nothing on screen carries a number: the
 * demand line is a shape with no axis values. USD objects copied from the approved Kanz explainer library.
 * v3 (Ahmed 2026-10-11): simple hook, US map (border + 'هناك'), company icons, country landmarks, 'يوصلك' re-voiced.
 * Sequential anchors: K.N finds each word after the previous one.
 */
const { N, T } = K;
const OBJ = "../../library/objects/";
const L = "#d5adef", RED = "#e5534b"; // red: genuine costs only
const WHITE = "rgba(255,255,255,.55)";

K.look();
K.camSmooth = true; // camera glides at 24 fps, graphics stay on twos (LOOK-V2 section 9)
K.mix = 2; // levelled + ducked SFX, never louder than the voice, -16 LUFS (LOOK-V2 section 9)
// ---------- world: boards advance right -> left, row by row ----------
const B = {
  hook: K.board("hook", 0, 0), egp: K.board("egp", -1400, 0), border: K.board("border", -2800, 0),
  fed: K.board("fed", 0, 1800), demand: K.board("demand", -1400, 1800), trade: K.board("trade", -2800, 1800),
  debt: K.board("debt", 0, 3600), web: K.board("web", -1400, 3600), made: K.board("made", -2800, 3600),
  factor: K.board("factor", 0, 5400), bill: K.board("bill", -1400, 5400),
};
K.cam(0, "hook");

// ---------- 1. hook (Ahmed 2026-10-11: simple hooks, now the rule): question headline + one hero object, nothing else ----------
K.headline([{ html: "ليه رفع سعر الفايدة" }, { html: "في أمريكا ممكن يأثّر" }, { html: "على فلوسك؟", kw: true }], { out: T("إنت") - 0.3 });
K.img(B.hook, OBJ + "kanz-usd-banknote-v01.png", { x: 500, y: 500, w: 600, glow: true, float: true, rot: -5 });
K.push(0.4, "hook", 1.12, 3.8);

// ---------- 2. you earn and spend in pounds; maybe you never bought a dollar ----------
const tYou = N("إنت");
K.cam(tYou - 0.3, "egp");
K.img(B.egp, OBJ + "kanz-salary-envelope-v01.png", { x: 760, y: 330, w: 380, at: N("بتقبض") });
K.text(B.egp, "بتقبض بالجنيه", { x: 760, y: 590, size: 58, head: true, at: N("بالجنيه") });
K.img(B.egp, OBJ + "kanz-grocery-basket-v01.png", { x: 260, y: 330, w: 400, at: N("وبتصرف") });
K.text(B.egp, "وبتصرف بالجنيه", { x: 260, y: 590, size: 58, head: true, at: N("بالجنيه") });
K.img(B.egp, OBJ + "kanz-egp-banknote-v01.png", { x: 500, y: 130, w: 300, at: K.T("بالجنيه", tYou), shadow: false });
const tNever = N("اشتريت");
const usd2 = K.img(B.egp, OBJ + "kanz-usd-banknote-v01.png", { x: 500, y: 770, w: 300, at: tNever, shadow: false });
K.strike(B.egp, 360, 820, 640, 720, { at: N("دولار") + 0.1, color: "#fff" });
K.tag(B.egp, "ولا دولار", { x: 760, y: 780, size: 42, at: K.T("حياتك") });
K.push(tYou + 0.6, "egp", 1.06, 4.5);
K.fg(B.egp, OBJ + "kanz-egp-banknote-stack-v01.png", { x: 980, y: 860, w: 360, at: tYou - 0.2 });

// ---------- 3. the dollar does not stop at America's border ----------
const tWhy = N("عشان");
K.cam(tWhy - 0.3, "border");
// Ahmed 2026-10-11: the map of America instead of a box; the dollar leaves it
K.img(B.border, OBJ + "kanz-map-usa-v01.png", { x: 660, y: 360, w: 640, at: tWhy, shadow: false });
const dollar = K.img(B.border, OBJ + "kanz-usd-banknote-v01.png", { x: 640, y: 370, w: 240, at: tWhy + 0.3, shadow: false, glow: 420 });
N("الدولار");
K.push(tWhy + 0.6, "border", 1.1, 2.0); // slow push on the map until the dollar leaves (lint: dead 10.75-13.5)
const tOut = N("واقف");
K.cam(tOut - 0.1, "border", { dur: 0.8, sfx: false });
K.tl.to(dollar, { left: 230, top: 420, rotation: -8, duration: 0.8, ease: "power2.inOut" }, tOut);
K.sfx(tOut, "whoosh", 0.3);
[[170, 190], [150, 640], [430, 720]].forEach(([x, y], i) =>
  K.img(B.border, OBJ + "kanz-usd-banknote-v01.png", { x, y, w: 200, at: tOut + 0.5 + i * 0.25, shadow: false, rot: -10 + i * 8 }));
K.text(B.border, "مش واقف عند حدود أمريكا", { x: 500, y: 830, size: 50, head: true, color: L, at: N("حدود") });

// ---------- 4. the Fed raises rates; investors buy dollars and put their money there ----------
const tFed = N("لما");
K.cam(tFed - 0.3, "fed");
const fedBank = K.img(B.fed, OBJ + "kanz-bank-v01.png", { x: 700, y: 380, w: 520, at: N("البنك") - 0.1, glow: true });
const fedTitle = K.text(B.fed, "البنك المركزي الأمريكي", { x: 600, y: 80, size: 56, head: true, at: N("الأمريكي") - 0.3 });
const tRaise = N("يرفع");
const rateUp = K.arrow(B.fed, 860, 520, 860, 330, { at: tRaise, bend: 0.001, width: 11 });
const rateTag = K.tag(B.fed, "الفايدة", { x: 840, y: 590, lav: true, size: 44, at: N("الفايدة") });
const tInv = N("مستثمرين");
K.img(B.fed, OBJ + "kanz-npc-m01-counting-money-v01.png", { x: 210, y: 560, w: 380, at: tInv - 0.1 });
K.bgObj(B.fed, OBJ + "kanz-npc-f01-neutral-v01.png", { x: 70, y: 470, w: 280, opacity: 0.28, at: tInv + 0.2 });
const buy = K.img(B.fed, OBJ + "kanz-usd-banknote-stack-v01.png", { x: 260, y: 300, w: 260, at: N("دولارات"), shadow: false });
const tPut = N("ويحطّوا");
// Ahmed 2026-10-11: "هناك" means in America (US assets), not inside the Fed: the bank gives way to the map
[fedBank, fedTitle, rateUp, rateTag].forEach((e) => K.out(e, tPut - 0.35));
K.img(B.fed, OBJ + "kanz-map-usa-v01.png", { x: 680, y: 400, w: 620, at: tPut - 0.2, shadow: false, glow: 600 });
K.tl.to(buy, { left: 680, top: 400, scale: 0.85, duration: 0.9, ease: "power2.inOut" }, tPut + 0.2);
K.arrow(B.fed, 360, 300, 520, 380, { at: tPut + 0.2, bend: 40 });
K.text(B.fed, "فلوسهم في أمريكا", { x: 640, y: 120, size: 60, head: true, color: L, at: N("هناك") });

// ---------- 5. demand for dollars rises; the dollar gets stronger ----------
const tDem = N("فالطلب");
K.cam(tDem - 0.3, "demand");
const rise = [2, 2.2, 2.1, 2.6, 3.1, 3.0, 3.8, 4.5, 4.4, 5.3, 6.2];
const ch = K.area(B.demand, { x: 600, y: 360, w: 680, h: 420, data: rise, min: 1.5, max: 7, at: tDem, dur: 1.4 });
K.text(B.demand, "الطلب على الدولار", { x: 600, y: 90, size: 56, head: true, at: tDem + 0.1 });
K.tag(B.demand, "يزيد", { x: ch.x(10) - 70, y: ch.y(6.2) - 70, lav: true, size: 46, at: N("يزيد") });
const tStrong = N("والدولار");
K.img(B.demand, OBJ + "kanz-usd-banknote-stack-v01.png", { x: 240, y: 520, w: 330, at: tStrong, glow: true });
K.text(B.demand, "أقوى", { x: 240, y: 780, size: 96, head: true, color: L, at: N("اقوى") - 0.1, from: "pop", sfx: "hit", gain: 0.3 });
K.push(tStrong + 0.3, "demand", 1.08, 2.0);

// ---------- 6. an Egyptian company buys from another country: both pay in dollars, America is not in the deal ----------
const tCo = N("ولما");
K.cam(tCo - 0.3, "trade");
K.img(B.trade, OBJ + "kanz-company-trading-v01.png", { x: 780, y: 320, w: 420, at: N("شركة") });
K.tag(B.trade, "شركة مصرية", { x: 790, y: 560, size: 44, at: N("مصرية") });
const goods = K.img(B.trade, OBJ + "kanz-raw-material-sack-v01.png", { x: 210, y: 380, w: 230, at: N("بضاعة") });
K.img(B.trade, OBJ + "kanz-company-office-v01.png", { x: 220, y: 290, w: 380, at: N("شركة") });
gsap.set(goods, { zIndex: 4 });
K.tag(B.trade, "بلد تانية", { x: 210, y: 560, size: 44, at: N("تانية") - 0.1 });
K.arrow(B.trade, 330, 220, 660, 220, { at: K.T("بضاعة", tCo) + 0.4, bend: 50, color: WHITE });
const tPay = N("بالدولار");
K.img(B.trade, OBJ + "kanz-usd-banknote-v01.png", { x: 500, y: 430, w: 300, at: K.T("هيحاسبوا", tCo), glow: 520, shadow: false });
K.arrow(B.trade, 620, 520, 380, 520, { at: tPay, bend: -40 });
const tUS = N("أمريكا");
K.text(B.trade, "أمريكا مش طرف", { x: 500, y: 760, size: 60, head: true, at: tUS });
K.push(tPay + 0.3, "trade", 1.06, 3.0);

// ---------- 7. companies and governments borrow in dollars but earn in another currency ----------
const tDebt = N("غير");
K.cam(tDebt - 0.3, "debt");
K.img(B.debt, OBJ + "kanz-company-office-v01.png", { x: 800, y: 250, w: 280, at: N("الشركات") });
K.tag(B.debt, "شركات", { x: 800, y: 430, size: 42, at: K.T("الشركات", tDebt) + 0.1 });
K.img(B.debt, OBJ + "kanz-bank-v01.png", { x: 800, y: 620, w: 280, at: N("والحكومات") });
K.tag(B.debt, "حكومات", { x: 800, y: 800, size: 42, at: K.T("والحكومات", tDebt) + 0.1 });
const tBorrow = N("بتستلف");
K.img(B.debt, OBJ + "kanz-loan-agreement-v01.png", { x: 330, y: 300, w: 360, at: tBorrow });
K.img(B.debt, OBJ + "kanz-usd-banknote-stack-v01.png", { x: 470, y: 400, w: 220, at: N("بالدولار"), shadow: false });
K.text(B.debt, "قرض بالدولار", { x: 330, y: 80, size: 52, head: true, color: L, at: K.T("بالدولار", tDebt) + 0.1 });
const tInc = N("دخلها");
K.img(B.debt, OBJ + "kanz-egp-banknote-stack-v01.png", { x: 330, y: 640, w: 300, at: tInc });
K.text(B.debt, "دخلها بعملة مختلفة", { x: 330, y: 820, size: 46, head: true, at: N("بعملة") });

// ---------- 8. key idea on paper: the dollar sits inside trade and debt; any change in it reaches them ----------
const tWeb = N("فالدولار");
K.cam(tWeb - 0.3, "web");
K.world(tWeb - 0.3, "paper");
K.img(B.web, OBJ + "kanz-usd-banknote-v01.png", { x: 500, y: 430, w: 400, at: tWeb, glow: true, shadow: false });
const tTrade = N("التجارة");
K.dashed(B.web, 640, 380, 790, 260, { at: tTrade - 0.1, color: K.INK });
K.img(B.web, OBJ + "kanz-raw-material-sack-v01.png", { x: 830, y: 190, w: 200, at: tTrade, shadow: false });
K.text(B.web, "التجارة", { x: 830, y: 330, size: 50, head: true, color: K.INK, at: tTrade });
const tDebts = N("والديون");
K.dashed(B.web, 360, 380, 210, 260, { at: tDebts - 0.1, color: K.INK });
K.img(B.web, OBJ + "kanz-loan-agreement-v01.png", { x: 170, y: 190, w: 210, at: tDebts, shadow: false });
K.text(B.web, "الديون", { x: 170, y: 330, size: 50, head: true, color: K.INK, at: tDebts });
K.text(B.web, "بين بلاد كتير", { x: 500, y: 80, size: 62, head: true, color: L, at: N("بلاد") });
const tChange = N("تغيير");
K.tag(B.web, "قيمته", { x: 690, y: 650, lav: true, size: 46, at: N("قيمته") });
K.tag(B.web, "تكلفة الاقتراض بيه", { x: 300, y: 650, lav: true, size: 46, at: N("الاقتراض") });
const tHit = N("يأثّر");
[[790, 260], [210, 260]].forEach(([x, y], i) => K.arrow(B.web, 500 + (i ? -110 : 110), 330, x + (i ? 40 : -40), y + 30, { at: tHit + i * 0.15, bend: i ? -30 : 30 }));
K.text(B.web, "ممكن يأثّر عليها", { x: 500, y: 790, size: 56, head: true, color: K.INK, at: tHit + 0.1 });
K.push(tChange, "web", 1.06, 3.5);

// ---------- 9. even a product made in Egypt can use imported materials, so making it here costs more too ----------
const tEven = N("وحتى");
K.world(tEven - 0.3, "charcoal");
K.cam(tEven - 0.3, "made", { scale: 1.3, dx: 230, dy: -40 }); // close on the product first
K.img(B.made, OBJ + "kanz-grocery-basket-v01.png", { x: 740, y: 330, w: 460, at: tEven - 0.1 });
N("المنتج");
const tag1 = K.img(B.made, OBJ + "kanz-price-tag-v01.png", { x: 900, y: 170, w: 200, at: N("غلي"), shadow: false, rot: 10 });
K.arrow(B.made, 960, 330, 960, 230, { at: K.T("غلي", tEven) + 0.2, bend: 0.001, color: RED, width: 9 });
K.text(B.made, "سعره غلي عليك", { x: 740, y: 580, size: 52, head: true, at: K.T("عليك", tEven) });
const tEg = N("بيتصنّع");
K.cam(tEg - 0.3, "made", { dur: 0.9 }); // pull back to reveal the factory
K.img(B.made, OBJ + "kanz-factory-v01.png", { x: 260, y: 330, w: 400, at: tEg, glow: true });
K.tag(B.made, "بيتصنّع في مصر", { x: 260, y: 580, size: 44, at: N("مصر") });
const tImp = N("خامات");
const sack = K.img(B.made, OBJ + "kanz-raw-material-sack-v01.png", { x: 160, y: 760, w: 220, at: tImp });
K.img(B.made, OBJ + "kanz-usd-banknote-v01.png", { x: 330, y: 790, w: 190, at: N("مكوّنات"), shadow: false, rot: -8 });
K.tag(B.made, "مستوردة", { x: 520, y: 760, lav: true, size: 46, at: N("مستوردة") });
K.arrow(B.made, 90, 680, 110, 470, { at: K.T("مستوردة", tEven) + 0.3, bend: -30 });
const tCost = N("فتزيد");
K.text(B.made, "تكلفة تصنيعه تزيد", { x: 500, y: 90, size: 60, head: true, color: L, at: tCost });
K.arrow(B.made, 460, 300, 460, 180, { at: tCost + 0.2, bend: 0.001, color: RED, width: 9 });
K.push(tCost + 0.4, "made", 1.06, 2.0);

// ---------- 10. the US decision is one factor; its effect depends on each country's conditions ----------
const tFac = N("فالقرار");
K.cam(tFac - 0.3, "factor");
K.img(B.factor, OBJ + "kanz-bank-v01.png", { x: 500, y: 260, w: 340, at: tFac, glow: true });
K.text(B.factor, "عامل مؤثّر", { x: 500, y: 70, size: 76, head: true, color: L, at: N("عامل") });
const tDiff = N("بيختلف");
// Ahmed 2026-10-11: different countries, shown by their landmarks
[["kanz-landmark-egypt-v01.png", 790], ["kanz-landmark-uk-v01.png", 500], ["kanz-landmark-japan-v01.png", 210]].forEach(([img, x], i) => {
  K.arrow(B.factor, 500, 550, x, 640, { at: tDiff + i * 0.25, bend: i === 1 ? 0.001 : (x > 500 ? 30 : -30), width: [10, 6, 3][i] });
  K.img(B.factor, OBJ + img, { x, y: 770, w: 270, at: tDiff + 0.15 + i * 0.25 });
});
K.text(B.factor, "حسب ظروف كل بلد", { x: 500, y: 485, size: 50, head: true, at: N("ظروف") - 0.2 });

// ---------- 11. no dollar in your pocket, but part of your bill is priced in dollars before it reaches you in pounds ----------
const tBill = N("وده");
K.cam(tBill - 0.3, "bill", { scale: 1.25, dx: 220 }); // close on the empty wallet
const wal = K.img(B.bill, OBJ + "kanz-wallet-open-empty-v01.png", { x: 720, y: 360, w: 460, at: tBill - 0.35, glow: true });
N("انك");
K.text(B.bill, "ولا دولار واحد", { x: 790, y: 570, size: 54, head: true, at: N("دولار") });
const tPart = N("جزء");
K.cam(tPart - 0.4, "bill", { dur: 0.9 });
K.img(B.bill, OBJ + "kanz-receipt-v01.png", { x: 300, y: 400, w: 420, at: tPart - 0.2, glow: true });
K.text(B.bill, "فاتورتك", { x: 300, y: 80, size: 70, head: true, color: L, at: N("فاتورتك") });
const tUsd = N("بالدولار");
K.rect(B.bill, 140, 300, 320, 120, { at: tUsd - 0.2, width: 6 });
K.img(B.bill, OBJ + "kanz-usd-cent-stack-v01.png", { x: 560, y: 330, w: 170, at: tUsd, shadow: false });
K.tag(B.bill, "بالدولار", { x: 560, y: 470, lav: true, size: 44, at: tUsd + 0.1 });
const tEgp = N("بالجنيه");
K.img(B.bill, OBJ + "kanz-egp-banknote-stack-v01.png", { x: 540, y: 700, w: 300, at: tEgp - 0.3 });
K.text(B.bill, "يوصلك بالجنيه", { x: 750, y: 780, size: 50, head: true, at: tEgp });
K.tl.to(wal, { left: 800, top: 330, scale: 0.72, opacity: 0.5, duration: 0.6, ease: "power2.inOut" }, tPart - 0.3);

// ---------- ending: back to the hook, the spoken thesis big, held ~2.4 s ----------
const tEnd = K.T("بالجنيه", tEgp) + 0.6;
K.cam(tEnd, "hook", { via: 0.42, dur: 0.9 });
K.takeaway(B.hook, "جزء من <span class='kw'>فاتورتك</span> بيتحسب بالدولار", { x: 500, y: 90, size: 96, at: tEnd + 0.6 });
K.duration = (window.DURATION || 75) + 2.4;
