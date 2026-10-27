const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium,devices}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 fs.mkdirSync('qa/screenshots',{recursive:true});
 let passed=0,failed=0;
 for(const role of ['dev','play']){
  for(const mobile of [false,true]){
   const context=await browser.newContext(mobile?{...devices['Pixel 7']}:{viewport:{width:1280,height:820}});
   const page=await context.newPage(),errs=[];
   page.on('pageerror',e=>errs.push(e.message));
   await page.route(/firebaseio\\.com/,route=>route.fulfill({status:200,contentType:'application/json',body:'{}'}));
   await page.addInitScript(()=>localStorage.setItem('pirali_player_name','BETA1091-QA'));
   try{
    const res=await page.goto('http://127.0.0.1:8765/beta1091-'+role+'/?map-hud-ci=1',{waitUntil:'load',timeout:60000});
    assert.equal(res.status(),200);
    await page.waitForFunction(()=>window.PiraliStoryMap&&window.PiraliMiniMap&&document.querySelector('.story-map-open'),{timeout:20000});
    await page.locator('.story-map-open').click();
    assert.equal(await page.locator('.story-map-stage').count(),11);
    const picture=await page.locator('.story-map-art img').evaluate(async el=>{
      if(!el.complete)await new Promise((resolve,reject)=>{el.onload=resolve;el.onerror=reject;});
      return {loaded:el.complete&&el.naturalWidth>0,w:el.naturalWidth,h:el.naturalHeight};
    });
    assert(picture.loaded,'approved illustration was not loaded');
    assert.equal(picture.w,170);
    assert.equal(picture.h,267);
    for(const lang of ['ka','en','ru','zh']){
     await page.locator('[data-map-lang="'+lang+'"]').click();
     const labels=await page.evaluate(()=>({
      lang:window.PiraliLanguage.getLanguage(),
      expected:PIRALI_LEVELS.map(v=>v[window.PiraliLanguage.getLanguage()]),
      actual:[...document.querySelectorAll('.story-map-stage .story-map-name')].map(x=>x.textContent)
     }));
     assert.equal(labels.lang,lang);
     assert.deepEqual(labels.actual,labels.expected,'all captions must be correctly translated');
     assert(labels.actual[10].includes('🇬🇪'));
    }
    await page.locator('[data-map-lang="ka"]').click();
    await page.locator('.story-map-back').click();
    await page.evaluate(()=>{level=11;running=true;P.dead=false;document.getElementById('screen').style.display='none';updateProgressUI();window.PiraliMiniMap.render();});
    assert.equal(await page.locator('#level-badge').textContent(),'გზა სახლისაკენ 🇬🇪');
    const mini=page.locator('#pirali-mini-map');
    assert(await mini.isVisible());
    assert(await page.locator('#pirali-mini-map-canvas').isVisible());
    // Real HUD-driven positioning on desktop and mobile.
    const layout=await page.evaluate(()=>{
      const hearts=document.querySelector('#ui > .ui-panel:first-child').getBoundingClientRect();
      const map=document.querySelector('#pirali-mini-map').getBoundingClientRect();
      const stage=document.querySelector('#level-badge').getBoundingClientRect();
      const overlap=!(map.right<=stage.left||stage.right<=map.left||map.bottom<=stage.top||stage.bottom<=map.top);
      return {hearts:{left:hearts.left,bottom:hearts.bottom},map:{left:map.left,right:map.right,top:map.top,bottom:map.bottom},stage:{left:stage.left,right:stage.right,top:stage.top,bottom:stage.bottom},overlap};
    });
    assert(Math.abs(layout.hearts.left-layout.map.left)<=2,'minimap must align with the hearts left edge');
    assert(layout.map.top>=layout.hearts.bottom&&layout.map.top-layout.hearts.bottom<=12,'minimap must sit immediately below the hearts');
    assert(!layout.overlap,'minimap must not overlap the 11th stage title');

    await page.locator('#pirali-mini-map-toggle').click();
    assert.equal(await page.locator('#pirali-mini-map-toggle').getAttribute('aria-expanded'),'false');
    assert(!(await page.locator('#pirali-mini-map-canvas').isVisible()));
    await page.locator('#pirali-mini-map-toggle').click();
    assert.equal(await page.locator('#pirali-mini-map-toggle').getAttribute('aria-expanded'),'true');
    await page.screenshot({path:'qa/screenshots/beta1091-'+role+'-'+(mobile?'mobile':'desktop')+'.png'});
    assert.equal(errs.length,0,errs.join(' | '));
    passed++;
    console.log('PASS BETA1091 '+role+' '+(mobile?'mobile':'desktop')+' map + stage11 + minimap');
   }catch(e){failed++;console.error('FAIL BETA1091 '+role+' '+(mobile?'mobile':'desktop')+' '+(e.stack||e));}
   await context.close();
  }
 }
 await browser.close();
 console.log('FINAL '+JSON.stringify({passed,failed}));
 if(failed)process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exit(1)});
