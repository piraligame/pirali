'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function all(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true})
  .flatMap(e=>e.isDirectory()?all(dir+'/'+e.name):[dir+'/'+e.name]);}
for(const variant of ['play','dev']){
 const old='beta148-'+variant,now='beta149-'+variant;
 const original=all(old).map(x=>x.slice(old.length+1)).sort();
 const next=all(now).map(x=>x.slice(now.length+1)).sort();
 assert.deepEqual(next,original,'Maintain the full Beta 1.48 source and assets');
 const expected=new Set(['index.html','js/menu.js','TEST_INFO.json',
  'RELEASE_INFO.json','js/runtime/render.js',...(variant==='dev'?['js/preview-controls.js']:[])]);
 for(const file of original){
  const before=read(old+'/'+file),after=read(now+'/'+file);
  if(expected.has(file))assert.notEqual(after,before,'Expected visual/label update '+file);
  else assert.equal(after,before,'Unchanged game physics, camera, controls and scoring '+file);
  if(file.endsWith('.js'))new vm.Script(after,{filename:now+'/'+file});
 }
 const render=read(now+'/js/runtime/render.js');
 assert.match(render,/function drawEquippedShieldEmblem\(context,x,y,tick\)/);
 assert.match(render,/if\(inventory\.laurelShield===1\)drawEquippedShieldEmblem\(ctx,sx\(P\.x\),sy\(P\.y\)-42,frame\)/);
 assert.doesNotMatch(render,/glowing GOLDEN half-circle/);
 assert.doesNotMatch(render,/ctx\.arc\(px,py,spread/);
 assert.match(render,/context\.fillStyle='#2b7f6a'/);
 assert.match(render,/context\.strokeStyle='#d8efdf'/);
 assert.match(read(now+'/index.html'),new RegExp('1\\.49-classic\\.'+variant));
 assert.match(read(now+'/index.html'),/js\/runtime\/render\.js\?v=beta149-shield-badge/);
 assert.match(read(now+'/js/menu.js'),/BETA 1\.49/);
 const a=JSON.parse(read(now+'/TEST_INFO.json'));
 assert.equal(a.shield149.oldGoldArcRemoved,true);
 assert.equal(a.shield149.oneHitMechanicUnchanged,true);
 assert.equal(a.camera148.playerScreenY,.70);
 assert.equal(a.quests146.replayableAll,true);
 assert.equal(a.androidBuilt,false);
 const release=JSON.parse(read(now+'/RELEASE_INFO.json'));
 assert.equal(release.version,'1.49-beta.1'+(variant==='dev'?'-dev':''));
 assert.equal(release.releaseReady,false);
 assert.equal(release.androidBuilt,false);
 assert.equal(release.aabBuilt,false);
 assert.equal(read(now+'/js/runtime/combat.js'),read(old+'/js/runtime/combat.js'));
 assert.equal(read(now+'/js/features/loot/laurel-shield.js'),read(old+'/js/features/loot/laurel-shield.js'));
 assert.equal(read(now+'/js/features/scoring/stage-awards.js'),read(old+'/js/features/scoring/stage-awards.js'));
 assert.equal(read(now+'/js/runtime/leaderboard.js'),read(old+'/js/runtime/leaderboard.js'));
}
console.log('PASS Beta 1.49: lightweight green/silver overhead shield; no yellow arc; 1-use protection, 70% camera and Player/Dev preserved.');
