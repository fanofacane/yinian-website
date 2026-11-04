import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).parent

async def main():
    results=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(channel='msedge',headless=True)
        for width in [1440,390,768,1024,1920]:
            page=await browser.new_page(viewport={'width':width,'height':1000})
            errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            import os
            await page.goto(os.environ.get('PREVIEW_URL','http://127.0.0.1:4177')+'/',wait_until='networkidle')
            await page.locator('.process-step').first.wait_for(state='attached')
            await page.evaluate('document.fonts.ready')
            card=page.locator('.process-step').nth(2)
            async def place(top):
                await card.evaluate('(e,top)=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-top,behavior:"instant"})',top)
            async def state():
                return await card.evaluate('''e=>{const s=e.querySelector('.process-card'),i=e.querySelector('.step-icon');return {active:e.classList.contains('is-active'),opacity:Number(getComputedStyle(s).opacity),iconOpacity:Number(getComputedStyle(i).opacity),gap:getComputedStyle(s).gap,padding:getComputedStyle(s).padding}}''')
            await place(520);await page.wait_for_timeout(1300)
            # Earlier cards can change height on phones; re-align the measured third card.
            await place(520);await page.wait_for_timeout(300)
            before=await state();assert not before['active'] and abs(before['opacity']-.8)<.001,before
            await place(480);await page.wait_for_timeout(100)
            during=await state();assert during['active'] and .8<during['opacity']<1,during
            assert during['iconOpacity']==1,during
            await page.wait_for_timeout(1200)
            after=await state();assert abs(after['opacity']-1)<.001,after
            shape=await page.locator('.process-timeline').evaluate('''e=>{const r=e.getBoundingClientRect(),first=e.querySelector('.process-step'),f=first.getBoundingClientRect(),icon=first.querySelector('.step-icon').getBoundingClientRect(),track=e.querySelector('.process-track').getBoundingClientRect();return {width:r.width,iconSize:icon.width,iconOffset:[icon.left-f.left,icon.top-f.top],trackStart:track.top-r.top,trackWidth:track.width,gap:getComputedStyle(e).gap,font:getComputedStyle(first.querySelector('p')).fontFamily,overflow:document.documentElement.scrollWidth>innerWidth}}''')
            assert shape['iconSize']==40 and shape['iconOffset']==[24,24],shape
            assert abs(shape['trackStart']-59)<.1 and shape['trackWidth']==2,shape
            assert after['padding']=='24px 24px 24px 88px',after
            assert not shape['overflow'] and 'Switzer' in shape['font'],shape
            if width<810: assert after['gap']=='4px' and shape['gap']=='8px',(after,shape)
            if width==1440: assert shape['width']==576,shape
            a=await page.locator('.process-timeline').evaluate('e=>Number(e.style.getPropertyValue("--progress"))')
            await place(460);await page.wait_for_timeout(150)
            b=await page.locator('.process-timeline').evaluate('e=>Number(e.style.getPropertyValue("--progress"))')
            assert b>a,(a,b)
            await page.screenshot(path=str(ROOT/f'qa/process-corrected-{width}.png'))
            await place(520);await page.wait_for_timeout(1400)
            reverse=await state();assert not reverse['active'] and abs(reverse['opacity']-.8)<.001,reverse
            await page.emulate_media(reduced_motion='reduce');await place(480);await page.wait_for_timeout(100)
            assert abs((await state())['opacity']-1)<.001
            await page.locator('.process-step').last.evaluate('(e)=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-480,behavior:"instant"})');await page.wait_for_timeout(300)
            assert await page.locator('.process-step.is-active').count()==5
            assert not errors,errors
            results.append({'width':width,'before':before,'during':during,'after':after,'reverse':reverse,'shape':shape,'progress':[a,b],'errors':errors})
            await page.close()
        await browser.close()
    (ROOT/'qa/process-checks.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    print(json.dumps(results,indent=2))
asyncio.run(main())
