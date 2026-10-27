'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const scriptPair = [];
function simulateBalance(source, stage, count = 32) {
  const ctx = {
    level: stage, WW: 2000, WH: 3800, boss: null, window: {},
    enemies: Array.from({length:count}, (_,i)=>({
      x:1000, y:3620-i*95, hp:10, maxHp:10, alive:true
    })),
    genWorld(){ return 'generated'; }
  };
  vm.runInNewContext(source, ctx, {timeout:2000});
  assert.equal(ctx.genWorld(), 'generated');
  return ctx;
}
function simulateDrop(source, stage, roll) {
  const fixedMath=Object.create(Math);
  fixedMath.random=()=>roll;
  const ctx={level:stage,window:{},Math:fixedMath};
  vm.runInNewContext(source, ctx, {timeout:2000});
  return ctx.window.PiraliDropBalance;
}

for(const role of ['play','dev']) {
  const root = path.join(__dirname,'..','beta110-'+role);
  const balance=fs.readFileSync(path.join(root,'js/features/stages/beta105-balance.js'),'utf8');
  const drop=fs.readFileSync(path.join(root,'js/features/loot/drop-balance.js'),'utf8');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const waves=fs.readFileSync(path.join(root,'js/features/endless/waves.js'),'utf8');
  const meta=JSON.parse(fs.readFileSync(path.join(root,'RELEASE_INFO.json'),'utf8'));

  const s6=simulateBalance(balance,6);
  const oldCount=Math.round(32*.81);
  assert.equal(oldCount,26,'previous stage 6 count fixture changed');
  assert.equal(s6.enemies.length,Math.round(32*.81*.90),role+': stage 6 must reduce enemy count by another ~10%');
  assert(s6.enemies.length<oldCount,role+': stage 6 was not reduced');
  assert(s6.enemies.every(e=>Math.hypot(e.x-1000,e.y-3620)>=660),
    role+': enemy remains inside the protected starting area');
  assert(s6.enemies[0].y>s6.enemies.at(-1).y,
    role+': survivors should remain distributed along the entire route');
  assert.equal(s6.window.PiraliStageSixSpacing.spawnClearRadius,660);
  assert.equal(s6.window.PiraliStageSixTuning,undefined);

  for(const stage of [1,2,3,4,5,7,8,9,10,11]) {
    const v=simulateBalance(balance,stage);
    assert.equal(v.enemies.length,32,role+': stage '+stage+' enemy count changed unexpectedly');
  }
  const s6droprate=simulateDrop(drop,6,0.14);
  const s5droprate=simulateDrop(drop,5,0.14);
  const s11droprate=simulateDrop(drop,11,0.14);
  assert.equal(s6droprate.rollEnemyDrop(),'health',role+': stage 6 heart probability not increased');
  assert.equal(s5droprate.rollEnemyDrop(),'ammo',role+': stage 5 heart probability changed');
  assert.equal(s11droprate.rollEnemyDrop(),'ammo',role+': stage 11 heart probability changed');
  const baseChance=s6droprate.healthChance;
  assert(baseChance*1.20>0.14 && baseChance<0.14,
    role+': incorrect +20% relative health-drop chance');
  assert.equal(s6droprate.ammoChance,s5droprate.ammoChance,role+': bullet probability changed');
  assert.equal(meta.stage6.additionalEnemiesReductionFrom1101,0.10);
  assert.equal(meta.stage6.enemyHealthDropChanceIncreaseRelative,0.20);
  assert.equal(meta.stage6.minInitialEnemyDistanceWorldUnits,660);
  assert.equal(meta.scoreLimits.total,7000);
  assert.equal(meta.stage11HealingSupplyMultiplier,1.38);
  assert.match(waves,/const HEART_RESTOCK_MULTIPLIER=1\.38;/);
  assert(html.includes('js/features/loot/drop-balance.js?v=beta1102-stage6-hearts'));
  assert(html.includes('js/features/stages/beta105-balance.js?v=beta1102-stage6-density'));
  const expectedVersion=role==='play'?'1.10.2-beta.1':'1.10.2-beta.1-dev';
  assert.equal(meta.version,expectedVersion);
  assert(html.includes("window.PiraliGameVersion='"+expectedVersion+"'"));
  assert(fs.existsSync(path.join(root,'assets/maps/pirali-approved.webp')));
  assert(fs.existsSync(path.join(root,'js/features/map/live-minimap.js')));
  if(role==='play')assert(!html.includes('<script src="js/preview-controls.js'));
  else assert(html.includes('<script src="js/preview-controls.js'));
  scriptPair.push(balance,drop);
  console.log('PASS BETA 1.10.2 '+role+': -10% stage-6 foes, clear start, +20% hearts; other levels intact');
}
assert.equal(scriptPair[0],scriptPair[2],'Player/Developer enemy tuning differs');
assert.equal(scriptPair[1],scriptPair[3],'Player/Developer drop tuning differs');
console.log('PASS ALL BETA 1.10.2 STAGE 6 CHECKS');
