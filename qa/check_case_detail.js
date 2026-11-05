async page => {
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const results=[];
  for(const width of [1920,1440,1024,390]) {
    await page.setViewportSize({width,height:1000});
    await page.goto('http://127.0.0.1:4178/cases');
    const typography = await page.evaluate(()=>({width:innerWidth,styles:['.cases-feature-copy','.cases-feature-copy h2','.cases-feature-description','.cases-feature-label','.cases-more'].map(s=>{const e=document.querySelector(s),c=getComputedStyle(e);return {s,font:c.fontSize,weight:c.fontWeight,line:c.lineHeight,padding:c.padding,margin:c.margin,maxWidth:c.maxWidth};}),radius:getComputedStyle(document.querySelector('.cases-more')).borderRadius}));
    assert(typography.radius==='999px','CTA is not a capsule');
    assert(typography.styles[4].weight==='400','CTA font not restored');
    assert(typography.styles[2].weight==='500'&&typography.styles[3].weight==='600','Text weights not restored');
    if(width===1440) {
      assert(typography.styles[1].font==='28px','Source title size mismatch');
      assert(typography.styles[2].font==='15px','Source description size mismatch');
      assert(typography.styles[2].maxWidth==='274.5px','Source description width mismatch');
    }
    await page.locator('.cases-feature-media img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
    if([1440,390].includes(width)) await page.screenshot({path:`qa/cases-type-restored-${width}.png`});
    await page.locator('.cases-slide.is-active .cases-more').click();
    await page.waitForURL('**/cases/manufacturing-knowledge');
    assert(await page.locator('.case-detail-body section').count()>=5,'Article sections incomplete');
    assert((await page.locator('.case-detail-body').innerText()).length>1100,'Article is still an outline');
    assert(await page.locator('.case-detail-body p').count()>=12,'Long-form paragraphs missing');
    assert(await page.locator('.case-detail-example').count()===1,'Concrete task example missing');
    assert(await page.locator('.case-detail-sidebar,.case-detail-recommendations,.case-detail-offer').count()===0,'Removed recommendation/service modules remain');
    assert(await page.locator('.case-story-cover').count()===0,'Old detail layout remains');
    const body=await page.locator('.case-detail-article').boundingBox();
    assert(body.width<=840&&Math.abs(body.x-(width-body.width)/2)<2,'Article column is not centered or readable');
    assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'Detail overflow');
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await page.screenshot({path:`qa/detail-restored-full-${width}.png`,fullPage:true});
    if([1440,390].includes(width)) await page.screenshot({path:`qa/detail-restored-${width}.png`});
    await page.locator('.case-detail-next-link').click();
    await page.waitForURL('**/cases/retail-content');
    assert((await page.reload()).status()===200,'Next detail refresh failed');
    await page.locator('.case-detail-return').click();
    await page.waitForURL('**/cases');
    results.push({width,typography,articleWidth:body.width,longForm:true,recommendations:0,offers:0,navigation:true,overflow:false});
  }
  assert(errors.length===0,errors.join('\n'));
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('http://127.0.0.1:4178/cases/manufacturing-knowledge');
  return {results,errors};
}
