'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),contentTypes={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{
 let address=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+address);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,blob)=>{if(err){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':contentTypes[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(blob);});
});
const rect=e=>{let r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
function intersect(a,b){return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top}
async function run(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
 try{
 for(const variant of ['play','dev']){
  for(const viewport of [{width:320,height:690},{width:360,height:760},{width:412,height:915},{width:760,height:360}]){
   const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,deviceScaleFactor:2});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));await page.route(/firebaseio\.com/,r=>r.abort());
   const response=await page.goto(base+'/beta128-'+variant+'/index.html',{waitUntil:'load',timeout:45000});
   assert.equal(response.status(),200);
   assert.equal(await page.evaluate(()=>window.PiraliGameVersion),'1.28-classic.'+variant);
   await page.evaluate(()=>startGame());
   await page.locator('#pirali-name-input').fill('Dato');await page.locator('.pirali-name-confirm').click();
   const measurements=await page.evaluate(()=>{
     inventory.laurelShield=1;inventory.medals=3;updateInventoryUI();window.PiraliMiniMap.render();
     window.PiraliHud128?.align();
     const rect=e=>{let r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
     const score=document.querySelector('#ui > .ui-panel:last-child'),inv=document.querySelector('#inventory'),mini=document.querySelector('#pirali-mini-map'),canvas=document.querySelector('#pirali-mini-map-canvas');
     const tester=document.querySelector('#pirali-scenery-test-panel');
     return {score:rect(score),inv:rect(inv),mini:rect(mini),canvas:rect(canvas),
       hasMedal:document.querySelector('#inv-medals').classList.contains('visible'),
       hasLaurel:document.querySelector('#inv-herbs').classList.contains('visible'),
       tester:tester?rect(tester):null,hasMiniLegend:!!mini.querySelector('.pirali-mini-legend'),collapsed:mini.classList.contains('collapsed')};
   });
   const m=measurements;
   assert.equal(m.hasMedal,true);assert.equal(m.hasLaurel,true);
   assert.ok(m.inv.top>=m.score.bottom+3,'Rewards are not below score');
   assert.ok(!intersect(m.inv,m.mini),'Rewards collide with minimap');
   assert.ok(m.inv.left>=viewport.width*.5,'Rewards are not right aligned');
   assert.ok(m.inv.right<=viewport.width+1,'Rewards out of screen');
   assert.ok(!m.hasMiniLegend,'Old legend returned');
   assert.ok(m.mini.width-m.canvas.width<=12,'Minimap right empty gutter '+(m.mini.width-m.canvas.width));
   assert.ok(m.mini.right<=viewport.width*.53,'Minimap too wide');
   if(m.tester)assert.ok(!intersect(m.tester,m.inv),'DEV control covers rewards');
   // Gameplay smoke after positioning
   const count=await page.evaluate(()=>{let n=0;for(let stage=1;stage<=11;stage++){level=stage;genWorld();update(1);render();n++}return n});
   assert.equal(count,11);
   // Minimap toggle still functions
   await page.locator('#pirali-mini-map-toggle').click();assert.equal(await page.evaluate(()=>document.querySelector('#pirali-mini-map').classList.contains('collapsed')),true);
   await page.locator('#pirali-mini-map-toggle').click();assert.equal(await page.evaluate(()=>document.querySelector('#pirali-mini-map').classList.contains('collapsed')),false);
   assert.deepEqual(errors,[],'JS errors '+variant);
   console.log('PASS '+variant+' '+viewport.width+'x'+viewport.height+' scoreBottom='+Math.round(m.score.bottom)+' invTop='+Math.round(m.inv.top)+' inventory=('+Math.round(m.inv.left)+','+Math.round(m.inv.top)+') mapWidth='+Math.round(m.mini.width)+' canvasWidth='+Math.round(m.canvas.width)+' gap='+Math.round(m.mini.width-m.canvas.width)+' no overlap, 11 stages, toggle');
   await context.close();
  }
 }
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
run().catch(e=>{console.error(e);server.close();process.exitCode=1;});
