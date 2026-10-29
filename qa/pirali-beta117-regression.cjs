/* PIRALI Beta 1.17: stage 9 score ceiling, stage 8/10 safe starts, HUD.
   node qa/pirali-beta117-regression.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const budgets=[0,250,300,350,400,450,500,600,760,960,430];
const max=[0];for(let i=1;i<=10;i++)max[i]=max[i-1]+budgets[i];
for(const version of ['play','dev']){
 const root=path.join(ROOT,'beta117-'+version);
 const get=p=>fs.readFileSync(path.join(root,p),'utf8');
 const scorer=get('js/features/scoring/stage-awards.js');
 const spawn=get('js/features/stages/early-start-spacing.js');
 const html=get('index.html'),hud=get('css/beta117-hud.css'),checkpoint=get('js/progression/checkpoints.js');
 for(const js of ['js/features/scoring/stage-awards.js','js/features/stages/early-start-spacing.js','js/runtime/update.js']){
  const result=spawnSync(process.execPath,['--check',path.join(root,js)],{encoding:'utf8'});
  assert.equal(result.status,0,'syntax error: '+js+' '+result.stderr);
 }
 assert.match(html,/BETA 1\.17/,'new version visible in HTML');
 assert.match(html,/js\/features\/scoring\/stage-awards\.js\?v=beta117-cap/,'fresh score cache key');
 assert.match(html,/js\/features\/stages\/early-start-spacing\.js\?v=beta117-safe-start/,'fresh enemy cache key');
 assert.match(html,/css\/beta117-hud\.css\?v=1\.17\.0/,'new HUD CSS loaded');
 assert.match(html,/BETA 1\.17 TEST/,'version proof displayed in game');
 assert.match(html,/window\.PiraliSeasonReleaseEnabled=false/,'preview must never publish live Firebase scores');
 assert.match(checkpoint,/pirali_checkpoint_beta_1_17_/,'old 5000-point saves isolated');
 assert.match(hud,/#level-badge\.pirali-home-stage\{/,'only stage 11 label moved');
 assert.match(hud,/top:44px!important/,'title above timer at pause center');
 assert.match(hud,/left:50%!important/,'pause horizontal alignment');
 assert.ok(!hud.includes('#pirali-time-hud{'),'timer itself is untouched');
 // Real score code executed without mocks for the scoring algorithm.
 const context={
  level:1,score:0,updateScoreUI(){},
  Math,Number,enemies:[],pickups:[],boss:null,
  PIRALI_BALANCE:{finalBossReinforcements:1},
  window:{PiraliCheckpoint:{endlessBase:()=>null},
    PiraliDualGenerals:{second:()=>null}},P:{x:200,y:200},showFloatingText(){}
 };
 vm.createContext(context);
 vm.runInContext(scorer,context,{filename:'stage-awards.js',timeout:1000});
 const api=context.window.PiraliStageScoring;
 assert.equal(api.hardCap(8),3610);
 assert.equal(api.hardCap(9),4570);
 assert.equal(api.hardCap(10),5000);
 for(let level=1;level<=10;level++){
  context.level=level;
  context.enemies=Array.from({length:15},(_,i)=>({alive:true,etype:i%4?'saber':'rifle'}));
  context.pickups=Array.from({length:3},()=>({type:'medal',col:false}));
  context.boss=[7,8,10].includes(level)?{alive:true,x:1000,y:420}:null;
  context.window.PiraliDualGenerals.second=()=>level===8?{alive:true,x:1050,y:430}:null;
  context.updateScoreUI();api.prepareStage();
  const potential=api.potential();
  for(let i=0;i<potential.killTotal;i++)api.awardKill(i>0);
  for(let i=0;i<potential.medalTotal;i++)api.awardMedal();
  for(let i=0;i<potential.parryTotal;i++)api.awardParry();
  if(level===10){assert.equal(api.claimDevilCoins(),true);assert.equal(api.claimDevilCoins(),false);}
  assert.equal(context.score,max[level], 'level '+level+' earned total');
  // Deliberate injection must not escape the current stage ceiling.
  context.score=5000;
  context.updateScoreUI();
  assert.equal(context.score,max[level], 'level '+level+' rejects premature 5000');
  context.score=999999;
  context.updateScoreUI();
  assert.equal(context.score,max[level], 'level '+level+' rejects corrupted score');
  assert.equal(api.awardMedal(),0,'no duplicate medal points');
 }
 context.level=11;api.beginEndless();
 for(let w=1;w<=5;w++)assert.equal(api.completeWave(w),[0,300,300,400,400,600][w]);
 assert.equal(context.score,7000);
 // Enemy opening code must only move nearby soldiers, never reduce enemy stats.
 for(let level=1;level<=11;level++){
  const scene={
   level,WW:2000,WH:3800,CHURCH_Y:120,
   P:{x:1000,y:3620},path:Array.from({length:19},(_,i)=>({x:1000,y:3700-i*195})),
   trees:[],enemies:[],Math,window:{PiraliStageScoring:{prepareStage(){}}},
   boss:{x:1000,y:440,hp:44,maxHp:44}
  };
  scene.genWorld=function(){
    scene.enemies=Array.from({length:18},(_,i)=>({
      x:1000+(i%3-1)*50,y:3560-i*80,r:12,alive:true,isNPC:false,
      hp:2,maxHp:2,etype:'rifle',damage:3,
      patrol:{cx:1000+(i%3-1)*50,cy:3560-i*80},state:'patrol',alertTimer:0
    }));
  };
  vm.createContext(scene);vm.runInContext(spawn,scene,{timeout:1000});
  scene.genWorld();
  const target=[1,2,3,4,5].includes(level)?750:[8,10].includes(level)?700:0;
  assert.equal(scene.enemies.length,18,'enemy count preserved at level '+level);
  for(let i=0;i<scene.enemies.length;i++){
   const e=scene.enemies[i];
   assert.equal(e.hp,2);assert.equal(e.damage,3);
   if(target)assert.ok(Math.hypot(e.x-scene.P.x,e.y-scene.P.y)>=target,
    'enemy close to player on stage '+level);
   else assert.equal(e.y,3560-i*80,'unchanged stage '+level);
   assert.equal(e.patrol.cx,e.x);
   assert.equal(e.patrol.cy,e.y);
  }
  assert.equal(scene.boss.y,440,'boss stays near the exit');
  if(target)assert.equal(scene.window.PiraliEarlyStageSpacing.clearance,target);
  else assert.equal(scene.window.PiraliEarlyStageSpacing,undefined);
 }
 console.log('PASS '+version+': 9th stage <=4570, 10th <=5000, 11th <=7000; stage 8/10 enemies moved; stage 11 HUD clear');
}
