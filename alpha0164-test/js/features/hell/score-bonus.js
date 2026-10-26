/* PIRALI DEV: level-10 fight max 3600; collected Devil Heart adds 5000
   separately. Overall first-ten-stage cap 100000. Gate awards zero. */
(function(){
'use strict';
const NORMAL_LIMIT=3600,FACTOR=.96,HEART=5000,CAP=100000;
let tracking=false,baseline=0,previous=0,earned=0,heartBonus=0;
const baseUpdateScore=updateScoreUI;
function reset(){tracking=false;baseline=0;previous=0;earned=0;heartBonus=0;}
function begin(){tracking=true;baseline=score;previous=score;earned=0;heartBonus=0;}
updateScoreUI=function(){
 if(level!==10){tracking=false;baseUpdateScore();return;}
 if(!tracking)begin();
 else{
   const delta=score-previous;
   if(delta>0)earned=Math.min(NORMAL_LIMIT,earned+Math.round(delta*FACTOR));
   score=Math.min(CAP,Math.max(0,baseline+earned+heartBonus));
   previous=score;
 }
 baseUpdateScore();
};
function claimHeart(){
 if(level!==10)return false;
 if(!tracking)begin();
 if(heartBonus>0)return false;
 heartBonus=HEART;
 score=Math.min(CAP,Math.max(0,baseline+earned+heartBonus));
 previous=score;
 baseUpdateScore();
 return true;
}
window.PiraliHellScore=Object.freeze({
 reset,claimHeart,stagePoints:()=>level===10?earned+heartBonus:0,
 cap:NORMAL_LIMIT,heartValue:HEART,storyCap:CAP
});
})();