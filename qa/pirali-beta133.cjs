'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function files(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(dir+'/'+x.name):[dir+'/'+x.name]);}
const common=new Set(['index.html','js/menu.js','TEST_INFO.json','css/player-stats.css','js/features/loot/pickup-visibility.js']);
const developer=new Set(['js/effects/combat-fx.js','js/features/enemies/tactical-ai.js',
 'js/features/bosses/beta126-specials.js','js/runtime/render.js',
 'js/features/map/live-minimap.js','js/preview-controls.js']);
for(const variant of ['play','dev']){
 const old='beta132-'+variant,now='beta133-'+variant;
 const a=files(old).map(f=>f.slice(old.length+1)).sort(),b=files(now).map(f=>f.slice(now.length+1)).sort();
 assert.deepEqual(b,a,'All previous assets preserved');
 const changed=new Set(common);
 if(variant==='dev')for(const x of developer)changed.add(x);
 for(const file of a){
  const before=read(old+'/'+file),after=read(now+'/'+file);
  if(changed.has(file))assert.notEqual(before,after,'Planned update '+file);
  else assert.equal(before,after,'Unmodified features unchanged '+variant+'/'+file);
  if(file.endsWith('.js'))new vm.Script(after,{filename:now+'/'+file});
 }
 const html=read(now+'/index.html'),info=JSON.parse(read(now+'/TEST_INFO.json'));
 assert.match(html,/BETA 1\.33/);assert.ok(html.includes("1.33-classic."+variant));
 assert.equal(info.premiumFullRoute.pointsMultiplier,.2);
 assert.equal(info.premiumFullRoute.startingHearts,7);
 assert.equal(info.premiumFullRoute.shellDropsAllStagesIfOwned,true);
 assert.equal(info.mobileControlsPreserved,true);
 assert.equal(info.features133.length,3);
 assert.equal(read(now+'/js/features/loot/pickup-visibility.js'),read('beta131-'+variant+'/js/features/loot/pickup-visibility.js'),'Exact original pickup visual restored');
 const css=read(now+'/css/player-stats.css');
 assert.match(css,/left:calc\(50% \+ 23px\);right:auto/);
 assert.match(css,/top:10px/);
 assert.match(html,/css\/player-stats\.css\?v=beta133-timer/);
 for(const file of ['js/runtime/combat.js','js/runtime/update.js','js/runtime/world.js','js/runtime/game-init.js',
 'js/config/balance.js','js/features/scoring/stage-awards.js',
 'js/runtime/leaderboard.js','js/progression/player-stats.js','js/features/full-path/demo.js',
 'js/platform/mobile-lifecycle.js','css/style.css']){
  assert.equal(read(now+'/'+file),read(old+'/'+file),'Locked behavior stays identical '+file);
 }
 if(variant==='dev'){
  const preview=read(now+'/js/preview-controls.js');
  assert.match(preview,/dataset\.latestImprovements='toggle'/);
  assert.match(preview,/el\.append\(header,row,title,immortality,compare,note\)/);
  assert.match(preview,/window\.PiraliDevComparison=Object\.freeze/);
  const ai=read(now+'/js/features/enemies/tactical-ai.js');
  assert.match(ai,/headingClassic/);assert.match(ai,/PiraliDevComparison/);
  const fx=read(now+'/js/effects/combat-fx.js');
  const sandbox={window:{matchMedia:()=>({matches:false}),PiraliDevComparison:{enabled:()=>false}},Math};
  vm.runInNewContext(fx+'\nthis.testFX=PiraliFX;',sandbox);
  sandbox.testFX.hit(0,0,true);assert.equal(sandbox.testFX.debug().types.includes('impact-arc'),false);
  sandbox.window.PiraliDevComparison.enabled=()=>true;
  sandbox.testFX.reset();sandbox.testFX.hit(0,0,true);
  assert.equal(sandbox.testFX.debug().types.includes('impact-arc'),true);
  const boss=read(now+'/js/features/bosses/beta126-specials.js');
  assert.match(boss,/function drawClassic/);
  const render=read(now+'/js/runtime/render.js');
  assert.match(render,/drawChargeWarningClassic/);
  const map=read(now+'/js/features/map/live-minimap.js');
  assert.match(map,/PiraliDevComparison/);
 }else{
  assert.equal(info.developerComparison,null);
  assert.equal(read(now+'/js/effects/combat-fx.js'),read(old+'/js/effects/combat-fx.js'),'Player FX unchanged');
  assert.equal(read(now+'/js/features/enemies/tactical-ai.js'),read(old+'/js/features/enemies/tactical-ai.js'),'Player AI unchanged');
  assert.ok(!html.includes('js/preview-controls.js'));
 }
}
console.log('PASS Beta 1.33: original item glow, timer beside pause, Developer-only reversible comparison switch; no mechanic or leaderboard changes');
