'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function scan(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?scan(dir+'/'+e.name):[dir+'/'+e.name]);}
const changed=new Set(['index.html','js/menu.js','js/runtime/game-init.js','js/progression/checkpoints.js','css/beta125.css']);
for(const variant of ['play','dev']){
 const old='beta1251-'+variant,now='beta1252-'+variant;
 const original=scan(old).map(f=>f.slice(old.length+1)).sort();
 const actual=scan(now).map(f=>f.slice(now.length+1)).sort();
 assert.deepEqual(actual,original.filter(f=>f!=='js/features/replay/stage-replay.js'),'Assets preserved '+variant);
 for(const rel of actual){
   if(rel.endsWith('.js'))new vm.Script(read(now+'/'+rel),{filename:now+'/'+rel});
   if(!changed.has(rel))assert.deepEqual(fs.readFileSync(path.join(root,now,rel)),fs.readFileSync(path.join(root,old,rel)),'Unexpected modification '+rel);
 }
 const html=read(now+'/index.html'),menu=read(now+'/js/menu.js'),init=read(now+'/js/runtime/game-init.js');
 const checkpoints=read(now+'/js/progression/checkpoints.js'),style=read(now+'/css/beta125.css');
 assert.match(html,/1\.25\.2-classic\./);
 assert.equal(html.includes('PiraliAlpha014Test=true'),variant==='dev','Developer role isolation');
 assert.doesNotMatch(html,/features\/replay\/stage-replay/);
 assert.doesNotMatch(menu,/PiraliReplay|menu-replay|stage-replay/);
 assert.doesNotMatch(style,/\.menu-replay|\.pirali-replay/);
 assert.doesNotMatch(init,/practiceStage|PiraliReplayPracticeActive|\breplay\b/);
 assert.match(init,/function startGame\(savedProgress=null\)/);
 assert.match(init,/level=restore\?restore\.level:1/);
 assert.equal(init,read('beta124-play/js/runtime/game-init.js'),'Restore normal campaign start behavior');
 assert.equal(checkpoints,read('beta124-play/js/progression/checkpoints.js'),'Restore normal checkpoint and resume');
 assert.match(checkpoints,/pirali_checkpoint_beta_1_23_classic_play/);
 assert.match(html,/js\/progression\/player-stats\.js\?v=beta125-achievements/);
 for(const stable of ['js/runtime/world.js','js/runtime/combat.js','js/runtime/update.js','js/config/levels.js','js/config/balance.js','js/config/stage-balance.js','js/features/scoring/stage-awards.js','js/features/endless/waves.js','js/progression/player-stats.js','js/features/map/live-minimap.js','js/i18n.js']){
   assert.equal(read(now+'/'+stable),read(old+'/'+stable),'Balance, translations and save preservation '+stable);
 }
 assert.equal(html.includes('js/preview-controls.js'),variant==='dev','Player must not load Developer panel');
 if(variant==='dev'){
  const controls=read(now+'/js/preview-controls.js');
  assert.match(controls,/for\(let n=1;n<=11;n\+\+\)/);
  assert.match(controls,/immortality\.dataset\.immortality/);
  assert.doesNotMatch(controls,/finalBoss|shield|damageTest/);
 }
}
console.log('PASS Beta 1.25.2: replay removed, Player only normal progression/checkpoint, Developer stage selector + invincibility, scores/11 levels/four languages unchanged.');