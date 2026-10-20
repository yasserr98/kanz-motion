import os
import queue
import shutil
import subprocess
import sys
import threading
import time
from pathlib import Path

import pytest

ENGINE = Path(__file__).resolve().parent.parent / "engine"
CHILD = ("import sys,time; sys.path.insert(0, sys.argv[1]); import slot; slot.LOCK=__import__('pathlib').Path(sys.argv[2]); t=time.time(); "
         "slot.hold('test', poll=0.2); print(round(time.time()-t, 1))")


def line(stream):
    result = queue.Queue()
    threading.Thread(target=lambda: result.put(stream.readline()), daemon=True).start()
    return result.get(timeout=15).strip()


@pytest.mark.parametrize("marker", [None, "bogus", "999999999"])
def test_second_job_waits_for_the_local_slot(marker):
    import slot
    slot.hold("test")
    try:
        env = {k: v for k, v in os.environ.items() if k != "KANZ_LOCAL_SLOT"}
        if marker:
            env["KANZ_LOCAL_SLOT"] = marker
        p = subprocess.Popen([sys.executable, "-c", CHILD, str(ENGINE), str(slot.LOCK)], stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE, text=True, env=env)
        assert "waiting for the local render slot" in line(p.stderr)
        time.sleep(0.2)
        assert p.poll() is None  # still waiting while we hold the slot
    finally:
        slot._held.close()
    out, err = p.communicate(timeout=20)
    assert p.returncode == 0, err
    assert float(out) >= 0.2


@pytest.mark.parametrize("grandchild", [False, True])
def test_children_of_a_holder_do_not_wait(grandchild):
    import slot
    slot.hold("test")
    code = CHILD + "; print(slot._held is None)"
    if grandchild:
        code = ("import subprocess,sys; subprocess.run([sys.executable, '-c', "
                + repr(code) + "] + sys.argv[1:], check=True)")
    try:
        result = subprocess.run([sys.executable, "-c", code, str(ENGINE), str(slot.LOCK)],
                                capture_output=True, text=True, timeout=10)
        assert result.returncode == 0, result.stderr
        assert result.stdout.splitlines()[-1] == "True"
    finally:
        slot._held.close()


@pytest.mark.parametrize("marker", ["bogus", "123", "self"])
def test_bogus_slot_marker_does_not_bypass(monkeypatch, marker):
    import slot
    monkeypatch.setenv("KANZ_LOCAL_SLOT", str(os.getpid()) if marker == "self" else marker)
    slot.hold("test")
    try:
        assert slot._held is not None
    finally:
        if slot._held:
            slot._held.close()


def test_cross_checkout_contention(tmp_path):
    repos = [tmp_path / name for name in ("clone", "worktree")]
    for repo in repos:
        (repo / "engine").mkdir(parents=True)
        shutil.copyfile(ENGINE / "slot.py", repo / "engine/slot.py")
    lock = tmp_path / "shared/local-render.lock"
    env = dict(os.environ, KANZ_SLOT_LOCK=str(lock))
    env.pop("KANZ_LOCAL_SLOT", None)
    code = ("import sys; sys.path.insert(0, 'engine'); import slot; slot.hold('test', poll=0.1); "
            "print(slot.LOCK, flush=True); sys.stdin.read()")
    first = subprocess.Popen([sys.executable, "-c", code], cwd=repos[0], env=env,
                             stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    second = None
    try:
        assert line(first.stdout) == str(lock)
        # A sibling cannot borrow the holder's pid: it must be a live ancestor.
        second = subprocess.Popen([sys.executable, "-c", code], cwd=repos[1],
                                  env=dict(env, KANZ_LOCAL_SLOT=str(first.pid)),
                                  stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        assert "waiting for the local render slot" in line(second.stderr)
        assert second.poll() is None
        first.kill()  # a crashed holder releases the OS lock
        first.communicate(timeout=10)
        out, err = second.communicate(timeout=10)
        assert str(lock) in out
        assert second.returncode == 0, err
    finally:
        for p in (first, second):
            if p is not None and p.poll() is None:
                p.kill()
                p.communicate(timeout=10)


def test_slot_default_is_per_user(tmp_path):
    code = "import sys; sys.path.insert(0, sys.argv[1]); import slot; print(slot.LOCK)"
    env = dict(os.environ, LOCALAPPDATA=str(tmp_path))
    env.pop("KANZ_SLOT_LOCK", None)
    result = subprocess.run([sys.executable, "-c", code, str(ENGINE)],
                            env=env, capture_output=True, text=True, check=True)
    base = tmp_path if os.name == "nt" else Path.home() / ".cache"
    assert Path(result.stdout.strip()) == base / "kanz-motion/local-render.lock"
