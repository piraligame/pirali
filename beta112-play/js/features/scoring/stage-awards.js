/* PIRALI 0.16.4 new 5,000 story / 2,000 five-wave bonus score system.
   Gate awards zero, endless maximum is earned story score +2000 (<=7000). */
(function(){
'use strict';
const STORY_CAP=5000,BONUS_CAP=2000,AWARD_MULTIPLIER=.72,BONUS_KILL=0;
const WAVE_POINTS=[0,300,300,400,400,600];
const WAVE_CUMULATIVE=[0,300,600,1000,1400,2000];
let current=null,previous=0,endlessBase=0,wavesPaid=0;
const base=updateScoreUI;
function enterStage(){
 current=level;
 if(level>=1&&level<=10)score=Math.max(0,Math.min(STORY_CAP,score));
 if(level===11){
  wavesPaid=0;
  const saved=window.PiraliCheckpoint?.endlessBase?.();
  endlessBase=Number.isFinite(saved)?Math.max(0,Math.min(STORY_CAP,saved)):Math.max(0,Math.min(STORY_CAP,score));
  score=Math.max(endlessBase,Math.min(endlessBase+BONUS_CAP,score));
 }
 previous=score;
}
function beginEndless(){
 endlessBase=Math.max(0,Math.min(STORY_CAP,score));
 score=endlessBase;current=11;previous=score;wavesPaid=0; // no gate points
 base();
}
updateScoreUI=function(...args){
 if(current!==level)enterStage();
 else if(level>=1&&level<=9&&score>previous)
  score=previous+Math.max(1,Math.round((score-previous)*AWARD_MULTIPLIER));
 if(level>=1&&level<=10)score=Math.max(0,Math.min(STORY_CAP,score));
 if(level===11)score=Math.max(endlessBase,Math.min(endlessBase+Math.min(BONUS_CAP,WAVE_CUMULATIVE[wavesPaid]),score));
 previous=score;
 return base.apply(this,args);
};
function completeWave(n){
 if(level!==11||!Number.isInteger(n)||n!==wavesPaid+1||n<1||n>5)return 0;
 wavesPaid=n;
 const before=score;
 score=Math.min(STORY_CAP+BONUS_CAP,endlessBase+WAVE_CUMULATIVE[wavesPaid]);
 updateScoreUI();
 if(typeof showFloatingText==='function')showFloatingText(P.x,P.y-47,'🏆 +'+WAVE_POINTS[n],'#f5da71');
 return score-before;
}
window.PiraliStageScoring=Object.freeze({
 enterStage,beginEndless,completeWave,wavesPaid:()=>wavesPaid,wavePoints:(n)=>WAVE_POINTS[n]||0,ratio:AWARD_MULTIPLIER,
 storyCap:STORY_CAP,bonusCap:BONUS_CAP,bonusKillPoints:BONUS_KILL,
 endlessBaseline:()=>endlessBase,bonusEarned:()=>level===11?Math.max(0,score-endlessBase):0,
 hellLimit:180,devilHeartPoints:250,endlessKillPoints:BONUS_KILL
});
})();