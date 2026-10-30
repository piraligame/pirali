'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function files(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(dir+'/'+x.name):[dir+'/'+x.name]);}
const changed=new Set(['index.html','TEST_INFO.json','js/menu.js','js/effects/combat-fx.js',
 'js/features/enemies/tactical-ai.js','js/features/loot/pickup-visibility.js',
 'js/features/bosses/beta126-specials.js','js/runtime/render.js','js/features/map/live-minimap.js']);
for(const variant of ['play','dev']){
 const old='beta131-'+variant,now='beta132-'+variant;
 const a=files(old).map(f=>f.slice(old.length+1)).sort(),b=files(now).map(f=>f.slice(now.length+1)).sort();
 assert.deepEqual(b,a,'Beta 1.31 asset inventory is preserved '+variant);
 for(const file of a){
  const before=read(old+'/'+file),after=read(now+'/'+file);
  if(changed.has(file))assert.notEqual(before,after,'Planned polish file changed '+file);
  else assert.equal(before,after,'Protected file remains unchanged '+file);
  if(file.endsWith('.js'))new vm.Script(after,{filename:now+'/'+file});
 }
 const html=read(now+'/index.html'),info=JSON.parse(read(now+'/TEST_INFO.json'));
 assert.ok(html.includes("1.32-classic."+variant));
 assert.match(html,/BETA 1\.32/);
 assert.equal(info.version.startsWith('1.32-'),true);
 assert.equal(info.premiumFullRoute.pointsMultiplier,.2);
 assert.equal(info.premiumFullRoute.startingHearts,7);
 assert.equal(info.premiumFullRoute.shellDropsAllStagesIfOwned,true);
 assert.equal(info.mobileControlsPreserved,true);
 assert.equal(info.androidBuilt,false);assert.equal(info.aabBuilt,false);
 assert.equal(info.features132.length,5);
 for(const file of ['js/runtime/combat.js','js/runtime/update.js','js/runtime/world.js',
  'js/runtime/game-init.js','js/config/balance.js','js/config/stage-balance.js',
  'js/features/scoring/stage-awards.js','js/features/scoring/kill-combos.js',
  'js/features/loot/drop-balance.js','js/features/loot/map-pickups.js',
  'js/config/alpha-gear-v2.js','js/features/endless/waves.js',
  'js/progression/player-stats.js','js/runtime/leaderboard.js',
  'js/progression/checkpoints.js','js/features/full-path/demo.js',
  'js/platform/desktop-controls.js','js/platform/mobile-lifecycle.js',
  'css/style.css','css/alpha014-hud.css']){
   assert.equal(read(now+'/'+file),read(old+'/'+file),'Locked mechanics preserved '+file);
 }
 const fx=read(now+'/js/effects/combat-fx.js'),ai=read(now+'/js/features/enemies/tactical-ai.js');
 const loot=read(now+'/js/features/loot/pickup-visibility.js'),boss=read(now+'/js/features/bosses/beta126-specials.js');
 const render=read(now+'/js/runtime/render.js'),map=read(now+'/js/features/map/live-minimap.js');
 assert.match(fx,/const MAX=28/);assert.match(fx,/impact-arc/);assert.match(fx,/muzzle-ray/);
 assert.match(ai,/keep-distance/);assert.match(ai,/stable-flank/);assert.match(ai,/direct-pressure/);
 assert.match(loot,/IMPORTANT=new Set/);assert.match(loot,/alpha-shells/);
 assert.match(boss,/drawSecondaryWarning/);assert.match(boss,/progress\*TAU/);
 assert.match(render,/drawSecondaryWarning/);assert.ok(render.includes('if(bx<-20||by<-20||bx>W+20||by>H+20)return;'));
 assert.match(map,/Inline coordinate projection/);
 assert.match(read(now+'/js/menu.js'),/PIRALI • BETA 1\.32/);
 assert.match(read(now+'/js/menu.js'),/გეიმერების საზოგადოება/);
 const context={window:{matchMedia:()=>({matches:false})},Math};
 vm.runInNewContext(fx+'\nthis.testFX=PiraliFX;',context);
 const f=context.testFX;
 f.shoot(10,10,0);f.hit(10,10,false);f.hit(10,10,true);
 for(let i=0;i<100;i++)f.hit(10,10,true);
 assert.ok(f.debug().count<=28);assert.ok(f.debug().types.includes('impact-arc'));
 f.tick(1);assert.ok(f.debug().count<=28);
 const sandbox={window:{},Math,Map};vm.runInNewContext(ai,sandbox);
 const tactical=sandbox.window.PiraliTacticalAI;
 for(const [i,type] of ['saber','rifle','officer'].entries()){
  const e={x:80+i*10,y:100,r:12,etype:type,alive:true,state:'attack',seesSimona:true,groupId:7};
  tactical.prepare([e],[],i*2);
  const heading=tactical.heading(e,{tx:350,ty:100,baseAng:0,flankAng:.2,aliveEnemies:[e],level:1,trees:[]});
  assert.ok(Number.isFinite(heading),'Finite '+type+' steering');
 }
 const special={window:{},Math};vm.runInNewContext(boss,special);
 assert.equal(typeof special.window.PiraliBoss126.drawSecondaryWarning,'function');
 const fakeCtx={save(){},translate(){},beginPath(){},arc(){},stroke(){},moveTo(){},lineTo(){},restore(){}};
 special.window.PiraliBoss126.drawSecondaryWarning(fakeCtx,x=>x,y=>y,{alive:true,x:50,y:70,sT:8});
}
console.log('PASS Beta 1.32: preserved Beta 1.31 mechanics, mobile-capped FX, tactical AI, pickup contrast, boss telegraphs, draw optimizations, Player/Developer');
