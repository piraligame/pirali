'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+rel);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(e,data)=>{if(e){res.writeHead(404).end();return;}
 const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json','.mp4':'video/mp4'};
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
});
async function run(){
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
 try{
 for(const v of ['play','dev']){
  const context=await browser.newContext({viewport:{width:360,height:760},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route(/firebaseio\.com/,r=>r.abort());
  const response=await page.goto(base+'/beta1271-'+v+'/index.html',{waitUntil:'load',timeout:40000});
  assert.equal(response.status(),200);
  const state=await page.evaluate(()=>({
   version:window.PiraliGameVersion,
   backupMenu:!!document.querySelector('.pirali-menu-backup'),
   hasBackupApi:!!window.PiraliStatsBackup?.autoSave,
   developer:window.PiraliAlpha014Test,
   replay:!!document.querySelector('.menu-replay')
  }));
  assert.equal(state.version,'1.27.1-classic.'+v);
  assert.equal(state.backupMenu,false);assert.equal(state.hasBackupApi,true);
  assert.equal(state.developer,v==='dev');assert.equal(state.replay,false);
  await page.evaluate(()=>startGame());
  assert.equal(await page.locator('.pirali-name-confirm').isDisabled(),true);
  await page.locator('#pirali-name-input').fill('Dato');
  await page.locator('.pirali-name-confirm').click();
  const initial=await page.evaluate(()=>{
   const key=window.PiraliVisualPreviewReadonly?'pirali_personal_stats_beta_1_0_s1_dev_preview':'pirali_personal_stats_beta_1_0_s1_rc';
   const name=localStorage.getItem('pirali_player_name'),raw=localStorage.getItem(key+'_autocopy_beta1271');
   return {name,snapshot:JSON.parse(raw),started:running};
  });
  assert.equal(initial.name,'Dato');assert.equal(initial.started,true);
  assert.ok(initial.snapshot?.entries?.dato?.data?.profile?.runs>=1,'Automatic backup created without button');
  const after=await page.evaluate(()=>{
   window.PiraliStats.kill();window.PiraliStats.kill();
   window.PiraliStatsBackup.autoSave(true);
   const key=window.PiraliVisualPreviewReadonly?'pirali_personal_stats_beta_1_0_s1_dev_preview':'pirali_personal_stats_beta_1_0_s1_rc';
   const copies=JSON.parse(localStorage.getItem(key+'_autocopy_beta1271'));
   const expected=copies.entries.dato.data.profile.kills;
   localStorage.setItem(key,'INVALID JSON');
   const restored=window.PiraliStats.get();
   return {expected,restored:restored.kills,backedUp:!!copies.entries.dato.savedAt,primaryValid:JSON.parse(localStorage.getItem(key)).version===1};
  });
  assert.ok(after.expected>=2);assert.equal(after.restored,after.expected);assert.equal(after.primaryValid,true);assert.equal(after.backedUp,true);
  const checkpoints=await page.evaluate(()=>{
   let count=0;
   for(let lvl=1;lvl<=11;lvl++){level=lvl;genWorld();update(1);render();count++;}
   return count;
  });assert.equal(checkpoints,11);
  await page.reload({waitUntil:'load'});await page.evaluate(()=>startGame());
  assert.equal(await page.locator('#pirali-name-registration').count(),0);
  assert.equal(await page.locator('.pirali-menu-backup').count(),0);
  assert.deepEqual(errors,[]);
  console.log('PASS '+v+' mobile 360x760: hidden backup UI, automatic local snapshots, corrupt stats recovery, 11 stage smoke, no JS errors');
  await context.close();
 }
 }finally{await browser.close();await new Promise(done=>server.close(done));}
}
run().catch(e=>{console.error(e);server.close();process.exitCode=1});
