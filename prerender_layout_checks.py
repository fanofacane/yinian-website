import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).parent
async def main():
    results=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(channel='msedge',headless=True)
        for width in [360,390,768,1440,1920]:
            page=await browser.new_page(viewport={'width':width,'height':900})
            errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            await page.goto('http://127.0.0.1:4178',wait_until='networkidle')
            await page.evaluate('document.fonts.ready');await page.wait_for_timeout(2000)
            assert await page.locator('html').get_attribute('data-interactive')=='true'
            assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
            assert await page.locator('footer').count()==0
            assert await page.locator('main > section').evaluate_all('es=>es.map(e=>e.id)')==['home','benefits','process','reviews','faqs']
            await page.screenshot(path=str(ROOT/f'qa/prerender-home-{width}.png'))
            if width>=810:
                await page.locator('.project-image.rank-0').click()
                assert await page.locator('dialog').is_visible()
                assert await page.locator('dialog img').evaluate('e=>e.complete && e.naturalWidth>0')
                await page.keyboard.press('Escape')
                assert await page.locator('dialog').count()==0
            assert not errors,errors
            results.append({'width':width,'overflow':False,'hydrated':True,'errors':errors,'galleryDialog':width>=810})
            await page.close()
        await browser.close()
    (ROOT/'qa/prerender-layout-checks.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    print(json.dumps(results))
asyncio.run(main())
