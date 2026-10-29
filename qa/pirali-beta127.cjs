'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const list=p=>fs.readdirSync(path.join(root,p),{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(p+'/'+e.name):[p+'/'+e.name]);
const changed=new Set(['index.html','TEST_INFO.json','js/menu.js','js/runtime/combat.js','js/runtime/render.js','js/runtime/update.js']);
for(const v of ['play','dev']){
 const prior='beta1261-'+v,now='beta127-'+v,files=list(prior).map(x=>x.slice(prior.length+1)).sort(),next=list(now).map(x=>x.slice(now.length+1)).sort();
 assert.deepEqual(next,files.concat(['css/beta127.css','js/features/profile/stats-backup.js','js/features/scenery/interactables.js']).sort());
 for(const rel of files){
  if(!changed.has(rel))assert.deepEqual(fs.readFileSync(path.join(root,now,rel)),fs.readFileSync(path.join(root,prior,rel)),'Unplanned alteration '+rel);
 }
 for(const rel of next.filter(x=>x.endsWith('.js')))new vm.Script(read(now+'/'+rel),{filename:rel});
 const idx=read(now+'/index.html'),game=read(now+'/js/runtime/game-init.js'),menu=read(now+'/js/menu.js');
 assert.match(idx,/1\.27-classic/);assert.match(idx,/stats-backup\.js/);assert.match(idx,/interactables\.js/);assert.match(idx,/beta127\.css/);
 assert.match(game,/PiraliPlayerIdentity\.requireName/);
 assert.match(menu,/PiraliStatsBackup\?\.mount/);
 assert.doesNotMatch(menu,/PiraliReplay|menu-replay|stage-replay/);
 assert.equal(idx.includes('js/preview-controls.js'),v==='dev');
 assert.equal(idx.includes('window.PiraliAlpha014Test=true'),v==='dev');
 for(const preserved of ['js/runtime/world.js','js/runtime/game-init.js','js/progression/checkpoints.js','js/progression/player-stats.js','js/features/results/stage-stars.js','js/config/levels.js','js/config/balance.js','js/config/stage-balance.js','js/i18n.js','js/effects/combat-fx.js','js/runtime/leaderboard.js']){
  assert.equal(read(now+'/'+preserved),read(prior+'/'+preserved),preserved);
 }
 const info=JSON.parse(read(now+'/TEST_INFO.json'));
 assert.equal(info.androidBuilt,false);assert.equal(info.aabBuilt,false);
}
console.log('PASS 1.27: 11 stages, damage/score/100-500 achievements/classic joystick, identity, dev-only controls, static JS syntax & assets preserved');
