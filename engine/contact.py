"""Tile review stills into one contact sheet: python engine/contact.py <folder> <out.jpg> [width]"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

src, out = Path(sys.argv[1]), Path(sys.argv[2])
w = int(sys.argv[3]) if len(sys.argv) > 3 else 360
files = sorted(src.glob("*.png"))
h = int(w * 1920 / 1080)
cols = min(6, len(files))
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * (h + 30)), "white")
d = ImageDraw.Draw(sheet)
font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 20)
for i, f in enumerate(files):
    x, y = (i % cols) * w, (i // cols) * (h + 30)
    sheet.paste(Image.open(f).convert("RGB").resize((w, h)), (x, y))
    d.text((x + 6, y + h + 4), f.stem, fill="black", font=font)
sheet.save(out, quality=88)
print(out)
