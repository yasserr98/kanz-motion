"""Infrastructure checks without a browser, encoder or network."""
import json
import shutil
import subprocess
import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

import doctor
import make

ROOT = Path(__file__).resolve().parents[1]


@pytest.mark.parametrize("shorts,installed", [(False, False), (True, False), (True, True)])
def test_doctor_shorts_dependencies(monkeypatch, shorts, installed):
    monkeypatch.setattr(doctor.importlib.util, "find_spec", lambda name: object() if installed else None)
    monkeypatch.setattr(doctor, "version", lambda *args: None)
    # Read all module checks, stopping before the Playwright probe.
    rows = []
    for row in doctor.checks(shorts=shorts):
        rows.append(row)
        if row[1] == "ffmpeg":
            break
    optional = [r for r in rows if r[1] in ("python module cv2", "python module yt_dlp")]
    assert len(optional) == (2 if shorts else 0)
    for level, _, detail in optional:
        assert level == ("OK" if installed else "FAIL")
        if not installed:
            assert "requirements-shorts.txt" in detail


def test_doctor_cli_accepts_shorts(monkeypatch):
    seen = []
    monkeypatch.setattr(sys, "argv", ["make.py", "doctor", "--shorts"])
    monkeypatch.setattr(doctor, "main", lambda proj=None, shorts=False: seen.append((proj, shorts)) or 0)
    with pytest.raises(SystemExit) as exc:
        make.main()
    assert exc.value.code == 0
    assert seen == [(None, True)]


@pytest.mark.parametrize("bash", [None, "bash"])
def test_doctor_explains_host_failure(monkeypatch, bash):
    monkeypatch.setattr(make, "render_host", lambda: "host")
    monkeypatch.setattr(doctor.importlib.util, "find_spec", lambda name: None)
    monkeypatch.setattr(doctor, "version", lambda *a: None)
    monkeypatch.setattr(doctor.shutil, "which", lambda name: bash if name == "bash" else "ssh")
    monkeypatch.setattr(doctor.subprocess, "run", lambda *a, **k: SimpleNamespace(returncode=1))
    detail = next(detail for _, what, detail in doctor.checks() if what == "render host")
    assert "fall back to --local" not in detail
    assert "--host" in detail and "locally" in detail


def test_host_render_failure_does_not_fall_back(project, monkeypatch):
    monkeypatch.setattr(make, "render_host", lambda: "host")
    monkeypatch.setattr(make.shutil, "which", lambda name: "bash")
    calls = []
    def run(cmd):
        calls.append(cmd)
        raise subprocess.CalledProcessError(1, cmd)
    monkeypatch.setattr(make, "run", run)
    with pytest.raises(subprocess.CalledProcessError):
        make.render(project, "v1", host=True)
    assert len(calls) == 1 and "vps_render.sh" in str(calls[0])


def test_missing_bash_keeps_local_fallback(project, monkeypatch, capsys):
    monkeypatch.setattr(make, "render_host", lambda: "host")
    monkeypatch.setattr(make.shutil, "which", lambda name: None)
    calls = []
    monkeypatch.setattr(make, "run", lambda cmd: calls.append(cmd))
    make.render(project, "v1")
    assert calls == [[make.PY, "engine/render.py", project, "--name", "v1"]]
    assert not capsys.readouterr().err


def test_fire_schedules_one_cue_with_explicit_legacy_pair():
    node = shutil.which("node")
    assert node, "Node.js is required for the browser-free runtime helper test"
    script = r"""
const fs = require("fs"), vm = require("vm");
const noop = () => {};
global.window = {};
global.document = { getElementById: () => null, querySelectorAll: () => [] };
global.gsap = { timeline: () => ({set: noop, to: noop, fromTo: noop}), set: noop };
vm.runInThisContext(fs.readFileSync(process.argv[1], "utf8"));
const K = window.K;
K.el = () => ({});
const results = [{}, {legacyPair: true}, {sfx: false}, {sfx: false, legacyPair: true}].map(o => {
  K.cues = [];
  K.fire(null, 0, 0, 100, {at: 2, out: 3, n: 1, embers: 0, ...o});
  return K.cues;
});
console.log(JSON.stringify(results));
"""
    result = subprocess.run([node, "-e", script, str(ROOT / "runtime/kanz.js")],
                            capture_output=True, text=True, check=True, timeout=15)
    single, pair, silent, silent_pair = json.loads(result.stdout)
    assert [(c["t"], c["cat"]) for c in single] == [(2, "fire")]
    assert [(c["t"], c["cat"]) for c in pair] == [(2, "fire"), (2, "whoosh")]
    assert silent == silent_pair == []
