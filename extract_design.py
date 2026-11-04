import asyncio,json,re,hashlib,shutil
from pathlib import Path
from urllib.parse import urlsplit
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
ROOT=Path(__file__).parent;WORK=ROOT.parents[1];SITE=ROOT/'site'
ASSETS=SITE/'public/assets';ASSETS.mkdir(parents=True,exist_ok=True)
OUT=SITE/'src/reference';OUT.mkdir(exist_ok=True)
manifest=[]
def localize(text,site):
    source=WORK/'site' if site=='sevora' else WORK/'projects/launchfolio/site'
    aliases=json.loads((source/'asset-aliases.json').read_text())
    def replace(m):
        url=m[0].replace('&amp;','&');key=urlsplit(url).path+('?' + urlsplit(url).query if urlsplit(url).query else '')
        key=key.replace('/_assets/','/_assets/',1)
        original=source/'public'/aliases.get(key,key).lstrip('/')
        if not original.exists():return m[0]
        name=site+'-'+hashlib.sha256(key.encode()).hexdigest()[:12]+original.suffix
        shutil.copyfile(original,ASSETS/name)
        manifest.append({'source':str(original),'url':key,'output':'/assets/'+name})
        return '/assets/'+name
    return re.sub(r'(?:http://127\.0\.0\.1:\d+)?/_assets/[^\s\"\)\'<>]+',replace,text)
async def main():
    data={};font_rules=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(channel='msedge',headless=True)
        for site,port in [('sevora',4173),('launchfolio',4175)]:
            page=await browser.new_page(viewport={'width':1440,'height':1000})
            await page.goto(f'http://127.0.0.1:{port}',wait_until='networkidle')
            await page.wait_for_timeout(1800)
            # Extract original vector definitions, never redraw source artwork.
            async def vector(el,name):
                svg=await el.evaluate('''e=>{let s=e.tagName.toLowerCase()==='svg'?e:e.querySelector('svg');if(!s)return null;const use=s.querySelector('use');if(use){const t=document.getElementById(use.getAttribute('href')?.slice(1)||use.getAttribute('xlink:href')?.slice(1));if(t)return t.outerHTML;}return s.outerHTML}''')
                if not svg:return None
                svg=svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ',1) if 'xmlns=' not in svg else svg
                (ASSETS/(name+'.svg')).write_text(svg,encoding='utf-8')
                return '/assets/'+name+'.svg'
            css='\n'.join(await page.locator('style').all_text_contents())
            font_rules+=re.findall(r'@font-face\s*\{[^}]*\}',localize(css,site))
            if site=='sevora':
                nav=page.locator('nav').first
                data['logo']=localize(await nav.locator('img').first.get_attribute('src'),site)
                data['backgrounds']=await page.evaluate('''()=>[...document.querySelectorAll('*')].map(e=>({name:e.getAttribute('data-framer-name'),cls:e.className,bg:getComputedStyle(e).backgroundImage,size:getComputedStyle(e).backgroundSize})).filter(e=>e.bg!=='none'&&(e.bg.includes('url(')||e.bg.includes('repeating'))).slice(0,20)''')
                benefits=page.locator('section[data-framer-name="Benefits"]')
                await benefits.scroll_into_view_if_needed();await page.wait_for_timeout(1500)
                # Decorative source DOM only. Text and page layout are editable React components.
                arts=[]
                for i,art in enumerate(await benefits.locator('[data-framer-name="Image (Replace here)"]').all()):
                    html=await art.evaluate('e=>e.outerHTML')
                    defs=await page.locator('#svg-templates').inner_html()
                    arts.append({'html':localize(html+f'<div style="display:none">{defs}</div>',site),'className':await art.get_attribute('class')})
                (OUT/'benefit-art.json').write_text(json.dumps(arts,ensure_ascii=False),encoding='utf-8')
                (OUT/'sevora.css').write_text(localize(css,site),encoding='utf-8')
                data['benefits']=[]
                for card in await benefits.locator('[data-framer-name^="Card "]').all():
                    paragraphs=await card.locator('h3,p').all_text_contents()
                    data['benefits'].append(paragraphs[-2:])
                process=page.locator('section[data-framer-name="Process"]')
                data['processText']=await process.inner_text()
                data['processIcons']=[]
                for i,svg in enumerate(await process.locator('svg').all()):
                    data['processIcons'].append(await vector(svg,'process-'+str(i)))
                faq=page.locator('section[data-framer-name="FAQs"]')
                data['faqs']=[]
                for button in await faq.locator('.framer-1chpluh').all():
                    question=(await button.inner_text()).strip()
                    await button.scroll_into_view_if_needed();await button.click();await page.wait_for_timeout(700)
                    text=await button.evaluate('e=>e.parentElement.innerText')
                    data['faqs'].append({'question':question,'expanded':text})
                    await button.click()
                data['sevoraFonts']=await benefits.locator('h2,h3,p').evaluate_all('(els)=>els.map(e=>({text:e.innerText,font:getComputedStyle(e).font}))')
            else:
                hero=page.locator('#hero')
                data['heroBackgrounds']=await page.evaluate('''()=>[...document.querySelectorAll('img')].filter(e=>{const r=e.getBoundingClientRect();return r.top<650&&r.right>700&&r.width>150}).map(e=>({src:e.currentSrc,alt:e.alt,html:e.parentElement.outerHTML.slice(0,3000)}))''')
                data['heroImages']=await hero.locator('img').evaluate_all('(els)=>els.map(e=>({src:e.currentSrc,alt:e.alt}))')
                logos=hero.locator('[data-framer-name^="Client Logo "]')
                data['logos']=[]
                for i,logo in enumerate((await logos.all())[:6]):data['logos'].append(await vector(logo,'client-logo-'+str(i)))
                testimonials=page.locator('section[data-framer-name="Testimonials"]')
                data['testimonials']=[]
                for card in await testimonials.locator('[data-framer-name="Testimonial Card"]').all():
                    data['testimonials'].append({'html':await card.inner_html(),'text':await card.inner_text(),'image':await card.locator('img').get_attribute('src')})
                data['launchFonts']=await hero.locator('h1,p').evaluate_all('(els)=>els.map(e=>({text:e.innerText,font:getComputedStyle(e).font}))')
            await page.close()
        await browser.close()
    for key in ['heroBackgrounds','heroImages','testimonials']:data[key]=json.loads(localize(json.dumps(data[key],ensure_ascii=False),'launchfolio'))
    data['backgrounds']=json.loads(localize(json.dumps(data['backgrounds'],ensure_ascii=False),'sevora'))
    (OUT/'design-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/'fonts.css').write_text('\n'.join(dict.fromkeys(font_rules)),encoding='utf-8')
    (ROOT/'asset-provenance.json').write_text(json.dumps(list({m['output']:m for m in manifest}.values()),indent=2),encoding='utf-8')
    print(json.dumps({k:v for k,v in data.items() if k not in ['testimonials']},ensure_ascii=False)[:19000])
    print('TESTIMONIALS',[(v['text'],v['image']) for v in data['testimonials']])
asyncio.run(main())
