/* PIRALI Alpha 0.16.2 DEV — stage 8 "Road to Infinity".
   Two independent generals; each must be defeated before the exit opens.
   Ordinary General artwork/attack logic is reused instead of duplicated. */
(function(){
'use strict';
let second=null;
const HP=11; // +~20% over former stage-7 general (9 HP)
function setup(){
 second=null;
 if(level!==8||!boss)return;
 boss.x=CHURCH_X-145;boss.y=CHURCH_Y+335;
 boss.hp=boss.maxHp=HP;boss.enrageHp=4;
 second={
  x:CHURCH_X+145,y:CHURCH_Y+335,r:24,
  hp:HP,maxHp:HP,vx:0,vy:0,ang:Math.PI,
  alive:true,hf:0,wf:0,
  sT:80,chargeT:0,charging:false,chargeDx:0,chargeDy:0,
  rageMode:false,enrageHp:4,phase:1,
  groundSlamCD:0,groundSlamActive:false,groundSlamT:0,groundSlamX:0,groundSlamY:0
 };
 // Sword-equipped Russian troops, drawn using the existing sprites.
 let saberCount=0;
 for(const e of enemies){
  if(e.etype==='landlord')continue;
  if(saberCount<Math.round(enemies.length*.78)){e.etype='saber';saberCount++;}
 }
}
function target(){return level===8&&second?.alive?second:null;}
function hitBullet(b){
 const s=target();
 if(!s||!b?.alive||!b.fp)return false;
 if(Math.hypot(b.x-s.x,b.y-s.y)>=s.r+6)return false;
 b.alive=false;hitBoss(s,1);return true;
}
function swordHit(damage){
 const s=target();
 if(s&&Math.hypot(s.x-P.x,s.y-P.y)<78)hitBoss(s,damage);
}
function defeated(){return level===8&&!!boss&&!boss.alive&&!!second&&!second.alive;}
function drawEntities(ents){
 if(level===8&&second?.alive)ents.push({y:second.y,fn:()=>drawBoss(second)});
}
function updateSecond(dt){
 const s=target();
 if(!s||!running||P.dead)return;
 s.wf+=dt*.2;if(s.hf>0)s.hf-=dt;
 if(s.hp<=s.enrageHp)s.rageMode=true;
 const dist=Math.hypot(P.x-s.x,P.y-s.y);
 const aim=Math.atan2(P.y-s.y,P.x-s.x);
 s.ang=aim;
 // Keep both generals near the church approach and firing in distinct rhythms.
 if(dist<550){
  const move=s.rageMode?.42:.26;
  s.vx+=(Math.cos(aim)*move*dt-s.vx)*.12;
  s.vy+=(Math.sin(aim)*move*dt-s.vy)*.12;
  s.x=Math.max(s.r,Math.min(WW-s.r,s.x+s.vx));
  s.y=Math.max(s.r,Math.min(WH-s.r,s.y+s.vy));
 }
 s.sT-=dt;
 if(s.sT<=0&&dist<620){
  s.sT=(s.rageMode?44:72)*(0.85+Math.random()*.3);
  const shots=s.rageMode?3:2;
  for(let i=0;i<shots;i++){
   const angle=aim+(i-(shots-1)/2)*.19;
   bullets.push({x:s.x,y:s.y,vx:Math.cos(angle)*4,vy:Math.sin(angle)*4,fp:false,alive:true,life:120});
  }
 }
 if(!invincible&&!dashing&&dist<P.r+s.r)takeDmg();
}
window.PiraliDualGenerals=Object.freeze({setup,target,hitBullet,swordHit,defeated,drawEntities,updateSecond});
})();
