import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "engine"))


@pytest.fixture(autouse=True)
def offline(monkeypatch):
    import urllib.request
    import eleven
    import tts
    import render
    import contrast

    def forbidden(*args, **kwargs):
        raise AssertionError("network/API/browser calls must be mocked")

    monkeypatch.setattr(urllib.request, "urlopen", forbidden)
    monkeypatch.setattr(eleven, "upload", forbidden)
    monkeypatch.setattr(eleven, "json_call", forbidden)
    monkeypatch.setattr(tts, "call", forbidden)
    monkeypatch.setattr(render, "sync_playwright", forbidden)
    monkeypatch.setattr(contrast, "sync_playwright", forbidden)
    # the machine's own .env must not route test renders to the VPS (tests that need a host set one)
    import make
    monkeypatch.delenv("KANZ_RENDER_HOST", raising=False)
    monkeypatch.setattr(make, "render_host", lambda: None)


@pytest.fixture
def project(tmp_path):
    (tmp_path / "audio").mkdir()
    (tmp_path / "build").mkdir()
    (tmp_path / "out").mkdir()
    (tmp_path / "audio" / "voice.wav").write_bytes(b"voice one")
    (tmp_path / "script.md").write_text("<!-- captions:start -->\nhello\n<!-- captions:end -->", encoding="utf-8")
    return tmp_path
