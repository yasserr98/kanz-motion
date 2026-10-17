"""Check that board text over full-screen photos stays readable, measured on the rendered frame itself.

    python engine/contrast.py <project_dir> t1,t2,...

At each time: seeks the scene, finds every visible headline/label (#world .t, .tag text, .kcount) that sits over a
full-screen photo (K.screen), screenshots the frame with the text hidden, and measures the background behind each box.
Reports the WCAG contrast of each text colour (including captions) against the 90th-percentile (brightest) background pixels. Target >= 4.5
(Ahmed 2026-10-16: "make sure the text of the headline doesn't blend in the image"). Also prints each photo's lift.
"""
import io
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright


def lum(rgb):
    c = rgb / 255.0
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def contrast(rgb, colour):
    channels = [float(x) for x in re.findall(r"[\d.]+", colour)]
    fg = lum(np.array(channels[:3]))
    bg = np.percentile(lum(rgb), 90)
    alpha = channels[3] if len(channels) > 3 else 1.0
    fg = alpha * fg + (1 - alpha) * bg
    return (max(fg, bg) + 0.05) / (min(fg, bg) + 0.05), bg


def main(proj, times):
    proj = Path(proj).resolve()
    worst = 99
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--allow-file-access-from-files"])
        pg = b.new_page(viewport={"width": 1080, "height": 1920})
        pg.goto((proj / "index.html").as_uri())
        pg.wait_for_function("document.fonts && document.fonts.status === 'loaded' && window.K")
        pg.wait_for_function("Array.from(document.images).every(i => i.complete && i.naturalWidth > 0)")
        print("lifts:", pg.evaluate("[...document.querySelectorAll('[id^=screen]')].map(e => e.id + ' ' + e.dataset.lift)"))
        for t in times:
            pg.evaluate(f"K.seek({t})")
            boxes = pg.evaluate("""() => {
              if (document.getElementById('stage').dataset.screen !== 'on') return [];
              const face = document.getElementById('face'); if (face && face.style.visibility === 'visible') return [];
              const boxes = [];
              const roots = [...document.querySelectorAll('#world .t, #world .kcount, #captions')];
              for (const root of roots.filter(e => !roots.some(p => p !== e && p.contains(e)))) {
                const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
                while (walk.nextNode()) {
                  const node = walk.currentNode, e = node.parentElement, s = getComputedStyle(e);
                  if (!node.textContent.trim() || s.visibility === 'hidden' || s.display === 'none') continue;
                  let opacity = 1;
                  for (let p = e; p; p = p.parentElement) opacity *= +getComputedStyle(p).opacity;
                  if (opacity <= 0.5) continue;
                  const range = document.createRange(); range.selectNodeContents(node);
                  for (const r of range.getClientRects()) {
                    if (r.width > 4 && r.height > 4 && r.y < 1920 && r.bottom > 0)
                      boxes.push([node.textContent.trim().slice(0, 24), r.x, r.y, r.width, r.height, s.color]);
                  }
                }
              }
              return boxes;
            }""")
            if not boxes:
                print(f"{t:6.2f}s  no text over a photo")
                continue
            pg.add_style_tag(content="#world .t,#world .kcount{visibility:hidden!important} #captions{visibility:hidden!important}")
            img = np.asarray(Image.open(io.BytesIO(pg.screenshot(clip={"x": 0, "y": 0, "width": 1080, "height": 1920}))).convert("RGB")).astype(float)
            pg.evaluate("document.querySelectorAll('style').forEach(s => { if (s.textContent.includes('visibility:hidden!important')) s.remove(); })")
            for name, x, y, w, h, colour in boxes:
                x0, y0 = max(0, int(x)), max(0, int(y))
                reg = img[y0:max(0, int(y + h)), x0:max(0, int(x + w))]
                if reg.size == 0:
                    continue
                cr, bg = contrast(reg, colour)
                worst = min(worst, cr)
                print(f"{t:6.2f}s  {'OK  ' if cr >= 4.5 else 'LOW '} contrast {cr:5.1f}  bg90 {bg:.3f}  '{name}'")
        b.close()
    print(f"worst contrast: {worst:.1f} (target >= 4.5)")


if __name__ == "__main__":
    from console import utf8
    utf8()
    main(sys.argv[1], [float(x) for x in sys.argv[2].split(",")])
