/* Real Chrome responsive QA for approved Study D Alpha 0.14 HUD adjustment. */
const fs=require('fs'),path=require('path'),os=require('os'),{spawn,execFileSync}=require('child_process'),{pathToFileURL}=require('url');
const root=path.resolve(__dirname,'../alpha015-test'),port=9763,wait=n=>new Promise(r=>setTimeout(r,n));
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
  const privacyBack=await js(`(()=>{
    const privacyButton=document.querySelector('.menu-privacy');
    if(!privacyButton)throw Error('Privacy menu button missing');
    privacyButton.click();
    if(!document.getElementById('pirali-privacy-overlay'))throw Error('Privacy did not open');
    const action=window.PiraliMobile.handleBack();
    if(document.getElementById('pirali-privacy-overlay'))throw Error('Privacy dialog did not close on Back');
    if(action!=='close-privacy')throw Error('Wrong Android Back action: '+action);
    return action;
  })()`);
  console.log('PRIVACY_BACK_PASS',name,privacyBack);
  await js('localStorage.setItem("pirali_player_name","HUD-QA-NO-UPLOAD");startGame();level=5;genWorld();window.PiraliAlphaGear.pickup({type:"alpha-shotgun",x:P.x,y:P.y});window.PiraliAlphaGear.updateUI();');

  const swordResult=await js(`(()=>{
   invincible=true;enemies=[];boss=null;swordCD=0;swordCombo=0;swordComboTimer=0;
   swordSwing();const normal=swordCD;
   if(Math.abs(normal-27.2)>0.001)throw Error('Normal cooldown');
   for(let i=0;i<27;i++)update(1);
   const blocked=swordCD;swordSwing();
   if(swordCD!==blocked)throw Error('Swing allowed before cooldown');
   update(1);swordSwing();const combo=swordCD;
   if(Math.abs(combo-19.2)>0.001)throw Error('Combo cooldown');
   for(let i=0;i<19;i++)update(1);
   const comboBlocked=swordCD;swordSwing();
   if(swordCD!==comboBlocked)throw Error('Combo early');
   update(1);swordSwing();
   if(Math.abs(swordCD-27.2)>0.001)throw Error('Next normal swing unavailable');
   swordCD=0;swordCombo=0;swordComboTimer=0;swordOn=false;swordT=0;
   return {normal,combo,earlySwingBlocked:true};
  })()`);
  console.log('SWORD_20_PERCENT_PASS',name,JSON.stringify(swordResult));
  console.log('QA_STAGE_READY',name);
  await wait(450);

  await call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  const rects=await js('(()=>{const r=id=>{let b=document.getElementById(id).getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}};return {joy:r("joy-zone"),sw:r("alpha-weapon-switch"),fire:r("btn-shoot")}})()');
  const point=(p,id)=>({x:p.x,y:p.y,id,radiusX:4,radiusY:4,force:1});
  const j=point(rects.joy,1),m={...j,y:j.y-35},sw=point(rects.sw,2),fire=point(rects.fire,3);
  const touch=(type,touchPoints)=>call('Input.dispatchTouchEvent',{type,touchPoints});
  await touch('touchStart',[j]);await touch('touchMove',[m]);
  const start=await js('({x:P.x,y:P.y})');
  await touch('touchStart',[m,sw]);
  const switched=await js('({selected:window.PiraliAlphaGear.status().selected,active:joy.active,dy:joy.dy})');
  if(switched.selected!=='mauser'||!switched.active||switched.dy===0)throw Error('Moving switch failed '+JSON.stringify(switched));
  await touch('touchEnd',[sw]);await wait(100);
  if(await js('window.PiraliAlphaGear.status().selected')!=='mauser')throw Error('Double toggle on release');
  await touch('touchStart',[m,fire]);await touch('touchStart',[m,fire,sw]);
  const action=await js('({selected:window.PiraliAlphaGear.status().selected,active:joy.active,dy:joy.dy,x:P.x,y:P.y})');
  if(action.selected!=='shotgun'||!action.active||action.dy===0)throw Error('Action switch failed '+JSON.stringify(action));
  await touch('touchEnd',[m,fire]);await touch('touchEnd',[sw]);await wait(100);
  if(await js('window.PiraliAlphaGear.status().selected')!=='shotgun')throw Error('Action release double toggle');
  const end=await js('({x:P.x,y:P.y})');
  if(Math.hypot(end.x-start.x,end.y-start.y)<1)throw Error('Player stopped moving');
  await touch('touchEnd',[]);
  await touch('touchStart',[sw]);await touch('touchEnd',[]);
  if(await js('window.PiraliAlphaGear.status().selected')!=='mauser')throw Error('Stationary touch failed');
  await js('document.getElementById("alpha-weapon-switch").click()');
  if(await js('window.PiraliAlphaGear.status().selected')!=='shotgun')throw Error('Accessible click failed');
  await js('window.PiraliAlphaGear.pickup({type:"alpha-shotgun",x:P.x,y:P.y});shootCD=0');
  console.log('MULTITOUCH_PASS',name,JSON.stringify({switched,action,start,end}));

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
  if(!before.version?.includes('0.15'))throw Error('Wrong version');
  // Change shell count through same gameplay function, confirm live UI text and cartridge count.
  await js('shootCD=0;window.PiraliAlphaGear.fireIfSelected()');
  const after=await js('({ammo:window.PiraliAlphaGear.status().shells,lit:[...document.querySelectorAll(".alpha-shell-cartridge")].filter(x=>!x.classList.contains("is-empty")).length,text:document.getElementById("alpha-weapon-switch").textContent})');
  if(after.ammo!==3||after.lit!==3||!after.text.includes('3'))throw Error(name+' shell count did not update '+JSON.stringify(after));
  await js('dashCD=DASH_COOLDOWN/2;updateDashUI()');
  const dashFill=await js('parseFloat(document.getElementById("dash-fill").style.width)');
  if(Math.abs(dashFill-50)>3)throw Error('Dash cooldown failed '+dashFill);
  await wait(140);
  // No repository screenshots needed for behavioral regression.
  if(name==='portrait'&&process.env.PIRALI_STORE_SCREENSHOT==='1'){
    await call('Emulation.setDeviceMetricsOverride',{width:390,height:720,deviceScaleFactor:2,mobile:true});
    await js("document.getElementById('lvlbanner').style.display='none';");
    await wait(180);
    await capture('../store-assets/screenshots/PIRALI_02_Gameplay.png');
    console.log('STORE_PLAYER_SCREENSHOT_CAPTURED');
  }
  results.push({name,before,after,dashFill});
 }
 console.log('PIRALI_ALPHA014_HUD_QA_OK '+JSON.stringify({results,errors,badAssets,writes}));
 if(errors.length||badAssets.length||writes.length)throw Error('Network/JS regression errors');
})().catch(e=>{console.error('PIRALI_ALPHA014_HUD_QA_FAIL',e.stack||String(e));process.exitCode=1}).finally(()=>{try{ws?.close()}catch{};if(browser?.pid)try{execFileSync('taskkill.exe',['/PID',String(browser.pid),'/T','/F'],{stdio:'ignore'})}catch{}});
