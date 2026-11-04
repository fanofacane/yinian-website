import asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).parent
async def main():
    results=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(channel='msedge',headless=True)
        for width in [360,390,768,1440,1920]:
            context=await browser.new_context(viewport={'width':width,'height':1000},has_touch=width<810,is_mobile=width<810)
            page=await context.new_page(); errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            await page.goto('http://127.0.0.1:4178',wait_until='networkidle')
            await page.wait_for_timeout(1500)
            assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth'),f'overflow {width}'
            assert await page.locator('.floating-actions > *').count()==4
            assert await page.locator('.hero-metrics p').count()==4
            assert await page.locator('.hero-metrics p').evaluate_all('els=>new Set(els.map(e=>Math.round(e.getBoundingClientRect().y))).size')==1
            assert 'Microsoft YaHei' in await page.locator('h1').evaluate('e=>getComputedStyle(e).fontFamily')
            await page.screenshot(path=str(ROOT/f'qa/chrome-home-{width}.png'))
            assert await page.locator('.floating-actions').get_attribute('aria-hidden')=='true'
            await page.locator('#benefits').evaluate('e=>scrollTo({top:e.offsetTop,behavior:"instant"})')
            await page.wait_for_timeout(500)
            if width>=1200:
                box=await page.locator('.float-phone summary').bounding_box()
                await page.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2)
                await page.wait_for_timeout(250)
                assert await page.locator('.phone-popover a').is_visible()
                await page.mouse.move(300,300)
                await page.locator('.float-wechat summary').hover()
                await page.wait_for_timeout(250)
                await page.locator('.wechat-popover img').wait_for(state='visible')
                assert (await page.locator('.wechat-popover img').bounding_box())['width']==160
                await page.screenshot(path=str(ROOT/f'qa/chrome-wechat-{width}.png'))
                await page.mouse.move(300,300)
                await page.locator('.nav-contact').click()
            else:
                await page.locator('.float-phone summary').tap()
                assert await page.locator('.phone-popover a').is_visible()
                await page.locator('.benefits .eyebrow').tap()
                await page.locator('.float-wechat summary').tap()
                await page.locator('.wechat-popover img').wait_for(state='visible')
                assert (await page.locator('.wechat-popover img').bounding_box())['width']==160
                assert await page.locator('.wechat-popover img').evaluate('e=>e.complete && e.naturalWidth>0')
                await page.locator('.benefits .eyebrow').tap()
                await page.get_by_label('在线咨询',exact=True).tap()
            assert await page.locator('dialog[open]').count()==1
            await page.get_by_label('关闭弹窗').click()
            await page.locator('footer').evaluate('e=>scrollTo({top:e.offsetTop,behavior:"instant"})')
            await page.wait_for_timeout(500)
            await page.screenshot(path=str(ROOT/f'qa/chrome-footer-{width}.png'))
            assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
            await page.get_by_label('返回顶部',exact=True).click()
            await page.wait_for_timeout(1800)
            assert await page.evaluate('scrollY')<10
            assert not errors,errors
            results.append({'width':width,'overflow':False,'metricsRow':True,'contactDialog':True,'sidebar':True,'errors':errors})
            await context.close()
        page=await browser.new_page()
        response=await page.goto('http://127.0.0.1:4178/does-not-exist',wait_until='networkidle')
        assert response.status==404
        assert await page.locator('.floating-actions > *').count()==4
        await page.get_by_label('在线咨询',exact=True).click()
        assert await page.locator('dialog[open]').count()==1
        await page.close()
        context=await browser.new_context(java_script_enabled=False)
        page=await context.new_page()
        await page.goto('http://127.0.0.1:4178')
        assert await page.locator('.hero-metrics').is_visible()
        assert await page.locator('#answer-5').evaluate('e=>e.getBoundingClientRect().height')>0
        assert await page.locator('.floating-actions').get_attribute('aria-hidden')=='true'
        assert await page.locator('.footer-phone').get_attribute('href')=='tel:4000000'
        await context.close()
        await browser.close()
    (ROOT/'qa/chrome-checks.json').write_text(json.dumps({'viewports':results,'404Sidebar':True,'noJS':True},ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(results,ensure_ascii=False))
asyncio.run(main())
