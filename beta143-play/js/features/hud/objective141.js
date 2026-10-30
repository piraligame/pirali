/* PIRALI Beta 1.41 — dedicated quest-label slot between the heart panel
 * and minimap. Both elements follow actual measured HUD geometry instead
 * of relying on a fixed top value; preserves Dev test dock below minimap.
 */
(function(){
'use strict';
const CLASS='pirali141-quest-hud';
const hud=document.getElementById('pirali139-hud');
const hearts=document.querySelector('#ui > .ui-panel:first-child');
const map=document.getElementById('pirali-mini-map');
if(!hud||!hearts||!map)return;
let pending=false,alignments=0;
function align(){
 pending=false;
 if(hud.hidden||!hud.isConnected||!map.isConnected){
   document.body.classList.remove(CLASS);
   return;
 }
 const h=hearts.getBoundingClientRect(),m=map.getBoundingClientRect();
 if(h.width<=0||h.height<=0||m.width<=0)return;
 const left=Math.max(6,Math.round(h.left));
 const top=Math.ceil(h.bottom+5);
 const width=Math.max(102,Math.min(Math.max(h.width,m.width),Math.min(innerWidth*.48,185)));
 document.body.style.setProperty('--pirali141-quest-left',left+'px');
 document.body.style.setProperty('--pirali141-quest-top',top+'px');
 document.body.style.setProperty('--pirali141-quest-width',Math.round(width)+'px');
 document.body.classList.add(CLASS);
 // Read the actual localized text height, including a second line if needed.
 const actual=hud.getBoundingClientRect();
 const mapTop=Math.ceil(Math.max(h.bottom+6,actual.bottom+5));
 document.body.style.setProperty('--pirali141-map-top',mapTop+'px');
 alignments++;
}
function request(){
 if(pending)return;
 pending=true;
 requestAnimationFrame(align);
}
if(typeof ResizeObserver!=='undefined'){
 const resize=new ResizeObserver(request);
 resize.observe(hearts);
 resize.observe(hud);
 resize.observe(map);
}
addEventListener('resize',request,{passive:true});
addEventListener('orientationchange',request,{passive:true});
document.addEventListener('pirali:languagechange',request);
map.querySelector('#pirali-mini-map-toggle')?.addEventListener('click',request);
window.PiraliQuestHud141=Object.freeze({
 request,align,
 debug:()=>({
  active:document.body.classList.contains(CLASS),
  hearts:hearts.getBoundingClientRect().toJSON(),
  quest:hud.getBoundingClientRect().toJSON(),
  map:map.getBoundingClientRect().toJSON(),
  alignments
 })
});
request();
})();