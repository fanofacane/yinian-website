import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).parent;OUT=ROOT/'qa'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(channel='msedge',headless=True)
        page=await b.new_page(viewport={'width':390,'height':844})
        await page.goto('http://127.0.0.1:4177/',wait_until='networkidle')
        await page.locator('h1').wait_for()
        await page.evaluate('document.fonts.ready')
        fonts=await page.evaluate('''()=>{const result=[];function scan(root){for(const e of root.querySelectorAll('*')){if(e.shadowRoot)scan(e.shadowRoot);if(e.children.length===0&&e.textContent.trim()&&e.getBoundingClientRect().height>0&&!['STYLE','SCRIPT','TITLE'].includes(e.tagName)){const font=getComputedStyle(e).fontFamily;if(!font.includes('Switzer'))result.push({text:e.textContent.slice(0,80),font})}}}scan(document.body);return {mismatches:result,loaded:document.fonts.check('500 16px Switzer')&&document.fonts.check('600 16px Switzer')}}''')
        assert not fonts['mismatches'] and fonts['loaded'],fonts
        grid=page.locator('.review-grid');await grid.scroll_into_view_if_needed();await page.wait_for_timeout(600)
        await grid.hover();await page.mouse.wheel(370,0);await page.wait_for_timeout(700)
        scrolled=await grid.evaluate('e=>e.scrollLeft')
        assert scrolled>200,scrolled
        await page.screenshot(path=str(OUT/'mobile-reviews-scrolled.png'))
        await page.locator('#process').scroll_into_view_if_needed();await page.wait_for_timeout(600)
        before=await page.locator('.process-step.is-active').count()
        await page.locator('.process-step').last.scroll_into_view_if_needed();await page.wait_for_timeout(600)
        after=await page.locator('.process-step.is-active').count()
        assert after==6 and before<after,(before,after)
        result={'fonts':fonts,'mobileReviewsHorizontalScroll':scrolled,'processProgress':[before,after]}
        await page.emulate_media(reduced_motion='reduce')
        result['reducedMotion']=await page.locator('.logo-track').evaluate('e=>getComputedStyle(e).animationName')
        assert result['reducedMotion']=='none'
        await b.close()
    checks=json.loads((OUT/'layout-checks.json').read_text(encoding='utf-8'))
    for item in checks:
        assert not any(item[k] for k in ['overflow','broken','errors','failed','footer']),item
        assert item['sections']==['home','benefits','process','reviews','faqs']
        assert all('Switzer' in h['font'] for h in item['headings'])
    result.update({'viewports':[i['width'] for i in checks],'layoutPassed':True})
    (OUT/'final-checks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False,indent=2))
asyncio.run(main())
