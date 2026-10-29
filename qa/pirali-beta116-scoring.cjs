/* PIRALI Beta 1.16 earned-score regression tests — both variants. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const budgets=[0,250,300,350,400,450,500,600,760,960,430];
const cumulative=[0];for(let n=1;n<=10;n++)cumulative[n]=cumulative[n-1]+budgets[n];
for(const kind of ['play','dev']){
 const base=path.join(root,'beta116-'+kind);
 const files=['js/features/scoring/stage-awards.js','js/features/scoring/kill-combos.js',
  'js/features/hell/score-bonus.js','js/runtime/update.js',
  'js/features/stages/early-start-spacing.js'];
 const src={};
 for(const p of files){
  const full=path.join(base,p);src[p]=fs.readFileSync(full,'utf8');
  const syntax=spawnSync(process.execPath,['--check',full],{encoding:'utf8'});
  assert.equal(syntax.status,0,p+': '+syntax.stderr);
 }
 const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
 for(const resource of [
  'js/features/scoring/stage-awards.js?v=beta116-earned-5k',
  'js/features/scoring/kill-combos.js?v=beta116-earned-5k',
  'js/features/hell/score-bonus.js?v=beta116-earned-5k',
  'js/runtime/update.js?v=beta116-scoring',
  'js/features/stages/early-start-spacing.js?v=beta116-scoring'
 ])assert.ok(html.includes(resource),'missing cache refresh '+resource);
 assert.ok(html.includes('window.PiraliSeasonReleaseEnabled=false'),'preview must not write production scores');
 const update=src['js/runtime/update.js'];
 assert.ok(update.includes('window.PiraliStageScoring?.awardMedal()'),'medals use finite budget');
 assert.ok(update.includes('window.PiraliStageScoring?.awardParry()'),'parries use finite budget');
 assert.ok(!update.includes('score+=(level===11?0'),'no direct parry score');
 const spacing=src['js/features/stages/early-start-spacing.js'];
 assert.ok(spacing.includes('window.PiraliStageScoring?.prepareStage?.()'),'world prepares exact enemy/pickup slots');
 let clock=100000;
 const window={
  PiraliCheckpoint:{endlessBase:()=>null},
  PiraliLanguage:{getLanguage:()=> 'ka'},
  PiraliPolish:{onCombo(){}},
  PiraliDualGenerals:{second:()=>null}
 };
 const scope={window,Math,Number,performance:{now:()=>clock},
  P:{x:100,y:100},score:0,level:1,updateScoreUI(){},
  enemies:[],pickups:[],boss:null,PIRALI_BALANCE:{finalBossReinforcements:1},
  showFloatingText(){}};
 vm.createContext(scope);
 for(const p of ['js/features/scoring/kill-combos.js','js/features/hell/score-bonus.js',
  'js/features/scoring/stage-awards.js'])
  vm.runInContext(src[p],scope,{filename:p,timeout:1000});
 const setup=(n)=>{
  scope.level=n;scope.boss=[7,8,10].includes(n)?{alive:true}:null;
  window.PiraliDualGenerals.second=()=>n===8?{alive:true}:null;
  const count=n===9?15:n===10?12:18+n;
  scope.enemies=Array.from({length:count},(_,i)=>({
   alive:true,isNPC:n===10,etype:i%4===0?'rifle':'saber'
  }));
  scope.pickups=Array.from({length:3},()=>({type:'medal',col:false}));
  scope.updateScoreUI();window.PiraliStageScoring.prepareStage();
  window.PiraliKillCombo.reset();
 };
 for(let stage=1;stage<=10;stage++){
  setup(stage);
  const st=window.PiraliStageScoring.potential();
  const previous=scope.score;
  assert.equal(st.baseline,stage===1?0:cumulative[stage-1],
    'perfect previous stages carry earned points, not future budget');
  for(let i=0;i<st.killTotal;i++){
   clock+=1000;
   window.PiraliKillCombo.award(99999,100,100);
   assert.ok(scope.score<=cumulative[stage],'stage '+stage+' must not consume future budget');
  }
  for(let i=0;i<st.medalTotal;i++)window.PiraliStageScoring.awardMedal();
  for(let i=0;i<st.parryTotal;i++)window.PiraliStageScoring.awardParry();
  for(let i=0;i<200;i++)window.PiraliStageScoring.awardParry();
  for(let i=0;i<200;i++)window.PiraliStageScoring.awardMedal();
  if(stage===10){
   const beforeCoin=scope.score;
   assert.equal(beforeCoin-previous,180,'hell ordinary rewards exactly 180');
   assert.equal(window.PiraliHellScore.claimHeart(),true,'250 coins collectible once');
   assert.equal(scope.score-beforeCoin,250);
   assert.equal(window.PiraliHellScore.claimHeart(),false,'no duplicate coins');
  }
  assert.equal(scope.score,cumulative[stage],'stage '+stage+' should earn '+budgets[stage]);
  assert.equal(window.PiraliStageScoring.stageMax(stage),cumulative[stage]);
  if(stage===8)assert.equal(scope.score,3610);
  if(stage===9)assert.equal(scope.score,4570);
  if(stage===10)assert.equal(scope.score,5000);
  console.log('PASS '+kind+' stage '+stage+' score '+scope.score);
 }
 scope.level=11;window.PiraliStageScoring.beginEndless();
 const bonus=[300,300,400,400,600];
 for(let wave=1;wave<=5;wave++){
  const before=scope.score;
  assert.equal(window.PiraliStageScoring.completeWave(wave),bonus[wave-1]);
  assert.equal(scope.score-before,bonus[wave-1]);
  assert.equal(window.PiraliKillCombo.award(1000,0,0).gained,0);
 }
 assert.equal(scope.score,7000);
 assert.equal(window.PiraliStageScoring.completeWave(5),0,'no repeating bonus');
 assert.equal(scope.score,7000);
 scope.score=0;clock=1000;setup(1);
 const st=window.PiraliStageScoring.potential();
 for(let i=0;i<st.killTotal;i++){clock+=2100;window.PiraliKillCombo.award(100000,0,0);}
 assert.ok(scope.score<250,'slow incomplete performance scores below perfect budget');
 scope.score=5000;scope.level=8;scope.updateScoreUI();
 assert.ok(scope.score<=2850,'old score cannot reach stage-8 future cap');
 console.log('PASS '+kind+' 5000 earned over 10 stages, 7000 after 5 waves, no 8th-stage clipping');
}
