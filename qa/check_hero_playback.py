import json
from pathlib import Path
from playwright.sync_api import sync_playwright

folder=Path(__file__).parent
result={}
with sync_playwright() as p:
    browser=p.chromium.launch(channel='msedge',headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1000})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:4178/',wait_until='domcontentloaded')
    page.wait_for_timeout(650)
    early=page.locator('.hero-metrics strong > span').all_text_contents()
    page.wait_for_timeout(2200)
    final=page.locator('.hero-metrics strong > span').all_text_contents()
    assert final==['150+','50%+','98%+','130+'],final
    assert early!=final,early
    names=[]
    for i in range(5):
        names.append(page.locator('.project-image.rank-0').get_attribute('href'))
        if i<4: page.wait_for_timeout(4050)
    assert len(set(names[:4]))==4,names
    assert names[0]==names[4],names
    page.locator('.project-image.rank-0').hover()
    paused=page.locator('.project-image.rank-0').get_attribute('href')
    page.wait_for_timeout(4200)
    assert paused==page.locator('.project-image.rank-0').get_attribute('href')
    page.locator('.project-image.rank-0').click()
    assert page.locator('.project-dialog').is_visible()
    page.keyboard.press('Escape')
    assert not page.locator('.project-dialog').count()
    assert not errors,errors
    result['animation']={'early':early,'final':final,'fourImageCycle':True,'hoverPause':True,'imageDialog':True,'errors':errors}
    page.close()
    before=json.loads((folder/'hero-width-before.json').read_text())
    for width in [390,1024,1440,1920]:
        page=browser.new_page(viewport={'width':width,'height':1000},reduced_motion='reduce')
        page.goto('http://127.0.0.1:4178/',wait_until='networkidle')
        rects=page.evaluate('''() => Object.fromEntries(['.hero-layout','.navigation','.client-strip-inner','#benefits','#process','#reviews','#faqs'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return [s,{x:r.x,y:r.y,width:r.width,height:r.height}]}))''')
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        for selector,rect in rects.items():
            if selector!='.hero-layout': assert rect==before[str(width)][selector],(width,selector,rect,before[str(width)][selector])
        assert page.locator('.hero-metrics strong > span').all_text_contents()==final
        assert rects['.hero-layout']['x']=={390:20,1024:24,1440:83,1920:155}[width]
        page.screenshot(path=str(folder/f'hero-playback-{width}.png'))
        if width==1440:
            first=page.locator('.rank-0').get_attribute('href')
            page.wait_for_timeout(4300)
            assert page.locator('.rank-0').get_attribute('href')==first
        result[str(width)]=rects['.hero-layout']
        page.close()
    page=browser.new_page(java_script_enabled=False)
    page.goto('http://127.0.0.1:4178/')
    assert page.locator('.hero-metrics strong > span').all_text_contents()==final
    assert page.locator('.project-image').count()==4
    result['noJS']='final values and all four image links present'
    browser.close()
(folder/'hero-playback-checks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
