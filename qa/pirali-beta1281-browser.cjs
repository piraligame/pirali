'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 let url=decodeURIComponent(new URL(req.url,'http://localhost').pathname),target=path.resolve(root,'.'+url);
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(target,(e,blob)=>{if(e){res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(blob);});
});
async function run(){
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const host='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
 try{
 for(const variant of ['play','dev']){
  const context=await browser.newContext({viewport:{width:360,height:760},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const page=await context.newPage(),errors=[],firebase=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{if(req.url().includes('firebaseio.com'))firebase.push({method:req.method(),url:req.url()});});
  const response=await page.goto(host+'/beta1281-'+variant+'/index.html',{waitUntil:'load',timeout:45000});
  assert.equal(response.status(),200);
  assert.equal(await page.evaluate(()=>window.PiraliGameVersion),'1.28.1-classic.'+variant);
  await page.evaluate(()=>startGame());
  await page.locator('#pirali-name-input').fill('Dato');await page.locator('.pirali-name-confirm').click();
  const result=await page.evaluate(async()=>{
    score=175;level=2;showGameOver();
    await window.PiraliBetaSavePromise; // wait for local score persistence
    const screen=document.querySelector('#screen');
    const cloud=screen.querySelector('.pirali-cloud-status');
    return {text:screen.innerText,cloud:!!cloud,retry:!!screen.querySelector('.pirali-retry-firebase'),
       rank:!!screen.querySelector('.pirali-run-rank'),
       localState:lbLastPushStatus,score:document.querySelector('.score-reveal')?.textContent};
  });
  assert.equal(result.localState,'local');assert.equal(result.cloud,false);
  assert.equal(result.retry,false);assert.equal(result.rank,false);
  assert.equal(result.score,'175');
  assert.ok(!result.text.includes('6,075'));assert.ok(!result.text.includes('TOP 30-ში მოხვდი'));
  assert.ok(!result.text.includes('Firebase-ში ჩანაწერი ვერ დასრულდა'));
  assert.ok(!result.text.includes('ონლაინ რეიტინგი'));
  const info=await page.evaluate(async()=>{
    const rows=await lbFetch();return {onlineReadSucceeded:Array.isArray(rows),count:Array.isArray(rows)?rows.length:0};
  });
  assert.equal(info.onlineReadSucceeded,true,'Public Firebase should be readable in browser');
  assert.ok(firebase.some(r=>r.method==='GET'),'Expected Firebase READ request');
  assert.ok(firebase.every(r=>r.method==='GET'||r.method==='HEAD'),'Preview must never write real Firebase');
  const levels=await page.evaluate(()=>{let n=0;for(let stage=1;stage<=11;stage++){level=stage;genWorld();update(1);render();n++}return n;});
  assert.equal(levels,11);
  assert.deepEqual(errors,[],'JS errors '+variant);
  console.log('PASS '+variant+' local death results, no false Firebase error/extra best/online footer, real Firebase GET='+info.onlineReadSucceeded+', rows='+info.count+', writes=0, 11 stages, JS errors=0');
  await context.close();
 }
 }finally{await browser.close();await new Promise(done=>server.close(done));}
}
run().catch(e=>{console.error(e);server.close();process.exitCode=1});
