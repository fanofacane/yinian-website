import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).parent;OUT=ROOT/'qa';OUT.mkdir(exist_ok=True)
async def main():
    results=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(channel='msedge',headless=True)
        for width,height in [(1440,1000),(390,844),(768,1024),(1920,1080),(360,800)]:
            page=await b.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
            errors=[];failed=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('response',lambda r:failed.append({'url':r.url,'status':r.status}) if r.status>=400 else None)
            await page.goto('http://127.0.0.1:4177',wait_until='networkidle')
            await page.locator('h1').wait_for();await page.evaluate('document.fonts.ready');await page.wait_for_timeout(2100)
            await page.screenshot(path=str(OUT/f'{width}-top.png'))
            for name in ['benefits','process','reviews','faqs']:
                el=page.locator('#'+name)
                await el.scroll_into_view_if_needed();await page.wait_for_timeout(2100)
                if width in [1440,390]:await el.screenshot(path=str(OUT/f'{width}-{name}.png'))
            await page.screenshot(path=str(OUT/f'{width}-full.png'),full_page=True)
            result=await page.evaluate('''()=>({overflow:document.documentElement.scrollWidth>innerWidth,headings:[...document.querySelectorAll('h1,h2,h3')].map(e=>({text:e.textContent,font:getComputedStyle(e).fontFamily})),broken:[...document.images].filter(e=>e.complete&&!e.naturalWidth).map(e=>e.src),sections:[...document.querySelectorAll('main>section')].map(e=>e.id),footer:!!document.querySelector('footer')})''')
            result.update({'width':width,'errors':errors,'failed':failed})
            results.append(result)
            print(width,json.dumps(result,ensure_ascii=False)[:2200],flush=True)
            await page.close()
        await b.close()
    (OUT/'layout-checks.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
asyncio.run(main())
