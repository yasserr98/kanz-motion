"""Snap candidate ranges to word boundaries, cut 9:16 preview clips and write picker.html."""
import html, json, subprocess, sys
from pathlib import Path

root = Path(sys.argv[1])
cand = json.loads((root / "candidates.json").read_text(encoding="utf-8"))
tr = json.loads((root / "transcript.raw.json").read_text(encoding="utf-8"))
words = [w for s in tr["segments"] for w in s["words"]]
cuts = [float(x) for x in (root / "cuts.txt").read_text().split()]
out = root / "clips" / "preview"
out.mkdir(parents=True, exist_ok=True)


def snap(a, b):
    inside = [w for w in words if w["start"] >= a - 0.05 and w["end"] <= b + 0.05]
    return max(0, inside[0]["start"] - 0.12), inside[-1]["end"] + 0.35, " ".join(w["w"] for w in inside)


def mmss(t):
    return f"{int(t // 60):02d}:{t % 60:04.1f}"


cards = []
for c in cand["candidates"]:
    parts = [snap(a, b) for a, b in c["parts"]]
    c["parts"] = [[round(a, 2), round(b, 2)] for a, b, _ in parts]
    dur = sum(b - a for a, b, _ in parts)
    ncut = sum(1 for t in cuts for a, b, _ in parts if a <= t <= b)
    c["duration"], c["graphic_cuts"] = round(dur, 1), ncut
    # preview: centre 9:16 crop of the 1080p frame, 540x960, parts joined
    fc, lab = [], []
    for i, (a, b, _) in enumerate(parts):
        fc.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS,crop=ih*9/16:ih,scale=540:960[v{i}];"
                  f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS[a{i}]")
        lab.append(f"[v{i}][a{i}]")
    fc.append("".join(lab) + f"concat=n={len(parts)}:v=1:a=1[v][a]")
    mp4 = out / f"{c['id']}-{c['name']}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(root / "source" / "video.mp4"),
                    "-filter_complex", ";".join(fc), "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "27", "-c:a", "aac", "-b:a", "96k",
                    "-movflags", "+faststart", str(mp4)], check=True)
    score = c["hook"] + c["standalone"] + c["payoff"] + c["motion"]
    ranges = " + ".join(f"{mmss(a)}–{mmss(b)}" for a, b, _ in parts)
    text = " … ".join(t for _, _, t in parts)
    risk = f'<p class="risk">⚠ {html.escape(c["risk"])}</p>' if c.get("risk") else ""
    cards.append(f"""<article><video controls preload="metadata" src="../clips/preview/{mp4.name}"></video>
<div class="meta"><h2><span class="id">{c['id']}</span> {html.escape(c['title'])}</h2>
<p class="nums">{ranges} · {dur:.0f} s · score {score}/20 (hook {c['hook']}, standalone {c['standalone']}, payoff {c['payoff']}, motion {c['motion']}) · {ncut} visual cuts in source</p>
<p class="why" dir="ltr">{html.escape(c['why'])}</p>{risk}
<details><summary>Transcript</summary><p class="tx">{html.escape(text)}</p></details>
<label><input type="checkbox" value="{c['id']}"> Make this short</label></div></article>""")

(root / "candidates.json").write_text(json.dumps(cand, ensure_ascii=False, indent=2), encoding="utf-8")
excl = "".join(f"<li>{html.escape(e['range'])}: {html.escape(e['why'])}</li>" for e in cand["excluded"])
page = f"""<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>Shorts picker</title>
<style>body{{background:#1b1a1f;color:#eee;font:16px/1.6 "IBM Plex Sans Arabic",system-ui;margin:24px}}
article{{display:flex;gap:20px;background:#26242c;border-radius:10px;padding:16px;margin:0 0 16px}}
video{{width:270px;height:480px;background:#000;border-radius:6px;flex:none}}
h2{{margin:0 0 6px;font-size:22px}} .id{{background:#D5ADEF;color:#1b1a1f;border-radius:4px;padding:0 8px}}
.nums{{color:#bbb;font-size:13px;direction:ltr;text-align:right}} .why{{text-align:left}} .risk{{color:#ffb4a8}}
.tx{{font-size:15px;color:#ddd}} label{{display:block;margin-top:10px;font-size:18px}}
#bar{{position:sticky;top:0;background:#1b1a1f;padding:8px 0 12px;z-index:2}} button{{font-size:16px;padding:6px 14px}}</style></head>
<body><div id="bar"><h1 style="margin:0">{html.escape(cand['title'])}: {len(cards)} candidate shorts</h1>
<button onclick="navigator.clipboard.writeText('Make shorts: '+[...document.querySelectorAll('input:checked')].map(x=>x.value).join(', '))">Copy my picks</button>
<span dir="ltr"> Ranked best first. Previews are a plain centre crop: no captions or motion yet.</span></div>
{''.join(cards)}<h3>Left out on purpose</h3><ul dir="ltr">{excl}</ul></body></html>"""
(root / "work" / "picker.html").write_text(page, encoding="utf-8")
for c in cand["candidates"]:
    print(c["id"], c["parts"], c["duration"], "s", c["graphic_cuts"], "cuts")
