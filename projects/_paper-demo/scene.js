/* Paper world demo (2026-10-11): a charcoal chapter, a paper chapter, back to charcoal. Inflation copy,
 * illustrative chart. Not an audience-facing video. */
const OBJ = "../../library/objects/", L = "#d5adef";
K.look();
const A = K.board("a", 0, 0), B = K.board("b", -1400, 0), C = K.board("c", -2800, 0);
K.cam(0, "a");
K.img(A, OBJ + "kanz-egp-banknote-v01.png", { x: 500, y: 430, w: 560, glow: true });
K.text(A, "العملة بتفقد <span class='kw'>قيمتها</span>", { x: 500, y: 60, size: 80, head: true });

K.world(2.8, "paper");
K.cam(2.8, "b");
K.text(B, "الحرامي <span class='kw'>الخفي</span>", { x: 500, y: 40, size: 104, head: true, at: 3.2 });
K.img(B, OBJ + "kanz-thief-hand-v01.png", { x: 520, y: 420, w: 640, at: 3.4 });
K.tag(B, "القوة الشرائية لفلوسك", { x: 520, y: 760, at: 4.0 });
K.tag(B, "بتقل", { x: 820, y: 640, lav: true, at: 4.6, rot: -5 });

K.world(6.4, "charcoal");
K.cam(6.4, "c");
K.text(C, "جزء أساسي من <span class='kw'>النظام</span>", { x: 500, y: 40, size: 84, head: true, at: 6.7 });
K.area(C, { x: 500, y: 470, w: 760, h: 420, data: [100, 102, 104.1, 106.1, 108.2, 110.4], min: 96, max: 112, at: 6.9, dur: 1.4 });
K.duration = 9.5;
