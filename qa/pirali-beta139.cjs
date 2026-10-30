'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function files(d){return fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(d+'/'+x.name):[d+'/'+x.name]);}
for(const v of ['play','dev']){
 const old='beta138-'+v,now='beta139-'+v;
 const changed=new Set(['index.html','js/runtime/update.js','js/runtime/render.js','js/menu.js','TEST_INFO.json']);
 if(v==='dev'){changed.add('js/runtime/combat.js');changed.add('js/preview-controls.js');}
 const a=files(old).map(x=>x.slice(old.length+1)).sort(),b=files(now).map(x=>x.slice(now.length+1)).sort();
 assert.deepEqual(b,[...a,'js/features/evolution/game139.js','js/features/evolution/menu139.js','css/beta139.css'].sort(),
   'All Beta 1.38 assets remain and only 3 new files appear');
 for(const f of a){
  const before=read(old+'/'+f),after=read(now+'/'+f);
  if(changed.has(f))assert.notEqual(after,before,'Planned update '+f);
  else assert.equal(after,before,'Protected core asset '+f);
  if(f.endsWith('.js'))new vm.Script(after,{filename:now+'/'+f});
 }
 const info=JSON.parse(read(now+'/TEST_INFO.json')),html=read(now+'/index.html');
 assert.equal(info.features139.length,7);
 assert.equal(info.evolution139.rankedPointsChanged,false);
 assert.equal(info.evolution139.regularMaxPoints,5000);
 assert.equal(info.evolution139.endlessMaxPoints,2000);
 assert.equal(info.premiumFullRoute.pointsMultiplier,.2);
 assert.equal(info.premiumFullRoute.startingHearts,7);
 assert.equal(info.premiumFullRoute.shellDropsAllStagesIfOwned,true);
 assert.equal(info.mobileControlsPreserved,true);
 assert.equal(info.androidBuilt,false);assert.equal(info.aabBuilt,false);
 assert.ok(html.includes('1.39-classic.'+v));
 for(const script of ['css/beta139.css?v=139-compact','js/features/evolution/game139.js?v=139-game','js/features/evolution/menu139.js?v=139-menu'])
 assert.ok(html.includes(script),'New module loaded '+script);
 const game=read(now+'/js/features/evolution/game139.js');
 const menu=read(now+'/js/features/evolution/menu139.js'),css=read(now+'/css/beta139.css');
 new vm.Script(game);new vm.Script(menu);
 const update=read(now+'/js/runtime/update.js'),render=read(now+'/js/runtime/render.js');
 for(const k of ['canDetect','speedFactor','dormant','heading'])assert.ok(update.includes('PiraliEvolution139?.'+k),'AI integration '+k);
 assert.ok(render.includes('PiraliEvolution139?.drawWorld'));
 assert.ok(render.includes('PiraliEvolution139?.dormant'));
 for(const s of ["evoRole='scout'","evoRole='commander'","evoDormant=true","evoWarn>=120","const originalKill=killEnemy","const originalDash=dash","const originalShoot=shoot","profile.found.push(level)"])
 assert.ok(game.includes(s),'Evolution mechanism: '+s);
 assert.ok(game.includes("window.PiraliVisualPreviewReadonly")&&game.includes("pirali139_player_collection"),'Safe local save keys');
 assert.ok(menu.includes('pirali139-collection-link'));
 assert.ok(css.includes('.pirali139-compact'));
 assert.ok(!game.includes('awardKill(')&&!game.includes('score+=')&&!game.includes('autoSaveScore('),'No new rank points');
 for(const f of ['js/runtime/world.js','js/features/scoring/stage-awards.js','js/features/scoring/kill-combos.js',
  'js/features/endless/waves.js','js/runtime/leaderboard.js','js/progression/player-stats.js',
  'js/config/alpha-gear-v2.js','js/features/loot/drop-balance.js','js/features/enemies/tactical-ai.js',
  'js/features/enemies/range137.js','js/features/full-path/demo.js','css/style.css','css/menu.css']){
  assert.equal(read(now+'/'+f),read(old+'/'+f),'Old mechanics intact '+f);
 }
 if(v==='dev'){
  assert.ok(read(now+'/js/preview-controls.js').includes('Beta 1.39 გაუმჯობესებები'));
  assert.ok(read(now+'/js/runtime/combat.js').includes('joystickModern=()=>true'));
 }else{
  assert.equal(info.developerComparison,null);
  assert.ok(!html.includes('js/preview-controls.js'));
 }
}
console.log('PASS Beta 1.39: 11 missions, lookout, stealth, commander, ambush, collection and cosmetics without modifying ranked scoring or former gameplay');
