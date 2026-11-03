/* PIRALI 0.16.3 DEV — 15% fewer hearts, geographically separated. */
(function(){'use strict';
function arrange(){
 if(level!==9)return;
 const items=pickups.filter(p=>!p.col&&p.type==='health');
 const remaining=Math.round(items.length*window.PiraliSiegeConfig.heartsFactor);
 const removed=new Set(items.slice(remaining));
 pickups=pickups.filter(p=>!removed.has(p));
 const used=[];
 for(let i=0;i<remaining;i++){
  const pk=items[i];
  for(let j=0;j<75;j++){
   const angle=i*2.3999632297+j*.5;
   const r=i<4?98+i*24:220+Math.sqrt((i-3)/Math.max(1,remaining-4))*430;
   const x=Math.max(60,Math.min(WW-60,P.x+Math.cos(angle)*r));
   const y=Math.max(200,Math.min(WH-145,P.y+Math.sin(angle)*r));
   if(used.some(t=>Math.hypot(t.x-x,t.y-y)<67))continue;
   if(trees.some(t=>Math.hypot(t.x-x,t.y-y)<t.r*.48+20))continue;
   if(enemies.some(e=>e.alive&&Math.hypot(e.x-x,e.y-y)<e.r+33))continue;
   pk.x=x;pk.y=y;used.push(pk);break;
  }
 }
 window.PiraliSiegeHeartsLast={before:items.length,after:remaining,placed:used.length,removed:removed.size};
}
window.PiraliSiegeHearts=Object.freeze({arrange});
})();