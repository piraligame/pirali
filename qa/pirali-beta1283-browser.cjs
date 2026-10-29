'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(target,(error,data)=>{
  if(error){res.writeHead(404).end();return;}
  const ext=path.extname(target),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.json':'application/json'};
  res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
 });
});
async function run(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
 try{
  for(const variant of ['play','dev']){
   for(const viewport of [{width:360,height:760},{width:412,height:915}]){
    const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,deviceScaleFactor:2});
    const page=await context.newPage(),errors=[],requests=[];
    page.on('pageerror',e=>errors.push(e.message));
    const rows=[['Dato',6075],['Alpha',600],['Bravo',250],['Charlie',50],['Echo',30]]
      .map(([name,score],i)=>({name,score,level:2,season:'pirali_beta_1_0_s1',runId:'beta126-old-'+(i+1),ts:i+1}));
    await page.route(/firebaseio\.com/,route=>{
     requests.push(route.request().method());
     if(route.request().method()==='GET')route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(Object.fromEntries(rows.map((r,i)=>['entry'+i,r])))});
     else route.abort();
    });
    const res=await page.goto(base+'/beta1283-'+variant+'/index.html',{waitUntil:'load',timeout:45000});
    assert.equal(res.status(),200);
    assert.equal(await page.evaluate(()=>window.PiraliGameVersion),'1.28.3-classic.'+variant);
    await page.evaluate(()=>startGame());
    await page.locator('#pirali-name-input').fill('Dato');await page.locator('.pirali-name-confirm').click();
    await page.evaluate(()=>{score=101;level=1;showGameOver();});
    await page.waitForFunction(()=>document.querySelector('.pirali-run-rank-foot')?.textContent?.includes('6,075'),null,{timeout:15000});
    const state=await page.evaluate(()=>{
     const screen=document.querySelector('#screen'),card=screen.querySelector('.pirali-run-rank');
     return {score:screen.querySelector('.score-reveal')?.textContent,
      title:card?.querySelector('.pirali-run-rank-title')?.textContent,
      rank:card?.querySelector('.pirali-run-rank-place')?.textContent,
      foot:card?.querySelector('.pirali-run-rank-foot')?.textContent,
      cloud:!!screen.querySelector('.pirali-cloud-status'),retry:!!screen.querySelector('.pirali-retry-firebase'),
      text:screen.innerText};
    });
    assert.equal(state.score,'101');
    assert.ok(state.title.includes('საუკეთესო შედეგი'));
    assert.ok(state.rank.includes('№1 / 5 მოთამაშიდან'),state.rank);
    assert.ok(state.foot.includes('TOP 30-ში მოხვდი!'),state.foot);
    assert.ok(state.foot.includes('საუკეთესო: 6,075'),state.foot);
    if(variant==='play')assert.ok(state.foot.includes('ონლაინ რეიტინგი'),state.foot);
    assert.equal(state.cloud,false);assert.equal(state.retry,false);
    assert.ok(requests.every(method=>method==='GET'),'Preview cannot write Firebase');
    assert.deepEqual(errors,[],'Page exceptions '+variant);
    console.log('PASS '+variant+' '+viewport.width+'x'+viewport.height+': original Beta 1.26 rank=№1 / 5, personal best=6075, current attempt=101, full TOP 30 details, zero Firebase writes/errors');
    await context.close();
   }
  }
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(e=>{console.error(e);server.close();process.exitCode=1});
