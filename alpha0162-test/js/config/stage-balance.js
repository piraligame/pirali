/* PIRALI Alpha 0.16.2 DEV — stage-by-stage enemy durability.
   The same base enemies are reused; +20% growth each successive stage.
   Keep this tuning in ONE place rather than scattering constants. */
const PIRALI_STAGE_BALANCE=Object.freeze({
 perLevel:1.20,
 soldierBase(n){return n<=2?1:2;},
 soldierHp(n){
   const stage=Math.max(1,Math.min(10,Number(n)||1));
   return Math.max(1,Math.round(this.soldierBase(stage)*Math.pow(this.perLevel,stage-1)));
 },
 generalHp(n){return n===8?Math.round(PIRALI_BALANCE.finalBossHp*1.20):PIRALI_BALANCE.finalBossHp;}
});
