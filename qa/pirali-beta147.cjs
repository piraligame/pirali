'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function all(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true})
 .flatMap(x=>x.isDirectory()?all(dir+'/'+x.name):[dir+'/'+x.name]);}
const changed=new Set([
 'index.html','TEST_INFO.json','js/menu.js','js/runtime/render.js',
 'js/features/polish/feedback.js','js/runtime/combat.js',
 'js/features/scoring/kill-combos.js','js/runtime/update.js',
 'js/features/evolution/game139.js','js/features/loot/laurel-shield.js',
 'js/features/hell/loot.js','js/config/alpha-gear-v2.js'
]);
for(const v of ['play','dev']){
 const prev='beta146-'+v,now='beta147-'+v;
 const old=all(prev).map(x=>x.slice(prev.length+1)).sort();
 const next=all(now).map(x=>x.slice(now.length+1)).sort();
 assert.deepEqual(next,old.concat('css/beta147-notices.css').sort(),
  'Retain all prior game assets, only add notification CSS');
 const changedVariant=new Set([...changed,...(v==='dev'?['js/preview-controls.js']:[])]);
 for(const name of old){
  const a=read(prev+'/'+name),b=read(now+'/'+name);
  if(changedVariant.has(name))assert.notEqual(a,b,'Expected Beta 1.47 change: '+name);
  else assert.equal(a,b,'Unchanged Beta 1.46 gameplay file: '+name);
  if(name.endsWith('.js'))new vm.Script(b,{filename:now+'/'+name});
 }
 const meta=JSON.parse(read(now+'/TEST_INFO.json'));
 assert.equal(meta.version,'1.47-beta.1'+(v==='dev'?'-dev':''));
 assert.equal(meta.notifications147.scoreChanged,false);
 assert.equal(meta.notifications147.topComboRemoved,true);
 assert.equal(meta.notifications147.bottomEnemyCounterRemoved,true);
 assert.equal(meta.maxTotalPoints,7000);
 assert.equal(meta.quests146.replayableAll,true);
 assert.equal(meta.androidBuilt,false);
 assert.equal(meta.aabBuilt,false);
 const html=read(now+'/index.html'),renderer=read(now+'/js/runtime/render.js'),
  combo=read(now+'/js/features/scoring/kill-combos.js'),
  feedback=read(now+'/js/features/polish/feedback.js'),
  css=read(now+'/css/beta147-notices.css');
 assert.ok(html.includes('1.47-classic.'+v));
 assert.match(html,/css\/beta147-notices\.css\?v=beta147-translucent/);
 assert.match(html,/js\/features\/polish\/feedback\.js\?v=beta147-one-flash/);
 assert.match(read(now+'/js/menu.js'),/BETA 1\.47/);
 const hud=renderer.slice(renderer.indexOf('function drawHUD(){'),renderer.indexOf('// ── BACKGROUND —'));
 assert.ok(hud.includes('lowHpPulse'),'Low HP warnings must remain');
 assert.doesNotMatch(hud,/killStreak|swordCombo|remainingMs|alive=enemies|fillText\('⚔/,'No duplicated canvas HUD');
 assert.match(feedback,/const ids=\{flash:'pirali-polish-flash'/);
 assert.match(feedback,/function onStreak\(count\)/);
 assert.match(feedback,/const group=type==='stage'\?'stage':'flash'/);
 assert.match(feedback,/else if\(kind==='medal'\)/);
 assert.match(read(now+'/js/runtime/combat.js'),/if\(!window\.PiraliKillCombo\?\.status\?\.\(\)\.paired\)window\.PiraliPolish\?\.onStreak\(killStreak\)/);
 assert.match(read(now+'/js/runtime/update.js'),/onPickup\('medal',1\)/);
 assert.match(read(now+'/js/features/evolution/game139.js'),/onPickup\('quest',message\)/);
 assert.match(read(now+'/js/features/loot/laurel-shield.js'),/onPickup\('shield',1\)/);
 assert.match(read(now+'/js/features/hell/loot.js'),/onPickup\('coins'/);
 assert.match(read(now+'/js/config/alpha-gear-v2.js'),/onPickup\('shells'/);
 assert.match(combo,/showFloatingText\(x,y-24,'\+'\+gained/);
 assert.match(css,/top:48%!important/);
 assert.match(css,/background:rgba\(14,15,13,\.26\)/);
 assert.match(css,/pointer-events:none!important/);
 assert.equal(read(now+'/js/runtime/leaderboard.js'),read(prev+'/js/runtime/leaderboard.js'));
 assert.equal(read(now+'/js/features/scoring/stage-awards.js'),read(prev+'/js/features/scoring/stage-awards.js'));
}
console.log('PASS PIRALI Beta 1.47: top and bottom HUD removed; one short translucent center toast; unchanged points and assets.');
