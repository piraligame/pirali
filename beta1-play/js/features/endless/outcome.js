/* PIRALI Alpha 0.16.3 DEV — bonus stage death result notice.
   The original score, retry and leaderboard controls stay unchanged. */
(function(){
'use strict';
const words={
 ka:'♾ ბონუს ტური დასრულდა — სიმონა უსასრულოდ',
 en:'♾ Bonus survival ended — Simona Forever',
 ru:'♾ Бонусное выживание завершено — Симона бесконечно',
 zh:'♾ 无尽生存结束 — 西蒙娜无尽之战'
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
