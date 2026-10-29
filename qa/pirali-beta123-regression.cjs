/* PIRALI Beta 1.23 regression:
 * unchanged Classic A joystick/balance, tactical soldiers, local stars, visible loot.
 * Run: node qa/pirali-beta123-regression.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const get=(dir,p)=>fs.readFileSync(path.join(ROOT,dir,p),'utf8');
const syntax=p=>{
 const status=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});
 assert.equal(status.status,0,'invalid JavaScript: '+p+' '+status.stderr);
};
function runAI(source){
 const context={window:{},Math};
 vm.createContext(context);vm.runInContext(source,context,{timeout:1000});
 const api=context.window.PiraliTacticalAI;
 assert.ok(api,'AI module exposed');
 const player={x:200,y:200};
 const rifle={x:100,y:200,etype:'rifle',state:'attack',alive:true,groupId:0,seesSimona:true};
 const officer={...rifle,etype:'officer'};
 const sword={...rifle,etype:'saber'};
 const opts=e=>({tx:200,ty:200,player,baseAng:0,flankAng:.45,aliveEnemies:[e],level:5});
 const classic=opts(rifle);
 assert.equal(api.heading(rifle,{...classic,level:11}),.45,'stage 11 untouched');
 assert.equal(api.heading({...rifle,isNPC:true},classic),.45,'landlord untouched');
 assert.equal(api.heading({...rifle,state:'search'},classic),.45,'patrol/search untouched');
 assert.equal(api.heading({...rifle,seesSimona:false},classic),.45,'last seen pursuit untouched');
 assert.notEqual(api.heading(rifle,classic),.45,'rifle near player adjusts trajectory');
 assert.notEqual(api.heading(officer,opts(officer)),.45,'officer adjusts range');
 assert.notEqual(api.heading(sword,opts(sword)),.45,'sword moves to flank');
 const safe=api.heading({...rifle,x:900,y:800},opts(rifle));
 assert.ok(Number.isFinite(safe),'long distance steering finite');
 const nearSoldier={...rifle,x:112,y:200};
 const spaced=api.heading(rifle,{...classic,aliveEnemies:[rifle,nearSoldier]});
 assert.ok(Number.isFinite(spaced),'crowd separation finite');
 assert.notEqual(spaced,api.heading(rifle,classic),'ally collision influences path');
 const sample=api.heading(rifle,{...classic,level:9});
 const repeat=api.heading(rifle,{...classic,level:9});
 assert.equal(sample,repeat,'deterministic tactical steering');
}
function runStars(source){
 const store={};
 const elements=[];
 const body={appendChild(x){elements.push(x);}};
 const doc={body,getElementById(id){return elements.find(x=>x.id===id)||null;},
  querySelector(sel){return sel==='#screen .sbox'?null:null;},
  createElement(tag){return {tag,classList:{added:[],add(s){this.added.push(s)},remove(){}},
   setAttribute(){},style:{},textContent:'',appendChild(){}};}};
 const ctx={window:{PiraliLanguage:{getLanguage:()=> 'ka'},
    PiraliStageScoring:{stageBudget:(n)=>n===9?960:n===10?430:250,
     stageEarned:()=>200,bonusEarned:()=>2000},
    PiraliStats:{debug:()=>({stageMs:58000})}},
   document:doc,localStorage:{getItem(k){return store[k]||null},setItem(k,v){store[k]=v}},
   level:9,Math,JSON,Number,clearTimeout(){},setTimeout(){return 1}};
 vm.createContext(ctx);vm.runInContext(source,ctx,{timeout:1000});
 const api=ctx.window.PiraliStageStars;
 assert.equal(api.calculate(0,250),1);
 assert.equal(api.calculate(137,250),1);
 assert.equal(api.calculate(138,250),2);
 assert.equal(api.calculate(212,250),2);
 assert.equal(api.calculate(213,250),3);
 assert.equal(api.calculate(100000,250),3,'never more than three stars');
 assert.equal(api.onStageComplete(9).stars,1,'stage 9 earned share not cumulative score');
 assert.equal(api.latest().budget,960);
 assert.equal(api.latest().earned,200);
 assert.equal(api.latest().timeMs,58000);
 assert.equal(elements.length,1,'single nonblocking result overlay');
 assert.ok(elements[0].textContent.includes('★☆☆'),'1 star rating visible');
 assert.equal(api.onStageComplete(12),null,'invalid stage ignored');
 ctx.window.PiraliStageScoring.stageEarned=()=>240;
 assert.equal(api.onStageComplete(1).stars,3,'good combo score earns three stars');
 ctx.window.PiraliStageScoring.stageEarned=()=>0;
 assert.equal(api.onStageComplete(1).stars,1);
 assert.equal(api.best(1),3,'best local stars are retained');
 assert.equal(api.onVictory(),null,'only level 11 final victory can award waves');
 ctx.level=11;
 const end=api.onVictory();
 assert.equal(end.stars,3);
 assert.equal(end.earned,2000);
 assert.equal(api.best(11),3);
}
function runGlow(source){
 const log={save:0,restore:0,stroke:0,fill:0};
 const ctx={save(){log.save++},restore(){log.restore++},
 beginPath(){},arc(){},stroke(){log.stroke++},fill(){log.fill++}};
 const scope={window:{},Math};
 vm.createContext(scope);vm.runInContext(source,scope,{timeout:1000});
 const api=scope.window.PiraliPickupVisibility;
 for(const type of ['ammo','health','herb','medal','alpha-shells','large-heart','hell-coins']){
   api.draw(ctx,{type,bob:0,col:false},100,200,12);
 }
 api.draw(ctx,{type:'ammo',col:true},100,200,12);
 assert.equal(log.save,7);
 assert.equal(log.restore,7,'context cannot leak glow/alpha to other sprites');
 assert.equal(log.stroke,7);
 assert.equal(log.fill,7);
}
for(const mode of ['play','dev']){
 const old='beta122-'+mode,newDir='beta123-'+mode;
 const fresh=[
  'js/runtime/update.js','js/runtime/render.js','js/runtime/outcome.js',
  'js/features/enemies/tactical-ai.js','js/features/results/stage-stars.js',
  'js/features/loot/pickup-visibility.js'
 ];
 for(const p of fresh)syntax(path.join(ROOT,newDir,p));
 for(const p of [
  'js/runtime/combat.js','js/config/stage-balance.js',
  'js/features/stages/beta105-balance.js','js/features/scoring/stage-awards.js',
  'js/features/loot/stage5-scattered-ammo.js','js/progression/player-stats.js',
  'js/runtime/world.js','js/features/stages/early-start-spacing.js'
 ])assert.equal(get(old,p),get(newDir,p),'must preserve existing balance and controls: '+p);
 const html=get(newDir,'index.html');
 assert.match(html,/BETA 1\.23 • CLASSIC/);
 assert.ok(html.includes("PiraliGameVersion='1.23.0-classic."+mode+"'"));
 assert.match(html,/js\/features\/enemies\/tactical-ai\.js\?v=beta123-ai/);
 assert.match(html,/js\/features\/results\/stage-stars\.js\?v=beta123-stars/);
 assert.match(html,/js\/features\/loot\/pickup-visibility\.js\?v=beta123-pickup-halo/);
 assert.match(html,/css\/beta123-stars\.css/);
 assert.match(html,/runtime\/update\.js\?v=beta123-ai-stars/);
 assert.match(html,/runtime\/render\.js\?v=beta123-pickup-glow/);
 assert.match(html,/runtime\/outcome\.js\?v=beta123-final-stars/);
 assert.match(html,/window\.PiraliSeasonReleaseEnabled=false/,'preview never writes official scores');
 assert.match(get(newDir,'js/progression/checkpoints.js'),/pirali_checkpoint_beta_1_23_classic_/);
 assert.match(get(newDir,'js/runtime/update.js'),/PiraliTacticalAI\?\.heading/);
 assert.match(get(newDir,'js/runtime/update.js'),/PiraliStageStars\?\.onStageComplete/);
 assert.match(get(newDir,'js/runtime/render.js'),/PiraliPickupVisibility\?\.draw/);
 assert.match(get(newDir,'js/runtime/outcome.js'),/PiraliStageStars\?\.onVictory/);
 if(mode==='play')assert.ok(!html.includes('js/preview-controls.js'),'Player must have no test panel');
 else {
  assert.match(html,/js\/preview-controls\.js\?v=beta122-minimal-test/);
  const code=get(newDir,'js/preview-controls.js');
  assert.match(code,/dataset\.immortality='toggle'/);
  assert.ok(!/laurelButton|hitButton|visitFinal|finalBoss/.test(code),'minimal dev controls preserved');
 }
 runAI(get(newDir,'js/features/enemies/tactical-ai.js'));
 runStars(get(newDir,'js/features/results/stage-stars.js'));
 runGlow(get(newDir,'js/features/loot/pickup-visibility.js'));
 console.log('PASS '+mode+' tactical AI, earned stage stars, visual pickups, exact Classic A + balancing unchanged');
}
console.log('PASS PIRALI Beta 1.23 Player + Developer regression');
