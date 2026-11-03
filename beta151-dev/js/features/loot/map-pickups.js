/* PIRALI Alpha 0.16.3 DEV — global placed-pickup density, all 11 stages.
   Relative to BETA 1.06, placed healing hearts and Mauser ammunition
   both increase 10% in every stage, subject to integer rounding.
   Run AFTER all world-generation wrappers, including stage 9/11 and cover.
   Never remove 'hell-coins' (the special 250-point reward). */
(function(){
'use strict';
const HEALTH_FACTOR=.99, AMMO_FACTOR=1.32;
function apply(){
 const health=pickups.filter(pk=>!pk.col&&pk.type==='health');
 const ammoItems=pickups.filter(pk=>!pk.col&&pk.type==='ammo');
 const remove=Math.round(health.length*(1-HEALTH_FACTOR));
 const add=Math.round(ammoItems.length*(AMMO_FACTOR-1));
 if(remove>0){
  const absent=new Set();
  for(let i=0;i<remove;i++){
   const index=Math.min(health.length-1,Math.floor((i+.5)*health.length/remove));
   absent.add(health[index]);
  }
  pickups=pickups.filter(p=>!absent.has(p));
 }
 for(let i=0;i<add&&ammoItems.length;i++){
  const original=ammoItems[Math.floor((i+.5)*ammoItems.length/add)];
  let x=original.x,y=original.y;
  // Keep new Mauser boxes near accessible existing ammo, but not stacked.
  for(let step=0;step<18;step++){
   const a=(i+step)*2.39996323;
   const r=22+step*5;
   const nx=Math.max(35,Math.min(WW-35,original.x+Math.cos(a)*r));
   const ny=Math.max(160,Math.min(WH-130,original.y+Math.sin(a)*r));
   if(trees.some(t=>Math.hypot(t.x-nx,t.y-ny)<t.r*.5+14))continue;
   if(pickups.some(p=>!p.col&&Math.hypot(p.x-nx,p.y-ny)<18))continue;
   x=nx;y=ny;break;
  }
  pickups.push({x,y,bob:Math.random()*Math.PI*2,col:false,type:'ammo'});
 }
 window.PiraliMapDropLast=Object.freeze({
  stage:level,healthBefore:health.length,healthAfter:health.length-remove,
  ammoBefore:ammoItems.length,ammoAfter:ammoItems.length+add
 });
}
const oldWorld=genWorld;
genWorld=function(...args){
 const result=oldWorld.apply(this,args);
 apply();return result;
};
window.PiraliMapDropBalance=Object.freeze({healthFactor:HEALTH_FACTOR,
 ammoFactor:AMMO_FACTOR,apply});
})();
