const fs=require('fs'),path=require('path'),os=require('os'),{spawn,execFileSync}=require('child_process'),{pathToFileURL}=require('url');
const root=__dirname,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe',port=9761;
const profile=path.join(os.tmpdir(),'simona-014-options-'+Date.now());
const wait=n=>new Promise(r=>setTimeout(r,n));
let browser,ws,seq=0;const waiting=new Map(),errors=[],requestErrors=[];
(async()=>{
 browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu-sandbox','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let tabs;for(let i=0;i<65;i++){try{tabs=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();if(tabs.find(x=>x.type==='page'))break}catch{}await wait(130)}
 if(!tabs?.length)throw Error('Chrome failed');
 ws=new WebSocket(tabs.find(x=>x.type==='page').webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;setTimeout(()=>reject(Error('WebSocket timeout')),5000)});
 ws.onmessage=evt=>{const m=JSON.parse(evt.data);
  if(m.id&&waiting.has(m.id)){waiting.get(m.id)(m);waiting.delete(m.id)}
  if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
  if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m.params.entry.text);
  if(m.method==='Network.responseReceived'&&m.params.response.status>=400)requestErrors.push(m.params.response.status+' '+m.params.response.url)
 };
 function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;waiting.set(id,resolve);ws.send(JSON.stringify({id,method,params}));setTimeout(()=>{if(waiting.has(id)){waiting.delete(id);reject(Error('CDP timeout '+method))}},18000)})}
 async function js(expr){const r=await send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});if(r.result.exceptionDetails)throw Error(r.result.exceptionDetails.text);return r.result.result.value}
 await send('Page.enable');await send('Runtime.enable');await send('Log.enable');await send('Network.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1320,height:1410,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:process.env.PIRALI_VARIANTS_URL||pathToFileURL(path.join(root,'index.html')).href});
 for(let i=0;i<65;i++){if(await js('!!window.PiraliVariantLab && document.getElementById("c0")?.width===660'))break;await wait(200)}
 await wait(370);
 const initial=await js('(()=>{const ids=["c0","c1","c2","c3"];const colors=ids.map(id=>{let c=document.getElementById(id),d=c.getContext("2d").getImageData(c.width/2|0,c.height/2|0,1,1).data;return [...d]});return {lab:window.PiraliVariantLab?.getState(),colors,rendered:ids.every(id=>document.getElementById(id).getContext("2d").getImageData(10,10,1,1).data[3]>0)}})()');
 const motionHash=()=>js('(()=>[...document.querySelectorAll("canvas.view")].map(c=>{const q=c.getContext("2d").getImageData(250,130,160,165).data;let hash=2166136261;for(let i=0;i<q.length;i+=13)hash=Math.imul(hash^q[i],16777619)>>>0;return hash}))()');
 const motionBefore=await motionHash();await wait(410);const motionAfter=await motionHash();
 const animated=motionBefore.map((h,i)=>h!==motionAfter[i]);
 const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
 fs.writeFileSync(path.join(root,'studyE-compare.png'),Buffer.from(shot.result.data,'base64'));
 await js('document.querySelector("[data-mode=sword]").click();document.querySelector("[data-dir=down]").click()');await wait(310);
 const next=await js('window.PiraliVariantLab.getState()');
 const sword=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
 fs.writeFileSync(path.join(root,'studyE-swords-down.png'),Buffer.from(sword.result.data,'base64'));
 await js('document.querySelector("[data-mode=shotgun]").click();document.querySelector("[data-dir=right]").click()');await wait(280);
 const shotgun=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
 fs.writeFileSync(path.join(root,'studyE-shotguns.png'),Buffer.from(shotgun.result.data,'base64'));
 console.log('SIMONA_ATELIER_F_QA',JSON.stringify({initial,next,animated,errors,requestErrors,files:['studyE-compare.png','studyE-swords-down.png','studyE-shotguns.png']}));
 if(!initial.rendered||!initial.lab?.ready||animated.some(v=>!v)||errors.length||requestErrors.length)throw Error('QA FAILED');
})().catch(e=>{console.error('QA_ERROR',e.stack||String(e));process.exitCode=1}).finally(()=>{try{ws?.close()}catch{};if(browser?.pid){try{execFileSync('taskkill.exe',['/PID',String(browser.pid),'/T','/F'],{stdio:'ignore'})}catch{}}});
