/* PIRALI 0.16.1 — sixth stage reward ledger and 5000-point heart. */
(function(){
'use strict';
const LIMIT=5000,BONUS=1.2;
let tracking=false,baseline=0,previous=0,earned=0;
const baseUpdateScore=updateScoreUI;
function resetAtCurrentScore(){
 tracking=true;baseline=score;previous=score;earned=0;
}
updateScoreUI=function(){
 if(level!==6){
   tracking=false;
   baseUpdateScore();
   return;
 }
 if(!tracking)resetAtCurrentScore();
 else{
   const raw=score-previous;
   if(raw>0)earned=Math.min(LIMIT,earned+Math.round(raw*BONUS));
   // No normal scoring event in the sixth stage may exceed the 5000-point cap.
   score=baseline+earned;previous=score;
 }
 baseUpdateScore();
};
// A 5000-point Devil heart fills the SIXTH-STAGE total to 5000, while
// respecting the previously agreed maximum of 5000 level-six points.
function claimHeart(){
 if(level!==6)return false;
 if(!tracking)resetAtCurrentScore();
 earned=LIMIT;
 score=baseline+earned;previous=score;
 baseUpdateScore();
 return true;
}
window.PiraliHellScore=Object.freeze({
 claimHeart,stagePoints:()=>level===6?earned:0,cap:LIMIT
});
})();
