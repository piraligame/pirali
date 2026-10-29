'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.mp3':'audio/mpeg','.wav':'audio/wav'};
const server=http.createServer((req,res)=>{
 let rel;try{rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return;}
 const target=path.resolve(root,'.'+rel);
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(target,(err,data)=>{if(err){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':type[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
});
async function run(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
 try{
  for(const variant of ['play','dev']){
   const context=await browser.newContext({viewport:{width:412,height:915},deviceScaleFactor:2,isMobile:true,hasTouch:true});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route(/firebaseio\.com/,route=>route.abort());
   let response=await page.goto(url+'/beta126-'+variant+'/index.html',{waitUntil:'load',timeout:40000});
   assert.equal(response.status(),200);
   await page.waitForTimeout(650);
   const before=await page.evaluate(()=>({title:document.querySelector('.menu-version')?.textContent,developer:window.PiraliAlpha014Test,panel:!!document.querySelector('#pirali-scenery-test-panel'),minimap:!!window.PiraliMiniMap,boss:!!window.PiraliBoss126,ai:!!window.PiraliTacticalAI,replay:!!document.querySelector('.menu-replay,.pirali-replay')}));
   assert.match(before.title,/1\.26/);assert.equal(before.developer,variant==='dev');
   assert.equal(before.panel,variant==='dev');
   assert.equal(before.minimap,true);assert.equal(before.boss,true);assert.equal(before.ai,true);assert.equal(before.replay,false);
   const played=await page.evaluate(()=>{
     localStorage.setItem('pirali_player_name','qa_test_126');
     startGame();
     const stages=[];
     for(let n=1;n<=11;n++){
       level=n;genWorld();update(1);render();
       stages.push({stage:n,enemies:enemies.filter(e=>e.alive).length,boss:!!boss?.alive});
     }
     return {running,stages};
   });
   assert.equal(played.running,true);
   assert.equal(played.stages.length,11);
   assert.ok(played.stages.every(x=>x.enemies>=0));
   await page.evaluate(()=>{level=1;genWorld();window.PiraliMiniMap.render();});
   if(variant==='dev'){
     let levelNow=await page.evaluate(()=>{
       document.querySelector('#pirali-scenery-test-panel button[data-level="7"]').click();
       return level;
     });assert.equal(levelNow,7);
   }
   await page.waitForTimeout(300);
   assert.deepEqual(errors,[],'Uncaught '+variant+' browser errors');
   console.log('PASS Mobile Chrome '+variant+': menus, 11 stage smoke cycles, AI, boss/minimap, no replay, no JS exceptions'+(variant==='dev'?', DEV stage selector':''));
   await context.close();
  }
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(e=>{console.error(e);server.close();process.exitCode=1});
