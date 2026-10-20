import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "engine"))


@pytest.fixture(autouse=True)
def offline(monkeypatch, tmp_path):
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
    # tests never take the machine's real local render slot (it would block real renders for the whole run)
    import slot
    monkeypatch.setattr(slot, "LOCK", tmp_path / ".local-render.lock")
    monkeypatch.setattr(slot, "_held", None)
    monkeypatch.delenv("KANZ_LOCAL_SLOT", raising=False)


@pytest.fixture
def project(tmp_path):
    (tmp_path / "audio").mkdir()
    (tmp_path / "build").mkdir()
    (tmp_path / "out").mkdir()
    (tmp_path / "audio" / "voice.wav").write_bytes(b"voice one")
    (tmp_path / "script.md").write_text("<!-- captions:start -->\nhello\n<!-- captions:end -->", encoding="utf-8")
    return tmp_path
