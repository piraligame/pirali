/* PIRALI Alpha 0.16.3 DEV — bonus stage death result notice.
   The original score, retry and leaderboard controls stay unchanged. */
(function(){
'use strict';
const words={
 ka:'🏠 გზა სახლისაკენ შეწყდა — სიმონა — გზა სახლისაკენ',
 en:'🏠 Homeward journey ended — Simona — Road Home',
 ru:'♾ Бонусное выживание завершено — Симона — дорога домой',
 zh:'♾ 无尽生存结束 — 西蒙娜：归家之路'
};
const original=showGameOver;
showGameOver=function(...args){
 const endless=level===11;
 const result=original.apply(this,args);
 if(endless){
  const screen=document.getElementById('screen');
  const sub=screen?.querySelector('.tsub');
  if(sub)sub.textContent=words[window.PiraliLanguage?.getLanguage?.()||'ka']||words.ka;
  window.PiraliStats?.renderResult();
 }
 window.PiraliEndlessHUD?.refresh();
 return result;
};
})();
