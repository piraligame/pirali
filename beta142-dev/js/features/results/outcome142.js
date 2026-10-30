/* PIRALI Beta 1.42 — compact outcome cards without scroll and portrait-first background.
 * Presentation only. Existing result buttons and their handlers are MOVED, not cloned.
 * Async score/rank and language changes can add/update content after the outcome appears.
 */
(function(){
'use strict';
const screen=document.getElementById('screen');
if(!screen)return;
const active=()=>screen.classList.contains('gameover-screen')||screen.classList.contains('victory-screen');
let pending=false,fits=0,last={};
function organise(){
 if(!active()||screen.style.display==='none'){
   screen.classList.remove('pirali142-outcome');
   return null;
 }
 screen.classList.add('pirali142-outcome');
 let card=screen.querySelector(':scope > .pirali142-stack');
 if(!card){
   card=document.createElement('section');
   card.className='pirali142-stack';
   card.setAttribute('aria-label','PIRALI result');
   screen.appendChild(card);
 }
 // Keep the overlay and confetti outside the stack so they remain decorative.
 for(const child of Array.from(screen.children)){
   if(child===card||child.id==='screen-overlay'||child.classList.contains('pirali-confetti'))continue;
   card.appendChild(child);
 }
 let actions=card.querySelector(':scope > .pirali142-actions');
 if(!actions){
   actions=document.createElement('div');
   actions.className='pirali142-actions';
   card.appendChild(actions);
 }
 // Live updates from Stats can insert a small result line before the first
 // leaderboard button. Rehome it above the action grid, preserving its text.
 for(const child of Array.from(actions.children)){
   if(child.matches('button'))continue;
   card.insertBefore(child,actions);
 }
 const buttons=Array.from(card.querySelectorAll('.pirali-show-stats,.pirali-result-retry,button.sbtn'));
 for(const button of buttons){
   if(button.parentElement!==actions)actions.appendChild(button);
 }
 return card;
}
function fit(){
 pending=false;
 const card=organise();
 if(!card)return;
 const viewport=Math.max(1,screen.clientHeight);
 // The hero's head remains above the results. On very short viewports,
 // reserve less sky so controls are still large enough to tap.
 let face=viewport>=690?Math.min(270,Math.round(viewport*.34)):
   viewport>=570?Math.round(viewport*.26):Math.round(viewport*.16);
 const bottom=viewport>=550?11:6;
 card.style.zoom='1';
 const natural=card.getBoundingClientRect().height;
 if(!natural)return;
 let zoom=Math.min(1,(viewport-face-bottom)/natural);
 if(zoom<.77){
   face=Math.max(45,Math.min(face,Math.round(viewport*.16)));
   zoom=Math.min(1,(viewport-face-bottom)/natural);
 }
 zoom=Math.min(1,Math.max(.38,zoom-.008));
 card.style.zoom=zoom.toFixed(4);
 screen.style.setProperty('--pirali142-face-space',Math.round(face)+'px');
 // CSS zoom changes layout and bounding rects. Re-measure once to ensure
 // not even the last menu button clips off the viewport.
 const rect=card.getBoundingClientRect();
 if(rect.bottom>viewport-2){
   zoom=Math.max(.34,zoom-(rect.bottom-viewport+5)/Math.max(natural,1));
   card.style.zoom=zoom.toFixed(4);
 }
 fits++;
 last={screenHeight:viewport,faceSpace:face,naturalHeight:natural,zoom,
  outcome:screen.classList.contains('victory-screen')?'victory':'defeat',
  stack:card.getBoundingClientRect().toJSON()};
}
function request(){
 if(pending)return;
 pending=true;
 requestAnimationFrame(fit);
}
// No mutation attributes: calculating zoom does not trigger another fit.
// Only substantive text/element updates and viewport changes do.
const observer=new MutationObserver(changes=>{
 if(!active())return;
 if(changes.some(c=>c.type==='childList'||c.type==='characterData'))request();
});
observer.observe(screen,{subtree:true,childList:true,characterData:true});
addEventListener('resize',request,{passive:true});
addEventListener('orientationchange',request,{passive:true});
document.addEventListener('pirali:languagechange',request);
document.fonts?.ready?.then(request).catch(()=>{});
const originalOver=showGameOver,originalWin=showVictory;
showGameOver=function(...args){const ret=originalOver.apply(this,args);request();return ret;};
showVictory=function(...args){const ret=originalWin.apply(this,args);request();return ret;};
window.PiraliOutcome142=Object.freeze({
 request,fit,
 debug:()=>({
  ...last,fits,active:active(),
  scrollHeight:screen.scrollHeight,clientHeight:screen.clientHeight,
  backgroundPosition:getComputedStyle(screen).backgroundPosition,
  actions:Array.from(screen.querySelectorAll('.pirali142-actions > button')).map(x=>x.className)
 })
});
})();