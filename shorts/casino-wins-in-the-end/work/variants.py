"""Render the same moments of a short in each image variant and stack them into one sheet:
    python variants.py <project-slug> <letter> t1,t2,... [v1,kanz,free]
-> work/variant-<letter>.jpg (rows = variants, columns = moments). Restores variant.js to its previous value."""
import subprocess
import sys
from pathlib import Path

W = Path(__file__).resolve().parent
KM = W.parents[2]
slug, letter, times = sys.argv[1], sys.argv[2], sys.argv[3]
variants = (sys.argv[4] if len(sys.argv) > 4 else "v1,kanz,free").split(",")
proj = KM / "projects" / slug
vj = proj / "variant.js"
orig = vj.read_text(encoding="utf-8")
rows = []
try:
    for v in variants:
        vj.write_text(orig.replace('window.VARIANT = "v1"', f'window.VARIANT = "{v}"'), encoding="utf-8")
        subprocess.run([sys.executable, "engine/render.py", str(proj), "--stills", times, "--name", f"var-{v}"],
                       cwd=KM, check=True, capture_output=True)
        d = proj / "out" / f"stills-var-{v}"
        shots = [d / f"t{float(t):06.2f}.png" for t in times.split(",")]
        ins = sum((["-i", str(s)] for s in shots), [])
        n = len(shots)
        fc = "".join(f"[{i}]scale=270:480[a{i}];" for i in range(n)) + "".join(f"[a{i}]" for i in range(n)) + f"hstack={n},"
        fc += f"pad=iw+150:ih:150:0:color=0x16151a,drawtext=fontfile='C\:/Windows/Fonts/arialbd.ttf':text='{v}':x=24:y=24:fontsize=40:fontcolor=white"
        row = W / f"_row-{letter}-{v}.png"
        subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", fc, str(row)], check=True)
        rows.append(row)
finally:
    vj.write_text(orig, encoding="utf-8")
ins = sum((["-i", str(r)] for r in rows), [])
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", f"vstack={len(rows)}", "-q:v", "3",
                str(W / f"variant-{letter}.jpg")], check=True)
for r in rows:
    r.unlink()
print(W / f"variant-{letter}.jpg")
