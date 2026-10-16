"""Check that board text over full-screen photos stays readable, measured on the rendered frame itself.

    python engine/contrast.py <project_dir> t1,t2,...

At each time: seeks the scene, finds every visible headline/label (#world .t, .tag text, .kcount) that sits over a
full-screen photo (K.screen), screenshots the frame with the text hidden, and measures the background behind each box.
Reports the WCAG contrast of white text against the 90th-percentile (brightest) background pixels. Target >= 4.5
(Ahmed 2026-10-16: "make sure the text of the headline doesn't blend in the image"). Also prints each photo's lift.
"""
import io
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright


def lum(rgb):
    c = rgb / 255.0
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


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
              return [...document.querySelectorAll('#world .t, #world .kcount')].filter(e => {
                const s = getComputedStyle(e); return s.visibility !== 'hidden' && +s.opacity > 0.5 && e.textContent.trim();
              }).map(e => { const r = e.getBoundingClientRect(); return [e.textContent.trim().slice(0, 24), r.x, r.y, r.width, r.height]; })
                .filter(b => b[3] > 4 && b[4] > 4 && b[2] < 1920 && b[2] + b[4] > 0);
            }""")
            if not boxes:
                print(f"{t:6.2f}s  no text over a photo")
                continue
            pg.add_style_tag(content="#world .t,#world .kcount{visibility:hidden!important} #captions{visibility:hidden!important}")
            img = np.asarray(Image.open(io.BytesIO(pg.screenshot(clip={"x": 0, "y": 0, "width": 1080, "height": 1920}))).convert("RGB")).astype(float)
            pg.evaluate("document.querySelectorAll('style').forEach(s => { if (s.textContent.includes('visibility:hidden!important')) s.remove(); })")
            for name, x, y, w, h in boxes:
                x0, y0 = max(0, int(x)), max(0, int(y))
                reg = img[y0:int(y + h), x0:int(x + w)]
                if reg.size == 0:
                    continue
                bg = np.percentile(lum(reg), 90)
                cr = 1.05 / (bg + 0.05)
                worst = min(worst, cr)
                print(f"{t:6.2f}s  {'OK  ' if cr >= 4.5 else 'LOW '} contrast {cr:5.1f}  bg90 {bg:.3f}  '{name}'")
        b.close()
    print(f"worst contrast: {worst:.1f} (target >= 4.5)")


if __name__ == "__main__":
    main(sys.argv[1], [float(x) for x in sys.argv[2].split(",")])
