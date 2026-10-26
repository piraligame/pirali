/* PIRALI 0.16.3 DEV — story score cap 100,000 and bonus +300.
   Story stages 1-9: existing 0.90 award × additional 0.80 = 0.72.
   Stage 10 Hell ledger separately reduced from cap 4500 to 3600.
   Entering stage 11 through the flaming gate awards any remaining story
   completion points up to 100,000; from then kills award +300 with no cap. */
(function(){
'use strict';
const STORY_CAP=100000,AWARD_MULTIPLIER=.72,BONUS_KILL=300;
let current=null,previous=0;
const base=updateScoreUI;
function enterStage(){current=level;previous=score;if(level<=10)score=Math.min(STORY_CAP,score);}
function beginEndless(){
 score=STORY_CAP;current=11;previous=score;
 base();
}
updateScoreUI=function(...args){
 if(current!==level)enterStage();
 else if(level>=1&&level<=9&&score>previous){
  score=previous+Math.max(1,Math.round((score-previous)*AWARD_MULTIPLIER));
 }
 if(level>=1&&level<=10)score=Math.max(0,Math.min(STORY_CAP,score));
 previous=score;
 return base.apply(this,args);
};
window.PiraliStageScoring=Object.freeze({
 enterStage,beginEndless,ratio:AWARD_MULTIPLIER,
 storyCap:STORY_CAP,hellLimit:3600,endlessKillPoints:BONUS_KILL
});
})();