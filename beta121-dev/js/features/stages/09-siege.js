/* PIRALI Alpha 0.16.2 DEV — stage 9 "Simona Under Siege".
   EXACTLY 20 shooters encircle Simona with plentiful collectible ammo. */
(function(){
'use strict';
const SHOOTERS=window.PiraliSiegeConfig.shooters;
function setup(){
 if(level!==9)return;
 boss=null; // siege stage is about soldiers, not generals.
 enemies=[];
 P.x=WW/2;P.y=WH*.64;
 P.vx=P.vy=0;P.ang=-Math.PI/2;
 // Clean just the fighting circle, so ring shooters and Simona can move and
 // their shots are not swallowed by random trees. The outside forest stays.
 trees=trees.filter(t=>Math.hypot(t.x-P.x,t.y-P.y)>225+t.r*.5); // leave outer rocks/trees for cover
 camX=P.x-W*CAM_ZOOM;camY=P.y-H*CAM_ZOOM;
 for(let i=0;i<SHOOTERS;i++){
  const angle=(i/SHOOTERS)*Math.PI*2+(i%2?.075:-.075);
  const radius=window.PiraliSiegeConfig.nearRadius+(i%5)*window.PiraliSiegeConfig.ringStep; // moderately tighter ring
  const x=Math.max(50,Math.min(WW-50,P.x+Math.cos(angle)*radius));
  const y=Math.max(240,Math.min(WH-180,P.y+Math.sin(angle)*radius));
  const hp=Number((PIRALI_STAGE_BALANCE.soldierHp(9)*window.PiraliSiegeConfig.hpFactor).toFixed(2)); // stage nine infantry -10%
  enemies.push({
   x,y,r:12,hp,maxHp:hp,vx:0,vy:0,ang:angle+Math.PI,
   patrol:{cx:x,cy:y,radius:22,t:angle,spd:.2},
   sT:80+i*6.5,alive:true,hf:0,wf:0,etype:'rifle',
   alertTimer:0,state:'patrol',flankTimer:0,groupId:'siege-'+i,
   retreating:false,retreatTimer:0
  });
 }
 // Mauser ammunition is abundant at the start, around the ring, and along the exit road.
 for(let i=0;i<105;i++){
  const ang=(i*2.39996323)%(Math.PI*2);
  const ring=38+(i%15)*30;
  pickups.push({
   x:Math.max(35,Math.min(WW-35,P.x+Math.cos(ang)*ring)),
   y:Math.max(160,Math.min(WH-120,P.y+Math.sin(ang)*ring)),
   bob:i*.19,col:false,type:i%4===0?'health':'ammo'
  });
 }
 // First-aid and ammunition close to the starting position.
 for(let i=0;i<10;i++){
   const angle=i*Math.PI*2/10;
   pickups.push({x:P.x+Math.cos(angle)*72,y:P.y+Math.sin(angle)*72,
     bob:i*.37,col:false,type:i%2===0?'health':'ammo'});
 }
 for(let i=2;i<path.length-2;i++){
  const p=path[i];
  pickups.push({x:p.x+(i%2?45:-45),y:p.y,bob:i*.3,col:false,type:'ammo'});
 }
 window.PiraliSiegeHearts?.arrange();
}
function clear(){return level===9&&enemies.filter(e=>e.alive).length===0;}
window.PiraliSiege=Object.freeze({setup,clear,shooterCount:SHOOTERS});
})();
