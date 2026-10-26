/* PIRALI Alpha 0.16.3k DEV — timed enemy kill combos.
   Story 1–10: next kill within 2s = double kill award, hard 100k cap.
   Endless 11: next kill within 1s = 600, otherwise 300.
   Clock uses monotonic performance.now() and resets between stages, runs,
   and on player taking damage. Preserves the previous per-level ×.72
   award reduction and the level-ten Hell ledger. */
(function(){
'use strict';
let lastKill=null;
let previousStage=null;
const STORY_WINDOW=2000,ENDLESS_WINDOW=1000;
function reset(){lastKill=null;previousStage=level;}
function award(base,x,y){
 if(previousStage!==level)reset();
 const now=performance.now();
 const windowMs=level===11?ENDLESS_WINDOW:STORY_WINDOW;
 const paired=lastKill!==null&&now-lastKill>=0&&now-lastKill<=windowMs;
 lastKill=now;
 const raw=(level===11?300:base)*(paired?2:1);
 const before=score;
 score+=raw;
 updateScoreUI(); // all story awards are clamped and scaled here
 const gained=score-before;
 if(typeof showFloatingText==='function')
  showFloatingText(x,y-24,(paired?'⚡ COMBO ×2 ':'')+'+'+gained,
    paired?'#ffd363':'#ffe29a');
 return {paired,raw,gained};
}
window.PiraliKillCombo=Object.freeze({
 reset,award,storyWindowMs:STORY_WINDOW,endlessWindowMs:ENDLESS_WINDOW
});
})();