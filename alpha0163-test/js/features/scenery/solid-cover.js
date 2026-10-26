/* PIRALI Alpha 0.16.3 DEV — 20% more SOLID cover in every level.
   Uses the real tree/rock/bush collision array; bullets are blocked by
   tree collisions already present in runtime/update.js. Wrap genWorld last,
   after stage-9 and stage-11 arena geometry has been prepared. */
(function(){
'use strict';
const EXTRA=.20;
function scatter(){
 const existing=trees.length;
 const target=Math.ceil(existing*EXTRA);
 let added=0,attempts=0;
 while(added<target&&attempts<target*95){
  attempts++;
  const x=70+Math.random()*(WW-140);
  const y=250+Math.random()*(WH-440);
  // Keep the road walkable and exits usable. In the siege, leave spawn
  // pockets near Simona; preserve the clean center of the endless arena.
  if(dpth(x,y)<119||Math.hypot(x-CHURCH_X,y-CHURCH_Y)<410)continue;
  const dist=Math.hypot(x-P.x,y-P.y);
  if(dist<(level===11?680:level===9?195:130))continue;
  const kind=['rock','bush','oak','pine','rock','bush'][added%6];
  const radius=kind==='rock'?20+Math.random()*13:
    kind==='bush'?15+Math.random()*10:23+Math.random()*16;
  if(trees.some(t=>Math.hypot(t.x-x,t.y-y)<t.r*.45+radius*.45+12))continue;
  if(enemies.some(e=>e.alive&&Math.hypot(e.x-x,e.y-y)<e.r+radius*.55+25))continue;
  if(boss?.alive&&Math.hypot(boss.x-x,boss.y-y)<90)continue;
  trees.push({x,y,r:radius,kind,off:Math.random()*6.28});
  added++;
 }
 window.PiraliCoverDensityLast={level,original:existing,added,target,total:trees.length};
}
const oldGen=genWorld;
genWorld=function(...args){
 const result=oldGen.apply(this,args);
 scatter();
 window.PiraliStageScoring?.enterStage();
 return result;
};
window.PiraliCoverDensity=Object.freeze({ratio:EXTRA});
})();
