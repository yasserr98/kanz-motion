"""Timing regressions for shorts and voice notes; no browser or source media."""
import json
import shutil
import sys
import wave
from types import SimpleNamespace

import numpy as np
import pytest

import edit_audio
import faces
import footage
import tighten_footage


def W(text, start, end):
    return {"w": text, "start": start, "end": end}


def short_project(proj, words, fps=24, tracked=True, kind="live"):
    n = round((words[-1]["end"] + 0.4) * fps)
    face = proj / "assets" / "face"
    face.mkdir(parents=True)
    for i in range(n):
        (face / f"{i + 1:06d}.jpg").write_bytes(str(i).encode())
    (proj / "audio").mkdir()
    audio = np.zeros(round(n / fps * footage.SR), dtype="<i2")
    for w in words:
        audio[round(w["start"] * footage.SR):round(w["end"] * footage.SR)] = 10000
    with wave.open(str(proj / "audio" / "voice.wav"), "wb") as wav:
        wav.setparams((1, 2, footage.SR, 0, "NONE", "not compressed"))
        wav.writeframes(audio.tobytes())
    tr = {"duration": n / fps, "segments": [{"start": words[0]["start"], "end": words[-1]["end"], "words": words}],
          "cut_from": {"source": "source.mp4", "ranges": [{"out_start": 0.0}]}}
    (proj / "transcript.json").write_text(json.dumps(tr), encoding="utf-8")
    (proj / "assets" / "faces.json").write_text(json.dumps({"kind": kind}), encoding="utf-8")
    if tracked:
        (proj / "assets" / "track.json").write_text(json.dumps({"cx": list(range(n)), "joins": [], "source": "source.mp4"}))
    return n


@pytest.mark.skipif(not shutil.which("ffmpeg"), reason="ffmpeg")
@pytest.mark.parametrize("fps", [24, 29])
def test_many_seams_keep_audio_frames_and_words_on_one_timeline(tmp_path, fps):
    words = [W(str(i), i * 0.8, i * 0.8 + 0.2) for i in range(51)]
    short_project(tmp_path, words, fps=fps)
    out = tighten_footage.tighten(tmp_path, analyse=False, fps=fps)
    frames = sorted((tmp_path / "assets" / "face").glob("*.jpg"))
    with wave.open(str(tmp_path / "audio" / "voice.wav"), "rb") as wav:
        assert wav.getnframes() == round(len(frames) / fps * wav.getframerate())
        audio = np.frombuffer(wav.readframes(wav.getnframes()), "<i2").reshape(-1, 2)
    assert len(out["tightened"]["cuts_at_s"]) == 50
    kept = [int(f.read_bytes()) for f in frames]
    for old, new in zip(words, out["segments"][0]["words"]):
        old_frame = int(old["start"] * fps)
        expected = (kept.index(old_frame) + old["start"] * fps - old_frame) / fps
        assert new["start"] == pytest.approx(expected, abs=0.001)
        assert new["end"] - new["start"] == pytest.approx(0.2, abs=0.001)
        assert audio[round((new["start"] + 0.1) * footage.SR), 0] > 5000


@pytest.mark.skipif(not shutil.which("ffmpeg"), reason="ffmpeg")
@pytest.mark.parametrize("tracked,kind", [(False, "youtube"), (True, "youtube"), (True, "live")])
def test_tighten_optional_tracks_and_source_kind(tmp_path, monkeypatch, tracked, kind):
    short_project(tmp_path, [W("a", 0, 0.2), W("b", 1, 1.2)], tracked=tracked, kind=kind)
    calls = []
    monkeypatch.setattr(faces, "analyse", lambda *args, **kwargs: calls.append(kwargs))
    first = tighten_footage.tighten(tmp_path)
    second = tighten_footage.tighten(tmp_path)
    assert first == second
    assert [c["kind"] for c in calls] == [kind, kind]
    assert [c["source"] for c in calls] == ["source.mp4", "source.mp4"]
    assert (tmp_path / "assets" / "track.json").exists() == tracked
    assert (tmp_path / "assets" / "track_full.json").exists() == tracked


def test_join_budget_is_the_whole_gap_and_final_tail_is_separate():
    words = [W("a", 1, 1.4), W("b", 5, 5.4), W("c", 5.5, 5.9)]
    a, b = footage.plan_segments(words, [(1, 1.4), (4.7, 5.9)])
    first_end = a["out_start"] + 1.4 - a["src_start"]
    next_start = b["out_start"] + 5 - b["src_start"]
    assert next_start - first_end == pytest.approx(0.25)
    assert a["src_end"] - 1.4 == pytest.approx(0.15)
    assert b["lead"] + 5 - b["src_start"] == pytest.approx(0.1)
    assert b["src_end"] == pytest.approx(6.3)


@pytest.mark.parametrize("gap", [0.04, 0.1, 0.2])
def test_join_preserves_a_shorter_source_gap(gap):
    words = [W("a", 0, 1), W("b", 1 + gap, 2)]
    a, b = footage.plan_segments(words, [(0, 1), (1 + gap, 2)])
    assert b["out_start"] - 1 == pytest.approx(gap)
    assert a["src_end"] >= 1
    assert b["src_start"] <= words[1]["start"]


def test_exact_end_keeps_explicit_legacy_join():
    words = [W("a", 1, 1.4), W("b", 5, 5.4)]
    a, b = footage.plan_segments(words, [(1, 1.8), (5, 5.8)], exact=True)
    assert a["src_end"] == 1.8
    assert b["lead"] == 0.25
    assert b["out_start"] == 1.05
    assert b["src_end"] == 5.8


@pytest.mark.skipif(not shutil.which("ffmpeg"), reason="ffmpeg")
@pytest.mark.parametrize("gap,cuts", [(0.41, 0), (0.43, 1)])
def test_tighten_threshold_stays_point_four_two(tmp_path, gap, cuts):
    short_project(tmp_path, [W("a", 0, 0.5), W("b", 0.5 + gap, 1.2)])
    out = tighten_footage.tighten(tmp_path, analyse=False)
    assert len(out["tightened"]["cuts_at_s"]) == cuts
    a, b = out["segments"][0]["words"]
    assert b["start"] - a["end"] == pytest.approx(0.3 if cuts else gap, abs=1 / 24)


def test_tighten_help_describes_the_actual_threshold(monkeypatch, capsys):
    monkeypatch.setattr(sys, "argv", ["tighten_footage.py", "--help"])
    with pytest.raises(SystemExit) as exc:
        tighten_footage.main()
    assert exc.value.code == 0
    phrase = "gaps over 0.42 s are trimmed to 0.30 s, frame-rounded."
    assert phrase in " ".join(capsys.readouterr().out.split())
    assert phrase in tighten_footage.__doc__


@pytest.mark.parametrize("next_start,end,warning", [(709.52, 709.49, True), (709.68, 709.63, False)])
def test_ending_keeps_whole_word_before_next_margin(monkeypatch, capsys, next_start, end, warning):
    words = [W("last", 709, 709.48), W("next", next_start, 710)]
    g, = footage.plan_segments(words, [(709, 709.48)])
    footage.report([g])
    assert g["src_end"] == pytest.approx(end)
    assert footage.NEXT_WORD_GAP == 0.05
    message = "ending: next word starts 40 ms after the last word; kept the whole word, listen to the join"
    assert (message in capsys.readouterr().out) == warning
    monkeypatch.setattr(footage, "decode", lambda src, t0, dur: np.ones((round(dur * footage.SR), 2), np.float32))
    audio = footage.voice_audio("source", [g])
    assert audio[round(0.479 * footage.SR), 0] == 1
    assert audio[-1, 0] == 0
    if warning:
        assert 0.4 < audio[round(0.485 * footage.SR), 0] < 0.6


@pytest.mark.parametrize("speed", [None, 1.0, 1.5])
def test_voice_note_default_speed_is_used_in_audio_and_receipt(tmp_path, monkeypatch, capsys, speed):
    (tmp_path / "audio").mkdir()
    edl = {"source": "source.wav", "keep": [[0, 1]]}
    if speed is not None:
        edl["speed"] = speed
    (tmp_path / "audio" / "edl.json").write_text(json.dumps(edl))
    monkeypatch.setattr(edit_audio, "decode", lambda p: np.full(48000, 0.1, np.float32))
    calls = []

    def run(cmd, **kwargs):
        calls.append(cmd)
        if cmd[0] == "ffprobe":
            return SimpleNamespace(stdout="0.8")
        (tmp_path / "audio" / "_cut.wav").touch()
        return SimpleNamespace()

    monkeypatch.setattr(edit_audio.subprocess, "run", run)
    edit_audio.main(tmp_path)
    expected = 1.25 if speed is None else speed
    receipt = json.loads((tmp_path / "audio" / "voice-edit.json").read_text())
    assert receipt["speed"] == expected
    assert calls[1][calls[1].index("-af") + 1].startswith(f"atempo={expected},")
    assert f"at {expected}x" in capsys.readouterr().out
