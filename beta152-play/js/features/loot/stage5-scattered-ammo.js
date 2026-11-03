/* PIRALI Beta 1.17.1 — extra scattered Mauser ammo ONLY in stage 5.
   Apply +10% relative to the already-balanced placed 'ammo' pickup count,
   after every existing stage/map-pickup generator has finished.
   Never change enemy drops, shotgun shells, ammo-per-box, or other stages. */
(function(){
 'use strict';
 const BONUS_RATE=0.10;
 const previous=genWorld;
 const sideOffsets=[-30,30,-50,50,0,-68,68,-14,14];
 function stageFiveAmmo(){
  if(level!==5)return;
  const original=pickups.filter(p=>p.type==='ammo'&&!p.col).length;
  // Boxes are indivisible. The small fifth-stage map usually has fewer
  // than 10, so grant at least one rather than rounding the bonus to zero.
  const target=Math.max(1,Math.round(original*BONUS_RATE));
  let added=0;
  for(let i=0;i<target;i++){
   let placed=false;
   // Widely separated targets along Simona's approach to the church.
   const center=Math.max(1,Math.min(path.length-3,
       1+Math.floor((i+1)*(path.length-3)/(target+1))));
   for(let attempt=0;attempt<120&&!placed;attempt++){
    const ring=Math.floor(attempt/sideOffsets.length);
    const index=Math.max(1,Math.min(path.length-3,
       center+(ring%2===0?1:-1)*Math.ceil(ring/2)));
    const pt=path[index];
    if(!pt)continue;
    const offset=sideOffsets[(attempt+i)%sideOffsets.length];
    const x=Math.max(40,Math.min(WW-40,pt.x+offset));
    const y=Math.max(220,Math.min(WH-140,pt.y+(ring%3-1)*14));
    if(trees.some(t=>Math.hypot(t.x-x,t.y-y)<t.r*.5+18))continue;
    if(pickups.some(p=>!p.col&&Math.hypot(p.x-x,p.y-y)<30))continue;
    pickups.push({x,y,bob:(i*1.71)%6.28,col:false,type:'ammo'});
    added++;placed=true;
   }
   // All road nodes blocked: use a very near road shoulder, still within
   // map boundaries. Never silently remove the promised ammunition.
   if(!placed){
    const pt=path[center];
    const x=Math.max(40,Math.min(WW-40,pt.x+(i%2?-85:85)));
    const y=Math.max(220,Math.min(WH-140,pt.y));
    pickups.push({x,y,bob:0,col:false,type:'ammo'});
    added++;
   }
  }
  window.PiraliStageFiveAmmoLast=Object.freeze({
   stage:5,before:original,added,after:original+added,requestedFactor:1+BONUS_RATE
  });
 }
 genWorld=function(...args){
  const result=previous.apply(this,args);
  stageFiveAmmo();
  return result;
 };
 window.PiraliStageFiveAmmo=Object.freeze({stage:5,extraRate:BONUS_RATE});
})();