/* PIRALI BETA 1.10.1 — stage 11 +20% healing-heart chance over BETA 1.10, all five waves unchanged. */
(function(){
'use strict';
const CAP=10,FINAL_WAVE=5;
// Beta 1.10 had x1.15; new beta is 20% higher: x1.15 * x1.20 = x1.38.
// Applies only to stage 11 periodic ammunition/health supplies, not global drops.
const HEART_RESTOCK_MULTIPLIER=1.38;
const TYPES=['rifle','saber','officer','rifle','saber'];
let live=false,cleared=false,completed=false,wave=0,kills=0,waveKills=0,spawned=0;
let spawnClock=0,elapsed=0,nextAmmo=3300,ammoRemainder=0,wasOutsideHouse=false;
function power(){return Math.pow(1.10,Math.max(0,wave-1));}
function houseDist(){return Math.hypot(P.x-CHURCH_X,P.y-(CHURCH_Y+65));}
function point(minR=290,maxR=460){
 for(let i=0;i<35;i++){
  const ang=Math.random()*Math.PI*2,r=minR+Math.random()*(maxR-minR);
  const x=Math.max(80,Math.min(WW-80,P.x+Math.cos(ang)*r));
  const y=Math.max(260,Math.min(WH-210,P.y+Math.sin(ang)*r));
  if(Math.hypot(x-P.x,y-P.y)<minR*.75)continue;
  if(trees.some(t=>Math.hypot(t.x-x,t.y-y)<t.r*.48+30))continue;
  if(enemies.some(e=>e.alive&&Math.hypot(e.x-x,e.y-y)<62))continue;
  if(boss?.alive&&Math.hypot(boss.x-x,boss.y-y)<65)continue;
  return{x,y,ang};
 }
 return{x:Math.max(75,Math.min(WW-75,P.x+350)),y:Math.max(260,Math.min(WH-210,P.y+220)),ang:0};
}
function living(){
 return enemies.filter(e=>e.alive).length+Number(!!boss?.alive)+Number(!!window.PiraliDualGenerals?.second?.()?.alive&&level===11);
}
function soldier(){
 const pt=point(),type=TYPES[Math.floor(Math.random()*TYPES.length)],officer=type==='officer';
 const hp=Number((PIRALI_STAGE_BALANCE.scaleRegularHp(Math.max(3,Math.min(PIRALI_STAGE_BALANCE.oldSoldierHp(11),4+(officer?1:0)))*window.PiraliEndlessBalance.healthFactor)*power()*.90*.95*.90).toFixed(3));
 enemies.push({
  x:pt.x,y:pt.y,r:officer?14:12,hp,maxHp:hp,vx:0,vy:0,ang:pt.ang+Math.PI,wf:0,hf:0,
  patrol:{cx:pt.x,cy:pt.y,radius:45,t:pt.ang,spd:.32},
  sT:32+Math.random()*50,alive:true,etype:type,isNPC:false,
  alertTimer:140,state:'attack',flankTimer:0,groupId:'home-'+wave,
  retreating:false,retreatTimer:0,endlessWave:wave,wavePower:power()*.90*.95*.90
 });
 spawned++;
}
function general(){
 const pt=point(360,540);
 const hp=Number((Math.max(8,Math.min(24,13))*.85*.90*power()*.90*.95*.90*1.20).toFixed(3));
 const b={
  x:pt.x,y:pt.y,r:24,hp,maxHp:hp,vx:0,vy:0,ang:pt.ang,alive:true,hf:0,wf:0,
  sT:62,chargeT:0,charging:false,chargeDx:0,chargeDy:0,
  rageMode:false,enrageHp:Math.ceil(hp/3),phase:1,
  groundSlamCD:0,groundSlamActive:false,groundSlamT:0,groundSlamX:0,groundSlamY:0,
  endlessWave:wave,wavePower:power()*.90*.95*.90
 };
 if(!boss?.alive)boss=b;
 else window.PiraliDualGenerals?.setEndlessSecond?.(b);
 spawned++;
}
function scheduledGeneral(){
 return (wave===4&&spawned===9)||(wave===5&&spawned>=8);
}
function addOne(){
 if(!live||level!==11||spawned>=CAP)return false;
 if(scheduledGeneral())general();else soldier();
 return true;
}
function supply(){
 // Stage 11 resets pickups on entering the graveyard. Keep shotgun
 // ammunition available there after the gun has been acquired.
 if(window.PiraliAlphaGear?.status?.().owned===true){
  const remaining=pickups.filter(p=>!p.col&&p.type==='alpha-shells').length;
  for(let i=remaining;i<3;i++){
   const angle=i*2.39996323,dist=105+i*60;
   const x=Math.max(55,Math.min(WW-55,P.x+Math.cos(angle)*dist));
   const y=Math.max(220,Math.min(WH-160,P.y+Math.sin(angle)*dist));
   pickups.push({x,y,bob:(i*.8)%6.283,col:false,type:'alpha-shells'});
  }
 }
 const waiting=pickups.filter(pk=>!pk.col&&(pk.type==='ammo'||pk.type==='health'));
 if(waiting.length>=65)return;
 const exact=12*window.PiraliDropBalance.endlessRestockMultiplier+ammoRemainder;
 const quantity=Math.floor(exact);ammoRemainder=exact-quantity;
 for(let i=0;i<quantity;i++){
  const a=Math.random()*6.283,r=55+Math.random()*320;
  const x=Math.max(55,Math.min(WW-55,P.x+Math.cos(a)*r));
  const y=Math.max(220,Math.min(WH-160,P.y+Math.sin(a)*r));
  if(trees.some(t=>Math.hypot(t.x-x,t.y-y)<t.r*.4+22))continue;
  pickups.push({x,y,bob:Math.random()*6.283,col:false,
   type:i===0&&Math.random()<Math.min(1,window.PiraliDropBalance.endlessHealthChance*HEART_RESTOCK_MULTIPLIER)?'health':'ammo'});
 }
}
function begin(){
 if(!live||wave>=FINAL_WAVE)return;
 wave++;waveKills=0;spawned=0;boss=null;window.PiraliDualGenerals?.setEndlessSecond?.(null);
 spawnClock=0;
 // The first three approach together; remaining foes arrive gradually.
 for(let i=0;i<3;i++)addOne();
 showBanner('ტალღა '+wave+'/'+FINAL_WAVE+' — '+CAP+' მტერი');
 window.PiraliEndlessHUD?.refresh();
}
function setup(){
 live=level===11;
 if(!live)return;
 cleared=false;completed=false;wasOutsideHouse=false;
 wave=0;kills=0;waveKills=0;spawned=0;elapsed=0;spawnClock=0;nextAmmo=3300;ammoRemainder=0;
 P.x=WW*.5;P.y=WH*.53;P.vx=P.vy=0;P.ang=-Math.PI/2;
 camX=Math.max(0,Math.min(WW-W,P.x-W*.5));
 camY=Math.max(0,Math.min(WH-H,P.y-H*.5));
 enemies=[];boss=null;bullets=[];pickups=[];corpses=[];
 health=maxHealth;ammo=maxAmmo;updateHealthUI();updateAmmoUI();
 trees=trees.filter(t=>Math.hypot(t.x-P.x,t.y-P.y)>680+t.r*.5);
 window.PiraliGraveyard?.populate();
 begin();supply();
}
function tick(dt){
 if(!live||level!==11||P.dead||!running)return;
 const ms=Math.max(0,Math.min(100,dt*16.67));
 elapsed+=ms;nextAmmo-=ms;
 if(!cleared){
  spawnClock+=ms;
  while(spawned<CAP&&spawnClock>=600){
   spawnClock-=600;addOne();
  }
  if(spawned===CAP&&waveKills===CAP&&living()===0){
   window.PiraliStageScoring?.completeWave?.(wave);
   if(wave===FINAL_WAVE){
    cleared=true;wasOutsideHouse=houseDist()>95;
    showBanner('🏠 გზა სახლისაკენ თავისუფალია! შედი სახლში!');
   }else begin();
  }
 }
 if(nextAmmo<=0){supply();nextAmmo=3300;}
 if(frame%70===0){
  enemies=enemies.filter(e=>e.alive);pickups=pickups.filter(p=>!p.col);
  if(corpses.length>38)corpses.splice(0,corpses.length-38);
  if(parts.length>240)parts.splice(0,parts.length-240);
  if(bullets.length>260)bullets=bullets.filter(b=>b.alive).slice(-260);
 }
 if(frame%12===0)window.PiraliEndlessHUD?.refresh();
}
function enterHouse(){
 if(!live||!cleared||completed||level!==11||P.dead||!running)return false;
 const distance=houseDist();
 if(distance>125)wasOutsideHouse=true;
 if(!wasOutsideHouse||distance>=72)return false;
 completed=true;live=false;
 window.PiraliEndlessHUD?.refresh();
 showVictory();
 return true;
}
function onKill(enemy){
 if(!live||cleared||level!==11||enemy?.endlessWave!==wave)return;
 kills++;waveKills=Math.min(CAP,waveKills+1);
 window.PiraliEndlessHUD?.refresh();
}
window.PiraliEndless=Object.freeze({
 healingSupplyMultiplier:HEART_RESTOCK_MULTIPLIER,
 setup,tick,onKill,enterHouse,
 state:()=>({active:(live||completed)&&level===11,cleared,completed,
  maxWaves:FINAL_WAVE,wave,kills,waveKills,spawned,
  remaining:Math.max(0,CAP-waveKills),waiting:CAP-spawned,
  waveTarget:CAP,power:power(),elapsedMs:elapsed,onScreen:living(),cap:CAP})
});
const originalWorld=genWorld;
genWorld=function(...args){const result=originalWorld.apply(this,args);setup();return result;};
})();