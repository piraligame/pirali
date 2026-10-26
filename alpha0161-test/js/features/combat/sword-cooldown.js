/* PIRALI Alpha 0.16.1 DEV — sword cooldown in frames.
   0.14.2 already shortened the original normal 34 / combo 24 by 20%.
   This update shortens the CURRENT cooldown by a further 20%.
   Normal: 34 × .8 × .8 = 21.76; combo: 24 × .8 × .8 = 15.36.
   Animation length, damage and parry behavior are intentionally unchanged. */
(function(){
 'use strict';
 const BALANCE=Object.freeze({
   normalFrames:34,
   comboFrames:24,
   previousMultiplier:.8,
   currentMultiplier:.8
 });
 function forCombo(isCombo){
   const original=isCombo?BALANCE.comboFrames:BALANCE.normalFrames;
   return original*BALANCE.previousMultiplier*BALANCE.currentMultiplier;
 }
 window.PiraliSwordCooldown=Object.freeze({forCombo,settings:BALANCE});
})();
