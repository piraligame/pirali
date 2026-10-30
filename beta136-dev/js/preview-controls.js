/* PIRALI Beta 1.22 DEV: ONLY stages 1–11 and optional immortality. Read-only web preview.
   Never bundled into Android APK, never writes production Firebase scores. */
(function(){
'use strict';
if(!window.PiraliVisualPreviewReadonly)return;
const LATEST_LABEL='Beta 1.36 გაუმჯობესებები';
let newestEnabled=true;
window.PiraliDevComparison=Object.freeze({
 enabled:()=>true, // Keep previous Beta 1.32 enhancements permanently enabled.
 latestEnabled:()=>newestEnabled,label:()=>LATEST_LABEL,
 setEnabled(next){
  newestEnabled=!!next;
  document.getElementById('screen')?.classList.toggle('pirali-menu136-on',newestEnabled);
  // Only the latest menu position / ammunition visuals change.
  return newestEnabled;
 }
});
function ready(){
 let immortal=false;
 const normalTakeDmg=takeDmg;
 takeDmg=function(){
  if(window.PiraliAlpha014Test&&immortal)return;
  return normalTakeDmg.apply(this,arguments);
 };
 const el=document.createElement('aside');
 el.id='pirali-scenery-test-panel';
 el.style.cssText='position:fixed;top:230px;left:7px;right:auto;z-index:99995;padding:8px;background:rgba(15,28,24,.92);border:1px solid #cfa369;border-radius:9px;box-shadow:0 7px 25px #0009;width:172px;max-width:45vw;display:none;gap:6px;flex-direction:column;overflow-y:auto;overscroll-behavior:contain;color:#f6ddab;font:600 11px system-ui;pointer-events:auto';
 const header=document.createElement('div');header.textContent='🧪 ტესტი ▾';header.style.cssText='text-align:center;font-size:11px;cursor:pointer;padding:3px 0';header.setAttribute('role','button');header.tabIndex=0;
 const row=document.createElement('div');row.style.cssText='display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:3px';
 const btnstyle='border:1px solid #ba9664;background:#414536;color:#f9deb0;border-radius:5px;padding:6px 0;font:700 11px system-ui;cursor:pointer';
 const levelNames=PIRALI_LEVELS.map(x=>x.ka);
 let selected=1;
 const levelButtons=[];
 for(let n=1;n<=11;n++){
  const b=document.createElement('button');b.type='button';b.dataset.level=String(n);b.textContent=String(n);
  b.style.cssText=btnstyle;
  b.addEventListener('pointerdown',e=>e.stopPropagation());
  b.addEventListener('click',e=>{
   e.preventDefault();e.stopPropagation();
   if(typeof running==='undefined'||!running||typeof level==='undefined'||typeof genWorld!=='function')return;
   selected=n;level=n;if(n===11)window.PiraliStageScoring?.beginEndless();genWorld();updateScoreUI();
   window.PiraliStats?.stageReady(n);
   if(typeof updateAmmoUI==='function')updateAmmoUI();
   for(let k=0;k<levelButtons.length;k++)levelButtons[k].style.background=k+1===selected?'#97713e':'#414536';
   title.textContent=levelNames[n-1]||'';
  });
  levelButtons.push(b);row.appendChild(b);
 }
 const title=document.createElement('div');title.textContent='ჩოხატაური';title.style.cssText='text-align:center;color:#eecf9d;font-size:10px';
 function toggleBtn(label,fn){
  const b=document.createElement('button');b.type='button';b.style.cssText=btnstyle+';padding:7px 5px;';
  b.textContent=label;
  b.addEventListener('pointerdown',e=>e.stopPropagation());
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();fn(b);});
  return b;
 }
 const immortality=toggleBtn('🛡️ უკვდავება: გამორთული',b=>{
   immortal=!immortal;
   b.textContent=immortal?'🛡️ უკვდავება: ჩართული':'🛡️ უკვდავება: გამორთული';
   b.style.background=immortal?'#365e42':'#414536';
   b.setAttribute('aria-pressed',String(immortal));
 });
 immortality.dataset.immortality='toggle';
 immortality.setAttribute('aria-pressed','false');
 const compare=toggleBtn('✨ '+LATEST_LABEL+': ჩართული',b=>{
   const enabled=window.PiraliDevComparison.setEnabled(!window.PiraliDevComparison.latestEnabled());
   b.textContent='✨ '+LATEST_LABEL+': '+(enabled?'ჩართული':'გამორთული');
   b.style.background=enabled?'#365e42':'#553b27';
   b.setAttribute('aria-pressed',String(enabled));
 });
 compare.dataset.latestImprovements='toggle';compare.setAttribute('aria-pressed','true');
 compare.title='შეადარე ახალ და ძველ ეფექტებს თამაშის გადატვირთვის გარეშე';
 const note=document.createElement('div');note.textContent='PIRALI BETA 1.36 DEV · Firebase-ში ჩაწერა გამორთულია';note.style.cssText='font:10px system-ui;color:#ccb992;text-align:center';
 el.append(header,row,title,immortality,compare,note);document.body.appendChild(el);
 const inner=[row,title,immortality,compare,note];let folded=true;
 function fold(next){folded=next;inner.forEach(n=>n.style.display=folded?'none':(n===row?'grid':'block'));
  header.textContent=folded?'🧪 ტესტი ▾':'🧪 ტესტი ▴';
 }
 header.addEventListener('click',e=>{e.stopPropagation();fold(!folded);});
 header.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fold(!folded);}});
 header.addEventListener('pointerdown',e=>e.stopPropagation());
 fold(true);
 // Dock the test control directly below the real on-screen minimap.
 // Measurements are read-only until coordinates actually change.
 let dockX=-1,dockY=-1,dockHeight=-1;
 function dockBelowMap(){
  const map=document.getElementById('pirali-mini-map');
  if(!map)return;
  const rect=map.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  const x=Math.round(Math.max(6,Math.min(window.innerWidth-el.offsetWidth-6,rect.left)));
  const y=Math.round(Math.max(6,Math.min(window.innerHeight-64,rect.bottom+8)));
  const height=Math.max(52,window.innerHeight-y-8);
  if(x!==dockX){el.style.setProperty('left',x+'px','important');el.style.setProperty('right','auto','important');dockX=x;}
  if(y!==dockY){el.style.setProperty('top',y+'px','important');dockY=y;}
  if(height!==dockHeight){el.style.maxHeight=height+'px';dockHeight=height;}
 }
 window.addEventListener('resize',dockBelowMap,{passive:true});
 window.addEventListener('orientationchange',dockBelowMap,{passive:true});
 dockBelowMap();
 setInterval(()=>{
  const visible=typeof running!=='undefined'&&running;
  el.style.display=visible?'flex':'none';
  if(visible)dockBelowMap();
  if(visible&&typeof level!=='undefined'&&selected!==level){
    selected=level;
    for(let k=0;k<levelButtons.length;k++)levelButtons[k].style.background=k+1===selected?'#97713e':'#414536';
    title.textContent=levelNames[level-1]||'';
  }
 },350);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
else ready();
})();