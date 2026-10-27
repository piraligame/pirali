/* PIRALI BETA 1.10.2 — stage 6 gets 10% fewer enemies than 1.10.1 and a clear opening route. */
(function(){
'use strict';
const SET=Object.freeze({
 6:Object.freeze({count:.81*.90,hp:.85*.90*.95*.90,attack:.85*.90*.95*.90}),
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