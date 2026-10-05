/* Pilot 01: "good news, falling stock" (Ahmed's voice note, 2026-10-05).
 * One continuous world of boards; the camera travels between them as the argument moves on.
 * All times are anchored to words in the voice (K.T). Numbers are the voice note's own
 * hypothetical example, so every chart is labelled "مثال افتراضي" / illustrative.
 */
const { T, num } = K;
const OBJ = "../../library/objects/";
const PAPER_NEWS = (w) => `<div style="padding:${w > 500 ? 64 : 40}px 40px 0;text-align:center">
  <div style="font:500 ${w > 500 ? 30 : 24}px var(--body);color:#6d6872">إعلان أرباح</div>
  <div class="head" style="font-size:${w > 500 ? 70 : 50}px;margin-top:12px;color:#141217">الأرباح زادت ${num("20%")}</div>
  <div style="font:400 ${w > 500 ? 24 : 20}px var(--body);color:#8a8590;margin-top:18px">مثال افتراضي</div></div>`;

// ---------- world layout (boards advance right -> left, like reading Arabic) ----------
const b1 = K.board("hook", 0, 0);
const b2 = K.board("news", -1400, 0);
const b3 = K.board("priced", -2800, 0);
const b4 = K.board("expect", 0, 1400);
const b5 = K.board("humans", -1400, 1400);
const b6 = K.board("reverse", -2800, 1400);
const b7 = K.board("confused", 0, 2800);
const b8 = K.board("context", -1400, 2800);
K.cam(0, "hook");

// ---------- 1. hook: profits up, stock down ----------
K.headline([
  { html: "أرباحها زادت…", at: T("أرباحها") },
  { html: "وسهمها", at: T("سهمها") },
  { html: "نزل", kw: true, at: T("نزل") },
], { out: 4.0 });
K.text(b1, "الأرباح", { x: 760, y: 250, size: 46, cls: "muted", at: T("أرباحها") });
K.text(b1, num("+20%"), { x: 760, y: 430, size: 150, color: "#d5adef", at: T("20%"), from: "pop", sfx: "pop", gain: 0.5 });
K.arrow(b1, 760, 640, 760, 560, { bend: 0.001, at: T("20%") + 0.2, sfx: "click" });
K.text(b1, "السهم", { x: 240, y: 250, size: 46, cls: "muted", at: T("سهمها") });
K.text(b1, num("−10%"), { x: 240, y: 430, size: 150, at: T("10%"), from: "pop", sfx: "pop", gain: 0.5 });
K.arrow(b1, 240, 560, 240, 640, { bend: 0.001, at: T("10%") + 0.2, sfx: "click", color: "#fff" });
// 2. the question
K.oval(b1, 760, 430, 215, 130, { at: T("أرباح", 4.1) });
K.oval(b1, 240, 430, 210, 130, { at: T("والسهم"), seed: 4 });
K.text(b1, "؟", { x: 500, y: 430, size: 240, head: true, color: "#d5adef", at: T("ينزل"), from: "pop", sfx: "hit", gain: 0.35 });

// ---------- 3. you look at the news; the market looks elsewhere ----------
const tNews = T("المشكلة");
K.cam(tNews - 0.35, "news");
const card = K.card(b2, PAPER_NEWS(640), { x: 500, y: 330, w: 640, h: 330, at: tNews });
K.underline(b2, 255, 745, 395, { at: T("الخبر", 6.5) });
K.fadeTo(card, T("السوق", 7.5), 0.55, { scale: 0.74 });
const tOther = T("حاجات");
K.img(b2, OBJ + "kanz-calendar-v01.png", { x: 810, y: 560, w: 200, at: tOther });
K.tag(b2, "قبل الإعلان", { x: 810, y: 700, at: tOther + 0.1 });
K.img(b2, OBJ + "kanz-price-tag-v01.png", { x: 500, y: 600, w: 200, at: tOther + 0.35 });
K.tag(b2, "السعر", { x: 500, y: 740, at: tOther + 0.45 });
K.dashed(b2, 110, 560, 300, 560, { at: tOther + 0.7, color: "#d5adef" });
K.tag(b2, "التوقعات", { x: 205, y: 640, lav: true, at: tOther + 0.75 });

// ---------- 4–5. was the good news already priced in? ----------
const tAsk = T("بيسأل", 9.5) - 0.45;
K.cam(tAsk, "priced");
K.text(b3, "السعر قبل إعلان الأرباح", { x: 500, y: 60, size: 40, cls: "muted", at: tAsk + 0.4 });
K.axis(b3, 120, 930, 720, { at: tAsk + 0.35 });
const rise = [[280, 650], [340, 610], [400, 630], [460, 560], [520, 575], [580, 480], [640, 500], [700, 400], [760, 330]];
K.line(b3, rise, { at: T("هل", 10.4), dur: 2.4, fill: "rgba(213,173,239,.22)", fillAt: T("طلع", 13.7), base: 720 });
K.dashed(b3, 760, 170, 760, 730, { at: T("اتسعّر"), color: "#d5adef", dur: 0.4 });
K.tag(b3, "إعلان الأرباح", { x: 760, y: 135, lav: true, at: T("اتسعّر") + 0.1 });
K.text(b3, "اتسعّر بالفعل؟", { x: 360, y: 220, size: 70, head: true, color: "#d5adef", at: T("اتسعّر") + 0.25, out: 15.2 });
K.tag(b3, "الخبر اتسعّر هنا", { x: 520, y: 660, lav: true, at: T("قيمة", 15) });
K.img(b3, OBJ + "kanz-npc-m01-phone-choice-v01.png", { x: 125, y: 470, w: 240, at: T("ناس", 16.4) });
const tBuy = T("واشترت");
K.tag(b3, "شراء", { x: 400, y: 570, at: tBuy });
K.tag(b3, "شراء", { x: 520, y: 510, at: tBuy + 0.3 });
K.tag(b3, "شراء", { x: 640, y: 435, at: T("ورفعت") });
K.line(b3, [[760, 330], [800, 360], [840, 350], [900, 430]], { at: T("للعامة", 20), dur: 0.7, color: "#fff" });
K.tag(b3, "بعد الإعلان", { x: 880, y: 500, at: T("للعامة", 20) + 0.4 });

// ---------- 6–8. good, but good enough for expectations? ----------
const tExp = T("وهل", 20.9) - 0.25;
K.cam(tExp, "expect", { via: 0.42, dur: 1.0 });
K.axis(b4, 150, 850, 700, { at: tExp + 0.6 });
K.bar(b4, { x: 500, y: 700, w: 220, h: 280, at: T("حلو", 21.9), color: "#c7c2cc" });
K.text(b4, "النتيجة", { x: 500, y: 750, size: 42, at: T("حلو", 21.9) });
K.dashed(b4, 220, 300, 780, 300, { at: T("توقعات", 23.4), color: "#d5adef" });
K.text(b4, "التوقعات", { x: 880, y: 300, size: 40, color: "#d5adef", at: T("توقعات", 23.4) + 0.15 });
const tLess = T("أقل", 24.6);
K.dashed(b4, 365, 305, 365, 415, { at: tLess, color: "#fff", dur: 0.3 });
const lessTxt = K.text(b4, "أقل من المرغوب", { x: 215, y: 360, size: 38, color: "#d5adef", at: tLess + 0.15, out: T("للسوق") - 0.1 });
K.tag(b4, "مثال افتراضي", { x: 500, y: 90, at: T("أضرب") });
K.text(b4, num("+30%"), { x: 880, y: 235, size: 64, color: "#d5adef", at: T("30%"), from: "pop", sfx: "pop" });
K.text(b4, num("+20%"), { x: 500, y: 372, size: 68, at: T("20%", 30), from: "pop", sfx: "coin", gain: 0.35 });
K.tag(b4, "للشركة: خبر كويس", { x: 500, y: 590, at: T("للشركة") });
K.tag(b4, "للسوق: أقل من التوقعات", { x: 300, y: 190, lav: true, at: T("للسوق") });
K.oval(b4, 470, 360, 330, 95, { at: T("للسوق") + 0.45, seed: 9 });

// ---------- 9. markets are people ----------
const tHum = T("تنساش") - 0.3;
K.cam(tHum, "humans");
const f01 = K.img(b5, OBJ + "kanz-npc-f01-explain-v01.png", { x: 320, y: 480, w: 330, at: T("بشر") });
const m01 = K.img(b5, OBJ + "kanz-npc-m01-worried-wallet-v01.png", { x: 690, y: 480, w: 330, at: T("بشر") + 0.25 });
K.text(b5, "عاطفيين ومتقلبين", { x: 500, y: 90, size: 64, head: true, color: "#d5adef", at: T("عاطفية") });
const tPaper = T("بالورقة");
K.fadeTo(f01, tPaper - 0.1, 0.25, { scale: 0.9 });
K.fadeTo(m01, tPaper - 0.1, 0.25, { scale: 0.9 });
K.img(b5, OBJ + "kanz-calculator-v01.png", { x: 500, y: 470, w: 380, at: tPaper, sfx: "click" });
K.strike(b5, 300, 640, 700, 280, { at: T("متخيل") - 0.1, color: "#d5adef" });

// ---------- 10. the reverse case ----------
const tRev = T("يعني", 41.3) - 0.25;
K.cam(tRev, "reverse");
K.tag(b6, "مثال افتراضي", { x: 500, y: 80, at: tRev + 0.4 });
K.axis(b6, 180, 820, 260, { at: tRev + 0.35 });
K.bar(b6, { x: 720, y: 260, w: 180, h: 140, down: true, at: T("قلّت"), color: "#c7c2cc" });
K.text(b6, "التراجع الفعلي", { x: 720, y: 450, size: 40, at: T("قلّت") + 0.1 });
K.text(b6, "والسهم طلع ↑", { x: 500, y: 760, size: 60, head: true, color: "#d5adef", at: T("يطلع", 43.5), from: "pop", sfx: "pop" });
K.bar(b6, { x: 280, y: 260, w: 180, h: 340, down: true, at: T("متوقع", 45), color: "rgba(255,255,255,0)", outline: true });
K.text(b6, "التراجع المتوقع", { x: 280, y: 640, size: 40, cls: "muted", at: T("متوقع", 45) + 0.1 });
K.dashed(b6, 500, 400, 500, 600, { at: T("أكتر", 46), color: "#d5adef", dur: 0.3 });
K.tag(b6, "أقل من المتوقع", { x: 500, y: 330, lav: true, at: T("أكتر", 46) + 0.2 });

// ---------- 11. "did I read the news wrong?" ----------
const tConf = T("جزء", 47) - 0.55;
K.cam(tConf, "confused", { via: 0.42, dur: 1.0 });
K.card(b7, PAPER_NEWS(460), { x: 330, y: 300, w: 460, h: 260, rot: -3, at: tConf + 0.7 });
K.img(b7, OBJ + "kanz-npc-m01-phone-choice-v01.png", { x: 760, y: 480, w: 300, at: T("تفتح", 50) });
K.axis(b7, 100, 560, 760, { at: T("السهم", 50.5) - 0.2 });
K.line(b7, [[130, 560], [210, 600], [270, 585], [350, 660], [420, 640], [520, 740]], { at: T("السهم", 50.5), dur: 1.1 });
K.text(b7, "قريت الخبر غلط؟", { x: 500, y: 80, size: 66, head: true, color: "#d5adef", at: T("هو", 51.5) });

// ---------- 12. no, not necessarily ----------
K.punch("لا، مش شرط.", T("لا", 53), T("لو", 53.8) - 0.04, { size: 140 });

// ---------- 13. takeaway: look at the context ----------
const tCtx = T("لو", 53.8);
K.cam(tCtx - 0.3, "context", { sfx: false });
const small = K.card(b8, PAPER_NEWS(420), { x: 500, y: 420, w: 420, h: 240, rot: -2, at: tCtx, tape: false });
K.headline([
  { html: "بص على", at: T("بص", 57) },
  { html: "السياق", kw: true, at: T("السياق") },
], {});
K.rect(b8, 60, 110, 880, 700, { at: T("السياق") });
K.tag(b8, "السياق", { x: 500, y: 110, lav: true, at: T("السياق") + 0.2 });
tlMove(small, T("والسلوك") - 0.1);
function tlMove(e, t) { K.tl.to(e, { left: 790, top: 250, scale: 0.55, duration: 0.6, ease: "power3.inOut" }, t); }
K.axis(b8, 120, 880, 700, { at: T("والسلوك") });
K.line(b8, [[140, 640], [210, 610], [270, 630], [340, 560], [410, 585], [480, 500], [560, 520], [630, 430], [700, 400]],
  { at: T("والسلوك") + 0.1, dur: 2.0 });
K.tag(b8, "السلوك السعري", { x: 320, y: 470, at: T("السعري") + 0.2 });
K.dashed(b8, 700, 180, 700, 710, { at: T("إعلان", 59), color: "#d5adef", dur: 0.4 });
K.tag(b8, "إعلان الأرباح", { x: 700, y: 760, lav: true, at: T("إعلان", 59) + 0.1 });
K.dashed(b8, 140, 665, 720, 370, { at: T("الترند"), color: "rgba(255,255,255,.75)", dur: 0.7 });
K.text(b8, "الترند", { x: 470, y: 600, size: 40, cls: "muted", at: T("الترند") + 0.3 });
K.dot(b8, 700, 400, { at: T("تقرير", 61) });
K.oval(b8, 700, 400, 80, 70, { at: T("تقرير", 61) + 0.2, seed: 12 });

// ---------- outro ----------
const tEnd = window.DURATION + 0.05;
K.captionsTo = tEnd;
K.wipe(tEnd, { hold: true });
K.tl.set("#logo", { zIndex: 30 }, tEnd);
K.tl.to("#logo", { left: 390, top: 900, width: 300, duration: 0.5, ease: "power3.inOut" }, tEnd + 0.25);
K.tl.to("#headline", { autoAlpha: 0, duration: 0.2 }, tEnd);
K.duration = tEnd + 1.6;
