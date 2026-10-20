// QA isolated Alpha 0.14 browser developer test, no real Firebase writes.
const fs=require('fs'),path=require('path'),os=require('os'),{spawn,execFileSync}=require('child_process'),{pathToFileURL}=require('url');
const dir=path.resolve(__dirname,'../alpha014-test'),port=9768,wait=ms=>new Promise(r=>setTimeout(r,ms));
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile=path.join(os.tmpdir(),'pirali-alpha014-site-qa-'+Date.now());
let proc,ws,seq=0;const pending=new Map(),errors=[],writes=[],badAssets=[];
(async()=>{
 proc=spawn(chrome,['--headless=new','--no-first-run','--no-sandbox','--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
 let tabs;for(let i=0;i<70;i++){try{tabs=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();if(tabs.find(x=>x.type==='page'))break}catch{}await wait(150)}
 const tab=tabs?.find(x=>x.type==='page');if(!tab)throw Error('Chrome unavailable');
 ws=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((a,b)=>{ws.onopen=a;ws.onerror=b;setTimeout(()=>b(Error('WS timeout')),5000)});
 ws.onmessage=e=>{const m=JSON.parse(e.data);
  if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}
  if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
  if(m.method==='Network.requestWillBeSent'&&/firebaseio\.com/i.test(m.params.request.url)&&!['GET','HEAD'].includes(m.params.request.method))writes.push(m.params.request.method);
  if(m.method==='Network.responseReceived'&&m.params.response.status>=400&&!m.params.response.url.includes('firebaseio.com'))badAssets.push(m.params.response.status+' '+m.params.response.url);
 };
 const call=(method,params={})=>new Promise((a,b)=>{const id=++seq;pending.set(id,a);ws.send(JSON.stringify({id,method,params}));setTimeout(()=>{if(pending.has(id)){pending.delete(id);b(Error('CDP timeout '+method))}},18000)});
 async function js(expr){const r=await call('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});if(r.result.exceptionDetails)throw Error(r.result.exceptionDetails.text);return r.result.result.value}
 await call('Page.enable');await call('Runtime.enable');await call('Network.enable');
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
 const url=process.env.PIRALI_QA_URL||pathToFileURL(path.join(dir,'index.html')).href;
 await call('Page.navigate',{url});
 for(let i=0;i<60;i++){if(await js('!!window.PiraliAlphaRoads && !!window.PiraliHybrid014 && !!document.querySelector(".main-menu-panel")'))break;await wait(150)}
 await wait(500);
 const initial=await js('({version:document.querySelector(".menu-version")?.textContent,hybrid:window.PiraliHybrid014?.isEnabled(),weapons:!!window.PiraliHybrid014?.metadata?.shotgun,preview:window.PiraliVisualPreviewReadonly===true,menu:!!document.querySelector(".main-menu-panel")})');
 if(!initial.version?.includes('0.14')||!initial.hybrid||!initial.weapons||!initial.preview||!initial.menu)throw Error('Wrong alpha 0.14 character / version '+JSON.stringify(initial));
 await js('localStorage.setItem("pirali_player_name","QA-DO-NOT-POST");startGame()');await wait(350);
 const check=await js('(()=>{const panel=document.getElementById("pirali-scenery-test-panel");const stages=[...panel?.querySelectorAll("[data-level]")||[]];if(stages.length===5)stages[4].click();const result={panel:!!panel,stages:stages.length,level:typeof level!=="undefined"?level:null,shotgun:!!window.PiraliAlphaGear?.status(),status:!!window.PiraliHybrid014?.isEnabled(),bossTeleports:panel?.querySelectorAll("[data-boss=visit]").length||0,churchTeleports:panel?.querySelectorAll("[data-church=visit]").length||0};if(stages.length===5)stages[0].click();return result})()');
 if(!check.panel||check.stages!==5||check.level!==5||!check.shotgun||!check.status||check.bossTeleports!==1||check.churchTeleports!==0)throw Error('Developer panel / stage 5 failed '+JSON.stringify(check));
 // Test write protection with fetch before any POST is issued (network must see no writes).
 const shield=await js('fetch("https://pirali-game-default-rtdb.firebaseio.com/scores.json",{method:"POST",body:"{}"}).then(()=>false,e=>e.message.includes("writes disabled"))');
 if(!shield||errors.length||writes.length||badAssets.length)throw Error('QA errors '+JSON.stringify({shield,errors,writes,badAssets}));
 console.log('PIRALI_ALPHA014_TEST_SUCCESS '+JSON.stringify({url,initial,check,shield,jsErrors:errors,firebaseWrites:writes,badAssets}));
})().catch(err=>{console.error('PIRALI_ALPHA014_TEST_FAILURE',err.stack||String(err));process.exitCode=1}).finally(()=>{try{ws?.close()}catch{}if(proc?.pid)try{execFileSync('taskkill.exe',['/PID',String(proc.pid),'/T','/F'],{stdio:'ignore'})}catch{}});
