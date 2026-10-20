import json
import os
import shutil
import subprocess
import sys
from contextlib import nullcontext
from pathlib import Path
from types import SimpleNamespace

import pytest

import lint
import make


def box(id=1, kind='text', **kw):
    return dict(id=id, kind=kind, txt='label', x0=100, x1=300, y0=1200, y1=1300,
                opacity=1, label=kind == 'text', **kw)


def test_runs_and_merging_do_not_bridge_gaps():
    assert lint.runs([0, .25, .5, .75, 1], [True, True, False, True, True], .3) == [(0, .5)]
    hits = [dict(kind='text-on-text', id=1, t=t, by='caption') for t in [0, .25, 1, 1.25]]
    hits.append(dict(kind='text-on-text', id=1, t=.25, by='other'))
    merged = lint.merge_hits(hits, .25)
    assert [(h['from'], h['to'], h['frames']) for h in merged] == [(0, .25, 2), (.25, .25, 1), (1, 1.25, 2)]


@pytest.mark.parametrize('allowance,expected', [
    ({'kind': 'brief', 't': 1, 'why': 'intentional'}, True),
    ({'kind': 'brief', 'range': [.9, 1.1], 'why': 'intentional'}, True),
    ({'kind': 'brief', 'range': [1.1, .9], 'why': 'reversed'}, False),
    ({'kind': 'brief', 't': 1.1, 'why': 'wrong time'}, False),
    ({'kind': 'brief', 't': 1, 'why': ' '}, False),
    ({'kind': 'covered', 't': 1, 'why': 'wrong kind'}, False),
    ({'kind': 'brief', 'why': 'missing time'}, False),
    ({'kind': 'brief', 'range': ['0', 2], 'why': 'invalid'}, False),
    (None, False),
])
def test_lint_ok_matching(allowance, expected):
    assert lint.justified(dict(kind='brief', t=1), [allowance]) is expected


def test_waiver_must_cover_whole_run():
    hit = dict(kind='text-on-text', **{'from': 1, 'to': 3})
    assert not lint.justified(hit, [dict(kind='text-on-text', t=1, why='partial')])
    assert lint.justified(hit, [dict(kind='text-on-text', range=[1, 3], why='intentional')])


def test_static_checks_ignore_comments_and_strings_as_calls():
    src = '''// K.pace(); K.finish();
    K.look(); const note = "K.pace(); K.finish()";
    K.img(b, 'logo-white.svg', {}); K.text(b, '2 / 7', {});
    '''
    hits = lint.static_scene_findings(src)
    assert len(hits) == 2
    assert {h['why'] for h in hits} >= {'K.look() without K.pace()'}
    assert lint.static_scene_findings('K.look(); K.pace(); K.finish(); // K.text()') == []
    assert len(lint.static_scene_findings('K.look(); K.pace(); K.finish(); K.text(b,"hello",{});')) == 1
    assert lint.static_scene_findings('K.text(b,"hello",{});') == []


def test_single_sample_text_overlap_and_opacity():
    a, cap = box(), box(2, 'caption')
    assert lint.frame_findings(74, dict(items=[a, cap]))[0]['kind'] == 'text-on-text'
    a['opacity'] = .49
    assert lint.frame_findings(74, dict(items=[a, cap])) == []
    a['opacity'] = .5
    assert lint.frame_findings(74, dict(items=[a, cap]))


def test_caption_band_uses_height_for_all_objects():
    obj = box(1, 'obj')
    obj.update(x0=900, x1=1000, txt='very-long-landmark-name-with-no-png-suffix')
    frame = dict(items=[obj], captionBand=dict(y0=1280, y1=1450))
    assert lint.frame_findings(57, frame)[0]['kind'] == 'caption-band'
    frame['captionBand']['y0'] = 1285  # exactly 15% does not exceed threshold
    assert lint.frame_findings(57, frame) == []
    frame['captionBand'] = None
    assert lint.frame_findings(57, frame) == []


def test_markup_and_non_image_coverage():
    frame = dict(items=[box(), box(2, 'obj', markup=True)],
                 covered=[dict(id=1, txt='label', by='shape:abs')])
    assert {h['kind'] for h in lint.frame_findings(24, frame)} == {'markup-crossing-text', 'covered-shape'}
    frame['items'][1]['markup'] = False  # the probe exempts instrumented strikes
    assert len(lint.frame_findings(24, frame)) == 1


def test_brief_sums_separate_appearances():
    frames = [(round(i * .1, 2), dict(items=[box()] if i in [1, 2, 5, 6] else [])) for i in range(11)]
    assert lint.brief_findings(frames, 1.1, .1)[0]['duration'] == .4
    frames = [(i * .1, dict(items=[box()])) for i in range(8)]
    assert lint.brief_findings(frames, .8, .1) == []
    frames[0][1]['items'][0]['opacity'] = .9
    assert lint.brief_findings(frames, .8, .1)[0]['duration'] == .7


def test_arrival_chart_progress_and_fill():
    frame = dict(items=[box(1, 'obj', drawn=.49)])
    assert 'chart' in lint.arrival_findings(3, frame, .3, 'board')[0]['why']
    frame['items'][0].update(x0=0, x1=1080, y0=0, y1=1920, drawn=.5)
    assert lint.arrival_findings(3, frame, .3, 'board') == []


def test_dead_windows_split_instead_of_hide_whole_run():
    assert lint.exclude_windows([(0, 15)], [(0, 4), (8, 10)], 2.5) == [(4, 8), (10, 15)]
    assert lint.exclude_windows([(0, 4)], [(0, 4)], 2.5) == []


@pytest.mark.parametrize('state', ['missing', 'stale', 'current'])
def test_render_review_warning(project, capsys, state):
    scene, report = project / 'scene.js', project / 'out/lint.json'
    scene.write_text('scene')
    os.utime(scene, (20, 20))
    if state != 'missing':
        report.write_text('{}')
        os.utime(report, (10 if state == 'stale' else 20,) * 2)
    make.warn_stale_lint(project)
    output = capsys.readouterr().err
    assert ('WARNING' in output) == (state != 'current')


def test_gitignore_patterns(tmp_path):
    repo = tmp_path / 'repo'
    repo.mkdir()
    shutil.copyfile(Path(__file__).resolve().parents[1] / '.gitignore', repo / '.gitignore')
    subprocess.run(['git', 'init', '-q', str(repo)], check=True, capture_output=True)
    paths = ['.env', '.env.local', '.env.example', 'nested/.env.secret', 'nested/.env.example',
             'error.log', 'nested/error.log', 'projects/demo/assets/photos/image.jpg', 'projects/demo/scene.js',
             'projects/_template/scene.js', 'projects/_3d-demo/scene.js', 'examples/demo/scene.js',
             'examples/demo/delivery.json', 'examples/demo/out/v1.mp4']
    result = subprocess.run(['git', '-c', 'core.excludesFile=', 'check-ignore', '-z', '--stdin'],
                            cwd=repo, input=('\0'.join(paths) + '\0').encode(), capture_output=True)
    assert result.returncode == 0, result.stderr
    assert set(result.stdout.decode().strip('\0').split('\0')) == set(paths) - {'.env.example', 'nested/.env.example',
        'projects/_template/scene.js', 'projects/_3d-demo/scene.js', 'examples/demo/scene.js'}


@pytest.mark.parametrize('strict,waiver,expected', [(False, False, 0), (True, False, 1), (True, True, 0)])
def test_main_strict_status_includes_legacy_findings(project, monkeypatch, strict, waiver, expected):
    # Deliberately empty scene: hook/fill are ORIGINAL findings and must also make strict fail.
    class Page:
        def add_init_script(self, *args): pass
        def on(self, *args): pass
        def goto(self, *args): pass
        def wait_for_function(self, *args): pass
        def evaluate(self, js, *args):
            if js in ('window.DURATION || K.duration', 'K.duration'): return 2
            if js == '!!K.LOOK': return False
            if js.startswith('(t) =>'): return dict(items=[], covered=[], cam=[0, 0, 1])
            return []
    browser = SimpleNamespace(new_page=lambda **kw: Page(), close=lambda: None)
    monkeypatch.setattr(lint, 'sync_playwright', lambda: nullcontext(SimpleNamespace(
        chromium=SimpleNamespace(launch=lambda **kw: browser))))
    (project / 'scene.js').write_text('// empty')
    if waiver:
        (project / 'lint-ok.json').write_text(json.dumps([
            dict(kind='fill', range=[0, 2], why='empty fixture'), dict(kind='hook', t=0, why='empty fixture')]))
    monkeypatch.setattr(sys, 'argv', ['lint', str(project), '--no-sheet'] + (['--strict'] if strict else []))
    assert lint.main() == expected
    report = json.loads((project / 'out/lint.json').read_text())
    assert bool(report['unjustified']) != waiver


def test_render_warns_and_still_runs(project, monkeypatch, capsys):
    root = project / 'root'
    slug = root / 'projects/demo'
    slug.mkdir(parents=True)
    (slug / 'transcript.json').write_text('{}')
    calls = []
    monkeypatch.setattr(make, 'ROOT', root)
    monkeypatch.setattr(make, 'captions', lambda proj: calls.append('captions'))
    monkeypatch.setattr(make, 'run', lambda cmd: calls.append(cmd))
    monkeypatch.setattr(sys, 'argv', ['make', 'render', 'demo'])
    make.main()
    assert calls[0] == 'captions' and 'engine/render.py' in calls[1]
    assert 'WARNING' in capsys.readouterr().err


def _item(i, kind, txt, **kw):
    base = dict(id=i, kind=kind, txt=txt, opacity=1, label=kind == 'text', fs=40, board='1', x0=0, x1=100, y0=0, y1=10)
    return {**base, **kw}


def test_defaults_findings_digits_sizes_crowding_and_caption_echo():
    import lint
    frame = {'items': [
        _item(1, 'caption', 'السعر طلع في عشر سنين'),
        _item(2, 'text', 'طلع في عشر'),                 # echoes the caption
        _item(3, 'text', 'نسبة 10%', fs=30),             # Latin % and below 34 px
        _item(4, 'text', '٣٥'),                          # Arabic-Indic with K.DIGITS = en
        _item(5, 'text', 'المصدر: FRED', src=True, fs=26),
        _item(6, 'text', 'واحد'), _item(7, 'text', 'اتنين'),
    ]}
    kinds = sorted(h['kind'] for h in lint.defaults_findings(1.0, frame, 'en'))
    assert kinds == ['caption-repeat', 'crowded-board', 'digits', 'digits', 'small-text', 'small-text']
    ok = {'items': [_item(1, 'caption', 'السعر طلع'), _item(2, 'text', 'نسبة 10٪'), _item(3, 'text', 'السعر')]}
    assert lint.defaults_findings(1.0, ok, 'en') == []
    assert [h['why'] for h in lint.defaults_findings(1.0, {'items': [_item(1, 'text', '35')]}, 'ar')] == \
        ['digits other than K.DIGITS = ar']
