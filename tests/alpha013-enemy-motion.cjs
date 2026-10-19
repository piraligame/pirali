/* Offline guards for Alpha 0.13 enemy artwork. No server, network or Firebase. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const script=fs.readFileSync(path.join(root,'js/characters/enemy-motion-alpha013.js'),'utf8');
const rawName='\u10e1\u10d8\u10db\u10dd\u10dc\u10d0 \u10d3\u10dd\u10da\u10d8\u10eb\u10d4';
const badName='\u10e1\u10d8\u10db\u10dd\u10dc\u10d0 \u10d3\u10d0\u10da\u10d8\u10eb\u10d4';
for(const rel of ['index.html','Index2.html','js/runtime/ui.js','js/i18n.js','js/game.js']){
 const contents=fs.readFileSync(path.join(root,rel),'utf8');
 if(!contents.includes(rawName)||contents.includes(badName))throw Error('Incorrect Georgian name '+rel);
}
let ms=1000;
const scope={window:{},performance:{now:()=>ms},Math};
vm.runInNewContext(script,scope,{filename:'enemy-motion-alpha013.js'});
const m=scope.window.PiraliEnemyMotion;
if(!m||m.roles.join(',')!=='sword,rifle,officer,general')throw Error('Expected all four enemy types');
function assert(ok,label){if(!ok)throw Error(label);}
for(const kind of m.roles){
 const e={x:118,y:210,vx:.45,vy:.22,ang:-.9,sT:3,hf:0,state:'attack',retreating:false};
 const original=JSON.stringify(e),old=m.sample(e,kind);ms+=40;
 const pose=m.sample(e,kind);
 assert(pose?.active&&pose.kind===kind&&pose.activity>.1,'No dynamic animation '+kind);
 assert(pose.impact>=0&&Number.isFinite(pose.bank)&&Number.isFinite(pose.stride),'Broken overhead pose '+kind);
 assert(JSON.stringify(e)===original,'Graphic controller mutated game state for '+kind);
 if(kind==='rifle'||kind==='officer'){
  e.sT=90;ms+=20;
  const shot=m.sample(e,kind);
  assert(shot.flash>0&&shot.kick>0,'Weapon response missing '+kind);
 }
 ms+=80;
}
m.enable(false);
assert(!m.enabled()&&m.sample({vx:1,vy:1,ang:0},'sword')===null,'Toggle OFF failed');
m.enable(true);
assert(m.enabled(),'Toggle ON failed');
console.log('ALPHA013_ENEMY_NAME_AND_MOTION_OFFLINE_PASS');