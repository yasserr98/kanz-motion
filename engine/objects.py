"""Which library objects a scene uses, and their approval status (library/objects/manifest.json, 2026-10-17).

    python engine/objects.py projects/<slug>     # list candidate / rejected / unlisted objects the scene uses

make.py check warns; make.py ship stops on any unapproved library object (OBJ-2). Project-local assets are exempt.
Approving an object = setting its status to "approved" in the manifest (Ahmed's decision; never change it on your own).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "library" / "objects" / "manifest.json"
NAME = re.compile(r"kanz-[a-z0-9-]+-v\d+\.png")
STRING = r"""(['"`])([^'"`\r\n]*)\1"""


def statuses(manifest=MANIFEST):
    return {o["file"]: o for o in json.loads(Path(manifest).read_text(encoding="utf-8"))["objects"]}


def used(proj):
    """Library object file names in scripts and pages; local assets are not library objects."""
    names = set()
    for f in list(Path(proj).glob("*.js")) + list(Path(proj).glob("*.html")):
        src = f.read_text(encoding="utf-8", errors="replace")
        # Resolve the scene's usual OBJ / ART directory constants before classifying paths.
        prefixes = {key: value for key, _, value in re.findall(r"""\b(\w+)\s*=\s*(['"`])([^'"`\r\n]*)\2""", src)
                    if value.endswith("/")}
        for key, value in prefixes.items():
            src = re.sub(r"\b" + re.escape(key) + r"\s*\+\s*" + STRING,
                         lambda m: m[1] + value + m[2] + m[1], src)
        src = re.sub(r"""(['"`])([^'"`\r\n]*/)\1\s*\+\s*(['"`])([^'"`\r\n]*)\3""",
                     lambda m: m[1] + m[2] + m[4] + m[1], src)
        for _, value in re.findall(STRING, src):
            path = value.split("?", 1)[0].split("#", 1)[0]
            if "library/objects/" in path and not path.endswith("/"):
                names.add(path.rsplit("/", 1)[-1])
            elif NAME.fullmatch(path):
                names.add(path)
    return sorted(names)


def findings(proj, manifest=MANIFEST):
    """One line per object that is not approved: candidate, rejected or missing from the manifest."""
    known, out = statuses(manifest), []
    for name in used(proj):
        o = known.get(name)
        if o is None:
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
