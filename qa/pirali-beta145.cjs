'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function files(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(dir+'/'+e.name):[dir+'/'+e.name]);}
for(const v of ['play','dev']){
 const old='beta144-'+v,now='beta145-'+v;
 const before=files(old).map(p=>p.slice(old.length+1)).sort(),
       after=files(now).map(p=>p.slice(now.length+1)).sort();
 assert.deepEqual(after,before,'All previous game assets retained');
 const planned=new Set(['index.html','js/menu.js','TEST_INFO.json',
   'js/features/evolution/game139.js','js/features/evolution/menu139.js',
   'js/features/combat/aim.js','js/config/alpha-gear-v2.js','js/runtime/combat.js']);
 if(v==='dev')planned.add('js/preview-controls.js');
 for(const p of before){
  const prior=read(old+'/'+p),next=read(now+'/'+p);
  if(planned.has(p))assert.notEqual(prior,next,'Expected feature adjustment '+p);
  else assert.equal(prior,next,'Prior game asset and mechanics preserved '+p);
  if(p.endsWith('.js'))new vm.Script(next,{filename:now+'/'+p});
 }
 const meta=JSON.parse(read(now+'/TEST_INFO.json'));
 assert.equal(meta.features145.length,6);
 assert.equal(meta.quests145.outpostHits,4);
 assert.equal(meta.quests145.lastLetterBeforeYardStage11,true);
 assert.equal(meta.quests145.scoreChanged,false);
 assert.equal(meta.maxTotalPoints,7000);
 assert.equal(meta.premiumFullRoute.pointsMultiplier,.2);
 assert.equal(meta.evolution140.sneakRemoved,true);
 assert.equal(meta.update144.bossHealthMultiplier,1.2);
 assert.equal(meta.androidBuilt,false);assert.equal(meta.aabBuilt,false);
 const game=read(now+'/js/features/evolution/game139.js'),
  aim=read(now+'/js/features/combat/aim.js'),
  combat=read(now+'/js/runtime/combat.js'),
  shotgun=read(now+'/js/config/alpha-gear-v2.js'),
  html=read(now+'/index.html');
 assert.ok(html.includes('1.45-classic.'+v));
 assert.match(game,/const rescue=n=>n===2\|\|n===5/);
 assert.match(game,/level===8\?'lookout':level===9\?'outpost'/);
 assert.match(game,/CHURCH_Y\+245/);
 assert.match(game,/goal\.hp=Math\.max\(0,goal\.hp-1\)/);
 assert.match(game,/combatQuest\(level\)/);
 assert.match(game,/drawVillager\(ctx/);
 assert.match(game,/goal\.kind==='outpost'/);
 assert.match(game,/goal\.kind==='lookout'/);
 assert.match(game,/if\(bullet\.shot144!=null&&goal\.shotStamp===bullet\.shot144\)return true/);
 assert.match(game,/objectiveTarget,hitQuestTarget,swordQuestHit,debug/);
 assert.match(aim,/PiraliEvolution139\?\.objectiveTarget\?\.\(\)/);
 assert.match(aim,/PiraliEvolution139\.hitQuestTarget\(target,b\)/);
 assert.match(shotgun,/shot144=\+\+burst144/);
 assert.match(combat,/PiraliEvolution139\?\.swordQuestHit\?\./);
 assert.doesNotMatch(game,/interactButton/);
 assert.ok(html.includes('js/features/evolution/game139.js?v=145-mission-entities'));
 assert.ok(html.includes('js/features/combat/aim.js?v=145-mission-target'));
 assert.equal(read(now+'/js/runtime/leaderboard.js'),read(old+'/js/runtime/leaderboard.js'));
 assert.equal(read(now+'/js/features/scoring/stage-awards.js'),read(old+'/js/features/scoring/stage-awards.js'));
 if(v==='dev')assert.match(read(now+'/js/preview-controls.js'),/PIRALI BETA 1\.45 DEV/);
 else assert.equal(meta.developerComparison,null);
}
console.log('PASS Beta 1.45: villager, runner, 4-hit outpost, front-of-yard letter, unchanged score and baseline');
