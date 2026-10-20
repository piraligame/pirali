/* Real Chrome responsive QA for approved Study D Alpha 0.14 HUD adjustment. */
const fs=require('fs'),path=require('path'),os=require('os'),{spawn,execFileSync}=require('child_process'),{pathToFileURL}=require('url');
const root=path.resolve(__dirname,'../alpha014-test'),port=9747,wait=n=>new Promise(r=>setTimeout(r,n));
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
 let results=[];
 for(const [name,width,height] of [['portrait',390,844],['landscape',844,390]]){
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:name==='portrait'?2:1,mobile:true});
  const url=process.env.PIRALI_HUD_URL||pathToFileURL(path.join(root,'index.html')).href;
  await call('Page.navigate',{url});
  for(let i=0;i<60;i++){if(await js('!!window.PiraliAlphaGear && !!document.querySelector(".main-menu-panel")'))break;await wait(180)}
  console.log('QA_STAGE_INIT',name);
  await js('localStorage.setItem("pirali_player_name","HUD-QA-NO-UPLOAD");startGame();level=5;genWorld();window.PiraliAlphaGear.pickup({type:"alpha-shotgun",x:P.x,y:P.y});window.PiraliAlphaGear.updateUI();');
  console.log('QA_STAGE_READY',name);
  await wait(450);
  console.log('QA_MEASURE',name);
  const before=await js(`(()=>{
   const get=id=>{let e=document.getElementById(id);const r=e.getBoundingClientRect();return{id,x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom,visible:r.width>0&&r.height>0}};
   const shells=document.querySelectorAll('.alpha-shell-cartridge');
   const sw=document.getElementById('alpha-weapon-switch');
   return {shotgun:window.PiraliAlphaGear.status(),dash:get('btn-dash'),bar:get('dash-cd'),switch:get('alpha-weapon-switch'),
    fire:get('btn-shoot'),shells:shells.length,lit:[...shells].filter(x=>!x.classList.contains('is-empty')).length,
    shown:sw.textContent,hiddenHud:get('alpha-shell-hud').visible,dashParent:document.getElementById('dash-cd').parentElement.className,
    version:document.querySelector(".menu-version")?.textContent}
  })()`);
  if(before.switch.y>=before.dash.y)throw Error(name+' switch is not above dash');
  if(before.dashParent!=='alpha014-dash-stack'||before.bar.bottom>before.dash.y-3)throw Error(name+' dash bar not immediately above button: '+JSON.stringify(before));
  if(Math.abs((before.bar.x+before.bar.w/2)-(before.dash.x+before.dash.w/2))>2)throw Error(name+' dash bar center mismatch');
  if(!before.switch.visible||before.hiddenHud||before.shells!==4||before.lit!==4||!before.shown.includes('4'))throw Error(name+' shotgun shells not visible '+JSON.stringify(before));
  if(!before.version?.includes('0.14'))throw Error('Wrong version');
  // Change shell count through same gameplay function, confirm live UI text and cartridge count.
  await js('shootCD=0;window.PiraliAlphaGear.fireIfSelected()');
  const after=await js('({ammo:window.PiraliAlphaGear.status().shells,lit:[...document.querySelectorAll(".alpha-shell-cartridge")].filter(x=>!x.classList.contains("is-empty")).length,text:document.getElementById("alpha-weapon-switch").textContent})');
  if(after.ammo!==3||after.lit!==3||!after.text.includes('3'))throw Error(name+' shell count did not update '+JSON.stringify(after));
  await js('dashCD=DASH_COOLDOWN/2;updateDashUI()');
  const dashFill=await js('parseFloat(document.getElementById("dash-fill").style.width)');
  if(Math.abs(dashFill-50)>3)throw Error('Dash cooldown failed '+dashFill);
  await wait(140);
  await capture('alpha014-hud-'+name+'.png');
  results.push({name,before,after,dashFill});
 }
 console.log('PIRALI_ALPHA014_HUD_QA_OK '+JSON.stringify({results,errors,badAssets,writes}));
 if(errors.length||badAssets.length||writes.length)throw Error('Network/JS regression errors');
})().catch(e=>{console.error('PIRALI_ALPHA014_HUD_QA_FAIL',e.stack||String(e));process.exitCode=1}).finally(()=>{try{ws?.close()}catch{};if(browser?.pid)try{execFileSync('taskkill.exe',['/PID',String(browser.pid),'/T','/F'],{stdio:'ignore'})}catch{}});
