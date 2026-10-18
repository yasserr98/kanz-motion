"""Sequential, half-resolution runtime goldens using render.py's file/seek protocol.

python tests/golden_stills.py --original --output tests/_golden_before.json
python tests/golden_stills.py --output tests/_golden_after.json --compare tests/_golden_before.json
Add --expected-differences tests/golden_expected.json to accept only the documented bug-fix hashes.
Screenshots stay in each project's ignored out/ directory. No parallel browsers.
Each seek gets a fresh paint (without seeking again): Chromium's retained raster tiles otherwise
introduce 1-2 channel-level differences even with identical visible computed styles.
"""
import argparse
import hashlib
import json
import random
import subprocess
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ["us-dollar-decisions-pace", "real-estate-never-loses", "gamblers-fallacy", "portfolio-rebalancing",
            "short-biggest-betting-event",
            "short-house-always-wins", "_3d-demo"]


def capture(p, slug, label, times=None, original=False, raw_raster=False, original_files=(), rev="HEAD"):
    browser = p.chromium.launch(args=["--allow-file-access-from-files"])
    try:
        page = browser.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=0.5)
        if original or original_files:
            source = {f.name: subprocess.check_output(["git", "show", f"{rev}:runtime/{f.name}"])
                      for f in (ROOT / "runtime").glob("*.js") if original or f.name in original_files}
            def route_runtime(route):
                body = source.get(route.request.url.rsplit("/", 1)[-1])
                if body is None:
                    route.continue_()
                else:
                    route.fulfill(body=body, content_type="application/javascript")
            page.route("**/runtime/*.js", route_runtime)
        errors, warnings = [], []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("requestfailed", lambda r: errors.append(f"{r.url}: {r.failure}"))
        page.on("console", lambda m: (errors if m.type == "error" else warnings).append(m.text)
                if m.type in ("error", "warning") else None)
        project = ROOT / "projects" / slug
        page.goto((project / "index.html").as_uri())
        page.wait_for_function("document.fonts && document.fonts.status === 'loaded' && window.K")
        page.wait_for_function("Array.from(document.images).every(i => i.complete && i.naturalWidth > 0)")
        duration = page.evaluate("K.duration")
        if times is None:
            times = [round(i * (duration - 0.05) / 11, 4) for i in range(12)]
        folder = project / "out" / label
        folder.mkdir(parents=True, exist_ok=True)
        orders = {"forward": times, "shuffled": random.Random(701).sample(times, len(times))}
        result = {"times": times, "duration": duration, "original": original, "fresh_paint": not raw_raster}
        if original_files:
            result["original_files"] = original_files
        for order, sequence in orders.items():
            hashes = {}
            for t in sequence:
                page.evaluate("t => K.seek(t)", t)
                if not raw_raster:
                    page.evaluate("""() => {
                        const s = document.getElementById('stage'), display = s.style.display;
                        s.style.display = 'none'; void s.offsetHeight; s.style.display = display;
                    }""")
                png = page.screenshot(clip={"x": 0, "y": 0, "width": 1080, "height": 1920})
                (folder / f"{order}-{t:.4f}.png").write_bytes(png)
                hashes[str(t)] = hashlib.sha256(png).hexdigest()
            result[order] = hashes
        result["errors"], result["warnings"] = errors, warnings
        result["shuffled_differences"] = [t for t in times if result["forward"][str(t)] != result["shuffled"][str(t)]]
        return result
    finally:
        browser.close()


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--output", required=True)
    ap.add_argument("--compare")
    ap.add_argument("--expected-differences", help="JSON of exact accepted hashes and reasons for bug-fix differences")
    ap.add_argument("--project", action="append", choices=PROJECTS)
    ap.add_argument("--original", action="store_true", help="Serve original runtime JS from git show HEAD without editing files")
    ap.add_argument("--rev", default="HEAD", help="commit whose runtime --original serves (default HEAD)")
    ap.add_argument("--raw-raster", action="store_true", help="Keep Chromium's retained raster tiles (may differ by 1-2 color levels)")
    ap.add_argument("--original-file", action="append", default=[], choices=[f.name for f in (ROOT / 'runtime').glob('*.js')],
                    help="Restore one HEAD runtime file in memory to isolate a visual change")
    args = ap.parse_args()
    before = json.loads(Path(args.compare).read_text()) if args.compare else {}
    expected = json.loads(Path(args.expected_differences).read_text()) if args.expected_differences else {}
    results = json.loads(Path(args.output).read_text()) if args.project and Path(args.output).exists() else {}
    with sync_playwright() as p:
        for slug in args.project or PROJECTS:
            r = capture(p, slug, Path(args.output).stem, before.get(slug, {}).get("times"), args.original, args.raw_raster, args.original_file, args.rev)
            if slug in before:
                r["before_differences"] = [t for t in r["times"] if r["forward"][str(t)] != before[slug]["forward"][str(t)]]
                allowed = expected.get(slug, {})
                r["unexplained_differences"] = [t for t in r["before_differences"]
                    if r["forward"][str(t)] != allowed.get(str(t), {}).get("sha256")]
                r["missing_expected_differences"] = [t for t in allowed if float(t) not in r["before_differences"]]
            results[slug] = r
            Path(args.output).write_text(json.dumps(results, indent=2) + "\n")
            print(slug, "frames:", len(r["times"]), "before differences:", r.get("before_differences"),
                  "shuffled differences:", r["shuffled_differences"], "errors:", r["errors"], flush=True)
    return int(any(results[slug]["shuffled_differences"] or results[slug]["errors"] or
                   results[slug].get("unexplained_differences") or results[slug].get("missing_expected_differences")
                   for slug in args.project or PROJECTS))


if __name__ == "__main__":
    raise SystemExit(main())
