'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const files=dir=>fs.readdirSync(path.join(root,dir),{withFileTypes:true})
 .flatMap(x=>x.isDirectory()?files(dir+'/'+x.name):[dir+'/'+x.name]);
for(const variant of ['play','dev']){
 const old='beta130-'+variant,now='beta131-'+variant;
 const before=files(old).map(p=>p.slice(old.length+1)).sort();
 const after=files(now).map(p=>p.slice(now.length+1)).sort();
 assert.deepEqual(after,before,'Beta 1.31 must preserve all Beta 1.30 assets '+variant);
 const allowed=new Set(['index.html','js/menu.js','js/config/alpha-gear-v2.js',
 'js/features/scoring/stage-awards.js','js/features/full-path/demo.js','TEST_INFO.json']);
 for(const f of before){
  if(!allowed.has(f))assert.equal(read(old+'/'+f),read(now+'/'+f),'Unexpected edit '+f);
  if(f.endsWith('.js'))new vm.Script(read(now+'/'+f),{filename:now+'/'+f});
 }
 const html=read(now+'/index.html'),gear=read(now+'/js/config/alpha-gear-v2.js'),
   scores=read(now+'/js/features/scoring/stage-awards.js'),full=read(now+'/js/features/full-path/demo.js'),
   menu=read(now+'/js/menu.js'),info=JSON.parse(read(now+'/TEST_INFO.json'));
 assert.ok(html.includes("1.31-classic."+variant));
 assert.match(html,/BETA 1\.31/);
 assert.match(menu,/PIRALI • BETA 1\.31/);
 assert.match(html,/js\/config\/alpha-gear-v2.js\?v=beta131-all-stages/);
 assert.match(html,/js\/features\/scoring\/stage-awards.js\?v=beta131-xp20/);
 assert.equal(info.premiumFullRoute.pointsMultiplier,.2);
 assert.equal(info.premiumFullRoute.startingHearts,7);
 assert.equal(info.premiumFullRoute.paymentEnabled,false);
 assert.equal(info.premiumFullRoute.shellDropsAllStagesIfOwned,true);
 assert.equal(info.premiumFullRoute.shellPlacementAllStagesIfOwned,true);
 assert.equal(info.androidBuilt,false);assert.equal(info.aabBuilt,false);
 assert.match(full,/ქულები 80%-ით ნაკლებია \(×0\.2\)/);
 assert.match(full,/https:\/\/www\.facebook\.com\/share\/1LfEa8WSfU\//);
 assert.match(menu,/გეიმერების საზოგადოება/);
 assert.match(scores,/Math\.floor\(total\/5\)/);
 assert.match(scores,/Math\.floor\(WAVE_CUMULATIVE\[wavesPaid\]\/5\)/);
 assert.match(scores,/\?50:250/);
 assert.equal(read(old+'/js/runtime/game-init.js'),read(now+'/js/runtime/game-init.js'));
 assert.equal(read(old+'/js/features/loot/drop-balance.js'),read(now+'/js/features/loot/drop-balance.js'));
 assert.equal(read(old+'/js/features/loot/map-pickups.js'),read(now+'/js/features/loot/map-pickups.js'));
 // Run shotgun module in isolation: only owned shotguns produce shell loot
 // from stages 1 through 11, with no regression for standard stages 1–6.
 const doc={createElement:()=>({textContent:''}),head:{appendChild(){}},
  getElementById:()=>null,readyState:'loading',addEventListener(){}};
 const fakeWindow={PiraliDropBalance:{rollShellDrop:()=>true}};
 const sandbox={window:fakeWindow,document:doc,level:1,pickups:[],Math,Date};
 vm.runInNewContext(gear,sandbox);
 const api=fakeWindow.PiraliAlphaGear;
 const nodes=Array.from({length:24},(_,i)=>({x:700+i*8,y:400+i*100}));
 for(let stage=1;stage<=6;stage++){
  sandbox.level=stage;sandbox.pickups=[];
  api.scatterOnFinal(nodes,sandbox.pickups,stage);
  assert.equal(sandbox.pickups.some(p=>p.type==='alpha-shells'),false,'Unowned gun not pre-supplied at stage '+stage);
  assert.equal(api.maybeDropShell({x:100,y:100}),false,'No unearned shell drops');
 }
 api.restore({owned:true,shells:12,selected:'shotgun',shellGrantBase:15});
 for(let stage=1;stage<=11;stage++){
  sandbox.level=stage;sandbox.pickups=[];
  api.scatterOnFinal(nodes,sandbox.pickups,stage);
  assert.ok(sandbox.pickups.filter(p=>p.type==='alpha-shells').length>=3,'Three scatter locations at stage '+stage);
  assert.equal(api.maybeDropShell({x:100,y:100}),true,'Owned gun enemy drop at stage '+stage);
  assert.ok(sandbox.pickups.some(p=>p.type==='alpha-shells'),'Enemy shell pickup at stage '+stage);
 }
 assert.equal(api.status().owned,true);
 api.reset();assert.equal(api.status().owned,false);
 // Run scoring in isolated game-like VM with the same finite stage budget.
 function scoreFor(premium){
  let x={window:{PiraliFullPath:{isActive:()=>premium},PiraliCheckpoint:{endlessBase:()=>0}},
   level:1,score:0,updateScoreUI:()=>{},pickups:[{type:'medal',col:false}],
   enemies:[{alive:true,etype:'saber'},{alive:true,etype:'saber'}],boss:null,
   PIRALI_BALANCE:{finalBossReinforcements:0},Math};
  vm.runInNewContext(scores,x);
  const api=x.window.PiraliStageScoring;
  api.prepareStage();
  api.awardKill(false);api.awardKill(true);
  api.awardMedal();
  return x.score;
 }
 assert.equal(scoreFor(false),250,'Standard run retains full score');
 assert.equal(scoreFor(true),50,'Full Route receives 20% XP (80% less)');
}
console.log('PASS Beta 1.31: all-stage owned shotgun shells, ordinary scoring and HP unchanged, Full Route 20% XP and 7 hearts, Player & Developer parity');