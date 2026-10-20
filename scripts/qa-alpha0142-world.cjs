/* Real Chrome responsive QA for approved Study D Alpha 0.14 HUD adjustment. */
const fs=require('fs'),path=require('path'),os=require('os'),{spawn,execFileSync}=require('child_process'),{pathToFileURL}=require('url');
const root=path.resolve(__dirname,'../alpha0142-test'),port=9752,wait=n=>new Promise(r=>setTimeout(r,n));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe',profile=path.join(os.tmpdir(),'pirali014-hud-'+Date.now());
let browser,ws,seq=0;const pending=new Map(),errors=[],badAssets=[],writes=[];
(async()=>{
 browser=spawn(chrome,['--headless=new','--no-first-run','--no-sandbox','--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
 let tabs;for(let i=0;i<70;i++){try{tabs=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();if(tabs.find(x=>x.type==='page'))break}catch{}await wait(160)}
 const tab=tabs?.find(x=>x.type==='page');if(!tab)throw Error('Chrome CDP not found');
 ws=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((ok,fail)=>{ws.onopen=ok;ws.onerror=fail;setTimeout(()=>fail(Error('WS timeout')),6000)});
 ws.onmessage=msg=>{const x=JSON.parse(msg.data);
  if(x.id&&pending.has(x.id)){pending.get(x.id)(x);pending.delete(x.id)}
  if(x.method==='Runtime.exceptionThrown')errors.push(x.params.exceptionDetails.exception?.description||x.params.exceptionDetails.text);
  if(x.method==='Network.responseReceived'&&x.params.response.status>=400&&!x.params.response.url.includes('firebaseio.com'))badAssets.push(x.params.response.status+' '+x.params.response.url);
  if(x.method==='Network.requestWillBeSent'&&x.params.request.url.includes('firebaseio.com')&&x.params.request.method!=='GET')writes.push(x.params.request.method);
 };
 const call=(method,params={})=>new Promise((ok,fail)=>{const id=++seq;pending.set(id,ok);ws.send(JSON.stringify({id,method,params}));setTimeout(()=>{if(pending.has(id)){pending.delete(id);fail(Error('CDP timeout '+method))}},60000)});
 async function js(src){const r=await call('Runtime.evaluate',{expression:src,returnByValue:true,awaitPromise:true});if(r.result.exceptionDetails)throw Error(r.result.exceptionDetails.exception?.description||r.result.exceptionDetails.text);return r.result.result.value}
 const capture=async name=>{const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(root,name),Buffer.from(r.result.data,'base64'))};
 await call('Page.enable');await call('Runtime.enable');await call('Network.enable');

 await call('Emulation.setDeviceMetricsOverride',{width:844,height:600,deviceScaleFactor:1,mobile:true});
 await call('Page.navigate',{url:pathToFileURL(path.join(root,'index.html')).href});
 for(let i=0;i<60;i++){if(await js('!!window.PiraliAlphaGear && !!document.querySelector(".main-menu-panel")'))break;await wait(180)}
 const results=await js(`(()=>{
  localStorage.setItem('pirali_player_name','MAP-QA-NO-UPLOAD');startGame();invincible=true;
  const report=[];
  for(let stage=1;stage<=5;stage++){
   let count=0;
   for(let run=0;run<20;run++){
    level=stage;genWorld();
    for(let i=0;i<path.length;i++){
     const p=path[i];
     if(p.x<0||p.x>WW||p.y<0||p.y>WH)throw Error('Path outside map');
     if(i&&p.y>=path[i-1].y)throw Error('Road doubles back');
    }
    const last=path[path.length-1];
    if(last.x!==CHURCH_X||last.y!==CHURCH_Y+70)throw Error('Church disconnected');
    const guards=enemies.filter(e=>String(e.groupId).startsWith('church-guard-'));
    if(guards.length!==4)throw Error('Missing guards');
    for(let i=0;i<guards.length;i++){
     const e=guards[i];
     if(Math.hypot(e.x-CHURCH_X,e.y-CHURCH_Y)>430||e.y-e.patrol.radius<e.r)throw Error('Guard outside yard');
     for(let j=0;j<i;j++)if(Math.hypot(e.x-guards[j].x,e.y-guards[j].y)<150)throw Error('Clumped guards');
    }
    if(enemies.some(e=>e.x<e.r||e.x>WW-e.r||e.y<e.r||e.y>WH-e.r))throw Error('Enemy outside map');
    if(pickups.some(e=>e.y<0||e.y>WH))throw Error('Pickup outside map');
    if(stage===5&&Math.hypot(boss.x-CHURCH_X,boss.y-CHURCH_Y)>400)throw Error('Boss outside approach');
    count++;
   }
   // Let patrols run with the player far away: no clamping or piling at the edge.
   for(let frame=0;frame<180;frame++)update(1);
   const guards=enemies.filter(e=>String(e.groupId).startsWith('church-guard-'));
   for(let i=0;i<guards.length;i++)for(let j=0;j<i;j++)
    if(Math.hypot(guards[i].x-guards[j].x,guards[i].y-guards[j].y)<100)throw Error('Patrol guards clumped');
   report.push({stage,worlds:count,pathNodes:path.length,enemies:enemies.length,guards:guards.map(e=>({x:e.x,y:e.y})),end:path[path.length-1]});
  }
  return report;
 })()`);
 console.log('MAP_QA_PASS '+JSON.stringify(results));
 for(const stage of [1,5]){
  await js('level='+stage+';genWorld();running=false;P.x=CHURCH_X;P.y=CHURCH_Y+440;camX=CHURCH_X-W/2;camY=0;render();');
  await capture('../alpha0142-church-stage-'+stage+'.png');
 }
 if(errors.length||badAssets.length||writes.length)throw Error(JSON.stringify({errors,badAssets,writes}));
 console.log('ALPHA0142_QA_PASS no JS errors, missing assets or Firebase writes');
})().catch(e=>{console.error('PIRALI_ALPHA014_HUD_QA_FAIL',e.stack||String(e));process.exitCode=1}).finally(()=>{try{ws?.close()}catch{};if(browser?.pid)try{execFileSync('taskkill.exe',['/PID',String(browser.pid),'/T','/F'],{stdio:'ignore'})}catch{}});
