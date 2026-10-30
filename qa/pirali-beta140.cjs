'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function files(d){return fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(d+'/'+x.name):[d+'/'+x.name]);}
const altered=new Set(['index.html','js/runtime/update.js','js/menu.js','TEST_INFO.json',
 'js/features/evolution/game139.js','js/features/evolution/menu139.js','css/beta139.css']);
for(const v of ['play','dev']){
 const old='beta139-'+v,now='beta140-'+v,expected=files(old).map(x=>x.slice(old.length+1)).sort(),actual=files(now).map(x=>x.slice(now.length+1)).sort();
 assert.deepEqual(actual,expected,'All prior files and features preserved');
 const modified=new Set(altered);if(v==='dev')modified.add('js/preview-controls.js');
 for(const p of expected){
  const a=read(old+'/'+p),b=read(now+'/'+p);
  if(modified.has(p))assert.notEqual(a,b,'Planned modification '+p);
  else assert.equal(a,b,'Preserved earlier file '+p);
  if(p.endsWith('.js'))new vm.Script(b,{filename:now+'/'+p});
 }
 const meta=JSON.parse(read(now+'/TEST_INFO.json'));
 assert.equal(meta.features140.length,4);
 assert.equal(meta.evolution140.sneakRemoved,true);
 assert.equal(meta.evolution139.rankedPointsChanged,false);
 assert.equal(meta.premiumFullRoute.pointsMultiplier,.2);
 assert.equal(meta.premiumFullRoute.startingHearts,7);
 assert.equal(meta.premiumFullRoute.shellDropsAllStagesIfOwned,true);
 assert.equal(meta.mobileControlsPreserved,true);
 assert.equal(meta.androidBuilt,false);assert.equal(meta.aabBuilt,false);
 const html=read(now+'/index.html'),code=read(now+'/js/features/evolution/game139.js'),menu=read(now+'/js/features/evolution/menu139.js'),
   css=read(now+'/css/beta139.css'),update=read(now+'/js/runtime/update.js');
 assert.ok(html.includes('1.40-classic.'+v));
 for(const asset of ['css/beta139.css?v=140-menu-low','js/features/evolution/game139.js?v=140-no-sneak','js/features/evolution/menu139.js?v=140-face'])assert.ok(html.includes(asset));
 assert.doesNotMatch(code,/sneak|stealth|quiet|canDetect|speedFactor|inCover|breakStealth|grass/i,'No stealth JS or drawing');
 assert.doesNotMatch(css,/\.pirali139-quiet/,'No stealth UI styles');
 assert.doesNotMatch(update,/PiraliEvolution139\?\.speedFactor/,'Original speed');
 assert.doesNotMatch(update,/PiraliEvolution139\?\.canDetect/,'Original sight');
 assert.match(update,/const sp=SPD\*dt\*Math\.min\(mag,1\)/);
 assert.match(update,/e\.seesSimona=visible/);
 assert.match(menu,/portraitTarget=Math\.max\(400/);
 assert.match(menu,/freeTop=viewport-height-bottomReserve/);
 assert.match(code,/evoRole='scout'/);
 assert.match(code,/evoRole='commander'/);
 assert.match(code,/evoDormant=true/);
 assert.match(code,/profile\.found\.push\(level\)/);
 assert.equal(read(now+'/js/runtime/combat.js'),read(old+'/js/runtime/combat.js'),'Original joystick exactly retained');
 assert.equal(read(now+'/js/features/scoring/stage-awards.js'),read(old+'/js/features/scoring/stage-awards.js'));
 assert.equal(read(now+'/js/runtime/leaderboard.js'),read(old+'/js/runtime/leaderboard.js'));
 assert.equal(read(now+'/js/features/endless/waves.js'),read(old+'/js/features/endless/waves.js'));
 if(v==='dev')assert.match(read(now+'/js/preview-controls.js'),/Beta 1\.40 გაუმჯობესებები/);
 else assert.equal(meta.developerComparison,null);
}
console.log('PASS Beta 1.40: menu lowered safely, stealth fully removed, previous gameplay unchanged');
