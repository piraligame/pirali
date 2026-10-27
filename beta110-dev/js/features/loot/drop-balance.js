/* PIRALI BETA 1.07: all-stage 10% extra relative ammo, shells and hearts drops.
   Existing old probabilities: regular health 0.65 * 0.20 = 0.13,
   regular Mauser ammo 0.65 * 0.80 = 0.52.
   Relative multipliers requested: hearts ×0.90, bullets ×1.20.
   Boss's 4500-point STORY heart is a guaranteed mission reward,
   not a random healing-heart drop. */
(function(){
'use strict';
 const CONFIG=Object.freeze({
   heartMultiplier:.99,
   bulletMultiplier:1.32,
   legacyHealthChance:.65*.20,
   legacyAmmoChance:.65*.80,
   legacyShellChance:.26,
   shellDropReduction:.80,
   enemyAmmoDropBoost:1.15
 });
 const healthChance=CONFIG.legacyHealthChance*CONFIG.heartMultiplier;
 const ammoChance=CONFIG.legacyAmmoChance*CONFIG.bulletMultiplier*CONFIG.enemyAmmoDropBoost; // 10% extra relative to BETA 1.06
 const shellChance=CONFIG.legacyShellChance*CONFIG.bulletMultiplier*CONFIG.shellDropReduction*CONFIG.enemyAmmoDropBoost; // 10% extra relative to BETA 1.06
 // Only stage 6 receives an additional 20% healing-heart drop chance.
 // Keep the ammo probability unchanged; the additional hearts replace no-drops.
 function rollEnemyDrop(stage=level){
   const stageHeartChance=Math.min(1,healthChance*(Number(stage)===6?1.20:1));
   const roll=Math.random();
   if(roll<stageHeartChance)return 'health';
   if(roll<stageHeartChance+ammoChance)return 'ammo';
   return null;
 }
 function rollHealingDrop(){return Math.random()<CONFIG.heartMultiplier;}
 function rollShellDrop(stage){return Math.random()<shellChance*(Number(stage)===8?.85:1);}
 window.PiraliDropBalance=Object.freeze({
   config:CONFIG,healthChance,ammoChance,shellChance,
   rollEnemyDrop,rollHealingDrop,rollShellDrop,shellChanceAt:(stage)=>shellChance*(Number(stage)===8?.85:1),
   endlessHealthChance:.40*CONFIG.heartMultiplier,
   endlessRestockMultiplier:CONFIG.bulletMultiplier
 });
})();
