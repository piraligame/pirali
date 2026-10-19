/* PIRALI Alpha 0.12 preview-only comparison toggle. Not shipped in APK. */
(function(){
'use strict';
if(!window.PiraliVisualPreviewReadonly)return;
function ready(){
 const root=document.createElement('aside');
 root.id='pirali-motion-test-controls';
 root.style.cssText='position:fixed;z-index:99999;top:55px;right:7px;max-width:155px;padding:8px;background:rgba(15,25,15,.9);border:1px solid #d4aa61;border-radius:9px;box-shadow:0 4px 14px #0008;color:#f3daa2;font:600 11px system-ui;display:flex;flex-direction:column;gap:5px;';
 const title=document.createElement('div');title.textContent='ALPHA 0.12 · მოძრაობა';title.style.textAlign='center';
 const b=document.createElement('button');b.type='button';b.dataset.motion='toggle';b.textContent='ახალი მოძრაობა: ON';
 b.style.cssText='padding:7px 9px;cursor:pointer;border:1px solid #9d7847;background:#355439;color:#fff4db;border-radius:6px;font:600 11px system-ui;';
 b.addEventListener('pointerdown',e=>e.stopPropagation());
 b.addEventListener('click',e=>{
  e.stopPropagation();const a=window.PiraliAlphaMotion;if(!a)return;
  const on=a.enable(!a.enabled());b.textContent=on?'ახალი მოძრაობა: ON':'ძველი მოძრაობა: OFF';
  b.style.background=on?'#355439':'#693e2e';
 });
 const info=document.createElement('div');info.textContent='შეადარე 0.11-ს ერთი დაჭერით';info.style.cssText='font:10px system-ui;text-align:center;opacity:.9';
 root.append(title,b,info);document.body.appendChild(root);
 // Show controls during play, leaving the main-menu language options clear.
 const refresh=()=>{root.style.display=(typeof running!=='undefined'&&running)?'flex':'none';};
 refresh();setInterval(refresh,350);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
else ready();
})();