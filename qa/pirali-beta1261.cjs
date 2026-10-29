'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const scan=d=>fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(x=>x.isDirectory()?scan(d+'/'+x.name):[d+'/'+x.name]);
for(const v of ['play','dev']){
 const old='beta126-'+v,now='beta1261-'+v,changed=new Set(['index.html','js/runtime/game-init.js','js/menu.js','TEST_INFO.json']);
 const a=scan(old).map(x=>x.slice(old.length+1)).sort(),b=scan(now).map(x=>x.slice(now.length+1)).sort();
 assert.deepEqual(b,a.concat(['js/progression/player-identity.js','css/player-identity.css']).sort());
 for(const rel of a){
  if(rel.endsWith('.js'))new vm.Script(read(now+'/'+rel));
  if(!changed.has(rel))assert.equal(read(now+'/'+rel),read(old+'/'+rel),'Unintended change: '+rel);
 }
 const html=read(now+'/index.html'),game=read(now+'/js/runtime/game-init.js'),identity=read(now+'/js/progression/player-identity.js');
 new vm.Script(identity);
 assert.match(html,/1\.26\.1-classic/);
 assert.match(html,/player-identity\.js/);
 assert.match(html,/player-identity\.css/);
 assert.match(game,/PiraliPlayerIdentity\.requireName/);
 assert.doesNotMatch(game,/\bprompt\s*\(/);
 assert.equal(html.includes('js/preview-controls.js'),v==='dev');
 assert.equal(html.includes('window.PiraliAlpha014Test=true'),v==='dev');
 assert.doesNotMatch(read(now+'/js/menu.js'),/menu-replay|PiraliReplay/);
 const info=JSON.parse(read(now+'/TEST_INFO.json'));
 assert.equal(info.mandatoryRegistration.minimumLetters,3);
 assert.equal(info.mandatoryRegistration.skipAllowed,false);
}
console.log('PASS 1.26.1: preserved 1.26 assets/balance/stats/checkpoints; new registration and role flags');
