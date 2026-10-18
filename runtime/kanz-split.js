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
    const fps = o.fps || 24;

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

    const prev = K.seek;
    K.seek = function (t) {
      prev(t);
      const on = K.inSplit(t);
      clip.style.clipPath = on ? clipTo : "none";
      shift.style.transform = on ? `translate(0px, ${by - K.view.y}px) scale(${S})` : "none";
      box.style.visibility = on ? "visible" : "hidden";
      seam.style.visibility = on ? "visible" : "hidden";
      // Ahmed 2026-10-17: in the 50/50 split the subtitles sit in the middle, centred on the seam; when only he or
      // only the board shows they go back to their usual place (the stylesheet's top, untouched here).
      if (cap) { cap.style.top = on ? "960px" : ""; cap.style.transform = on ? "translateY(-50%)" : ""; }
      if (!on) { generation++; pending = null; return; }
      const i = Math.max(1, Math.min(o.n, Math.floor(t * fps + 1e-6) + 1));
      if (pending && pending.i === i) return pending.promise;
      const gen = ++generation;
      pending = null;
      if (cv.dataset.i === String(i)) return;
      const promise = draw(i, gen).finally(() => { if (pending && pending.gen === gen) pending = null; });
      pending = { i, gen, promise };
      return promise;
    };
  };
})();
