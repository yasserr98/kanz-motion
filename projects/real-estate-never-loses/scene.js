/* "هل فعلًا العقار مبيخسرش؟": Ahmed's script, ElevenLabs v4 voice.
 * Written in script order with sequential anchors (K.N finds each word after the previous one),
 * so it times itself to whatever voice/speed is generated. All figures are the script's
 * hypothetical example and are labelled "مثال افتراضي".
 */
const { N, num } = K;
const OBJ = "../../library/objects/";
const card = (html, size = 56) => `<div style="height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 40px">
  <div class="head" style="font-size:${size}px;color:#141217;line-height:1.3">${html}</div></div>`;

// ---------- world: boards advance right -> left, row by row ----------
const B = {
  hook: K.board("hook", 0, 0), price: K.board("price", -1400, 0), buy: K.board("buy", -2800, 0),
  infl: K.board("infl", 0, 1400), pocket: K.board("pocket", -1400, 1400), sell: K.board("sell", -2800, 1400),
  build: K.board("build", 0, 2800), ways: K.board("ways", -1400, 2800), guar: K.board("guar", -2800, 2800),
  ask: K.board("ask", -1400, 4200),
};
K.cam(0, "hook");

// ---------- 1. hook ----------
const tQ = N("هل");
K.headline([{ html: "هل فعلًا العقار", at: tQ }, { html: "مبيخسرش؟", kw: true, at: N("مبيخسرش") }], { out: K.T("خلينا") - 0.25 });
K.img(B.hook, OBJ + "kanz-house-v01.png", { x: 500, y: 470, w: 470, at: 0.15, sfx: "pop" });
K.oval(B.hook, 500, 470, 300, 270, { at: K.cursor + 0.25 });

// ---------- 2. bought for a million, a year later 1.1 million ----------
const tLet = N("خلينا");
K.cam(tLet - 0.3, "price");
K.tag(B.price, "مثال افتراضي", { x: 500, y: 60, at: tLet + 0.2 });
K.img(B.price, OBJ + "kanz-house-v01.png", { x: 770, y: 380, w: 300, at: N("شقة") });
K.tag(B.price, "مليون جنيه", { x: 770, y: 600, at: N("بمليون"), sfx: "coin" });
const tYear = N("سنة");
K.arrow(B.price, 640, 470, 380, 470, { at: tYear - 0.2, bend: 50 });
K.text(B.price, "بعد سنة", { x: 510, y: 400, size: 38, cls: "muted", at: tYear });
K.img(B.price, OBJ + "kanz-house-v01.png", { x: 250, y: 380, w: 300, at: N("بقت") });
K.tag(B.price, "مليون و١٠٠ ألف", { x: 250, y: 600, at: N("بمليون"), sfx: "coin" });
const tWin = N("كسبت");
K.text(B.price, num("+١٠٠") + " ألف", { x: 500, y: 760, size: 92, head: true, color: "#d5adef", at: tWin, from: "pop", sfx: "coin", gain: 0.45 });
K.oval(B.price, 500, 765, 210, 80, { at: N("صح") });

// ---------- 3. in pounds, yes. But what does that money buy? ----------
const tEgp = N("بالجنيه");
K.cam(tEgp - 0.3, "buy");
K.img(B.buy, OBJ + "kanz-egp-banknote-stack-v01.png", { x: 760, y: 450, w: 330, at: tEgp, sfx: "coin" });
const tBuy = N("تشتري");
K.arrow(B.buy, 600, 450, 420, 450, { at: tBuy - 0.25, bend: 40 });
K.img(B.buy, OBJ + "kanz-grocery-basket-v01.png", { x: 250, y: 450, w: 340, at: tBuy });
K.text(B.buy, "؟", { x: 500, y: 180, size: 220, head: true, color: "#d5adef", at: N("إيه"), from: "pop", sfx: "hit", gain: 0.3 });

// ---------- 4–5. prices up 20%: the flat needed 1.2 million just to stand still ----------
const tIf = N("لو");
K.cam(tIf - 0.3, "infl", { via: 0.42, dur: 1.0 });
K.tag(B.infl, "مثال افتراضي", { x: 500, y: 50, at: tIf + 0.4 });
K.axis(B.infl, 140, 860, 720, { at: tIf + 0.5 });
const tPct = N("٢٠٪");
K.text(B.infl, "الأسعار", { x: 820, y: 150, size: 40, cls: "muted", at: tPct - 0.1 });
K.text(B.infl, num("+٢٠٪"), { x: 820, y: 240, size: 96, head: true, color: "#d5adef", at: tPct, from: "pop", sfx: "pop" });
const tFlat = N("شقتك");
K.bar(B.infl, { x: 560, y: 720, w: 190, h: 300, at: tFlat, color: "#c7c2cc" });
K.text(B.infl, "سعرها<br>مليون و١٠٠ ألف", { x: 560, y: 790, size: 34, w: 300, at: tFlat + 0.1 });
const tNeed = N("لمليون");
K.bar(B.infl, { x: 300, y: 720, w: 190, h: 390, at: tNeed, color: "rgba(255,255,255,0)", outline: true });
K.text(B.infl, "المطلوب<br>مليون و٢٠٠ ألف", { x: 300, y: 790, size: 34, w: 300, cls: "muted", at: tNeed + 0.1 });
K.tag(B.infl, "نفس القوة الشرائية", { x: 300, y: 285, lav: true, at: N("قوتها") });
K.tag(B.infl, "على الورق: زاد", { x: 560, y: 370, at: N("الورق") });
const tReal = N("الحقيقية");
K.dashed(B.infl, 430, 330, 430, 420, { at: tReal - 0.2, color: "#d5adef", dur: 0.3 });
K.text(B.infl, "قيمتها الحقيقية قلت", { x: 330, y: 165, size: 44, head: true, w: 340, color: "#d5adef", at: tReal });
K.img(B.infl, OBJ + "kanz-receipt-v01.png", { x: 870, y: 470, w: 170, at: N("المصاريف"), sfx: "paper" });
K.tag(B.infl, "مصاريف", { x: 870, y: 600, at: K.cursor + 0.15 });
K.tag(B.infl, "دخل الإيجار؟", { x: 870, y: 680, lav: true, at: N("الإيجار") });

// ---------- 6. "the price went up" doesn't mean the money is in your pocket ----------
const tPocket = N("كدة") - 0.3;
K.cam(tPocket, "pocket");
K.text(B.pocket, "سعرها زاد…", { x: 500, y: 110, size: 72, head: true, at: N("سعرها") });
const wallet = K.img(B.pocket, OBJ + "kanz-wallet-v01.png", { x: 500, y: 470, w: 380, at: K.cursor + 0.1 });
const tPk = N("جيبك");
K.oval(B.pocket, 500, 470, 260, 230, { at: tPk - 0.3, seed: 5 });
K.tag(B.pocket, "مش في جيبك", { x: 500, y: 740, lav: true, at: tPk, size: 44 });

// ---------- 7. "worth 3 million", months without a buyer; need cash fast -> sell lower ----------
const tSell = N("ممكن");
K.cam(tSell - 0.3, "sell");
const house3 = K.img(B.sell, OBJ + "kanz-house-v01.png", { x: 730, y: 380, w: 330, at: tSell + 0.1 });
const tag3 = K.tag(B.sell, "«تساوي ٣ مليون»", { x: 730, y: 610, lav: true, at: N("تساوي"), size: 42 });
K.tag(B.sell, "للبيع", { x: 730, y: 170, at: N("للبيع"), rot: -6, size: 40 });
const cal = K.img(B.sell, OBJ + "kanz-calendar-v01.png", { x: 260, y: 380, w: 290, at: N("شهور") });
K.text(B.sell, "من غير مشتري", { x: 260, y: 600, size: 40, cls: "muted", at: N("مشتري") });
const tFast = N("بسرعة");
[house3, tag3, cal].forEach((e) => K.fadeTo(e, tFast - 0.1, 0.18, { scale: 0.92 }));
K.img(B.sell, OBJ + "kanz-hourglass-v01.png", { x: 500, y: 440, w: 300, at: tFast });
const tLow = N("بأقل");
K.arrow(B.sell, 700, 650, 700, 760, { at: tLow - 0.2, bend: 0.001, color: "#fff" });
K.tag(B.sell, "بسعر أقل", { x: 500, y: 720, lav: true, at: tLow, size: 44 });

// ---------- 8. and if it's still under construction? ----------
const tCon = N("ولو");
const tYou = K.T("إنت", tCon);
K.punch("ولو لسه تحت الإنشاء؟", tCon, tYou - 0.05, { size: 92 });

// ---------- 9. you pay now, receive later; delays mean instalments + rent, no use, no income ----------
K.cam(tYou - 0.35, "build", { sfx: false, dur: 0.3 });
K.axis(B.build, 120, 880, 430, { at: tYou });
K.img(B.build, OBJ + "kanz-loan-agreement-v01.png", { x: 860, y: 260, w: 200, at: N("بتدفع"), sfx: "paper" });
const tNow = N("دلوقتي");
K.dot(B.build, 860, 430, { at: tNow });
K.tag(B.build, "دلوقتي", { x: 860, y: 500, at: tNow + 0.1 });
const tLater = N("هتستلمها");
K.dot(B.build, 440, 430, { at: tLater, color: "#fff" });
K.tag(B.build, "التسليم المتوقع", { x: 440, y: 500, at: tLater + 0.1 });
const houseB = K.img(B.build, OBJ + "kanz-house-v01.png", { x: 440, y: 290, w: 220, at: tLater });
const tLate = N("اتأخر");
K.dashed(B.build, 420, 430, 150, 430, { at: tLate, color: "#d5adef", dur: 0.6 });
K.tl.to(houseB, { left: 160, duration: 0.7, ease: "power3.inOut" }, tLate);
K.tag(B.build, "تأخير", { x: 290, y: 380, lav: true, at: tLate + 0.3 });
const tInst = N("الأقساط");
[780, 680, 580].forEach((x, i) => K.tag(B.build, "قسط", { x, y: 620, at: tInst + i * 0.18, sfx: "coin", gain: 0.25, size: 30 }));
const tRent = N("وإيجار");
[760, 620, 480].forEach((x, i) => K.tag(B.build, "إيجار", { x, y: 700, at: tRent + i * 0.18, lav: true, size: 30 }));
const tUse = N("بتستخدمها");
K.fadeTo(houseB, tUse, 0.35);
K.text(B.build, "مش بتستخدمها", { x: 230, y: 610, size: 38, cls: "muted", at: tUse });
K.text(B.build, "ولا بتجيب دخل", { x: 230, y: 680, size: 38, cls: "muted", at: N("دخل") });

// ---------- 10. real estate can lose in more than one way ----------
const tWays = N("عشان");
K.cam(tWays - 0.3, "ways", { via: 0.42, dur: 1.0 });
K.text(B.ways, "بأكتر من طريقة", { x: 500, y: 60, size: 64, head: true, color: "#d5adef", at: N("طريقة") });
const rows = [["البيع", "سعر البيع يقل", "kanz-price-tag-v01.png"],
  ["تتآكل", "قيمته تتآكل مع الغلاء", "kanz-grocery-basket-v01.png"],
  ["مصاريفه", "المصاريف والتأخير<br>ياكلوا المكسب", "kanz-hourglass-v01.png"]];
rows.forEach(([w, html, img], i) => {
  const t = N(w), y = 230 + i * 215;
  K.card(B.ways, card(html, 50), { x: 440, y, w: 700, h: 170, rot: i % 2 ? 1.2 : -1.2, at: t, tape: i === 0 });
  K.img(B.ways, OBJ + img, { x: 880, y, w: 160, at: t + 0.1, gain: 0.2 });
});

// ---------- 11. can be a good investment, but "never loses" isn't a guarantee ----------
const tInv = N("استثمار");
K.cam(tInv - 0.6, "guar");
K.tag(B.guar, "ممكن يكون استثمار كويس", { x: 500, y: 130, at: tInv, size: 40 });
const tMyth = N("مبيخسرش");
K.card(B.guar, card("«العقار مبيخسرش»", 80), { x: 500, y: 430, w: 780, h: 260, at: tMyth - 0.15 });
const tG = N("ضمان");
K.strike(B.guar, 170, 470, 830, 390, { at: tG - 0.25, width: 11 });
K.tag(B.guar, "مش ضمان", { x: 650, y: 650, lav: true, rot: -5, at: tG, size: 52, sfx: "hit" });

// ---------- 12. the questions that matter ----------
const tAsk = N("السؤال");
K.cam(tAsk - 0.3, "ask", { via: 0.42, dur: 0.9 });
K.headline([{ html: "السؤال", at: tAsk }, { html: "الأهم", kw: true, at: N("الأهم") }], {});
const qs = [["بكام", "اشتريت بكام؟", "kanz-price-tag-v01.png"], ["إمتى", "هتستلم إمتى؟", "kanz-calendar-v01.png"],
  ["كام", "صافي مكسبك كام؟", "kanz-coins-v01.png"]];
qs.forEach(([w, html, img], i) => {
  const t = N(w), y = 200 + i * 230;
  K.img(B.ask, OBJ + img, { x: 860, y, w: 170, at: t, gain: 0.25 });
  K.text(B.ask, html, { x: 430, y, size: 70, head: true, at: t + 0.05, color: i === 2 ? "#d5adef" : "#fff" });
});

// ---------- outro ----------
const tEnd = window.DURATION + 0.15;
K.captionsTo = tEnd;
K.wipe(tEnd, { hold: true });
K.tl.set("#logo", { zIndex: 30 }, tEnd);
K.tl.to("#logo", { left: 390, top: 900, width: 300, duration: 0.5, ease: "power3.inOut" }, tEnd + 0.25);
K.tl.to("#headline", { autoAlpha: 0, duration: 0.2 }, tEnd);
K.duration = tEnd + 1.6;
