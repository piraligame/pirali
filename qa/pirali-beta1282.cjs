'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const scan=p=>fs.readdirSync(path.join(root,p),{withFileTypes:true}).flatMap(e=>e.isDirectory()?scan(p+'/'+e.name):[p+'/'+e.name]);
const changed=new Set(['index.html','js/menu.js','js/features/results/run-rank.js','TEST_INFO.json']);
for(const v of ['play','dev']){
 const older='beta1281-'+v,newer='beta1282-'+v;
 const a=scan(older).map(p=>p.slice(older.length+1)).sort(),b=scan(newer).map(p=>p.slice(newer.length+1)).sort();
 assert.deepEqual(a,b);
 for(const rel of a){
  if(!changed.has(rel))assert.equal(read(older+'/'+rel),read(newer+'/'+rel),'Unwanted modification: '+rel);
  if(rel.endsWith('.js'))new vm.Script(read(newer+'/'+rel),{filename:newer+'/'+rel});
 }
 const index=read(newer+'/index.html'),rank=read(newer+'/js/features/results/run-rank.js');
 assert.match(index,/PiraliGameVersion='1\.28\.2-classic\./);
 assert.match(index,/beta1282-rank-only/);
 assert.match(rank,/calculateCurrentRun/);
 assert.match(rank,/სავარაუდო ადგილი/);
 assert.doesNotMatch(rank,/if\(window\.PiraliSeasonReleaseEnabled!==true\)return;/);
 assert.match(rank,/foot\.textContent='';/);
 assert.match(read(newer+'/js/runtime/leaderboard.js'),/lbLastPushStatus='local'/);
 assert.equal(index.includes('window.PiraliSeasonReleaseEnabled=false'),true);
 assert.equal(index.includes('window.PiraliAlpha014Test=true'),v==='dev');
 const info=JSON.parse(read(newer+'/TEST_INFO.json'));
 assert.equal(info.firebaseWrites,false);
}
console.log('PASS Beta 1.28.2 static: restores result placement, retains original score & removes footer, no Firebase write, all prior gameplay unchanged');
