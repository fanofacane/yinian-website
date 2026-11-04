import asyncio,json
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(channel='msedge',headless=True)
  page=await browser.new_page(viewport={'width':1440,'height':1000})
  await page.goto('http://127.0.0.1:4177',wait_until='networkidle')
  await page.evaluate('''async()=>{const m=await import('/src/motion/benefitMotion.js');window.benefitAuditCleanup=[...document.querySelectorAll('.benefit-art')].map((h,i)=>m.mountBenefitMotion(h,h.shadowRoot,i))}''')
  for selector in ['.framer-yblgmn','.framer-jotx7o','.framer-3maobj','.framer-84k9bb']:
   el=page.locator(selector)
   await el.scroll_into_view_if_needed();await page.wait_for_timeout(1900)
   r=await el.bounding_box()
   # Use visible left edge: the first panel extends beyond its clipping card.
   x,y=r['x']+25,r['y']+25
   await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+45,y+25,steps=6)
   during=await el.evaluate('(e)=>getComputedStyle(e).transform')
   await page.mouse.up();await page.wait_for_timeout(1100)
   after=await el.evaluate('(e)=>getComputedStyle(e).transform')
   print(selector, json.dumps({'during':during,'after':after}))
  await page.set_viewport_size({'width':390,'height':844})
  await page.goto('http://127.0.0.1:4173',wait_until='networkidle')
  await page.evaluate('scrollTo(0,300)');await page.wait_for_timeout(1200)
  print('MOBILE NAV',await page.locator('nav').evaluate_all('(els)=>els.map(e=>({name:e.dataset.framerName,rect:e.firstElementChild.getBoundingClientRect().toJSON(),text:e.textContent}))'))
  await page.locator('nav').last.locator('[data-highlight]').click();await page.wait_for_timeout(800)
  print('MOBILE MENU',await page.locator('[data-framer-portal-id]').evaluate_all('(els)=>els.map(e=>({rect:e.getBoundingClientRect().toJSON(),text:e.textContent,bg:getComputedStyle(e).backgroundColor,position:getComputedStyle(e).position,children:[...e.querySelectorAll("a")].map(a=>({text:a.textContent,rect:a.getBoundingClientRect().toJSON()}))}))'))
  await browser.close()
asyncio.run(main())
