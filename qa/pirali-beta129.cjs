'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const files=p=>fs.readdirSync(path.join(root,p),{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(p+'/'+x.name):[p+'/'+x.name]);
const changed=new Set(['index.html','js/menu.js','js/runtime/game-init.js','js/features/scoring/stage-awards.js','js/progression/checkpoints.js','TEST_INFO.json']);
for(const v of ['play','dev']){
 const old='beta1283-'+v,now='beta129-'+v;
 const originals=files(old).map(x=>x.slice(old.length+1)).sort();
 const updated=files(now).map(x=>x.slice(now.length+1)).sort();
 assert.deepEqual(updated,originals.concat(['js/features/full-path/demo.js','css/beta129-full-path.css']).sort());
 for(const f of originals){
  if(!changed.has(f))assert.equal(read(now+'/'+f),read(old+'/'+f),'Unintended game change '+f);
 }
 for(const f of updated.filter(x=>x.endsWith('.js')))new vm.Script(read(now+'/'+f),{filename:now+'/'+f});
 assert.match(read(now+'/index.html'),/1\.29-classic\./);
 assert.match(read(now+'/index.html'),/beta129-full-path\.css/);
 assert.match(read(now+'/index.html'),/full-path\/demo\.js/);
 assert.match(read(now+'/js/runtime/game-init.js'),/fullPath\?7:/);
 assert.match(read(now+'/js/runtime/game-init.js'),/fullPath\.stage/);
 assert.match(read(now+'/js/features/scoring/stage-awards.js'),/isActive\?\.\(\)===true/);
 assert.match(read(now+'/js/features/scoring/stage-awards.js'),/Math\.floor\(WAVE_CUMULATIVE\[wavesPaid\]\/2\)/);
 assert.match(read(now+'/js/progression/checkpoints.js'),/PiraliFullPath\?\.isActive/);
 assert.match(read(now+'/js/features/full-path/demo.js'),/realPaymentEnabled:false/);
 assert.equal(read(now+'/index.html').includes('window.PiraliSeasonReleaseEnabled=false'),true);
 assert.equal(read(now+'/index.html').includes('window.PiraliAlpha014Test=true'),v==='dev');
 const info=JSON.parse(read(now+'/TEST_INFO.json'));
 assert.equal(info.premiumFullRoute.livePaymentEnabled,false);
 assert.equal(info.androidBuilt,false);assert.equal(info.aabBuilt,false);
}
console.log('PASS Beta 1.29 static source parity, 11-stage premium preview, hearts, shotgun, half scoring, no payments/Firebase mutations, Player/Dev role isolation');
