/* PIRALI Beta 1.37: shorter, honest enemy engagement ranges.
 * One source of truth for ordinary soldiers, stage-11 waves, generals,
 * enemy projectile travel cap and the Developer latest-update comparison.
 * Never changes Simona's bullets, enemy health, firing cadence or collision radius.
 */
(function(){
'use strict';
const rules=Object.freeze({
 sightAcquire:455,sightHold:475,
 rifleFire:315,officerFire:365,bossFire:445,secondGeneralFire:440,
 rifleTravel:395,officerTravel:445,bossTravel:500,secondGeneralTravel:445
});
const enabled=()=>true; // Beta 1.37 combat ranges remain active while comparing 1.38 joystick.
function sightRange(alreadySees){return enabled()?(alreadySees?rules.sightHold:rules.sightAcquire):560;}
function fireRange(kind){
 if(!enabled())return kind==='officer'?450:380;
 return kind==='officer'?rules.officerFire:rules.rifleFire;
}
function lineOfSight(enemy,player,trees,range){
 if(!enemy||!player)return false;
 const dx=player.x-enemy.x,dy=player.y-enemy.y,d2=dx*dx+dy*dy;
 if(d2>range*range)return false;
 if(d2<.001)return true;
 for(const t of trees||[]){
  const radius=t.r*.44+5;
  if(t.x<Math.min(enemy.x,player.x)-radius||t.x>Math.max(enemy.x,player.x)+radius||
     t.y<Math.min(enemy.y,player.y)-radius||t.y>Math.max(enemy.y,player.y)+radius)continue;
  const u=Math.max(0,Math.min(1,((t.x-enemy.x)*dx+(t.y-enemy.y)*dy)/d2));
  if(Math.hypot(enemy.x+dx*u-t.x,enemy.y+dy*u-t.y)<radius)return false;
 }
 return true;
}
function onscreen(enemy){
 if(typeof sx!=='function'||typeof sy!=='function'||typeof W!=='number'||typeof H!=='number')return true;
 const x=sx(enemy.x),y=sy(enemy.y),margin=Math.max(12,Number(enemy.r)||12);
 return x>=margin&&y>=margin&&x<=W-margin&&y<=H-margin;
}
function mayFire(enemy,player,trees,range){
 if(!enabled())return true;
 return onscreen(enemy)&&lineOfSight(enemy,player,trees,range);
}
function limitFor(kind){
 if(!enabled())return undefined;
 if(kind==='rifle')return rules.rifleTravel;
 if(kind==='officer')return rules.officerTravel;
 if(kind==='second-general')return rules.secondGeneralTravel;
 return rules.bossTravel;
}
function expired(b,dt){
 if(!enabled()||b?.fp)return false;
 b._traveled137=(b._traveled137||0)+Math.hypot(b.vx,b.vy)*dt;
 const limit=Number.isFinite(b.maxTravel137)?b.maxTravel137:rules.bossTravel;
 return b._traveled137>=limit;
}
window.PiraliEnemyRange137=Object.freeze({
 rules,enabled,sightRange,fireRange,lineOfSight,onscreen,mayFire,limitFor,expired
});
})();