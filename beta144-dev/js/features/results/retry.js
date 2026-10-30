/* PIRALI DEV 0.16.1 — replay from stage one, independent of rank display. */
(function(){
'use strict';
const labels={ka:'↻ კიდევ სცადეთ',en:'↻ TRY AGAIN',ru:'↻ ПОПРОБОВАТЬ ЕЩЁ',zh:'↻ 再试一次'};
const label=()=>labels[window.PiraliLanguage?.getLanguage?.()||'ka']||labels.ka;
function startAgain(){
  window.PiraliOutcomeRank?.cancel();
  // A fresh run always starts at stage 1. Do not remove local achievement history.
  window.PiraliCheckpoint?.clear();
  const leaderboard=document.getElementById('lb-overlay');
  if(leaderboard)leaderboard.style.display='none';
  startGame(null);
}
function install(){
  const screen=document.getElementById('screen');
  if(!screen||(screen.className!=='gameover-screen'&&screen.className!=='victory-screen'))return;
  const existing=screen.querySelector('.pirali-result-retry');
  if(existing)return;
  const b=document.createElement('button');
  b.type='button';b.className='pirali-result-retry';
  b.textContent=label();
  b.addEventListener('click',startAgain);
  const records=screen.querySelector('button.sbtn');
  if(records)records.before(b);else screen.appendChild(b);
}
const originalGameOver=showGameOver,originalVictory=showVictory;
showGameOver=function(...args){const result=originalGameOver.apply(this,args);install();return result;};
showVictory=function(...args){const result=originalVictory.apply(this,args);install();return result;};
document.addEventListener('pirali:languagechange',()=>{
  const b=document.querySelector('#screen .pirali-result-retry');if(b)b.textContent=label();
});
})();
