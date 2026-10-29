/* PIRALI Beta 1.17 — gentle opening for stages 1–5, 8 and 10.
   Runs after all other genWorld wrappers. It does NOT remove or weaken enemies. */
(function(){
'use strict';
const SAFE_RULES=Object.freeze({1:750,2:750,3:750,4:750,5:750,8:700,10:700}); // eyesight: 560
const ENEMY_SEPARATION=96;
const ROAD_OFFSETS=[-35,35,0,-55,55];
const baseGenWorld=genWorld;
function roadXAt(y){
  for(let i=0;i<path.length-1;i++){
    const a=path[i],b=path[i+1];
    if(!a||!b)continue;
    if(y<=Math.max(a.y,b.y)&&y>=Math.min(a.y,b.y)){
      const t=(y-a.y)/((b.y-a.y)||1);
      return a.x+(b.x-a.x)*t;
    }
  }
  return P.x;
}
function spaceOpening(){
  const SAFE_START_DISTANCE=SAFE_RULES[level];
  if(!SAFE_START_DISTANCE)return;
  const beforeCount=enemies.length;
  const startX=P.x,startY=P.y;
  const distance=e=>Math.hypot(e.x-startX,e.y-startY);
  const beforeMin=enemies.length?Math.min(...enemies.map(distance)):null;
  const close=enemies.filter(e=>e.alive&&!e.isNPC&&distance(e)<SAFE_START_DISTANCE)
    .sort((a,b)=>b.y-a.y);
  const moving=new Set(close);
  const occupied=enemies.filter(e=>!moving.has(e));
  let moved=0;
  for(let i=0;i<close.length;i++){
    const e=close[i];
    // Keep the same enemies on the road, further toward the church.
    const preferredY=Math.min(e.y-50,startY-SAFE_START_DISTANCE-i*118);
    let chosen=null;
    for(let attempt=0;attempt<75;attempt++){
      const y=Math.max(CHURCH_Y+540,preferredY-Math.floor(attempt/ROAD_OFFSETS.length)*83);
      const offset=ROAD_OFFSETS[(attempt+i)%ROAD_OFFSETS.length];
      const x=Math.max(e.r+20,Math.min(WW-e.r-20,roadXAt(y)+offset));
      if(Math.hypot(x-startX,y-startY)<SAFE_START_DISTANCE)continue;
      if(occupied.some(other=>Math.hypot(other.x-x,other.y-y)<ENEMY_SEPARATION+other.r*.3))continue;
      if(trees.some(t=>Math.hypot(t.x-x,t.y-y)<e.r+t.r*.43+9))continue;
      chosen={x,y};
      break;
    }
    // All stages have a long unobstructed road; maintain a safe fallback.
    if(!chosen){
      const y=Math.max(CHURCH_Y+540,preferredY-1250);
      chosen={x:Math.max(e.r+20,Math.min(WW-e.r-20,roadXAt(y))),y};
    }
    e.x=chosen.x;e.y=chosen.y;
    if(e.patrol){e.patrol.cx=e.x;e.patrol.cy=e.y;}
    e.vx=0;e.vy=0;
    e.state='patrol';e.alertTimer=0;e.seesSimona=false;
    occupied.push(e);
    moved++;
  }
  const afterMin=enemies.length?Math.min(...enemies.map(distance)):null;
  window.PiraliEarlyStageSpacing=Object.freeze({
    stage:level,moved,beforeCount,afterCount:enemies.length,
    beforeMin,afterMin,clearance:SAFE_START_DISTANCE
  });
}
genWorld=function(...args){
 const result=baseGenWorld.apply(this,args);
 spaceOpening();
 // Final stage generation pass: only now are the exact number of enemies,
 // two generals, finite pickups, and stage-7 boss rewards known.
 window.PiraliStageScoring?.prepareStage?.();
 return result;
};
window.PiraliEarlyStart=Object.freeze({clearanceFor:n=>SAFE_RULES[n]||0,appliesTo:[1,2,3,4,5,8,10]});
})();
