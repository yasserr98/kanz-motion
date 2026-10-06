/* The cost of a mistake / risk management (Ahmed's voice note, 2026-10-07).
 * v2 opening (Ahmed 2026-10-07: drop the POV plates): two stacked boards, the plank on the ground and the same plank
 * across a volcano crater; on "هي هي" the camera pulls back to show both at once. Icons: approved library plus the
 * 27 Sept risk-management plank and crater cutouts. No numbers beyond the spoken prize.
 */
const { T, num } = K;
const OBJ = "../../library/objects/";
const RED = "#e5534b"; // genuine losses only

// ---------- world layout (boards advance right -> left, like reading Arabic) ----------
const bA = K.board("ground", 0, 0);
const bB = K.board("volcano", 0, 1250);   // directly under the ground board, so both fit in one pulled-back view
const b2 = K.board("questions", -1400, 0);
const b3 = K.board("two", -2800, 0);
const b4 = K.board("rm", 0, 2900);
const b5 = K.board("avoid", -1400, 1400);
const b6 = K.board("life", -2800, 1400);
const b7 = K.board("thread", -1400, 2800);
K.cam(0, "ground");

// ---------- 1a. a contest: walk a plank lying on the ground, win 1000 ----------
K.text(bA, "مسابقة", { x: 500, y: 60, size: 90, head: true, at: 0.2 });
const tHere = T("هنا");
K.dot(bA, 840, 470, { at: tHere });
K.tag(bA, "من هنا", { x: 840, y: 360, at: tHere + 0.05 });
K.dot(bA, 160, 470, { at: T("لهنا") });
K.tag(bA, "لهنا", { x: 160, y: 360, at: T("لهنا") + 0.05 });
const plankA = K.img(bA, OBJ + "kanz-wooden-plank-v01.png", { x: 500, y: 470, w: 720, at: T("لوح") });
gsap.set(plankA, { zIndex: 2 });
K.text(bA, num("1000") + " جنيه", { x: 500, y: 200, size: 104, head: true, color: "#d5adef", at: T("ألف"), from: "pop", sfx: "coin", gain: 0.5 });
K.img(bA, OBJ + "kanz-egp-banknote-stack-v01.png", { x: 110, y: 640, w: 190, at: T("ألف") + 0.25 });
const tGround = T("الأرض");
K.axis(bA, 60, 940, 540, { at: tGround - 0.1 });
K.tag(bA, "على الأرض", { x: 820, y: 640, at: tGround });
const tSteps = T("خطوتين");
[[650, 450], [380, 450]].forEach(([x, y], i) => K.dot(bA, x, y, { at: tSteps + i * 0.3 }));
K.arrow(bA, 260, 560, 150, 610, { at: T("الجايزة") - 0.15, bend: 20, seed: 4 });
K.text(bA, "هتوافق؟", { x: 500, y: 780, size: 70, head: true, at: T("هتوافق"), out: T("طيب") + 0.4 });

// ---------- 1b. the same plank across a volcano crater ----------
const tVol = T("طيب");
K.cam(tVol - 0.1, "volcano");
const plankB = K.img(bB, OBJ + "kanz-wooden-plank-v01.png", { x: 500, y: 420, w: 720, at: T("اللوح", 12) });
gsap.set(plankB, { zIndex: 3 });
K.img(bB, OBJ + "kanz-volcano-crater-v01.png", { x: 500, y: 470, w: 760, at: T("فوهة"), sfx: "hit", gain: 0.45 });
const volTitle = K.text(bB, "فوهة بركان", { x: 500, y: 60, size: 90, head: true, at: T("بركان") - 0.1, out: T("الألف") - 0.2 });
const tFirst = T("الأولانية");
K.dot(bB, 850, 420, { at: tFirst });
K.tag(bB, "النقطة الأولانية", { x: 840, y: 640, at: tFirst + 0.05, out: T("الألف") - 0.2 });
K.dashed(bB, 860, 230, 140, 230, { at: T("القطر"), color: "#d5adef" });
K.tag(bB, "القطر", { x: 500, y: 190, lav: true, at: T("القطر") + 0.1, out: T("الألف") - 0.2 });
K.dot(bB, 150, 420, { at: T("الأخيرة") });
K.tag(bB, "النقطة الأخيرة", { x: 160, y: 640, at: T("الأخيرة") + 0.05, out: T("الألف") - 0.2 });
K.text(bB, "هتوافق؟", { x: 500, y: 780, size: 70, head: true, at: T("هتوافق", 18), out: T("ليه", 19) - 0.3 });
K.text(bB, "ليه؟", { x: 500, y: 780, size: 110, head: true, color: "#d5adef", at: T("ليه", 19), sfx: "pop", out: T("الألف") - 0.2 });

// ---------- 1c. pull back: same prize, same distance; the cost of a mistake is what changed ----------
const tWide = T("الألف");
K.cam(tWide - 0.1, "ground", { dy: 800, scale: 0.58, dur: 0.9 });
K.text(bA, "نفس الجايزة", { x: 500, y: 975, size: 92, head: true, at: tWide + 0.3 });
K.text(bA, "نفس المسافة", { x: 500, y: 1105, size: 92, head: true, at: T("والمسافة") });
K.punch("تمن الغلطة", T("تمن"), T("وتمن") - 0.04, { size: 170 });
const tCost = T("وتمن");
K.text(bA, "تمن الغلطة", { x: 500, y: 780, size: 70, head: true, cls: "muted", at: tCost });
K.text(bB, "تمن الغلطة", { x: 500, y: 110, size: 140, head: true, color: RED, at: tCost + 0.35, from: "pop", sfx: "hit", gain: 0.45 });

// ---------- 2. two questions, not one ----------
const Q = (t) => `<div class="head" style="display:flex;align-items:center;justify-content:center;height:100%;padding:0 40px;font-size:58px;text-align:center">${t}</div>`;
const tQ = T("وعشان");
K.cam(tQ - 0.2, "questions");
K.card(b2, Q("إيه احتمال إن حاجة تمشي غلط؟"), { x: 520, y: 260, w: 780, h: 200, at: T("احتمال") - 0.2, rot: 2 });
K.card(b2, Q("ولو حصلت، هتكلّفني إيه؟"), { x: 480, y: 560, w: 780, h: 200, at: T("ولو", 30.0) - 0.1, rot: -2 });
K.underline(b2, 250, 620, 610, { at: T("هتكلّفني"), color: "#d5adef" });
K.tag(b2, "كمان", { x: 860, y: 430, lav: true, at: T("كمان") });

// ---------- 3. same stock, same drop, different lives ----------
const tTwo = T("نفس", 32.0);
K.cam(tTwo - 0.2, "two");
K.text(b3, "نفس السهم", { x: 500, y: 40, size: 64, head: true, at: T("اتنين") });
K.img(b3, OBJ + "kanz-npc-m02-neutral-v01.png", { x: 760, y: 330, w: 240, at: T("واحد", 34.8) }); // new character M02 (Ahmed 2026-10-07)
K.img(b3, OBJ + "kanz-npc-m01-neutral-v01.png", { x: 240, y: 330, w: 240, at: T("والتاني", 36.5) });
// how much of their money is in it: outline = all their money, fill = the part in the stock
K.bar(b3, { x: 760, y: 760, w: 90, h: 230, outline: true, color: "transparent", at: T("جزء", 35.5) });
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
K.text(b3, "؟", { x: 110, y: 470, size: 110, head: true, color: RED, at: T("الإيجار", 43.5), from: "pop", sfx: "hit", gain: 0.4 });
K.oval(b3, 240, 470, 200, 330, { at: T("تمامًا"), seed: 5 });

// ---------- 4. risk management: before you enter, count the loss too ----------
const tRm = T("وهنا");
K.cam(tRm - 0.3, "rm", { via: 0.42, dur: 0.9 });
K.text(b4, "إدارة المخاطر", { x: 500, y: 60, size: 90, head: true, color: "#d5adef", at: T("إدارة", 47.5) });
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
K.strike(b5, 230, 230, 770, 170, { at: T("المخاطر", 63.0) });
K.text(b5, "تقليل تأثير الخسارة", { x: 500, y: 420, size: 80, head: true, color: "#d5adef", at: T("بتقلل") });
K.underline(b5, 210, 790, 480, { at: T("تأثير", 64.0), color: "#d5adef" });
K.img(b5, OBJ + "kanz-wallet-v01.png", { x: 500, y: 660, w: 200, at: T("عليك") });

// ---------- 6. the market is dynamic, but it shouldn't carry your whole life ----------
const tLife = T("البورصة", 65.8);
K.cam(tLife - 0.2, "life");
K.axis(b6, 80, 920, 330, { at: tLife });
K.line(b6, [[100, 260], [180, 200], [250, 280], [330, 180], [410, 250], [490, 140], [570, 230], [650, 160], [730, 260], [820, 170], [900, 210]],
  { at: tLife + 0.1, dur: 1.4 });
K.tag(b6, "ديناميكي ومرن", { x: 300, y: 60, at: T("ومرن") });
K.tag(b6, "ميزة، مش عيب", { x: 700, y: 60, lav: true, at: T("ميزته") });
K.text(b6, "حياتك", { x: 500, y: 430, size: 64, head: true, at: T("حياتك", 69.5) });
K.img(b6, OBJ + "kanz-house-v01.png", { x: 760, y: 620, w: 200, at: T("حمولة") });
K.img(b6, OBJ + "kanz-wallet-v01.png", { x: 500, y: 640, w: 180, at: T("ووزن") });
K.img(b6, OBJ + "kanz-investment-chart-v01.png", { x: 240, y: 620, w: 200, at: T("ووزن") + 0.25 });
K.tag(b6, "البورصة جزء", { x: 240, y: 770, lav: true, at: T("الوحيدة") });
K.tag(b6, "مش كل حاجة", { x: 600, y: 790, at: T("متوقف") });

// ---------- 7. a hair between trading and gambling ----------
const tTh = T("شعرة");
K.cam(tTh - 0.4, "thread", { via: 0.42, dur: 0.9 });
K.text(b7, "التجارة", { x: 820, y: 400, size: 72, head: true, at: T("التجارة", 78.0) });
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
