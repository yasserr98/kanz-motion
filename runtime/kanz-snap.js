/* Real photos inside a Reel (2026-10-16, Ahmed: "the images that come from disposable cameras ... adding pictures,
 * real pictures, within the video").
 *
 * K.snap35(parent, src, {x, y, w, h, rot, at, out, date, credit, flash, pos})
 *   A real, licensed photo as a disposable-camera print: thin white border, warm film grade, on-camera flash falloff
 *   and a light leak. No date stamp by default (Ahmed 2026-10-16: "super great too but without the date"); `date`
 *   still draws one if a video ever asks for it. It drops in with a shutter + flash. The photo pixels are
 *   never repainted (a CSS grade over the original), so the subject stays exactly as photographed.
 *   date: optional stamp text (off by default). credit: an on-screen licence line under the print, off by default
 *   (Ahmed 2026-10-16: "don't add the image source, just the image"); credits go in the post caption (CREDITS.md).
 *   Tags and board text always sit on top of a print (z-index 8 over the print's 5).
 * K.snapStack(parent, items, o): several prints dealt on top of each other, slightly rotated, one per `at`.
 */
(function () {
  const K = window.K, tl = K.tl;
  const css = document.createElement("style");
  css.textContent = `
  .ksnap{position:absolute;background:#f4f1ea;padding:16px 16px 54px;box-shadow:0 22px 40px rgba(0,0,0,.55),0 2px 4px rgba(0,0,0,.4);
    transform-origin:50% 50%}
  .ksnap .ph{position:relative;width:100%;height:100%;overflow:hidden;background:#111}
  .ksnap img{width:100%;height:100%;object-fit:cover;display:block;filter:contrast(1.12) saturate(1.18) sepia(.16) brightness(1.04)}
  .ksnap .flash{position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 50% 45%,rgba(255,255,255,.14) 0%,rgba(0,0,0,0) 45%,rgba(0,0,0,.55) 100%)}
  .ksnap .leak{position:absolute;inset:0;mix-blend-mode:screen;background:linear-gradient(100deg,rgba(255,120,40,.38) 0%,rgba(255,80,60,.12) 18%,rgba(0,0,0,0) 34%)}
  .ksnap .grain{position:absolute;inset:-20px;opacity:.22;mix-blend-mode:overlay;background-size:180px 180px}
  .ksnap .stamp{position:absolute;right:18px;bottom:14px;font:700 30px/1 "Courier New",monospace;color:#ff8a2a;letter-spacing:2px;
    text-shadow:0 0 6px rgba(255,120,30,.85),0 0 2px #ffb070;direction:ltr}
  .ksnapcredit{position:absolute;font-size:20px;color:rgba(255,255,255,.6);text-align:center;direction:ltr;white-space:nowrap}
  #stage[data-screen=on] #world .t,#stage[data-screen=on] #world .kcount{text-shadow:0 2px 6px rgba(0,0,0,.7),0 0 26px rgba(0,0,0,.85),0 0 60px rgba(0,0,0,.55)}
  #stage[data-screen=on] #world .tag{box-shadow:0 6px 24px rgba(0,0,0,.6)}
  #world .tag,#world .t{z-index:8}
  #snapflash{position:absolute;inset:0;background:#fff;z-index:16;pointer-events:none;visibility:hidden}`;
  document.head.appendChild(css);
  let grainUrl = null;
  const grain = () => {
    if (grainUrl) return grainUrl;
    const c = document.createElement("canvas"); c.width = c.height = 180;
    const g = c.getContext("2d"), d = g.createImageData(180, 180); let s = 99;
    for (let i = 0; i < d.data.length; i += 4) { s = (s * 16807) % 2147483647; const v = (s / 2147483647) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0); return (grainUrl = c.toDataURL());
  };
  let flashEl = null;
  K.snap35 = function (parent, src, o) {
    const w = o.w || 620, h = o.h || 760;
    const e = K.el("div", "ksnap", parent);
    e.innerHTML = `<div class="ph"><img src="${src}"><div class="flash"></div>${o.leak === false ? "" : '<div class="leak"></div>'}` +
      `<div class="grain" style="background-image:url(${grain()})"></div>${o.date ? `<div class="stamp">${o.date}</div>` : ""}</div>`;
    gsap.set(e, { left: o.x - (w + 32) / 2, top: o.y - (h + 70) / 2, width: w + 32, height: h + 70, rotation: o.rot || 0, zIndex: o.z || 5 });
    gsap.set(e.querySelector(".ph"), { width: w, height: h });
    if (o.pos) e.querySelector("img").style.objectPosition = o.pos;
    let c = null;
    if (o.credit) {
      c = K.el("div", "ksnapcredit", parent, o.credit);
      gsap.set(c, { left: o.x, top: o.y + (h + 70) / 2 + 26, xPercent: -50 });
    }
    if (o.at != null) {
      tl.set(e, { autoAlpha: 0 }, 0);
      tl.fromTo(e, { autoAlpha: 0, scale: 1.25, y: -60, rotation: (o.rot || 0) - 9 },
        { autoAlpha: 1, scale: 1, y: 0, rotation: o.rot || 0, duration: 0.45, ease: "power3.out", immediateRender: false }, o.at);
      const im = e.querySelector("img");
      tl.fromTo(im, { scale: 1 }, { scale: 1.07, duration: o.out != null ? Math.max(1, o.out - o.at) : 4, ease: "none", immediateRender: false }, o.at);
      K.sfx(o.at, "shutter", 0.35);
      if (o.flash !== false) {
        if (!flashEl) { flashEl = document.createElement("div"); flashEl.id = "snapflash"; document.getElementById("stage").appendChild(flashEl); tl.set(flashEl, { autoAlpha: 0 }, 0); }
        tl.fromTo(flashEl, { autoAlpha: 0.85 }, { autoAlpha: 0, duration: 0.22, ease: "power2.out", immediateRender: false }, o.at);
      }
      if (c) { tl.set(c, { autoAlpha: 0 }, 0); tl.to(c, { autoAlpha: 1, duration: 0.3 }, o.at + 0.4); }
    }
    if (o.out != null) tl.to(c ? [e, c] : e, { autoAlpha: 0, duration: 0.25 }, o.out);
    return e;
  };
  // K.screen(src, at, out, {credit, kb, dark, fade}): a full-screen photo for a PLACE or SETTING (AGENTS.md visual
  // types). It fills the 1080x1920 frame whatever the camera does, sits under the world (board text, tags and prints
  // stay on top) and under the face layer and captions; darkened top and bottom so the headline and captions read.
  let screens = 0;
  K.screen = function (src, at, out, o = {}) {
    const stage = document.getElementById("stage");
    const before = document.getElementById("camwrap") || document.getElementById("world");
    const e = document.createElement("div");
    e.id = "screen" + ++screens;
    e.style.cssText = "position:absolute;inset:0;z-index:1;overflow:hidden;background:#08070b";
    // Lift (Ahmed 2026-10-16: "make sure the text of the headline doesn't blend in the image ... a lift based on the image
    // render"): on load, the photo is measured where the headline (top 30%) and captions (lower band) sit, as it will be
    // cropped on screen; brighter or busier bands get a darker scrim there. o.dark overrides the measurement.
    e.innerHTML = `<img src="${src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:50% 45%` +
      `${o.pos ? ";object-position:" + o.pos : ""}"><div class="kscrim" style="position:absolute;inset:0"></div>`;
    const img = e.querySelector("img"), scrim = e.querySelector(".kscrim");
    const paint = (top, low) => {
      scrim.style.background = `linear-gradient(180deg,rgba(8,7,11,${top}) 0%,rgba(8,7,11,${top * 0.9}) 16%,` +
        `rgba(8,7,11,${top * 0.45}) 32%,rgba(8,7,11,${low * 0.35}) 52%,rgba(8,7,11,${low}) 72%,rgba(8,7,11,${Math.min(0.95, low + 0.12)}) 100%)`;
      e.dataset.lift = `${top.toFixed(2)}/${low.toFixed(2)}`;
    };
    paint(0.72, 0.72);
    const measure = () => {
      if (o.dark != null) return paint(o.dark, o.dark);
      const W = 54, H = 96, c = document.createElement("canvas"); c.width = W; c.height = H;
      const g = c.getContext("2d"), r = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * r, dh = img.naturalHeight * r;
      g.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh); // same crop as object-fit: cover
      const px = g.getImageData(0, 0, W, H).data;
      const band = (y0, y1) => { // mean luminance and its spread (busyness) in rows y0..y1
        const v = [];
        for (let y = Math.floor(y0 * H); y < y1 * H; y++) for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4; v.push((0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255);
        }
        const m = v.reduce((a, b) => a + b, 0) / v.length;
        return [m, Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length)];
      };
      // white text needs the scrimmed band near or below ~0.18 luminance; dark the band until it gets there
      const need = ([m, sd]) => Math.max(0.55, Math.min(0.94, 1 - 0.18 / Math.max(0.2, m + 1.2 * sd)));
      paint(need(band(0.04, 0.3)), need(band(0.6, 0.8)));
    };
    const safe = () => { try { measure(); } catch (err) { paint(0.86, 0.82); e.dataset.lift += " (unmeasured)"; } };
    if (img.complete && img.naturalWidth) safe(); else img.addEventListener("load", safe);
    // a soft dark halo behind board text while any photo fills the screen
    tl.set(stage, { attr: { "data-screen": "on" } }, at);
    tl.set(stage, { attr: { "data-screen": "off" } }, out);
    stage.insertBefore(e, before);
    tl.set(e, { autoAlpha: 0 }, 0);
    tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: o.fade || 0.12, immediateRender: false }, at);
    tl.fromTo(e.querySelector("img"), { scale: 1.02 }, { scale: o.kb || 1.1, duration: Math.max(0.5, out - at), ease: "none", immediateRender: false }, at);
    tl.set(e, { autoAlpha: 0 }, out);
    if (o.credit) {
      const c = document.createElement("div");
      c.className = "ksnapcredit";
      c.textContent = o.credit;
      c.style.cssText += ";left:540px;top:1830px;transform:translateX(-50%)";
      e.appendChild(c);
    }
    if (o.sfx !== false) K.sfx(at, "whoosh", 0.18);
    return e;
  };
  K.snapStack = function (parent, items, o = {}) {
    return items.map((it, i) => K.snap35(parent, it.src, { x: o.x + (i % 2 ? 40 : -30), y: o.y + i * 18, w: o.w, h: o.h,
      rot: it.rot != null ? it.rot : (i % 2 ? 5 : -6), z: 5 + i, flash: i === 0, ...it }));
  };
})();
