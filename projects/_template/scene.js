/* Scene template. Boards are areas of one continuous world; the camera moves between them.
 * Anchor every entrance to a word in the voice: N("word") in script order, or T("word", afterSeconds).
 * Defaults for new videos (Ahmed, 2026-10-11; docs/LOOK-V2.md section 9): complete first frame, fill the frame,
 * charts with weight, bars to scale, paper world for 1-2 chapters, takeaway ending.
 * Worked examples: projects/_sample-real-estate-v3/, _paper-demo/, _chart-demo/, _bar-scale-demo/. */
const { N, T, num } = K;
const OBJ = "../../library/objects/";
K.look(); // look v2 (docs/LOOK-V2.md): safe zones, light, contact shadows. Call before the first K.cam()
const hook = K.board("hook", 0, 0), b2 = K.board("two", -1400, 0);
K.cam(0, "hook");

// ---------- hook: complete from frame 1 (no `at` on the hero or the headline parts); movement starts after ----------
K.headline([{ html: "عنوان" }, { html: "السؤال؟", kw: true }], { out: T("الكلمة") - 0.25 }); // out: first word of the next chapter
K.img(hook, OBJ + "kanz-house-v01.png", { x: 500, y: 500, w: 580, glow: true, float: true }); // hero 500-600 px
K.push(0.4, "hook", 1.12, 2.0);

// ---------- next chapter ----------
const t2 = N("الكلمة");
K.cam(t2 - 0.3, "two");
// K.world(t2 - 0.3, "paper");  // paper world for 1-2 chapter turns (a definition, the key idea); K.world(t, "charcoal") to return
// K.area(b2, { x: 500, y: 470, w: 760, h: 420, data: [100, 104, 103, 110, 120], min: 96, max: 121, at: t2 + 0.3, dur: 1.2 }); // time left -> right
// const S = K.scale(1200000, 390); // one scale per comparison; bars share the zero baseline y
// const a = K.bar(b2, { x: 560, y: 720, w: 190, value: 1100000, scale: S, at: t2 });
// const b = K.bar(b2, { x: 300, y: 720, w: 190, value: 1200000, scale: S, at: t2 + 0.5, outline: true });
// K.delta(b2, a, b, { x: 690, label: "الفرق", at: t2 + 1.0 });

// ---------- ending: back to the hook board, the spoken question or thesis big, held ~2 s ----------
const tEnd = T("آخر", t2) + 0.5; // last spoken word
K.cam(tEnd, "hook", { via: 0.42, dur: 0.9 });
K.takeaway(hook, "الفكرة <span class='kw'>الأساسية</span>", { x: 500, y: 40, size: 112, at: tEnd + 0.6 }); // words the voice said
K.duration = (window.DURATION || 5) + 2.4;
