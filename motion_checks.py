import asyncio, json, os
BASE = os.environ.get('PREVIEW_URL', 'http://127.0.0.1:4177').rstrip('/')
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).parent
OUT = ROOT / 'qa'

async def position(locator):
    return await locator.evaluate('e => { const m=new DOMMatrixReadOnly(getComputedStyle(e).transform);return [m.m41,m.m42] }')

async def scroll(page, y):
    await page.evaluate('(y)=>window.scrollTo({top:y,behavior:"instant"})', y)
    await page.wait_for_timeout(250)

async def main():
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel='msedge', headless=True)
        for width, height in [(1440,1000),(390,844)]:
            page = await browser.new_page(viewport={'width':width,'height':height})
            errors = []; external = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            async def restrict(route):
                if route.request.url.startswith(BASE+'/'): await route.continue_()
                else: external.append(route.request.url); await route.abort()
            await page.route('**/*', restrict)
            await page.goto(BASE, wait_until='networkidle')
            await page.locator('h1').wait_for(); await page.evaluate('document.fonts.ready')
            await page.wait_for_timeout(2100)
            assert await page.locator('.hero-description').evaluate('e=>getComputedStyle(e).opacity') == '1'
            assert 'lenis' in await page.locator('html').get_attribute('class')
            await page.mouse.move(width/2, height/2)
            await page.mouse.wheel(0, 300); await page.wait_for_timeout(60)
            intermediate = await page.evaluate('scrollY')
            await page.wait_for_timeout(1100)
            end = await page.evaluate('scrollY')
            assert 0 < intermediate < end and abs(end-300)<5, (intermediate,end)
            await scroll(page,0)
            assert 'is-floating' not in await page.locator('.site-header').get_attribute('class')
            await scroll(page,200)
            nav = await page.locator('.navigation').bounding_box()
            assert abs(nav['y']-16)<2 and abs(nav['height']-52)<2,nav
            await page.screenshot(path=str(OUT/f'motion-{width}-floating.png'))
            if width<1200:
                await page.get_by_role('button',name='打开菜单',exact=True).click()
                await page.wait_for_timeout(500)
                menu = await page.locator('.mobile-menu').bounding_box()
                assert menu['height']==height and menu['width']==width,menu
                before=await page.evaluate('scrollY'); await page.mouse.wheel(0,400);await page.wait_for_timeout(300)
                assert before==await page.evaluate('scrollY')
                await page.screenshot(path=str(OUT/'motion-mobile-menu.png'))
                await page.locator('.mobile-menu').get_by_role('link',name='服务体系',exact=True).click()
                await page.wait_for_timeout(1200)
                assert page.url.endswith('#process')
                assert await page.locator('.mobile-menu').get_attribute('aria-hidden')=='true'
            else:
                await page.mouse.move(300,300);await page.wait_for_timeout(900)
                cursor=await page.locator('.follow-cursor').bounding_box()
                assert abs(cursor['x']-300)<2 and abs(cursor['y']-308)<2,cursor
            # All four source drag targets: measurable displacement and return to origin.
            drags=[]
            for selector in ['.framer-yblgmn','.framer-jotx7o','.framer-3maobj','.framer-84k9bb']:
                element=page.locator('.benefit-art').locator(selector)
                await element.scroll_into_view_if_needed();await page.wait_for_timeout(2100)
                box=await element.bounding_box()
                # Art is intentionally clipped by its card; use a point within both rectangles.
                host=await element.evaluate('e=>e.getRootNode().host.getBoundingClientRect().toJSON()')
                x=(max(box['x'],host['left'])+min(box['x']+box['width'],host['right']))/2
                y=(max(box['y'],host['top'])+min(box['y']+box['height'],host['bottom']))/2
                await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+45,y+25,steps=8)
                moved=await position(element)
                await page.mouse.up();await page.wait_for_timeout(1200)
                settled=await position(element)
                assert abs(moved[0]-45)<2 and abs(moved[1]-25)<2,(selector,moved)
                assert abs(settled[0])<.1 and abs(settled[1])<.1,(selector,settled)
                drags.append({'target':selector,'drag':moved,'release':settled})
            # Track is continuous even while the number of active cards stays constant.
            top=await page.locator('.process-timeline').evaluate('e=>e.getBoundingClientRect().top+scrollY')
            await scroll(page,top-height/2+70)
            a=await page.locator('.process-timeline').evaluate('e=>Number(e.style.getPropertyValue("--progress"))')
            active1=await page.locator('.process-step.is-active').count()
            await scroll(page,top-height/2+90)
            z=await page.locator('.process-timeline').evaluate('e=>Number(e.style.getPropertyValue("--progress"))')
            active2=await page.locator('.process-step.is-active').count()
            assert z>a and active1==active2,(a,z,active1,active2)
            # FAQ content and state persist independently, with reversible height animation.
            for i in range(6):
                button=page.locator('.faq-item button').nth(i)
                await button.click();await page.wait_for_timeout(800)
                assert await button.get_attribute('aria-expanded')=='true'
                assert await page.locator(f'#answer-{i}').evaluate('e=>e.getBoundingClientRect().height')>20
            for i in range(6):
                button=page.locator('.faq-item button').nth(i)
                await button.click();await page.wait_for_timeout(800)
                assert await page.locator(f'#answer-{i}').evaluate('e=>e.getBoundingClientRect().height')<.1
            if width<768:
                grid=page.locator('.review-grid');await grid.scroll_into_view_if_needed();await grid.hover()
                await page.mouse.wheel(330,0);await page.wait_for_timeout(500)
                assert await grid.evaluate('e=>e.scrollLeft')>200
                assert await grid.evaluate('e=>getComputedStyle(e).scrollSnapType')=='none'
            await scroll(page,0);await page.wait_for_timeout(500)
            ticker=page.locator('.logo-track');await page.locator('.logo-window').scroll_into_view_if_needed()
            await page.wait_for_timeout(200)
            before=(await position(ticker))[0];await page.wait_for_timeout(500);after=(await position(ticker))[0]
            period=await page.locator('.logo-group').nth(1).evaluate('e=>e.offsetLeft')
            distance=(before-after)%period
            assert 40<distance<65,(before,after,period,distance)
            window=page.locator('.logo-window');box=await window.bounding_box()
            await page.mouse.move(box['x']+box['width']/2,box['y']+16);await page.mouse.down()
            before=(await position(ticker))[0]
            await page.mouse.move(box['x']+box['width']/2+70,box['y']+16,steps=8)
            after=(await position(ticker))[0]
            assert abs((after-before)%period-70)<2,(before,after,period)
            await page.mouse.up()
            await page.locator('.call-button').click()
            await page.get_by_label('姓名',exact=True).fill('Preview')
            await page.get_by_label('邮箱',exact=True).fill('preview@example.com')
            await page.get_by_label('需求描述',exact=True).fill('Motion regression check')
            await page.get_by_role('button',name='保存咨询草稿',exact=True).click()
            assert await page.get_by_role('button',name='草稿已保存',exact=True).is_visible()
            before=await page.evaluate('scrollY');await page.mouse.wheel(0,300);await page.wait_for_timeout(300)
            assert before==await page.evaluate('scrollY')
            await page.keyboard.press('Escape');assert await page.locator('dialog').count()==0
            await page.emulate_media(reduced_motion='reduce');await page.wait_for_timeout(300)
            assert 'lenis' not in (await page.locator('html').get_attribute('class') or '')
            before=await position(ticker);await page.wait_for_timeout(350);after=await position(ticker)
            assert before==after,(before,after)
            assert not errors and not external,(errors,external)
            result={'width':width,'wheelIntermediate':intermediate,'wheelEnd':end,'nav':nav,'dragTargets':drags,'continuousProcess':[a,z],'faqToggles':12,'tickerPixelsInHalfSecond':distance,'reducedMotion':True,'errors':errors,'external':external}
            results.append(result);print(json.dumps(result),flush=True)
            await page.close()
        await browser.close()
    (OUT/'motion-checks.json').write_text(json.dumps(results,indent=2),encoding='utf-8')

asyncio.run(main())
