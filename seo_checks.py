import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).parent
BASE='http://127.0.0.1:4178'
async def main():
    results=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(channel='msedge',headless=True)
        for mode in ['normal','no-js','blocked-script']:
            for width in [1440,390]:
                page=await browser.new_page(viewport={'width':width,'height':900},java_script_enabled=mode!='no-js')
                errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
                if mode=='blocked-script':
                    await page.route('**/*.js',lambda route:route.abort())
                response=await page.goto(BASE,wait_until='networkidle')
                raw=await response.text()
                assert response.status==200 and '<div id="root"></div>' not in raw
                assert '企业仍需要安排熟悉业务的人员' in raw and '如何判断 AI 项目是否有效？' in raw
                await page.evaluate('document.fonts.ready');await page.wait_for_timeout(1800)
                assert await page.locator('h1').count()==1
                assert await page.locator('meta[name="description"]').get_attribute('content')
                assert await page.locator('link[rel="canonical"]').get_attribute('href')==BASE+'/'
                assert await page.locator('meta[name="robots"]').get_attribute('content')=='index, follow'
                if mode!='normal':
                    for i in range(6):
                        answer=page.locator(f'#answer-{i}')
                        assert await answer.evaluate('e=>e.getBoundingClientRect().height')>20
                        assert not await answer.evaluate('e=>e.inert')
                    assert await page.locator('.nav-links').is_visible()
                    await page.locator('.nav-links a[href="#faqs"]').click();await page.wait_for_timeout(700)
                    assert '#faqs' in page.url
                else:
                    assert await page.locator('html').get_attribute('data-interactive')=='true'
                    assert await page.locator('#answer-0').evaluate('e=>e.getBoundingClientRect().height')==0
                    await page.locator('.faq-item button').first.click();await page.wait_for_timeout(1300)
                    assert await page.locator('#answer-0').evaluate('e=>e.getBoundingClientRect().height')>20
                assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
                await page.screenshot(path=str(ROOT/f'qa/seo-{mode}-{width}.png'))
                assert not errors,errors
                results.append({'mode':mode,'width':width,'status':response.status,'htmlBytes':len(raw.encode()),'faqAnswersInHTML':6,'overflow':False,'errors':errors})
                await page.close()
        page=await browser.new_page()
        for path,expected in [('/',200),('/missing-page',404),('/deleted-case',404),('/404.html',404),('/assets/missing.jpg',404),('/robots.txt',200),('/sitemap.xml',200)]:
            response=await page.request.get(BASE+path)
            assert response.status==expected,(path,response.status)
            if expected==404: assert response.headers.get('x-robots-tag')=='noindex'
            results.append({'path':path,'status':response.status})
        for path,expected in [('/',200),('/missing-page',404)]:
            response=await page.request.head(BASE+path);assert response.status==expected
            assert await response.body()==b''
        redirect=await page.request.get(BASE+'/index.html?test=1',max_redirects=0)
        assert redirect.status==308 and redirect.headers['location']==BASE+'/?test=1'
        # Runtime failure after enhancement must expose, not permanently hide, content.
        await page.goto(BASE,wait_until='networkidle');await page.wait_for_timeout(1800)
        await page.evaluate("window.dispatchEvent(new ErrorEvent('error',{message:'Injected failure for readable fallback test'}))")
        assert await page.locator('html').get_attribute('data-interactive') is None
        assert await page.locator('#answer-0').evaluate('e=>e.getBoundingClientRect().height')>20
        assert await page.locator('#faqs .section-heading').evaluate('e=>getComputedStyle(e).opacity')=='1'
        results.append({'runtimeFailureFallback':'readable'})
        await browser.close()
    (ROOT/'qa/seo-checks.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    print(json.dumps(results,indent=2))
asyncio.run(main())
