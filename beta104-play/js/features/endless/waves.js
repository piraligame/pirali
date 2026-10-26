/* PIRALI BETA 1.04 — complete 20-enemy waves, never refill a live wave.
   The next wave begins ONLY when all 20 of the previous wave are defeated.
   Enemy HP, movement speed and attack rate grow 10% per completed wave. */
(function(){
'use strict';
const SETTINGS=window.PiraliEndlessBalance;
const CAP=20;
const TYPES=['rifle','saber','officer','rifle','saber','landlord'];
let live=false,elapsed=0,nextAmmo=0,wave=0,kills=0,waveKills=0,spawned=0,ammoRemainder=0;
function power(){return Math.pow(1.10,Math.max(0,wave-1));}
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
function liveCount(){
 return enemies.reduce((s,e)=>s+Number(!!e.alive),0)+Number(!!boss?.alive);
}
function spawnOne(){
 if(level!==11||spawned>=CAP||liveCount()>=CAP)return false;
 const pt=randomPoint();
 const type=TYPES[Math.floor(Math.random()*TYPES.length)];
 const landlord=type==='landlord',officer=type==='officer';
 // Keep first-wave durability the same as the previous version.
 const baseHp=landlord?3:Math.max(3,Math.min(PIRALI_STAGE_BALANCE.oldSoldierHp(11),4+(officer?1:0)));
 const hp=Number((PIRALI_STAGE_BALANCE.scaleRegularHp(baseHp*SETTINGS.healthFactor)*power()).toFixed(3));
 enemies.push({
  x:pt.x,y:pt.y,r:officer?14:landlord?13:12,hp,maxHp:hp,
  vx:0,vy:0,ang:pt.ang+Math.PI,wf:0,hf:0,
  patrol:{cx:pt.x,cy:pt.y,radius:35+Math.random()*35,t:Math.random()*6.28,spd:.3},
  sT:35+Math.random()*70,alive:true,etype:type,isNPC:landlord,
  alertTimer:20,state:landlord?'patrol':'attack',flankTimer:0,
  groupId:'endless-'+wave,retreating:false,retreatTimer:0,
  endlessWave:wave,wavePower:power()
 });
 spawned++;
 return true;
}
function replenishAmmo(){
 const waiting=pickups.filter(p=>!p.col&&(p.type==='ammo'||p.type==='health'));
 if(waiting.length>=65)return;
 const exact=12*window.PiraliDropBalance.endlessRestockMultiplier+ammoRemainder;
 const quantity=Math.floor(exact);
 ammoRemainder=exact-quantity;
 for(let i=0;i<quantity;i++){
  const a=Math.random()*Math.PI*2,r=35+Math.random()*360;
  const x=Math.max(45,Math.min(WW-45,P.x+Math.cos(a)*r));
  const y=Math.max(210,Math.min(WH-145,P.y+Math.sin(a)*r));
  if(trees.some(t=>Math.hypot(t.x-x,t.y-y)<t.r*.4+20))continue;
  pickups.push({x,y,bob:Math.random()*6.28,col:false,
   type:(i===0&&Math.random()<window.PiraliDropBalance.endlessHealthChance)?'health':'ammo'});
 }
}
function spawnGeneral(){
 if(level!==11||spawned>=CAP||boss?.alive||liveCount()>=CAP)return false;
 const pt=randomPoint(420,600);
 const baseHp=Number((Math.max(8,Math.min(24,12+1))*.85*.90).toFixed(3));
 const hp=Number((baseHp*power()).toFixed(3));
 boss={
  x:pt.x,y:pt.y,r:24,hp,maxHp:hp,
  vx:0,vy:0,ang:pt.ang,alive:true,hf:0,wf:0,
  sT:62,chargeT:0,charging:false,chargeDx:0,chargeDy:0,
  rageMode:false,enrageHp:Math.ceil(hp/3),phase:1,
  groundSlamCD:0,groundSlamActive:false,groundSlamT:0,
  groundSlamX:0,groundSlamY:0,endlessWave:wave,wavePower:power()
 };
 spawned++;
 return true;
}
function startWave(){
 if(!live||level!==11)return;
 wave++;waveKills=0;spawned=0;
 // Every fourth wave includes a General *within* the 20, not as an extra foe.
 for(let i=0;i<CAP;i++){
  if(wave%4===0&&i===CAP-1)spawnGeneral();
  else spawnOne();
 }
 showBanner('ტალღა '+wave+' — '+CAP+' მტერი');
 window.PiraliEndlessHUD?.refresh();
}
function setup(){
 live=level===11;
 if(!live)return;
 elapsed=0;wave=0;kills=0;waveKills=0;spawned=0;nextAmmo=3300;ammoRemainder=0;
 P.x=WW*.5;P.y=WH*.53;P.vx=P.vy=0;P.ang=-Math.PI/2;
 camX=Math.max(0,Math.min(WW-W,P.x-W*.5));
 camY=Math.max(0,Math.min(WH-H,P.y-H*.5));
 enemies=[];boss=null;bullets=[];pickups=[];corpses=[];
 health=maxHealth;ammo=maxAmmo;updateHealthUI();updateAmmoUI();
 trees=trees.filter(t=>Math.hypot(t.x-P.x,t.y-P.y)>680+t.r*.5);
 window.PiraliGraveyard?.populate();
 startWave();
 replenishAmmo();
}
function tick(dt){
 if(!live||level!==11||P.dead||!running)return;
 const ms=Math.max(0,Math.min(100,dt*16.67));
 elapsed+=ms;nextAmmo-=ms;
 // No interval spawns. Do not advance merely because some enemies died:
 // wait until ALL twenty kills were registered and the arena is empty.
 if(spawned===CAP&&waveKills===CAP&&liveCount()===0)startWave();
 if(nextAmmo<=0){replenishAmmo();nextAmmo=3300;}
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
 if(!live||level!==11||enemy?.endlessWave!==wave)return;
 kills++;waveKills=Math.min(CAP,waveKills+1);
 if(enemy.etype==='landlord'&&window.PiraliDropBalance?.rollHealingDrop())
  pickups.push({x:enemy.x,y:enemy.y,bob:Math.random()*6.28,col:false,type:'health'});
 window.PiraliEndlessHUD?.refresh();
}
window.PiraliEndless=Object.freeze({
 setup,tick,onKill,
 state:()=>({active:live&&level===11,wave,kills,waveKills,spawned,
             remaining:Math.max(0,CAP-waveKills),waveTarget:CAP,
             power:power(),elapsedMs:elapsed,onScreen:liveCount(),cap:CAP})
});
const prevWorld=genWorld;
genWorld=function(...args){const result=prevWorld.apply(this,args);setup();return result;};
})();
