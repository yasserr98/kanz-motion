/* "هل فعلًا العقار مبيخسرش؟": Ahmed's script, voiced by the Ahmed Shaaban Shorts clone (ElevenLabs v4, 1.15).
 * v3 (2026-10-10): look v2 (docs/LOOK-V2.md): bigger lit objects, depth, counts/stacks/piles, safe zones.
 * Ahmed removed the "مثال افتراضي" tags for this video (2026-10-10); the voice frames the figures as an
 * example ("خلينا نقول" / "لو"). Sequential anchors: K.N finds each word after the previous one.
 * No logo and no closing wipe (Ahmed, 2026-10-06/07).
 */
const { N, num } = K;
const OBJ = "../../library/objects/";
const card = (html, size = 56) => `<div style="height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 40px">
  <div class="head" style="font-size:${size}px;color:#141217;line-height:1.3">${html}</div></div>`;
const L = "#d5adef";

K.look();
// ---------- world: boards advance right -> left, row by row ----------
const B = {
  hook: K.board("hook", 0, 0), price: K.board("price", -1400, 0), buy: K.board("buy", -2800, 0),
  infl: K.board("infl", 0, 1400), costs: K.board("costs", -1400, 1400), pocket: K.board("pocket", -2800, 1400),
  sell: K.board("sell", 0, 2800), build: K.board("build", -1400, 2800), ways: K.board("ways", -2800, 2800),
  guar: K.board("guar", -1400, 4200), ask: K.board("ask", -2800, 4200),
};
K.cam(0, "hook");

// ---------- 1. hook: the house, big and lit, from the first frame ----------
const tQ = N("هل");
K.headline([{ html: "هل فعلًا العقار", at: tQ }, { html: "مبيخسرش؟", kw: true, at: N("مبيخسرش") }], { out: K.T("خلينا") - 0.25 });
K.bgObj(B.hook, OBJ + "kanz-house-v01.png", { x: 840, y: 300, w: 280, at: 0.1 });
K.img(B.hook, OBJ + "kanz-house-v01.png", { x: 500, y: 500, w: 580, at: 0.1, sfx: "pop", glow: true, float: true });
K.fg(B.hook, OBJ + "kanz-egp-banknote-stack-v01.png", { x: 70, y: 800, w: 420, at: 0.5 });
K.oval(B.hook, 500, 500, 340, 300, { at: K.T("مبيخسرش") + 0.1 });
K.push(0.4, "hook", 1.12, 2.0);

// ---------- 2. bought for a million; a year later 1.1 million; "+100 thousand… right?" ----------
const tLet = N("خلينا");
K.cam(tLet - 0.3, "price");
const house2 = K.img(B.price, OBJ + "kanz-house-v01.png", { x: 500, y: 250, w: 380, at: tLet + 0.3, glow: true });
K.push(N("شقة") - 0.2, "price", 1.1, 1.6);
const t1m = N("بمليون");
K.count(B.price, { x: 500, y: 540, from: 0, to: 1000000, at: t1m, dur: 0.8, size: 104, step: 1000,
  suffix: ' <span style="font-size:.45em">جنيه</span>', out: K.T("بقت") - 0.15 });
const tYear = N("سنة");
K.text(B.price, "بعد سنة", { x: 500, y: 440, size: 40, cls: "muted", at: tYear, out: K.T("كسبت") - 0.2 });
const t11 = N("بمليون");
K.count(B.price, { x: 500, y: 540, from: 1000000, to: 1100000, at: t11, dur: 1.0, size: 104, step: 1000,
  suffix: ' <span style="font-size:.45em">جنيه</span>' });
const tWin = N("كسبت");
K.fadeTo(house2, tWin - 0.15, 0, { scale: 0.9, dur: 0.25 });
K.text(B.price, num("+١٠٠") + " ألف", { x: 500, y: 240, size: 120, head: true, color: L, at: tWin, from: "pop", sfx: "coin", gain: 0.45 });
K.pile(B.price, OBJ + "kanz-coins-v01.png", { x: 500, y: 810, n: 6, w: 150, at: tWin + 0.15 });
K.oval(B.price, 500, 245, 260, 100, { at: N("صح") });

// ---------- 3. in pounds, yes. But what does that money buy? ----------
const tEgp = N("بالجنيه");
K.cam(tEgp - 0.3, "buy");
K.img(B.buy, OBJ + "kanz-egp-banknote-stack-v01.png", { x: 680, y: 470, w: 430, at: tEgp, sfx: "coin", glow: true });
const tBuy = N("تشتري");
K.arrow(B.buy, 520, 470, 430, 470, { at: tBuy - 0.25, bend: 30 });
K.img(B.buy, OBJ + "kanz-grocery-basket-v01.png", { x: 260, y: 480, w: 400, at: tBuy });
K.text(B.buy, "؟", { x: 260, y: 150, size: 220, head: true, color: L, at: N("إيه"), from: "pop", sfx: "hit", gain: 0.3 });
K.push(tBuy + 0.2, "buy", 1.1, 1.6, { dx: -120 });

// ---------- 4. prices up 20%: the flat needed 1.2 million to keep its purchasing power ----------
const tIf = N("لو");
K.cam(tIf - 0.3, "infl", { via: 0.42, dur: 1.0 });
K.axis(B.infl, 140, 860, 720, { at: tIf + 0.5 });
const tPct = N("٢٠٪");
K.text(B.infl, "الأسعار", { x: 800, y: 150, size: 40, cls: "muted", at: tPct - 0.1 });
K.text(B.infl, num("+٢٠٪"), { x: 800, y: 240, size: 96, head: true, color: L, at: tPct, from: "pop", sfx: "pop" });
// the v1/v2 bar chart, restored at Ahmed's request (2026-10-10): price vs what it needed to keep its value
const tFlat = N("شقتك");
K.bar(B.infl, { x: 560, y: 720, w: 190, h: 300, at: tFlat, color: "#c7c2cc" });
K.text(B.infl, "سعرها<br>مليون و١٠٠ ألف", { x: 560, y: 790, size: 34, w: 300, at: tFlat + 0.1 });
const tNeed = N("لمليون");
K.bar(B.infl, { x: 300, y: 720, w: 190, h: 390, at: tNeed, color: "rgba(255,255,255,0)", outline: true });
K.text(B.infl, "المطلوب<br>مليون و٢٠٠ ألف", { x: 300, y: 790, size: 34, w: 300, cls: "muted", at: tNeed + 0.1 });
K.dashed(B.infl, 430, 330, 430, 420, { at: N("تحافظ"), color: L, dur: 0.3 });
const tPower = N("قوتها");
K.tag(B.infl, "نفس القوة الشرائية", { x: 300, y: 285, lav: true, at: tPower });
K.push(tPower - 1.0, "infl", 1.12, 3.0);
K.tag(B.infl, "على الورق: زاد", { x: 560, y: 370, at: N("الورق") });
const tReal = N("الحقيقية");
K.text(B.infl, "قيمتها الحقيقية قلت", { x: 330, y: 165, size: 44, head: true, w: 340, color: L, at: tReal });

// ---------- 5. ...and that's before costs and any rental income ----------
const tCost = N("المصاريف");
K.cam(tCost - 0.45, "costs");
K.img(B.costs, OBJ + "kanz-receipt-v01.png", { x: 300, y: 380, w: 360, at: tCost - 0.1, sfx: "paper", glow: true });
K.tag(B.costs, "مصاريف", { x: 300, y: 630, at: tCost + 0.15, size: 44 });
const tRentIn = N("الإيجار");
K.img(B.costs, OBJ + "kanz-house-v01.png", { x: 670, y: 400, w: 330, at: tRentIn - 0.2 });
K.tag(B.costs, "دخل الإيجار؟", { x: 670, y: 630, lav: true, at: tRentIn, size: 44 });

// ---------- 6. "the price went up" doesn't mean the money is in your pocket ----------
const tPocket = N("كدة") - 0.3;
K.cam(tPocket, "pocket");
K.img(B.pocket, OBJ + "kanz-wallet-v01.png", { x: 500, y: 480, w: 540, at: tPocket + 0.5, glow: true, float: true });
K.fg(B.pocket, OBJ + "kanz-egp-banknote-stack-v01.png", { x: 960, y: 820, w: 380, at: tPocket + 0.7 });
K.text(B.pocket, "سعرها زاد…", { x: 500, y: 80, size: 84, head: true, at: N("كلمة") });
const tPk = N("جيبك");
K.oval(B.pocket, 500, 480, 330, 290, { at: tPk - 0.3, seed: 5 });
K.tag(B.pocket, "مش في جيبك", { x: 500, y: 790, lav: true, at: tPk, size: 52 });

// ---------- 7. "worth 3 million", months without a buyer; need cash fast -> sell lower ----------
const tSell = N("ممكن");
K.cam(tSell - 0.3, "sell");
const house3 = K.img(B.sell, OBJ + "kanz-house-v01.png", { x: 640, y: 330, w: 460, at: tSell + 0.1, glow: true });
K.push(K.T("شقتك", tSell) - 0.1, "sell", 1.18, 2.4, { dx: 60, dy: -60 });
const tag3 = K.tag(B.sell, "«تساوي ٣ مليون»", { x: 640, y: 600, lav: true, at: N("تساوي"), size: 46 });
const forSale = K.tag(B.sell, "للبيع", { x: 760, y: 110, at: N("للبيع"), rot: -6, size: 44 });
const cal = K.img(B.sell, OBJ + "kanz-calendar-v01.png", { x: 300, y: 330, w: 320, at: N("شهور") });
const noBuyer = K.text(B.sell, "من غير مشتري", { x: 310, y: 560, size: 38, cls: "muted", at: N("مشتري") });
const tFast = N("بسرعة");
[house3, tag3, cal, forSale, noBuyer].forEach((e) => K.fadeTo(e, tFast - 0.1, 0.15, { scale: 0.92 }));
K.push(tFast - 0.2, "sell", 1.0, 0.6);
K.img(B.sell, OBJ + "kanz-hourglass-v01.png", { x: 500, y: 390, w: 420, at: tFast, glow: true });
const tLow = N("أقل");
K.arrow(B.sell, 500, 620, 500, 690, { at: tLow - 0.2, bend: 0.001, color: "#fff" });
K.tag(B.sell, "بسعر أقل", { x: 500, y: 750, lav: true, at: tLow, size: 52 });

// ---------- 8. and if it's still under construction? ----------
const tCon = N("ولو");
const tYou = K.T("إنت", tCon);
K.punch("ولو لسه تحت الإنشاء؟", tCon, tYou - 0.05, { size: 92 });

// ---------- 9. pay now, receive later; delays mean instalments + rent, no use, no income ----------
K.cam(tYou - 0.35, "build", { sfx: false, dur: 0.3 });
K.axis(B.build, 140, 860, 430, { at: tYou });
K.img(B.build, OBJ + "kanz-loan-agreement-v01.png", { x: 780, y: 220, w: 280, at: N("بتدفع"), sfx: "paper" });
const tNow = N("دلوقتي");
K.dot(B.build, 780, 430, { at: tNow });
K.tag(B.build, "دلوقتي", { x: 780, y: 495, at: tNow + 0.1 });
const tLater = N("هتستلمها");
K.dot(B.build, 450, 430, { at: tLater, color: "#fff" });
K.tag(B.build, "التسليم المتوقع", { x: 450, y: 495, at: tLater + 0.1 });
const houseB = K.img(B.build, OBJ + "kanz-house-v01.png", { x: 450, y: 250, w: 320, at: tLater, glow: true });
const tLate = N("اتأخر");
K.dashed(B.build, 430, 430, 170, 430, { at: tLate, color: L, dur: 0.6 });
K.tl.to(houseB, { left: 190, duration: 0.7, ease: "power3.inOut" }, tLate);
K.tag(B.build, "تأخير", { x: 300, y: 370, lav: true, at: tLate + 0.3 });
const tInst = N("الأقساط");
[740, 620, 500].forEach((x, i) => K.tag(B.build, "قسط", { x, y: 610, at: tInst + i * 0.18, sfx: "coin", gain: 0.25, size: 34 }));
const tRent = N("وإيجار");
[740, 620, 500].forEach((x, i) => K.tag(B.build, "إيجار", { x, y: 690, at: tRent + i * 0.18, lav: true, size: 34 }));
const tUse = N("بتستخدمها");
K.fadeTo(houseB, tUse, 0.35);
K.text(B.build, "مش بتستخدمها", { x: 300, y: 790, size: 40, cls: "muted", at: tUse });
K.text(B.build, "ولا بتجيب دخل", { x: 660, y: 790, size: 40, cls: "muted", at: N("دخل") });

// ---------- 10. real estate can lose in more than one way ----------
const tWays = N("عشان");
K.cam(tWays - 0.3, "ways", { via: 0.42, dur: 1.0 });
K.bgObj(B.ways, OBJ + "kanz-house-v01.png", { x: 500, y: 470, w: 560, at: tWays, opacity: 0.16 });
const lose = K.text(B.ways, "العقار ممكن يخسر", { x: 500, y: 40, size: 68, head: true, at: N("العقار") });
const tWay = N("طريقة");
K.fadeTo(lose, tWay - 0.2, 0, { dur: 0.2 });
K.text(B.ways, "بأكتر من طريقة", { x: 500, y: 40, size: 68, head: true, color: L, at: tWay });
K.push(tWay + 0.6, "ways", 1.08, 5.5);
const rows = [["البيع", "سعر البيع يقل", "kanz-price-tag-v01.png"],
  ["تتآكل", "قيمته تتآكل مع الغلاء", "kanz-grocery-basket-v01.png"],
  ["مصاريفه", "المصاريف والتأخير<br>ياكلوا المكسب", "kanz-hourglass-v01.png"]];
rows.forEach(([w, html, img], i) => {
  const t = N(w), y = 240 + i * 230;
  K.card(B.ways, card(html, 50), { x: 420, y, w: 600, h: 180, rot: i % 2 ? 1.2 : -1.2, at: t, tape: i === 0 });
  K.img(B.ways, OBJ + img, { x: 810, y, w: 200, at: t + 0.1, gain: 0.2, shadow: false });
});

// ---------- 11. can be a good investment, but "never loses" isn't a guarantee ----------
K.oval(B.ways, 420, 700, 340, 120, { at: N("وتأخير"), seed: 3 });
K.text(B.ways, num("−") + " المكسب", { x: 500, y: 860, size: 52, head: true, color: L, at: N("مكسبه"), from: "pop", sfx: "hit", gain: 0.3 });
K.cam(N("العقار") - 0.3, "guar");
const tInv = N("استثمار");
K.img(B.guar, OBJ + "kanz-house-v01.png", { x: 500, y: 200, w: 300, at: K.T("العقار", tInv - 3) });
K.tag(B.guar, "ممكن يكون استثمار كويس", { x: 500, y: 390, at: tInv, size: 44 });
const tMyth = N("مبيخسرش");
K.card(B.guar, card("«العقار مبيخسرش»", 80), { x: 500, y: 600, w: 760, h: 240, at: tMyth - 0.15 });
const tG = N("ضمان");
K.strike(B.guar, 180, 640, 820, 560, { at: tG - 0.25, width: 11 });
K.tag(B.guar, "مش ضمان", { x: 620, y: 780, lav: true, rot: -5, at: tG, size: 56, sfx: "hit" });

// ---------- 12. the questions that matter ----------
const tAsk = N("السؤال");
K.cam(tAsk - 0.3, "ask", { via: 0.42, dur: 0.9 });
K.text(B.ask, "السؤال", { x: 610, y: 90, size: 84, head: true, at: tAsk });
K.text(B.ask, "الأهم", { x: 360, y: 90, size: 84, head: true, color: L, at: N("الأهم") });
const qs = [["بكام", "اشتريت بكام؟", "kanz-price-tag-v01.png"], ["إمتى", "هتستلم إمتى؟", "kanz-calendar-v01.png"],
  ["كام", "صافي مكسبك كام؟", "kanz-coins-v01.png"]];
qs.forEach(([w, html, img], i) => {
  const t = N(w), y = 330 + i * 235;
  K.img(B.ask, OBJ + img, { x: 800, y, w: 210, at: t, gain: 0.25, glow: i === 2 });
  K.text(B.ask, html, { x: 420, y, size: 72, head: true, at: t + 0.05, color: i === 2 ? L : "#fff" });
});

// ---------- end: no closing logo or wipe, no top-left logo (Ahmed, 2026-10-06/07, as on the recent Reels) ----------
K.duration = window.DURATION + 1.0;
