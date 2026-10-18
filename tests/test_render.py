import io
import json
import random
import sys
from pathlib import Path
from types import SimpleNamespace

import numpy as np
import pytest
from PIL import Image

import contrast
import render


class Page:
    def __init__(self, error=None, fail=False):
        self.handlers = {}
        self.error, self.fail, self.captures = error, fail, 0
        self.cues = []

    def on(self, event, handler):
        self.handlers[event] = handler

    def goto(self, url):
        if self.error == "load":
            self.handlers["pageerror"]("broken scene")

    def wait_for_function(self, js):
        pass

    def evaluate(self, js):
        if js.startswith("K.seek") and self.error == "seek":
            self.handlers["pageerror"]("broken seek")
        if js.startswith("Array.from(document.fonts)"):
            return ["Test Font"]
        return {"K.duration": 1, "K.fps": 2, "!!K.camSmooth": False,
                "K.cues": self.cues, "K.mix || 1": 2}.get(js)

    def screenshot(self, **kwargs):
        self.captures += 1
        if self.fail:
            raise RuntimeError("transient screenshot failure")
        if self.error == "capture":
            self.handlers["pageerror"]("broken capture")
        if "path" in kwargs:
            Path(kwargs["path"]).write_bytes(b"png")
        return b"jpeg"

    def close(self):
        pass


class Encoder:
    def __init__(self, code=0):
        self.stdin = io.BytesIO()
        self.returncode, self.code, self.terminated = None, code, False

    def wait(self, **kwargs):
        self.returncode = self.code
        return self.code

    def poll(self):
        return self.returncode

    def terminate(self):
        self.terminated = True


class Playwright:
    def __init__(self, pages):
        self.pages, self.opened = pages, []
        self.chromium = self

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass

    def launch(self, **kwargs):
        return self

    def new_page(self, **kwargs):
        page = self.pages.pop(0)
        self.opened.append(page)
        return page

    def close(self):
        pass


def setup_render(project, monkeypatch, pages, code=0, extra=()):
    player, encoder = Playwright(pages), Encoder(code)
    monkeypatch.setattr(render, "sync_playwright", lambda: player)
    monkeypatch.setattr(render, "ROOT", project)
    (project / "library/sfx").mkdir(parents=True)
    (project / "library/sfx/manifest.json").write_text("[]")
    monkeypatch.setattr(sys, "argv", ["render", str(project), "--name", "test", *extra])
    starts = []
    def popen(cmd, **kwargs):
        starts.append(cmd)
        Path(cmd[-1]).write_bytes(b"video")
        return encoder
    monkeypatch.setattr(render.subprocess, "Popen", popen)
    def run(cmd, **kwargs):
        if cmd[0] == "ffprobe":
            return SimpleNamespace(stdout=json.dumps({"streams": [{"nb_read_frames": "24", "duration": "1"}]}))
        Path(cmd[-1]).write_bytes(b"muxed")
        return SimpleNamespace(returncode=0)
    monkeypatch.setattr(render.subprocess, "run", run)
    def mix(proj, cues, t1, out, *args):
        out.write_bytes(b"audio")
        return []
    monkeypatch.setattr(render, "mix_audio", mix)
    return player, encoder, starts


@pytest.mark.parametrize("error", ["load", "seek", "capture"])
def test_page_errors_abort(project, monkeypatch, error):
    page = Page(error=error)
    player, encoder, starts = setup_render(project, monkeypatch, [page])
    with pytest.raises(RuntimeError, match="PAGE ERRORS"):
        render.main()
    assert not (project / "out/test.mp4").exists()
    assert len(player.opened) == 1
    if error == "load":
        assert not starts and not page.captures
    else:
        assert encoder.stdin.closed and encoder.terminated


@pytest.mark.parametrize("stills", [False, True])
def test_replacement_page_errors_abort(project, monkeypatch, stills):
    player, encoder, starts = setup_render(project, monkeypatch, [Page(fail=True), Page(error="load")],
                                           extra=["--stills", "0"] if stills else [])
    with pytest.raises(RuntimeError, match="PAGE ERRORS"):
        render.main()
    assert len(player.opened) == 2
    assert "pageerror" in player.opened[1].handlers
    if not stills:
        assert encoder.terminated


def test_encoder_failure_never_muxes(project, monkeypatch):
    _, encoder, _ = setup_render(project, monkeypatch, [Page()], code=7)
    with pytest.raises(RuntimeError, match="encoder failed.*7"):
        render.main()
    assert encoder.stdin.closed
    assert not (project / "out/test.mp4").exists()


@pytest.mark.parametrize("count,duration,ok", [(24, 1, True), (23, .96, True), (4, .2, False), (24, 4, False)])
def test_encoded_count_and_duration(monkeypatch, count, duration, ok):
    monkeypatch.setattr(render.subprocess, "run", lambda *a, **kw: SimpleNamespace(stdout=json.dumps({
        "streams": [{"nb_read_frames": str(count), "duration": str(duration)}]})))
    if ok:
        render.check_video(Path("fake"), 12, 12)
    else:
        with pytest.raises(RuntimeError, match="incomplete encoded"):
            render.check_video(Path("fake"), 12, 12)


def test_success_and_retry_keep_frames(project, monkeypatch):
    good = Page()
    _, encoder, _ = setup_render(project, monkeypatch, [Page(fail=True), good])
    render.main()
    assert good.captures == 2
    assert encoder.stdin.closed and not encoder.terminated
    assert (project / "out/test.mp4").read_bytes() == b"muxed"


@pytest.mark.parametrize("missing", ["voice", "sfx"])
def test_audio_preflight_before_capture(project, monkeypatch, missing):
    page = Page()
    _, _, starts = setup_render(project, monkeypatch, [page])
    if missing == "voice":
        (project / "audio/voice.wav").unlink()
    else:
        page.cues = [{"cat": "hit", "t": 0, "pick": 0, "gain": 1}]
        (project / "library/sfx/manifest.json").write_text('[{"category":"hit","file":"absent.wav"}]')
    with pytest.raises(FileNotFoundError, match="missing"):
        render.main()
    assert not starts and page.captures == 0


def test_stills_remove_old_review_frames(project, monkeypatch):
    setup_render(project, monkeypatch, [Page()], extra=["--stills", "0,0.5"])
    sd = project / "out/stills-test"
    sd.mkdir()
    (sd / "t099.00.png").write_bytes(b"stale")
    render.main()
    assert sorted(f.name for f in sd.glob("*.png")) == ["t000.00.png", "t000.50.png"]


def test_cue_selection_matches_old_algorithm(tmp_path, monkeypatch):
    monkeypatch.setattr(render, "ROOT", tmp_path)
    lib = tmp_path / "library/sfx"
    lib.mkdir(parents=True)
    files = [f"hit-{i}.wav" for i in range(5)]
    for f in files:
        (lib / f).touch()
    (lib / "manifest.json").write_text(json.dumps([{"category": "hit", "file": f} for f in files]))
    cues = [{"t": i / 2, "cat": "hit", "pick": i, "gain": 1} for i in range(10)]
    for t0 in [0, 1]:
        rng = random.Random(7)
        expected = [(c, files[(c["pick"] * 7 + rng.randrange(3)) % len(files)]) for c in cues if c["t"] >= t0]
        assert render.resolve_cues(cues, t0) == expected


LOUDNORM_JSON = ('[Parsed_loudnorm_0]\n{\n "input_i" : "-20.00", "input_tp" : "-3.00", "input_lra" : "4.00",\n'
                 ' "input_thresh" : "-30.00", "target_offset" : "0.10"\n}\n')


@pytest.mark.parametrize("level", [.1, 1.5])
def test_mix2_float_until_master_two_pass(tmp_path, monkeypatch, level):
    monkeypatch.setattr(render, "SR", 100)
    calls = []
    def run(cmd, **kwargs):
        calls.append((cmd, kwargs))
        if "input" in kwargs:
            Path(cmd[-1]).touch()
        voice = (np.ones((100, 2)) * min(level, 0.99) * 32768).astype(np.int16).tobytes()
        return SimpleNamespace(stdout=voice, stderr=LOUDNORM_JSON)
    monkeypatch.setattr(render.subprocess, "run", run)
    render.mix_audio_v2(tmp_path, [], 1, tmp_path / "mix.wav", resolved=[])
    assert render.VOICE_CHAIN in calls[0][0]  # the voice is high-passed and compressed before the mix
    cmd, kwargs = next(c for c in calls if "input" in c[1])
    assert cmd[cmd.index("-f") + 1] == "f32le"
    assert cmd[cmd.index("-c:a") + 1] == "pcm_f32le"
    pcm = np.frombuffer(kwargs["input"], dtype="<f4")
    assert pcm.max() == pytest.approx(min(level, 0.99), abs=1e-3)  # float bus, no clipping before the master
    final = calls[-1][0]
    af = final[final.index("-af") + 1]
    assert "loudnorm=I=-16.0:TP=-1.5" in af and "measured_I=-20.00" in af and "linear=true" in af
    assert final[final.index("-c:a") + 1] == "pcm_s16le"


def test_schedule_sfx_one_effect_at_a_time():
    cue = lambda t, g=1.0: ({"t": t, "gain": g}, f"f{t}")
    plan = render.schedule_sfx([cue(1.0), cue(1.1, 0.5), cue(1.2, 2.0), cue(2.0), cue(2.29), cue(2.6)])
    assert [c["t"] for c, _ in plan] == [1.2, 2.0, 2.6]  # 1.0-1.2: the loudest wins; 2.29 is within 0.3 s of 2.0


def test_mix2_chokes_overlapping_effects(tmp_path, monkeypatch):
    monkeypatch.setattr(render, "SR", 1000)
    long = np.ones((3000, 2), np.float32) * 0.1  # a 3 s effect
    monkeypatch.setattr(render, "decode", lambda p: long)
    monkeypatch.setattr(render, "env_db", lambda x, w: np.full(len(x), render.SFX_TARGET, np.float32))
    buses = []
    def run(cmd, **kwargs):
        if "input" in kwargs:
            buses.append(np.frombuffer(kwargs["input"], dtype="<f4").reshape(-1, 2))
            Path(cmd[-1]).touch()
        return SimpleNamespace(stdout=np.zeros((5000, 2), np.int16).tobytes(), stderr=LOUDNORM_JSON)
    monkeypatch.setattr(render.subprocess, "run", run)
    resolved = [({"t": 0.0, "gain": 1}, "a.wav"), ({"t": 1.0, "gain": 1}, "b.wav")]
    render.mix_audio_v2(tmp_path, [], 4, tmp_path / "mix.wav", resolved=resolved)
    bus = buses[0][:, 0]
    one = bus[500]                                           # the first effect alone (ducked: the mock reads all as speech)
    assert one > 0
    assert bus[1100] == pytest.approx(one, rel=1e-3)         # after the choke: never two stacked
    assert bus[2100] == pytest.approx(one, rel=1e-3)         # second effect, before its tail fade (2.2-2.4 s)
    assert abs(bus[2500]) < 1e-6                             # capped at SFX_MAX_LEN (1.4 s after 1.0 s)


def test_contrast_actual_lavender():
    rgb = np.full((2, 2, 3), 100.)
    white, _ = contrast.contrast(rgb, "rgb(255, 255, 255)")
    lavender, _ = contrast.contrast(rgb, "rgb(213, 173, 239)")
    assert white > 4.5 > lavender


def test_contrast_includes_captions_and_computed_colour(project, monkeypatch, capsys):
    image = io.BytesIO()
    Image.new("RGB", (20, 20), (100, 100, 100)).save(image, format="PNG")
    class ContrastPage(Page):
        def evaluate(self, js):
            if "createTreeWalker" in js:
                assert "#captions" in js and "s.color" in js
                return [["caption", 0, 0, 20, 20, "rgb(213, 173, 239)"]]
            return []
        def add_style_tag(self, **kwargs):
            assert "#captions" in kwargs["content"]
        def screenshot(self, **kwargs):
            return image.getvalue()
    monkeypatch.setattr(contrast, "sync_playwright", lambda: Playwright([ContrastPage()]))
    contrast.main(project, [1])
    assert "LOW " in capsys.readouterr().out


def test_mix_cache_reuses_until_inputs_change(project, monkeypatch):
    calls = []
    def mix(proj, cues, duration, out, *args):
        calls.append(duration)
        out.write_bytes(b"mix%d" % len(calls))
        return ["a.mp3"]
    monkeypatch.setattr(render, "mix_audio", mix)
    out = project / "out/audio.wav"
    assert render.cached_mix(project, [], 2.0, out, resolved=[]) == ["a.mp3"]
    assert render.cached_mix(project, [], 2.0, out, resolved=[]) == ["a.mp3"]
    assert len(calls) == 1 and out.read_bytes() == b"mix1"
    (project / "audio/voice.wav").write_bytes(b"voice two")
    render.cached_mix(project, [], 2.0, out, resolved=[])
    render.cached_mix(project, [], 3.0, out, resolved=[])
    assert len(calls) == 3
