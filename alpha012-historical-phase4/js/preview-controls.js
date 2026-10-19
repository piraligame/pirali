/* Alpha 0.12 FIVE STAGES: web-preview-only level selector and reversible visuals.
   Never bundled into Android APK, never writes production Firebase scores. */
(function(){
'use strict';
if(!window.PiraliVisualPreviewReadonly)return;
function ready(){
 const el=document.createElement('aside');
 el.id='pirali-scenery-test-panel';
 el.style.cssText='position:fixed;top:50px;right:7px;z-index:99995;padding:8px;background:rgba(15,28,24,.92);border:1px solid #cfa369;border-radius:9px;box-shadow:0 7px 25px #0009;width:172px;max-width:45vw;display:none;gap:6px;flex-direction:column;color:#f6ddab;font:600 11px system-ui;pointer-events:auto';
 const header=document.createElement('div');header.textContent='🌲 ტესტი ▾';header.style.cssText='text-align:center;font-size:11px;cursor:pointer;padding:3px 0';header.setAttribute('role','button');header.tabIndex=0;
 const row=document.createElement('div');row.style.cssText='display:grid;grid-template-columns:repeat(5,1fr);gap:3px';
 const btnstyle='border:1px solid #ba9664;background:#414536;color:#f9deb0;border-radius:5px;padding:6px 0;font:700 11px system-ui;cursor:pointer';
 let selected=1;
 const levelButtons=[];
 for(let n=1;n<=5;n++){
  const b=document.createElement('button');b.type='button';b.dataset.level=String(n);b.textContent=String(n);
  b.style.cssText=btnstyle;
  b.addEventListener('pointerdown',e=>e.stopPropagation());
  b.addEventListener('click',e=>{
   e.preventDefault();e.stopPropagation();
   if(typeof running==='undefined'||!running||typeof level==='undefined'||typeof genWorld!=='function')return;
   selected=n;level=n;genWorld();
   if(typeof updateAmmoUI==='function')updateAmmoUI();
   for(let k=0;k<levelButtons.length;k++)levelButtons[k].style.background=k+1===selected?'#97713e':'#414536';
   title.textContent=window.PiraliAlphaEnvironment?.biomes.find(x=>x.level===n)?.name||'';
  });
  levelButtons.push(b);row.appendChild(b);
 }
 const title=document.createElement('div');title.textContent='Chokhatauri';title.style.cssText='text-align:center;color:#eecf9d;font-size:10px';
 function toggleBtn(label,fn){
  const b=document.createElement('button');b.type='button';b.style.cssText=btnstyle+';padding:7px 5px;';
  b.textContent=label;
  b.addEventListener('pointerdown',e=>e.stopPropagation());
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();fn(b);});
  return b;
 }
 const scenery=toggleBtn('🌿 ახალი ფონი: ON',b=>{
   const api=window.PiraliAlphaEnvironment;if(!api)return;
   const on=api.enable(!api.enabled());b.textContent=on?'🌿 ახალი ფონი: ON':'🌿 ძველი ფონი: OFF';
   b.style.background=on?'#365e42':'#694936';
 });
 scenery.style.background='#365e42';
 const motion=toggleBtn('🏃 ახალი მოძრაობა: ON',b=>{
   const api=window.PiraliAlphaMotion;if(!api)return;
   const on=api.enable(!api.enabled());b.textContent=on?'🏃 ახალი მოძრაობა: ON':'🏃 ძველი მოძრაობა: OFF';
   b.style.background=on?'#365e42':'#694936';
 });
 motion.style.background='#365e42';
 const church=toggleBtn('⛪ ისტორიული ეკლესია: ON',b=>{
   const api=window.PiraliHistoricalPhase4;if(!api)return;
   const on=api.enable(!api.enabled());b.textContent=on?'⛪ ისტორიული ეკლესია: ON':'⛪ ძველი ეკლესია: OFF';
   b.style.background=on?'#365e42':'#694936';
 });
 church.style.background='#365e42';church.dataset.church='toggle';
 const visit=toggleBtn('⛪ ეკლესიასთან გადასვლა',()=>{
   if(typeof running==='undefined'||!running||typeof level==='undefined'||typeof genWorld!=='function')return;
   level=5;genWorld();
   P.x=CHURCH_X;P.y=CHURCH_Y+195;P.vx=P.vy=0;P.ang=-Math.PI/2;
   camX=CHURCH_X-W/2;camY=P.y-H*.64;
   selected=5;for(let k=0;k<levelButtons.length;k++)levelButtons[k].style.background=k+1===5?'#97713e':'#414536';
   title.textContent='Udabnos Eklesia';
   fold(true); // Reveal the full historical church after teleport.
 });
 visit.dataset.church='visit';
 const note=document.createElement('div');note.textContent='ტურების გადართვა მხოლოდ სატესტოა';note.style.cssText='font:10px system-ui;color:#ccb992;text-align:center';
 el.append(header,row,title,scenery,motion,church,visit,note);document.body.appendChild(el);
 const inner=[row,title,scenery,motion,church,visit,note];let folded=true;
 function fold(next){folded=next;inner.forEach(n=>n.style.display=folded?'none':(n===row?'grid':'block'));
  header.textContent=folded?'🌲 ტესტი ▾':'🌲 ტესტი ▴';
 }
 header.addEventListener('click',e=>{e.stopPropagation();fold(!folded);});
 header.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fold(!folded);}});
 header.addEventListener('pointerdown',e=>e.stopPropagation());
 fold(true);
 setInterval(()=>{
  const visible=typeof running!=='undefined'&&running;
  el.style.display=visible?'flex':'none';
  if(visible&&typeof level!=='undefined'&&selected!==level){
    selected=level;
    for(let k=0;k<levelButtons.length;k++)levelButtons[k].style.background=k+1===selected?'#97713e':'#414536';
    title.textContent=window.PiraliAlphaEnvironment?.biomes.find(x=>x.level===level)?.name||'';
  }
 },350);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
else ready();
})();