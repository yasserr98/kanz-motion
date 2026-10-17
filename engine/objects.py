"""Which library objects a scene uses, and their approval status (library/objects/manifest.json, 2026-10-17).

    python engine/objects.py projects/<slug>     # list candidate / rejected / unlisted objects the scene uses

make.py check and make.py ship print the same warnings. Approving an object = setting its status to "approved" in the
manifest (Ahmed's decision; never change a status on your own).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "library" / "objects" / "manifest.json"
NAME = re.compile(r"kanz-[a-z0-9-]+-v\d+\.png")


def statuses(manifest=MANIFEST):
    return {o["file"]: o for o in json.loads(Path(manifest).read_text(encoding="utf-8"))["objects"]}


def used(proj):
    """Object file names referenced by the project's own scripts and page."""
    names = set()
    for f in list(Path(proj).glob("*.js")) + list(Path(proj).glob("*.html")):
        names.update(NAME.findall(f.read_text(encoding="utf-8", errors="replace")))
    return sorted(names)


def findings(proj, manifest=MANIFEST):
    """One line per object that is not approved: candidate, rejected or missing from the manifest."""
    known, out = statuses(manifest), []
    for name in used(proj):
        o = known.get(name)
        if o is None:
            if (ROOT / "library" / "objects" / name).exists():
                out.append(f"{name}: not in library/objects/manifest.json (add it with its status)")
        elif o["status"] != "approved":
            out.append(f"{name}: {o['status']} ({o.get('note') or o.get('provenance', '')}); needs Ahmed's approval")
    return out


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    found = findings(sys.argv[1])
    for line in found:
        print("objects:", line)
    print(f"objects: {len(used(sys.argv[1]))} used, {len(found)} not approved")


if __name__ == "__main__":
    from console import utf8
    utf8()
    main()
