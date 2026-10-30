'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function files(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(dir+'/'+x.name):[dir+'/'+x.name]);}
const planned=new Set(['js/runtime/update.js','js/features/stages/08-dual-generals.js',
 'js/features/loot/bullet-art136.js','js/menu.js','index.html','TEST_INFO.json']);
for(const variant of ['play','dev']){
 const beforeDir='beta136-'+variant,afterDir='beta137-'+variant,modified=new Set(planned);
 if(variant==='dev')modified.add('js/preview-controls.js');
 const previous=files(beforeDir).map(x=>x.slice(beforeDir.length+1)).sort();
 const current=files(afterDir).map(x=>x.slice(afterDir.length+1)).sort();
 assert.deepEqual(current,[...previous,'js/features/enemies/range137.js'].sort(),'All Beta 1.36 files kept');
 for(const file of previous){
  const earlier=read(beforeDir+'/'+file),now=read(afterDir+'/'+file);
  if(modified.has(file))assert.notEqual(now,earlier,'Planned edit '+file);
  else assert.equal(now,earlier,'Unrelated mechanics protected '+file);
  if(file.endsWith('.js'))new vm.Script(now,{filename:afterDir+'/'+file});
 }
 const meta=JSON.parse(read(afterDir+'/TEST_INFO.json'));
 const html=read(afterDir+'/index.html');
 assert.ok(html.includes("1.37-classic."+variant));
 assert.equal(meta.features137.length,5);
 assert.equal(meta.enemyRange137.enemyBulletScale,2);
 assert.equal(meta.enemyRange137.playerBulletScale,1);
 assert.equal(meta.premiumFullRoute.pointsMultiplier,.2);
 assert.equal(meta.premiumFullRoute.startingHearts,7);
 assert.equal(meta.premiumFullRoute.shellDropsAllStagesIfOwned,true);
 assert.equal(meta.mobileControlsPreserved,true);
 assert.equal(meta.androidBuilt,false);
 assert.equal(meta.aabBuilt,false);
 assert.match(html,/js\/features\/enemies\/range137\.js\?v=137/);
 assert.match(html,/js\/runtime\/update\.js\?v=beta137-shorter-range/);
 assert.match(html,/js\/features\/loot\/bullet-art136\.js\?v=beta137-enemy-2x/);
 const mod=read(afterDir+'/js/features/enemies/range137.js');
 const stage=read(afterDir+'/js/runtime/update.js');
 const second=read(afterDir+'/js/features/stages/08-dual-generals.js');
 const art=read(afterDir+'/js/features/loot/bullet-art136.js');
 new vm.Script(mod);
 assert.match(stage,/PiraliEnemyRange137\?\.expired/);
 assert.match(stage,/PiraliEnemyRange137\?\.sightRange/);
 assert.match(stage,/PiraliEnemyRange137\?\.fireRange/);
 assert.match(stage,/PiraliEnemyRange137\?\.mayFire/);
 assert.match(stage,/maxTravel137:window\.PiraliEnemyRange137/);
 assert.match(second,/PiraliEnemyRange137\.rules\.secondGeneralFire/);
 assert.match(second,/PiraliEnemyRange137\?\.mayFire/);
 assert.match(art,/ctx\.scale\(2,2\)/);
 assert.match(art,/if\(!b\.fp&&window\.PiraliEnemyRange137/);
 // The real ranges, tree occlusion, on-screen gating, projectile cap
 // and Developer before/after comparison are tested as working functions.
 const env={window:{},Math,sx:x=>x,sy:y=>y,W:360,H:760};
 vm.runInNewContext(mod,env);
 const api=env.window.PiraliEnemyRange137;
 assert.equal(api.enabled(),true);
 assert.equal(api.sightRange(false),455);
 assert.equal(api.sightRange(true),475);
 assert.equal(api.fireRange('rifle'),315);
 assert.equal(api.fireRange('officer'),365);
 assert.equal(api.limitFor('rifle'),395);
 assert.equal(api.limitFor('officer'),445);
 assert.equal(api.limitFor('boss'),500);
 assert.equal(api.limitFor('second-general'),445);
 const shooter={x:75,y:170,r:12},player={x:140,y:170};
 assert.equal(api.mayFire(shooter,player,[],315),true,'Nearby visible shooter can fire');
 assert.equal(api.mayFire({x:400,y:170,r:12},player,[],315),false,'Offscreen shooter cannot fire');
 assert.equal(api.mayFire(shooter,player,[{x:108,y:170,r:24}],315),false,'Tree obstructs shot');
 assert.equal(api.mayFire(shooter,{x:500,y:170},[],315),false,'Beyond range cannot fire');
 const projectile={vx:3.7,vy:0,fp:false};
 assert.equal(api.expired(projectile,100),false);
 assert.equal(api.expired(projectile,7),true,'Enemy shot disappears after bounded travel');
 assert.equal(api.expired({vx:20,vy:0,fp:true},999),false,'Simona shots unaffected');
 if(variant==='dev'){
  const preview=read(afterDir+'/js/preview-controls.js');
  assert.match(preview,/Beta 1\.37 გაუმჯობესებები/);
  assert.match(preview,/latestEnabled:\(\)=>newestEnabled/);
  assert.ok(!preview.includes("classList.toggle('pirali-menu136-on',newestEnabled)"),'Old approved menu remains active');
  assert.match(read(afterDir+'/js/menu.js'),/classList\.add\('pirali-menu136-on'\)/);
  assert.match(art,/const enabled=\(\)=>true/);
  assert.match(html,/js\/preview-controls\.js\?v=beta137-compare/);
  env.window.PiraliDevComparison={latestEnabled:()=>false};
  assert.equal(api.enabled(),false);
  assert.equal(api.sightRange(false),560);
  assert.equal(api.fireRange('rifle'),380);
  assert.equal(api.fireRange('officer'),450);
  assert.equal(api.mayFire({x:500,y:170},player,[],315),true,'Disabled latest rules restore original behavior');
  assert.equal(api.expired({vx:3.7,vy:0,fp:false},200),false,'Old bullet lifetime restored');
  env.window.PiraliDevComparison.latestEnabled=()=>true;
  assert.equal(api.enabled(),true);
 }else{
  assert.equal(meta.developerComparison,null);
  assert.ok(!html.includes('js/preview-controls.js'));
 }
 for(const p of ['js/runtime/combat.js','js/runtime/world.js','js/runtime/render.js','js/config/balance.js',
 'js/config/alpha-gear-v2.js','js/features/enemies/tactical-ai.js','js/features/endless/waves.js',
 'js/features/scoring/kill-combos.js','js/runtime/leaderboard.js','js/progression/player-stats.js',
 'js/features/full-path/demo.js','js/platform/desktop-controls.js','css/menu.css','css/player-stats.css']){
  assert.equal(read(afterDir+'/'+p),read(beforeDir+'/'+p),'Untouched previous feature '+p);
 }
}
console.log('PASS Beta 1.37: enemy 2x visible bullet, smaller engagement distances, screen/LOS gated shooting, range-limited enemy projectiles, preserved 11-stage chase, unchanged damage/HUD/leaderboard');
