"""Generate a video's images and icons with Codex (Ahmed 2026-10-16: "if the video needs images or icons, it doesn't
hesitate to grab the context of the whole thing and talk to Codex to generate this stuff").

    python engine/codex_assets.py <shots.json> [--jobs 4] [--only name1,name2]

shots.json:
{
  "project": "projects/short-house-always-wins",       # outputs go to <project>/assets/codex/<mode>/<name>.png
  "context": "what the video is about, in two or three sentences (the whole script's idea, not one line)",
  "shots": [
    {"name": "casino-exterior", "line": "the voice line it illustrates", "subject": "what to draw, concretely",
     "accent": "the one detail that carries lavender", "modes": ["kanz", "free"], "ref": "kanz-bank-v01.png"},
    {"name": "messi-final", "mode": "edit", "source": "path/to/real-photo.jpg", "accent": "...", "ratio": "4:5 portrait"}
  ]
}

Modes
  kanz  ICONS: the fixed Kanz icon style (the MD rules), transparent cutout, attached approved references
  free  PHOTOS: a full-screen 9:16 photo of a generic place or setting, no Kanz style rules (Ahmed 2026-10-16:
        "the MD files were meant for icons rather than photos ... free photos are great"). Which type a shot gets:
        AGENTS.md, "Images and icons: always ask Codex", step 2
  edit  a REAL supplied photo given the Kanz editorial treatment (Kanz brand/image-treatment/CREATE-A-BRANDED-IMAGE.md).
        Real people are never generated. The image tool also refuses to EDIT public figures (Messi, 2026-10-16):
        for them use K.photo's CSS grade or K.snap35 on the untouched licensed photo instead.

Each run writes <name>.png, <name>.prompt.txt and <name>.log beside it, and appends a row to
<project>/assets/codex/PROVENANCE.md (prompt file, references, Codex session id, seconds). Outputs are candidates:
compare them with the references before use; library promotion still needs Ahmed's approval.
"""
import argparse
import concurrent.futures as cf
import json
import os
import re
import shutil
import subprocess
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KANZ = ROOT.parent  # the Kanz repo holds the approved references
REFS = KANZ / "reports" / "kanz-motion-system-2026-09-20" / "chatgpt-handoff-ar-v01" / "references"
ICON_SHEET = REFS / "approved-editorial-batch-01.png"
NPC_SHEET = REFS / "approved-npc-characters-v04.png"
GEN = Path.home() / ".codex" / "generated_images"

ICON_STYLE = (
    "Treatment identical to the references: photographic grayscale editorial cutout with real material texture and the same "
    "fine tactile grain, same lighting from upper left; restrained lavender #D5ADEF only on the detail named; neutral grayscale "
    "everything else. The Kanz icon style is fixed for every topic: match line weight, shapes, perspective, dimensionality, "
    "shading, texture and palette treatment exactly; no topic-specific style, no glossy colours, no cartoon.\n"
    "Output: one centered subject on a SQUARE canvas (1254x1254 if available, else highest native square), comfortable "
    "transparent margins. TRUE RGBA PNG TRANSPARENCY everywhere outside the subject. No background, no floor, no drop shadow, "
    "no fake checkerboard, no text, letters, numbers, logos or watermark.\nReturn only the image.")
PEOPLE = ("Any person is anonymous with a smooth featureless face (no eyes, nose or mouth), exactly like the people reference "
          "sheet; never a real, identifiable person.\n")
EDIT = (
    "Edit image 1; image 2 is a finish/color reference only.\n\n"
    "Preserve the people and scene in image 1 exactly as depicted: facial identity, age, expression, gaze, hair, pose, hands, "
    "clothing shapes and camera perspective. Keep the original scene and the subject's real relationship to it. Do not add or "
    "remove people, invent an event, or copy objects from image 2.\n\n"
    "Apply Kanz's restrained editorial treatment: neutral grayscale subject with clear facial/structural detail; darker, quieter "
    "grayscale surroundings; fine subtle tactile grain. Keep skin grayscale. Add a controlled #D5ADEF lavender accent only to "
    "{accent}, following its actual shape, light and material. Use #08070B / #11081A in dark supporting areas, with no blanket "
    "purple wash, neon outline or heavy glow.\n\n"
    "Output {ratio}. Keep this recognizably the same photograph with a coherent editorial finish. No new illustration style, "
    "anonymous face, replacement wardrobe, added props, text, numbers, logo or watermark. Return only the image. If preserving "
    "the source conflicts with the requested crop/effect, preserve the source rather than inventing missing content.")


def prompt_for(shot, mode, context):
    if mode == "kanz":
        people = shot.get("people")
        head = ("Attachments: image 1 = the APPROVED Kanz editorial icon sheet (style authority). Image 2 = an approved Kanz "
                "library object (finish, material, perspective, scale and framing authority)."
                + (" Image 3 = the APPROVED Kanz anonymous-people reference sheet (people authority)." if people else "")
                + "\n\n")
        return (head + f"Create ONE Kanz explainer icon for a video about: {context}\n"
                f"It illustrates the line: {shot['line']}\nSubject: {shot['subject']}\n"
                + (PEOPLE if people else "") + f"Lavender accent: {shot['accent']} only.\n" + ICON_STYLE)
    if mode == "free":
        return (f"Create one image for a vertical short video (9:16, 1080x1920). The video is about: {context}\n"
                f"This image appears while the narrator says: {shot['line']}\nShow: {shot['subject']}\n"
                + shot.get("free_style", "") + "\nNo real, identifiable people. No text, letters, numbers, logos or watermark.\n"
                "No woman wearing a hijab or headscarf (never in gambling scenes, Ahmed 2026-10-16).\n"
                "Return only the image.")
    if mode == "edit":
        return EDIT.format(accent=shot["accent"], ratio=shot.get("ratio", "4:5 portrait"))
    raise ValueError(mode)


def refs_for(shot, mode):
    if mode == "kanz":
        r = [ICON_SHEET, ROOT / "library" / "objects" / shot.get("ref", "kanz-bank-v01.png")]
        if shot.get("people"):
            r.append(NPC_SHEET)
        return r
    if mode == "edit":
        return [Path(shot["source"]), ICON_SHEET]
    return []


def run(shot, mode, context, out):
    out.mkdir(parents=True, exist_ok=True)
    name = shot["name"]
    p = out / f"{name}.prompt.txt"
    p.write_text(prompt_for(shot, mode, context), encoding="utf-8")
    refs = refs_for(shot, mode)
    for r in refs:
        if not Path(r).exists():
            return name, mode, f"missing reference {r}", None, 0
    args = ["codex", "exec", "--skip-git-repo-check", "-s", "read-only"]
    for r in refs:
        args += ["-i", str(r)]
    args.append("-")
    t0 = time.time()
    with open(p, encoding="utf-8") as fin, open(out / f"{name}.log", "w", encoding="utf-8") as flog:
        subprocess.run(args, stdin=fin, stdout=flog, stderr=subprocess.STDOUT, shell=os.name == "nt")
    log = (out / f"{name}.log").read_text(encoding="utf-8", errors="replace")
    m = re.search(r"session id: ([0-9a-f-]+)", log)
    sid = m.group(1) if m else None
    imgs = sorted((GEN / sid).glob("*.png"), key=lambda f: f.stat().st_mtime) if sid and (GEN / sid).exists() else []
    secs = round(time.time() - t0)
    if not imgs:
        return name, mode, "FAILED (no image; see log)", sid, secs
    shutil.copy2(imgs[-1], out / f"{name}.png")
    return name, mode, "ok", sid, secs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("shots")
    ap.add_argument("--jobs", type=int, default=4)
    ap.add_argument("--only")
    a = ap.parse_args()
    spec = json.loads(Path(a.shots).read_text(encoding="utf-8"))
    proj = ROOT / spec["project"]
    only = set(a.only.split(",")) if a.only else None
    tasks = []
    for s in spec["shots"]:
        if only and s["name"] not in only:
            continue
        for mode in s.get("modes", [s.get("mode", "kanz")]):
            tasks.append((s, mode, proj / "assets" / "codex" / mode))
    prov = proj / "assets" / "codex" / "PROVENANCE.md"
    prov.parent.mkdir(parents=True, exist_ok=True)
    if not prov.exists():
        prov.write_text("# Codex assets (candidates until Ahmed approves)\n\n| Date | Mode | Name | Status | Codex session | Seconds | "
                        "Prompt |\n| --- | --- | --- | --- | --- | --- | --- |\n", encoding="utf-8")
    with cf.ThreadPoolExecutor(a.jobs) as ex:
        futs = [ex.submit(run, s, m, spec["context"], o) for s, m, o in tasks]
        for f in cf.as_completed(futs):
            name, mode, status, sid, secs = f.result()
            print(f"{mode:5} {name:28} {status} {sid or ''} {secs}s", flush=True)
            with open(prov, "a", encoding="utf-8") as fp:
                fp.write(f"| {time.strftime('%Y-%m-%d')} | {mode} | `{name}.png` | {status} | `{sid}` | {secs} | "
                         f"`{mode}/{name}.prompt.txt` |\n")


if __name__ == "__main__":
    main()
