/* PIRALI Beta 1.50: stage 4 -10% soldiers, HP and attack tempo, plus existing stage-specific balances. */
(function(){
'use strict';
const SET=Object.freeze({
 4:Object.freeze({count:.90,hp:.95*.90*.90,attack:.95*.90*.90}), // Beta 1.50: stage 4 only, 10% fewer and 10% weaker than 1.49
 6:Object.freeze({count:.81*.90,hp:.85*.90*.95*.90*.85,attack:.85*.90*.95*.90*.85}), // Beta 1.18: additional -15% effective HP and attack tempo only on stage 6
 7:Object.freeze({count:.90,hp:.95*.90*.90,attack:.95*.90*.90}),
 8:Object.freeze({count:1,hp:.85*.95*.90,attack:.85*.95*.90}),
 9:Object.freeze({count:15,hp:.80*.95*.90,attack:.80*.95*.90}),
 10:Object.freeze({count:1,hp:.80*.95*.90,attack:.80*.95*.90}),
 11:Object.freeze({count:1,hp:1,attack:1})
});
function config(stage=level){return SET[stage]||(stage>=1&&stage<=10?{hp:.95*.90,attack:.95*.90}:null);}
function attack(stage=level){return config(stage)?.attack||1;}
const previous=genWorld;
genWorld=function(...args){
 const result=previous.apply(this,args);
 const c=config();
 if(!c)return result;
 if(level===4){
  // Keep the route covered evenly: do not simply remove the last 10% of soldiers.
  const before=enemies.length;
  const target=Math.max(0,Math.round(before*c.count));
  if(target>0&&target<before){
   const original=enemies;
   enemies=Array.from({length:target},(_,i)=>original[Math.min(before-1,Math.floor((i+.5)*before/target))]);
  }
  window.PiraliStageFourTuning=Object.freeze({
   before,after:enemies.length,countMultiplier:.90,
   hpMultiplierFromPrevious:.90,attackMultiplierFromPrevious:.90
  });
 }

 if(level===6){
  // Older builds sliced the FIRST enemies only, crowding the start of the level.
  // Keep a 660-world-unit clear start and sample uniformly across the rest of the path.
  // The target count is 90% of BETA 1.10.1 (the previous x0.81 selection).
  const target=Math.max(1,Math.round(enemies.length*c.count));
  const startX=WW/2,startY=WH-180;
  const candidates=enemies.filter(e=>Math.hypot(e.x-startX,e.y-startY)>=660);
  const keep=Math.min(target,candidates.length);
  const spaced=[];
  for(let i=0;i<keep;i++){
   const index=Math.min(candidates.length-1,Math.floor((i+.5)*candidates.length/keep));
   spaced.push(candidates[index]);
  }
  enemies=spaced;
  window.PiraliStageSixSpacing=Object.freeze({
   countBefore:Math.round(target/c.count),countAfter:enemies.length,
   target,spawnClearRadius:660
  });
 }
 if(level===7){
  // Preserve four church guards; spread 10% fewer ordinary soldiers along the road,
  // leaving the first 700 world units free from enemy contact.
  const initial=enemies.length;
  const guards=enemies.slice(-4);
  const regular=enemies.slice(0,-4);
  const target=Math.max(guards.length,Math.round(initial*c.count));
  const regularTarget=Math.max(0,Math.min(regular.length,target-guards.length));
  const startX=WW/2,startY=WH-180;
  const road=path.filter(pt=>pt&&pt.y<=startY-760&&pt.y>=CHURCH_Y+650);
  const chosen=[];
  for(let i=0;i<regularTarget;i++){
   const sourceIndex=Math.min(regular.length-1,Math.floor((i+.5)*regular.length/regularTarget));
   const soldier=regular[sourceIndex];
   const node=road[Math.min(road.length-1,Math.floor((i+.5)*road.length/regularTarget))];
   if(!node)continue;
   soldier.x=Math.max(80,Math.min(WW-80,node.x+(i%2===0?-52:52)));
   soldier.y=node.y+(i%3-1)*12;
   soldier.patrol.cx=soldier.x;soldier.patrol.cy=soldier.y;
   soldier.groupId='stage7-route-'+i;
   soldier.vx=0;soldier.vy=0;soldier.state='patrol';soldier.alertTimer=0;
   chosen.push(soldier);
  }
  enemies=[...chosen,...guards];
  window.PiraliStageSevenTuning=Object.freeze({
   before:initial,after:enemies.length,target,
   startingEnemyClearRadius:700,churchGuardsPreserved:guards.length,
   hpMultiplierFromPrevious:.90,attackMultiplierFromPrevious:.90
  });
 }
 for(const enemy of enemies){
  enemy.hp=Number((enemy.hp*c.hp).toFixed(3));
  enemy.maxHp=enemy.hp;
 }
 for(const general of [boss,window.PiraliDualGenerals?.second?.()]){
  if(!general||!general.alive)continue;
  general.hp=Number((general.hp*c.hp).toFixed(3));
  general.maxHp=general.hp;
  general.enrageHp=Math.min(general.hp,Number((general.enrageHp*c.hp).toFixed(3)));
 }
 return result;
};
window.PiraliStageTuning=Object.freeze({config,attack});
})();