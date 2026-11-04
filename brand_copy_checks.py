import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).parent
COPY=json.loads((ROOT/'site/src/brand-content.json').read_text(encoding='utf-8'))
async def main():
    results=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(channel='msedge',headless=True)
        for width in [360,390,768,1440,1920]:
            page=await browser.new_page(viewport={'width':width,'height':1000})
            errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
            response=await page.goto('http://127.0.0.1:4178',wait_until='networkidle')
            raw=await response.text();assert '一念智能' in raw and COPY['faqs'][-1]['answer'] in raw
            await page.evaluate('document.fonts.ready');await page.wait_for_timeout(2200)
            assert await page.locator('html').get_attribute('lang')=='zh-CN'
            assert '一念智能' in await page.title()
            assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
            assert await page.locator('main>section').count()==5
            assert await page.locator('.benefit-card').count()==3
            assert await page.locator('.process-step').count()==5
            assert await page.locator('.review-card').count()==6
            assert await page.locator('.faq-item').count()==6
            assert await page.locator('footer').count()==1
            names=await page.locator('.logo-group').first.inner_text()
            assert all(name in names for name in COPY['clientNames'])
            reviews=await page.locator('.review-card>p').all_text_contents()
            assert reviews[0]==reviews[4] and reviews[1]==reviews[5]
            await page.screenshot(path=str(ROOT/f'qa/brand-home-{width}.png'))
            # Scroll each retained section into view before the full-page capture.
            for selector in ['#benefits','#process','#reviews','#faqs']:
                await page.locator(selector).evaluate('e=>window.scrollTo({top:e.offsetTop,behavior:"instant"})')
                await page.wait_for_timeout(1500)
            for i in range(6):
                button=page.locator('.faq-item button').nth(i)
                await button.click();await page.wait_for_timeout(1100)
                assert await button.get_attribute('aria-expanded')=='true'
                assert await page.locator(f'#answer-{i}').evaluate('e=>e.getBoundingClientRect().height')>20
                await button.click();await page.wait_for_timeout(1000)
                assert await page.locator(f'#answer-{i}').evaluate('e=>e.getBoundingClientRect().height')==0
            await page.screenshot(path=str(ROOT/f'qa/brand-page-{width}.png'),full_page=True)
            assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
            assert not errors,errors
            results.append({'width':width,'sections':5,'products':3,'services':5,'reviews':6,'faqs':6,'overflow':False,'errors':errors})
            await page.close()
        page=await browser.new_page(java_script_enabled=False,viewport={'width':390,'height':844})
        await page.goto('http://127.0.0.1:4178',wait_until='networkidle')
        for i in range(6):
            assert await page.locator(f'#answer-{i}').evaluate('e=>e.getBoundingClientRect().height')>20
        assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
        results.append({'noJS':'all six answers readable'})
        response=await page.goto('http://127.0.0.1:4178/missing')
        assert response.status==404 and '页面未找到' in await page.locator('h1').inner_text()
        await browser.close()
    (ROOT/'qa/brand-copy-checks.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(results,ensure_ascii=False))
asyncio.run(main())
