/* PIRALI 0.16.3 DEV — story-stage points 10% less than before.
   The older stages never had explicit hard score caps, so scale every
   positive award, including enemy kills, combo bonuses and medals.
   Hell (stage 10) has its own explicit 4500-point cap.
   Endless survival (stage 11) retains exactly +200 per enemy defeated. */
(function(){
'use strict';
const MULTIPLIER=.90;
let current=null,previous=0;
const base=updateScoreUI;
function enterStage(){
 current=level;previous=score;
}
updateScoreUI=function(...args){
 if(current!==level)enterStage();
 else if(level>=1&&level<=9&&score>previous){
  const gain=score-previous;
  score=previous+Math.max(1,Math.round(gain*MULTIPLIER));
 }
 previous=score;
 return base.apply(this,args);
};
window.PiraliStageScoring=Object.freeze({
 enterStage,ratio:MULTIPLIER,hellLimit:4500,endlessKillPoints:200
});
})();
