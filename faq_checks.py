import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).parent
async def main():
    results=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(channel='msedge',headless=True)
        for width in [1440,390,768,1024,1920]:
            page=await browser.new_page(viewport={'width':width,'height':900})
            errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            import os
            await page.goto(os.environ.get('PREVIEW_URL','http://127.0.0.1:4177')+'/',wait_until='networkidle')
            await page.evaluate('document.fonts.ready')
            heading=page.locator('#faqs .section-heading');first=page.locator('.faq-item').first
            async def motion(el):
                return await el.evaluate('e=>{let c=getComputedStyle(e);return {y:new DOMMatrixReadOnly(c.transform).m42,opacity:Number(c.opacity)}}')
            before=await motion(heading);item_before=await motion(first)
            assert before['y']==64 and before['opacity']==0,before
            assert item_before['y']==96 and item_before['opacity']==0,item_before
            await heading.evaluate('e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-500,behavior:"instant"})')
            await page.wait_for_timeout(1500)
            assert (await motion(heading))=={'y':0,'opacity':1}
            await first.locator('button').scroll_into_view_if_needed();await page.wait_for_timeout(1300)
            layout=await page.locator('#faqs').evaluate('''e=>{let list=e.querySelector('.faq-list'),item=e.querySelector('.faq-item'),b=item.querySelector('button'),h=e.querySelector('.section-heading'),c=getComputedStyle(b);return {width:list.getBoundingClientRect().width,gap:getComputedStyle(list).gap,padding:c.padding,line:c.lineHeight,font:c.fontFamily,itemHeight:item.getBoundingClientRect().height,radius:getComputedStyle(item).borderRadius,align:getComputedStyle(h).textAlign,overflow:document.documentElement.scrollWidth>innerWidth}}''')
            assert layout['width']==min(768,width-(32 if width<810 else 48)),layout
            assert layout['gap']==('12px' if width>=1200 else '8px'),layout
            assert layout['padding']=='24px' and layout['line']=='24px' and layout['radius']=='16px',layout
            assert layout['align']==('left' if width<810 else 'center'),layout
            assert not layout['overflow'] and 'Switzer' in layout['font'],layout
            answer=first.locator('.faq-answer');icon=first.locator('.faq-icon svg')
            async def state():
                return await first.evaluate('''e=>{const a=e.querySelector('.faq-answer'),m=new DOMMatrixReadOnly(getComputedStyle(e.querySelector('svg')).transform);return {height:a.getBoundingClientRect().height,angle:Math.atan2(m.b,m.a)*180/Math.PI,expanded:e.querySelector('button').getAttribute('aria-expanded')}}''')
            assert (await state())['height']==0
            await first.locator('button').click();await page.wait_for_timeout(100)
            mid=await state();assert mid['height']>0 and 0<mid['angle']<45,mid
            await page.wait_for_timeout(1200)
            opened=await state();assert abs(opened['angle']-45)<.01 and opened['height']>mid['height'],opened
            # Clicking the answer also closes the original card.
            await first.locator('.faq-answer p').click();await page.wait_for_timeout(1200)
            assert (await state())['height']==0
            # Rapid reversal must finish closed, including the icon.
            await first.locator('button').click();await page.wait_for_timeout(80)
            await first.locator('button').click();await page.wait_for_timeout(1200)
            assert (await state())['height']==0 and abs((await state())['angle'])<.01
            await page.emulate_media(reduced_motion='reduce')
            for i in range(6):
                button=page.locator('.faq-item button').nth(i)
                await button.click();await page.wait_for_timeout(40)
                assert await button.get_attribute('aria-expanded')=='true'
            assert await page.locator('.faq-item.is-open').count()==6
            for i in range(6):
                button=page.locator('.faq-item button').nth(i)
                await button.click()
            assert await page.locator('.faq-item.is-open').count()==0
            await first.locator('button').focus();await page.keyboard.press('Enter')
            assert await first.locator('button').get_attribute('aria-expanded')=='true'
            await page.keyboard.press('Space')
            assert await first.locator('button').get_attribute('aria-expanded')=='false'
            await page.locator('#faqs').evaluate('e=>window.scrollTo({top:e.offsetTop,behavior:"instant"})')
            await page.screenshot(path=str(ROOT/f'qa/faq-corrected-{width}.png'))
            assert not errors,errors
            results.append({'width':width,'layout':layout,'headingBefore':before,'itemBefore':item_before,'mid':mid,'opened':opened,'allSixIndependent':True,'keyboard':True,'rapidReversal':True,'errors':errors})
            await page.close()
        await browser.close()
    (ROOT/'qa/faq-checks.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    print(json.dumps(results,indent=2))
asyncio.run(main())
