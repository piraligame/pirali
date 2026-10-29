/* PIRALI Beta 1.16 — timed kill combo, scored through finite stage slots.
   A second kill within 2 seconds earns two kill units instead of one.
   Stage 11 awards points only on wave completion. */
(function(){
'use strict';
let lastKill=null,previousStage=null,chain=0;
const STORY_WINDOW=2000,ENDLESS_WINDOW=1000;
const COMBO_LABELS=Object.freeze({ka:'კომბო',en:'COMBO',ru:'КОМБО',zh:'连击'});
function comboLabel(){
 const lang=window.PiraliLanguage?.getLanguage?.()||'ka';
 return COMBO_LABELS[lang]||COMBO_LABELS.ka;
}
function reset(){lastKill=null;previousStage=level;chain=0;}
function award(base,x,y){
 if(level===11)return {paired:false,raw:0,gained:0};
 if(previousStage!==level)reset();
 const now=performance.now();
 const paired=lastKill!==null&&now-lastKill>=0&&now-lastKill<=STORY_WINDOW;
 chain=paired?Math.min(99,chain+1):1;lastKill=now;
 if(paired)window.PiraliPolish?.onCombo(chain);
 const gained=window.PiraliStageScoring?.awardKill(paired)||0;
 if(typeof showFloatingText==='function')
  showFloatingText(x,y-24,(paired?'⚡ '+comboLabel()+' '+chain+' (×2) ':'')+'+'+gained,
    paired?'#ffd363':'#ffe29a');
 return {paired,raw:base*(paired?2:1),gained};
}
function status(){
 const remaining=lastKill===null||previousStage!==level?0:Math.max(0,STORY_WINDOW-(performance.now()-lastKill));
 return {chain:remaining>0?chain:0,remainingMs:remaining,windowMs:STORY_WINDOW,paired:chain>1&&remaining>0};
}
window.PiraliKillCombo=Object.freeze({
 reset,award,status,storyWindowMs:STORY_WINDOW,endlessWindowMs:ENDLESS_WINDOW
});
})();