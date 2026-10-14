/* portfolio-rebalancing (2026-10-14): Ahmed's script, pasted in chat, hook line changed by him. Script route,
 * "Ahmed Shaaban Shorts" clone at 1.15, retimed (69.9 -> 60.2 s). Pace + variety defaults (docs/PACE.md).
 * v2 (Ahmed's v1 notes): no snap zooms; stock-market props only: share-certificate bundles, the trading screen with
 * drawn candlesticks, drawn stock cards, bull and bear statues (Codex candidates 2026-10-14).
 * Story device: the portfolio as two piles of share-certificate bundles at true relative size (one bundle = a quarter of the
 * company's starting 5,000; only the amounts the voice says appear as numbers). The company pile triples while
 * the rest stays put, so "نصها" reads as two equal piles; the loss is half the company pile = a quarter of all.
 * Rebalancing is the balance scale (parts, as in emotional-trading): tilted to the stock, a bundle moves across,
 * it levels on "حسب خطتك".
 * Boards (snake): row 0 hook / piles / drop, row 1 trust / scale / rise, row 2 end.
 */
const tl = K.tl;
const OBJ = "../../library/objects/";
const L = "#d5adef", RED = "#e5534b", WHITE = "rgba(255,255,255,.55)";
const BUNDLE = OBJ + "kanz-share-certificate-stack-v01.png";
const SCREEN = OBJ + "kanz-trading-screen-blank-v01.png";
const BULL = OBJ + "kanz-bull-v01.png", BEAR = OBJ + "kanz-bear-v01.png";
const RISING = [[10, 13, 9, 12], [12, 14, 11, 11.5], [11.5, 15, 11, 14.5], [14.5, 16, 13.5, 15.5], [15.5, 16, 14, 14.5],
  [14.5, 18, 14, 17.5], [17.5, 19, 16.5, 18.5], [18.5, 19, 17, 17.5], [17.5, 21, 17, 20.5], [20.5, 23, 20, 22.5],
  [22.5, 23, 21, 21.5], [21.5, 25, 21, 24.5]];

// word anchor: the spoken token whose text equals `w`, nearest to `near` seconds (timings from transcript.json)
const nrm = (s) => s.replace(/[ً-ْـ*%٪،؟?!.,:؛«»…]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").trim();
function W(w, near) {
  const n = nrm(w);
  const hits = (window.TOKENS || []).filter((t) => nrm(t.w) === n);
  if (!hits.length) { console.error("anchor not found:", w); return near; }
  return hits.reduce((a, b) => (Math.abs(b.start - near) < Math.abs(a.start - near) ? b : a)).start;
}

// ---------- drawn stock-market devices (data devices like K.candles, not illustrations) ----------
// candlesticks on the approved trading screen: scr = {x, y, w} of the screen image (screen area measured from the PNG)
function screenCandles(parent, scr, o) {
  const c = K.candles(parent, { x: scr.x, y: scr.y - 0.06 * scr.w, w: 0.78 * scr.w, h: 0.36 * scr.w, data: o.data, at: o.at, dur: o.dur || 1.2 });
  c.svg.querySelectorAll('[stroke="#e9dff0"]').forEach((e) => { e.setAttribute("stroke", L); if (e.getAttribute("fill") === "#e9dff0") e.setAttribute("fill", L); });
  gsap.set(c.svg, { transformOrigin: `${scr.x}px ${scr.y}px`, zIndex: 3, pointerEvents: "none" });
  return c.svg;
}
// mirror K.img's "fly" entrance on a drawn overlay so it lands with its screen
function flyWith(el, t, o = {}) {
  tl.set(el, { autoAlpha: 0 }, 0);
  tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18, ease: "none", immediateRender: false }, t);
  tl.fromTo(el, { scale: o.fromScale || 1.9, y: o.fromY == null ? 170 : o.fromY }, { scale: 1, y: 0, duration: 0.85, ease: "power3.out", immediateRender: false }, t);
}
// a stock card like a broker app's watchlist row: name, sparkline, up/down triangle (no prices: the voice says none)
function stockCard(parent, o) {
  const col = o.down ? RED : L;
  const pts = o.down ? "0,6 24,12 46,8 68,28 90,24 112,44 134,50" : "0,50 24,42 46,46 68,26 90,30 112,12 134,6";
  const tri = o.down ? "0,0 30,0 15,24" : "15,0 30,24 0,24";
  const e = K.el("div", "abs kstock", parent,
    `<span style="font-family:'Thmanyah Display';font-weight:700;font-size:${o.size || 44}px;color:#fff;line-height:1.1">${o.label}</span>` +
    `<svg width="134" height="56" viewBox="-5 -5 144 66"><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>` +
    `<svg width="30" height="24" viewBox="0 0 30 24"><polygon points="${tri}" fill="${col}"/></svg>`);
  gsap.set(e, { left: o.x, top: o.y, xPercent: -50, yPercent: -50, display: "flex", alignItems: "center", gap: "20px", whiteSpace: "nowrap",
    padding: "16px 26px", background: "#1d1a22", border: "2px solid rgba(255,255,255,.14)", borderRadius: 20,
    boxShadow: "0 18px 40px rgba(0,0,0,.35)", zIndex: 9 });
  if (o.at != null) {
    tl.set(e, { autoAlpha: 0 }, 0);
    tl.fromTo(e, { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: "back.out(2.2)", immediateRender: false }, o.at);
    K.sfx(o.at, "click", 0.3);
  }
  if (o.out != null) tl.to(e, { autoAlpha: 0, duration: 0.25 }, o.out);
  return e;
}

K.look();
K.pace();
K.bedUnder = 30; // room tone level Ahmed approved on gamblers-fallacy v2

const B = {
  hook: K.board("hook", 0, 0), piles: K.board("piles", -1100, 0), drop: K.board("drop", -2200, 0),
  trust: K.board("trust", -2200, 1800), scale: K.board("scale", -1100, 1800), rise: K.board("rise", 0, 1800),
  end: K.board("end", 0, 3600),
};
K.cam(0, "hook");

// ---------- 1. hook: question headline + one hero (the rising chart), complete from frame 1 ----------
const tCome = W("تعالى", 4.6);
K.headline([{ html: "ليه بيع أسهم" }, { html: "إنت كسبان فيها" }, { html: "ممكن يبقى أحسن قرار" }, { html: "ممكن تاخده؟", kw: true }], { out: tCome - 0.1 });
K.captionsFrom = tCome - 0.1; // "تعالى أقولك ليه" is the first caption; the headline already says the question
K.glow(B.hook, 500, 700, 820, { out: W("تخيل", 5.6) });
const hero = K.img(B.hook, SCREEN, { x: 500, y: 720, w: 720, shadow: false });
const heroCandles = screenCandles(B.hook, { x: 500, y: 720, w: 720 }, { data: RISING });
K.settle(hero, 0, { fromScale: 1.45, fromY: 70, dur: 1.2 });
K.settle(heroCandles, 0, { fromScale: 1.45, fromY: 70, dur: 1.2 });

// ---------- 2. a 20,000 portfolio, 5,000 of it in one company: a quarter ----------
const STEP = 62, BASE = 690, XR = 320, XC = 680; // rest pile left, company pile right (named second, but on the right: RTL)
const gP = K.go(W("تخيل", 5.6), "piles", { scale: 1.3, dx: 0, dy: -30 });
const you = K.img(B.piles, OBJ + "kanz-npc-m01-phone-choice-v01.png", { x: 500, y: 470, w: 420, at: gP.lead, enter: "fly" });
const tTwenty = W("بعشرين", 7.2);
K.frame(tTwenty - 0.3, "piles");
K.dim(you, tTwenty - 0.2, 0, 0.35);
const total1 = K.count(B.piles, { x: 500, y: 110, from: 0, to: 20, suffix: " ألف جنيه", size: 92, at: tTwenty, dur: 0.9 });
K.stack(B.piles, BUNDLE, { x: XR, y: BASE, n: 6, w: 240, step: STEP, at: tTwenty + 0.05 });
const co1 = K.stack(B.piles, BUNDLE, { x: XC, y: BASE, n: 2, w: 240, step: STEP, at: tTwenty + 0.15 });
const tFive = W("خمس", 8.6);
const coTag = K.tag(B.piles, "<bdi>٥</bdi> آلاف", { x: XC, y: 815, size: 44, lav: true, at: tFive });
const tCo = W("شركة", 10.1);
const office = stockCard(B.piles, { x: XC, y: 520, label: "الشركة", at: tCo - 0.15 });
const ring = K.pointer(B.piles);
ring.to(tCo, XC, 570, 330, 300);
const tQuarter = W("ربع", 11.3);
const quarter = K.text(B.piles, "ربع محفظتك", { x: 500, y: 235, size: 78, head: true, color: L, at: tQuarter });

// ---------- 3. paper: after a while the company's part reaches 15,000; the rest stays where it was ----------
const tAfter = W("بعد", 12.3);
K.world(tAfter - 0.2, "paper");
tl.set(total1, { color: K.INK }, tAfter + 0.1);
ring.out(tAfter - 0.2);
K.dim(quarter, tAfter - 0.2, 0, 0.3);
const clock = K.img(B.piles, BULL, { x: 205, y: 260, w: 230, at: tAfter, shadow: false, enter: "fly", fromScale: 1.5 });
const tValue = W("قيمه", 13.3);
K.frame(tValue - 0.2, "piles", { scale: 1.05, dx: 60, dy: -10 });
const tFifteen = W("لخمستاشر", 15.1);
const co2 = K.stack(B.piles, BUNDLE, { x: XC, y: BASE - 2 * STEP, n: 4, w: 240, step: STEP, at: tFifteen - 0.3, stagger: 0.12, shadow: false });
co2.forEach((e, i) => gsap.set(e, { zIndex: 4 + i }));
tl.to(office, { y: -248, duration: 0.6, ease: "power2.out" }, tFifteen - 0.3);
K.dim(clock, W("وباقي", 16.5) - 0.3, 0, 0.25);
K.dim(coTag, tFifteen - 0.3, 0, 0.2);
K.count(B.piles, { x: XC, y: 815, from: 5, to: 15, suffix: " ألف", size: 54, color: K.INK, at: tFifteen - 0.1, dur: 0.6 });
const tRest = W("وباقي", 16.5);
K.frame(tRest - 0.2, "piles", { scale: 1.05, dx: -60, dy: -10 });
K.tag(B.piles, "باقي استثماراتك", { x: XR, y: 815, size: 42, at: tRest });
const ring2 = K.pointer(B.piles);
ring2.to(tRest + 0.2, XR, 490, 330, 480);
const same = K.text(B.piles, "زي ما هي", { x: XR, y: 200, size: 62, head: true, color: L, at: W("هي", 18.2) - 0.1 });

// ---------- 4. the portfolio is now 30,000 and the company is half of it, without buying a share ----------
const tThirty = W("بتلاتين", 19.5);
ring2.out(tThirty - 0.4);
K.dim(same, tThirty - 0.4, 0, 0.3);
K.frame(tThirty - 0.35, "piles");
tl.to(total1, { autoAlpha: 0, duration: 0.2 }, tThirty - 0.15);
K.count(B.piles, { x: 500, y: 110, from: 20, to: 30, suffix: " ألف جنيه", size: 92, color: K.INK, at: tThirty - 0.1, dur: 0.6 });
const tInv = W("واستثمارك", 20.7);
K.frame(tInv - 0.2, "piles", { scale: 1.06, dx: 50, dy: -20 });
const ring3 = K.pointer(B.piles);
ring3.to(tInv, XC, 490, 330, 480);
ring3.out(W("نصها", 22.1) - 0.15);
const tHalf = W("نصها", 22.1);
const half = K.dashed(B.piles, 160, 335, 840, 335, { at: tHalf - 0.3, color: K.INK });
const halfTxt = K.text(B.piles, "نصها", { x: 330, y: 235, size: 96, head: true, color: L, at: tHalf, from: "pop", sfx: "hit", gain: 0.3 });
const tBuy = W("تشتري", 23.2);
K.dim(halfTxt, tBuy - 0.4, 0, 0.25);
const cert = K.img(B.piles, OBJ + "kanz-share-certificate-v01.png", { x: 175, y: 250, w: 200, at: tBuy - 0.25, shadow: false, rot: -6 });
K.strike(B.piles, 80, 300, 270, 200, { at: W("زياده", 24.2) - 0.1, color: K.INK });

// ---------- 5. charcoal: if the stock loses half its value, you lose a quarter of the portfolio ----------
const gD = K.go(W("لو", 24.7), "drop", { scale: 1.0, dy: -20 });
K.world(gD.start, "charcoal");
K.stack(B.drop, BUNDLE, { x: XR, y: BASE, n: 6, w: 240, step: STEP, at: gD.lead, stagger: 0.02, sfx: false });
const coD = K.stack(B.drop, BUNDLE, { x: XC, y: BASE, n: 6, w: 240, step: STEP, at: gD.lead, stagger: 0.02, sfx: false });
const cardUp = stockCard(B.drop, { x: XC, y: 270, label: "الشركة", at: gD.lead });
K.tag(B.drop, "الشركة", { x: XC, y: 815, size: 42, at: gD.lead });
K.tag(B.drop, "باقي استثماراتك", { x: XR, y: 815, size: 42, at: gD.lead });
const tLose = W("خسر", 25.3);
K.img(B.drop, BEAR, { x: 500, y: 130, w: 240, at: tLose - 0.2, shadow: false, enter: "fly", fromScale: 1.6, out: W("اتغيرتش", 27.6) - 0.35 });
tl.to(cardUp, { autoAlpha: 0, duration: 0.15 }, tLose + 0.15);
stockCard(B.drop, { x: XC, y: 270, label: "الشركة", down: true, at: tLose + 0.15 });
K.dim(coD.slice(3), tLose + 0.15, 0.16, 0.5); // the top half of the company pile goes: ghosts stay to show the gap
K.arrow(B.drop, 500, 345, 500, 560, { at: tLose + 0.1, bend: 0.001, color: RED, width: 10 });
K.text(B.drop, "نص قيمته", { x: XC, y: 425, size: 46, head: true, color: RED, at: W("نص", 25.7), out: W("هتخسر", 28.5) - 0.1 });
K.tag(B.drop, "ما اتغيرتش", { x: XR, y: 215, size: 44, at: W("اتغيرتش", 27.6) });
const tLoss = W("هتخسر", 28.5);
K.rect(B.drop, XC - 140, 330, 280, 180, { at: tLoss, color: RED, width: 6 });
const tQ2 = W("ربع", 29.0);
K.text(B.drop, "ربع محفظتك", { x: 500, y: 110, size: 92, head: true, color: RED, at: tQ2 - 0.1, from: "pop", sfx: "hit", gain: 0.3 });

// ---------- 6. still convinced of the company, but your money depends on it more ----------
const gT = K.go(W("ممكن", 30.0), "trust", { scale: 1.25, dx: 150, dy: -30 });
const bldg = K.img(B.trust, OBJ + "kanz-company-office-v01.png", { x: 620, y: 400, w: 440, at: gT.lead, enter: "fly", glow: true });
const tConv = W("مقتنع", 30.8);
K.frame(tConv - 0.3, "trust");
const man = K.img(B.trust, OBJ + "kanz-npc-m01-thinking-v01.png", { x: 230, y: 470, w: 400, at: tConv - 0.15, enter: "fly", fromX: -80 });
K.text(B.trust, "مقتنع بالشركة", { x: 270, y: 160, size: 58, head: true, at: W("بالشركه", 31.2) - 0.1 });
stockCard(B.trust, { x: 620, y: 140, label: "الشركة", at: tConv + 0.2, size: 40 });
const tDep = W("اعتماد", 32.3);
K.pile(B.trust, BUNDLE, { x: 620, y: 760, n: 6, w: 170, at: tDep - 0.1, shadow: false });
const tMore = W("زاد", 33.4);
K.swap(man, OBJ + "kanz-npc-m01-worried-wallet-v01.png", tMore - 0.1);
K.arrow(B.trust, 870, 640, 870, 400, { at: tMore - 0.1, bend: 0.001, color: L, width: 10 });
K.text(B.trust, "زاد", { x: 865, y: 320, size: 72, head: true, color: L, at: tMore });

// ---------- 7. the key idea, big: portfolio rebalancing; then the scale, on paper ----------
const tReb = W("«إعادة", 35.0);
const tOr = W("أو", 36.6);
K.punch("إعادة توازن<br>المحفظة", tReb - 0.05, tOr - 0.05, { size: 150, riser: true });
K.cam(tReb + 0.15, "scale", { dur: 0.5, sfx: false }); // behind the punch
K.world(tReb + 0.15, "paper", { sfx: false });
const F = 820 / 1254, CX = 500, CY = 560;
const PIV = [CX, CY + (597 - 627) * F], ARM = 352 * F, PAN_W = 1254 * 0.42 * F, PAN_DY = -68.9 * F;
const sBase = K.img(B.scale, OBJ + "kanz-balance-scale-base-v01.png", { x: CX, y: CY, w: 820, at: tReb + 0.15, sfx: false, shadow: false });
const beamW = 1254 * 0.8 * F;
const beam = K.img(B.scale, OBJ + "kanz-balance-scale-beam-v01.png", { x: CX, y: PIV[1] - 27 * 0.8 * F, w: beamW, at: tReb + 0.15, shadow: false, sfx: false });
gsap.set(beam, { transformOrigin: `${beamW / 2}px ${beamW / 2 + 27 * 0.8 * F}px`, zIndex: 0 });
gsap.set(sBase, { zIndex: 1 });
let tilt = 0;
const panAt = (side, deg) => { const a = deg * Math.PI / 180, d = side * ARM; return [PIV[0] + d * Math.cos(a), PIV[1] + d * Math.sin(a)]; };
const pans = {}, loads = { 1: [], [-1]: [] };
[1, -1].forEach((s) => {
  const [x, y] = panAt(s, 0);
  pans[s] = K.img(B.scale, OBJ + "kanz-balance-scale-pan-v01.png", { x, y: y + PAN_DY, w: PAN_W, at: tReb + 0.15, shadow: false, sfx: false });
  gsap.set(pans[s], { zIndex: 2 });
});
function load(side, src, o) {
  const [x, y] = panAt(side, tilt);
  const e = K.img(B.scale, src, { x, y: y + PAN_DY - o.h, w: o.w, at: o.at, sfx: o.sfx || false, shadow: false });
  gsap.set(e, { zIndex: 3 + loads[side].length });
  loads[side].push([e, o.h]);
  return e;
}
function tiltTo(t, deg, dur = 0.9) {
  tilt = deg;
  tl.to(beam, { rotation: deg, duration: dur, ease: "back.out(1.4)" }, t);
  [1, -1].forEach((s) => {
    const [x, y] = panAt(s, deg);
    tl.to(pans[s], { left: x, top: y + PAN_DY, duration: dur, ease: "back.out(1.4)" }, t);
    loads[s].forEach(([e, h]) => tl.to(e, { left: x, top: y + PAN_DY - h, duration: dur, ease: "back.out(1.4)" }, t));
  });
  K.sfx(t, "hit", 0.3);
}
// right pan = the stock (three bundles), left pan = the other investments (one bundle); starts level behind the punch
[0, 1, 2].forEach((i) => load(1, BUNDLE, { w: 210, h: 50 + i * 44, at: tReb + 0.15 }));
load(-1, BUNDLE, { w: 210, h: 50, at: tReb + 0.15 });
K.text(B.scale, "Rebalancing", { x: 500, y: 800, size: 84, head: true, color: L, at: W("Rebalancing", 37.1), from: "pop" });
const tWeight = W("وزن", 38.3);
stockCard(B.scale, { x: 760, y: 200, label: "السهم", at: W("السهم", 38.6) - 0.1, size: 46 });
K.img(B.scale, OBJ + "kanz-ticker-board-v01.png", { x: 250, y: 205, w: 260, at: tWeight, shadow: false, enter: "fly", fromScale: 1.5 });
K.text(B.scale, "استثمارات تانية", { x: 250, y: 75, size: 44, head: true, at: tWeight + 0.1 });
K.frame(tWeight - 0.2, "scale", { scale: 1.05, dy: -20 });
tiltTo(W("أكبر", 39.2), 16);
// sell part: the top bundle lifts off the stock's pan and lands on the other side
const tSell = W("تبيع", 41.4);
K.frame(tSell - 0.3, "scale");
const moved = loads[1].pop()[0];
tl.to(moved, { top: "-=150", rotation: -8, duration: 0.45, ease: "power2.out" }, tSell);
K.sfx(tSell, "whoosh", 0.25);
const tSpread = W("وتوزع", 42.2);
{
  const [x, y] = panAt(-1, tilt), h = 94;
  tl.to(moved, { left: x, top: y + PAN_DY - h, rotation: 0, duration: 0.6, ease: "power2.inOut" }, tSpread);
  gsap.set(moved, { zIndex: 6 });
  loads[-1].push([moved, h]);
  K.sfx(tSpread + 0.55, "coin", 0.35);
}
const across = K.arrow(B.scale, 640, 330, 370, 330, { at: tSpread, bend: 70, color: K.INK });
const tPlan = W("خطتك", 44.3);
tiltTo(tPlan - 0.3, 0);
K.dim(across, tPlan - 0.4, 0, 0.3);
K.text(B.scale, "حسب خطتك", { x: 520, y: 315, size: 66, head: true, color: L, at: tPlan - 0.1 });

// ---------- 8. charcoal: and if it keeps rising? you gain on what you kept, less than on the whole ----------
const gR = K.go(W("طب", 45.0), "rise", { scale: 1.2, dy: -60 });
K.world(gR.start, "charcoal");
const up = K.img(B.rise, SCREEN, { x: 500, y: 400, w: 640, at: gR.lead, enter: "fly", glow: true, shadow: false });
const upC = screenCandles(B.rise, { x: 500, y: 400, w: 640 }, { data: RISING, at: gR.lead + 0.6, dur: 1.4 });
const upTag = K.tag(B.rise, "كمل صعود؟", { x: 500, y: 740, size: 52, lav: true, at: W("صعود", 45.7) - 0.1 });
const tGain = W("هتستفيد", 46.4);
K.frame(tGain - 0.2, "rise");
const tQty = W("الكميه", 47.7);
K.dim([up, upTag, upC], tQty - 0.3, 0, 0.35); // the bars replace the chart
K.frame(tQty - 0.25, "rise", { scale: 1.08, dy: 60 });
const S = K.scale(100, 520);
const kept = K.bar(B.rise, { x: 690, y: 820, w: 300, value: 60, scale: S, color: L, at: tQty - 0.2, illustrative: true });
K.text(B.rise, "اللي فضلت معاك", { x: 690, y: 460, size: 46, head: true, at: W("فضلت", 48.4) - 0.1 });
const tYour = W("مكسبك", 49.5);
const whole = K.bar(B.rise, { x: 310, y: 820, w: 300, value: 100, scale: S, at: tYour - 0.1, illustrative: true });
const tLess = W("أقل", 50.8);
K.delta(B.rise, kept, whole, { x: 530, at: tLess - 0.15 });
K.text(B.rise, "أقل", { x: 690, y: 370, size: 80, head: true, color: L, at: tLess - 0.1, from: "pop", sfx: "hit", gain: 0.3 });
K.text(B.rise, "الكمية كلها", { x: 310, y: 250, size: 46, head: true, at: W("بالكميه", 52.0) - 0.1 });

// ---------- 9. rebalancing does not guarantee a gain; it sizes the company to the risk you can carry ----------
const gE = K.go(W("إعادة", 53.0), "end", { scale: 1.2, dy: -20 });
const shield = K.img(B.end, BULL, { x: 500, y: 430, w: 600, at: gE.lead, enter: "fly", glow: true });
const tNot = W("بتضمنش", 54.1);
const cross = K.strike(B.end, 270, 650, 730, 190, { at: tNot, color: RED, width: 12 });
const noG = K.text(B.end, "ما بتضمنش المكسب", { x: 500, y: 770, size: 60, head: true, at: W("المكسب", 54.7) - 0.1 });
const tHelp = W("بتساعدك", 55.6);
K.frame(tHelp - 0.25, "end");
K.dim([shield, noG, cross], tHelp - 0.25, 0, 0.35); // replaced by the level scale
K.img(B.end, OBJ + "kanz-balance-scale-v01.png", { x: 500, y: 450, w: 640, at: tHelp - 0.15, enter: "fly", glow: true });
K.tag(B.end, "حجم استثمارك", { x: 500, y: 200, size: 48, at: W("حجم", 56.5) });
K.text(B.end, "مناسب للمخاطرة", { x: 500, y: 720, size: 66, head: true, color: L, at: W("مناسب", 58.1) });

// ---------- ending: back to the hook on the last word, the thesis big, ~1.3 s tail ----------
const tLast = (window.TOKENS || []).slice(-1)[0].end;
const tBack = tLast - 0.15;
K.cam(tBack, "hook", { dur: 0.04, sfx: false });
K.sfx(tBack, "whoosh", 0.25);
K.glow(B.hook, 500, 700, 800, { at: tBack });
K.img(B.hook, SCREEN, { x: 500, y: 700, w: 700, at: tBack - 0.04, enter: "fly", fromScale: 1.45, fromY: 60, sfx: false, shadow: false });
flyWith(screenCandles(B.hook, { x: 500, y: 700, w: 700 }, { data: RISING }), tBack - 0.04, { fromScale: 1.45, fromY: 60 });
tl.set([hero, heroCandles], { autoAlpha: 0 }, W("تخيل", 5.6) + 0.6);
K.takeaway(B.hook, "مناسب للمخاطرة اللي <span class='kw'>تقدر تتحمّلها</span>", { x: 500, y: 110, size: 88, at: tBack + 0.1, glow: false });
K.duration = tLast + 1.3;
K.finish();
