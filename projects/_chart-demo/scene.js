/* Charts demo (2026-10-11): K.area with an event marker, then K.candles with the swings marked.
 * Illustrative shapes, no market data. Not an audience-facing video. */
K.look();
const A = K.board("line", 0, 0), B = K.board("candles", -1400, 0);
K.cam(0, "line");
K.text(A, "اتسعّر <span class='kw'>بالفعل؟</span>", { x: 500, y: 40, size: 88, head: true, at: 0.1 });
K.area(A, { x: 500, y: 470, w: 820, h: 480, data: [10, 12, 11, 14, 13, 16, 15, 19, 18, 22, 26, 31], min: 8, max: 32,
  at: 0.4, dur: 2.2, marker: { i: 9, label: "إعلان الأرباح" } });

K.cam(4.0, "candles");
K.text(B, "جوه <span class='kw'>السعر</span>", { x: 500, y: 40, size: 88, head: true, at: 4.1 });
const path = [45, 50, 56, 62, 70, 78, 86, 90, 84, 72, 58, 42, 30, 24, 20, 27, 33, 40, 36, 44, 50, 57];
const data = path.slice(1).map((c, i) => { const o = path[i]; return [o, Math.max(o, c) + 3, Math.min(o, c) - 3, c]; });
const C = K.candles(B, { x: 500, y: 520, w: 860, h: 520, data, at: 4.3, dur: 1.8 });
K.oval(B, C.x(6), C.y(90), 110, 90, { at: 6.2 });
K.text(B, "النشوة", { x: C.x(6) + 200, y: C.y(90) - 90, size: 64, head: true, color: "#d5adef", at: 6.3 });
K.text(B, "الهلع", { x: C.x(13) - 210, y: C.y(30), size: 60, head: true, at: 6.8 });
