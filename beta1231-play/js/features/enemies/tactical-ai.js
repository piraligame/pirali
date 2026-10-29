/* PIRALI Beta 1.23 — smarter, readable soldier movement.
   Direction ONLY: no modifications to damage, HP, firing intervals, speed,
   enemy counts, boss AI or level 11 wave rules. */
(function(){
'use strict';
function heading(enemy,options){
 const {tx,ty,baseAng,flankAng,aliveEnemies,player,level}=options;
 if(level===11||enemy.isNPC||enemy.retreating||enemy.state!=='attack')
   return flankAng;
 if(enemy.seesSimona===false)return flankAng; // keep last-seen search
 const dx=tx-enemy.x,dy=ty-enemy.y,dp=Math.hypot(dx,dy);
 if(!Number.isFinite(dp)||dp<1)return flankAng;
 const ranged=enemy.etype==='rifle'||enemy.etype==='officer';
 const isSaber=enemy.etype==='saber';
 const lateral=(Number(enemy.groupId||0)%2===0?1:-1);
 // Baseline flanking is retained, only moderated for line-of-approach.
 let vx=Math.cos(flankAng),vy=Math.sin(flankAng);
 // Riflemen avoid charging into close melee; officers keep slightly more room.
 // This only changes steering, not walking speed or shooting rate.
 const desired=enemy.etype==='officer'?235:210;
 if(ranged&&dp<desired){
   const push=Math.min(.85,(desired-dp)/desired*1.25+.18);
   vx=vx*(1-push)-dx/dp*push;
   vy=vy*(1-push)-dy/dp*push;
   vx+=-dy/dp*lateral*.22;vy+=dx/dp*lateral*.22;
 }
 // Swordsmen attempt a shallow side entry instead of a direct swarm.
 if(isSaber&&dp>90&&dp<300){
   vx+=-dy/dp*lateral*.22;vy+=dx/dp*lateral*.22;
 }
 // Avoid same-team clumping, checked against only 12 nearby troops.
 let sx=0,sy=0,nearby=0;
 for(let i=0;i<aliveEnemies.length&&nearby<12;i++){
   const other=aliveEnemies[i];
   if(other===enemy||!other.alive||other.isNPC)continue;
   const ox=enemy.x-other.x,oy=enemy.y-other.y;
   if(Math.abs(ox)>62||Math.abs(oy)>62)continue;
   const distance=Math.hypot(ox,oy);
   if(distance<1||distance>=62)continue;
   const weight=(62-distance)/62;
   sx+=ox/distance*weight;sy+=oy/distance*weight;
   nearby++;
 }
 const separation=Math.hypot(sx,sy);
 if(separation>.001){
  const strength=Math.min(.32,separation*.22);
  vx+=sx/separation*strength;vy+=sy/separation*strength;
 }
 return Math.hypot(vx,vy)>.001?Math.atan2(vy,vx):baseAng;
}
window.PiraliTacticalAI=Object.freeze({heading});
})();
