/* gamblers-fallacy (2026-10-13): Ahmed's script, Ahmed Shaaban Shorts clone at 1.15, retimed (99.6 -> 86.9 s).
 * Pace defaults (docs/PACE.md), copied from projects/us-dollar-decisions-pace.
 * Spins are shown as result discs (a data device, like bars): black discs with a white rim, red discs in roulette red.
 * v2 (Ahmed 2026-10-13): casino objects generated with Codex (candidates, library/objects/PROVENANCE-2026-10-13-casino.md):
 * roulette wheel (hook hero), croupier at a roulette table, gamblers G01/G02 (men in suits); a drawn betting layout to
 * explain on; quieter room tone.
 * Numbers on screen are only the ones the voice says (1913, 15, 26, 25), in the script's Western digits.
 */
const { N, T } = K;
const tl = K.tl;
const OBJ = "../../library/objects/";
const L = "#d5adef", RED = "#e5534b";
const WHITE = "rgba(255,255,255,.55)";
const CHIPS = OBJ + "kanz-poker-chips-v01.png";
const WHEEL = OBJ + "kanz-roulette-wheel-v01.png";

K.look();
K.pace();
K.bedUnder = 30; // room tone 30 dB under the voice (v1: 21; Ahmed 2026-10-13: "too loud")

// ---------- world: snake layout, neighbours 1,100 px apart in a row, rows 1,800 apart ----------
const B = {
  hook: K.board("hook", 0, 0), streak: K.board("streak", -1100, 0), bet: K.board("bet", -2200, 0),
  belief: K.board("belief", -2200, 1800), lost: K.board("lost", -1100, 1800), mistake: K.board("mistake", 0, 1800),
  indep: K.board("indep", 0, 3600), name: K.board("name", -1100, 3600), market: K.board("market", -2200, 3600),
  buy: K.board("buy", -2200, 5400), must: K.board("must", -1100, 5400), diff: K.board("diff", 0, 5400),
  past: K.board("past", 0, 7200),
};
K.cam(0, "hook");

// a roulette result: a disc that pops in on its spin. Black = dark with a white rim; red = roulette red.
function disc(parent, x, y, d, col, at, o = {}) {
  const e = K.el("div", "abs", parent);
  gsap.set(e, { left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: "50%",
    background: col === "red" ? RED : "#141216",
    border: `${Math.max(4, d * 0.06)}px solid rgba(255,255,255,.9)`,
    boxShadow: `inset 0 0 0 ${d * 0.12}px ${col === "red" ? "#c43f38" : "#262229"}, 0 ${d * 0.08}px ${d * 0.2}px rgba(0,0,0,.45)` });
  if (at != null) {
    gsap.set(e, { autoAlpha: 0 });
    tl.fromTo(e, { scale: o.fromScale || 0.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.28, ease: "back.out(2.4)", immediateRender: false }, at);
    if (o.sfx !== false) K.sfx(at, "click", o.gain || 0.22);
  }
  return e;
}
// a grid of n black results filling right -> left, row by row, between t0 and t1
function streak(parent, n, x0, y0, d, gap, perRow, t0, t1, skip = 0) {
  const out = [];
  for (let i = skip; i < n; i++) {
    const r = Math.floor(i / perRow), c = i % perRow;
    const at = t0 + ((i - skip) / Math.max(1, n - skip - 1)) * (t1 - t0);
    out.push(disc(parent, x0 - c * (d + gap), y0 + r * (d + gap), d, "black", at, { sfx: (i - skip) % 2 === 0, gain: 0.16 }));
  }
  return out;
}
// the roulette betting layout (v2, Ahmed 2026-10-13: "a roulette board and you explaining on it"). Drawn, not generated,
// so the numbers stay sharp and cells can be pointed at. European layout: 0, then 1-36 in 3 rows x 12 columns
// (top row 3, 6 ... 36), red/black as on a real table, and the red/black boxes underneath. Numbers read left -> right
// like a real table (a market-chart exception, not a text sequence). Returns { el, cell(n), redBox, blackBox }.
const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
function layout(parent, cx, cy, o = {}) {
  const cw = o.cw || 66, chh = o.ch || 84, W = cw * 13 + 24, H = chh * 4 + 40;
  const el = K.el("div", "abs", parent);
  gsap.set(el, { left: cx - W / 2, top: cy - H / 2, width: W, height: H, borderRadius: 18, background: "#26252b",
    boxShadow: "0 30px 60px rgba(0,0,0,.5), inset 0 0 0 3px rgba(255,255,255,.08)" });
  const pos = {};
  const cell = (x, y, w, h, html, bg, size) => {
    const c = K.el("div", "abs", el, html);
    gsap.set(c, { left: x, top: y, width: w, height: h, background: bg, border: "2px solid rgba(255,255,255,.75)",
      color: "#fff", fontFamily: "'IBM Plex Sans Arabic'", fontWeight: 700, fontSize: size || 30, display: "flex",
      alignItems: "center", justifyContent: "center", boxSizing: "border-box" });
    return c;
  };
  cell(12, 12, cw, chh * 3, "0", "#3a3940", 30);
  pos[0] = [cx - W / 2 + 12 + cw / 2, cy - H / 2 + 12 + chh * 1.5];
  for (let n = 1; n <= 36; n++) {
    const col = Math.ceil(n / 3) - 1, row = 2 - ((n - 1) % 3);
    const x = 12 + cw * (col + 1), y = 12 + chh * row;
    cell(x, y, cw, chh, String(n), REDS.has(n) ? RED : "#141216");
    pos[n] = [cx - W / 2 + x + cw / 2, cy - H / 2 + y + chh / 2];
  }
  const by = 12 + chh * 3 + 16, bw = cw * 4;
  const dia = (bg) => `<span style="display:block;width:${chh * 0.55}px;height:${chh * 0.55}px;background:${bg};transform:rotate(45deg);border:2px solid rgba(255,255,255,.8)"></span>`;
  const red = cell(12 + cw * 3, by, bw, chh, dia(RED), "transparent");
  const black = cell(12 + cw * 7, by, bw, chh, dia("#141216"), "transparent");
  const box = (x) => [cx - W / 2 + x + bw / 2, cy - H / 2 + by + chh / 2];
  if (o.at != null) {
    gsap.set(el, { autoAlpha: 0 });
    tl.fromTo(el, { autoAlpha: 0, scale: 1.25, y: 60 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: "power3.out", immediateRender: false }, o.at);
    K.sfx(o.at, "paper", 0.35);
  }
  return { el, W, H, cell: (n) => pos[n], redBox: box(12 + cw * 3), blackBox: box(12 + cw * 7), red, black };
}

// ---------- 1. hook: headline + one hero (the roulette wheel), complete from frame 1 ----------
const gStreak = K.go(T("لعبة"), "streak", { scale: 1.3, dx: 0, dy: -40 });
K.headline([{ html: "سنة " + K.num("1913") + "،" }, { html: "أغرب حادثة" }, { html: "في تاريخ القمار", kw: true }], { out: gStreak.start });
// captions from the first frame (Ahmed 2026-10-14: "first few seconds dont have a caption"; the headline is not the spoken line)
K.glow(B.hook, 500, 500, 870, { out: gStreak.start });
const hero = K.img(B.hook, WHEEL, { x: 500, y: 500, w: 640, float: true, shadow: false });
K.settle(hero, 0, { fromScale: 1.45, fromY: 70, dur: 1.2 });

// ---------- 2. roulette: black once, twice, three times ... then 15 in a row ----------
K.carry(hero, "streak", gStreak.start, { x: 500, y: 470, w: 420, opacity: 0, dur: 0.55 });
const table = K.img(B.streak, OBJ + "kanz-roulette-table-croupier-v01.png", { x: 500, y: 470, w: 820, at: gStreak.lead, enter: "fly", fromScale: 1.5 });
K.glow(B.streak, 500, 470, 700, { at: gStreak.arrive, out: K.T("مرة،") - 0.3 });
const ttl = K.text(B.streak, "الروليت", { x: 500, y: 110, size: 76, head: true, at: gStreak.lead });
K.dim(table, K.T("الأسود") - 0.2, 0.12, 0.35); // the table steps back behind the results
K.frame(K.T("واتنين،") - 0.25, "streak"); // pull out so the third disc lands in frame
const big = [N("مرة،"), N("واتنين،"), N("وتلاتة.")].map((t, i) => disc(B.streak, 770 - i * 270, 420, 220, "black", t - 0.05, { gain: 0.35 }));
K.tag(B.streak, "أسود", { x: 770, y: 590, size: 44, at: K.T("الأسود", gStreak.start) });
const tTill = N("لحد"), tBlk = N("الأسود"), t15 = N("15");
K.frame(tTill - 0.2, "streak");
K.dim([...big, ttl, table], tTill, 0, 0.3); // the three big discs give way to the full run
streak(B.streak, 15, 860, 300, 120, 30, 5, tBlk - 0.1, t15 + 0.1);
K.count(B.streak, { x: 500, y: 110, from: 1, to: 15, at: tBlk, dur: t15 - tBlk + 0.1, size: 130, digits: "en", sfx: false });
K.text(B.streak, "مرة ورا بعض", { x: 500, y: 790, size: 56, head: true, color: L, at: N("ورا") });

// ---------- 3. the crowd bets more money on red ----------
const tHere = N("هنا");
const gBet = K.go(tHere, "bet", { scale: 1.06, dy: 40 });
K.carry(hero, "bet", gBet.start, { x: 500, y: 300, w: 300, opacity: 0, dur: 0.55 });
const lay = layout(B.bet, 500, 340, { cw: 60, ch: 70, at: gBet.lead - 0.1 });
K.img(B.bet, OBJ + "kanz-npc-gamblers-back-v01.png", { x: 500, y: 740, w: 600, at: gBet.lead, enter: "fly", fromY: 200 });
const tMoney = N("بفلوس");
K.frame(tMoney - 0.25, "bet");
const [rx, ry] = lay.redBox;
[0, 1, 2].forEach((i) => K.img(B.bet, CHIPS, { x: rx - 50 + i * 50, y: ry - 10 - i * 8, w: 110, at: tMoney + i * 0.2, enter: "fly", fromY: 260, fromScale: 1.6, shadow: false }));
const tRed = N("الأحمر.");
const ringBet = K.pointer(B.bet);
ringBet.to(tRed - 0.15, rx, ry, 300, 120);
const redBig = disc(B.bet, rx, ry, 90, "red"); // hidden here; it rides to the next board as the "red" idea
gsap.set(redBig, { opacity: 0 });
K.text(B.bet, "على الأحمر", { x: 500, y: 95, size: 64, head: true, color: L, at: tRed });
const tWhy = N("ليه؟");
K.punch("<span class='kw'>ليه؟</span>", tWhy - 0.05, tWhy + 0.65, { size: 170 });

// ---------- 4. they were sure black can't keep coming; red's turn must be next ----------
const tSure = N("لأنهم");
const gBelief = K.go(tSure, "belief", { scale: 1.3, dx: 220, dy: -40 });
K.carry(redBig, "belief", gBelief.start, { x: 290, y: 420, w: 260, opacity: 0.3, dur: 0.55 });
K.img(B.belief, OBJ + "kanz-npc-g01-pointing-v01.png", { x: 740, y: 480, w: 500, at: gBelief.lead, enter: "fly" });
const tImp = N("مستحيل");
K.frame(tImp - 0.3, "belief");
const thoughtBlack = [0, 1, 2].map((i) => disc(B.belief, 440 - i * 130, 150, 110, "black", tImp + 0.1 + i * 0.12, { gain: 0.15 }));
K.text(B.belief, "مستحيل يفضل يطلع", { x: 310, y: 270, size: 46, head: true, at: N("يفضل") });
K.strike(B.belief, 120, 150, 500, 150, { at: N("كل") + 0.05, color: "#fff" });
tl.to(redBig, { opacity: 1, scale: "+=0.15", duration: 0.35, ease: "back.out(2)" }, N("الأحمر") - 0.1);
K.glow(B.belief, 290, 420, 460, { at: N("أكيد") - 0.1 });
const tTurn = N("دوره.");
K.tag(B.belief, "جه دوره", { x: 290, y: 620, lav: true, size: 52, at: tTurn - 0.1 });

// ---------- 5. black kept coming, to 26 in a row; people lost huge sums ----------
const tBut = N("بس");
const gLost = K.go(tBut, "lost", { scale: 1.08, dy: -40 });
K.carry(redBig, "lost", gLost.start, { x: 500, y: 830, w: 140, opacity: 0, dur: 0.5 });
// the first 15 arrive built (the run so far), 11 more drop in up to "26"
const tShow = N("يظهر"), t26 = N("26");
const run26 = streak(B.lost, 15, 880, 250, 110, 16, 7, gLost.lead, gLost.lead + 0.35)
  .concat(streak(B.lost, 26, 880, 250, 110, 16, 7, tShow, t26, 15));
K.count(B.lost, { x: 500, y: 130, from: 15, to: 26, at: tShow, dur: t26 - tShow + 0.15, size: 130, digits: "en", sfx: false });
const tBang = N("بعض!");
const again = K.text(B.lost, "مرة ورا بعض", { x: 500, y: 760, size: 56, head: true, color: L, at: tBang - 0.2 });
const tLoss = N("والناس");
K.frame(tLoss - 0.25, "lost", { scale: 1.08, dy: 70 });
K.dim(run26, tLoss - 0.25, 0.25, 0.35);
K.dim(again, tLoss - 0.25, 0, 0.3);
K.img(B.lost, OBJ + "kanz-money-bag-spill-v01.png", { x: 330, y: 560, w: 380, at: tLoss - 0.1, enter: "fly", glow: true });
K.img(B.lost, OBJ + "kanz-npc-g01-lost-v01.png", { x: 760, y: 560, w: 380, at: N("خسرت") - 0.1, enter: "fly", fromX: 60 });
K.text(B.lost, "مبالغ ضخمة", { x: 330, y: 840, size: 64, head: true, color: RED, at: N("ضخمة.") - 0.1 });

// ---------- 6. paper chapter: the mistake. They thought each black raised red's chance ----------
const tMist = N("طب");
const gMist = K.go(tMist, "mistake", { scale: 1.25, dy: -120 });
K.world(gMist.start, "paper");
const qMist = K.text(B.mistake, "إيه الغلطة؟", { x: 450, y: 520, size: 96, head: true, color: L, at: gMist.lead });
K.snap(N("الغلطة") + 0.05, 1.2, 0.5);
const tThought = N("إنهم");
K.frame(tThought - 0.25, "mistake");
K.dim(qMist, tThought - 0.25, 0, 0.3);
N("الأسود");
K.img(B.mistake, OBJ + "kanz-npc-g02-neutral-v01.png", { x: 790, y: 560, w: 380, at: tThought - 0.1, enter: "fly", fromX: 60 });
const each = [0, 1, 2, 3].map((i) => disc(B.mistake, 700 - i * 170, 300, 140, "black", gMist.lead + 0.1 + i * 0.1, { gain: 0.15 }));
// the belief: red's bar grows with every black (the wrong idea, drawn as a rising arrow)
const tChance = N("فرصة");
const redSmall = disc(B.mistake, 190, 560, 150, "red", tChance - 0.1);
const wrongUp = K.arrow(B.mistake, 330, 640, 600, 470, { at: N("بتزيد.") - 0.25, bend: 20, color: K.INK, width: 10 });
K.text(B.mistake, "فرصة الأحمر بتزيد", { x: 450, y: 720, size: 50, head: true, color: K.INK, at: tChance });
K.strike(B.mistake, 300, 560, 620, 520, { at: N("مع") + 0.05, color: RED, width: 11 });
const tIndep = N("مستقلة");
// every spin on its own: dashed separators between the discs
[0, 1, 2].map((i) => K.dashed(B.mistake, 615 - i * 170, 210, 615 - i * 170, 390, { at: tIndep - 0.2 + i * 0.1, color: K.INK }));
K.tag(B.mistake, "كل لفة مستقلة", { x: 450, y: 120, lav: true, size: 52, at: tIndep });
K.dim([redSmall, wrongUp], tIndep + 0.3, 0.25, 0.4);

// ---------- 7. paper: even after 25 blacks, red's chance on the next spin is the same as on the first ----------
const tEven = N("يعني");
const gIndep = K.go(tEven, "indep", { scale: 1.25, dx: 180, dy: -40 });
const tBlk25 = N("الأسود"), t25 = N("25");
const run25 = streak(B.indep, 25, 900, 260, 84, 14, 5, gIndep.lead, t25);
const c25 = K.count(B.indep, { x: 705, y: 140, from: 1, to: 25, at: tBlk25, dur: t25 - tBlk25 + 0.1, size: 110, digits: "en", sfx: false, color: K.INK });
const n25 = K.text(B.indep, "مرة", { x: 705, y: 728, size: 56, head: true, color: K.INK, at: N("مرة،") - 0.1 });
const tNext = N("احتمالية");
K.frame(tNext - 0.25, "indep");
K.dim([...run25, n25, c25], tNext - 0.3, 0, 0.3);
const lay2 = layout(B.indep, 500, 430, { at: tNext - 0.2 });
const ring = K.pointer(B.indep);
ring.to(N("الأحمر") - 0.1, ...lay2.redBox, 300, 120);
const tSpin = N("بعدها");
ring.to(tSpin - 0.1, ...lay2.blackBox, 300, 120);
const tSame = N("هي");
ring.out(tSame - 0.1);
K.highlight(B.indep, ...lay2.redBox, 280, 100, { at: tSame - 0.1, color: "rgba(213,173,239,.45)" });
K.highlight(B.indep, ...lay2.blackBox, 280, 100, { at: tSame + 0.1, color: "rgba(213,173,239,.45)" });
K.text(B.indep, "=", { x: 500, y: lay2.redBox[1], size: 90, head: true, color: K.INK, at: tSame + 0.2 });
K.text(B.indep, "هي هي", { x: 500, y: 140, size: 96, head: true, color: L, at: tSame - 0.05, from: "pop", sfx: "hit", gain: 0.3 });
K.text(B.indep, "من أول لفة", { x: 500, y: 700, size: 56, head: true, color: K.INK, at: N("أول") - 0.1 });

// ---------- 8. charcoal: the name ----------
const tName = N("وده");
const gName = K.go(tName, "name", { scale: 1.2, dy: -60 });
// v3 (Ahmed 2026-10-14: "the screen glitches when that part shows"): the wipe now runs after the camera lands, and a fresh
// wheel flies in instead of the hook wheel crossing 3,600 px of world; no snap zoom on the name
{ // crossfade back to charcoal: the wipe's moving edge left a thin line here that read as a glitch
  const tw = gName.arrive - 0.1;
  tl.to(document.getElementById("paperworld"), { autoAlpha: 0, duration: 0.35, ease: "power1.inOut" }, tw);
  tl.set(document.getElementById("stage"), { attr: { "data-world": "charcoal" } }, tw + 0.17);
}
K.img(B.name, WHEEL, { x: 500, y: 560, w: 460, at: gName.lead, enter: "fly", shadow: false });
K.glow(B.name, 500, 560, 640, { at: gName.arrive });
K.text(B.name, "Gambler's Fallacy", { x: 500, y: 300, size: 60, head: true, color: WHITE, at: N("Gambler's") - 0.05, cls: "en" });
const tFal = N("مغالطة");
K.text(B.name, "مغالطة المقامر", { x: 500, y: 150, size: 90, head: true, color: L, at: tFal - 0.05, from: "pop", sfx: "hit", gain: 0.35 });
N("المقامر.");

// ---------- 9. the same mistake in the stock market: a share falling for two weeks ----------
const tOdd = N("والغريب");
const gMkt = K.go(tOdd, "market", { scale: 1.25, dx: 0, dy: -30 });
const screen = K.img(B.market, OBJ + "kanz-trading-screen-blank-v01.png", { x: 500, y: 420, w: 760, at: gMkt.lead, enter: "fly", shadow: false });
const same = K.text(B.market, "نفس الغلطة", { x: 500, y: 110, size: 72, head: true, at: N("نفس") - 0.1 });
const tBourse = N("البورصة.");
K.dim(same, tBourse - 0.3, 0, 0.25);
K.text(B.market, "البورصة", { x: 500, y: 110, size: 80, head: true, color: L, at: tBourse - 0.1 });
const fall = [8, 7.6, 7.8, 7.1, 6.6, 6.8, 6.0, 5.4, 5.6, 4.9, 4.3];
const ch = K.area(B.market, { x: 500, y: 405, w: 560, h: 280, data: fall, min: 3.5, max: 8.6, at: gMkt.lead + 0.3, dur: 2.6 });
N("سهم");
K.tag(B.market, "نازل", { x: ch.x(7), y: ch.y(4.3) + 40, size: 44, lav: true, at: N("نازل"), sfx: false });
K.text(B.market, "بقاله أسبوعين", { x: 500, y: 750, size: 56, head: true, at: N("أسبوعين.") - 0.15 });

// ---------- 10. "it fell so much, it must go up now" ... and you buy more ----------
const tSay = N("فتقول");
const gBuy = K.go(tSay, "buy", { scale: 1.3, dx: 220, dy: -40 });
const inv = K.img(B.buy, OBJ + "kanz-npc-m01-thinking-v01.png", { x: 780, y: 480, w: 440, at: gBuy.lead, enter: "fly" });
K.img(B.buy, OBJ + "kanz-trading-screen-blank-v01.png", { x: 300, y: 420, w: 500, at: gBuy.lead + 0.1, shadow: false });
const ch3 = K.area(B.buy, { x: 300, y: 410, w: 370, h: 180, data: fall, min: 3.5, max: 8.6, at: gBuy.lead + 0.15, dur: 0.4 });
K.frame(N("خلاص،") - 0.2, "buy");
const tSure3 = N("أكيد");
K.arrow(B.buy, ch3.x(10), ch3.y(4.3), ch3.x(10) + 40, 200, { at: tSure3 - 0.1, bend: 20, color: L, width: 8 });
const tUp = N("يطلع.");
K.tag(B.buy, "أكيد هيطلع", { x: 320, y: 120, lav: true, size: 50, at: tUp - 0.15 });
const tMore = N("تشتري");
K.pile(B.buy, OBJ + "kanz-share-certificate-v01.png", { x: 300, y: 730, n: 3, w: 190, at: tMore });
const tMore2 = N("أكتر");
K.text(B.buy, "تشتري أكتر", { x: 700, y: 120, size: 54, head: true, at: tMore2 });
K.snap(tMore2 + 0.05, 1.18, 0.5);

// ---------- 11. nothing says it has to go up because it fell ----------
const tProb = N("بس");
const gMust = K.go(tProb, "must", { scale: 1.2, dy: -40 });
K.img(B.must, OBJ + "kanz-trading-screen-blank-v01.png", { x: 500, y: 420, w: 760, at: gMust.lead, shadow: false });
const ch2 = K.area(B.must, { x: 500, y: 405, w: 560, h: 280, data: fall, min: 3.5, max: 8.6, at: gMust.lead, dur: 0.3 });
const tMust = N("لازم");
K.dashed(B.must, ch2.x(10) + 10, ch2.y(4.3), ch2.x(10) + 80, ch2.y(4.3) - 150, { at: tMust - 0.3, color: WHITE });
K.text(B.must, "لازم يطلع؟", { x: 500, y: 110, size: 84, head: true, color: L, at: tMust - 0.1 });
K.strike(B.must, 330, 110, 670, 110, { at: N("عشان") - 0.05, color: "#fff" });
K.snap(tMust, 1.2, 0.5);
K.text(B.must, "مفيش حاجة بتقول كده", { x: 500, y: 760, size: 56, head: true, at: N("فترة.") - 0.2 });

// ---------- 12. paper: the market isn't roulette (news, performance, the market) ... but the mistake is the same ----------
const tSure2 = N("وطبعًا");
const gDiff = K.go(tSure2, "diff", { scale: 1.3, dx: -220, dy: -40 });
K.world(gDiff.start, "paper");
const rWheel = K.img(B.diff, WHEEL, { x: 240, y: 360, w: 400, at: gDiff.lead, enter: "fly", shadow: false });
K.text(B.diff, "≠", { x: 500, y: 340, size: 130, head: true, color: K.INK, at: N("مش") });
K.text(B.diff, "الروليت", { x: 240, y: 560, size: 56, head: true, color: K.INK, at: N("الروليت،") - 0.1 });
const tMove = N("لأن");
K.frame(tMove - 0.25, "diff");
K.img(B.diff, OBJ + "kanz-company-office-v01.png", { x: 760, y: 360, w: 380, at: tMove - 0.1, enter: "fly", fromX: 60 });
K.text(B.diff, "البورصة", { x: 760, y: 120, size: 56, head: true, color: K.INK, at: tMove });
K.tag(B.diff, "أخبار الشركة", { x: 760, y: 590, size: 40, at: N("بأخبار") });
K.tag(B.diff, "أداءها", { x: 760, y: 680, size: 40, at: N("وأدائها") });
K.tag(B.diff, "السوق", { x: 760, y: 770, size: 40, at: N("والسوق.") });
const tSame2 = N("لكن");
K.frame(tSame2 - 0.2, "diff", { scale: 1.05, dy: 40 });
const tOne = N("واحدة.");
K.text(B.diff, "الغلطة واحدة", { x: 500, y: 840, size: 76, head: true, color: L, at: tOne - 0.15, from: "pop", sfx: "hit", gain: 0.3 });
K.underline(B.diff, 310, 690, 900, { at: tOne + 0.2, color: K.INK });

// ---------- 13. charcoal: assuming the past alone decides what happens next ----------
const tYou = N("إنك");
const gPast = K.go(tYou, "past", { scale: 1.25, dx: 180, dy: -30 });
K.world(gPast.start, "charcoal");
const pastRun = streak(B.past, 5, 890, 340, 130, 16, 5, gPast.lead, gPast.lead + 0.25);
K.text(B.past, "الماضي", { x: 600, y: 170, size: 64, head: true, at: N("الماضي") - 0.1 });
const tEnough = N("كفاية");
K.frame(tEnough - 0.3, "past");
K.text(B.past, "لوحده؟", { x: 640, y: 560, size: 60, head: true, color: L, at: tEnough - 0.4 });
K.arrow(B.past, 380, 470, 230, 600, { at: N("يحدد") - 0.1, bend: 30, color: WHITE });
const tFut = N("هيحصل");
K.text(B.past, "؟", { x: 180, y: 720, size: 200, head: true, color: L, at: tFut - 0.05, from: "pop", sfx: "hit", gain: 0.3 });

// ---------- ending: back to the hook on the last word, the name big, ~1.3 s after the voice ----------
const tLast = (window.TOKENS || []).slice(-1)[0].end;
const tBack = tLast - 0.15;
K.cam(tBack, "hook", { dur: 0.04, sfx: false });
K.sfx(tBack, "whoosh", 0.25);
K.glow(B.hook, 500, 540, 760, { at: tBack });
K.img(B.hook, WHEEL, { x: 500, y: 540, w: 560, at: tBack - 0.04, enter: "fly", fromScale: 1.45, fromY: 60, sfx: false });
K.takeaway(B.hook, "مغالطة <span class='kw'>المقامر</span>", { x: 500, y: 100, size: 110, at: tBack + 0.1, glow: false });
K.duration = tLast + 1.3;
K.finish();
