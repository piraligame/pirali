/* PIRALI Beta 1.16 — attainable per-event budgets rather than early 5000 clipping.
   1–9: enemy combo slots, finite map medals and two finite parry rewards.
   10: at most 180 ordinary points + 250 collected Devil coins; gate pays 0.
   11: only five waves (+2000). All values are integral; earlier stages cannot
   consume later stages' budgets, including under perfect 2-second combos. */
(function(){
'use strict';
const STORY_CAP=5000,BONUS_CAP=2000,BONUS_KILL=0;
const BUDGET=[0,250,300,350,400,450,500,600,760,960,430];
const PREFIX=[0];for(let i=1;i<=10;i++)PREFIX[i]=PREFIX[i-1]+BUDGET[i];
 // A true stage-specific ceiling, not a global 5000 that can fill in stage 9.
 const hardCap=n=>n>=1&&n<=10?PREFIX[n]:STORY_CAP+BONUS_CAP;
const WAVE_POINTS=[0,300,300,400,400,600];
const WAVE_CUMULATIVE=[0,300,600,1000,1400,2000];
const base=updateScoreUI;
let current=null,baseline=0,prepared=false,earned=0,coins=0;
let killTotal=0,killCount=0,killUnits=0,medalTotal=0,medalsPaid=0,parryTotal=0,parriesPaid=0;
let killPool=0,medalPool=0,parryPool=0;
let endlessBase=0,wavesPaid=0,bonusRemainder=0;
const safe=(x,limit)=>Math.max(0,Math.min(limit,Number.isFinite(x)?Math.floor(x):0));
function enterStage(force=false){
 if(current===level&&!force)return;
 current=level;prepared=false;earned=0;coins=0;bonusRemainder=0;
 killTotal=killCount=killUnits=medalTotal=medalsPaid=parryTotal=parriesPaid=0;
 killPool=medalPool=parryPool=0;
 if(level>=1&&level<=10){
   // Old checkpoints from the previous scoring formula never carry an
   // impossible score into the new stage. New runs keep earned points.
   baseline=safe(score,PREFIX[level-1]);score=baseline;
 }else if(level===11){
   wavesPaid=0;
   const saved=window.PiraliCheckpoint?.endlessBase?.();
   endlessBase=Number.isFinite(saved)?safe(saved,STORY_CAP):safe(score,STORY_CAP);
   score=endlessBase;
 }
}
function prepareStage(){
 if(level<1||level>10)return;
 // Called at the END of all world-generation wrappers, after siege/general
 // spawns and difficulty filters. A developer stage reset also starts fresh.
 enterStage(true);
 killTotal=enemies.filter(e=>e.alive&&!e.isNPC).length+
   enemies.filter(e=>e.alive&&e.isNPC).length+
   Number(!!boss?.alive)+
   Number(!!window.PiraliDualGenerals?.second?.()?.alive&&level===8)+
   Number(level===7); // Batoni is spawned after the general falls
 // One reinforcement can arrive when the primary general becomes enraged.
 if(boss?.alive&&(level===7||level===8||level===10))
   killTotal+=Math.max(0,Math.floor(PIRALI_BALANCE.finalBossReinforcements||0));
 medalTotal=pickups.filter(p=>p.type==='medal'&&!p.col).length;
 const ranged=enemies.some(e=>e.alive&&(e.etype==='rifle'||e.etype==='officer'))||!!boss?.alive;
 parryTotal=ranged?2:0;
 const budget=level===10?180:BUDGET[level];
 medalPool=medalTotal?Math.floor(budget*.10):0;
 parryPool=parryTotal?Math.floor(budget*.05):0;
 killPool=budget-medalPool-parryPool;
 if(!killTotal){medalPool+=killPool;killPool=0;}
 prepared=true;
}
function stageMax(n=level){return n>=1&&n<=10?PREFIX[n]:n===11?STORY_CAP+BONUS_CAP:0;}
function update(){
 if(current!==level)enterStage();
 if(level>=1&&level<=10){
   // Clamp every score refresh even if old checkpoints, an extra reward or
   // a delayed call tries to carry stage-10 points into stage 9.
   score=safe(score,Math.min(hardCap(level),baseline+earned+coins));
 }
 if(level===11)score=Math.max(endlessBase,Math.min(endlessBase+WAVE_CUMULATIVE[wavesPaid],score));
 return base();
}
updateScoreUI=update;
function grant(amount){
 if(!prepared&&level<=10)return 0;
 const original=Math.max(0,Math.floor(amount));
 const premium=window.PiraliFullPath?.isActive?.()===true;
 // Full Route awards 20% of normal XP/points: 80% less than standard.
 // Carry the remainder to avoid losing tiny awards to integer rounding.
 const total=original+(premium?bonusRemainder:0);
 const requested=premium?Math.floor(total/5):original;
 bonusRemainder=premium?total%5:0;
 const permitted=Math.min(requested,Math.max(0,hardCap(level)-baseline-earned-coins));
 earned+=permitted;
 score=Math.min(hardCap(level),baseline+earned+coins);
 updateScoreUI();
 return permitted;
}
function awardKill(paired){
 if(level<1||level>10||!prepared||killCount>=killTotal)return 0;
 // First kill of every stage is necessarily single, then a perfect chain
 // can add two units for each remaining kill. Maximum = 2*N-1.
 const maxUnits=Math.max(1,2*killTotal-1);
 const before=killUnits;
 const units=killCount>0&&paired?2:1;
 killCount++;killUnits=Math.min(maxUnits,killUnits+units);
 return grant(Math.floor(killPool*killUnits/maxUnits)-Math.floor(killPool*before/maxUnits));
}
function awardMedal(){
 if(level<1||level>10||!prepared||medalsPaid>=medalTotal)return 0;
 const old=medalsPaid++;
 return grant(Math.floor(medalPool*medalsPaid/medalTotal)-Math.floor(medalPool*old/medalTotal));
}
function awardParry(){
 if(level<1||level>10||!prepared||parriesPaid>=parryTotal)return 0;
 const old=parriesPaid++;
 return grant(Math.floor(parryPool*parriesPaid/parryTotal)-Math.floor(parryPool*old/parryTotal));
}
function claimDevilCoins(){
 if(level!==10||!prepared||coins)return false;
 coins=window.PiraliFullPath?.isActive?.()?50:250;score=Math.min(hardCap(level),baseline+earned+coins);
 updateScoreUI();return true;
}
function beginEndless(){
 endlessBase=safe(score,STORY_CAP);score=endlessBase;current=11;wavesPaid=0;base();
}
function completeWave(n){
 if(level!==11||!Number.isInteger(n)||n!==wavesPaid+1||n<1||n>5)return 0;
 wavesPaid=n;
 const before=score;
 score=endlessBase+(window.PiraliFullPath?.isActive?.()?Math.floor(WAVE_CUMULATIVE[wavesPaid]/5):WAVE_CUMULATIVE[wavesPaid]);updateScoreUI();
 if(typeof showFloatingText==='function')
   showFloatingText(P.x,P.y-47,'🏆 +'+WAVE_POINTS[n],'#f5da71');
 return score-before;
}
window.PiraliStageScoring=Object.freeze({
 enterStage,prepareStage,awardKill,awardMedal,awardParry,claimDevilCoins,
 stageMax,hardCap,stageBudget:(n)=>BUDGET[n]||0,
 stageEarned:()=>earned+coins,
 potential:()=>({stage:level,baseline,killTotal,killCount,killUnits,medalTotal,
  medalsPaid,parryTotal,parriesPaid,killPool,medalPool,parryPool,earned,coins,
  maxStage:level===10?430:BUDGET[level]||0}),
 beginEndless,completeWave,wavesPaid:()=>wavesPaid,wavePoints:n=>WAVE_POINTS[n]||0,
 ratio:1,storyCap:STORY_CAP,bonusCap:BONUS_CAP,bonusKillPoints:BONUS_KILL,
 endlessBaseline:()=>endlessBase,bonusEarned:()=>level===11?Math.max(0,score-endlessBase):0,
 hellLimit:180,devilHeartPoints:250,endlessKillPoints:BONUS_KILL
});
})();