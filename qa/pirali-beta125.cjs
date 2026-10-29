'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const changed=new Set(['index.html','js/progression/player-stats.js','js/features/map/live-minimap.js','js/runtime/game-init.js','js/progression/checkpoints.js','js/menu.js','js/runtime/render.js','js/effects/combat-fx.js']);
const added=new Set(['js/features/replay/stage-replay.js','js/features/settings/graphics.js','css/beta125.css']);
const walk=dir=>fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);
for(const mode of ['play','dev']){
 const a='beta124-'+mode,b='beta125-'+mode;
 const old=walk(a).map(p=>p.slice(a.length+1)).sort(),fresh=walk(b).map(p=>p.slice(b.length+1)).sort();
 assert.deepEqual(fresh,[...old,...added].sort(),'All original assets present '+mode);
 for(const rel of old){
  if(!changed.has(rel))assert.deepEqual(fs.readFileSync(path.join(root,a,rel)),fs.readFileSync(path.join(root,b,rel)),'Unintended change '+rel);
  if(rel.endsWith('.js'))new vm.Script(read(b+'/'+rel),{filename:b+'/'+rel});
 }
 for(const rel of added){if(rel.endsWith('.js'))new vm.Script(read(b+'/'+rel));}
 const html=read(b+'/index.html'),stats=read(b+'/js/progression/player-stats.js'),app=read(b+'/js/runtime/game-init.js');
 assert.match(html,/1\.25-classic\./);
 assert.equal(html.includes('PiraliAlpha014Test=true'),mode==='dev','Panel isolation');
 assert.match(stats,/s\.kills>=100/);assert.match(stats,/s\.kills>=500/);
 assert.ok(!stats.includes("award(s,'tenKills')"));assert.ok(!stats.includes("award(s,'endless100')"));
 assert.ok(!stats.includes("'tenKills','stageThree'"));
 assert.match(app,/PiraliReplayPracticeActive=replay/);
 assert.match(read(b+'/js/progression/checkpoints.js'),/if\(window\.PiraliReplayPracticeActive\)return/);
 assert.match(read(b+'/js/features/map/live-minimap.js'),/PREFERENCE_KEY/);
 assert.match(read(b+'/js/features/settings/graphics.js'),/drawEffects/);
 assert.match(read(b+'/js/features/settings/graphics.js'),/return mode==='high'/);
 assert.match(read(b+'/js/effects/combat-fx.js'),/quality==='low'/);
 for(const file of ['js/config/balance.js','js/config/stage-balance.js','js/features/endless/waves.js','js/features/scoring/stage-awards.js','js/runtime/update.js','js/runtime/combat.js','js/runtime/world.js','js/preview-controls.js']){
  if(fs.existsSync(path.join(root,a,file)))assert.equal(read(b+'/'+file),read(a+'/'+file),'Preserve gameplay '+file);
 }
}
console.log('PASS PIRALI Beta 1.25: Player/Developer syntax, all assets, 100/500 thresholds, replay isolation, settings, balance, classic joystick');
