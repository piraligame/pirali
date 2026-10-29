'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const uri=decodeURIComponent(new URL(req.url,'http://localhost').pathname),target=path.resolve(root,'.'+uri);
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(target,(err,data)=>{if(err){res.writeHead(404).end();return;}
 const ext=path.extname(target),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.json':'application/json','.svg':'image/svg+xml','.mp4':'video/mp4'};
 res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
});
async function run(){
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
 try{
 for(const v of ['play','dev']){
  const context=await browser.newContext({viewport:{width:360,height:760},deviceScaleFactor:2,isMobile:true,hasTouch:true,acceptDownloads:true});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route(/firebaseio\.com/,route=>route.abort());
  const response=await page.goto(url+'/beta127-'+v+'/index.html',{waitUntil:'load',timeout:40000});
  assert.equal(response.status(),200);
  const ver=await page.evaluate(()=>window.PiraliGameVersion);
  assert.equal(ver,'1.27-classic.'+v);
  await page.evaluate(()=>startGame());
  const input=page.locator('#pirali-name-input'),confirm=page.locator('.pirali-name-confirm');
  assert.equal(await confirm.isDisabled(),true);
  await input.fill('ab');assert.equal(await confirm.isDisabled(),true);
  await input.fill('Dato');await confirm.click();
  assert.equal(await page.evaluate(()=>running),true);
  const levels=await page.evaluate(()=>{
   const list=[];
   for(let n=1;n<=11;n++){
    level=n;genWorld();update(1);render();
    const objects=window.PiraliProps.get();
    list.push({n,count:objects.length,alive:objects.filter(x=>x.alive).length});
   }
   level=1;genWorld();return list;
  });
  assert.equal(levels.length,11);
  assert.ok(levels.some(x=>x.count>0),'New props should spawn in at least one level');
  const prop=await page.evaluate(()=>{
   const props=window.PiraliProps.get(),first=props.find(x=>x.kind==='crate');
   if(!first)return {found:false};
   window.PiraliProps.sword(first.x-20,first.y,0,74,1.5);
   window.PiraliProps.sword(first.x-20,first.y,0,74,1.5);
   const after=window.PiraliProps.get();
   return {found:true,alive:after.find(x=>x.x===first.x&&x.y===first.y)?.alive};
  });
  if(prop.found)assert.equal(prop.alive,false,'Two melee hits break a crate');
  const before=await page.evaluate(()=>window.PiraliStatsBackup.exportData());
  assert.equal(before.name,'Dato');
  const tested=await page.evaluate(()=>{
   const api=window.PiraliStatsBackup;
   const backup=api.exportData();
   try{api.restore({...backup,name:'Other'});return {rejected:false};}
   catch(e){const data=api.restore(backup);
     return {rejected:true,kills:data.kills,original:backup.profile.kills};
   }
  });
  assert.equal(tested.rejected,true);
  assert.ok(tested.kills>=tested.original);
  await page.evaluate(()=>window.PiraliStatsBackup.open());
  const inputFile=page.locator('#pirali-backup-overlay input[type=file]');
  await inputFile.setInputFiles({name:'PIRALI-stats.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(before))});
  assert.equal(await page.locator('#pirali-backup-overlay button').nth(2).isEnabled(),true,'Explicit confirm enabled only after valid file');
  await page.locator('#pirali-backup-overlay button').nth(2).click();
  assert.equal((await page.locator('.pirali-backup-status').textContent()).length>0,true);
  const dlPromise=page.waitForEvent('download');
  await page.locator('#pirali-backup-overlay button').first().click();
  const download=await dlPromise;
  assert.match(download.suggestedFilename(),/PIRALI-stats.*\.json/);
  await page.reload({waitUntil:'load'});
  await page.evaluate(()=>startGame());
  assert.equal(await page.locator('#pirali-name-registration').count(),0);
  const stats=await page.evaluate(()=>window.PiraliStatsBackup.exportData());
  assert.ok(stats.profile.runs>=1);
  assert.equal(await page.evaluate(()=>window.PiraliAlpha014Test),v==='dev');
  assert.deepEqual(errors,[],'Uncaught errors '+v);
  console.log('PASS mobile '+v+' 360x760: name gate, 11 stages, props, stats export/import/reload, downloadable JSON, no JS errors');
  await context.close();
 }
 } finally {await browser.close();await new Promise(done=>server.close(done));}
}
run().catch(err=>{console.error(err);server.close();process.exitCode=1;});
