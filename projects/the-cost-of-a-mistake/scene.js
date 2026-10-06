/* The cost of a mistake / risk management (Ahmed's voice note, 2026-10-07).
 * Opens in first person (Ahmed's request): a chest-camera POV standing on a plank on the ground, then the same plank over
 * a volcano crater. The two POV plates are generated images (brand/image-treatment, treatment 01, candidates pending
 * Ahmed's approval); everything after is the usual board world with approved icons. No numbers beyond the spoken prize.
 */
const { T, num } = K;
const OBJ = "../../library/objects/";
const POV = "assets/pov/";
const RED = "#e5534b"; // genuine losses only

// ---------- POV layer: full frame, under headline and captions ----------
const stage = document.getElementById("stage");
const povBox = K.el("div", "abs", null);
stage.insertBefore(povBox, document.getElementById("headline"));
gsap.set(povBox, { left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden", zIndex: 1 });
function plate(src) {
  const e = K.el("img", "abs", povBox);
  e.src = src;
  gsap.set(e, { left: 0, top: 0, width: 1080, height: 1920, objectFit: "cover", transformOrigin: "50% 70%" });
  return e;
}
const shade = K.el("div", "abs", povBox); // keeps the caption area readable over a bright photo
const povA = plate(POV + "pov-plank-ground.png");
const povB = plate(POV + "pov-plank-volcano-v02.png");
povBox.appendChild(shade);
gsap.set(shade, { left: 0, top: 0, width: 1080, height: 1920,
  background: "linear-gradient(to bottom, rgba(8,7,11,.55) 0%, rgba(8,7,11,0) 28%, rgba(8,7,11,0) 62%, rgba(8,7,11,.7) 100%)" });
function povText(html, o) {
  const e = K.el("div", "t head", povBox, html);
  gsap.set(e, { left: 540, top: o.y, xPercent: -50, yPercent: -50, fontSize: o.size || 84, color: o.color || "#fff", whiteSpace: "nowrap", textShadow: "0 4px 24px rgba(8,7,11,.9), 0 0 6px rgba(8,7,11,.8)" });
  K.tl.set(e, { autoAlpha: 0 }, 0);
  K.tl.fromTo(e, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, immediateRender: false }, o.at);
  if (o.out != null) K.tl.to(e, { autoAlpha: 0, duration: 0.25 }, o.out);
  if (o.sfx) K.sfx(o.at, o.sfx, o.gain || 0.4);
  return e;
}
// A: plank on the ground. slow push in; two gentle steps on "خطوتين"
K.tl.set(povB, { autoAlpha: 0 }, 0);
K.tl.fromTo(povA, { scale: 1.0 }, { scale: 1.06, duration: 7.5, ease: "none" }, 0);
povText(num("1000") + " جنيه", { y: 330, size: 110, color: "#d5adef", at: T("ألف"), sfx: "coin", out: T("طيب") - 0.1 });
const tStep = T("هتمشي");
[0, 0.55].forEach((d) => K.tl.to(povA, { y: -22, duration: 0.22, yoyo: true, repeat: 1, ease: "sine.inOut" }, tStep + 0.5 + d));
povText("هتوافق؟", { y: 470, size: 72, at: T("هتوافق"), out: T("طيب") - 0.1 });
// B: same plank over a volcano. hard cut on "فوهة", slow push and a slight vertigo sway
const tVol = T("فوهة");
K.tl.set(povA, { autoAlpha: 0 }, tVol);
K.tl.set(povB, { autoAlpha: 1 }, tVol);
K.sfx(tVol, "hit", 0.5);
K.tl.fromTo(povB, { scale: 1.04 }, { scale: 1.14, duration: 6.2, ease: "none" }, tVol);
K.tl.to(povB, { rotation: 1.2, duration: 1.4, yoyo: true, repeat: 3, ease: "sine.inOut" }, tVol + 0.6);
povText("بركان", { y: 330, size: 120, at: T("بركان"), out: T("هتوافق", 18) - 0.1 });
povText("هتوافق؟", { y: 470, size: 72, at: T("هتوافق", 18), out: T("ليه", 19) - 0.05 });
povText("ليه؟", { y: 600, size: 110, at: T("ليه", 19), sfx: "pop" });
const tOut = T("الألف") - 0.15;
K.tl.to(povBox, { autoAlpha: 0, duration: 0.35, ease: "power2.in" }, tOut);

// ---------- world layout (boards advance right -> left, like reading Arabic) ----------
const b1 = K.board("same", 0, 0);
const b2 = K.board("questions", -1400, 0);
const b3 = K.board("two", -2800, 0);
const b4 = K.board("rm", 0, 1400);
const b5 = K.board("avoid", -1400, 1400);
const b6 = K.board("life", -2800, 1400);
const b7 = K.board("thread", -1400, 2800);
K.cam(0, "same");

// ---------- 1. same prize, same distance; what changed is the cost of the mistake ----------
K.img(b1, OBJ + "kanz-wooden-plank-v01.png", { x: 760, y: 420, w: 380, at: tOut + 0.2 });
K.tag(b1, "على الأرض", { x: 760, y: 560, at: tOut + 0.3 });
K.img(b1, OBJ + "kanz-volcano-crater-v01.png", { x: 250, y: 440, w: 380, at: tOut + 0.4 });
gsap.set(K.img(b1, OBJ + "kanz-wooden-plank-v01.png", { x: 250, y: 400, w: 380, at: tOut + 0.55 }), { zIndex: 3 });
K.tag(b1, "فوق بركان", { x: 250, y: 600, at: tOut + 0.6 });
K.text(b1, "نفس الجايزة", { x: 500, y: 90, size: 64, head: true, at: T("الألف") });
K.text(b1, "نفس المسافة", { x: 500, y: 180, size: 64, head: true, at: T("والمسافة") });
K.punch("تمن الغلطة", T("تمن"), T("وتمن") - 0.04, { size: 170 });
K.text(b1, "تمن الغلطة", { x: 250, y: 720, size: 64, head: true, color: RED, at: T("وتمن") });
K.text(b1, "جزء أساسي من المخاطرة", { x: 500, y: 810, size: 44, color: "#d5adef", at: T("المخاطرة") });

// ---------- 2. two questions, not one ----------
const Q = (t) => `<div class="head" style="display:flex;align-items:center;justify-content:center;height:100%;padding:0 40px;font-size:58px;text-align:center">${t}</div>`;
const tQ = T("وعشان");
K.cam(tQ - 0.2, "questions");
K.card(b2, Q("إيه احتمال إن حاجة تمشي غلط؟"), { x: 520, y: 260, w: 780, h: 200, at: T("احتمال") - 0.2, rot: 2 });
K.card(b2, Q("ولو حصلت، هتكلّفني إيه؟"), { x: 480, y: 560, w: 780, h: 200, at: T("ولو", 31) - 0.1, rot: -2 });
K.underline(b2, 250, 620, 610, { at: T("هتكلّفني"), color: "#d5adef" });
K.tag(b2, "كمان", { x: 860, y: 430, lav: true, at: T("كمان") });

// ---------- 3. same stock, same drop, different lives ----------
const tTwo = T("نفس", 33);
K.cam(tTwo - 0.2, "two");
K.text(b3, "نفس السهم", { x: 500, y: 40, size: 64, head: true, at: T("اتنين") });
K.img(b3, OBJ + "kanz-npc-f01-neutral-v01.png", { x: 760, y: 330, w: 240, at: T("واحد", 35.8) });
K.img(b3, OBJ + "kanz-npc-m01-neutral-v01.png", { x: 240, y: 330, w: 240, at: T("والتاني", 37.5) });
// how much of their money is in it: outline = all their money, fill = the part in the stock
K.bar(b3, { x: 760, y: 760, w: 90, h: 230, outline: true, color: "transparent", at: T("جزء", 36.5) });
const smallFill = K.bar(b3, { x: 760, y: 760, w: 90, h: 50, color: "#d5adef", at: T("صغير") });
K.tag(b3, "جزء صغير", { x: 760, y: 800, at: T("صغير") + 0.1 });
K.bar(b3, { x: 240, y: 760, w: 90, h: 230, outline: true, color: "transparent", at: T("تحويشة") - 0.2 });
const fullFill = K.bar(b3, { x: 240, y: 760, w: 90, h: 230, color: "#d5adef", at: T("تحويشة") });
K.tag(b3, "تحويشة العمر", { x: 240, y: 800, at: T("عمره") });
K.img(b3, OBJ + "kanz-house-v01.png", { x: 110, y: 600, w: 130, at: T("الإيجار") });
K.tag(b3, "+ الإيجار", { x: 110, y: 690, lav: true, at: T("الإيجار") + 0.1 });
// the stock falls about the same for both
const tDrop = T("نزل");
K.line(b3, [[400, 150], [450, 175], [500, 165], [550, 215], [600, 245]], { at: tDrop - 0.2, dur: 0.9, color: RED, width: 6 });
K.tl.to([smallFill, fullFill], { scaleY: 0.6, duration: 0.6, ease: "power2.inOut" }, tDrop + 0.4);
K.tag(b3, "زعلان", { x: 760, y: 120, at: T("زعلان") });
K.tag(b3, "مش هيدفع الإيجار", { x: 240, y: 120, at: T("يدفع") });
K.text(b3, "؟", { x: 110, y: 470, size: 110, head: true, color: RED, at: T("الإيجار", 44.5), from: "pop", sfx: "hit", gain: 0.4 });
K.oval(b3, 240, 470, 200, 330, { at: T("تمامًا"), seed: 5 });

// ---------- 4. risk management: before you enter, count the loss too ----------
const tRm = T("وهنا");
K.cam(tRm - 0.3, "rm", { via: 0.42, dur: 0.9 });
K.text(b4, "إدارة المخاطر", { x: 500, y: 60, size: 90, head: true, color: "#d5adef", at: T("إدارة", 48.5) });
K.text(b4, "Risk Management", { x: 500, y: 160, size: 40, cls: "muted", at: T("الريسك") });
const win = K.tag(b4, "هتكسب كام؟", { x: 760, y: 300, size: 44, at: T("هتكسب") });
K.strike(b4, 640, 320, 880, 280, { at: T("وبس") });
K.img(b4, OBJ + "kanz-calculator-v01.png", { x: 230, y: 330, w: 220, at: T("احسب") });
K.tag(b4, "لو خسرت، هخسر قد إيه؟", { x: 640, y: 430, size: 44, lav: true, at: T("هخسر") });
K.tag(b4, "هقدر أتحمل؟", { x: 640, y: 530, size: 44, at: T("أتحمل") });
K.img(b4, OBJ + "kanz-egp-banknote-stack-v01.png", { x: 760, y: 700, w: 230, at: T("المبلغ") });
K.tag(b4, "المبلغ", { x: 760, y: 810, at: T("المبلغ") + 0.15 });
K.img(b4, OBJ + "kanz-pie-chart-v01.png", { x: 250, y: 680, w: 240, at: T("وتوزّع") });
K.tag(b4, "التوزيع", { x: 250, y: 810, lav: true, at: T("استثماراتك") });

// ---------- 5. managing risk is not avoiding it ----------
const tAv = T("بالمناسبة");
K.cam(tAv - 0.2, "avoid");
K.text(b5, "مش تجنّب المخاطر", { x: 500, y: 200, size: 80, head: true, at: T("تجنّب") - 0.2 });
K.strike(b5, 230, 230, 770, 170, { at: T("المخاطر", 64) });
K.text(b5, "تقليل تأثير الخسارة", { x: 500, y: 420, size: 80, head: true, color: "#d5adef", at: T("بتقلل") });
K.underline(b5, 210, 790, 480, { at: T("تأثير", 65), color: "#d5adef" });
K.img(b5, OBJ + "kanz-wallet-v01.png", { x: 500, y: 660, w: 200, at: T("عليك") });

// ---------- 6. the market is dynamic, but it shouldn't carry your whole life ----------
const tLife = T("البورصة", 66.8);
K.cam(tLife - 0.2, "life");
K.axis(b6, 80, 920, 330, { at: tLife });
K.line(b6, [[100, 260], [180, 200], [250, 280], [330, 180], [410, 250], [490, 140], [570, 230], [650, 160], [730, 260], [820, 170], [900, 210]],
  { at: tLife + 0.1, dur: 1.4 });
K.tag(b6, "ديناميكي ومرن", { x: 300, y: 60, at: T("ومرن") });
K.tag(b6, "ميزة، مش عيب", { x: 700, y: 60, lav: true, at: T("ميزته") });
K.text(b6, "حياتك", { x: 500, y: 430, size: 64, head: true, at: T("حياتك", 70.5) });
K.img(b6, OBJ + "kanz-house-v01.png", { x: 760, y: 620, w: 200, at: T("حمولة") });
K.img(b6, OBJ + "kanz-wallet-v01.png", { x: 500, y: 640, w: 180, at: T("ووزن") });
K.img(b6, OBJ + "kanz-investment-chart-v01.png", { x: 240, y: 620, w: 200, at: T("ووزن") + 0.25 });
K.tag(b6, "البورصة جزء", { x: 240, y: 770, lav: true, at: T("الوحيدة") });
K.tag(b6, "مش كل حاجة", { x: 600, y: 790, at: T("متوقف") });

// ---------- 7. a hair between trading and gambling ----------
const tTh = T("شعرة");
K.cam(tTh - 0.4, "thread", { via: 0.42, dur: 0.9 });
K.text(b7, "التجارة", { x: 820, y: 400, size: 72, head: true, at: T("التجارة", 79) });
K.text(b7, "القمار", { x: 180, y: 400, size: 72, head: true, at: T("والقمار") });
const whole = K.line(b7, [[700, 410], [600, 405], [500, 412], [400, 406], [300, 410]], { at: tTh, dur: 0.8, color: "#d5adef", width: 4 });
const tCut = T("بتتقطع");
K.tl.to(whole, { autoAlpha: 0, duration: 0.05 }, tCut + 0.2);
K.line(b7, [[700, 410], [600, 405], [520, 411], [490, 440]], { at: tCut + 0.2, dur: 0.15, color: "#d5adef", width: 4 });
K.sfx(tCut + 0.2, "hit", 0.45);
K.line(b7, [[300, 410], [400, 406], [470, 409], [500, 380]], { at: tCut + 0.2, dur: 0.15, color: "#d5adef", width: 4 });
K.text(b7, "اعتبار للمخاطر", { x: 500, y: 640, size: 80, head: true, color: "#d5adef", at: T("اعتبار") });

// ---------- end: no closing logo (as on the recent Reels) ----------
K.duration = window.DURATION + 0.5;
