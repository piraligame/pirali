/* PIRALI Alpha 0.16.3 DEV — ELEVENTH BONUS LEVEL: endless survival.
   Wave spawner is isolated from the original 10 stages and Firebase.
   Up to 80 LIVE enemies (general included), constantly replenished. */
(function(){
'use strict';
const SETTINGS=window.PiraliEndlessBalance;
const CAP=SETTINGS.cap,INITIAL=SETTINGS.initial;
const TYPES=['rifle','saber','officer','rifle','saber','landlord'];
let live=false,elapsed=0,nextSpawn=0,nextAmmo=0,wave=1,kills=0,ammoRemainder=0;
function randomPoint(minR=265,maxR=490){
 for(let tries=0;tries<25;tries++){
  const ang=Math.random()*Math.PI*2,r=minR+Math.random()*(maxR-minR);
  const x=Math.max(70,Math.min(WW-70,P.x+Math.cos(ang)*r));
  const y=Math.max(220,Math.min(WH-180,P.y+Math.sin(ang)*r));
  if(Math.hypot(x-P.x,y-P.y)<minR*.7)continue;
  if(trees.some(t=>Math.hypot(t.x-x,t.y-y)<t.r*.42+20))continue;
  if(enemies.some(e=>e.alive&&Math.hypot(e.x-x,e.y-y)<35))continue;
  return {x,y,ang};
 }
 return {x:Math.max(60,Math.min(WW-60,P.x+325)),
         y:Math.max(220,Math.min(WH-170,P.y+210)),ang:0};
}
function liveCount(){return enemies.reduce((s,e)=>s+Number(!!e.alive),0)+Number(!!boss?.alive)}
function spawnOne(){
 if(level!==11||liveCount()>=CAP)return false;
 const pt=randomPoint();
 // Every wave uses all existing soldier families, with an occasional
 // unarmed fleeing Batoni that drops health when defeated.
 const type=TYPES[Math.floor(Math.random()*TYPES.length)];
 const landlord=type==='landlord',officer=type==='officer';
 const baseHp=landlord?3:Math.max(3,Math.min(PIRALI_STAGE_BALANCE.oldSoldierHp(11),3+Math.ceil(wave*.8)+(officer?1:0)));
 const hp=PIRALI_STAGE_BALANCE.scaleRegularHp(baseHp*SETTINGS.healthFactor); // additional 10% reduction
 const enemy={
  x:pt.x,y:pt.y,r:officer?14:landlord?13:12,hp,maxHp:hp,
  vx:0,vy:0,ang:pt.ang+Math.PI,wf:0,hf:0,
  patrol:{cx:pt.x,cy:pt.y,radius:35+Math.random()*35,t:Math.random()*6.28,spd:.3},
  sT:35+Math.random()*70,alive:true,etype:type,isNPC:landlord,
  alertTimer:20,state:landlord?'patrol':'attack',flankTimer:0,
  groupId:'endless-'+wave,retreating:false,retreatTimer:0
 };
 enemies.push(enemy);return true;
}
function replenishAmmo(){
 // New ammunition appears throughout the fight, not just at level start.
 const waiting=pickups.filter(p=>!p.col&&(p.type==='ammo'||p.type==='health'));
 if(waiting.length>=65)return;
 // Twenty percent more rolling ammunition supplies, while respecting
 // the old total uncollected pickup cap. Fractional extra packs carry over.
 const exact=12*window.PiraliDropBalance.endlessRestockMultiplier+ammoRemainder;
 const quantity=Math.floor(exact);
 ammoRemainder=exact-quantity;
 for(let i=0;i<quantity;i++){
  const a=Math.random()*Math.PI*2;
  const r=35+Math.random()*360;
  const x=Math.max(45,Math.min(WW-45,P.x+Math.cos(a)*r));
  const y=Math.max(210,Math.min(WH-145,P.y+Math.sin(a)*r));
  if(trees.some(t=>Math.hypot(t.x-x,t.y-y)<t.r*.4+20))continue;
  pickups.push({x,y,bob:Math.random()*6.28,col:false,
   type:(i===0&&Math.random()<window.PiraliDropBalance.endlessHealthChance)?'health':'ammo'});
 }
}
function general(){
 if(level!==11||boss?.alive||liveCount()>=CAP)return;
 const pt=randomPoint(420,600),hp=Math.max(8,Math.min(24,12+wave));
 boss={
  x:pt.x,y:pt.y,r:24,hp,maxHp:hp,
  vx:0,vy:0,ang:pt.ang,alive:true,hf:0,wf:0,
  sT:62,chargeT:0,charging:false,chargeDx:0,chargeDy:0,
  rageMode:false,enrageHp:Math.ceil(hp/3),phase:1,
  groundSlamCD:0,groundSlamActive:false,groundSlamT:0,
  groundSlamX:0,groundSlamY:0
 };
}
function setup(){
 live=level===11;
 if(!live)return;
 elapsed=0;wave=1;kills=0;nextSpawn=900;nextAmmo=1800;ammoRemainder=0;
 // An open arena among the existing trees, with the same visual language.
 P.x=WW*.5;P.y=WH*.53;P.vx=P.vy=0;P.ang=-Math.PI/2;
 camX=Math.max(0,Math.min(WW-W,P.x-W*.5));
 camY=Math.max(0,Math.min(WH-H,P.y-H*.5));
 enemies=[];boss=null;bullets=[];pickups=[];corpses=[];
 // A fair fresh start after the Devil: full health and Mauser ammo.
 health=maxHealth;ammo=maxAmmo;
 updateHealthUI();updateAmmoUI();
 trees=trees.filter(t=>Math.hypot(t.x-P.x,t.y-P.y)>680+t.r*.5);
 window.PiraliGraveyard?.populate();
 for(let i=0;i<INITIAL;i++)spawnOne();
 replenishAmmo();
 window.PiraliEndlessHUD?.refresh();
}
function tick(dt){
 if(!live||level!==11||P.dead||!running)return;
 const ms=Math.max(0,Math.min(100,dt*16.67));
 elapsed+=ms;nextSpawn-=ms;nextAmmo-=ms;
 const nextWave=1+Math.floor(elapsed/22000); // a new wave about every 22 seconds
 if(nextWave>wave){
  wave=nextWave;
  for(let k=0;k<Math.round(Math.min(8,2+Math.floor(wave/2))*SETTINGS.spawnFactor);k++)spawnOne();
  if(wave%4===0)general();
  showBanner('ტალღა '+wave+' • სიმონა უსასრულოდ');
 }
 if(nextSpawn<=0){
  spawnOne();
  nextSpawn=Math.max(240,880-wave*18)/SETTINGS.spawnFactor;
 }
 if(nextAmmo<=0){
  replenishAmmo();nextAmmo=3300;
 }
 // Don't retain dead soldiers and consumed pickups forever in an endless run.
 if(frame%70===0){
  enemies=enemies.filter(e=>e.alive);
  pickups=pickups.filter(p=>!p.col);
  if(corpses.length>38)corpses.splice(0,corpses.length-38);
  if(parts.length>240)parts.splice(0,parts.length-240);
  if(bullets.length>260)bullets=bullets.filter(b=>b.alive).slice(-260);
 }
 if(frame%12===0)window.PiraliEndlessHUD?.refresh();
}
function onKill(enemy){
 if(level!==11)return;
 kills++;
 if(enemy?.etype==='landlord'&&window.PiraliDropBalance?.rollHealingDrop()){
  pickups.push({x:enemy.x,y:enemy.y,bob:Math.random()*6.28,col:false,type:'health'});
 }
 window.PiraliEndlessHUD?.refresh();
}
window.PiraliEndless=Object.freeze({
 setup,tick,onKill,
 state:()=>({active:live&&level===11,wave,kills,elapsedMs:elapsed,onScreen:liveCount(),cap:CAP})
});
const prevWorld=genWorld;
genWorld=function(...args){const result=prevWorld.apply(this,args);setup();return result;};
})();
