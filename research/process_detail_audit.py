import asyncio,json,re
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
WORKSPACE=ROOT.parents[1]
s=(WORKSPACE/'research/recovered-sources/72ea7b69-augiA20Il.js').read_text(encoding='utf-8')
a=s.index('How the process flows');b=s.index('Delivery',a)
(ROOT/'research/process-source-fragment.txt').write_text(s[a-2000:b+4500],encoding='utf-8')
async def main():
    result=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(channel='msedge',headless=True)
        for width in [1440,390]:
            for name,port,selector in [('source',4173,'[data-framer-name="Process"]'),('combined',4177,'#process')]:
                page=await browser.new_page(viewport={'width':width,'height':1000})
                await page.goto(f'http://127.0.0.1:{port}',wait_until='networkidle')
                section=page.locator(selector).first
                await section.evaluate('e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-30,behavior:"instant"})')
                await page.wait_for_timeout(1500)
                await page.screenshot(path=str(ROOT/f'qa/process-audit-{name}-{width}.png'))
                data=await section.evaluate('''root=>[root,...root.querySelectorAll('*')].filter(e=>e.children.length||/^H[1-6]$/.test(e.tagName)||e.tagName==='P').filter(e=>e.getBoundingClientRect().width>0).map(e=>{const c=getComputedStyle(e),r=e.getBoundingClientRect();return {tag:e.tagName,cls:typeof e.className==='string'?e.className:'',id:e.id,name:e.dataset.framerName,text:e.children.length?'':e.textContent,rect:{x:r.x,y:r.y,w:r.width,h:r.height},padding:c.padding,gap:c.gap,opacity:c.opacity,bg:c.backgroundColor,position:c.position,transform:c.transform,z:c.zIndex,font:c.fontSize,line:c.lineHeight,border:c.border,radius:c.borderRadius,shadow:c.boxShadow}})''')
                result.append({'name':name,'width':width,'elements':data})
                await page.close()
        await browser.close()
    (ROOT/'qa/process-audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print('Saved process DOM measurements and screenshots for 1440/390.')
asyncio.run(main())
