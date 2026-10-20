const fs=require('fs'),path=require('path'),os=require('os'),{spawn,execFileSync}=require('child_process'),{pathToFileURL}=require('url');
const root=__dirname,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe',port=9728;
const profile=path.join(os.tmpdir(),'pirali-simona-014-qa-'+Date.now());
const wait=n=>new Promise(r=>setTimeout(r,n));
let browser,ws,sequence=0;const pending=new Map(),errors=[];
async function run(){
 browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu-sandbox','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let tabs;for(let n=0;n<50;n++){try{tabs=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();if(tabs.some(t=>t.type==='page'))break}catch{}await wait(150)}
 const page=tabs.find(t=>t.type==='page');if(!page)throw Error('Chrome launch failed');
 ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
 ws.onmessage=e=>{const x=JSON.parse(e.data);if(x.id&&pending.has(x.id)){pending.get(x.id)(x);pending.delete(x.id)}if(x.method==='Runtime.exceptionThrown')errors.push(x.params.exceptionDetails.exception?.description||x.params.exceptionDetails.text);if(x.method==='Log.entryAdded'&&x.params.entry.level==='error')errors.push(x.params.entry.text);if(x.method==='Network.responseReceived'&&x.params.response.status>=400)errors.push(x.params.response.status+': '+x.params.response.url)};
 function send(method,params={}){return new Promise((r,j)=>{const id=++sequence;pending.set(id,r);ws.send(JSON.stringify({id,method,params}));setTimeout(()=>{if(pending.has(id)){pending.delete(id);j(Error('CDP timeout '+method))}},14000)})}
 async function js(expr){const res=await send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});if(res.result.exceptionDetails)throw Error(res.result.exceptionDetails.exception?.description||res.result.exceptionDetails.text);return res.result.result.value}
 await send('Runtime.enable');await send('Log.enable');await send('Page.enable');await send('Network.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1200,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:process.env.PIRALI_LAB_URL||pathToFileURL(path.join(root,'index.html')).href});
 await wait(1250);
 const first=await js('(()=>{const a=document.querySelector("#old"),b=document.querySelector("#next");const check=c=>{const d=c.getContext("2d").getImageData(c.width/2|0,c.height/2|0,1,1).data;return [...d]};return {old:check(a),next:check(b),oldSize:[a.width,a.height],nextSize:[b.width,b.height],study:window.PiraliSimona014?.metadata,tiles:document.querySelectorAll(".tile").length,headings:[...document.querySelectorAll("h2")].map(e=>e.textContent)}})()');
 await js('document.querySelector("[data-state=run]").click()');await wait(280);
 const mode=await js('({active:document.querySelector("[data-state=run]").getAttribute("aria-pressed"),time:performance.now()})');
 const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(root,'simona-comparison.png'),Buffer.from(shot.result.data,'base64'));
 await js('document.querySelector("[data-state=fire]").click();document.querySelector("#turn").click()');await wait(260);
 const after=await js('({active:document.querySelector("[data-state=fire]").getAttribute("aria-pressed"),canTurn:true,directionTiles:document.querySelectorAll(".tile").length})');
 await js('document.querySelector("[data-state=sword]").click()');await wait(270);
 const sword=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
 fs.writeFileSync(path.join(root,'simona-sword.png'),Buffer.from(sword.result.data,'base64'));
 await js('document.querySelector("[data-state=shotgun]").click()');await wait(200);
 const shotgun=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
 fs.writeFileSync(path.join(root,'simona-shotgun.png'),Buffer.from(shotgun.result.data,'base64'));
 console.log('SIMONA_014_QA',JSON.stringify({first,mode,after,errors,comparisonPng:'simona-comparison.png',swordPng:'simona-sword.png',shotgunPng:'simona-shotgun.png'}));
 if(errors.length)throw Error('JS ERRORS '+JSON.stringify(errors));
 if(first.tiles!==8||first.old[3]===0||first.next[3]===0)throw Error('Canvas paint failed');
}run().catch(e=>{console.error('QA_FAIL',e.stack||e);process.exitCode=1}).finally(()=>{try{ws?.close()}catch{};if(browser?.pid){try{execFileSync('taskkill.exe',['/PID',String(browser.pid),'/T','/F'],{stdio:'ignore'})}catch{}}});
