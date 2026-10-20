"""One local Chromium job at a time on this machine (Ahmed 2026-10-19: "Local, one at a time").

Five parallel renders and lints ran a 16 GB PC out of memory and crashed Claude. Every engine script that launches
Chromium calls `hold()` first: it waits on a per-user OS file lock shared by every clone and worktree (REPO-6), so
a crashed job frees the slot by itself. KANZ_SLOT_LOCK overrides the path for tests. Child processes skip waiting
only when KANZ_LOCAL_SLOT names the live ancestor holding that lock.
"""
import os
import sys
import time
from pathlib import Path

_cache = Path(os.environ.get("LOCALAPPDATA", Path.home() / "AppData/Local")) if os.name == "nt" else Path.home() / ".cache"
LOCK = Path(os.environ.get("KANZ_SLOT_LOCK", _cache / "kanz-motion/local-render.lock"))
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


def _parents():
    """Snapshot of live pid -> parent pid, without an extra Python dependency."""
    if os.name == "nt":
        import ctypes as c
        from ctypes import wintypes as w
        class Entry(c.Structure):
            _fields_ = [("size", w.DWORD), ("usage", w.DWORD), ("pid", w.DWORD), ("heap", c.c_size_t),
                        ("module", w.DWORD), ("threads", w.DWORD), ("parent", w.DWORD),
                        ("priority", w.LONG), ("flags", w.DWORD), ("exe", w.WCHAR * 260)]
        api = c.WinDLL("kernel32", use_last_error=True)
        api.CreateToolhelp32Snapshot.argtypes = [w.DWORD, w.DWORD]
        api.CreateToolhelp32Snapshot.restype = w.HANDLE
        api.CloseHandle.argtypes = [w.HANDLE]
        for name in ("Process32FirstW", "Process32NextW"):
            getattr(api, name).argtypes = [w.HANDLE, c.POINTER(Entry)]
            getattr(api, name).restype = w.BOOL
        snapshot = api.CreateToolhelp32Snapshot(2, 0)
        if snapshot == w.HANDLE(-1).value:
            return {}
        try:
            entry, parents = Entry(), {}
            entry.size = c.sizeof(entry)
            ok = api.Process32FirstW(snapshot, c.byref(entry))
            while ok:
                parents[entry.pid] = entry.parent
                ok = api.Process32NextW(snapshot, c.byref(entry))
            return parents
        finally:
            api.CloseHandle(snapshot)
    import subprocess
    try:
        result = subprocess.run(["ps", "-A", "-o", "pid=,ppid="], capture_output=True, text=True, check=True, timeout=5)
        return dict(tuple(map(int, line.split())) for line in result.stdout.splitlines() if line.strip())
    except (OSError, ValueError, subprocess.SubprocessError):
        return {}


def _inherited_holder(f):
    try:
        holder = int(os.environ.get("KANZ_LOCAL_SLOT", ""))
        f.seek(1)  # byte zero is locked on Windows; the owner record starts after it
        if holder <= 0 or int(f.read().strip()) != holder:
            return False
    except (ValueError, OSError):
        return False
    parents, seen = _parents(), set()
    pid = os.getpid()
    while pid in parents and pid not in seen:
        seen.add(pid)
        pid = parents[pid]
        if pid == holder and pid in parents:
            return True
    return False


def hold(what="local render job", poll=10):
    """Block until this process owns the local slot; it stays owned until the process exits."""
    global _held
    if _held is not None:
        return
    LOCK.parent.mkdir(parents=True, exist_ok=True)
    f = open(LOCK, "a+", encoding="utf-8")
    if not _try_lock(f):
        if _inherited_holder(f):
            f.close()
            return
        print(f"{what}: waiting for the local render slot (another lint/render is running on this machine)...",
              file=sys.stderr, flush=True)
        while not _try_lock(f):
            time.sleep(poll)
    f.seek(0)
    f.truncate()
    f.write(f" {os.getpid()}\n")
    f.flush()
    _held = f
    os.environ["KANZ_LOCAL_SLOT"] = str(os.getpid())
