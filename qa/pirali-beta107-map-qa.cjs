const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium,devices}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 let pass=0,fail=0;
 fs.mkdirSync('qa/screenshots',{recursive:true});
 for(const role of ['play','dev']){
  for(const mobile of [false,true]){
   const ctx=await browser.newContext(mobile?{...devices['Pixel 7']}:{viewport:{width:1280,height:820}});
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route(/firebaseio\.com/,route=>route.fulfill({status:200,contentType:'application/json',body:'{}'}));
   await page.addInitScript(()=>localStorage.setItem('pirali_player_name','MAP-QA-NO-SAVE'));
   try{
    const res=await page.goto('https://piraligame.github.io/pirali/beta107-'+role+'/?v=beta107-map-ci',{waitUntil:'load',timeout:60000});
    assert.equal(res.status(),200);
    await page.waitForFunction(()=>window.PiraliStoryMap&&document.querySelector('#screen .story-map-open'),{timeout:15000});
    await page.locator('.story-map-open').click();
    await page.waitForSelector('#pirali-story-map .story-map-stage');
    const art=page.locator('#pirali-story-map .story-map-art img');
    await art.evaluate(async(img)=>{if(!img.complete)await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;});});
    const nodes=await page.locator('.story-map-stage').count();
    assert.equal(nodes,11);
    assert(await art.evaluate(img=>img.complete&&img.naturalWidth===850&&img.naturalHeight===1536));
    const observed={};
    for(const lang of ['ka','en','ru','zh']){
     await page.locator('[data-map-lang="'+lang+'"]').click();
     observed[lang]=await page.evaluate(()=>{
       const expected=PIRALI_LEVELS.map(item=>item[window.PiraliLanguage.getLanguage()]);
       const actual=[...document.querySelectorAll('.story-map-stage .story-map-name')].map(x=>x.textContent);
       return{exact:expected.every((name,i)=>name===actual[i]),first:actual[0],last:actual[10],lang:window.PiraliLanguage.getLanguage()};
     });
     assert(observed[lang].exact);
     assert.equal(observed[lang].lang,lang);
    }
    await page.locator('[data-map-lang="ka"]').click();
    assert.equal(await page.locator('.story-map-stage[data-stage="11"] .story-map-name').textContent(),'სიმონა — გზა სახლისაკენ');
    assert.equal(await page.locator('.story-map-stage[data-stage="1"] .story-map-name').textContent(),'ჩოხატაური');
    await page.screenshot({path:'qa/screenshots/beta107-'+role+'-'+(mobile?'mobile':'desktop')+'-map.png',fullPage:false});
    await page.locator('.story-map-back').click();
    assert.equal(await page.locator('#pirali-story-map').count(),0);
    assert.equal(errors.length,0,errors.join(' | '));
    console.log('PASS_MAP '+role+' '+(mobile?'mobile':'desktop')+' '+JSON.stringify({nodes,observed,errors}));
    pass++;
   }catch(e){fail++;console.error('FAIL_MAP '+role+' '+(mobile?'mobile':'desktop')+' '+String(e.stack||e));}
   await ctx.close();
  }
 }
 await browser.close();
 console.log('MAP_QA_FINAL '+JSON.stringify({passed:pass,failed:fail}));
 if(fail)process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exit(1)});