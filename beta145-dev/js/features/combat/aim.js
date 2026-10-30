/* PIRALI Alpha 0.16.3k DEV — directional assisted aim + nearest impact.
   The hero never rotates to shoot someone BEHIND the weapon barrel.
   Player projectiles collide with the first blocking object along their
   travelled segment, including the main and secondary general. */
(function(){
'use strict';
const HALF_CONE=Math.PI*0.34; // ~61 degrees to either side of muzzle
function targetCandidates(){
 const list=enemies.filter(e=>e.alive);
 if(boss?.alive)list.push(boss);
 const second=window.PiraliDualGenerals?.target?.();
 if(second?.alive)list.push(second);
 const mission=window.PiraliEvolution139?.objectiveTarget?.();
 if(mission?.alive)list.push(mission);
 return list;
}
function angleDelta(a,b){return Math.atan2(Math.sin(a-b),Math.cos(a-b));}
function choose(x=P.x,y=P.y,facing=P.ang){
 let best=null,dist=Infinity;
 for(const obj of targetCandidates()){
  const dx=obj.x-x,dy=obj.y-y,centre=Math.hypot(dx,dy);
  const difference=Math.abs(angleDelta(Math.atan2(dy,dx),facing));
  // Broad initial forward cone, scaled by the target's apparent radius.
  if(difference>HALF_CONE+Math.atan2(obj.r||12,Math.max(1,centre)))continue;
  // Distance to the front edge, not centre, so a large boss standing
  // before ordinary troops is prioritized appropriately.
  const near=Math.max(0,centre-(obj.r||12));
  if(near<dist){dist=near;best=obj;}
 }
 return best?Math.atan2(best.y-y,best.x-x):facing;
}
function segmentCircle(x0,y0,x1,y1,x,y,r){
 // Broad-phase rejection: avoids quadratic math for off-screen/remote
 // solid scenery, important on the 80-enemy endless survival map.
 if(x<Math.min(x0,x1)-r||x>Math.max(x0,x1)+r||
    y<Math.min(y0,y1)-r||y>Math.max(y0,y1)+r)return null;
 const vx=x1-x0,vy=y1-y0,px=x0-x,py=y0-y;
 const a=vx*vx+vy*vy;
 if(a<1e-8)return px*px+py*py<=r*r?0:null;
 const b=2*(px*vx+py*vy),c=px*px+py*py-r*r;
 if(c<=0)return 0;
 const discriminant=b*b-4*a*c;
 if(discriminant<0)return null;
 const t=(-b-Math.sqrt(discriminant))/(2*a);
 return t>=0&&t<=1?t:null;
}
function bulletImpact(b,x0,y0){
 if(!b?.alive||!b.fp)return false;
 let earliest=Infinity,hitType=null,target=null;
 // Solid rocks, trees, bushes and graveyard crosses remain bullet shields.
 for(const tree of trees){
  const t=segmentCircle(x0,y0,b.x,b.y,tree.x,tree.y,tree.r*.48);
  if(t!==null&&t<earliest){earliest=t;hitType='cover';target=tree;}
 }
 for(const obj of targetCandidates()){
  const radius=(obj===boss||obj===window.PiraliDualGenerals?.target?.())?obj.r+6:obj.r+5;
  const t=segmentCircle(x0,y0,b.x,b.y,obj.x,obj.y,radius);
  if(t!==null&&t<earliest){earliest=t;hitType='enemy';target=obj;}
 }
 if(!hitType)return false;
 b.x=x0+(b.x-x0)*earliest;
 b.y=y0+(b.y-y0)*earliest;
 b.alive=false;
 if(hitType==='enemy'){
  if(target===window.PiraliEvolution139?.objectiveTarget?.()){
   window.PiraliEvolution139.hitQuestTarget(target,b);
  }else if(target===boss||target===window.PiraliDualGenerals?.target?.()){
   hitBoss(target,b.damage??1);
  }else hitEnemy(target,b.damage??1);
 }
 return true;
}
window.PiraliAim=Object.freeze({choose,bulletImpact,segmentCircle,angleDelta,cone:HALF_CONE});
})();