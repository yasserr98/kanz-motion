import json
import sys
from types import SimpleNamespace

import pytest

import align
import captions
import provenance as pv
import retime
import tts


def transcript(project, start=0, aligned=False, legacy=False):
    data = {"duration": 3, "segments": [{"start": start, "end": start + 1, "text": "hello",
            "words": [{"w": "hello", "start": start, "end": start + 1}]}]}
    if not legacy:
        data.update(pv.stamp(project / "audio/voice.wav", "hello" if aligned else None))
    path = project / ("transcript.aligned.json" if aligned else "transcript.json")
    path.write_text(json.dumps(data), encoding="utf-8")
    return data


def test_provenance_audio_script_and_legacy(project, capsys):
    voice = project / "audio/voice.wav"
    data = pv.stamp(voice, "hello")
    assert pv.current(data, voice, "aligned", "hello")
    assert not pv.current(data, voice, "aligned", "changed")
    voice.write_bytes(b"new")
    assert not pv.current(data, voice, "aligned", "hello")
    assert pv.current({}, voice, "legacy", "hello")
    assert "warning" in capsys.readouterr().out


@pytest.mark.parametrize("change", ["audio", "script"])
def test_captions_ignore_stale_alignment(project, change, capsys):
    transcript(project, start=2, aligned=True)
    if change == "audio":
        (project / "audio/voice.wav").write_bytes(b"new")
    else:
        data = json.loads((project / "transcript.aligned.json").read_text())
        data["script_sha256"] = pv.text_hash("old")
        (project / "transcript.aligned.json").write_text(json.dumps(data))
    transcript(project, start=0)
    captions.main(project)
    assert '"start": 0' in (project / "build/timing.js").read_text()
    assert "stale" in capsys.readouterr().out


def test_captions_valid_and_legacy_alignment(project, capsys):
    transcript(project)
    transcript(project, start=2, aligned=True)
    captions.main(project)
    first = (project / "build/timing.js").read_bytes()
    transcript(project, start=2, aligned=True, legacy=True)
    captions.main(project)
    assert first == (project / "build/timing.js").read_bytes()
    assert "warning" in capsys.readouterr().out


def test_captions_stale_all_preserves_output(project):
    transcript(project)
    (project / "audio/voice.wav").write_bytes(b"new")
    output = project / "build/timing.js"
    output.write_text("keep")
    with pytest.raises(SystemExit, match="no current timings"):
        captions.main(project)
    assert output.read_text() == "keep"


def retime_mock(monkeypatch, project):
    inputs = []
    def run(cmd, **kwargs):
        if cmd[0] == "ffprobe":
            return SimpleNamespace(stdout="3")
        src = project / "audio/voice-pre-retime.wav"
        inputs.append(src.read_bytes())
        (project / "audio/voice.wav").write_bytes(src.read_bytes() + b" retimed")
        return SimpleNamespace(returncode=0)
    monkeypatch.setattr(retime.subprocess, "run", run)
    monkeypatch.setattr(retime, "silences", lambda *args: [])
    monkeypatch.setattr(sys, "argv", ["retime", str(project), "--tempo", "1"])
    return inputs


def test_retime_does_not_bless_stale_alignment(project, monkeypatch, capsys):
    stale = transcript(project, aligned=True)
    (project / "audio/voice.wav").write_bytes(b"new take")
    transcript(project)
    inputs = retime_mock(monkeypatch, project)
    retime.main()
    assert json.loads((project / "transcript.aligned.json").read_text()) == stale
    assert inputs == [b"new take"]
    assert "stale transcript.aligned" in capsys.readouterr().out


def test_retime_repeats_original_but_keeps_edited_take(project, monkeypatch):
    transcript(project)
    transcript(project, aligned=True)
    captions.main(project)
    inputs = retime_mock(monkeypatch, project)
    retime.main()
    retime.main()
    assert inputs == [b"voice one", b"voice one"]
    assert pv.current(json.loads((project / "transcript.aligned.json").read_text()), project / "audio/voice.wav", "aligned", "hello")
    (project / "audio/voice.wav").write_bytes(b"edited take")
    retime.main()
    assert inputs[-1] == b"edited take"
    assert (project / "audio/voice.wav").read_bytes() == b"edited take retimed"


def test_retime_legacy_backup_warns(project, monkeypatch, capsys):
    data = transcript(project, legacy=True)
    data["retime"] = {}
    for name in ("transcript.json", "transcript-pre-retime.json"):
        (project / name).write_text(json.dumps(data))
    (project / "audio/voice-pre-retime.wav").write_bytes(b"original")
    retime_mock(monkeypatch, project)
    retime.main()
    assert "no voice provenance" in capsys.readouterr().out


def test_align_empty_response_keeps_output(project, monkeypatch):
    output = project / "transcript.aligned.json"
    output.write_text('{"old": true}')
    monkeypatch.setattr(sys, "argv", ["align", str(project), "--force"])
    monkeypatch.setattr(align.eleven, "upload", lambda *args: {"words": []})
    with pytest.raises(SystemExit, match="no words"):
        align.main()
    assert output.read_text() == '{"old": true}'


def test_align_stale_tts_must_realign(project, monkeypatch):
    data = transcript(project)
    data.update(source="elevenlabs", script_sha256=pv.text_hash("old script"))
    (project / "transcript.json").write_text(json.dumps(data))
    monkeypatch.setattr(sys, "argv", ["align", str(project)])
    monkeypatch.setattr(align.eleven, "upload", lambda *args: {"words": [{"text": "hello", "start": 0, "end": 1}]})
    align.main()
    result = json.loads((project / "transcript.aligned.json").read_text())
    assert result["script_sha256"] == pv.text_hash("hello")
    monkeypatch.setattr(align.eleven, "upload", lambda *args: pytest.fail("valid alignment must be cached"))
    align.main()


def response():
    return {"audio_base64": "YQ==", "alignment": {"characters": ["h", "i"],
            "character_start_times_seconds": [0, .1], "character_end_times_seconds": [.1, .2]}}


def test_tts_cache_corrupt_and_atomic(tmp_path, monkeypatch):
    p = tmp_path / "p00.json"
    for text in ("{", "[]", "null", '{"_sig":"x"}'):
        p.write_text(text)
        assert tts.read_cache(p) is None
    data = response()
    data["_sig"] = "valid"
    tts.write_cache(p, data)
    assert tts.read_cache(p) == data
    old = p.read_bytes()
    monkeypatch.setattr(tts.os, "replace", lambda *args: (_ for _ in ()).throw(OSError("interrupted")))
    with pytest.raises(OSError):
        tts.write_cache(p, {"new": True})
    assert p.read_bytes() == old
    assert not list(tmp_path.glob("*.tmp"))


def test_tts_empty_alignment_keeps_voice_and_transcript(project, monkeypatch):
    tr = transcript(project)
    monkeypatch.setattr(tts, "env", lambda: {"ELEVENLABS_API_KEY": "mock", "ELEVENLABS_VOICE_ID": "mock"})
    monkeypatch.setattr(tts, "LEXICON", project / "absent")
    monkeypatch.setattr(tts, "call", lambda *args: {"audio_base64": "YQ==", "alignment": {
        "characters": [], "character_start_times_seconds": [], "character_end_times_seconds": []}})
    monkeypatch.setattr(sys, "argv", ["tts", str(project), "--model", "mock", "--pause", "0"])
    monkeypatch.setattr(tts.subprocess, "run", lambda *args, **kwargs: pytest.fail("empty alignment must stop before encoding"))
    with pytest.raises(ValueError, match="no words"):
        tts.main()
    assert (project / "audio/voice.wav").read_bytes() == b"voice one"
    assert json.loads((project / "transcript.json").read_text()) == tr


def test_legacy_retime_combined_hash_and_edited_take(project, monkeypatch):
    import hashlib
    voice = project / "audio/voice.wav"
    data = transcript(project, legacy=True)
    data.update(retime={}, sha256=hashlib.sha256(voice.read_bytes() + b"hello").hexdigest())
    assert pv.current(data, voice, "legacy retimed transcript")
    (project / "transcript.json").write_text(json.dumps(data))
    (project / "audio/voice-pre-retime.wav").write_bytes(b"older take")
    voice.write_bytes(b"edited legacy take")
    inputs = retime_mock(monkeypatch, project)
    retime.main()
    assert inputs == [b"edited legacy take"]


def test_captions_use_current_duration(project):
    transcript(project)
    tr = json.loads((project / "transcript.json").read_text())
    tr["duration"] = 99
    tr["audio_sha256"] = "stale"
    (project / "transcript.json").write_text(json.dumps(tr))
    transcript(project, aligned=True)
    captions.main(project)
    assert "window.DURATION=3;" in (project / "build/timing.js").read_text()


def test_alignment_uses_current_audio_duration(project, monkeypatch):
    transcript(project)
    (project / "audio/voice.wav").write_bytes(b"changed")
    monkeypatch.setattr(sys, "argv", ["align", str(project)])
    monkeypatch.setattr(align.eleven, "upload", lambda *args: {"words": [{"text": "hello", "start": 0, "end": 1}]})
    monkeypatch.setattr(align.subprocess, "run", lambda *args, **kw: SimpleNamespace(stdout="2.5"))
    align.main()
    assert json.loads((project / "transcript.aligned.json").read_text())["duration"] == 2.5
