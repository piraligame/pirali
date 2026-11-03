/* PIRALI Beta 1.16 — stage ten score is owned by the single scoring ledger.
   Previous updateScoreUI wrapper could eat/duplicate the first award. */
(function(){
'use strict';
function reset(){} // normal stage preparation resets the ledger
function claimHeart(){
 return level===10&&window.PiraliStageScoring?.claimDevilCoins?.()===true;
}
window.PiraliHellScore=Object.freeze({
 reset,claimHeart,stagePoints:()=>level===10?(window.PiraliStageScoring?.stageEarned?.()||0):0,
 cap:180,heartValue:250,storyCap:5000
});
})();