'use strict';
const {chromium}=require('playwright'),fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{
 const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(target,(e,data)=>{if(e){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream'});res.end(data);});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
 try{
  for(const variant of ['play','dev']){
   const page=await browser.newPage({viewport:{width:412,height:915},deviceScaleFactor:1,isMobile:true,hasTouch:true});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:'+server.address().port+'/beta129-'+variant+'/index.html',{waitUntil:'load'});
   assert.equal(await page.evaluate(()=>window.PiraliGameVersion),'1.29-classic.'+variant);
   const button=page.locator('.pirali-full-menu');assert.equal(await button.count(),1);
   await button.click();
   assert.match(await page.locator('#pirali-full-overlay').innerText(),/0.50|0,50/);
   assert.match(await page.locator('#pirali-full-overlay').innerText(),/გადახდა არ|თანხა არ|DEMO/);
   if(variant==='play')await page.screenshot({path:path.join(root,'qa','beta129-offer-preview.png')});
   assert.equal(await page.locator('.pirali-full-pin').count(),0,'locked demo does not reveal instant selectors before activation');
   await page.locator('.pirali-full-activate').click();
   assert.equal(await page.locator('.pirali-full-pin').count(),11);
   if(variant==='play')await page.screenshot({path:path.join(root,'qa','beta129-map-preview.png')});
   const map=page.locator('.pirali-full-scroll');
   const pin=page.locator('.pirali-full-pin[data-stage="10"]');
   await pin.scrollIntoViewIfNeeded();await pin.click();
   assert.equal(await page.locator('#pirali-name-registration').count(),1,'name gate required even for premium path');
   await page.locator('#pirali-name-input').fill('Dato');
   await page.locator('.pirali-name-confirm').click();
   const state=await page.evaluate(()=>({level,health,maxHealth,gear:window.PiraliAlphaGear.status(),paid:window.PiraliFullPath.isActive(),claim7:window.PiraliBigHearts.claimed(7),claim10:window.PiraliBigHearts.claimed(10),price:window.PiraliFullPath.priceGEL,live:window.PiraliFullPath.realPaymentEnabled}));
   assert.equal(state.level,10);assert.equal(state.health,7);assert.equal(state.maxHealth,7);
   assert.equal(state.gear.owned,true);assert.equal(state.gear.selected,'shotgun');assert.equal(state.gear.shells,12);
   assert.equal(state.paid,true);assert.equal(state.claim7,true);assert.equal(state.claim10,true);
   assert.equal(state.live,false);assert.equal(state.price,0.5);
   const coin=await page.evaluate(()=>{let before=score;window.PiraliStageScoring.claimDevilCoins();return score-before});
   assert.equal(coin,125,'Devil coins 250 ->125 premium');
   const ordinary=await page.evaluate(()=>{window.PiraliFullPath.clearActive();level=10;genWorld();let b=score;window.PiraliStageScoring.claimDevilCoins();return score-b;});
   assert.equal(ordinary,250);
   // Premium stage 11 awards half the wave amounts.
   const wave=await page.evaluate(()=>{
    window.PiraliFullPath.activateDemo();
    window.PiraliFullPath.startChoice(11);
    let first=window.PiraliStageScoring.completeWave(1);
    let second=window.PiraliStageScoring.completeWave(2);
    return {first,second,health,maxHealth,level};
   });
   assert.equal(wave.first,150);assert.equal(wave.second,150);
   const premiumStage1=await page.evaluate(()=>{
    window.PiraliFullPath.startChoice(1);
    let gains=0;for(let i=0;i<100;i++)gains+=window.PiraliStageScoring.awardKill(true);
    return {score,maxHealth,shotgun:window.PiraliAlphaGear.status().owned,gains};
   });
   assert.equal(premiumStage1.maxHealth,7);assert.equal(premiumStage1.shotgun,true);
   assert.ok(premiumStage1.gains<=250/2+1,'Stage1 max budget 125');
   await page.evaluate(()=>startGame());
   const normal=await page.evaluate(()=>({level,health,maxHealth,shotgun:window.PiraliAlphaGear.status().owned,paid:window.PiraliFullPath.isActive()}));
   assert.equal(normal.level,1);assert.equal(normal.health,5);assert.equal(normal.maxHealth,5);assert.equal(normal.shotgun,false);assert.equal(normal.paid,false);
   assert.deepEqual(errors,[],'Uncaught page errors');
   console.log('PASS '+variant+': 0.50 GEL no-charge demo, 11 tappable stage pins, registration, stage10/11 shotgun+7 hearts, 50% coins/waves, normal mode unchanged');
   await page.close();
  }
 }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
