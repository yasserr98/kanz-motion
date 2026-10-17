"""Behavioral regression checks in one Chromium; --original proves the checks catch HEAD's defects."""
import argparse
import subprocess
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ["kanz.js", "kanz-look.js", "kanz-pace.js", "kanz-footage.js", "kanz-snap.js"]
HTML = """<style>
#stage{position:relative;width:1080px;height:1920px} #world{position:absolute;transform-origin:0 0}
.board{position:absolute;width:1000px;height:860px} .obj,.abs{position:absolute}
</style><div id="stage"><div id="world"></div><div id="headline"></div>
<div id="captions"></div><div id="overlay"></div><div id="grain"></div></div>"""
SETUP = """() => {
  window.check = (ok, message) => { if (!ok) throw Error(message); };
  window.near = (a, b) => Math.abs(a - b) < 0.001;
  const c = document.createElement('canvas'); c.width = c.height = 100;
  c.getContext('2d').fillRect(0, 0, 100, 100); window.pic = c.toDataURL();
  K.look(); K.pace({keep:false}); K.duration = 12;
  window.a = K.board('a', 0, 0); window.b = K.board('b', 1100, 0); K.cam(0, 'a');
}"""

CHECKS = {
    "camera overlap warning": """() => {
      K.cam(1, 'a', {dur:1}); K.push(1.5, 'b', 1.1, 1); K.cam(2.5, 'a');
      check(K.warnings?.length === 1 && K.warnings[0].includes('[1, 2]') && K.warnings[0].includes('[1.5, 2.5]'), 'missing interval warning');
    }""",
    "deferred focus excludes drift": """() => {
      const doc = K.el('div', '', a);
      Object.assign(doc, {_k:0, _pending:[], _o:{x:500,y:400,w:600}, _pad:16});
      K.docFocus(2, doc, 50, 60, 1.4, 1); K.cam(6, 'b'); K.finish();
      doc._k = 2; doc._h = 800; doc._pending.splice(0).forEach(f => f());
      const world = document.getElementById('world');
      const drifts = K.tl.getChildren().filter(t => t.targets().includes(world) && t.vars.ease === 'none');
      check(drifts.length > 0 && drifts.every(t => t.startTime() >= 3 || t.endTime() <= 2), 'drift crosses focus');
      const times = [0,1.5,2.5,3.5,5,7], states = times.map(t => { K.seek(t); return world.style.transform; });
      [5,2,0,4,1,3].forEach(i => { K.seek(times[i]); check(world.style.transform === states[i], 'focus seek history'); });
    }""",
    "carried and repeated poses follow logical object": """async () => {
      const root = K.img(a, pic, {x:400,y:400,w:200,glow:true,shadow:true});
      K.carry(root, 'b', 1, {x:300,y:450,w:100});
      const n = K.swap(root, pic, 2, {pop:false}), n2 = K.swap(n, pic, 3, {pop:false});
      const n3 = K.swap(root, pic, 4, {pop:false}); K.dim(root, 5, .4); K.out(root,6);
      await Promise.all(Array.from(document.images).map(i => i.decode()));
      for (const [t, active] of [[2.5,n],[4.5,n3],[.5,root],[3.5,n2],[5.5,n3],[2.5,n]]) {
        K.seek(t);
        check([root,n,n2,n3].filter(e => getComputedStyle(e).visibility !== 'hidden').length === 1, 'multiple or missing poses');
        check(getComputedStyle(active).visibility === 'visible', 'wrong active pose');
        for (const p of ['x','y','scaleX','scaleY','rotation','opacity']) check(near(gsap.getProperty(active,p), gsap.getProperty(root,p)), 'pose lost '+p);
        check(parseFloat(a.querySelector('.kglow').style.opacity) > 0, 'glow follows hidden pose');
        check(near(new DOMMatrix(a.querySelector('.kglow').style.transform).m41,gsap.getProperty(root,'x')), 'glow lost position');
        check(parseFloat(a.querySelector('.kshadow').style.opacity) > 0, 'shadow follows hidden pose');
      }
      K.seek(7); check(gsap.getProperty(n3,'opacity')===0,'logical out lost');
      K.seek(2.5); check(getComputedStyle(n).visibility==='visible','out rewind hides active pose');
    }""",
    "overlapping screens and world rewind": """async () => {
      K.screen(pic,1,4,{dark:.6}); K.screen(pic,3,6,{dark:.6});
      K.world(2, 'paper'); K.world(7, 'charcoal');
      await Promise.all(Array.from(document.images).map(i=>i.decode()));
      for (const t of [5,0,3.5,6,1,4,8,0]) {
        K.seek(t); check(document.getElementById('stage').dataset.screen === (t>=1 && t<6?'on':'off'), 'screen interval union');
        check(document.getElementById('stage').dataset.world === (t>=2.3 && t<7.3?'paper':'charcoal'), 'world rewind');
      }
    }""",
    "crop position and Ken Burns union": """async () => {
      const c = document.createElement('canvas'); c.width=400; c.height=100;
      const g=c.getContext('2d'); g.fillRect(0,0,400,100); g.fillStyle='white'; g.fillRect(0,0,65,100);
      const src=c.toDataURL(), left=K.screen(src,1,2,{pos:'left center'}), right=K.screen(src,3,4,{pos:'right center'});
      const d=document.createElement('canvas'); d.width=108; d.height=192;
      const h=d.getContext('2d'); h.fillRect(0,0,108,192); h.fillStyle='white'; h.fillRect(0,65,108,25);
      const normal=K.screen(d.toDataURL(),5,6,{kb:1.02}), zoom=K.screen(d.toDataURL(),7,8,{kb:2});
      await Promise.all(Array.from(document.images).map(i=>i.decode()));
      check(parseFloat(left.dataset.lift) > parseFloat(right.dataset.lift)+.1, 'object-position ignored');
      check(parseFloat(zoom.dataset.lift) > parseFloat(normal.dataset.lift)+.1, 'zoomed band ignored');
    }""",
    "later snap wins and pointer reappears": """() => {
      K.snap(1,1.2,2); K.snap(2,1.4,2); const p=K.pointer(a);
      p.to(1,100,100,80).out(2).to(3,300,300,100);
      for (const [t,s] of [[3.5,1.4],[0,1],[1.5,1.2],[4.5,1],[2.5,1.4],[3.5,1.4]]) {
        K.seek(t); check(near(gsap.getProperty(document.getElementById('camwrap'),'scaleX'),s), 'snap reset early');
        if(t===3.5) check(getComputedStyle(p.el).visibility==='visible' && near(gsap.getProperty(p.el,'opacity'),1),'pointer stays hidden');
      }
    }""",
    "pointer out then to": """() => {
      const p=K.pointer(a);p.to(1,100,100,80).out(2).to(3,200,200,100).out(4).to(5,300,300,120);
      for(const t of [5.5,2.5,3.5,0,1.5,4.5,3.5]) {
        K.seek(t);const visible=getComputedStyle(p.el).visibility==='visible';
        check(visible===[1.5,3.5,5.5].includes(t),'pointer visibility at '+t);
      }
    }""",
    "world and carry initial states rewind": """() => {
      const e=K.img(a,pic,{x:400,y:400,w:100,shadow:false});
      K.carry(e,'b',2,{x:300,y:300});K.world(3,'paper');K.world(7,'charcoal');
      K.seek(0);const z=getComputedStyle(a).zIndex;
      K.seek(4);check(document.getElementById('stage').dataset.world==='paper','paper missing');
      K.seek(8);K.seek(0);
      check(document.getElementById('stage').dataset.world==='charcoal','world initial attribute missing');
      check(getComputedStyle(a).zIndex===z,'carry initial stacking lost');
    }""",
    "footage duplicates, stale completion, failure and retry": """async () => {
      const requests=[], drawn=[], closed=[];
      window.XMLHttpRequest = class {
        open(method,url){this.url=url;} send(){requests.push(this);} status=200;
      };
      window.createImageBitmap = async b => { if(b.bad) throw Error('bad JPEG'); return {i:b.i,close(){closed.push(b.i);}}; };
      const draw0=CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage=function(b){drawn.push(b.i);};
      K.footage({dir:'test',n:1000,windows:[[0,8]],sfx:false});
      const finish=(r,i)=>{r.response={i};r.onload();};
      const p=K.seek(1), duplicate=K.seek(1); check(p===duplicate,'duplicate did not return pending promise');
      const newer=K.seek(2); finish(requests[1],49); await newer; finish(requests[0],25); await p;
      check(drawn.join(',')==='49' && closed.length===2,'stale frame drew or bitmap leaked');
      const failed=K.seek(3); requests[2].status=404; finish(requests[2],73);
      check(await failed.then(()=>false,()=>true),'load failure resolved');
      const retry=K.seek(3); check(requests.length===4,'failed frame not retried');finish(requests[3],73);await retry;
      const decode=K.seek(4); requests[4].response={bad:true};requests[4].onload();
      check(await decode.then(()=>false,()=>true),'decode failure resolved');
      const stale=K.seek(5);K.seek(9);finish(requests[5],121);await stale;
      check(drawn.join(',')==='49,73','hidden completion drew');
      const old=K.seek(1); K.seek(3); finish(requests[6],25);await old;
      check(drawn.join(',')==='49,73','displayed-frame seek failed to invalidate pending draw');
      const network=K.seek(6);requests[7].onerror();check(await network.then(()=>false,()=>true),'network failure resolved');
      const networkRetry=K.seek(6);finish(requests[8],145);await networkRetry;
      check(drawn.at(-1)===145,'network failure not retried');
      CanvasRenderingContext2D.prototype.drawImage=draw0;
    }""",
    "cut and transition preserve guard transform": """() => {
      const w=document.getElementById('camwrap'); w.style.translate='12px 0px';w.style.scale='.9';
      K.footage({dir:'test',n:1,windows:[[0,2]],xstyle:window.testStyle,sfx:false});
      K.seek(2.05);
      check(w.style.translate==='12px' || w.style.translate==='12px 0px','guard translation erased');
      check(w.style.scale==='0.9','guard scale erased');
      if(window.testStyle!=='cut') check(w.parentElement!==document.getElementById('stage'),'transition missing separate layer');
    }""",
}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--original', action='store_true')
    args = ap.parse_args()
    source = {name: subprocess.check_output(['git','show',f'HEAD:runtime/{name}']).decode('utf-8')
              if args.original else (ROOT/'runtime'/name).read_text(encoding='utf-8') for name in SCRIPTS}
    failures = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            for name, code in CHECKS.items():
                for style in (['cut','whip','zoom','glitch'] if name.startswith('cut and') else ['cut']):
                    page = browser.new_page()
                    try:
                        page.set_content(HTML)
                        page.add_script_tag(path=ROOT/'node_modules/gsap/dist/gsap.min.js')
                        for script in SCRIPTS:
                            page.add_script_tag(content=source[script])
                        page.evaluate(SETUP)
                        page.evaluate('s=>window.testStyle=s',style)
                        page.evaluate(code)
                        print('PASS',name,style,flush=True)
                    except Exception as e:
                        failures.append(name+' '+style)
                        print('FAIL',name,style,str(e).splitlines()[0],flush=True)
                    finally:
                        page.close()
        finally:
            browser.close()
    return bool(failures)


if __name__ == '__main__':
    raise SystemExit(main())
