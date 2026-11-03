/* PIRALI 0.16.2 DEV — separate HUD for each general in stage eight.
   Keep original boss-bar for General I; show General II below it.
   No changes to the original boss AI or Firebase. */
(function(){
 'use strict';
 const translations={
 ka:['გენერალი I','გენერალი II','ორივე გენერალი დამარცხებულია!'],
 en:['General I','General II','Both generals defeated!'],
 ru:['Генерал I','Генерал II','Оба генерала побеждены!'],
 zh:['将军 I','将军 II','两名将军都已被击败！']
 };
 let node=null;
 function labels(){return translations[window.PiraliLanguage?.getLanguage?.()||'ka']||translations.ka;}
 function ensure(){
  if(node)return node;
  node=document.createElement('div');
  node.id='pirali-second-general-bar';
  node.setAttribute('aria-label','Second general health');
  const label=document.createElement('div');label.className='pirali-general2-title';
  const track=document.createElement('div');track.className='pirali-general2-track';
  const fill=document.createElement('div');fill.className='pirali-general2-fill';
  track.appendChild(fill);node.append(label,track);
  document.body.appendChild(node);
  return node;
 }
 function sync(){
  const n=ensure();
  const second=window.PiraliDualGenerals?.second?.();
  const first=typeof boss==='object'?boss:null;
  const visible=level===8&&running&&(first?.alive||second?.alive);
  n.style.display=visible?'block':'none';
  if(level===8){
   const label=document.getElementById('boss-lbl');
   if(label&&first?.alive)label.textContent='⚔ '+labels()[0];
  }
  if(!visible)return;
  n.querySelector('.pirali-general2-title').textContent='⚔ '+labels()[1]+(second?.alive?'':' ✓');
  n.querySelector('.pirali-general2-fill').style.width=(second?.alive?
    Math.max(0,Math.min(100,(second.hp/second.maxHp)*100)):0)+'%';
  // The original first-general bar may have been hidden when General II died.
  const firstBar=document.getElementById('boss-bar');
  if(firstBar&&first?.alive)firstBar.style.display='block';
  if(firstBar&&!first?.alive)firstBar.style.display='none';
 }
 const prevBossUI=updateBossUI;
 updateBossUI=function(...args){const result=prevBossUI.apply(this,args);sync();return result;};
 const prevHideBossUI=hideBossUI;
 hideBossUI=function(...args){const result=prevHideBossUI.apply(this,args);sync();return result;};
 document.addEventListener('pirali:languagechange',sync);
 const prevGenWorld=genWorld;
 genWorld=function(...args){
   const result=prevGenWorld.apply(this,args);
   sync();
   return result;
 };
 window.PiraliDualBossHUD=Object.freeze({sync});
})();
