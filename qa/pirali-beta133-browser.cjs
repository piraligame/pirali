'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(e,data)=>{if(e){res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data)});
});
async function run(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const variant of ['play','dev']){
   const context=await browser.newContext({viewport:{width:360,height:760},isMobile:true,hasTouch:true,deviceScaleFactor:2});
   const page=await context.newPage(),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route(/firebaseio\.com/,r=>{requests.push(r.request().method());r.abort()});
   const r=await page.goto('http://127.0.0.1:'+server.address().port+'/beta133-'+variant+'/index.html',{waitUntil:'load',timeout:45000});
   assert.equal(r.status(),200);
   assert.equal(await page.evaluate(()=>window.PiraliGameVersion),'1.33-classic.'+variant);
   const polish=await page.evaluate(()=>{
     const fx=PiraliFX;
     fx.reset();fx.shoot(800,800,0);fx.hit(810,810,false);
     for(let i=0;i<85;i++)fx.hit(810,810,true);
     const snapshot=fx.debug();
     const ctx=document.getElementById('gameCanvas').getContext('2d');
     fx.draw(ctx,x=>x-camX,y=>y-camY,W,H);
     window.PiraliPickupVisibility.draw(ctx,{type:'health',col:false,bob:0},90,90,16);
     window.PiraliPickupVisibility.draw(ctx,{type:'alpha-shells',col:false,bob:1},120,90,16);
     window.PiraliBoss126.drawSecondaryWarning(ctx,x=>x,y=>y,{alive:true,x:100,y:100,sT:7});
     return {count:snapshot.count,max:snapshot.max,types:snapshot.types,roles:{...window.PiraliTacticalAI.roles}};
   });
   assert.ok(polish.count<=28,'FX remains mobile capped');
   assert.ok(polish.types.includes('impact-arc'),'New impact visual loads');
   assert.equal(await page.locator('#pirali-time-hud').count(),1,'Timer exists');
   assert.equal(polish.roles.saber,'direct-pressure');
   assert.equal(polish.roles.rifle,'keep-distance');
   assert.equal(polish.roles.officer,'stable-flank');
   const order=await page.evaluate(()=>[...document.querySelectorAll('#screen .menu-actions>button')].map(x=>x.className));
   const map=order.findIndex(x=>x.split(/\s+/).includes('story-map-open')),full=order.findIndex(x=>x.split(/\s+/).includes('pirali-full-menu')),records=order.findIndex(x=>x.split(/\s+/).includes('menu-records'));
   assert.ok(map>=0&&map<full&&full<records,'Premium action must be between campaign map and leaderboard '+order);
   const community=page.locator('#screen .pirali-community-menu');
   assert.equal(await community.getAttribute('href'),'https://www.facebook.com/share/1LfEa8WSfU/');
   assert.equal(await community.getAttribute('target'),'_blank');
   assert.match(await community.innerText(),/გეიმერების საზოგადოება/);
   assert.equal(await community.locator('img').evaluate(i=>i.complete&&i.naturalWidth>0),true,'Original community emblem loads');
   const menuClasses=await page.evaluate(()=>[...document.querySelector('#screen .menu-actions').children].map(e=>e.className));
   const fullAt=menuClasses.findIndex(x=>x.split(/\s+/).includes('pirali-full-menu')),communityAt=menuClasses.indexOf('pirali-community-menu'),recordsAt=menuClasses.indexOf('menu-records');
   assert.ok(fullAt>=0&&communityAt===fullAt+1&&recordsAt===communityAt+1,'Full Route -> Community -> Leaderboard '+menuClasses);
   const cb=await community.boundingBox(),rb=await page.locator('#screen .menu-records').boundingBox();
   assert.ok(Math.abs(cb.width-rb.width)<=2,'Community button same width as leaderboard');
   const button=page.locator('#screen .pirali-full-menu');assert.match(await button.textContent(),/🔒/);
   await button.click();
   assert.equal(await page.locator('.pirali-full-pin').count(),0,'Locked route cannot choose stage');
   assert.match(await page.locator('#pirali-full-overlay').innerText(),/10/);
   assert.doesNotMatch(await page.locator('#pirali-full-overlay').innerText(),/₾|0\.50|0,50|Billing|გადახდა/);
   await page.locator('.pirali-full-back').click();
   const noBypass=await page.evaluate(()=>{localStorage.setItem('pirali_beta129_demo_fullpath_play','yes');return window.PiraliFullPath.unlocked()});
   assert.equal(noBypass,false,'Old premium demo flag no longer gives access');
   await page.evaluate(()=>{
     localStorage.setItem('pirali_player_name','Dato');
     const key=window.PiraliVisualPreviewReadonly?'pirali_personal_stats_beta_1_0_s1_dev_preview':'pirali_personal_stats_beta_1_0_s1_rc';
     const profile={runs:1,wins:1,defeats:0,kills:14,bestScore:800,bestRunMs:99000,stageBestMs:Array(11).fill(null),achievements:{victory:1},maxReachedStage:11};
     localStorage.setItem(key,JSON.stringify({version:1,profiles:{dato:profile}}));
     window.PiraliFullPath.refresh();
   });
   assert.equal(await page.evaluate(()=>window.PiraliFullPath.unlocked()),true);
   await button.click();
   assert.equal(await page.locator('.pirali-full-pin').count(),11);
   await page.locator('.pirali-full-pin[data-stage="10"]').scrollIntoViewIfNeeded();
   await page.locator('.pirali-full-pin[data-stage="10"]').click();
   const started=await page.evaluate(()=>({level,health,maxHealth,gear:window.PiraliAlphaGear.status(),active:window.PiraliFullPath.isActive()}));
   assert.equal(started.level,10);assert.equal(started.health,7);assert.equal(started.maxHealth,7);
   assert.equal(started.gear.owned,true);assert.equal(started.gear.selected,'shotgun');assert.equal(started.active,true);
   await page.waitForTimeout(380);
   const timerBox=await page.locator('#pirali-time-hud').boundingBox();
   const pauseBox=await page.locator('#btn-pause').boundingBox();
   assert.ok(timerBox&&pauseBox,'Visible game timer and pause');
   assert.ok(timerBox.x>=pauseBox.x+pauseBox.width+4,'Timer to the right of pause');
   assert.ok(Math.abs(timerBox.y-pauseBox.y)<=3,'Timer aligned with pause');
   assert.ok(timerBox.x+timerBox.width<=360,'Timer fits the mobile viewport');
   if(variant==='dev'){
     const test=page.locator('#pirali-scenery-test-panel');
     const comp=test.locator('[data-latest-improvements="toggle"]');
     assert.equal(await comp.count(),1,'One latest-improvements switch');
     const imm=test.locator('[data-immortality="toggle"]');
     assert.equal(await comp.evaluate(e=>e.previousElementSibling?.dataset.immortality),'toggle','Comparison switch directly beneath immortality');
     assert.equal(await page.evaluate(()=>window.PiraliDevComparison.enabled()),true);
     await comp.evaluate(el=>el.click());
     assert.equal(await page.evaluate(()=>window.PiraliDevComparison.enabled()),false);
     assert.equal(await comp.getAttribute('aria-pressed'),'false');
     const disabledVisual=await page.evaluate(()=>{PiraliFX.reset();PiraliFX.hit(P.x,P.y,true);return PiraliFX.debug().types});
     assert.equal(disabledVisual.includes('impact-arc'),false,'Classic impact restored immediately');
     await comp.evaluate(el=>el.click());
     assert.equal(await page.evaluate(()=>window.PiraliDevComparison.enabled()),true);
     assert.equal(await comp.getAttribute('aria-pressed'),'true');
     const enabledVisual=await page.evaluate(()=>{PiraliFX.reset();PiraliFX.hit(P.x,P.y,true);return PiraliFX.debug().types});
     assert.equal(enabledVisual.includes('impact-arc'),true,'New impact restored immediately');
   }else{
     assert.equal(await page.locator('[data-latest-improvements="toggle"]').count(),0,'Player cannot access Dev comparison controls');
     assert.equal(await page.evaluate(()=>!!window.PiraliDevComparison),false,'Player comparison API absent');
   }
   const coins=await page.evaluate(()=>{const old=score;window.PiraliStageScoring.claimDevilCoins();return score-old;});
   assert.equal(coins,50,'Full Route coins reduced 80%');
   // Full Route owns shotgun: static shell boxes are available from every
   // stage; enemy shell drops are verified in the structural VM test.
   const stageShells=await page.evaluate(()=>{
     const oldLevel=level;
     const sample=Array.from({length:24},(_,i)=>({x:650+i*8,y:450+i*78}));
     const summary=[];
     for(let n=1;n<=11;n++){
       level=n;pickups=[];
       window.PiraliAlphaGear.scatterOnFinal(sample,pickups,n);
       summary.push({stage:n,boxes:pickups.filter(p=>p.type==='alpha-shells').length});
     }
     level=oldLevel;pickups=[];
     return summary;
   });
   assert.equal(stageShells.length,11);
   for(const n of stageShells)assert.ok(n.boxes>=3,'Owned shotgun shell placements stage '+n.stage);
   const bonusStageShells=await page.evaluate(()=>{
     level=11;
     window.PiraliEndless.setup();
     return pickups.filter(p=>p.type==='alpha-shells'&&!p.col).length;
   });
   assert.ok(bonusStageShells>=3,'Stage 11 wave reset retains acquired shotgun shell supply');
   await page.evaluate(()=>startGame());
   const normal=await page.evaluate(()=>({level,health,maxHealth,gear:window.PiraliAlphaGear.status(),active:window.PiraliFullPath.isActive()}));
   assert.equal(normal.level,1);assert.equal(normal.health,5);assert.equal(normal.maxHealth,5);assert.equal(normal.gear.owned,false);assert.equal(normal.active,false);
   assert.ok(requests.every(m=>m==='GET'),'No Firebase writes');
   assert.deepEqual(errors,[]);
   console.log('PASS Beta 1.32 '+variant+' mobile: locked-until-stage11, real progress unlock, correct menu order, 11 stage pins, 7 hearts shotgun, 20% points, normal game unchanged');
   await context.close();
  }
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
run().catch(e=>{console.error(e);server.close();process.exitCode=1});
