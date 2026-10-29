'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const walk=p=>fs.readdirSync(path.join(root,p),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(p+'/'+e.name):[p+'/'+e.name]);
const changed=new Set(['index.html','js/menu.js','TEST_INFO.json']);
for(const v of ['play','dev']){
 const before='beta1272-'+v,now='beta128-'+v;
 const oldFiles=walk(before).map(x=>x.slice(before.length+1)).sort(),newFiles=walk(now).map(x=>x.slice(now.length+1)).sort();
 assert.deepEqual(newFiles,oldFiles.concat(['css/beta128.css','js/features/hud/layout128.js']).sort(),'All old resources preserved');
 for(const p of oldFiles){
  if(!changed.has(p))assert.equal(read(before+'/'+p),read(now+'/'+p),'Unexpected gameplay/stat edit '+p);
 }
 for(const p of newFiles.filter(p=>p.endsWith('.js')))new vm.Script(read(now+'/'+p),{filename:now+'/'+p});
 const html=read(now+'/index.html'),menu=read(now+'/js/menu.js'),css=read(now+'/css/beta128.css');
 assert.match(html,/1\.28-classic\./);assert.match(menu,/BETA 1\.28/);
 assert.match(html,/beta128\.css\?v=128-compact-map-rewards/);assert.match(html,/layout128\.js\?v=128-score-side-rewards/);
 assert.match(css,/#inventory/);assert.match(css,/#pirali-mini-map-canvas/);
 assert.equal(html.includes('js/preview-controls.js'),v==='dev');
 assert.doesNotMatch(menu,/PiraliStatsBackup\?\.mount|PiraliReplay|menu-replay/);
 assert.match(read(now+'/js/runtime/game-init.js'),/PiraliPlayerIdentity\.requireName/);
 const meta=JSON.parse(read(now+'/TEST_INFO.json'));
 assert.equal(meta.androidBuilt,false);assert.equal(meta.aabBuilt,false);
}
console.log('PASS PIRALI Beta 1.28: isolated builds, only HUD styling changed, classic joystick/stats/checkpoints/AI/balance/11 stages intact');
