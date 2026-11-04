import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).parent
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(channel='msedge',headless=True)
        results={}
        for site,port,labels in [('sevora',4173,['Discover why we stand out','How the process flows with clarity','Explore our FAQs']),('launchfolio',4175,['Design that','Hear from what my'])]:
            page=await browser.new_page(viewport={'width':1440,'height':1000})
            await page.goto(f'http://127.0.0.1:{port}',wait_until='networkidle')
            await page.wait_for_timeout(1600)
            results[site]=await page.evaluate('''(labels)=>({bodyBg:getComputedStyle(document.body).background,styles:[...document.querySelectorAll('style')].map(e=>e.textContent),sections:labels.map(text=>{const el=[...document.querySelectorAll('h1,h2')].find(e=>e.textContent.includes(text));let e=el;const parents=[];while(e&&parents.length<6){parents.push({tag:e.tagName,name:e.getAttribute('data-framer-name'),id:e.id,cls:e.className,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,text:e.innerText?.slice(0,1600),images:[...e.querySelectorAll('img')].map(i=>({src:i.currentSrc,alt:i.alt})),html:e.outerHTML});e=e.parentElement;}return {text,parents}}),fonts:[...document.fonts].map(f=>({family:f.family,weight:f.weight,status:f.status}))})''',labels)
            await page.close()
        (ROOT/'source-inspection.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
        for site,data in results.items():
            print(site,data['bodyBg'],data['fonts'][:10])
            for section in data['sections']:
                print(section['text'])
                for parent in section['parents']:print({k:v for k,v in parent.items() if k not in ['html','images']})
        await browser.close()
asyncio.run(main())
