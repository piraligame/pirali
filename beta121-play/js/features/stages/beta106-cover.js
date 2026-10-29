/* PIRALI BETA 1.06 — +20% extra roadside solid trees for sixth stage. */
(function(){
'use strict';
const original=genWorld;
function add(){
 if(level!==6)return;
 const initial=trees.length,goal=Math.round(initial*.20);
 let added=0;
 for(let step=0;step<goal*65&&added<goal;step++){
  const seg=2+Math.floor(Math.random()*(path.length-6));
  const a=path[seg],b=path[seg+1];
  if(!a||!b)continue;
  const r=Math.random(),px=a.x+(b.x-a.x)*r,py=a.y+(b.y-a.y)*r;
  const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
  const side=step%2?1:-1,d=133+Math.random()*92;
  const x=px+side*(-dy/len)*d,y=py+side*(dx/len)*d;
  if(x<75||x>WW-75||y<250||y>WH-220)continue;
  if(dpth(x,y)<119||Math.hypot(x-CHURCH_X,y-CHURCH_Y)<390)continue;
  if(trees.some(t=>Math.hypot(t.x-x,t.y-y)<t.r*.45+28))continue;
  if(enemies.some(e=>e.alive&&Math.hypot(e.x-x,e.y-y)<e.r+45))continue;
  const radius=19+Math.random()*14;
  trees.push({x,y,r:radius,kind:added%3===0?'oak':'pine',off:Math.random()*6.28});
  added++;
 }
 window.PiraliStageSixCover=Object.freeze({before:initial,added,goal,after:trees.length});
}
genWorld=function(...args){const result=original.apply(this,args);add();return result;};
})();