'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const walk=p=>fs.readdirSync(path.join(root,p),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(p+'/'+e.name):[p+'/'+e.name]);
const changed=new Set(['index.html','js/menu.js','js/runtime/leaderboard.js','js/runtime/outcome.js','js/features/results/run-rank.js','TEST_INFO.json']);
for(const v of ['play','dev']){
 const before='beta128-'+v,after='beta1281-'+v;
 const prior=walk(before).map(x=>x.slice(before.length+1)).sort();
 const next=walk(after).map(x=>x.slice(after.length+1)).sort();assert.deepEqual(next,prior);
 for(const relative of next){
  if(!changed.has(relative))assert.equal(read(before+'/'+relative),read(after+'/'+relative),'Unexpected gameplay change '+relative);
  if(relative.endsWith('.js'))new vm.Script(read(after+'/'+relative),{filename:relative});
 }
 const html=read(after+'/index.html'),lb=read(after+'/js/runtime/leaderboard.js'),rank=read(after+'/js/features/results/run-rank.js'),outcome=read(after+'/js/runtime/outcome.js');
 assert.match(html,/1\.28\.1-classic\./);
 assert.match(lb,/lbLastPushStatus='local'/);
 assert.match(lb,/lbLastPushStatus==='local'/);
 assert.match(lb,/window\.PiraliSeasonReleaseEnabled!==true/);
 assert.match(lb,/method:'PUT'/); // Future true release keeps its original Firebase path.
 assert.match(lb,/const LB_PATH = FB_URL \+ '\/pirali_beta_rating'/);
 assert.match(rank,/if\(window\.PiraliSeasonReleaseEnabled!==true\)return/);
 assert.match(rank,/foot\.textContent=''/);
 assert.doesNotMatch(outcome,/BETA 1\.14 • Player Online/);
 assert.equal(html.includes('window.PiraliSeasonReleaseEnabled=false'),true);
 assert.equal(html.includes('window.PiraliAlpha014Test=true'),v==='dev');
 assert.doesNotMatch(read(after+'/js/menu.js'),/PiraliReplay|menu-replay|PiraliStatsBackup\?\.mount/);
 const info=JSON.parse(read(after+'/TEST_INFO.json'));assert.equal(info.firebaseWrites,false);
 assert.equal(info.androidBuilt,false);assert.equal(info.aabBuilt,false);
}
console.log('PASS Beta 1.28.1: false write error fixed, preview cloud untouched, extra online/best footer removed, both builds intact');
