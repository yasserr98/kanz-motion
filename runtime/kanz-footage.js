/* Kanz footage layer (2026-10-16): shorts cut from a long Kanz video alternate the speaker's real face with
 * motion boards. Ahmed: "make sure to alternate between his face and the motion", "first 3 seconds always has to
 * show his face".
 *
 * K.footage({ dir, n, windows })  call once, after K.look() / K.pace()
 *   dir      folder of numbered frames 000001.jpg... (1080x1920, extracted at K.fps by engine/footage.py)
 *   n        number of frames in that folder
 *   windows  [[t0, t1, zoom?], ...] when the face covers the frame; between them the motion world shows.
 *            zoom (default 1) punches in on the face; two touching windows with different zooms = a jump zoom
 *   end      optional: video end, so a face window that closes the video gets no whoosh
 *   xfade    seconds of the soft dissolve at every face <-> motion change (default 0.2; 0 = hard cut). The face
 *            fades and pushes in 6% on the way out, and settles from 6% on the way back (Ahmed 2026-10-16: fix the
 *            transitions between the video and the motion). Touching windows (jump zooms) stay hard cuts. Build each
 *            board's opening objects ~0.3 s before its cut so the dissolve reveals a finished board, not charcoal.
 * The face sits above the world and under the headline and captions, so captions run across both. Each seek
 * waits for the frame to decode (the renderer awaits the promise K.seek returns), so no frame is captured blank.
 * Frames are read as blobs and drawn into one canvas, then released: swapping an <img> src kept every decoded
 * 1080x1920 frame in Chromium's memory and the first render ran out of RAM (2026-10-16).
 * Burned-in text in the source footage (lower-third labels) stays as it is.
 */
(function () {
  const K = window.K;
  K.faceWindows = [];
  K.inFace = (t) => K.faceWindows.some(([a, b]) => t >= a && t < b);

  K.footage = function (o) {
    const stage = document.getElementById("stage");
    const box = document.createElement("div");
    box.id = "face";
    box.style.cssText = "position:absolute;inset:0;z-index:4;background:#000;visibility:hidden";
    const img = document.createElement("canvas");
    img.width = 1080; img.height = 1920;
    img.style.cssText = "width:1080px;height:1920px;display:block";
    const ctx = img.getContext("2d");
    const name = (i) => `${o.dir}/${String(i).padStart(6, "0")}.jpg`;
    const draw = (i) => new Promise((res) => {
      const x = new XMLHttpRequest();
      x.open("GET", name(i));
      x.responseType = "blob";
      x.onload = () => createImageBitmap(x.response)
        .then((b) => { ctx.drawImage(b, 0, 0, 1080, 1920); b.close(); res(); }).catch(() => res());
      x.onerror = () => res();
      x.send();
    });
    img.dataset.i = "0";
    box.appendChild(img);
    stage.insertBefore(box, document.getElementById("headline"));
    K.faceWindows = o.windows;
    const fps = o.fps || 24;
    const grain = document.getElementById("grain");
    const grainOp = grain ? getComputedStyle(grain).opacity : null;
    // a soft whoosh on every cut from the face into the motion (none back to the face: the voice carries it)
    const touches = (b) => o.windows.some(([a]) => Math.abs(a - b) < 0.02);
    if (o.sfx !== false) o.windows.forEach(([, b]) => { if (!touches(b) && (o.end == null || b < o.end - 0.1)) K.sfx(b, "whoosh", 0.16); });
    img.style.transformOrigin = `540px ${o.faceY || 700}px`;

    const X = o.xfade == null ? 0.2 : o.xfade, h = X / 2;
    const ease = (u) => u * u * (3 - 2 * u);
    // opacity and push of the face at t: 1 inside a window, ramping over X around each edge that meets the motion
    const faceAt = (t) => {
      for (const [a, b, z = 1] of o.windows) {
        const soft0 = a > 0 && !o.windows.some(([, e]) => Math.abs(e - a) < 0.02);
        const soft1 = !touches(b) && (o.end == null || b < o.end - 0.1);
        const lo = soft0 ? a - h : a, hi = soft1 ? b + h : b;
        if (t < lo || t >= hi) continue;
        let op = 1, push = 1;
        if (soft0 && t < a + h) { const u = ease((t - lo) / X); op = u; push = 1 + 0.06 * (1 - u); }
        if (soft1 && t > b - h) { const u = ease((t - (b - h)) / X); op = Math.min(op, 1 - u); push = 1 + 0.06 * u; }
        return { z: z * push, op };
      }
      return null;
    };

    const prev = K.seek;
    K.seek = function (t) {
      prev(t);
      const win = faceAt(t);
      const on = !!win;
      box.style.visibility = on ? "visible" : "hidden";
      if (grain) grain.style.opacity = on && win.op > 0.5 ? String(grainOp * 0.45) : grainOp; // light grain on skin
      if (!on) return;
      box.style.opacity = String(win.op);
      box.style.background = win.op < 1 ? "transparent" : "#000";
      img.style.transform = `scale(${win.z})`;
      const i = Math.max(1, Math.min(o.n, Math.floor(t * fps + 1e-6) + 1));
      if (img.dataset.i === String(i)) return;
      img.dataset.i = String(i);
      return draw(i);
    };
  };
})();
