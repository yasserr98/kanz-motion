import subprocess
import sys
import time
from pathlib import Path

ENGINE = Path(__file__).resolve().parent.parent / "engine"
CHILD = ("import sys,time; sys.path.insert(0, sys.argv[1]); import slot; slot.LOCK=__import__('pathlib').Path(sys.argv[2]); t=time.time(); "
         "slot.hold('test', poll=0.2); print(round(time.time()-t, 1))")


def test_second_job_waits_for_the_local_slot():
    import slot
    slot.hold("test")
    try:
        env = {k: v for k, v in __import__("os").environ.items() if k != "KANZ_LOCAL_SLOT"}
        p = subprocess.Popen([sys.executable, "-c", CHILD, str(ENGINE), str(slot.LOCK)], stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE, text=True, env=env)
        time.sleep(1.5)
        assert p.poll() is None  # still waiting while we hold the slot
    finally:
        slot._held.close()
    out, err = p.communicate(timeout=20)
    assert "waiting for the local render slot" in err
    assert float(out) >= 1.0


def test_children_of_a_holder_do_not_wait(monkeypatch):
    import slot
    monkeypatch.setenv("KANZ_LOCAL_SLOT", "123")
    slot.hold("test")  # returns at once, takes nothing
    assert slot._held is None
