"""Comparison page for the Codex images and real photos of shorts B and D: kanz (with the Kanz MD rules) vs free
(without), plus the sourced real photos and the variant review sheets. Writes work/images.html."""
import html
import json
from pathlib import Path

W = Path(__file__).resolve().parent
KM = W.parents[2]  # kanz-motion
rows = []
for slug, title in [("short-house-always-wins", "B · البيت كسبان كده كده"), ("short-biggest-betting-event", "D · نهائي 2022")]:
    spec = json.loads((KM / "projects" / slug / "shots.json").read_text(encoding="utf-8"))
    rows.append(f"<h2>{html.escape(title)}</h2>")
    for s in spec["shots"]:
        cells = []
        for mode, label in [("kanz", "With the Kanz MD rules (approved icon style)"), ("free", "Without the MD rules (Codex, script context only)")]:
            f = KM / "projects" / slug / "assets" / "codex" / mode / f"{s['name']}.png"
            rel = Path("../../../projects") / slug / "assets" / "codex" / mode / f"{s['name']}.png"
            img = f'<img src="{rel.as_posix()}">' if f.exists() else '<div class="miss">not generated</div>'
            cells.append(f'<figure class="{mode}">{img}<figcaption>{label}</figcaption></figure>')
        rows.append(f'<section><h3>{html.escape(s["name"])}</h3><p class="line">{html.escape(s["line"])}</p>'
                    f'<div class="pair">{"".join(cells)}</div></section>')
photos = sorted((W.parent / "photos").glob("*.jp*g")) + sorted((W.parent / "photos").glob("*.png"))
if photos:
    rows.append("<h2>Real photos (Wikimedia Commons, licences in photos/SOURCES.md)</h2><div class='photos'>" +
                "".join(f'<figure><img src="../photos/{p.name}"><figcaption>{p.name}</figcaption></figure>' for p in photos) + "</div>")
if (W / "messi-treatments.png").exists():
    rows.append("<h2>Real photos of real people: three treatments</h2><p>Codex refused to edit Messi's photo (public figure), "
                "so the Kanz look is done by the engine without repainting the photo.</p>"
                "<figure class='sheet'><img src='messi-treatments.png'></figure>")
sheets = sorted(W.glob("variant-*.jpg"))
if sheets:
    rows.append("<h2>Inside the video: same moments, three versions</h2><p>Rows top to bottom: v1 (current), kanz (with the "
                "MD rules: Codex icons + real photos as disposable prints), free (without the MD rules: Codex photos full frame).</p>" +
                "".join(f'<figure class="sheet"><img src="{p.name}"><figcaption>{p.stem}</figcaption></figure>' for p in sheets))
page = f"""<!doctype html><html lang="ar"><head><meta charset="utf-8"><title>Shorts images</title><style>
body{{background:#16151a;color:#eee;font:16px/1.5 system-ui;margin:24px;max-width:1300px}}
h2{{margin:36px 0 8px;color:#d5adef}} h3{{margin:0;direction:ltr}} .line{{color:#bbb;margin:4px 0 10px}}
section{{background:#211f27;border-radius:10px;padding:14px;margin:0 0 14px}}
.pair{{display:flex;gap:14px}} figure{{margin:0;flex:1}} figure img{{width:100%;max-height:520px;object-fit:contain;border-radius:6px}}
.kanz img{{background:#2b2931}} figcaption{{color:#aaa;font-size:13px;direction:ltr}}
.photos{{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}} .photos img{{height:300px;object-fit:cover}}
.sheet img{{max-height:none}} .miss{{height:200px;display:grid;place-items:center;color:#777;border:1px dashed #555}}
</style></head><body dir="ltr"><h1>Images for shorts B and D</h1>
<p>Kanz-rules images are transparent cutouts in the approved icon style (the default for production). The no-rules images
need your explicit exception before they can be used. Real people only appear in real licensed photos; nothing here
generates Messi.</p>{''.join(rows)}</body></html>"""
(W / "images.html").write_text(page, encoding="utf-8")
print(W / "images.html")
