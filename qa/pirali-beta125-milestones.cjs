'use strict';
// Standalone milestone integration test: boot the production stats module in a minimal DOM.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const storage=new Map([['pirali_player_name','beta125-tester']]);
const localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v))};
const document={
 addEventListener(){},getElementById(){return null},querySelectorAll(){return []},
 createElement(){return {style:{},classList:{add(){},remove(){}},setAttribute(){},textContent:''}},
 body:{appendChild(){}}
};
const window={PiraliSeasonReleaseEnabled:false,PiraliVisualPreviewReadonly:false,
 PiraliCheckpoint:{get(){return null}},PiraliLanguage:{getLanguage(){return 'ka'}}};
const ctx={window,document,localStorage,Number,Math,Date,JSON,Object,Array,String,
 console,setTimeout(){return 0},clearTimeout(){},};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('beta125-play/js/progression/player-stats.js','utf8'),ctx);
const stats=window.PiraliStats;stats.start(false,1);
for(let i=0;i<99;i++)stats.kill();
assert.equal(stats.get().kills,99);
assert.ok(!stats.get().achievements.hundredKills);
for(let i=0;i<1;i++)stats.kill();
assert.ok(stats.get().achievements.hundredKills);
assert.ok(!stats.get().achievements.fiveHundredKills);
for(let i=0;i<399;i++)stats.kill();
assert.equal(stats.get().kills,499);
assert.ok(!stats.get().achievements.fiveHundredKills);
stats.kill();
assert.equal(stats.get().kills,500);
assert.ok(stats.get().achievements.fiveHundredKills);
// Old 10/50 flags never grant the new achievements below their real thresholds.
const key='pirali_personal_stats_beta_1_0_s1_rc';
const db=JSON.parse(storage.get(key));
db.profiles['beta125-tester'].kills=50;
db.profiles['beta125-tester'].achievements={tenKills:1,endless100:1};
storage.set(key,JSON.stringify(db));
assert.ok(!stats.get().achievements.hundredKills);
assert.ok(!stats.get().achievements.fiveHundredKills);
console.log('PASS 99/100, 499/500 and legacy achievement isolation');
