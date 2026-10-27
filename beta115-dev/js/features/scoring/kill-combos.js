/* PIRALI Alpha 0.16.3k DEV — timed enemy kill combos.
   Story 1–10: next kill within 2s = double kill award, hard 5000 cap.
   Endless 11: next kill within 1s = 10, otherwise 5; max +500.
   Clock uses monotonic performance.now() and resets between stages, runs,
   and on player taking damage. Preserves the previous per-level ×.72
   award reduction and the level-ten Hell ledger. */
(function(){
'use strict';
let lastKill=null;
let previousStage=null;
let chain=0;
const STORY_WINDOW=2000,ENDLESS_WINDOW=1000;
const COMBO_LABELS=Object.freeze({
 ka:'კომბო',en:'COMBO',ru:'КОМБО',zh:'连击'
});
function comboLabel(){
 const lang=window.PiraliLanguage?.getLanguage?.()||'ka';
 return COMBO_LABELS[lang]||COMBO_LABELS.ka;
}
function reset(){lastKill=null;previousStage=level;chain=0;}
function award(base,x,y){
 // The 11th stage awards only for clearing a full 20-enemy wave.
 if(level===11)return {paired:false,raw:0,gained:0};
 if(previousStage!==level)reset();
 const now=performance.now();
 const windowMs=level===11?ENDLESS_WINDOW:STORY_WINDOW;
 const paired=lastKill!==null&&now-lastKill>=0&&now-lastKill<=windowMs;
 chain=paired?Math.min(99,chain+1):1;
 lastKill=now;
 if(paired)window.PiraliPolish?.onCombo(chain);
 const raw=(level===11?5:base)*(paired?2:1);
 const before=score;
 score+=raw;
 updateScoreUI(); // all story awards are clamped and scaled here
 const gained=score-before;
 if(typeof showFloatingText==='function')
  showFloatingText(x,y-24,(paired?'⚡ '+comboLabel()+' '+chain+' (×2) ':'')+'+'+gained,
    paired?'#ffd363':'#ffe29a');
 return {paired,raw,gained};
}
window.PiraliKillCombo=Object.freeze({
 reset,award,storyWindowMs:STORY_WINDOW,endlessWindowMs:ENDLESS_WINDOW
});
})();