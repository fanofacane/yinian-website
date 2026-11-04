import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).parent;OUT=ROOT/'qa';OUT.mkdir(exist_ok=True)
async def main():
    results=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(channel='msedge',headless=True)
        for width,height in [(1440,1000),(390,844)]:
            page=await b.new_page(viewport={'width':width,'height':height})
            errors=[];external=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            async def restrict(route):
                if route.request.url.startswith('http://127.0.0.1:4177/'):await route.continue_()
                else:external.append(route.request.url);await route.abort()
            await page.route('**/*',restrict)
            await page.goto('http://127.0.0.1:4177/',wait_until='networkidle')
            if width<810:
                await page.get_by_role('button',name='打开菜单',exact=True).click()
                await page.screenshot(path=str(OUT/'mobile-menu.png'))
                await page.locator('.mobile-menu').get_by_role('link',name='服务体系',exact=True).click()
                await page.wait_for_timeout(900)
                assert page.url.endswith('#process')
                assert await page.get_by_role('button',name='打开菜单',exact=True).is_visible()
                await page.get_by_role('button',name='打开菜单',exact=True).click()
                await page.keyboard.press('Escape')
                assert await page.get_by_role('button',name='打开菜单',exact=True).is_visible()
            else:
                await page.get_by_role('link',name='服务产品',exact=True).click()
                await page.wait_for_timeout(900)
                assert page.url.endswith('#benefits')
            for i in range(6):
                button=page.locator('.faq-item button').nth(i)
                await button.click();await page.wait_for_timeout(400)
                assert await button.get_attribute('aria-expanded')=='true'
                assert await page.locator(f'#answer-{i} p').is_visible()
                if i==0:await page.screenshot(path=str(OUT/f'{width}-faq-open.png'))
                await button.click();await page.wait_for_timeout(400)
                assert await button.get_attribute('aria-expanded')=='false'
            await page.locator('#home').scroll_into_view_if_needed();await page.wait_for_timeout(900)
            await page.locator('.call-button').click()
            await page.get_by_label('姓名',exact=True).fill('Preview check')
            await page.get_by_label('邮箱',exact=True).fill('preview@example.com')
            await page.get_by_label('需求描述',exact=True).fill('Draft test only')
            await page.get_by_role('button',name='保存咨询草稿',exact=True).click()
            await page.get_by_role('button',name='草稿已保存',exact=True).wait_for()
            assert json.loads(await page.evaluate('localStorage.getItem("our-studio-enquiry")'))['message']=='Draft test only'
            await page.screenshot(path=str(OUT/f'{width}-contact.png'))
            await page.keyboard.press('Escape');assert not await page.locator('dialog').count()
            if width>810:
                await page.locator('.project-image.rank-0').click()
                await page.locator('dialog').wait_for();await page.screenshot(path=str(OUT/'desktop-lightbox.png'))
                await page.keyboard.press('Escape');assert not await page.locator('dialog').count()
            assert not errors and not external,(errors,external)
            results.append({'width':width,'menuOrNavigation':True,'faqToggles':6,'contactDraft':True,'dialogEscape':True,'gallery':width>810,'pageErrors':errors,'external':external})
            await page.close()
        await b.close()
    (OUT/'interactions.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    print(json.dumps(results,indent=2))
asyncio.run(main())
