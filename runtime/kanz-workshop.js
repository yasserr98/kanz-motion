/* Kanz workshop-short helpers (editor preset, 2026-10-23; opt-in, see docs/routes/workshop-editor-preset.md).
 * Written for the six shorts cut from the 2026-09-27 workshop and the editor's review of them: "smooth out the animation
 * in and out", "do not overlap text or images between scenes that are unrelated", "sound effects are misaligned",
 * "make the charts candles". Nothing here changes a default: a scene uses these only when it calls them.
 * Load after kanz-footage.js and kanz-split.js, before scene.js.
 *
 * K.cutBefore(word, after?)   the time to cut before `word`: the middle of the pause before it, or the word's start when
 *                             the voice runs on (recognisers glue words in fast speech). Use for face/split/board edges.
 * K.boardSwap(from, to, id, t, { scale })
 *                             a visible change of board (split -> split, split -> full board): `from` fades out over the
 *                             0.25 s before t, the camera jumps to board `id` at t while nothing shows, `to` fades in over
 *                             0.3 s. Two unrelated scenes never share a frame. Not needed when his face covers the change.
 * K.candleSeries(closes, start, wick?)
 *                             OHLC rows for K.candles from a list of closes: each candle opens on the last close, wicks
 *                             `wick` (default 2) past both. K.candleSeries([97, 91, 85], 100) = three falling candles.
 * K.onScreenSounds()          call last, just before K.finish(): drops every sound cue that falls inside a face window,
 *                             where the board it belongs to is hidden (pieces built ~0.3 s before a cut, PRE). The
 *                             footage layer's own whoosh sits at a face window's end (t == end is outside it) and stays.
 * Dissolves are the footage layer's own: K.footage({ xstyle: "dissolve", xfade: 0.35, ... }).
 */
(function () {
  const K = window.K;

  K.cutBefore = function (word, after = 0) {
    const t = K.T(word, after);
    let prev = null;
    for (const k of window.TOKENS || []) {
      if (k.start >= t - 1e-3) break;
      prev = k;
    }
    return prev && prev.end < t ? (prev.end + t) / 2 : t;
  };

  K.boardSwap = function (from, to, id, t, o = {}) {
    K.tl.to(from, { autoAlpha: 0, duration: 0.25 }, t - 0.25);
    K.cam(t, id, { dur: 0.04, sfx: false, scale: o.scale != null ? o.scale : 1.0 });
    K.tl.fromTo(to, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, immediateRender: false }, t);
  };

  K.candleSeries = function (closes, start, wick = 2) {
    return closes.map((c, i) => {
      const o = i ? closes[i - 1] : start;
      return [o, Math.max(o, c) + wick, Math.min(o, c) - wick, c];
    });
  };

  K.onScreenSounds = function () {
    if (!K.inFace) return;
    for (let i = K.cues.length - 1; i >= 0; i--) if (K.inFace(K.cues[i].t)) K.cues.splice(i, 1);
  };
})();
