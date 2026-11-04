import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def main():
    results=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(channel='msedge',headless=True)
        for width in [1440,390,1920]:
            for name,port in [('source',4173),('combined',4177)]:
                page=await browser.new_page(viewport={'width':width,'height':1000})
                await page.goto(f'http://127.0.0.1:{port}',wait_until='networkidle')
                title=page.get_by_text('Explore our FAQs',exact=True).first
                await title.evaluate('e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-120,behavior:"instant"})')
                await page.wait_for_timeout(1800)
                root=title.locator('xpath=ancestor::section[1]') if name=='combined' else page.locator('[data-framer-name="FAQs"]').first
                if not await root.count():
                    print(await title.evaluate('e=>{let a=[];while(e){a.push([e.tagName,e.className,e.dataset.framerName]);e=e.parentElement}return a}'));continue
                async def capture(state):
                    data=await root.evaluate('''root=>[root,...root.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().width>0).map(e=>{const c=getComputedStyle(e),r=e.getBoundingClientRect();return {tag:e.tagName,cls:typeof e.className==='string'?e.className:'',name:e.dataset.framerName,text:e.children.length?'':e.textContent,rect:{x:r.x,y:r.y,w:r.width,h:r.height},padding:c.padding,gap:c.gap,opacity:c.opacity,bg:c.backgroundColor,transform:c.transform,font:c.fontSize,weight:c.fontWeight,line:c.lineHeight,border:c.border,radius:c.borderRadius,maxWidth:c.maxWidth}})''')
                    results.append({'name':name,'width':width,'state':state,'elements':data})
                    await page.screenshot(path=str(ROOT/f'qa/faq-{name}-{width}-{state}.png'))
                await capture('closed')
                trigger=root.locator('[data-framer-name="Trigger"]').first if name=='source' else root.locator('button').first
                await trigger.click()
                await page.mouse.move(1,1);await page.wait_for_timeout(1200)
                await capture('open')
                await page.close()
        await browser.close()
    (ROOT/'qa/faq-audit.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    print('FAQ measurements saved')
asyncio.run(main())
