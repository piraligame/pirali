const fs=require('fs'),path=require('path'),os=require('os'),{spawn,execFileSync}=require('child_process'),{pathToFileURL}=require('url');
const root=process.cwd(),port=9637,delay=ms=>new Promise(r=>setTimeout(r,ms)),profile=path.join(os.tmpdir(),'pirali-alpha-010-qa-'+Date.now());
const screenshots=path.join(root,'release-assets','visual-alpha011'),chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
let proc,ws,seq=0;const pending=new Map(),errors=[],firebaseWrites=[];
async function main(){
 fs.mkdirSync(profile,{recursive:true});fs.mkdirSync(screenshots,{recursive:true});
 proc=spawn(chrome,['--headless=new','--no-first-run','--no-sandbox','--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
 let pages;for(let i=0;i<60;i++){try{pages=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();if(pages.some(p=>p.type==='page'))break}catch{}await delay(200)}
 if(!pages?.length)throw Error('Chrome CDP not reachable');
 ws=new WebSocket(pages.find(x=>x.type==='page').webSocketDebuggerUrl);
 await new Promise((ok,fail)=>{ws.onopen=ok;ws.onerror=fail;setTimeout(()=>fail(Error('CDP connect timeout')),6000)});
 ws.onmessage=m=>{const x=JSON.parse(m.data);if(x.id&&pending.has(x.id)){pending.get(x.id)(x);pending.delete(x.id)}if(x.method==='Runtime.exceptionThrown')errors.push(x.params.exceptionDetails.exception?.description||x.params.exceptionDetails.text);if(x.method==='Network.requestWillBeSent'&&x.params.request.url.includes('firebaseio.com')&&x.params.request.method!=='GET')firebaseWrites.push(x.params.request.method)};
 const call=(method,params={})=>new Promise((ok,fail)=>{const id=++seq;pending.set(id,ok);ws.send(JSON.stringify({id,method,params}));setTimeout(()=>{if(pending.has(id)){pending.delete(id);fail(Error('CDP '+method+' timeout'))}},15000)});
 const js=async code=>{const r=await call('Runtime.evaluate',{expression:code,returnByValue:true});if(r.result.exceptionDetails)throw Error(r.result.exceptionDetails.exception?.description||'JS runtime exception');return r.result.result.value};
 const capture=async filename=>{const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(screenshots,filename),Buffer.from(r.result.data,'base64'))};
 await call('Runtime.enable');await call('Page.enable');await call('Network.enable');
 await call('Emulation.setDeviceMetricsOverride',{width:360,height:640,deviceScaleFactor:3,mobile:true});
 await call('Page.navigate',{url:pathToFileURL(path.join(root,'index.html')).href});
 await delay(1900);
 const loaded=await js("({menu:!!document.querySelector('.main-menu-panel'),version:document.querySelector('.menu-version')?.textContent,languages:[...document.querySelectorAll('.menu-language-option')].map(x=>x.dataset.piraliLang),gear:!!window.PiraliAlphaGear})");
 if(!loaded.menu||!loaded.version.includes('0.11')||loaded.languages.join(',')!=='ka,en,ru,zh'||!loaded.gear)throw Error('Startup FAILED '+JSON.stringify(loaded));
 const policy=await js("(()=>{const b=document.querySelector('.menu-privacy');if(!b)return{button:false};b.click();const f=document.querySelector('#pirali-privacy-overlay iframe');const opened=!!f&&f.getAttribute('src')==='privacy.html';document.querySelector('.pirali-privacy-close')?.click();PiraliLanguage.setLanguage('en');const english=document.querySelector('.menu-privacy')?.textContent;PiraliLanguage.setLanguage('ka');return{button:!!b,opened,closed:!document.getElementById('pirali-privacy-overlay'),english}})()");
 if(!policy.button||!policy.opened||!policy.closed||!policy.english.includes('PRIVACY'))throw Error('Privacy screen regression '+JSON.stringify(policy));
 await capture('01-main-menu-portrait.png');
 await js("localStorage.setItem('pirali_player_name','PIRALI-Alpha-QA');autoSaveScore=async()=>{};startGame()");
 await delay(400);await capture('02-first-level-portrait.png');
 const death={};for(const lang of ['ka','en','ru','zh']){
   death[lang]=await js("(()=>{PiraliLanguage.setLanguage('"+lang+"');score=500;health=5;PiraliCheckpoint.save(3);showGameOver();return{button:document.querySelector('.gameover-screen .alpha-outcome-menu')?.textContent,checkpoint:!!PiraliCheckpoint.get(),resumeButton:!!document.querySelector('.gameover-screen .menu-continue')}})()");
   if(!death[lang].button||death[lang].checkpoint||death[lang].resumeButton)throw Error('Death regression '+lang+' '+JSON.stringify(death[lang]));
   await js("goToMenu();startGame()");
 }
 const victory={};for(const lang of ['ka','en','ru','zh']){
   victory[lang]=await js("(()=>{PiraliLanguage.setLanguage('"+lang+"');showVictory();return{button:document.querySelector('.victory-screen .alpha-outcome-menu')?.textContent}})()");
   if(!victory[lang].button)throw Error('Victory missing menu '+lang);
   await js("document.querySelector('.victory-screen .alpha-outcome-menu').click();");
   await delay(80);
   const menu=await js("({className:document.getElementById('screen').className,visible:document.getElementById('screen').style.display,menu:!!document.querySelector('.main-menu-panel')})");
   if(!menu.menu||menu.visible==='none')throw Error('Victory button did not return to menu '+lang+' '+JSON.stringify(menu));
   await js("startGame()");
 }
 const different=new Set(Object.values(victory).map(x=>x.button));
 if(different.size!==4)throw Error('Victory translation not unique '+JSON.stringify(victory));
 await js("PiraliLanguage.setLanguage('ka');startGame();level=5;genWorld();window.PiraliAlphaGear.updateUI();showBanner(LEVEL_NAMES[level])");
 await delay(350);await capture('03-final-level-portrait.png');
 const shotgun=await js("({level,shotgun:window.PiraliAlphaGear.status(),pickups:typeof pickups!=='undefined'?pickups.filter(x=>x.type==='alpha-shotgun'||x.type==='alpha-shells').map(x=>x.type):[]})");
 if(shotgun.level!==5||!shotgun.pickups.includes('alpha-shotgun'))throw Error('Final stage shotgun missing '+JSON.stringify(shotgun));
 if(firebaseWrites.length||errors.length)throw Error('Runtime errors or Firebase writes '+JSON.stringify({firebaseWrites,errors}));
 console.log(JSON.stringify({passed:true,loaded,death,victory,shotgun,screenshots,errors,firebaseWrites}));
}
main().catch(e=>{console.error('PIRALI_ALPHA_QA_FAILURE',e.stack||String(e));process.exitCode=1}).finally(()=>{try{ws?.close()}catch{};if(proc?.pid)try{execFileSync('taskkill.exe',['/PID',String(proc.pid),'/T','/F'],{stdio:'ignore'})}catch{}});
