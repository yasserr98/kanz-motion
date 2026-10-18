/* Kanz pace (2026-10-13): opt-in pacing layer, loaded after kanz-look.js. K.pace() turns it on.
 *
 * From the short-form pacing study (Kanz repo: reports/shorts-pacing-study-2026-10-13/FINDINGS.md):
 * conversion.doc, Vox Shorts and 0x100x never show an empty frame, never fully stop moving, change scene
 * inside the voice's breath, and carry one object from beat to beat. Finished projects do not load this
 * file, so their re-renders are unchanged. Guide: docs/PACE.md.
 *
 *   K.pace({drift, bed})        24 fps motion (grain + boil stay stepped), smooth camera, mix 2, room-tone bed,
 *                               camera drift between moves, 0.5 s moves
 *   K.go(tWord, id, o)          move to a board inside the pause before tWord; returns {start, arrive, lead}:
 *                               put the board's first element `at: g.lead` so it lands with the camera
 *   K.frame(t, id, o)           reframe on the same board (start close on the first object, then pull out)
 *   K.finish()                  call last: adds the drift between camera moves
 *   K.img(..., {enter: "fly"})  hero entrance from oversized (1.9x, from below) settling in ~0.85 s
 *   K.settle(el, t, o)          an element already on screen settles from oversized (the hook hero, frame 1)
 *   K.carry(el, toId, t, o)     move an object from its board to a spot on another board during a camera move
 *   K.dim(els, t, op)           dim to `op` (default 0.3) instead of clearing: never an empty board
 *   K.snap(t, f, hold)          one-frame snap zoom on an emphasis word, snaps back after `hold`
 *   K.pointer(board)            one lavender ring that hops between targets: p.to(t, x, y, w, h), p.out(t)
 *   frame guard (on by default) the camera never cuts an object, label or chart mark at the side of the frame:
 *                               drift, close framing and snaps get a small extra pan / zoom-out (docs/PACE.md
 *                               "Frame guard"). K.pace({keep: false}) turns it off; K.cam/K.frame(..., {crop: true})
 *                               lets one framing crop on purpose; K.free(el) exempts one element
 *
 * Visual defaults (2026-10-17, docs/PACE.md "Visual defaults"): from a visual review of 7 shipped Reels. The template
 * calls K.pace({defaults: "2026-10-17"}); finished projects call K.pace() without it and render exactly as before.
 * Each default can be switched off on its own, e.g. K.pace({defaults: "2026-10-17", fly: false}):
 *   band   the frame guard keeps objects, text and tags out of the caption band (K.CAPBAND, y 1190..1450): pan up
 *          first, then zoom out (never below 0.8x), starting 0.45 s early
 *   lead   K.go brings every element of its board scheduled before arrive + 0.5 s forward to g.lead; a chart that
 *          starts at arrival is ~40 % drawn when the camera lands and finishes within 0.6 s
 *   punch  K.punch hides the caption while it shows; K.dim takes text, tags and marks to 0 (objects keep `op`)
 *   fly    enter: "fly" at most 1.4x for objects wider than 500 px, from above in the board's lower half, scale-only
 *          when the start box would cross the caption band or the headline
 *   marks  K.oval / K.rect / K.frame(el) / K.arrow sized to a target element (kanz.js); one arrowhead; K.arrow
 *          without a target warns; K.docMark frames get 16 px padding
 * Added the same day from the review samples Ahmed approved ("do everything except for the colors of the charts"):
 *   digits one digit system: K.DIGITS = "en" (0-9 with ٪) or "ar" (٠-٩ with ٪), applied to every K.el html,
 *          K.count and the captions (kanz.js)
 *   sizes  source lines 28 px, labels 34 px by default (lint flags anything smaller)
 *   paper  objects and figures keep their contrast on the paper world (kanz-look.css)
 *   nosnap K.snap does nothing (one warning); K.snap(t, f, hold, {force: true}) or {nosnap: false} brings it back
 * Chart colours are deliberately unchanged (Ahmed 2026-10-17: "leave them with different colors I like it").
 *
 * Shorts defaults (2026-10-18, review hardening): K.pace({defaults: "2026-10-18"}) turns on everything above plus
 *   faces  K.title() takes its text from shorts/_titles.json (window.TITLE) and its height from the face boxes
 *          (window.FACES, engine/faces.py): workshop shorts prefer y 330, long-video shorts y 1150, never on his eyes
 *          or mouth; the subtitles move off the face box in face and split moments (SHORT-4, SHORT-12)
 *   ease   K.split eases its moves to and from a full-screen board (0.35 s); cuts to and from his full face stay
 *          clean (SHORT-16)
 *   gap    K.under(head, html) puts a subheadline under a headline with K.GAP (40 px) of breathing room
 * The template calls it with "2026-10-18"; scenes on "2026-10-17" or none render exactly as before. Each can be
 * switched on alone in an older scene: K.pace({ defaults: "2026-10-17", ease: true }).
 */
(function () {
  const K = window.K, tl = K.tl;
  const stage = document.getElementById("stage"), world = document.getElementById("world");
  const hide = (e) => tl.set(e, { autoAlpha: 0 }, 0);
  K.PACE = false;
  const moves = []; // {t, end, id, o, to}
  const snaps = []; // {t, end}
  const goes = []; // {id, lead, arrive, until}: K.go windows for the `lead` default
  let finishPending = false;
  K._reserveFocus = function (t, dur) {
    const m = { t, end: t + dur, pending: true };
    moves.push(m);
    return () => {
      moves.splice(moves.indexOf(m), 1);
      if (finishPending) K.finish();
    };
  };

  K.DEFAULTS = "2026-10-18";
  K.CAPBAND = [1190, 1450];
  K.pace = function (o = {}) {
    K.PACE = true;
    const on = !!o.defaults && String(o.defaults) >= "2026-10-17";
    ["band", "lead", "punch", "fly", "marks", "digits", "sizes", "paper", "nosnap"].forEach((k) => { K.D[k] = on && o[k] !== false; });
    const on18 = !!o.defaults && String(o.defaults) >= "2026-10-18";
    // each can also be switched on alone in an older scene, e.g. K.pace({ defaults: "2026-10-17", ease: true })
    ["faces", "ease", "gap"].forEach((k) => { K.D[k] = (on18 && o[k] !== false) || o[k] === true; });
    stage.classList.toggle("kd-sizes", !!K.D.sizes);
    stage.classList.toggle("kd-paper", !!K.D.paper);
    K.camSmooth = true;
    K.fps = 24; // every frame moves; grain and boil keep their own slower step (see seek below)
    K.mix = 2;
    K.bed = o.bed === undefined ? "room" : o.bed; // engine/render.py mixes a quiet room tone under everything
    K.driftRate = o.drift == null ? 0.02 : o.drift; // scale per second between moves (0x100x: 2-3 %/s)
    K.driftCap = o.driftCap || 0.07; // more crops objects at the board edges (review 2026-10-13)
    K.driftSide = o.driftSide == null ? 8 : o.driftSide; // board px per second, alternating direction
    K.keep = o.keep !== false; // frame guard (2026-10-14): drift/snap/close framing pushed people and labels off-frame
    // snap zooms act on a wrapper so they never fight the camera tweens on #world
    if (!document.getElementById("camwrap")) {
      // K.world() inserts the paper layer before #world, which is about to move into the wrapper: make it now
      if (!document.getElementById("paperworld")) {
        const bg = document.createElement("div"); bg.id = "paperworld"; stage.insertBefore(bg, world);
        tl.set(bg, { autoAlpha: 0 }, 0);
      }
      const w = document.createElement("div");
      w.id = "camwrap";
      w.style.cssText = "position:absolute;inset:0;z-index:1;transform-origin:540px " + K.view.y + "px";
      stage.insertBefore(w, world);
      w.appendChild(world);
    }
    K._wrapOY = K.view.y; // the guard scales #camwrap about (540, K.view.y)
    installDefaults();
  };

  // ---------- frame clock: motion at 24 fps, grain at 12, boil at 8 (hand-made texture stays stepped) ----------
  const seek1 = K.seek;
  const grain = document.getElementById("grain");
  K.seek = function (t) {
    seek1(t);
    if (!K.PACE || !grain) return;
    const step = Math.floor(t * 12 + 1e-6);
    grain.style.transform = `translate(${(step * 37) % 40 - 20}px, ${(step * 53) % 40 - 20}px)`;
  };

  // ---------- camera ----------
  const cam0 = K.cam, push0 = K.push;
  K.cam = function (t, id, o = {}) {
    if (!K.PACE) return cam0(t, id, o);
    const dur = t <= 0 ? 0 : o.dur || 0.5;
    cam0(t, id, { ...o, dur: dur || 0.5 });
    moves.push({ t, end: t + dur, id, o, to: K._cam });
  };
  K.push = function (t, id, scale, dur = 2.5, o = {}) {
    push0(t, id, scale, dur, o);
    if (K.PACE) moves.push({ t, end: t + dur, id, o: { ...o, scale }, to: K._cam });
  };
  // K.frame(el, o) (2026-10-17): a hand-drawn frame sized to an element, i.e. K.rect(el.parentNode, el, o)
  K.frame = function (t, id, o = {}) {
    if (t instanceof Element) return K.rect(t.parentNode, t, id || {});
    return K.cam(t, id, { sfx: false, dur: 0.55, ...o });
  };

  // start of the pause before the word at tWord (end of the previous spoken word)
  K.pauseBefore = function (tWord) {
    let e = 0;
    (window.TOKENS || []).forEach((tk) => { if (tk.end <= tWord - 0.01 && tk.end > e) e = tk.end; });
    return e;
  };
  K.go = function (tWord, id, o = {}) {
    const dur = o.dur || 0.5;
    let start = Math.max(K.pauseBefore(tWord) + 0.02, tWord - 0.75);
    start = Math.min(start, tWord - 0.3); // land no later than ~0.2 s after the word starts
    K.cam(start, id, { ...o, dur });
    goes.push({ id, lead: start + 0.15, arrive: start + dur, until: start + dur + 0.5 });
    return { start, arrive: start + dur, lead: start + 0.15, word: tWord };
  };

  K.finish = function () {
    if (!K.PACE) return;
    // Focus coordinates need the image dimensions. Reserve now; finish drift once they all resolve.
    finishPending = moves.some((m) => m.pending);
    if (finishPending) return;
    const end = K.duration;
    moves.sort((a, b) => a.t - b.t);
    moves.forEach((m, i) => {
      const next = moves[i + 1] ? moves[i + 1].t : end;
      const gap = next - m.end;
      if (gap < 0.3) return;
      const base = m.to.scale, s = base * (1 + Math.min(K.driftCap, K.driftRate * gap));
      const side = (i % 2 ? 1 : -1) * K.driftSide * gap;
      const to = K.camAt(m.id, { ...m.o, scale: s, dx: (m.o.dx || 0) + side });
      tl.to(world, { ...to, duration: gap, ease: "none" }, m.end);
    });
  };

  // ---------- frame guard (2026-10-14) ----------
  // An editor's neckline Reel showed the camera pushing people, chart labels and arrows past the frame edge:
  // drift keeps panning 8 px/s for the whole gap, snaps zoom 1.3x on the centre, close framing ignores the
  // board's width. The guard measures every visible object/label/chart mark once per 1/12 s (camera moves and
  // snaps excluded), and where one would be cut it adds the smallest pan, then zoom-out (>= 0.8x), on #camwrap
  // (CSS translate/scale, so it composes with the snap and never fights the #world tweens). It looks ahead and
  // eases, so it reads as camera work; during a camera move it blends from the old board's correction to the new
  // one's; during a snap it is measured live (a cut, no easing), which softens a snap that would crop.
  // Bands follow lint's side margins: x 65..1015 above y 1000, 120..960 below (K.SAFE).
  const KEEP_SEL = "#world img.obj, #world .t, #world .tag, #world .card, #world .kcount, #world .kdoc, #world .kphoto, #world .ksnap," +
    " #world .kpin, #world svg.mk path, #world svg.mk polyline, #world svg.mk rect, #world svg.mk line, #world svg.mk circle";
  const KEEP_SKIP = ".kfg, .kglow, .kshadow, .kmap, [data-free]";
  const DT = 1 / 12, AHEAD = 0.45, BEHIND = 0.1, EASE = 0.25, SMIN = 0.8, OX = 540;
  K.free = function (el) { [].concat(el).forEach((e) => e.setAttribute("data-free", "")); return el; };
  let keepTab = null, wrap = null;
  const setFix = (s, dx, dy = 0) => {
    if (!wrap) return;
    const ty = Math.abs(dy) > 0.01;
    wrap.style.translate = Math.abs(dx) > 0.01 || ty ? `${dx.toFixed(2)}px ${ty ? dy.toFixed(2) : 0}px` : "";
    wrap.style.scale = s < 0.9999 ? s.toFixed(5) : "";
  };
  // caption band (visual defaults 2026-10-17): objects, text and tags stay above it while captions can show
  const BAND_SEL = "img.obj, .t, .tag";
  const bandAt = (t) => K.D.band && t >= (K.captionsFrom || 0) && t <= (K.captionsTo == null ? 1e9 : K.captionsTo);
  // constraints for the current frame: one {a, b, L, R} per visible element that is at least 30 % inside
  // (with the band on, also its y0/y1, and `band` when it reaches more than 8 px into the caption band)
  const measure = (band) => {
    const st = stage.getBoundingClientRect(), k = st.width / 1080 || 1, S = K.SAFE || {};
    const memo = new Map();
    const eff = (el) => {
      if (!el || el === stage) return 1;
      if (memo.has(el)) return memo.get(el);
      const cs = getComputedStyle(el);
      const v = cs.visibility === "hidden" || cs.display === "none" ? 0 : parseFloat(cs.opacity) * eff(el.parentElement);
      memo.set(el, v);
      return v;
    };
    const out = [];
    document.querySelectorAll(KEEP_SEL).forEach((el) => {
      if (el.closest(KEEP_SKIP)) return;
      if ((gsap.getProperty(el, "scaleX") || 1) > 1.03) return; // mid fly-in / settle: oversized on purpose
      const r = el.getBoundingClientRect();
      if (r.width < 3 || r.height < 3) return;
      const a = (r.left - st.left) / k, b = (r.right - st.left) / k, y0 = (r.top - st.top) / k, y1 = (r.bottom - st.top) / k;
      if (y1 < 0 || y0 > 1920) return;
      const inside = Math.min(b, 1080) - Math.max(a, 0);
      if (inside < 0.3 * (b - a)) return; // mostly outside: a neighbouring board or a deliberate peek
      if (eff(el) < 0.5) return;
      const lower = (y0 + y1) / 2 > (S.upperBottom || 1000);
      const c = { a, b, L: lower ? S.left || 120 : S.upperLeft || 65, R: lower ? S.right || 960 : S.upperRight || 1015 };
      if (band) {
        c.y0 = y0; c.y1 = y1;
        if (el.matches(BAND_SEL) && Math.min(y1, K.CAPBAND[1]) - Math.max(y0, K.CAPBAND[0]) > 8) c.band = true;
      }
      out.push(c);
    });
    return out;
  };
  // smallest correction (largest scale <= 1, then smallest pan) that puts every element inside its band
  const solve = (cs) => {
    if (!cs.length) return [1, 0, 0];
    const range = (s) => {
      let lo = -1e9, hi = 1e9;
      cs.forEach((c) => { lo = Math.max(lo, c.L - OX - s * (c.a - OX)); hi = Math.min(hi, c.R - OX - s * (c.b - OX)); });
      return [lo, hi];
    };
    if (cs.some((c) => c.band)) return solveBand(cs, range);
    let s = 1, [lo, hi] = range(1);
    if (lo > hi) {
      let x = SMIN, y = 1;
      for (let i = 0; i < 18; i++) { const m = (x + y) / 2, r = range(m); if (r[0] <= r[1]) x = m; else y = m; }
      s = x; [lo, hi] = range(s);
      if (lo > hi) return [s, (lo + hi) / 2, 0]; // too wide even at SMIN: centre it
    }
    return [s, Math.min(Math.max(0, lo), hi), 0];
  };
  // with something in the caption band: pan up first (no element above the safe top that was not already there),
  // then zoom out about (540, K.view.y) down to SMIN; the side margins hold at every step
  const solveBand = (cs, range) => {
    const OY = K._wrapOY, TOP = (K.SAFE || {}).top || 270, B0 = K.CAPBAND[0];
    const vrange = (s) => {
      let lo = -1e9, hi = 0;
      cs.forEach((c) => {
        lo = Math.max(lo, Math.min(TOP, c.y0) - OY - s * (c.y0 - OY));
        if (c.band) hi = Math.min(hi, B0 - OY - s * (c.y1 - OY));
      });
      return [lo, hi];
    };
    const ok = (s) => { const h = range(s), v = vrange(s); return h[0] <= h[1] && v[0] <= v[1]; };
    let s = 1;
    if (!ok(1)) {
      let x = SMIN, y = 1;
      if (ok(SMIN)) for (let i = 0; i < 18; i++) { const m = (x + y) / 2; if (ok(m)) x = m; else y = m; }
      s = x;
    }
    const [lo, hi] = range(s), [vlo, vhi] = vrange(s);
    const dx = lo > hi ? (lo + hi) / 2 : Math.min(Math.max(0, lo), hi);
    return [s, dx, vlo > vhi ? vlo : vhi]; // vhi <= 0: the smallest pan up that clears the band
  };
  const inAny = (list, t) => list.some((m) => t > m.t && t < m.end);
  let seekBase = null;
  const build = () => {
    const end = K.duration || window.DURATION || 60, n = Math.ceil(end / DT) + 1;
    const T = [], kind = [], C = [];
    setFix(1, 0);
    const sorted = moves.slice().sort((a, b) => a.t - b.t);
    for (let i = 0; i < n; i++) {
      const t = Math.min(i * DT, end);
      T.push(t);
      const mv = sorted.filter((m) => m.t <= t + 1e-6).pop();
      const k = inAny(snaps, t) ? "snap" : inAny(sorted, t) ? "move" : mv && mv.o.crop ? "free" : "settled";
      kind.push(k);
      if (k === "settled") { seekBase(t); C.push(measure(bandAt(t))); } else C.push(null);
    }
    // look ahead / behind inside each settled stretch, so the reframe is under way before an object lands
    const raw = T.map((t, i) => {
      if (kind[i] !== "settled") return null;
      const cs = [];
      for (let j = i; j >= 0 && kind[j] === "settled" && T[j] >= t - BEHIND; j--) cs.push(...C[j]);
      for (let j = i + 1; j < n && kind[j] === "settled" && T[j] <= t + AHEAD; j++) cs.push(...C[j]);
      return solve(cs);
    });
    // ease: average over +-EASE inside the stretch, never less zoom-out (or pan up) than this sample needs
    const half = Math.round(EASE / DT);
    const fix = raw.map((r, i) => {
      if (!r) return null;
      let s = 0, d = 0, e = 0, w = 0;
      for (let j = i - half; j <= i + half; j++) {
        const q = raw[Math.min(Math.max(j, 0), n - 1)] || r;
        s += q[0]; d += q[1]; e += q[2]; w++;
      }
      return [Math.min(s / w, r[0]), d / w, Math.min(e / w, r[2])];
    });
    // camera moves blend between the corrections either side; free framings and snaps carry none in the table
    for (let i = 0; i < n; i++) {
      if (fix[i]) continue;
      if (kind[i] !== "move") { fix[i] = [1, 0, 0]; continue; }
      let a = i; while (a >= 0 && kind[a] === "move") a--;
      let b = i; while (b < n && kind[b] === "move") b++;
      const fa = a >= 0 ? fix[a] || [1, 0, 0] : [1, 0, 0];
      const fb = b < n ? raw[b] || [1, 0, 0] : fa;
      const u = (i - a) / (b - a);
      fix[i] = [0, 1, 2].map((c) => fa[c] + (fb[c] - fa[c]) * u);
    }
    keepTab = { T, fix, kind };
  };
  // review helper: "settled" | "move" | "snap" | "free" at time t (null before the guard has measured)
  K._keepKind = (t) => keepTab ? keepTab.kind[Math.max(0, Math.min(Math.round(t / DT), keepTab.kind.length - 1))] : null;
  const ready = () => document.fonts && document.fonts.status === "loaded" &&
    Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0);
  const seek2 = K.seek;
  seekBase = seek2;
  const flyQ = [];
  const flushFly = () => {
    for (let i = 0; i < flyQ.length; i++) {
      const q = flyQ[i];
      if (!(q.e.complete && q.e.naturalWidth > 0)) continue;
      Object.assign(q.tw.vars.startAt, flyPlan(q.e, q.parent, q.o, q.cam, q.from));
      q.tw.invalidate(); flyQ.splice(i--, 1);
    }
  };
  K.seek = function (t) {
    if (flyQ.length) flushFly();
    if (!K.PACE || !K.keep) return seek2(t);
    wrap = wrap || document.getElementById("camwrap");
    if (!keepTab && ready()) build();
    setFix(1, 0);
    seek2(t);
    if (!keepTab) return;
    if (inAny(snaps, t)) { const f = solve(measure(bandAt(t))); setFix(f[0], f[1], f[2]); return; }
    const last = keepTab.T.length - 1, i = Math.max(0, Math.min(Math.floor(t / DT), last));
    const a = keepTab.fix[i], b = keepTab.fix[Math.min(i + 1, last)];
    const u = Math.min(1, Math.max(0, (t - keepTab.T[i]) / DT));
    setFix(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u);
  };

  // ---------- entrances ----------
  const img1 = K.img;
  K.img = function (parent, src, o = {}) {
    if (o.enter !== "fly" || o.at == null) return img1(parent, src, o);
    const e = img1(parent, src, { ...o, at: null });
    hide(e);
    const fs = o.fromScale || 1.9;
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18, ease: "none", immediateRender: false }, o.at);
    const from = { scale: fs, x: o.fromX || 0, y: o.fromY == null ? 170 : o.fromY };
    tl.fromTo(e, { ...from },
      { scale: 1, x: 0, y: 0, duration: o.dur || 0.85, ease: "power3.out", immediateRender: false }, o.at);
    // fly default: the start is planned on the first seek once the image has its size (function-based start values
    // came out as the string "NaN=> plan().scale" and broke every entrance, found by the review samples 2026-10-17)
    if (K.D.fly) flyQ.push({ tw: tl.recent(), e, parent, o, cam: K._cam, from });
    K.sfx(o.at, K.cue(o.sfx, "whoosh"), o.gain || 0.22);
    return e;
  };
  K.settle = function (el, t, o = {}) {
    tl.fromTo(el, { scale: o.fromScale || 1.5, y: o.fromY == null ? 80 : o.fromY },
      { scale: 1, y: 0, duration: o.dur || 1.1, ease: "power3.out", immediateRender: false }, Math.max(t, 1e-4));
  };

  // ---------- continuity ----------
  const boardOf = (el) => { for (const id in K.boards) if (K.boards[id].el.contains(el)) return id; return null; };
  K.carry = function (el, toId, t, o = {}) {
    const from = K.boards[boardOf(el)], to = K.boards[toId];
    const left = parseFloat(el.style.left), top = parseFloat(el.style.top);
    const w0 = parseFloat(el.style.width);
    const dx = to.x + o.x - (from.x + left), dy = to.y + o.y - (from.y + top);
    tl.set(from.el, { zIndex: 6 }, t);
    const v = { x: dx, y: dy, scale: o.w ? o.w / w0 : 1, duration: o.dur || 0.55, ease: "power2.inOut" };
    if (o.rot != null) v.rotation = o.rot;
    if (o.opacity != null) v.opacity = o.opacity;
    tl.to(el, v, t);
    return el;
  };
  // with the `punch` default, text, tags and marks go to 0 (a ghost label at 0.3 still reads); objects keep `op`
  const TEXTISH = ".t, .tag, .card, .kdoc, .kcount, .ksrc, .kpin, .kpointer, .kmark, .kframe, svg";
  K.dim = function (els, t, op = 0.3, dur = 0.4) {
    const list = [].concat(els);
    if (!K.D.punch) { tl.to(list, { opacity: op, duration: dur, ease: "power2.inOut" }, t); return; }
    const text = list.filter((e) => e.matches(TEXTISH) || e.querySelector(".t, .tag, svg.mk"));
    const objs = list.filter((e) => !text.includes(e));
    if (text.length) tl.to(text, { opacity: 0, duration: dur, ease: "power2.inOut" }, t);
    if (objs.length) tl.to(objs, { opacity: op, duration: dur, ease: "power2.inOut" }, t);
  };

  // ---------- emphasis ----------
  let snapSets = [];
  K.snap = function (t, f = 1.3, hold = 0.7, o = {}) {
    if (K.D.nosnap && !o.force) { // nosnap default (2026-10-17): snap zooms are off in new videos
      if (!K._snapWarned) {
        K._snapWarned = true;
        const m = "K.snap is off by default since 2026-10-17: K.snap(t, f, hold, {force: true}) or K.pace({..., nosnap: false})";
        K.warnings.push(m); console.warn(m);
      }
      return;
    }
    const w = document.getElementById("camwrap");
    if (!w) return;
    snaps.push({ t, end: t + hold, until: t + hold, f });
    snaps.sort((a, b) => a.t - b.t);
    snapSets.forEach((s) => s.kill());
    snapSets = [];
    const set = (scale, at) => {
      tl.set(w, { scale }, at); snapSets.push(tl.recent());
    };
    set(1, 0);
    snaps.forEach((s, i) => {
      s.end = Math.min(s.until, snaps[i + 1] ? snaps[i + 1].t : Infinity);
      set(s.f, s.t); set(1, s.end);
    });
    K.sfx(t, "click", 0.25);
  };
  K.pointer = function (parent) {
    const r = K.el("div", "abs kpointer", parent);
    gsap.set(r, { width: 100, height: 100, border: "7px solid #d5adef", borderRadius: "50%", boxSizing: "border-box",
      filter: "url(#boil)", xPercent: -50, yPercent: -50, zIndex: 9 });
    hide(r);
    let shown = false;
    return {
      el: r,
      to(t, x, y, w, h) {
        if (!shown) {
          shown = true;
          gsap.set(r, { left: x, top: y, width: w, height: h || w });
          tl.fromTo(r, { autoAlpha: 0, scale: 1.4 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "power3.out", immediateRender: false }, t);
        } else {
          tl.to(r, { left: x, top: y, width: w, height: h || w, autoAlpha: 1, duration: 0.28, ease: "power2.inOut" }, t);
        }
        K.sfx(t, "marker", 0.2);
        return this;
      },
      out(t) { tl.to(r, { autoAlpha: 0, duration: 0.25 }, t); return this; },
    };
  };

  // ---------- visual defaults (2026-10-17) ----------
  // fly: cap, direction and a start box that stays out of the caption band and the headline (screen px, at the
  // camera the scene set last, which is the arriving board's framing after K.go)
  const heads = []; // {first, out} for every K.headline
  const headBottom = (t) => {
    if (!heads.some((h) => t >= h.first && (h.out == null || t < h.out))) return null;
    const st = stage.getBoundingClientRect(), r = document.getElementById("headline").getBoundingClientRect();
    return r.height ? (r.bottom - st.top) / (st.width / 1080 || 1) : null;
  };
  const flyPlan = (e, parent, o, cam, f0) => {
    const id = boardOf(parent), bd = id && K.boards[id];
    let { scale, x, y } = f0;
    if (o.w > 500) scale = Math.min(scale, 1.4);
    if (!bd) return { scale, x, y };
    if (o.fromY == null && o.y > (bd.h || 860) / 2) y = -170; // lower half: from above, away from the captions
    const c = cam || K.camAt(id), h = o.w * (e.naturalWidth ? e.naturalHeight / e.naturalWidth : 1);
    const box = (s, dy) => { const cy = c.y + c.scale * (bd.y + o.y + dy), hh = (c.scale * h * s) / 2; return [cy - hh, cy + hh]; };
    const fin = box(1, 0), cap = o.at >= (K.captionsFrom || 0) ? K.CAPBAND[0] : null, hb = headBottom(o.at);
    const bad = (b) => (cap != null && b[1] > Math.max(cap, fin[1]) + 1) || (hb != null && b[0] < Math.min(hb, fin[0]) - 1);
    if (!bad(box(scale, y))) return { scale, x, y };
    while (scale > 1.05 && bad(box(scale, 0))) scale -= 0.05; // scale-only, and only as big as fits
    return { scale: Math.max(1, scale), x: 0, y: 0 };
  };

  // lead: components whose last argument carries `at` are rewritten when that time falls inside a K.go window of
  // their board (scene order: K.go before the board's elements, as in the recipe). Marks stay on their word.
  const LEAD = ["text", "tag", "img", "card", "bar", "area", "line", "candles", "axis", "count", "pile", "stack", "doc",
    "photo", "map", "glow", "shadow", "pin", "fg", "bgObj", "snap35", "flip", "browser", "fold", "fire", "takeaway"];
  const CHART_DUR = { area: 1.6, line: 1.6, candles: 1.8 };
  const leadArgs = (name, args) => {
    const o = args[args.length - 1], parent = args[0];
    if (!(parent instanceof Element) || !o || typeof o !== "object" || o instanceof Element || Array.isArray(o) ||
        typeof o.at !== "number") return args;
    const id = boardOf(parent);
    const g = id && goes.filter((m) => m.id === id && o.at > m.lead + 1e-6 && o.at < m.until - 1e-6).pop();
    if (!g) return args;
    const n = { ...o, at: g.lead };
    // a chart starting at arrival: ~40 % drawn when the camera lands, done 0.6 s later
    if (CHART_DUR[name]) n.dur = Math.min(o.dur || CHART_DUR[name], g.arrive + 0.6 - g.lead);
    if (name === "line" && typeof o.fillAt === "number" && o.fillAt > g.lead && o.fillAt < g.until) n.fillAt = g.lead;
    return [...args.slice(0, -1), n];
  };
  let installed = false, depth = 0;
  function installDefaults() {
    if (installed || !Object.values(K.D).some(Boolean)) return;
    installed = true;
    LEAD.forEach((name) => {
      const f = K[name];
      if (typeof f !== "function") return;
      K[name] = function (...args) {
        if (K.D.lead && depth === 0) args = leadArgs(name, args); // nested calls (takeaway -> text) keep their times
        depth++;
        try { return f.apply(this, args); } finally { depth--; }
      };
    });
    const punch0 = K.punch, head0 = K.headline;
    K.punch = function (html, t0, t1, o = {}) {
      const r = punch0(html, t0, t1, o);
      if (K.D.punch) { // the caption under the dim read as ghost text
        const cap = document.getElementById("captions");
        tl.fromTo(cap, { opacity: 1 }, { opacity: 0, duration: 0.12, ease: "none", immediateRender: false }, t0);
        tl.fromTo(cap, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "none", immediateRender: false }, t1);
      }
      return r;
    };
    K.headline = function (parts, o) {
      heads.push({ first: Math.min(...parts.map((q) => (q.at == null ? 0 : q.at))), out: o && o.out != null ? o.out : null });
      return head0(parts, o);
    };
  }
})();
