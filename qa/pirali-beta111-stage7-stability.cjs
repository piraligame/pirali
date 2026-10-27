'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function simulate(source,stage){
  const guards = Array.from({length:4},(_,i)=>({
    x:1000+(i%2?180:-180),y:260+i*60,hp:10,maxHp:10,
    patrol:{cx:1000,cy:260+i*60},groupId:'church-guard-'+i
  }));
  const regular = Array.from({length:15},(_,i)=>({
    x:1000,y:3510-i*175,hp:10,maxHp:10,patrol:{cx:1000,cy:3510-i*175},
    groupId:'road-'+i
  }));
  const boss={alive:true,hp:10,maxHp:10,enrageHp:4};
  const ctx={
    level:stage,WW:2000,WH:3800,CHURCH_Y:120,
    path:Array.from({length:31},(_,i)=>({x:1000+Math.sin(i)*100,y:3700-i*110})),
    enemies:[...regular,...guards],boss,window:{PiraliDualGenerals:{second:()=>null}},
    Math,Object,Number,Set,genWorld:()=>true
  };
  vm.runInNewContext(source,ctx,{timeout:3000});
  assert.equal(ctx.genWorld(),true);
  return {ctx,guards,regular};
}

const variants=[];
for(const role of ['play','dev']){
  const dir=path.join(__dirname,'..','beta111-'+role);
  const baseline=path.join(__dirname,'..','beta110-'+role);
  const code=fs.readFileSync(path.join(dir,'js/features/stages/beta105-balance.js'),'utf8');
  const prior=fs.readFileSync(path.join(baseline,'js/features/stages/beta105-balance.js'),'utf8');
  const update=fs.readFileSync(path.join(dir,'js/runtime/update.js'),'utf8');
  const oldUpdate=fs.readFileSync(path.join(baseline,'js/runtime/update.js'),'utf8');
  const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
  const data=JSON.parse(fs.readFileSync(path.join(dir,'RELEASE_INFO.json'),'utf8'));

  const fresh=simulate(code,7),old=simulate(prior,7);
  assert.equal(fresh.ctx.enemies.length,Math.round(old.ctx.enemies.length*.90),'stage 7 enemy count must be 90% of previous');
  assert(fresh.ctx.enemies.every(e=>Math.hypot(e.x-1000,e.y-3620)>=700),'stage 7 player spawn not clear');
  assert(fresh.ctx.enemies.slice(-4).every((e,i)=>e===fresh.guards[i]),'stage 7 church guards were removed');
  assert.equal(fresh.ctx.window.PiraliStageSevenTuning.churchGuardsPreserved,4);
  assert.equal(fresh.ctx.window.PiraliStageSevenTuning.startingEnemyClearRadius,700);
  assert(Math.abs(fresh.ctx.enemies[0].hp/old.ctx.enemies[0].hp-.90)<.001,'soldier HP not reduced 10%');
  assert(Math.abs(fresh.ctx.boss.hp/old.ctx.boss.hp-.90)<.001,'general HP not reduced 10%');
  assert(Math.abs(fresh.ctx.window.PiraliStageTuning.attack(7)/old.ctx.window.PiraliStageTuning.attack(7)-.90)<1e-10,'attack not reduced 10%');
  assert(update.includes('hp:level===7?.81:.90,maxHp:level===7?.81:.90'),'stage 7 summoned soldier not nerfed');
  assert(oldUpdate.includes('r:12,hp:.90,maxHp:.90'),'old reinforcement baseline changed');

  for(const n of [1,2,3,4,5,6,8,9,10,11]){
    const a=simulate(code,n),b=simulate(prior,n);
    assert.equal(a.ctx.enemies.length,b.ctx.enemies.length,'other stage enemy count changed: '+n);
    assert.equal(a.ctx.enemies[0].hp,b.ctx.enemies[0].hp,'other stage HP changed: '+n);
    assert.equal(a.ctx.boss.hp,b.ctx.boss.hp,'other stage boss HP changed: '+n);
    assert.equal(a.ctx.window.PiraliStageTuning.attack(n),b.ctx.window.PiraliStageTuning.attack(n),'other stage attack changed: '+n);
  }
  const version=role==='play'?'1.11-beta.1':'1.11-beta.1-dev';
  assert.equal(data.version,version,'wrong BETA 1.11 version');
  assert.equal(data.stage7.enemyCountMultiplierFromBeta1102,0.90);
  assert.equal(data.stage7.startingEnemyClearRadius,700);
  assert.equal(data.stage7.bossAndLargeHeartRequired,true);
  assert.equal(data.stage11HealingSupplyMultiplier,1.38);
  assert.equal(data.scoreLimits.total,7000);
  assert.equal(data.maxHealthUpgrades.stage7,'General large heart: 5→6');
  assert(html.includes("window.PiraliGameVersion='"+version+"'"),'HTML version stale');
  assert(html.includes('js/features/stages/beta105-balance.js?v=beta111-stage7-20261027'),'stage 7 script cache stale');
  assert(html.includes('js/runtime/update.js?v=beta111-stage7-reinforcements'),'reinforcement script cache stale');
  assert(fs.existsSync(path.join(dir,'assets/maps/pirali-approved.webp')),'missing HD map');
  assert(fs.statSync(path.join(dir,'assets/maps/pirali-approved.webp')).size>700000,'HD map compressed');
  assert(fs.existsSync(path.join(dir,'js/features/map/live-minimap.js')),'mini-map missing');
  assert(fs.existsSync(path.join(dir,'js/features/loot/large-heart.js')),'big heart missing');
  if(role==='play')assert(!html.includes('<script src="js/preview-controls.js'),'DEV controls in Player');
  else assert(html.includes('<script src="js/preview-controls.js'),'DEV controls not present');
  variants.push(code,update);
  console.log('PASS BETA 1.11 '+role+': -10% stage 7 soldiers/HP/attack; safe spawn; guards, boss, hearts preserved');
}
assert.equal(variants[0],variants[2],'Player and Developer battle scripts differ');
assert.equal(variants[1],variants[3],'Player and Developer reinforcement scripts differ');
console.log('PASS BETA 1.11 11-STAGE REGRESSIONS');
