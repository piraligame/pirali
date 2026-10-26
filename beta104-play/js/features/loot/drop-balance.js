/* PIRALI 0.16.4 DEV B: +15% relative enemy ammo and shell drop odds across all 11 stages.
   Existing old probabilities: regular health 0.65 * 0.20 = 0.13,
   regular Mauser ammo 0.65 * 0.80 = 0.52.
   Relative multipliers requested: hearts ×0.90, bullets ×1.20.
   Boss's 4500-point STORY heart is a guaranteed mission reward,
   not a random healing-heart drop. */
(function(){
'use strict';
 const CONFIG=Object.freeze({
   heartMultiplier:.90,
   bulletMultiplier:1.20,
   legacyHealthChance:.65*.20,
   legacyAmmoChance:.65*.80,
   legacyShellChance:.26,
   shellDropReduction:.80,
   enemyAmmoDropBoost:1.15
 });
 const healthChance=CONFIG.legacyHealthChance*CONFIG.heartMultiplier;
 const ammoChance=CONFIG.legacyAmmoChance*CONFIG.bulletMultiplier*CONFIG.enemyAmmoDropBoost; // 62.4% -> 71.76%
 const shellChance=CONFIG.legacyShellChance*CONFIG.bulletMultiplier*CONFIG.shellDropReduction*CONFIG.enemyAmmoDropBoost; // 24.96% -> 28.704%
 function rollEnemyDrop(){
   const roll=Math.random();
   if(roll<healthChance)return 'health';
   if(roll<healthChance+ammoChance)return 'ammo';
   return null;
 }
 function rollHealingDrop(){return Math.random()<CONFIG.heartMultiplier;}
 function rollShellDrop(){return Math.random()<shellChance;}
 window.PiraliDropBalance=Object.freeze({
   config:CONFIG,healthChance,ammoChance,shellChance,
   rollEnemyDrop,rollHealingDrop,rollShellDrop,
   endlessHealthChance:.40*CONFIG.heartMultiplier,
   endlessRestockMultiplier:CONFIG.bulletMultiplier
 });
})();
