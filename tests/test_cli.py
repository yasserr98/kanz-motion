import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

import codex_assets
import footage


@pytest.mark.parametrize("kind", ["missing", "failed", "exception", "ok"])
def test_assets_status(tmp_path, monkeypatch, capsys, kind):
    spec = tmp_path / "shots.json"
    spec.write_text(json.dumps({"project": "project", "context": "test", "shots": [
        {"name": "one", "modes": ["free"]}, {"name": "two", "modes": ["free"]}]}))
    monkeypatch.setattr(codex_assets, "ROOT", tmp_path)
    monkeypatch.setattr(sys, "argv", ["assets", str(spec), "--jobs", "1"])
    monkeypatch.setattr(codex_assets, "refs_for", lambda *args: [tmp_path / "missing"] if kind == "missing" else [])
    def run(shot, mode, context, out):
        if kind == "missing":
            pytest.fail("no jobs before reference preflight passes")
        if kind == "exception" and shot["name"] == "one":
            raise OSError("job crashed")
        return shot["name"], mode, "FAILED" if kind == "failed" else "ok", "session", 1
    monkeypatch.setattr(codex_assets, "run", run)
    if kind == "ok":
        codex_assets.main()
        assert "2 succeeded; 0 failed" in capsys.readouterr().out
    else:
        with pytest.raises(SystemExit) as exc:
            codex_assets.main()
        assert exc.value.code == 1
        output = capsys.readouterr().out
        assert "assets:" in output and "failed" in output


def test_assets_subprocess_failure_despite_old_image(tmp_path, monkeypatch):
    monkeypatch.setattr(codex_assets, "GEN", tmp_path / "generated")
    gen = tmp_path / "generated/abc"
    gen.mkdir(parents=True)
    (gen / "old.png").write_bytes(b"old")
    monkeypatch.setattr(codex_assets, "prompt_for", lambda *args: "mock")
    monkeypatch.setattr(codex_assets, "refs_for", lambda *args: [])
    def run(*args, **kwargs):
        kwargs["stdout"].write("session id: abc\n")
        return SimpleNamespace(returncode=1)
    monkeypatch.setattr(codex_assets.subprocess, "run", run)
    result = codex_assets.run({"name": "one"}, "free", "context", tmp_path / "out")
    assert result[2].startswith("FAILED")
    assert not (tmp_path / "out/one.png").exists()


def test_assets_configurable_kanz_root(tmp_path, monkeypatch):
    import importlib
    monkeypatch.setenv("KANZ_REPO", str(tmp_path))
    try:
        importlib.reload(codex_assets)
        assert codex_assets.KANZ == tmp_path
        assert codex_assets.ICON_SHEET.is_relative_to(tmp_path)
    finally:
        monkeypatch.delenv("KANZ_REPO")
        importlib.reload(codex_assets)


def test_footage_rejects_conflicting_options_before_changes(project, monkeypatch):
    face = project / "assets/face"
    face.mkdir(parents=True)
    old = face / "000001.jpg"
    old.write_bytes(b"keep")
    monkeypatch.setattr(sys, "argv", ["footage", str(project), "source", "transcript", "0", "5",
                                    "--video-from", "1", "--tv-until", "2"])
    monkeypatch.setattr(footage.subprocess, "run", lambda *a, **k: pytest.fail("must reject before ffmpeg"))
    with pytest.raises(SystemExit) as exc:
        footage.main()
    assert exc.value.code == 2
    assert old.read_bytes() == b"keep"


BASH = shutil.which("bash")
SCRIPT = Path(__file__).resolve().parents[1] / "engine/vps_render.sh"


@pytest.mark.parametrize("slug,name", [("x;touch injected", "v1"), ("x", "v1'"), ("../x", "v1"), ("", "v1"), ("x", "$(id)")])
def test_vps_rejects_bad_names(tmp_path, slug, name):
    assert BASH, "bash is required for the shell regression tests"
    script = tmp_path / "render.sh"
    shutil.copyfile(SCRIPT, script)
    (tmp_path / "invoke.sh").write_text('bash render.sh "$TEST_SLUG" "$TEST_NAME"\n', newline="\n")
    env = dict(os.environ, TEST_SLUG=slug, TEST_NAME=name)
    result = subprocess.run([BASH, "invoke.sh"], cwd=tmp_path, env=env, capture_output=True, text=True, encoding="utf-8")
    assert result.returncode != 0
    assert "invalid slug or version name" in result.stderr


def test_vps_quotes_all_shell_boundaries(tmp_path):
    assert BASH
    (tmp_path / "engine").mkdir()
    shutil.copyfile(SCRIPT, tmp_path / "engine/vps_render.sh")
    for d in ["runtime", "brand", "library", "node_modules/gsap", "projects/slug"]:
        (tmp_path / d).mkdir(parents=True)
    (tmp_path / "projects/slug/index.html").write_text("test")
    (tmp_path / "projects/slug/scene.js").write_text("test")
    # All commands run locally through a fake ssh. No server, browser, API or encoder.
    remote = "remote space's;$(touch INJECTED)"
    rdir = tmp_path / remote
    (rdir / ".venv/bin").mkdir(parents=True)
    (rdir / ".venv/bin/python").write_text('''#!/usr/bin/env bash
printf '%s\\n' "$@" > args.txt
mkdir -p projects/slug/out
printf 'video' > projects/slug/out/v1.mp4
printf '[]' > projects/slug/out/v1.sfx-used.json
printf 'done\\n'
''', newline="\n")
    setup = '''#!/usr/bin/env bash
set -e
mkdir -p scratch
export TMPDIR="$PWD/scratch"
ssh() { shift; bash -c "$1"; }
sleep() { command sleep 0.05; }
export -f ssh sleep
chmod +x "$KANZ_RENDER_DIR/.venv/bin/python"
bash engine/vps_render.sh slug v1 --extra "apostrophe ' ; \\$(touch INJECTED)"
'''
    (tmp_path / "test.sh").write_text(setup, newline="\n")
    env = dict(os.environ, KANZ_RENDER_HOST="mock", KANZ_RENDER_DIR=remote)
    result = subprocess.run([BASH, "test.sh"], cwd=tmp_path, env=env, capture_output=True, text=True, encoding="utf-8", timeout=45)
    assert result.returncode == 0, result.stdout + result.stderr
    assert not list(tmp_path.rglob("INJECTED"))
    assert (tmp_path / "projects/slug/out/v1.mp4").read_bytes() == b"video"
    assert "apostrophe ' ; $(touch INJECTED)" in (rdir / "args.txt").read_text()
    assert not (rdir / "projects/slug/out/v1.mp4").exists()
