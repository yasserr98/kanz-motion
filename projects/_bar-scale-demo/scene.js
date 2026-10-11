/* Bars to scale demo (2026-10-11): the real-estate comparison (1.1M vs 1.2M) drawn from values on one
 * scale, next to the same pair with hand-entered heights (300 / 390) that engine/lint.py flags.
 * Not an audience-facing video. */
K.look();
const A = K.board("scaled", 0, 0), B = K.board("hand", -1400, 0);
K.cam(0, "scaled");

// 1. from values: one scale per comparison, zero baseline at y 720
const S = K.scale(1200000, 390);
K.text(A, "الأسعار", { x: 800, y: 150, size: 40, cls: "muted", at: 0.2 });
K.text(A, K.num("+٢٠٪"), { x: 800, y: 240, size: 96, head: true, color: "#d5adef", at: 0.3 });
K.axis(A, 140, 860, 720, { at: 0.3 });
const have = K.bar(A, { x: 560, y: 720, w: 190, value: 1100000, scale: S, at: 0.8, color: "#c7c2cc" });
const need = K.bar(A, { x: 300, y: 720, w: 190, value: 1200000, scale: S, at: 1.4, color: "rgba(255,255,255,0)", outline: true });
K.text(A, "سعرها<br>مليون و١٠٠ ألف", { x: 560, y: 790, size: 34, w: 300, at: 0.9 });
K.text(A, "المطلوب<br>مليون و٢٠٠ ألف", { x: 300, y: 790, size: 34, w: 300, cls: "muted", at: 1.5 });
K.tag(A, "نفس القوة الشرائية", { x: 300, y: 285, lav: true, at: 2.2 });
K.delta(A, have, need, { x: 690, label: "الفرق", at: 3.0 });

// 2. the same pair by hand-entered heights: renders as before, lint reports it
K.cam(4.8, "hand");
K.axis(B, 140, 860, 720, { at: 5.0 });
K.bar(B, { x: 560, y: 720, w: 190, h: 300, at: 5.4, color: "#c7c2cc" });
K.bar(B, { x: 300, y: 720, w: 190, h: 390, at: 5.9, color: "rgba(255,255,255,0)", outline: true });
K.text(B, "بالطريقة القديمة", { x: 500, y: 150, size: 40, cls: "muted", at: 5.0 });
