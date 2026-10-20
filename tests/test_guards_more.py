"""Audit E2 regressions: data and mocked pages only, never a browser."""
import json
import io
import shutil
import subprocess

import pytest

import footage
import guards
import lint
import shipcheck
import shortinfo


def item(id=1, kind="text", txt="label", **kw):
    return dict(id=id, kind=kind, txt=txt, **{
        "x0": 200, "x1": 800, "y0": 300, "y1": 400, "opacity": 1,
        "board": "1", "label": kind == "text", **kw})


@pytest.mark.parametrize("top,bottom,face", [
    (1268, 1700, [300, 1300, 700, 1500]),
    (960, 1100, [300, 980, 700, 1080]),
])
def test_c4_caption_still_collides_with_low_or_split_face(top, bottom, face):
    cap = item(kind="caption", y0=top, y1=bottom)
    assert guards.on_face_findings(4, {"items": [cap]}, face)


@pytest.mark.parametrize("top,bottom,face_only,bad", [
    (1500, 1660, True, False), (1268, 1438, True, False),
    (1500, 1940, True, True), (1268, 1800, True, True),
    (1502, 1660, True, True), (1500, 1660, False, True),
    (960, 1450, False, True),
])
def test_c4_caption_safe_bottom(top, bottom, face_only, bad):
    cap = item(kind="caption", y0=top, y1=bottom)
    assert bool(lint.outside(cap, face_only=face_only)) == bad
    if not bad:
        assert not guards.on_face_findings(4, {"items": [cap]}, [300, 600, 700, 1200])


def short_project(proj, profile="2026-10-18"):
    (proj / "assets").mkdir(exist_ok=True)
    (proj / "out").mkdir(exist_ok=True)
    (proj / "scene.js").write_text(f'K.pace({{defaults: "{profile}"}}); K.footage(); K.title(); K.finish();')
    (proj / "transcript.json").write_text(json.dumps({"cut_from": {"ranges": []}}))
    return proj


def metadata(proj):
    (proj / "assets/faces.json").write_text(json.dumps({
        "fps": 24, "face": {"boxes": [[200, 500, 800, 900]] * 96}}))
    (proj / "assets/freezes.json").write_text(json.dumps({"fps": 24, "runs": []}))


@pytest.mark.parametrize("profile,required", [("2026-10-18", True), ("2026-10-17", False), ("", False)])
def test_c16_metadata_required_only_for_new_shorts(tmp_path, profile, required):
    proj = short_project(tmp_path, profile)
    hits = shortinfo.metadata_findings(proj)
    assert len(hits) == (2 if required else 0)
    if required:
        assert all("assets/" in h["why"] for h in hits)
    metadata(proj)
    assert not shortinfo.metadata_findings(proj)
    (proj / "assets/freezes.json").write_text("{}")
    assert bool(shortinfo.metadata_findings(proj)) == required


def test_c16_ship_requires_matching_report_for_new_shorts(tmp_path):
    proj = short_project(tmp_path)
    metadata(proj)
    assert shipcheck.review_problems(proj, {})
    report = {"short": {"cut": True, "faces": [[0, 3]], "splits": [], "duration": 4, "fps": 24},
              "review": shortinfo.review_stamp(proj)}
    assert not shipcheck.review_problems(proj, report)
    (proj / "scene.js").write_text((proj / "scene.js").read_text() + "\n// revision")
    assert "stale" in " ".join(shipcheck.review_problems(proj, report))
    (proj / "scene.js").write_text("K.pace();")
    assert not shipcheck.review_problems(proj, {})


def test_c16_opening_checks_real_face_title_and_caption_suppression():
    info = {"cut": True, "duration": 4, "faces": [[0, 3]], "splits": []}
    good = {"items": [item(kind="title")], "face": [200, 500, 800, 900], "face_only": True}
    assert not lint.opening_findings([(1, good)], info)
    bad = {**good, "face": None, "items": [item(kind="caption")]}
    why = " ".join(h["why"] for h in lint.opening_findings([(1, bad)], info))
    assert "face" in why and "title" in why and "caption" in why
    assert lint.opening_findings([(1, good)], {**info, "faces": [[0, 1], [2, 3]]})


@pytest.mark.parametrize("profile,required", [("2026-10-18", True), ("2026-10-17", False)])
def test_c16_short_checks_require_page_metadata_for_current_profile(profile, required):
    class Page:
        def evaluate(self, code):
            assert code == lint.SHORT_INFO
            return {"cut": True, "duration": 4, "faces": [[0, 3]], "splits": []}
    hits, _ = lint.short_findings(Page(), [], [], .1, .25, True, profile)
    assert bool([h for h in hits if h["kind"] == "short-metadata"]) == required


def test_c16_ship_stops_before_empty_window_checks(tmp_path, monkeypatch):
    proj = short_project(tmp_path)
    metadata(proj)
    monkeypatch.setattr(shipcheck, "ending", lambda *a: ([], []))
    monkeypatch.setattr(shipcheck, "tail", lambda *a: [])
    def forbidden(*args):
        raise AssertionError("missing review must fail before media checks use empty windows")
    monkeypatch.setattr(shipcheck, "freezes_in_mp4", forbidden)
    problems, _, _ = shipcheck.run(proj, "unused.mp4", "v1")
    assert "missing or stale out/lint.json" in problems[0]


def test_c17_face_share_union_and_clamping():
    assert guards.face_share([[-10, 2], [1, 4], [20, 30]], [[2, 4]], 10) == .4
    assert guards.face_share([[-1, 20]], [], 10) == 1
    assert guards.face_share([[0, 1]], [], 0) == 0
    hits = guards.face_share_findings([[0, 4]], [[1, 4]], 10, live=True)
    assert {h["kind"] for h in hits} == {"face-share", "face-overlap"}
    assert guards.face_share_findings([[0, 8]], [[1, 4]], 10, live=False)[0]["kind"] == "face-overlap"


@pytest.mark.parametrize("shape", [
    item(2, "obj", "panel", x0=0, x1=1080, y0=350, y1=1900),
    item(2, "obj", "grid line", y0=370, y1=371),
])
def test_c24_board_headline_large_panel_and_grid_line(shape):
    head = item(head=True, bh=True)
    assert guards.headline_cross_findings(1, {"items": [head, shape]}, 40)


def test_c24_display_font_alone_is_not_a_headline():
    """Rising Stock v5's moving price counters and sell button carry .head (the display font), not data-role=headline."""
    counter = item(head=True)
    line = item(2, "obj", "line", y0=370, y1=371)
    assert not guards.headline_cross_findings(1, {"items": [counter, line]}, 40)


def test_c24_scaled_split_gap_and_real_background():
    head = item(head=True, bh=True, sc=.8)
    panel = item(2, "obj", "panel", y0=431, y1=800)
    assert guards.headline_cross_findings(1, {"items": [head, panel]}, 40)
    assert not guards.headline_cross_findings(1, {"items": [head, {**panel, "y0": 433}]}, 40)
    bg = item(3, "obj", "background", x0=0, x1=1080, y0=0, y1=1920, background=True)
    assert not guards.headline_cross_findings(1, {"items": [head, bg]}, 40)


@pytest.mark.parametrize("kind,txt,src,bad", [
    ("title", "٦٥", False, True), ("title", "65%", False, True),
    ("text", "65%", False, True), ("text", "نسبة 65%", False, True),
    ("text", "FRED 65%", True, False), ("text", "المصدر FRED 65%", True, True),
    ("text", "65٪", False, False),
])
def test_c25_digits_include_titles_and_bare_percent(kind, txt, src, bad):
    hits = lint.defaults_findings(1, {"items": [item(kind=kind, txt=txt, src=src)]}, "en")
    assert bool([h for h in hits if h["kind"] == "digits"]) == bad


def test_c26_fractions_dates_and_counter_positions():
    assert not lint.static_scene_findings('K.text(b, "1/2"); K.text(b, "20/10/2026"); K.img(b, "logo.png");')
    for txt in ("1/2", "20/10/2026", "01 / 08"):
        assert not lint.structure_findings(1, {"items": [item(txt=txt)]})
    assert lint.structure_findings(1, {"items": [item(txt="01 / 08", y0=1700, y1=1750)]})
    assert lint.structure_findings(1, {"items": [item(txt="1/8", counter=True)]})


@pytest.mark.parametrize("intentional,contrast,bad", [(True, 5, False), (True, 2, True), (False, 5, True), (True, None, True)])
def test_c26_logo_requires_intent_and_contrast(intentional, contrast, bad):
    logo = item(kind="obj", txt="logo.png", logo=True, intentional=intentional, contrast=contrast)
    assert bool(lint.structure_findings(1, {"items": [logo]})) == bad


def test_c28_word_timed_labels_are_exempt_from_brief():
    frames = [(0, {"items": [item(brief_exempt=True), item(2)]})]
    assert [h["id"] for h in lint.brief_findings(frames, .2, .1)] == [2]


@pytest.mark.parametrize("profile", ["", "2026-10-17", "2026-10-18"])
def test_c29_dead_threshold_stays_2_5(profile):
    assert lint.dead_limit(profile) == 2.5
    assert not lint.exclude_windows([(4, 6)], [], lint.dead_limit(profile))
    assert lint.dead_limit(profile, 3) == 3


def test_c16_title_entrance_and_exit_are_not_missing_titles():
    info = {"cut": True, "duration": 4, "faces": [[0, 3]], "splits": []}
    face = {"items": [], "face": [200, 500, 800, 900], "face_only": True}
    assert not lint.opening_findings([(.1, face), (2.9, face)], info)
    assert "no visible title" in lint.opening_findings([(1.5, face)], info)[0]["why"]


@pytest.mark.parametrize("end,next_start,fail,warn", [
    (2.15, 2.2, False, False), (2.2, 2.2, True, False),
    (2, 2.03, False, True), (2.01, 2.03, False, True),
    (2.011, 2.03, True, False), (1.99, 2.03, True, False),
    (2, 2, False, True), (2, 1.99, False, True),
])
def test_c15_x1_clearance_preserves_last_word(end, next_start, fail, warn):
    cut = {"ranges": [{"start": 0, "end": end, "last_word_end": 2, "next_word_start": next_start}]}
    probs, warns = guards.leak_checks(cut, gap=getattr(footage, "NEXT_WORD_GAP", .05))
    assert bool(probs) == fail
    assert bool(warns) == warn
    if warn:
        assert warns[0].startswith("ending: kept the whole last word; next word ")
        assert warns[0].endswith(" ms later, listen")


def test_c15_ship_surfaces_warning(tmp_path, monkeypatch):
    proj = short_project(tmp_path, "")
    cut = {"ranges": [{"start": 0, "end": 2, "last_word_end": 2, "next_word_start": 2.03}]}
    (proj / "transcript.json").write_text(json.dumps({"cut_from": cut}))
    monkeypatch.setattr(shipcheck, "ending", lambda *a: ([], []))
    monkeypatch.setattr(shipcheck, "tail", lambda *a: [])
    monkeypatch.setattr(shipcheck, "title_problems", lambda *a: [])
    monkeypatch.setattr(shipcheck, "freezes_in_mp4", lambda *a: ([], 0))
    monkeypatch.setattr(shipcheck, "cut_strips", lambda *a: ([], None))
    monkeypatch.setattr(shipcheck, "notes", lambda *a: [])
    problems, warnings, _ = shipcheck.run(proj, "unused.mp4", "v1")
    assert not problems
    assert "kept the whole last word" in warnings[0]


@pytest.mark.parametrize("render_end,failed", [(2.01, False), (1.95, True)])
def test_x1_ship_energy_does_not_force_a_cut_into_the_last_word(tmp_path, monkeypatch, render_end, failed):
    proj = short_project(tmp_path, "")
    (proj / "build").mkdir()
    (proj / "build/timing.js").write_text('window.TOKENS=[{"w":"last","start":1.5,"end":2}];')
    cut = {"ranges": [{"start": 0, "end": 2.01, "last_word_end": 2, "next_word_start": 2.03}]}
    (proj / "transcript.json").write_text(json.dumps({"cut_from": cut}))
    monkeypatch.setattr(shipcheck, "ending", lambda *a: (["voice still sounding in the last 0.15 s"], []))
    monkeypatch.setattr(shipcheck, "duration", lambda *a: render_end)
    monkeypatch.setattr(shipcheck, "tail", lambda *a: [])
    monkeypatch.setattr(shipcheck, "title_problems", lambda *a: [])
    monkeypatch.setattr(shipcheck, "freezes_in_mp4", lambda *a: ([], 0))
    monkeypatch.setattr(shipcheck, "cut_strips", lambda *a: ([], None))
    monkeypatch.setattr(shipcheck, "notes", lambda *a: [])
    problems, warnings, _ = shipcheck.run(proj, "unused.mp4", "v1")
    assert bool(problems) == failed
    assert any("kept the whole last word" in w for w in warnings)


@pytest.mark.parametrize("data", [[], {"fps": 24, "face": "invalid"}, {"fps": 24, "face": {"boxes": ["invalid"]}}])
def test_c16_malformed_faces_are_findings(tmp_path, data):
    proj = short_project(tmp_path)
    metadata(proj)
    (proj / "assets/faces.json").write_text(json.dumps(data))
    assert shortinfo.metadata_findings(proj)[0]["kind"] == "short-metadata"


def test_c16_profile_ignores_comments_and_strings(tmp_path):
    (tmp_path / "scene.js").write_text('''// K.pace({defaults: "2026-10-18"});
    const note = 'K.pace({defaults: "2026-10-18"})';
    K.pace({defaults: "2026-10-17"});''')
    assert shortinfo.defaults_profile(tmp_path) == "2026-10-17"


@pytest.mark.parametrize("fg,bg,passes", [("white", "black", True), ("#888888", "#999999", False), ("white", "white", False)])
def test_c26_logo_contrast_measures_background(fg, bg, passes):
    from PIL import Image
    def png(color):
        buf = io.BytesIO()
        Image.new("RGB", (4, 4), color).save(buf, format="PNG")
        return buf.getvalue()
    class Page:
        def __init__(self):
            self.shots = iter([png(fg), png(bg)])
            self.calls = []
        def screenshot(self):
            return next(self.shots)
        def evaluate(self, code, args):
            self.calls.append(args)
            return [[1, "", ""]]
    page = Page()
    logo = item(kind="obj", logo=True, intentional=True, x0=0, y0=0, x1=4, y1=4)
    lint.logo_contrast(page, {"items": [logo]})
    assert (logo["contrast"] >= 4.5) == passes
    assert page.calls[-1] == [[1, "", ""]]


@pytest.mark.skipif(not shutil.which("node"), reason="node")
def test_probe_and_instrument_javascript_without_a_browser():
    probe = lint.PROBE.replace("TAKE", "take('#world .head', 'text');").replace("COVERSEL", json.dumps(lint.COVER)).replace(
        "OCCLUDERSEL", json.dumps(lint.OCCLUDERS))
    script = "const snippets = " + json.dumps([probe, lint.INSTRUMENT, lint.SHORT_INFO]) + """;
      snippets.forEach(s => new Function('return (' + s + ')'));
      global.window = {}; const labels = [];
      global.document = {querySelectorAll:() => labels};
      (new Function('return (' + snippets[1] + ')'))()();
      window.K = {}; const k = window.K;
      k.punch = () => labels.push({dataset:{}});
      k.punch();
      if (labels[0].dataset.lintBrief !== 'off') throw Error('punch was not exempted');
      k.pace = () => {};
      k.pace({defaults:'2026-10-18'});
      if (window.__lintDefaults !== '2026-10-18') throw Error('profile was not captured');
    """
    subprocess.run(["node", "-e", script], check=True, capture_output=True, text=True)


@pytest.mark.skipif(not shutil.which("node"), reason="node")
def test_c24_probe_keeps_horizontal_svg_lines():
    probe = lint.PROBE.replace("TAKE", "take('#line', 'obj');").replace("COVERSEL", "'none'").replace("OCCLUDERSEL", "'none'")
    script = """
      global.window = {}; global.SVGElement = class {};
      const stage = {id:'stage', dataset:{}, getBoundingClientRect:() => ({left:0,top:0,right:1080,bottom:1920})};
      const line = Object.assign(new SVGElement(), {
        dataset:{}, parentElement:stage, offsetHeight:0, tagName:'line',
        closest:() => null, matches:() => false, getAttribute:() => 'grid',
        getScreenCTM:() => ({a:.8,b:0,c:0,d:.8}),
        getBoundingClientRect:() => ({left:200,right:800,top:370,bottom:370,width:600,height:0})
      });
      global.document = {querySelectorAll:s => s === '#line' ? [line] : [],
        getElementById:id => id === 'stage' ? stage : null};
      global.getComputedStyle = () => ({visibility:'visible',display:'block',opacity:'1',
        fontSize:'40px',strokeWidth:'2',stroke:'white',strokeDasharray:'none',zIndex:'0'});
      global.K = {seek:() => {}}; global.gsap = {getProperty:() => 0};
    """ + "const frame = (" + probe + ")(1); process.stdout.write(JSON.stringify(frame));"
    result = subprocess.run(["node", "-e", script], capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    line, = json.loads(result.stdout)["items"]
    assert line["y0"] < 370 < line["y1"]
