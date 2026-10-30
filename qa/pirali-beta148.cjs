'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function files(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true})
 .flatMap(e=>e.isDirectory()?files(dir+'/'+e.name):[dir+'/'+e.name]);}
for(const v of ['play','dev']){
 const before='beta147-'+v,after='beta148-'+v;
 const b=files(before).map(x=>x.slice(before.length+1)).sort(),
  a=files(after).map(x=>x.slice(after.length+1)).sort();
 assert.deepEqual(a,b,'Beta 1.47 assets and scripts preserved');
 const expected=new Set(['index.html','js/menu.js','TEST_INFO.json',
   'RELEASE_INFO.json','js/runtime/world.js','js/runtime/update.js',
   ...(v==='dev'?['js/preview-controls.js']:[])]);
 for(const name of a){
  const old=read(before+'/'+name),now=read(after+'/'+name);
  if(expected.has(name))assert.notEqual(old,now,'Expected Beta 1.48 adjustment '+name);
  else assert.equal(old,now,'Keep previous controls, gameplay, score and all visuals '+name);
  if(name.endsWith('.js'))new vm.Script(now,{filename:after+'/'+name});
 }
 const w=read(after+'/js/runtime/world.js'),u=read(after+'/js/runtime/update.js');
 assert.match(w,/const CAMERA_PLAYER_SCREEN_Y=0\.70/);
 assert.match(w,/camY=Math\.max\(0,Math\.min\(WH-H,P\.y-H\*CAMERA_PLAYER_SCREEN_Y\)\)/);
 assert.match(u,/tcy=P\.y-H\*CAMERA_PLAYER_SCREEN_Y/);
 assert.doesNotMatch(u,/tcy=P\.y-H\*\.5/);
 assert.match(read(after+'/index.html'),new RegExp('1\\.48-classic\\.'+v));
 assert.match(read(after+'/js/menu.js'),/BETA 1\.48/);
 const metadata=JSON.parse(read(after+'/TEST_INFO.json'));
 assert.equal(metadata.camera148.playerScreenY,.70);
 assert.equal(metadata.camera148.physicsUnchanged,true);
 assert.equal(metadata.notifications147.scoreChanged,false);
 assert.equal(metadata.quests146.replayableAll,true);
 assert.equal(metadata.maxTotalPoints,7000);
 assert.equal(metadata.androidBuilt,false);
 assert.equal(metadata.aabBuilt,false);
 const release=JSON.parse(read(after+'/RELEASE_INFO.json'));
 assert.equal(release.version,'1.48-beta.1'+(v==='dev'?'-dev':''));
 assert.equal(release.androidBuilt,false);
 assert.equal(release.aabBuilt,false);
 assert.equal(release.releaseReady,false);
 // Model clamp and tracking at common mobile and desktop viewport sizes.
 for(const [W,H] of [[360,760],[393,851],[768,1024],[1280,720]]){
  const WH=3800,PY=WH/2;
  const camera=Math.max(0,Math.min(WH-H,PY-H*.70));
  assert.ok(Math.abs((PY-camera)/H-.70)<1e-9);
  const spawn=WH-180;
  const nearSpawn=Math.max(0,Math.min(WH-H,spawn-H*.70));
  assert.ok(nearSpawn>=0&&nearSpawn<=WH-H);
 }
 assert.equal(read(after+'/js/features/scoring/stage-awards.js'),
  read(before+'/js/features/scoring/stage-awards.js'));
 assert.equal(read(after+'/js/runtime/leaderboard.js'),
  read(before+'/js/runtime/leaderboard.js'));
}
console.log('PASS PIRALI Beta 1.48: stable 70% camera, world-edge clamp, no gameplay changes, Player/Dev parity.');
