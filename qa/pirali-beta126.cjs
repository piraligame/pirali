'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const list=p=>fs.readdirSync(path.join(root,p),{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(p+'/'+e.name):[p+'/'+e.name]);
const modified=new Set(['index.html','js/menu.js','js/runtime/update.js','js/runtime/render.js','js/runtime/combat.js','js/features/enemies/tactical-ai.js','js/features/map/live-minimap.js','TEST_INFO.json']);
for(const v of ['play','dev']){
 const before='beta1252-'+v,now='beta126-'+v;
 const source=list(before).map(p=>p.slice(before.length+1)).sort();
 const newer=list(now).map(p=>p.slice(now.length+1)).sort();
 assert.deepEqual(newer,source.concat(['js/features/bosses/beta126-specials.js']).sort(),'All original assets retained '+v);
 for(const rel of source){
  if(!modified.has(rel))assert.deepEqual(fs.readFileSync(path.join(root,now,rel)),fs.readFileSync(path.join(root,before,rel)),'Unintended mutation '+v+' '+rel);
 }
 for(const rel of newer.filter(n=>n.endsWith('.js'))){new vm.Script(read(now+'/'+rel),{filename:rel});}
 const index=read(now+'/index.html'),menu=read(now+'/js/menu.js'),update=read(now+'/js/runtime/update.js'),
  combat=read(now+'/js/runtime/combat.js'),render=read(now+'/js/runtime/render.js'),minimap=read(now+'/js/features/map/live-minimap.js');
 assert.match(index,/PiraliGameVersion='1\.26-classic\./);
 assert.match(index,/js\/features\/bosses\/beta126-specials\.js/);
 assert.match(menu,/PIRALI • BETA 1\.26 • 11 ტური/);
 assert.doesNotMatch(menu,/PiraliReplay|menu-replay|stage-replay/);
 assert.doesNotMatch(index,/features\/replay\/stage-replay/);
 assert.doesNotMatch(update,/practiceStage|PiraliReplayPracticeActive/);
 assert.equal(index.includes('js/preview-controls.js'),v==='dev');
 assert.equal(index.includes('window.PiraliAlpha014Test=true'),v==='dev');
 assert.match(update,/PiraliTacticalAI\?\.prepare/);
 assert.match(update,/PiraliBoss126\?\.fire/);
 assert.match(update,/PiraliBoss126\?\.tick/);
 assert.match(update,/nearbyTrees\(ex,ey,75\)/);
 assert.match(render,/PiraliBoss126\?\.draw/);
 assert.match(combat,/_beta126Knock=6/);
 assert.match(minimap,/drawBossPin/);
 assert.match(minimap,/pirali_beta125_minimap_hidden/);
 assert.match(index,/js\/progression\/player-stats\.js\?v=beta125-achievements/);
 for(const rel of ['js/runtime/world.js','js/runtime/game-init.js','js/progression/checkpoints.js','js/progression/player-stats.js','js/config/levels.js','js/config/balance.js','js/config/stage-balance.js','js/i18n.js','js/runtime/leaderboard.js','css/beta125.css']){
  assert.equal(read(now+'/'+rel),read(before+'/'+rel),'Balance, saves, language, achievements '+rel);
 }
 const info=JSON.parse(read(now+'/TEST_INFO.json'));assert.equal(info.androidBuilt,false);assert.equal(info.aabBuilt,false);
}
const scope={window:{},Math,Number,Object,Map};
vm.runInNewContext(read('beta126-play/js/features/enemies/tactical-ai.js'),scope);
const ai=scope.window.PiraliTacticalAI;
const make=(x,y,etype,id)=>({x,y,alive:true,etype,groupId:id,state:'attack',r:12,seesSimona:true});
const sab=make(0,0,'saber',1),rif=make(40,-120,'rifle',2),off=make(-100,-80,'officer',3);
const allies=[sab,rif,off],trees=[{x:1000,y:1000,r:25},{x:42,y:30,r:22}];
ai.prepare(allies,trees,2);
for(const e of allies){
 const a=ai.heading(e,{tx:0,ty:240,baseAng:Math.atan2(240-e.y,-e.x),flankAng:0,aliveEnemies:allies,level:7,trees});
 assert.ok(Number.isFinite(a));assert.ok(Math.abs(a)<=Math.PI);
}
assert.ok(Math.sin(sab._b126Angle)>.6,'swordsmen charge toward player');
assert.equal(ai.nearbyTrees(0,0,75).length,1,'Tree spatial query excludes distant cover');
assert.ok(ai.debug().checks>0,'Spatial neighbor movement logic executed');
ai.prepare(allies,[],3);
assert.equal(ai.nearbyTrees(0,0,75).length,0,'New world trees invalidate cache');
const bossScope={window:{},Math};
vm.runInNewContext(read('beta126-play/js/features/bosses/beta126-specials.js'),bossScope);
const special=bossScope.window.PiraliBoss126;
for(const stage of [7,8,10]){
 const b={x:100,y:200,alive:true},bullets=[];
 assert.equal(special.fire(b,0,bullets,stage,3),false);
 assert.equal(special.fire(b,0,bullets,stage,3),false);
 assert.equal(special.fire(b,0,bullets,stage,3),true);
 assert.equal(bullets.length,0,'Warning windup precedes firing');
 for(let i=0;i<25;i++)special.tick(b,1,bullets);
 assert.equal(bullets.length,0);
 special.tick(b,1,bullets);assert.equal(bullets.length,3);
 assert.ok(bullets.every(v=>Math.abs(Math.hypot(v.vx,v.vy)-4.4)<1e-8&&v.life===135));
 assert.equal(b._b126Special,null);
}
const dead={x:0,y:0,alive:true},none=[];
special.fire(dead,0,none,10,7);special.fire(dead,0,none,10,7);special.fire(dead,0,none,10,7);
dead.alive=false;special.tick(dead,26,none);assert.equal(none.length,0,'Dead bosses cannot fire pending specials');
console.log('PASS PIRALI Beta 1.26: assets, syntax, campaign constraints, AI roles/index, 7/8/10 bosses, visual-only hit, minimap and unchanged 100/500 achievements');
