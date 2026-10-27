/* PIRALI BETA 1.07 — all-stage -10% enemy strength and stage difficulty and density. */
(function(){
'use strict';
const SET=Object.freeze({
 6:Object.freeze({count:.81,hp:.85*.90*.95*.90,attack:.85*.90*.95*.90}),
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
 if(level===6)enemies=enemies.slice(0,Math.max(1,Math.round(enemies.length*c.count)));
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