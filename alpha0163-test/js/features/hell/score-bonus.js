/* PIRALI 0.16.1 — final stage reward ledger and 3600-point heart. */
(function(){
'use strict';
const LIMIT=3600,BONUS=.96,STORY_CAP=100000; // -20% of former ledger
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
   // No normal scoring event in the final stage may exceed the 3600-point cap.
   score=Math.min(STORY_CAP,baseline+earned);previous=score;
 }
 baseUpdateScore();
};
// A 3600-point Devil heart fills the TENTH-STAGE total to 3600, while
// respecting the previously agreed maximum of 3600 level-ten points.
function claimHeart(){
 if(level!==10)return false;
 if(!tracking)resetAtCurrentScore();
 earned=LIMIT;
 score=Math.min(STORY_CAP,baseline+earned);previous=score;
 baseUpdateScore();
 return true;
}
window.PiraliHellScore=Object.freeze({
 claimHeart,stagePoints:()=>level===10?earned:0,cap:LIMIT
});
})();
