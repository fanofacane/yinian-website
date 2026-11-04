import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).parent

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(channel='msedge',headless=True)
        page=await browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1)
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        import os
        await page.goto(os.environ.get('PREVIEW_URL','http://127.0.0.1:4177')+'/',wait_until='networkidle')
        await page.locator('h1').wait_for();await page.wait_for_timeout(2000)
        assert await page.evaluate('matchMedia("(pointer:coarse)").matches')
        await page.get_by_role('button',name='打开菜单',exact=True).tap();await page.wait_for_timeout(450)
        await page.locator('.mobile-menu').get_by_role('link',name='服务产品',exact=True).tap()
        await page.wait_for_timeout(1200)
        panel=page.locator('.framer-yblgmn');await panel.scroll_into_view_if_needed();await page.wait_for_timeout(1900)
        box=await panel.bounding_box();x=box['x']+25;y=box['y']+25
        cdp=await page.context.new_cdp_session(page)
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
        for i in range(1,9):
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x+45*i/8,'y':y+25*i/8}]})
            await page.wait_for_timeout(20)
        moved=await panel.evaluate('e=>{const m=new DOMMatrixReadOnly(getComputedStyle(e).transform);return [m.m41,m.m42]}')
        assert abs(moved[0]-45)<2 and abs(moved[1]-25)<2,moved
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await page.wait_for_timeout(1200)
        settled=await panel.evaluate('e=>{const m=new DOMMatrixReadOnly(getComputedStyle(e).transform);return [m.m41,m.m42]}')
        assert abs(settled[0])<.1 and abs(settled[1])<.1,settled
        grid=page.locator('.review-grid');await grid.scroll_into_view_if_needed();await page.wait_for_timeout(500)
        box=await grid.bounding_box();x=box['x']+270;y=box['y']+130
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
        for i in range(1,13):
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x-220*i/12,'y':y}]})
            await page.wait_for_timeout(25)
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await page.wait_for_timeout(600)
        horizontal=await grid.evaluate('e=>e.scrollLeft')
        assert horizontal>150,horizontal
        question=page.locator('.faq-item button').first;await question.tap();await page.wait_for_timeout(800)
        assert await question.get_attribute('aria-expanded')=='true'
        assert await page.locator('.follow-cursor').evaluate('e=>getComputedStyle(e).opacity')=='0'
        assert not errors,errors
        result={'touchPointer':'coarse','menuAnchor':True,'drag':moved,'release':settled,'reviewTouchScroll':horizontal,'faqTap':True,'cursorHidden':True,'errors':errors}
        (ROOT/'qa/touch-checks.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
        print(json.dumps(result));await browser.close()
asyncio.run(main())
