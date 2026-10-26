/* PIRALI 0.16.4 new 5,000 story / 500 endless bonus score system.
   Gate awards zero, endless maximum is earned story score +500 (<=5500). */
(function(){
'use strict';
const STORY_CAP=5000,BONUS_CAP=500,AWARD_MULTIPLIER=.72,BONUS_KILL=5;
let current=null,previous=0,endlessBase=0;
const base=updateScoreUI;
function enterStage(){
 current=level;
 if(level>=1&&level<=10)score=Math.max(0,Math.min(STORY_CAP,score));
 if(level===11){
  const saved=window.PiraliCheckpoint?.endlessBase?.();
  endlessBase=Number.isFinite(saved)?Math.max(0,Math.min(STORY_CAP,saved)):Math.max(0,Math.min(STORY_CAP,score));
  score=Math.max(endlessBase,Math.min(endlessBase+BONUS_CAP,score));
 }
 previous=score;
}
function beginEndless(){
 endlessBase=Math.max(0,Math.min(STORY_CAP,score));
 score=endlessBase;current=11;previous=score; // no gate points
 base();
}
updateScoreUI=function(...args){
 if(current!==level)enterStage();
 else if(level>=1&&level<=9&&score>previous)
  score=previous+Math.max(1,Math.round((score-previous)*AWARD_MULTIPLIER));
 if(level>=1&&level<=10)score=Math.max(0,Math.min(STORY_CAP,score));
 if(level===11)score=Math.max(endlessBase,Math.min(endlessBase+BONUS_CAP,score));
 previous=score;
 return base.apply(this,args);
};
window.PiraliStageScoring=Object.freeze({
 enterStage,beginEndless,ratio:AWARD_MULTIPLIER,
 storyCap:STORY_CAP,bonusCap:BONUS_CAP,bonusKillPoints:BONUS_KILL,
 endlessBaseline:()=>endlessBase,bonusEarned:()=>level===11?Math.max(0,score-endlessBase):0,
 hellLimit:180,devilHeartPoints:250,endlessKillPoints:BONUS_KILL
});
})();