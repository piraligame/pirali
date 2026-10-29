/* PIRALI Beta 1.23 — fair, local stage stars based on earned score.
   No Firebase changes. Stages 1-10 evaluate earned stage points;
   final bonus uses completed waves and only shows on victory. */
(function(){
'use strict';
const KEY='pirali_beta123_stage_stars_preview';
const words={
 ka:{stage:'ტური',earned:'ქულა',time:'დრო',stars:'ვარსკვლავი'},
 en:{stage:'Stage',earned:'Points',time:'Time',stars:'Stars'},
 ru:{stage:'Тур',earned:'Очки',time:'Время',stars:'Звёзды'},
 zh:{stage:'关卡',earned:'积分',time:'时间',stars:'星级'}
};
let last=null,closeTimer=null;
function calculate(earned,budget){
 if(!Number.isFinite(budget)||budget<=0)return 1;
 const ratio=Math.max(0,Math.min(1,earned/budget));
 return ratio>=.85?3:ratio>=.55?2:1;
}
function fmt(ms){
 const total=Math.max(0,Math.floor((Number(ms)||0)/1000));
 return Math.floor(total/60)+':'+String(total%60).padStart(2,'0');
}
function save(stage,stars){
 try{
   const records=JSON.parse(localStorage.getItem(KEY)||'{}');
   const safe=records&&typeof records==='object'&&!Array.isArray(records)?records:{};
   const prev=Number(safe[stage])||0;
   safe[stage]=Math.max(prev,stars);
   localStorage.setItem(KEY,JSON.stringify(safe));
 }catch(e){} // Privacy/storage disabled: still show the rating in this run
}
function paint(result){
 last=result;
 const lang=window.PiraliLanguage?.getLanguage?.()||'ka',t=words[lang]||words.ka;
 let box=document.getElementById('pirali-stage-stars');
 if(!box){
  box=document.createElement('div');
  box.id='pirali-stage-stars';
  box.setAttribute('role','status');
  box.setAttribute('aria-live','polite');
  document.body.appendChild(box);
 }
 // textContent only; no HTML injection from player names.
 box.textContent=t.stage+' '+result.stage+'   '+('★'.repeat(result.stars)+'☆'.repeat(3-result.stars))+
   '   '+t.earned+' '+result.earned+'/'+result.budget+
   (result.timeMs===null?'':'   '+t.time+' '+fmt(result.timeMs));
 box.classList.add('show');
 if(closeTimer!==null)clearTimeout(closeTimer);
 closeTimer=setTimeout(()=>{box.classList.remove('show');closeTimer=null;},2350);
}
function onStageComplete(stage){
 if(!Number.isInteger(stage)||stage<1||stage>10)return null;
 const budget=window.PiraliStageScoring?.stageBudget?.(stage)||0;
 // stageEarned is based on actual combos, pickups and parry, not total
 // cumulative score from previous stages.
 const raw=window.PiraliStageScoring?.stageEarned?.();
 const earned=Math.max(0,Math.min(budget,Number.isFinite(raw)?Math.floor(raw):0));
 const time=window.PiraliStats?.debug?.()?.stageMs;
 const result={stage,earned,budget,stars:calculate(earned,budget),
   timeMs:Number.isFinite(time)?Math.max(0,time):null};
 save(stage,result.stars);paint(result);return result;
}
function onVictory(){
 if(level!==11)return null;
 const budget=2000,paid=window.PiraliStageScoring?.bonusEarned?.()||0;
 const earned=Math.max(0,Math.min(budget,paid));
 const result={stage:11,earned,budget,stars:calculate(earned,budget),timeMs:null};
 save(11,result.stars);paint(result);return result;
}
window.PiraliStageStars=Object.freeze({calculate,onStageComplete,onVictory,
 best:(stage)=>{try{const o=JSON.parse(localStorage.getItem(KEY)||'{}');return Number(o[stage])||0;}catch(e){return 0;}},
 latest:()=>last});
})();
