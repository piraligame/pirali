'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const scan=p=>fs.readdirSync(path.join(root,p),{withFileTypes:true}).flatMap(x=>x.isDirectory()?scan(p+'/'+x.name):[p+'/'+x.name]);
const changed=new Set(['index.html','js/menu.js','js/progression/player-stats.js','js/features/results/stage-stars.js','js/features/profile/stats-backup.js','TEST_INFO.json']);
for(const v of ['play','dev']){
 const old='beta127-'+v,now='beta1271-'+v;
 const previous=scan(old).map(p=>p.slice(old.length+1)).sort(),current=scan(now).map(p=>p.slice(now.length+1)).sort();
 assert.deepEqual(current,previous);
 for(const rel of current){
  if(rel.endsWith('.js'))new vm.Script(read(now+'/'+rel),{filename:now+'/'+rel});
  if(!changed.has(rel))assert.equal(read(now+'/'+rel),read(old+'/'+rel),'Unintended edit '+rel);
 }
 const html=read(now+'/index.html'),menu=read(now+'/js/menu.js'),backup=read(now+'/js/features/profile/stats-backup.js');
 assert.match(html,/1\.27\.1-classic/);
 assert.match(menu,/PIRALI • BETA 1\.27\.1/);
 assert.doesNotMatch(menu,/PiraliStatsBackup\?\.mount/,'Manual menu button was removed');
 assert.match(backup,/autoSave,recover,exportData/);
 assert.match(backup,/pagehide/);assert.match(backup,/visibilitychange/);
 assert.match(read(now+'/js/progression/player-stats.js'),/PiraliStatsBackup\?\.recover/);
 assert.match(read(now+'/js/progression/player-stats.js'),/PiraliStatsBackup\?\.autoSave/);
 assert.match(read(now+'/js/features/results/stage-stars.js'),/autoSave\?\.\(true\)/);
 assert.equal(html.includes('js/preview-controls.js'),v==='dev');
 assert.doesNotMatch(menu,/menu-replay|PiraliReplay/);
 assert.match(read(now+'/js/runtime/game-init.js'),/PiraliPlayerIdentity\.requireName/);
 assert.equal(read(now+'/js/progression/checkpoints.js'),read(old+'/js/progression/checkpoints.js'));
 assert.equal(read(now+'/js/config/balance.js'),read(old+'/js/config/balance.js'));
 assert.equal(read(now+'/js/features/enemies/tactical-ai.js'),read(old+'/js/features/enemies/tactical-ai.js'));
 assert.equal(read(now+'/js/features/scenery/interactables.js'),read(old+'/js/features/scenery/interactables.js'));
}
console.log('PASS Beta 1.27.1 no stats backup menu, auto snapshots and recovery, both roles, prior game mechanics intact');
