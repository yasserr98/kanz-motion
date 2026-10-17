import io
import json
import sys
from types import SimpleNamespace

import numpy as np
import pytest

import console
import edit_audio
import sfx_gen
import sfx_library
import transcribe
import voicecheck


@pytest.mark.parametrize("written,heard,equal", [
    ("100", "200", False), ("١٠٠", "100", True), ("100", "مية", True),
    ("200", "ميتين", True), ("١٠٠", "مائة", True), ("100", "", False),
    ("120", "مية وعشرين", True), ("3000", "تلاتة آلاف", True),
    ("100 جنيه", "مية دولار", False), ("100", "حاجة", False),
])
def test_number_values(written, heard, equal):
    assert (voicecheck.number_tokens(written) == voicecheck.number_tokens(heard)) == equal


def run_voicecheck(project, monkeypatch, wrote, heard):
    (project / "script.md").write_text(f"<!-- captions:start -->\n{wrote}\n<!-- captions:end -->", encoding="utf-8")
    words = [{"w": w, "start": i * .2, "end": (i + 1) * .2} for i, w in enumerate(heard.split())]
    (project / "out/voicecheck-asr.json").write_text(json.dumps({"segments": [{"words": words}]}))
    calls = []
    monkeypatch.setattr(voicecheck.subprocess, "run", lambda *a, **kw: calls.append(kw))
    monkeypatch.setattr(voicecheck, "apply_say", lambda text, proj: text)
    voicecheck.post(project)
    assert calls[0]["encoding"] == "utf-8"
    return json.loads((project / "out/voicecheck.json").read_text(encoding="utf-8"))


@pytest.mark.parametrize("wrote,heard,findings", [
    ("100 جنيه", "200 جنيه", 1), ("100 جنيه", "جنيه", 1),
    ("١٠٠ جنيه", "مية جنيه", 0), ("100 جنيه", "مائة جنيه", 1),
    ("100 بيت", "مية عربية", 1),
])
def test_voicecheck_reports_numbers(project, monkeypatch, wrote, heard, findings):
    result = run_voicecheck(project, monkeypatch, wrote, heard)
    assert len(result) == findings
    if "مائة" in heard:
        assert "Standard Arabic" in result[0]["msg"]


def test_empty_asr_keeps_report(project, monkeypatch):
    output = project / "out/voicecheck.json"
    output.write_text("old report")
    with pytest.raises(SystemExit, match="no words"):
        run_voicecheck(project, monkeypatch, "100", "")
    assert output.read_text() == "old report"


def test_console_handles_cp1252_and_capture(monkeypatch):
    out, err = io.BytesIO(), io.BytesIO()
    stdout = io.TextIOWrapper(out, encoding="cp1252", newline="\n")
    stderr = io.TextIOWrapper(err, encoding="cp1252", newline="\n")
    monkeypatch.setattr(sys, "stdout", stdout)
    monkeypatch.setattr(sys, "stderr", stderr)
    console.utf8()
    print("عربي", flush=True)
    print("عربي", file=sys.stderr, flush=True)
    assert out.getvalue() == "عربي\n".encode()
    assert err.getvalue() == out.getvalue()
    monkeypatch.setattr(sys, "stdout", io.StringIO())
    console.utf8()


def test_transcribe_empty_keeps_output(tmp_path, monkeypatch):
    output = tmp_path / "transcript.json"
    output.write_text("original")
    monkeypatch.setattr(sys, "argv", ["transcribe", "mock.wav", str(output), "--engine", "elevenlabs"])
    monkeypatch.setattr(transcribe, "scribe", lambda *args: ([], [], 0, {}))
    with pytest.raises(SystemExit, match="no words"):
        transcribe.main()
    assert output.read_text() == "original"


def edit_fixture(project, monkeypatch, keeps, n=48000, snap=None):
    (project / "audio/edl.json").write_text(json.dumps({"source": "mock", "keep": keeps}))
    monkeypatch.setattr(edit_audio, "decode", lambda p: np.ones(n, np.float32) * .1)
    if snap is not None:
        monkeypatch.setattr(edit_audio, "snap", lambda *args: snap)
    lengths = []
    def run(cmd, **kwargs):
        if cmd[0] == "ffprobe":
            return SimpleNamespace(stdout="1")
        if "input" in kwargs:
            lengths.append(len(kwargs["input"]) // 2)
        from pathlib import Path
        Path(cmd[-1]).write_bytes(b"mock output")
        return SimpleNamespace(returncode=0)
    monkeypatch.setattr(edit_audio.subprocess, "run", run)
    return lengths


def test_collapsed_snap_falls_back(project, monkeypatch):
    lengths = edit_fixture(project, monkeypatch, [[.7, .8]], snap=.75)
    edit_audio.main(project)
    assert lengths == [4800]
    assert json.loads((project / "audio/voice-edit.json").read_text())["kept"] == [[.7, .8]]


@pytest.mark.parametrize("n", [1, 4, 100, 600])
def test_short_fades(project, monkeypatch, n):
    lengths = edit_fixture(project, monkeypatch, [[0, n / 48000]], n=n)
    edit_audio.main(project)
    assert lengths == [n]


def test_zero_keep_preserves_voice(project, monkeypatch, capsys):
    edit_fixture(project, monkeypatch, [[.5, .5]], snap=.5)
    with pytest.raises(SystemExit, match="no nonempty"):
        edit_audio.main(project)
    assert (project / "audio/voice.wav").read_bytes() == b"voice one"
    assert "dropping empty" in capsys.readouterr().out


@pytest.mark.parametrize("missing_kind", ["raw", "kenney", "generated"])
def test_sfx_preflight_preserves_library(tmp_path, monkeypatch, missing_kind):
    monkeypatch.setattr(sfx_library, "RAW", tmp_path / "raw")
    monkeypatch.setattr(sfx_library, "OUT", tmp_path)
    monkeypatch.setattr(sfx_library, "SOURCES", [("cat", "name", "missing", "url", 1, 1)] if missing_kind == "raw" else [])
    monkeypatch.setattr(sfx_library, "KENNEY", [("cat", "name", "folder", ["missing"])] if missing_kind == "kenney" else [])
    if missing_kind == "generated":
        (tmp_path / "generated.json").write_text('[{"file":"missing"}]')
    (tmp_path / "manifest.json").write_text("keep")
    monkeypatch.setattr(sfx_library, "write", lambda *args: pytest.fail("preflight must run first"))
    with pytest.raises(SystemExit, match="missing SFX sources"):
        sfx_library.main()
    assert (tmp_path / "manifest.json").read_text() == "keep"


@pytest.mark.parametrize("category,manifest,generated", [
    ("coin", [], []), ("custom", [{"category": "custom", "file": "one"}], []),
    ("custom", [], [{"category": "custom", "file": "one"}]),
])
def test_sfx_gen_refuses_existing_categories(tmp_path, monkeypatch, category, manifest, generated):
    monkeypatch.setattr(sfx_gen, "OUT", tmp_path)
    monkeypatch.setattr(sfx_gen, "GEN", tmp_path / "generated.json")
    (tmp_path / "manifest.json").write_text(json.dumps(manifest))
    (tmp_path / "generated.json").write_text(json.dumps(generated))
    monkeypatch.setattr(sys, "argv", ["sfx_gen", category, "test", "prompt"])
    with pytest.raises(SystemExit, match="existing category"):
        sfx_gen.main()
    assert not (tmp_path / "raw").exists()


def test_transcribe_entrypoint_under_cp1252(tmp_path):
    import os
    import subprocess
    from pathlib import Path
    audio = tmp_path / "voice.wav"
    audio.write_bytes(b"mock")
    engine = Path(__file__).resolve().parents[1] / "engine"
    code = '''import sys, runpy
sys.path.insert(0, sys.argv[1])
import eleven
eleven.upload = lambda *a, **k: {"words": [{"type": "word", "text": "عربي", "start": 0, "end": 1}]}
sys.argv = ["transcribe", sys.argv[2], sys.argv[3], "--engine", "elevenlabs"]
runpy.run_module("transcribe", run_name="__main__")
'''
    result = subprocess.run([sys.executable, "-c", code, str(engine), str(audio), str(tmp_path / "transcript.json")],
                            env=dict(os.environ, PYTHONIOENCODING="cp1252"), capture_output=True)
    assert result.returncode == 0, result.stderr.decode("utf-8")
    assert "عربي" in result.stdout.decode("utf-8")


@pytest.mark.parametrize("written,heard", [
    ("3", "واحد اتنين"), ("100", "خمسين خمسين"),
    ("100000000000000000001", "100000000000000000002"),
])
def test_numbers_do_not_suppress_unverified_equivalence(written, heard):
    assert voicecheck.number_tokens(written) != voicecheck.number_tokens(heard)
