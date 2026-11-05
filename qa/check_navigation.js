async page => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const base = 'http://127.0.0.1:4178';
  const results = [];
  for (const width of [1200, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base);
    await page.locator('html[data-interactive]').waitFor();
    const labels = await page.locator('.nav-links').evaluate(element => [...element.querySelectorAll(':scope > a, :scope > .products-nav > button')].map(item => item.textContent));
    assert(JSON.stringify(labels) === JSON.stringify(['服务与方案','服务体系','案例','评价','FAQ','关于']), 'Navigation order incorrect');
    const trigger = page.locator('.products-trigger');
    await trigger.hover();
    await page.locator('.products-panel.is-open').waitFor();
    const before = page.url();
    await trigger.click();
    assert(page.url() === before, 'Product trigger navigated');
    await page.getByRole('tab', { name: /企业陪跑/ }).hover();
    const animation = await page.locator('.product-menu-grid').evaluate(element => {
      const animation = element.getAnimations()[0];
      if (!animation) return null;
      animation.pause();
      animation.currentTime = 0;
      const initial = { opacity:getComputedStyle(element).opacity, transform:getComputedStyle(element).transform };
      animation.currentTime = 180;
      const middle = { opacity:getComputedStyle(element).opacity, transform:getComputedStyle(element).transform };
      animation.finish();
      return { initial, middle, final:{ opacity:getComputedStyle(element).opacity, transform:getComputedStyle(element).transform } };
    });
    assert(animation && Number(animation.initial.opacity) === 0 && animation.initial.transform.includes('14'), 'Fade-up start incorrect');
    assert(Number(animation.middle.opacity) > 0 && Number(animation.middle.opacity) < 1 && Number(animation.final.opacity) === 1, 'Fade-up progress incorrect');
    assert(await page.locator('.products-services .product-menu-card').count() === 3, 'Enterprise products missing');
    await page.locator('.products-services img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    assert(await page.locator('.products-services .product-menu-title svg, .products-services small').count() === 0, 'Old arrows or descriptions remain');
    assert(await page.locator('.product-menu-title').first().evaluate(element => getComputedStyle(element).borderBottomWidth) === '0px', 'Title divider remains');
    const rect = await page.locator('.products-panel').boundingBox();
    assert(rect.x >= 0 && rect.x + rect.width <= width, 'Dropdown clipped');
    await page.screenshot({ path:`qa/navigation-enterprise-${width}.png` });
    await page.getByRole('tab', { name: /^课程/ }).hover();
    await page.locator('.products-services img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    await page.locator('.product-menu-grid').evaluate(element => element.getAnimations().forEach(animation => animation.finish()));
    assert(await page.locator('.products-services .product-menu-card').count() === 2, 'Courses missing');
    if (width === 1440) await page.screenshot({ path:'qa/navigation-products-1440.png' });
    await page.locator('.products-services a').filter({ hasText:'老板课' }).click();
    await page.waitForURL('**/solutions/boss-course');
    assert((await page.locator('h1').innerText()).includes('管理者'), 'Wrong product destination');
    await page.reload();
    assert((await page.locator('h1').innerText()).includes('管理者'), 'Refresh lost product page');
    if (width === 1440) await page.screenshot({ path:'qa/navigation-product-page-1440.png' });
    await page.goto(base);
    await page.evaluate(() => scrollTo(0, 900));
    await page.locator('.site-header.is-floating').waitFor();
    await page.locator('.products-trigger').hover();
    await page.locator('.products-panel.is-open').waitFor();
    const floatingRect = await page.locator('.products-panel').boundingBox();
    assert(floatingRect.x >= 0 && floatingRect.x + floatingRect.width <= width, 'Floating dropdown clipped');
    await page.keyboard.press('Escape');
    assert(await page.locator('.products-trigger').getAttribute('aria-expanded') === 'false', 'Escape failed');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert(!overflow, `Overflow at ${width}`);
    results.push({ width, labels, fadeUp:animation, images:true, hover:true, categories:true, destination:true, reload:true, floating:true, escape:true, overflow });
  }
  for (const width of [360, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(base);
    await page.getByRole('button', { name:'打开菜单', exact:true }).click();
    const trigger = page.locator('.mobile-products-trigger');
    await trigger.click();
    await page.locator('#mobile-products img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    assert(await page.locator('#mobile-products').isVisible(), 'Mobile products did not open');
    await trigger.click();
    assert(!await page.locator('#mobile-products').isVisible(), 'Mobile products did not close');
    await trigger.click();
    if (width === 390) await page.screenshot({ path:'qa/navigation-products-390.png' });
    await page.locator('#mobile-products a').filter({ hasText:'AI 转型陪跑' }).click();
    await page.waitForURL('**/solutions/ai-coaching');
    assert((await page.locator('h1').innerText()).includes('把流程做顺'), 'Mobile destination incorrect');
    assert(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'Mobile overflow');
    results.push({ width, mobileExpandCollapse:true, destination:true, overflow:false });
  }
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height:1000 });
    for (const path of ['/cases','/about']) {
      const response = await page.goto(base + path);
      assert(response.status() === 200, 'New page not 200');
      assert(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'Interior page overflow');
      await page.screenshot({ path:`qa/navigation-${path.slice(1)}-${width}.png`, fullPage:true });
    }
  }
  for (const path of ['/solutions/solution-workshop','/solutions/ai-delivery','/solutions/agent-development']) {
    assert((await page.goto(base + path)).status() === 200, `${path} not served`);
  }
  assert((await page.goto(base + '/not-a-registered-page')).status() === 404, 'Unknown path not 404');
  const noJS = await page.context().browser().newContext({ javaScriptEnabled:false, viewport:{ width:390, height:844 } });
  const staticPage = await noJS.newPage();
  await staticPage.goto(base);
  assert(await staticPage.locator('.faq-answer').first().isVisible(), 'No-JS FAQ hidden');
  await staticPage.locator('.static-products a').filter({ hasText:'老板课' }).click();
  assert((await staticPage.locator('h1').innerText()).includes('管理者'), 'No-JS navigation failed');
  await noJS.close();
  assert(errors.length === 0, errors.join('\n'));
  await page.setViewportSize({width:1440,height:1000});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base);
  await page.locator('.products-trigger').hover();
  await page.getByRole('tab',{name:'企业陪跑',exact:true}).hover();
  assert(await page.locator('.product-menu-grid').evaluate(element => getComputedStyle(element).animationName) === 'none', 'Reduced motion still animated');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base);
  await page.locator('.products-trigger').hover();
  return { results, newPages:true, unknown404:true, noJS:true, reducedMotion:true, errors };
}
