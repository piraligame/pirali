'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function list(d){return fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(d+'/'+e.name):[d+'/'+e.name]);}
const changed=new Set(['js/menu.js','js/i18n.js','css/menu.css','index.html','TEST_INFO.json']);
for(const variant of ['play','dev']){
 const original='beta134-'+variant,next='beta135-'+variant;
 const oldFiles=list(original).map(x=>x.slice(original.length+1)).sort();
 const newFiles=list(next).map(x=>x.slice(next.length+1)).sort();
 assert.deepEqual(newFiles,oldFiles,'Beta 1.35 preserves all Beta 1.34 files');
 for(const file of oldFiles){
  const before=read(original+'/'+file),after=read(next+'/'+file);
  if(changed.has(file))assert.notEqual(after,before,'Expected menu-only change '+file);
  else assert.equal(after,before,'Gameplay and assets must remain byte-identical '+file);
  if(file.endsWith('.js'))new vm.Script(after,{filename:next+'/'+file});
 }
 const html=read(next+'/index.html'),menu=read(next+'/js/menu.js'),
       i18n=read(next+'/js/i18n.js'),css=read(next+'/css/menu.css'),
       info=JSON.parse(read(next+'/TEST_INFO.json'));
 assert.ok(html.includes('1.35-classic.'+variant));
 assert.match(html,/BETA 1\.35/);
 assert.match(html,/css\/menu\.css\?v=beta135-cinematic-menu/);
 assert.match(html,/js\/menu\.js\?v=beta135-cinematic/);
 assert.match(html,/js\/i18n\.js\?v=beta135-lore/);
 assert.equal(info.menuLayout,'cinematic-portrait-v135');
 assert.equal(info.features135.length,5);
 assert.equal(info.premiumFullRoute.pointsMultiplier,.2);
 assert.equal(info.premiumFullRoute.startingHearts,7);
 assert.equal(info.premiumFullRoute.shellDropsAllStagesIfOwned,true);
 assert.equal(info.mobileControlsPreserved,true);
 assert.equal(info.androidBuilt,false);
 assert.equal(info.aabBuilt,false);
 assert.match(menu,/screen\.insertBefore\(lore,card\)/);
 assert.match(menu,/screen\.classList\.add\('pirali-menu-135'\)/);
 assert.match(menu,/PiraliPlayerIdentity\?\.mountMenu\(actions\)/);
 assert.match(menu,/card\.appendChild\(picker\)/);
 assert.match(i18n,/menu-story-lore p/);
 assert.match(css,/padding:clamp\(225px,33dvh,365px\)/);
 assert.match(css,/\.menu-story-lore/);
 assert.match(css,/overflow-y:auto/);
 assert.match(css,/menu-language-option/);
 for(const expression of ['როცა სამართალი ხმას კარგავს','მისი გზა სიბნელიდან იწყება','Это история Пирали','This is the legend of PIRALI']){
  assert.ok(i18n.includes(expression),'Original translated lore preserved: '+expression);
 }
 for(const file of ['js/runtime/combat.js','js/runtime/render.js','js/runtime/update.js','js/progression/player-stats.js',
  'js/progression/player-identity.js','js/config/alpha-gear-v2.js','js/runtime/leaderboard.js',
  'js/features/full-path/demo.js','js/features/map/story-map.js','js/preview-controls.js',
  'css/player-identity.css','css/player-stats.css','css/story-map.css']){
   assert.equal(read(next+'/'+file),read(original+'/'+file),'Protected gameplay '+file);
 }
}
console.log('PASS Beta 1.35: exact Simona art, full translated story outside card, lower language row, player name below stats, no gameplay or Firebase changes');
