/* Alpha 0.14 Study D dedicated test: level selection, optional immortality and final-stage teleports, read-only web preview.
   Never bundled into Android APK, never writes production Firebase scores. */
(function(){
'use strict';
if(!window.PiraliVisualPreviewReadonly)return;
function ready(){
 let immortal=false;
 const normalTakeDmg=takeDmg;
 takeDmg=function(){
  if(window.PiraliAlpha014Test&&immortal)return;
  return normalTakeDmg.apply(this,arguments);
 };
 const el=document.createElement('aside');
 el.id='pirali-scenery-test-panel';
 el.style.cssText='position:fixed;top:50px;right:7px;z-index:99995;padding:8px;background:rgba(15,28,24,.92);border:1px solid #cfa369;border-radius:9px;box-shadow:0 7px 25px #0009;width:172px;max-width:45vw;display:none;gap:6px;flex-direction:column;color:#f6ddab;font:600 11px system-ui;pointer-events:auto';
 const header=document.createElement('div');header.textContent='🧪 ტესტი ▾';header.style.cssText='text-align:center;font-size:11px;cursor:pointer;padding:3px 0';header.setAttribute('role','button');header.tabIndex=0;
 const row=document.createElement('div');row.style.cssText='display:grid;grid-template-columns:repeat(5,1fr);gap:3px';
 const btnstyle='border:1px solid #ba9664;background:#414536;color:#f9deb0;border-radius:5px;padding:6px 0;font:700 11px system-ui;cursor:pointer';
 const levelNames=['ჩოხატაური','გოგოლესუბანი','შუა განახლება','უდაბნო','უდაბნოს ეკლესია'];
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
 function visitFinal(){
   if(typeof running==='undefined'||!running)return;
   level=5;genWorld();
   const destination=boss||{x:CHURCH_X,y:CHURCH_Y};
   P.x=Math.max(P.r,Math.min(WW-P.r,destination.x));
   P.y=Math.max(P.r,Math.min(WH-P.r,destination.y+195));
   P.vx=P.vy=0;P.ang=-Math.PI/2;
   camX=Math.max(0,Math.min(WW-W,P.x-W/2));
   camY=Math.max(0,Math.min(WH-H,P.y-H/2));
   selected=5;
   levelButtons.forEach((b,i)=>b.style.background=i===4?'#97713e':'#414536');
   title.textContent=levelNames[4];
   if(typeof updateAmmoUI==='function')updateAmmoUI();
   fold(true);
 }
 const finalBoss=toggleBtn('⚔️ ბოლო ბოსთან გადასვლა',visitFinal);
 finalBoss.dataset.boss='visit';
 const note=document.createElement('div');note.textContent='Alpha 0.14 · სატესტო მართვა';note.style.cssText='font:10px system-ui;color:#ccb992;text-align:center';
 el.append(header,row,title,immortality,finalBoss,note);document.body.appendChild(el);
 const inner=[row,title,immortality,finalBoss,note];let folded=true;
 function fold(next){folded=next;inner.forEach(n=>n.style.display=folded?'none':(n===row?'grid':'block'));
  header.textContent=folded?'🧪 ტესტი ▾':'🧪 ტესტი ▴';
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
    title.textContent=levelNames[level-1]||'';
  }
 },350);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
else ready();
})();