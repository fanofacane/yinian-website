import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

folder=Path(__file__).parent
stage=sys.argv[1]
result={}
with sync_playwright() as p:
    browser=p.chromium.launch(channel='msedge',headless=True)
    for width in [390,1024,1440,1920]:
        page=browser.new_page(viewport={'width':width,'height':1000},reduced_motion='reduce')
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.goto('http://127.0.0.1:4178/',wait_until='networkidle')
        page.wait_for_timeout(300)
        result[str(width)]=page.evaluate('''() => Object.fromEntries(['.hero-layout','.navigation','.client-strip-inner','#benefits','#process','#reviews','#faqs'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return [s,{x:r.x,y:r.y,width:r.width,height:r.height}]}))''')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert not errors,errors
        if width>=1440:
            page.screenshot(path=str(folder/f'hero-width-{stage}-{width}.png'))
        page.close()
    browser.close()
(folder/f'hero-width-{stage}.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
if stage=='after':
    before=json.loads((folder/'hero-width-before.json').read_text())
    for width,sections in result.items():
        for selector,rect in sections.items():
            if selector=='.hero-layout' and int(width)>=1200:
                assert rect['width']>before[width][selector]['width']
                assert rect['height']==before[width][selector]['height']
            else:
                assert rect==before[width][selector],(width,selector,rect,before[width][selector])
print(json.dumps({width:sections['.hero-layout'] for width,sections in result.items()},indent=2))
