/* PIRALI 0.16.1 — final stage reward ledger and 4500-point heart. */
(function(){
'use strict';
const LIMIT=4500,BONUS=1.2; // 10% reduction from previous 5000-point cap
let tracking=false,baseline=0,previous=0,earned=0;
const baseUpdateScore=updateScoreUI;
function resetAtCurrentScore(){
 tracking=true;baseline=score;previous=score;earned=0;
}
updateScoreUI=function(){
 if(level!==10){
   tracking=false;
   baseUpdateScore();
   return;
 }
 if(!tracking)resetAtCurrentScore();
 else{
   const raw=score-previous;
   if(raw>0)earned=Math.min(LIMIT,earned+Math.round(raw*BONUS));
   // No normal scoring event in the final stage may exceed the 4500-point cap.
   score=baseline+earned;previous=score;
 }
 baseUpdateScore();
};
// A 4500-point Devil heart fills the TENTH-STAGE total to 4500, while
// respecting the previously agreed maximum of 4500 level-ten points.
function claimHeart(){
 if(level!==10)return false;
 if(!tracking)resetAtCurrentScore();
 earned=LIMIT;
 score=baseline+earned;previous=score;
 baseUpdateScore();
 return true;
}
window.PiraliHellScore=Object.freeze({
 claimHeart,stagePoints:()=>level===10?earned:0,cap:LIMIT
});
})();
