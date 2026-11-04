import asyncio,json,shutil
from pathlib import Path
from PIL import Image,ImageDraw
from playwright.async_api import async_playwright
ROOT=Path(__file__).parent;OUT=ROOT/'qa';OUT.mkdir(exist_ok=True)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(channel='msedge',headless=True)
        for width,height in [(1440,1000),(390,844)]:
            for port,label in [(4173,'sevora'),(4175,'launchfolio'),(4177,'combined')]:
                page=await b.new_page(viewport={'width':width,'height':height})
                await page.goto(f'http://127.0.0.1:{port}',wait_until='networkidle');await page.wait_for_timeout(1800)
                targets={'sevora':{'nav':'nav','benefits':'section[data-framer-name="Benefits"]','process':'section[data-framer-name="Process"]','faqs':'section[data-framer-name="FAQs"]'},'launchfolio':{'hero':'#hero','reviews':'section[data-framer-name="Testimonials"]'},'combined':{'nav':'.site-header','hero':'#home','benefits':'#benefits','process':'#process','reviews':'#reviews','faqs':'#faqs'}}[label]
                for name,selector in targets.items():
                    el=page.locator(selector).first
                    await el.scroll_into_view_if_needed();await page.wait_for_timeout(800)
                    await el.screenshot(path=str(OUT/f'{label}-{width}-{name}.png'))
                    if label=='launchfolio' and name=='reviews' and width==390:
                        print(await el.locator('[data-framer-name="Testimonial Grid"]').evaluate('(e)=>({display:getComputedStyle(e).display,columns:getComputedStyle(e).gridTemplateColumns,height:e.getBoundingClientRect().height,overflow:getComputedStyle(e).overflow})'),flush=True)
                await page.close()
        await b.close()
    for width in [1440,390]:
        for name in ['nav','hero','benefits','process','reviews','faqs']:
            source='launchfolio' if name in ['hero','reviews'] else 'sevora'
            a=Image.open(OUT/f'{source}-{width}-{name}.png').convert('RGB');b=Image.open(OUT/f'combined-{width}-{name}.png').convert('RGB')
            w=min(720,width);ha=round(a.height*w/a.width);hb=round(b.height*w/b.width)
            pair=Image.new('RGB',(2*w,max(ha,hb)+32),'#e8e8e8')
            pair.paste(a.resize((w,ha)),(0,32));pair.paste(b.resize((w,hb)),(w,32));d=ImageDraw.Draw(pair)
            d.text((8,8),source.upper()+' REFERENCE',fill='black');d.text((w+8,8),'COMBINED / SWITZER',fill='black')
            pair.save(OUT/f'compare-{width}-{name}.png')
    print('Saved 12 same-viewport section comparisons.')
asyncio.run(main())
