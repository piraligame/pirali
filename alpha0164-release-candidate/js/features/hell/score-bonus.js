/* PIRALI 0.16.4: stage-10 ordinary rewards <=180,
   Devil Heart +250 only upon collection, story <=5000, gate +0. */
(function(){
'use strict';
const NORMAL_LIMIT=180,FACTOR=.96,HEART=250,CAP=5000;
let tracking=false,baseline=0,previous=0,earned=0,heartBonus=0;
const baseUpdateScore=updateScoreUI;
function reset(){tracking=false;baseline=0;previous=0;earned=0;heartBonus=0;}
function begin(){tracking=true;baseline=score;previous=score;earned=0;heartBonus=0;}
updateScoreUI=function(){
 if(level!==10){tracking=false;baseUpdateScore();return;}
 if(!tracking)begin();
 else{
   const delta=score-previous;
   if(delta>0)earned=Math.min(NORMAL_LIMIT,earned+Math.max(1,Math.round(delta*FACTOR)));
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