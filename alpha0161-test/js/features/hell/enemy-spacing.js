/* PIRALI 0.16.1 — separate soldier distribution for the sixth stage.
   Core world.js already spawns 1/3 of the old Hell soldier count.
   This module redistributes those soldiers away from clusters and the gate. */
(function(){
'use strict';
function distribute(){
 if(level!==6||!Array.isArray(path)||path.length<8)return;
 const soldiers=enemies.filter(e=>e.alive&&e.etype!=='landlord');
 const occupied=enemies.filter(e=>e.alive&&e.etype==='landlord')
    .map(e=>({x:e.x,y:e.y}));
 for(let i=0;i<soldiers.length;i++){
   const e=soldiers[i];
   // Traverse the WHOLE route, from starting forest to the boss approach.
   const pIndex=2+Math.min(path.length-9,Math.floor(((i+.5)/soldiers.length)*(path.length-8)));
   const node=path[pIndex];
   if(!node)continue;
   let candidate=null;
   for(let tries=0;tries<18;tries++){
     const side=(i+tries)%2===0?1:-1;
     const lateral=70+Math.random()*150;
     const x=Math.max(45,Math.min(WW-45,node.x+side*lateral));
     const y=Math.max(310,Math.min(WH-170,node.y+(Math.random()-.5)*135));
     // Keep soldiers away from the boss/gate and from blocked trees.
     if(Math.hypot(x-CHURCH_X,y-CHURCH_Y)<360)continue;
     if(trees.some(t=>Math.hypot(t.x-x,t.y-y)<t.r*.42+e.r+9))continue;
     if(occupied.some(p=>Math.hypot(p.x-x,p.y-y)<100))continue;
     candidate={x,y};break;
   }
   // Even if a random spot cannot be found, keep spread by path position.
   const x=candidate?.x??Math.max(45,Math.min(WW-45,node.x+(i%2?94:-94)));
   const y=candidate?.y??node.y;
   e.x=x;e.y=y;e.vx=0;e.vy=0;
   e.patrol.cx=x;e.patrol.cy=y;
   e.patrol.radius=25+Math.random()*65;
   e.patrol.t=Math.random()*Math.PI*2;
   e.groupId='hell-spaced-'+i;
   occupied.push({x,y});
 }
}
const previousGenWorld=genWorld;
genWorld=function(...args){
 const result=previousGenWorld.apply(this,args);
 distribute();
 return result;
};
window.PiraliHellEnemies=Object.freeze({distribute});
})();
