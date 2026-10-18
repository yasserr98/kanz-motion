/* Kanz split layout (2026-10-17): shorts cut from Ahmed's X Live workshops alternate a 50/50 split screen (his tracked
 * face in one half, the board in the other) with full-screen boards. Ahmed: "yeah 50 50", "all of workshop videos inserts
 * should alternate between the split screen and full".
 *
 * Every moment of the short is one of three things:
 *   face   K.footage windows: his tracked face fills the screen          (runtime/kanz-footage.js, assets/face)
 *   split  K.split windows:  face in one half, the board in the other    (this file, assets/half)
 *   board  anywhere else:    the full-screen board, nothing to configure
 * Both helpers can be used in one scene; windows must not overlap. Cuts stay hard, in the pauses.
 *
 * K.split({ dir, n, windows, face, boardScale, boardY, sfx })   call once, after K.look() / K.pace() / K.footage()
 *   dir         folder of numbered half frames 000001.jpg... (1080x960, written by engine/footage_track.py to assets/half)
 *   n           number of frames in that folder (same count as assets/face)
 *   windows     [[t0, t1], ...] seconds in the short when the split shows
 *   face        "bottom" (default) or "top": which half carries his face. Bottom keeps the board under the platform's
 *               top bar and puts the captions (y 1452..1700) over his chest, clear of his face; "top" puts the face
 *               under the top bar and the board in the lower half. Either way, while the split shows, the
 *               captions sit in the middle of the screen, centred on the seam (Ahmed 2026-10-17), and return to their
 *               usual place on face-only and board-only moments.
 *   boardScale  how much the board shrinks to fit its half (default 0.8: the 1000x860 board fits above y 930)
 *   boardY      where the board's centre lands in the screen (default 590 for face "bottom", 1205 for "top")
 *   sfx         true = a soft whoosh on every cut into and out of the split (default false: the voice carries it)
 * The board half is the same world the full-screen board uses, scaled by boardScale about its centre and clipped to its
 * half, so the same objects, camera moves and headlines work in both. A 6 px lavender seam separates the halves.
 * Build a board's opening objects ~0.3 s before the split cut (const PRE = 0.3), as for any face <-> motion cut.
 * K.inSplit(t) tells whether t falls in a split window.
 *
 * 2026-10-18: K.seek returns the full-face layer's frame promise too, so the renderer waits for that frame as well
 * (before, a face window under a scene with K.split could be captured on the previous face frame: a stutter). With the
 * shorts defaults (K.pace({defaults: "2026-10-18"})): `ease` (K.D.ease, SHORT-16) moves between the split and a
 * full-screen board over `ease` s (0.35): the board shrinks into its half while his face slides in, and back; a change
 * to or from his full face stays a clean cut. `faces` (K.D.faces): when his eyes or mouth would sit under the
 * subtitles on the seam, they move to the board side of the seam.
 */
(function () {
  const K = window.K;
  K.splitWindows = [];
  K.inSplit = (t) => K.splitWindows.some(([a, b]) => t >= a && t < b);

  K.split = function (o) {
    const stage = document.getElementById("stage");
    const bottom = (o.face || "bottom") !== "top";
    const fy = bottom ? 960 : 0;                                   // top of the face half
    const S = o.boardScale || 0.8, by = o.boardY != null ? o.boardY : bottom ? 590 : 1205;
    K.splitWindows = o.windows;
    K.splitFaceTop = fy;
    const fps = o.fps || 24;
    const E = K.D.ease ? (o.ease != null ? o.ease : 0.35) : 0;
    const touchesFace = (x) => (K.faceWindows || []).some(([a, b]) => Math.abs(a - x) < 0.02 || Math.abs(b - x) < 0.02);
    const smooth = (u) => u * u * (3 - 2 * u);
    // how far into the split layout the frame is: 1 inside a window, easing in over its first E s and out over the E s
    // after it, unless that edge meets his full face (a clean cut)
    const amount = (t) => {
      for (const [a, b] of o.windows) {
        if (t >= a && t < b) return E && !touchesFace(a) && t < a + E ? smooth((t - a) / E) : 1;
        if (E && t >= b && t < b + E && !touchesFace(b) && !o.windows.some(([c]) => Math.abs(c - b) < 0.02)) return 1 - smooth((t - b) / E);
      }
      return 0;
    };

    // ---- the face half: one 1080x960 canvas, frames read as blobs and released (same memory rule as K.footage) ----
    const box = document.createElement("div");
    box.id = "splitface";
    box.style.cssText = `position:absolute;left:0;top:${fy}px;width:1080px;height:960px;z-index:4;background:#000;overflow:hidden;visibility:hidden`;
    const cv = document.createElement("canvas");
    cv.width = 1080; cv.height = 960;
    cv.style.cssText = "width:1080px;height:960px;display:block";
    cv.dataset.i = "0";
    box.appendChild(cv);
    const ctx = cv.getContext("2d");
    const seam = document.createElement("div");
    const seamY = bottom ? 960 - 3 : 960 - 3;
    seam.style.cssText = `position:absolute;left:0;top:${seamY}px;width:1080px;height:6px;z-index:4;background:#d5adef;box-shadow:0 0 18px rgba(213,173,239,.55);visibility:hidden`;
    const before = document.getElementById("headline");
    const cap = document.getElementById("captions");
    stage.insertBefore(box, before);
    stage.insertBefore(seam, before);
    const name = (i) => `${o.dir}/${String(i).padStart(6, "0")}.jpg`;
    let generation = 0, pending = null;
    const draw = (i, gen) => new Promise((res, reject) => {
      const x = new XMLHttpRequest();
      x.open("GET", name(i));
      x.responseType = "blob";
      const fail = () => reject(new Error(`Unable to load split frame: ${name(i)} (status ${x.status})`));
      x.onload = () => {
        if (x.status !== 0 && (x.status < 200 || x.status >= 300)) return fail();
        createImageBitmap(x.response).then((b) => {
          try {
            if (gen === generation) { ctx.drawImage(b, 0, 0, 1080, 960); cv.dataset.i = String(i); }
            res();
          } finally { b.close(); }
        }).catch((err) => reject(new Error(`Unable to decode split frame: ${name(i)}: ${err.message}`)));
      };
      x.onerror = fail;
      x.onabort = fail;
      x.send();
    });

    // ---- the board half: everything below the headline moves into a clip layer; only the world is scaled ----
    const SKIP = new Set(["headline", "captions", "overlay", "vignette", "grain", "logo", "safeguide", "snapflash", "splitface"]);
    const movers = [...stage.children].filter((e) => e !== seam && e !== box && !SKIP.has(e.id) && e.tagName === "DIV" &&
      (e.id === "world" || e.id === "camwrap" || e.id === "keylight" || e.id === "paperworld" || /^screen\d+$/.test(e.id)));
    const clip = document.createElement("div");
    clip.style.cssText = "position:absolute;inset:0;z-index:1";
    stage.insertBefore(clip, movers[0] || before);
    let shift = null;
    movers.forEach((e) => {
      if (e.id === "world" || e.id === "camwrap") {
        shift = document.createElement("div");
        shift.style.cssText = `position:absolute;inset:0;transform-origin:540px ${K.view.y}px`;
        clip.appendChild(shift);
        shift.appendChild(e);
      } else clip.appendChild(e);
    });
    if (!shift) throw new Error("K.split: no #world or #camwrap in the stage");
    const clipTo = bottom ? "inset(0 0 960px 0)" : "inset(960px 0 0 0)";      // keep only the board half

    if (o.sfx) o.windows.forEach(([a, b]) => { K.sfx(a, "whoosh", 0.16); K.sfx(b, "whoosh", 0.16); });

    const capSeam = (t) => {  // subtitles on the seam, or on the board side of it when his face is right under it
      if (!(K.D.faces && window.FACES && K.faceAt)) return { top: "960px", tr: "translateY(-50%)" };
      const f = K.faceAt(t), half = 85 + K.FACE_MARGIN;
      if (!f) return { top: "960px", tr: "translateY(-50%)" };
      if (bottom && f[1] < 960 + half) return { top: "954px", tr: "translateY(-100%)" };
      if (!bottom && f[3] > 960 - half) return { top: "966px", tr: "translateY(0)" };
      return { top: "960px", tr: "translateY(-50%)" };
    };
    let capSet = false;
    const prev = K.seek;
    K.seek = function (t) {
      const u = amount(t), on = u > 0;
      if (!on && capSet && cap) { cap.style.top = ""; cap.style.transform = ""; capSet = false; } // before the face layer places them
      const base = prev(t);
      const full = u >= 1 - 1e-6;
      clip.style.clipPath = !on ? "none" : full ? clipTo : bottom ? `inset(0 0 ${960 * u}px 0)` : `inset(${960 * u}px 0 0 0)`;
      shift.style.transform = on ? `translate(0px, ${(by - K.view.y) * u}px) scale(${full ? S : 1 + (S - 1) * u})` : "none";
      const slide = (1 - u) * 960 * (bottom ? 1 : -1);    // his half slides in from the frame edge
      box.style.top = (fy + slide) + "px";
      seam.style.top = (seamY + slide) + "px";           // the seam rides on the edge of his half
      box.style.visibility = on ? "visible" : "hidden";
      seam.style.visibility = on ? "visible" : "hidden";
      // Ahmed 2026-10-17: in the 50/50 split the subtitles sit in the middle, centred on the seam; when only he or
      // only the board shows they go back to their usual place (the stylesheet's top, untouched here).
      if (cap && on) {
        const c = capSeam(t);
        cap.style.top = c.top; cap.style.transform = c.tr; capSet = true;
      }
      if (!on) { generation++; pending = null; return base; }
      const i = Math.max(1, Math.min(o.n, Math.floor(t * fps + 1e-6) + 1));
      const both = (p) => (base && typeof base.then === "function" ? Promise.all([base, p]) : p);
      if (pending && pending.i === i) return both(pending.promise);
      const gen = ++generation;
      pending = null;
      if (cv.dataset.i === String(i)) return base;
      const promise = draw(i, gen).finally(() => { if (pending && pending.gen === gen) pending = null; });
      pending = { i, gen, promise };
      return both(promise);
    };
  };
})();
