import asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).parent

async def sample(element):
    return await element.evaluate('''e => {
      const css = getComputedStyle(e), matrix = new DOMMatrixReadOnly(css.transform);
      return {y:matrix.m42, opacity:Number(css.opacity)};
    }''')

async def main():
    results=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(channel='msedge',headless=True)
        for width in [1440,390]:
            for name,port,selector in [('source',4173,'.framer-193i921'),('combined',4177,'#benefits .section-heading')]:
                page=await browser.new_page(viewport={'width':width,'height':700})
                errors=[]
                page.on('pageerror',lambda e:errors.append(str(e)))
                await page.goto(f'http://127.0.0.1:{port}/',wait_until='networkidle')
                element=page.locator(selector)
                await element.wait_for(state='attached')
                await page.wait_for_timeout(1300)
                before=await sample(element)
                await element.evaluate('e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-300,behavior:"instant"})')
                await page.wait_for_timeout(100)
                during=await sample(element)
                await page.wait_for_timeout(1200)
                after=await sample(element)
                await page.evaluate('window.scrollTo({top:0,behavior:"instant"})')
                await page.wait_for_timeout(1300)
                reset=await sample(element)
                assert abs(before['y']-64)<1,(name,width,before)
                assert 0<during['y']<64,(name,width,during)
                assert abs(after['y'])<.1,(name,width,after)
                assert abs(reset['y']-64)<1,(name,width,reset)
                assert all(abs(item['opacity']-1)<.001 for item in [before,during,after,reset])
                if name=='combined':
                    await page.emulate_media(reduced_motion='reduce')
                    await page.wait_for_timeout(100)
                    assert (await sample(element))['y']==0
                    assert not errors,errors
                results.append({'site':name,'width':width,'before':before,'during':during,'after':after,'reset':reset})
                await page.close()
        await browser.close()
    (ROOT/'qa/benefits-heading-motion.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    print(json.dumps(results,indent=2))

asyncio.run(main())
