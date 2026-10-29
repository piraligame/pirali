/* PIRALI Beta 1.24 - Local records and explicit 1/2/3 star criteria. */
(function(){
'use strict';
const KEY='pirali_beta123_stage_stars_preview',BEST='pirali_beta124_stage_best_points';
const words={
 ka:{stage:'ტური',earned:'ქულა',time:'დრო',best:'საუკეთესო',newBest:'ახალი რეკორდი!',criteria:'★ 0–54% · ★★ 55–84% · ★★★ 85–100%'},
 en:{stage:'Stage',earned:'Points',time:'Time',best:'Best',newBest:'New record!',criteria:'★ 0–54% · ★★ 55–84% · ★★★ 85–100%'},
 ru:{stage:'Тур',earned:'Очки',time:'Время',best:'Рекорд',newBest:'Новый рекорд!',criteria:'★ 0–54% · ★★ 55–84% · ★★★ 85–100%'},
 zh:{stage:'关卡',earned:'积分',time:'时间',best:'最佳',newBest:'新纪录！',criteria:'★ 0–54% · ★★ 55–84% · ★★★ 85–100%'}
};
let last=null,timer=null;
function calculate(earned,budget){if(!Number.isFinite(budget)||budget<=0)return 1;const r=Math.max(0,Math.min(1,earned/budget));return r>=.85?3:r>=.55?2:1;}
function read(key){try{const o=JSON.parse(localStorage.getItem(key)||'{}');return o&&typeof o==='object'&&!Array.isArray(o)?o:{};}catch{return {};}}
function save(stage,stars,earned){
 const sr=read(KEY),br=read(BEST),old=Number(br[stage])||0;
 sr[stage]=Math.max(Number(sr[stage])||0,stars);br[stage]=Math.max(old,earned);
 try{localStorage.setItem(KEY,JSON.stringify(sr));localStorage.setItem(BEST,JSON.stringify(br));}catch{}
 return {best:br[stage],newBest:earned>old};
}
function fmt(ms){const s=Math.max(0,Math.floor(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function el(className,text){const e=document.createElement('div');e.className=className;e.textContent=text;return e;}
function paint(result){
 last=result;const lang=window.PiraliLanguage?.getLanguage?.()||'ka',w=words[lang]||words.ka;
 let box=document.getElementById('pirali-stage-stars');
 if(!box){box=document.createElement('div');box.id='pirali-stage-stars';box.setAttribute('role','status');document.body.appendChild(box);}
 box.replaceChildren(
 el('pirali-result-heading',w.stage+' '+result.stage+'  '+'★'.repeat(result.stars)+'☆'.repeat(3-result.stars)),
 el('pirali-result-score',w.earned+' '+result.earned+'/'+result.budget+' · '+w.best+' '+result.best+(result.timeMs===null?'':' · '+w.time+' '+fmt(result.timeMs))),
 el('pirali-result-criteria',w.criteria),
 ...(result.newBest?[el('pirali-result-record',w.newBest)]:[]));
 box.classList.add('show');if(timer!==null)clearTimeout(timer);
 timer=setTimeout(()=>{box.classList.remove('show');timer=null;},3400);
}
function make(stage,budget,raw,timeMs){
 const earned=Math.max(0,Math.min(budget,Number.isFinite(raw)?Math.floor(raw):0));
 const stars=calculate(earned,budget),record=save(stage,stars,earned);
 const result={stage,budget,earned,stars,timeMs,...record};paint(result);return result;
}
function onStageComplete(stage){
 if(!Number.isInteger(stage)||stage<1||stage>10)return null;
 const budget=window.PiraliStageScoring?.stageBudget?.(stage)||0;
 const earned=window.PiraliStageScoring?.stageEarned?.();
 const ms=window.PiraliStats?.debug?.()?.stageMs;
 return make(stage,budget,earned,Number.isFinite(ms)?Math.max(0,ms):null);
}
function onVictory(){
 if(level!==11)return null;
 const result=make(11,2000,window.PiraliStageScoring?.bonusEarned?.()||0,null);
 const box=document.querySelector('#screen .sbox');
 if(box){
  const w=words[window.PiraliLanguage?.getLanguage?.()||'ka']||words.ka;
  let badge=box.querySelector('.pirali-final-stars');
  if(!badge){badge=document.createElement('div');badge.className='pirali-final-stars';box.appendChild(badge);}
  badge.replaceChildren(el('pirali-result-heading','★'.repeat(result.stars)+'☆'.repeat(3-result.stars)),
    el('pirali-result-score',w.earned+' '+result.earned+'/'+result.budget+' · '+w.best+' '+result.best),
    el('pirali-result-criteria',w.criteria));
 }
 return result;
}
window.PiraliStageStars=Object.freeze({calculate,onStageComplete,onVictory,best:(stage)=>Number(read(KEY)[stage])||0,bestPoints:(stage)=>Number(read(BEST)[stage])||0,latest:()=>last});
})();