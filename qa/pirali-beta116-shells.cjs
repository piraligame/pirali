/* PIRALI Beta 1.16 WIP — shotgun quantity regression tests (Player + Developer).
   Run: node qa/pirali-beta116-shells.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
for(const kind of ['play','dev']){
 const base=path.join(root,'beta116-'+kind);
 const gearPath=path.join(base,'js/config/alpha-gear-v2.js');
 const checkpointPath=path.join(base,'js/progression/checkpoints.js');
 const gearSource=fs.readFileSync(gearPath,'utf8');
 const checkpointSource=fs.readFileSync(checkpointPath,'utf8');
 for(const p of [gearPath,checkpointPath]){
  const check=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});
  assert.equal(check.status,0,p+' syntax failure: '+check.stderr);
 }
 assert.match(checkpointSource,/shellGrantBase:int\(raw\.shotgun\.shellGrantBase,0,1000000\)/);
 assert.match(checkpointSource,/shotgun:window\.PiraliAlphaGear\?\.status\?\.\(\)/);
 const mockDocument={
  readyState:'loading',
  head:{appendChild(){}},
  createElement(){return {style:{},textContent:''};},
  addEventListener(){},
  getElementById(){return null;}
 };
 const mockWindow={PiraliLanguage:{getLanguage:()=> 'ka'}};
 const sandbox={window:mockWindow,document:mockDocument,Math,Date};
 vm.runInNewContext(gearSource,sandbox,{filename:gearPath,timeout:500});
 const gear=mockWindow.PiraliAlphaGear;
 assert.ok(gear,'gear API missing');
 gear.reset();
 assert.equal(gear.status().shells,0);
 assert.equal(gear.status().shellGrantBase,0);
 assert.equal(gear.pickup({type:'alpha-shotgun',x:0,y:0}),true);
 assert.equal(gear.status().shells,3,'initial 4 shells become 3');
 assert.equal(gear.status().shellGrantBase,4);
 const gained=[3];
 for(const expected of [3,4,3,4]){
  gear.restore({...gear.status(),shells:0});
  assert.equal(gear.pickup({type:'alpha-shells',x:0,y:0}),true);
  const actual=gear.status().shells;
  gained.push(actual);
  assert.equal(actual,expected,'cumulative rounding gives balanced integer rewards');
 }
 assert.equal(gained.reduce((x,y)=>x+y,0),17,'five 4-shell awards become exactly 17 (-15%)');
 assert.equal(gear.status().shellGrantBase,20);
 gear.restore({owned:true,shells:6,selected:'shotgun'});
 assert.equal(gear.status().shells,6,'legacy checkpoint shells survive');
 assert.ok(Number.isInteger(gear.status().shellGrantBase),'legacy checkpoint fallback');
 gear.restore({owned:true,shells:15,selected:'shotgun',shellGrantBase:12});
 gear.pickup({type:'alpha-shells',x:0,y:0});
 assert.equal(gear.status().shells,16,'shell capacity stays 16');
 assert.equal(gear.status().shellGrantBase,16,'counter advances even at shell cap');
 gear.reset();
 assert.equal(gear.status().shellGrantBase,0,'fresh run resets ledger');
 const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
 assert.ok(html.includes('js/config/alpha-gear-v2.js'),'gear script remains loaded');
 const mauser=fs.readFileSync(path.join(base,'js/features/loot/drop-balance.js'),'utf8');
 assert.ok(mauser.includes('bulletMultiplier:1.32'),'Mauser loot untouched');
 console.log('PASS Beta 1.16 shotgun & checkpoint QA: '+kind);
}
console.log('PASS Beta 1.16: 2 variants, cumulative -15% and backwards-compatible checkpoints');
