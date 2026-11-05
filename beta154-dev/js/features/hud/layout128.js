/* Beta 1.28 — reserve score-side HUD space for medal and laurel shield.
 * Existing inventory, awards, score and combat functions are unchanged. */
(function(){
'use strict';
const inventory=document.getElementById('inventory'),scorePanel=document.querySelector('#ui > .ui-panel:last-child');
if(!inventory||!scorePanel)return;
const isDev=window.PiraliAlpha014Test===true;
document.body.classList.toggle('pirali-beta128-dev',isDev);
function align(){
 const r=scorePanel.getBoundingClientRect();
 if(!r.width||!r.height)return;
 inventory.style.left='auto';
 inventory.style.right=Math.max(6,Math.round(innerWidth-r.right))+'px';
 inventory.style.top=Math.max(44,Math.round(r.bottom+6))+'px';
}
align();
addEventListener('resize',align,{passive:true});
addEventListener('orientationchange',align,{passive:true});
if(typeof ResizeObserver!=='undefined')new ResizeObserver(align).observe(scorePanel);
requestAnimationFrame(align);
window.PiraliHud128=Object.freeze({align});
})();
