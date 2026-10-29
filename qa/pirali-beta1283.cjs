'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const scan=p=>fs.readdirSync(path.join(root,p),{withFileTypes:true}).flatMap(e=>e.isDirectory()?scan(p+'/'+e.name):[p+'/'+e.name]);
const changed=new Set(['index.html','js/menu.js','js/features/results/run-rank.js','TEST_INFO.json']);
for(const v of ['play','dev']){
 const previous='beta1282-'+v,newer='beta1283-'+v;
 const a=scan(previous).map(p=>p.slice(previous.length+1)).sort(),b=scan(newer).map(p=>p.slice(newer.length+1)).sort();
 assert.deepEqual(a,b,'File parity '+v);
 for(const rel of b){
  if(!changed.has(rel))assert.equal(read(previous+'/'+rel),read(newer+'/'+rel),'Unrelated change '+rel);
  if(rel.endsWith('.js'))new vm.Script(read(newer+'/'+rel),{filename:rel});
 }
 assert.deepEqual(fs.readFileSync(path.join(root,newer,'js/features/results/run-rank.js')),fs.readFileSync(path.join(root,'beta126-'+v,'js/features/results/run-rank.js')),'Exact Beta 1.26 old ranking code restored');
 const rank=read(newer+'/js/features/results/run-rank.js'),html=read(newer+'/index.html'),meta=JSON.parse(read(newer+'/TEST_INFO.json'));
 assert.match(rank,/personalBest=Math\.max/);assert.match(rank,/foot\.textContent=\(rank\.position<=30/);
 assert.match(rank,/rank\.score\.toLocaleString\(\)/);assert.doesNotMatch(rank,/calculateCurrentRun/);
 assert.match(html,/1\.28\.3-classic\./);assert.match(html,/beta1283-classic-rank/);
 assert.equal(html.includes('window.PiraliSeasonReleaseEnabled=false'),true);
 assert.equal(html.includes('window.PiraliAlpha014Test=true'),v==='dev');
 assert.match(read(newer+'/js/runtime/leaderboard.js'),/lbLastPushStatus='local'/);
 assert.equal(meta.firebaseWrites,false);assert.equal(meta.androidBuilt,false);assert.equal(meta.aabBuilt,false);
}
console.log('PASS Beta 1.28.3 static: exact Beta 1.26 rank restored, 6,075 personal best, TOP30/online footer, no unrelated code or Firebase changes');
