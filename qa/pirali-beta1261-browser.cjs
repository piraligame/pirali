'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname),target=path.resolve(root,'.'+rel);
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(target,(err,buf)=>{if(err){res.writeHead(404).end();return;}
 const ext=path.extname(target),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.mp4':'video/mp4'};
 res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});res.end(buf);});
});
async function test(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
 try{
  for(const variant of ['play','dev']){
   const context=await browser.newContext({viewport:{width:412,height:915},deviceScaleFactor:2,isMobile:true,hasTouch:true});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route(/firebaseio\.com/,route=>route.abort());
   const response=await page.goto(url+'/beta1261-'+variant+'/index.html',{waitUntil:'load',timeout:35000});
   assert.equal(response.status(),200);await page.waitForTimeout(300);
   await page.evaluate(()=>startGame());
   assert.equal(await page.locator('#pirali-name-registration').count(),1);
   assert.equal(await page.evaluate(()=>running),false,'Name gate must block the world');
   const input=page.locator('#pirali-name-input'),button=page.locator('.pirali-name-confirm');
   assert.equal(await button.isDisabled(),true);
   for(const invalid of ['  ','აბ','AB','22','a1','ana1','abc!']){
     await input.fill(invalid);assert.equal(await button.isDisabled(),true,invalid);
   }
   const valid=await page.evaluate(()=>['ნიკა','Anna','Аня','中国人'].map(x=>window.PiraliPlayerIdentity.check(x).valid));
   assert.deepEqual(valid,[true,true,true,true]);
   await input.fill('ანა');assert.equal(await button.isEnabled(),true);
   await button.click();
   assert.equal(await page.locator('#pirali-name-registration').count(),0);
   let data=await page.evaluate(()=>({
    name:localStorage.getItem('pirali_player_name'),playing:running,registered:window.PiraliPlayerIdentity.isRegistered(),
    stats:JSON.parse(localStorage.getItem(window.PiraliVisualPreviewReadonly?'pirali_personal_stats_beta_1_0_s1_dev_preview':'pirali_personal_stats_beta_1_0_s1_rc'))
   }));
   assert.equal(data.name,'ანა');assert.equal(data.playing,true);assert.equal(data.registered,true);
   assert.ok(data.stats.profiles['ანა'].runs>=1);
   await page.reload({waitUntil:'load'});await page.evaluate(()=>startGame());
   assert.equal(await page.locator('#pirali-name-registration').count(),0,'Return visit cannot ask again');
   let stat=await page.evaluate(()=>JSON.parse(localStorage.getItem(window.PiraliVisualPreviewReadonly?'pirali_personal_stats_beta_1_0_s1_dev_preview':'pirali_personal_stats_beta_1_0_s1_rc')).profiles['ანა'].runs);
   assert.ok(stat>=2,'Repeated visits retain same device profile and stats');
   assert.equal((await page.locator('.pirali-player-name').textContent()).includes('ანა'),true);
   assert.equal(await page.evaluate(()=>window.PiraliAlpha014Test),variant==='dev');
   assert.deepEqual(errors,[],'Browser errors '+variant);
   console.log('PASS mobile '+variant+': min 3 Unicode letters, cannot skip, save, reload identity/stats, role isolation, no JS errors');
   await context.close();
  }
  // Migration of a legacy 2-letter name, without resetting existing local stats.
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();await page.route(/firebaseio\.com/,r=>r.abort());
  await page.goto(url+'/beta1261-play/index.html',{waitUntil:'load'});
  await page.evaluate(()=>{
   localStorage.setItem('pirali_player_name','ab');
   localStorage.setItem('pirali_personal_stats_beta_1_0_s1_rc',JSON.stringify({version:1,profiles:{ab:{runs:5,wins:1,defeats:0,kills:100,bestScore:500,bestRunMs:null,stageBestMs:Array(11).fill(null),achievements:{firstBlood:1,hundredKills:2},maxReachedStage:3}}}));
   startGame();
  });
  assert.equal(await page.locator('#pirali-name-registration').count(),1);
  await page.locator('#pirali-name-input').fill('ნინო');await page.locator('.pirali-name-confirm').click();
  let migrated=await page.evaluate(()=>JSON.parse(localStorage.getItem('pirali_personal_stats_beta_1_0_s1_rc')).profiles['ნინო']);
  assert.ok(migrated.runs>=6);assert.equal(migrated.kills,100);assert.ok(migrated.achievements.hundredKills);
  console.log('PASS legacy name migration: 2-letter name requires registration; 100 kills/old stats retained');
  await context.close();
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
test().catch(e=>{console.error(e);server.close();process.exitCode=1;});
