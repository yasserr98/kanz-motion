"""One local Chromium job at a time on this machine (Ahmed 2026-10-19: "Local, one at a time").

Five parallel renders and lints ran a 16 GB PC out of memory and crashed Claude. Every engine script that launches
Chromium calls `hold()` first: it waits on an OS file lock in the repo root and keeps it until the process exits, so
a crashed job frees the slot by itself. Child processes of a holder inherit KANZ_LOCAL_SLOT and do not wait again.
"""
import os
import sys
import time
from pathlib import Path

LOCK = Path(__file__).resolve().parent.parent / ".local-render.lock"
_held = None


def _try_lock(f):
    try:
        if os.name == "nt":
            import msvcrt
            f.seek(0)
            msvcrt.locking(f.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            import fcntl
            fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB)
        return True
    except OSError:
        return False


def hold(what="local render job", poll=10):
    """Block until this process owns the local slot; it stays owned until the process exits."""
    global _held
    if _held is not None or os.environ.get("KANZ_LOCAL_SLOT"):
        return
    f = open(LOCK, "a+")
    if not _try_lock(f):
        print(f"{what}: waiting for the local render slot (another lint/render is running on this machine)...",
              file=sys.stderr, flush=True)
        while not _try_lock(f):
            time.sleep(poll)
    _held = f
    os.environ["KANZ_LOCAL_SLOT"] = str(os.getpid())
