import asyncio,json
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(channel='msedge',headless=True)
  page=await browser.new_page(viewport={'width':1440,'height':1000})
  await page.goto('http://127.0.0.1:4173',wait_until='networkidle')
  for y in [140,148,149,160,180]:
   await page.evaluate('(y)=>scrollTo(0,y)',y);await page.wait_for_timeout(600)
   print('NAV',y,await page.locator('nav').evaluate_all('(els)=>els.map(e=>({name:e.dataset.framerName,y:e.getBoundingClientRect().y,inner:e.firstElementChild.getBoundingClientRect().toJSON()}))'))
  card=page.locator('#content-2')
  if await card.count():
   absolute=await card.evaluate('(e)=>e.getBoundingClientRect().top+scrollY')
   for top in [600,510,500,490,450,400]:
    await page.evaluate('(y)=>scrollTo(0,y)',absolute-top);await page.wait_for_timeout(700)
    print('PROCESS',top,await card.evaluate('(e)=>({h:e.getBoundingClientRect().height,children:[...e.querySelectorAll("[data-framer-name]")].map(x=>({name:x.dataset.framerName,bg:getComputedStyle(x).backgroundColor})).filter(x=>x.name.includes("Desktop"))})'))
  await page.locator('.framer-yblgmn').scroll_into_view_if_needed();await page.wait_for_timeout(1500)
  el=page.locator('.framer-yblgmn');r=await el.bounding_box()
  print('DRAG BEFORE',await el.get_attribute('style'))
  await page.mouse.move(r['x']+30,r['y']+30);await page.mouse.down();await page.mouse.move(r['x']+90,r['y']+70,steps=8)
  print('DRAG DURING',await el.get_attribute('style'))
  await page.mouse.up();await page.wait_for_timeout(800)
  print('DRAG AFTER',await el.get_attribute('style'))
  await page.evaluate('scrollTo(0,0)');await page.wait_for_timeout(1500)
  print('BENEFIT EXIT ABOVE',await el.get_attribute('style'))
  await el.scroll_into_view_if_needed();await page.wait_for_timeout(100)
  print('BENEFIT REENTER',await el.get_attribute('style'))
  await browser.close()
asyncio.run(main())
