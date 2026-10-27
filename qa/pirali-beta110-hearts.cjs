'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');

const priorMultiplier=1.15;
const requestedRelativeIncrease=0.20;
const updatedMultiplier=1.38;
const baseHealthChance=0.40*0.99; // from PiraliDropBalance config in BETA 1.10.
assert(Math.abs((updatedMultiplier/priorMultiplier-1)-requestedRelativeIncrease)<1e-12,
  'Beta 1.10.1 must be 20% higher than previous stage-11 heart chance');
const sha=[];
for(const role of ['play','dev']){
 const root=path.join(__dirname,'..','beta110-'+role);
 const oldRoot=path.join(__dirname,'..','beta1092-'+role);
 const waves=fs.readFileSync(path.join(root,'js/features/endless/waves.js'),'utf8');
 const old=fs.readFileSync(path.join(oldRoot,'js/features/endless/waves.js'),'utf8');
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const drop=fs.readFileSync(path.join(root,'js/features/loot/drop-balance.js'),'utf8');
 const metadata=JSON.parse(fs.readFileSync(path.join(root,'RELEASE_INFO.json'),'utf8'));
 const match=waves.match(/const HEART_RESTOCK_MULTIPLIER=([0-9.]+);/);
 assert(match, role+': missing heart supply multiplier');
 assert.equal(Number(match[1]),updatedMultiplier,role+': 1.38 multiplier missing');
 assert.match(waves,/endlessHealthChance\*HEART_RESTOCK_MULTIPLIER/);
 assert.match(waves,/type:i===0&&Math\.random\(\)</);
 assert(!old.includes('HEART_RESTOCK_MULTIPLIER'));
 assert.match(waves,/const CAP=10,FINAL_WAVE=5;/);
 assert.match(waves,/wasOutsideHouse/);
 assert.match(waves,/if\(!live\|\|level!==11\|\|P\.dead\|\|!running\)return;/);
 assert.match(drop,/endlessHealthChance:\.40\*CONFIG\.heartMultiplier/);
 assert.match(drop,/heartMultiplier:\.99,/);
 assert(Math.abs(baseHealthChance*updatedMultiplier-(baseHealthChance*priorMultiplier*1.2))<1e-10);
 assert.equal(metadata.stage11HealingPickupIncreaseRelative,0.38);
 assert.equal(metadata.stage11HealingPickupIncreaseOverBeta110,0.20);
 assert.equal(metadata.stage11HealingSupplyMultiplier,1.38);
 assert.equal(metadata.scoreLimits.total,7000);
 assert.equal(metadata.maxHealthUpgrades.stage10,'Devil large heart: 6→7');
 assert.equal(metadata.stage11EnemiesPerWave,10);
 assert.equal(metadata.stage11MaxWaves,5);
 const version=role==='play'?'1.10.1-beta.1':'1.10.1-beta.1-dev';
 assert.equal(metadata.version,version,role+': release metadata version missing');
 assert(html.includes("window.PiraliGameVersion='"+version+"'"),role+': runtime version missing');
 assert(html.includes('js/features/endless/waves.js?v=beta1101-stage11-hearts-20'),role+': browser caching stale supply script');
 assert(fs.existsSync(path.join(root,'js/features/map/live-minimap.js')));
 assert(fs.existsSync(path.join(root,'js/features/loot/large-heart.js')));
 if(role==='play')assert(!html.includes('<script src="js/preview-controls.js'));
 else assert(html.includes('<script src="js/preview-controls.js'));
 sha.push(waves);
 console.log('PASS BETA 1.10.1 '+role+': stage-11 +20% vs BETA 1.10, unchanged 7-HP cap, 5 waves and 1–10 stage baseline');
}
assert.equal(sha[0],sha[1],'Player/Developer balance script differs');
console.log('PASS BETA 1.10.1: Player/Developer consistent');
