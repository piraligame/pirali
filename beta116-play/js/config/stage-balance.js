/* PIRALI Alpha 0.16.3 DEV — stage-by-stage enemy durability.
   The same base enemies are reused; +10% growth each successive stage.
   Keep this tuning in ONE place rather than scattering constants. */
const PIRALI_STAGE_BALANCE=Object.freeze({
 perLevel:1.10,
 soldierBase(n){return n<=2?1:2;},
 regularHpFactor:.90*.85, // all stages: 15% less than Alpha 0.16.4
 oldSoldierHp(n){
   const stage=Math.max(1,Math.min(11,Number(n)||1));
   if(stage<=2)return 1;
   return Math.max(2,Math.round(2*Math.pow(this.perLevel,stage-3)));
 },
 scaleRegularHp(value){return Number((value*this.regularHpFactor).toFixed(3));},
 soldierHp(n){return this.scaleRegularHp(this.oldSoldierHp(n));},
 generalHp(n){return Number(((n===8?Math.round(PIRALI_BALANCE.finalBossHp*1.20):PIRALI_BALANCE.finalBossHp)*.85).toFixed(3));}
});
