/* PIRALI BETA 1.12 — physical-key PC controls for any keyboard layout, plus pointer support.
   Loaded after combat.js; touch controls and Firebase are unchanged. */
(function(){
'use strict';
const supported=(window.matchMedia?.('(hover: hover) and (pointer: fine)').matches===true)
  ||(!('ontouchstart' in window)&&navigator.maxTouchPoints===0);
const joyZone=document.getElementById('joy-zone');
const base=document.getElementById('joy-base');
const knob=document.getElementById('joy-knob');
const held=new Set();
const movement={
 KeyW:'u',KeyA:'l',KeyS:'d',KeyD:'r',
 ArrowUp:'u',ArrowLeft:'l',ArrowDown:'d',ArrowRight:'r'
};
const fallback={w:'KeyW',a:'KeyA',s:'KeyS',d:'KeyD',
 arrowup:'ArrowUp',arrowleft:'ArrowLeft',arrowdown:'ArrowDown',arrowright:'ArrowRight'};
function codeOf(e){return movement[e.code]?e.code:fallback[String(e.key||'').toLowerCase()]||'';}
function gameActive(){return typeof running!=='undefined'&&running&&
 typeof paused!=='undefined'&&!paused&&typeof P!=='undefined'&&!P.dead;}
function typing(e){const t=e.target;return !!(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName||'')));}
function sync(){
 K.l=held.has('KeyA')||held.has('ArrowLeft');
 K.r=held.has('KeyD')||held.has('ArrowRight');
 K.u=held.has('KeyW')||held.has('ArrowUp');
 K.d=held.has('KeyS')||held.has('ArrowDown');
}
function release(){held.clear();sync();if(mouseId!==null){mouseId=null;joy.active=false;joy.id=-1;joy.dx=joy.dy=0;base.style.display=knob.style.display='none';}}
document.addEventListener('keydown',e=>{
 if(typing(e)||e.altKey||e.ctrlKey||e.metaKey)return;
 const code=codeOf(e);
 if(code){
  if(gameActive()){held.add(code);sync();e.preventDefault();}
  return;
 }
 if(!gameActive())return;
 // e.code identifies the physical key, independent of Georgian/Russian/US layout.
 // Key fallbacks are reserved for legacy browsers without usable KeyboardEvent.code.
 const physical=e.code||(
  String(e.key||'').toLowerCase()==='x'?'KeyX':
  String(e.key||'').toLowerCase()==='c'?'KeyC':
  String(e.key||'').toLowerCase()==='z'?'KeyZ':
  e.key===' '?'Space':'');
 const action=physical==='Space'?shoot:
              physical==='KeyZ'?shoot:
              physical==='KeyX'?swordSwing:
              physical==='KeyC'?dash:null;
 if(!action)return;
 e.preventDefault();
 if(e.repeat)return;
 action();
});
document.addEventListener('keyup',e=>{
 const code=codeOf(e);
 if(code){held.delete(code);sync();if(gameActive())e.preventDefault();}
});
window.addEventListener('blur',release);
document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
let mouseId=null;
if(supported&&joyZone){
 const move=e=>{
  if(mouseId!==e.pointerId)return;
  const dx=e.clientX-joy.bx,dy=e.clientY-joy.by,dist=Math.hypot(dx,dy);
  const radius=joy.mr,amount=dist<2?0:Math.min(1,dist/(radius*.78));
  joy.dx=dist?dx/dist*amount:0;joy.dy=dist?dy/dist*amount:0;
  const angle=Math.atan2(dy,dx),visible=Math.min(radius,dist);
  knob.style.left=(joy.bx+Math.cos(angle)*visible)+'px';
  knob.style.top=(joy.by+Math.sin(angle)*visible)+'px';
 };
 const finish=e=>{
  if(mouseId!==e.pointerId)return;
  mouseId=null;joy.active=false;joy.id=-1;joy.dx=joy.dy=0;
  base.style.display=knob.style.display='none';
  if(joyZone.hasPointerCapture?.(e.pointerId))joyZone.releasePointerCapture(e.pointerId);
 };
 joyZone.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse'||e.button!==0||!gameActive()||joy.active)return;
  mouseId=e.pointerId;
  joy.active=true;joy.id=-99;joy.bx=e.clientX;joy.by=e.clientY;joy.dx=joy.dy=0;
  base.style.left=knob.style.left=e.clientX+'px';
  base.style.top=knob.style.top=e.clientY+'px';
  base.style.display=knob.style.display='block';
  joyZone.setPointerCapture?.(e.pointerId);
  e.preventDefault();
 });
 joyZone.addEventListener('pointermove',move);
 joyZone.addEventListener('pointerup',finish);
 joyZone.addEventListener('pointercancel',finish);
 window.addEventListener('pointerup',finish);
 const canvas=document.getElementById('gameCanvas');
 canvas?.addEventListener('mousedown',e=>{
  if(!gameActive())return;
  if(e.button===0){shoot();e.preventDefault();}
  else if(e.button===1){dash();e.preventDefault();}
  else if(e.button===2){swordSwing();e.preventDefault();}
 });
 canvas?.addEventListener('contextmenu',e=>{if(gameActive())e.preventDefault()});
 // Help text appears only with a fine-pointer device, not on phones.
 const hint=document.createElement('div');
 hint.id='pirali-desktop-hint';
 hint.textContent='PC: WASD / ↑↓←→ მოძრაობა · Space / Z სროლა · X ხმალი · C მოი აგერ! · მაუსი: მარცხენა მხარეს გადაადგილება';
 hint.style.cssText='position:fixed;z-index:26;left:10px;bottom:6px;max-width:68vw;'+
  'font:600 11px system-ui;color:#e8cea0;text-shadow:0 1px 3px #000;'+
  'background:rgba(9,12,8,.76);border:1px solid #96774a;border-radius:7px;'+
  'padding:5px 8px;pointer-events:none;display:none';
 document.body.appendChild(hint);
 setInterval(()=>{hint.style.display=gameActive()?'block':'none'},400);
}
window.PiraliDesktopControls=Object.freeze({reset:release,enabled:supported});
})();