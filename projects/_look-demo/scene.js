/* Look v2 component demo (2026-10-10): every new component once, on fixed seconds, no voice.
 * Not an audience-facing video. Run: python engine/render.py projects/_look-demo --stills ... and engine/lint.py */
const OBJ = "../../library/objects/";
K.look();
const A = K.board("hook", 0, 0), B = K.board("doc", -1400, 0, { h: 900 }), C = K.board("nums", -2800, 0), D = K.board("place", 0, 1400);
K.cam(0, "hook");

// 1. hook: hero object large, lit, grounded; blurred foreground and faint background give depth
K.headline([{ html: "هل فعلًا العقار", at: 0.3 }, { html: "مبيخسرش؟", kw: true, at: 0.9 }], { out: 3.3 });
K.bgObj(A, OBJ + "kanz-factory-v01.png", { x: 820, y: 330, w: 300, at: 0.2 });
K.img(A, OBJ + "kanz-house-v01.png", { x: 500, y: 520, w: 560, at: 0.2, glow: true, float: true });
K.fg(A, OBJ + "kanz-egp-banknote-stack-v01.png", { x: 60, y: 800, w: 420, at: 0.6 });
K.push(1.2, "hook", 1.16, 2.2);

// 2. evidence: genuine screenshot, highlight on the spoken phrase, frame on the title, camera onto the phrase
K.cam(3.5, "doc");
const doc = K.doc(B, "assets/wikipedia-inflation-top-2026-10-10.png", { x: 500, y: 430, w: 820, at: 3.8, source: "ويكيبيديا · تضخم اقتصادي · ١٠/١٠/٢٠٢٦" });
K.docMark(doc, 548, 292, 292, 22, { at: 5.4 });
K.docMark(doc, 688, 86, 156, 38, { at: 6.4, frame: true });
K.docFocus(7.0, doc, 690, 300, 1.55, 1.4);

// 3. numbers become things
K.cam(9.6, "nums");
K.tag(C, "مثال افتراضي", { x: 500, y: 90, at: 9.9 });
K.count(C, { x: 500, y: 250, from: 0, to: 1000000, at: 10.0, dur: 1.4, size: 130, step: 1000, suffix: ' <span style="font-size:.5em">جنيه</span>' });
K.pile(C, OBJ + "kanz-coins-v01.png", { x: 300, y: 700, n: 10, w: 120, at: 11.6 });
K.stack(C, OBJ + "kanz-egp-banknote-v01.png", { x: 720, y: 760, n: 7, w: 170, at: 12.4 });

// 4. place and photo mechanics (outline + pins), photo treatment on the same genuine screenshot
K.cam(15.0, "place", { via: 0.8 });
K.photo(D, "assets/wikipedia-inflation-2026-10-10.png", { x: 280, y: 330, w: 380, h: 470, at: 15.4, credit: "ويكيبيديا · ٢٠٢٦", pos: "60% 60%" });
K.outline(D, "M560 250 L880 230 L900 520 L700 640 L560 560 Z", { at: 16.4 });
K.pin(D, 640, 330, "نقطة أ", { at: 17.4 });
K.pin(D, 800, 520, "نقطة ب", { at: 18.0 });
K.glow(D, 720, 430, 520, { at: 16.4 });
