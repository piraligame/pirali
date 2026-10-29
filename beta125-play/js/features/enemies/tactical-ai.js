/* PIRALI Beta 1.24 - movement-only tactical AI. No changes to health, speed, damage or fire rate. */
(function(){
'use strict';
function heading(e,o){
 const {tx,ty,baseAng,flankAng,aliveEnemies,level,trees=[]}=o;
 if(e.isNPC||e.retreating||e.state!=='attack')return flankAng;
 if(level!==11&&e.seesSimona===false)return flankAng;
 const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);if(!Number.isFinite(d)||d<1)return flankAng;
 const ux=dx/d,uy=dy/d,side=(Number(e.groupId)||0)%2===0?1:-1;
 let x=ux,y=uy;
 if(e.etype==='rifle'){
  const forward=d<210?-.8:.92;
  x=ux*forward-uy*side*.38;y=uy*forward+ux*side*.38;
 }else if(e.etype==='officer'){
  const forward=d<235?-.27:.42;
  x=ux*forward-uy*side*.86;y=uy*forward+ux*side*.86;
 }else if(e.etype!=='saber'){
  x=Math.cos(flankAng);y=Math.sin(flankAng);
 }
 let ax=0,ay=0,n=0;
 for(const other of aliveEnemies){
  if(n>=12)break;
  if(other===e||!other.alive||other.isNPC)continue;
  const ox=e.x-other.x,oy=e.y-other.y;
  if(Math.abs(ox)>=60||Math.abs(oy)>=60)continue;
  const od=Math.hypot(ox,oy);if(od<1||od>=60)continue;
  const w=(60-od)/60;ax+=ox/od*w;ay+=oy/od*w;n++;
 }
 const ad=Math.hypot(ax,ay);
 if(ad>.001){const k=Math.min(.3,ad*.2);x+=ax/ad*k;y+=ay/ad*k;}
 let found=0;
 for(const tree of trees){
  if(found>=4)break;
  const ox=e.x-tree.x,oy=e.y-tree.y;
  if(Math.abs(ox)>100||Math.abs(oy)>100)continue;
  const td=Math.hypot(ox,oy),safe=(e.r||12)+tree.r*.43+24;
  if(td<1||td>=safe||(-ox*x-oy*y)<-10)continue;
  const w=(safe-td)/safe*.9;x+=ox/td*w;y+=oy/td*w;found++;
 }
 const moved=Math.hypot(e.x-(e._aiLastX??e.x),e.y-(e._aiLastY??e.y));
 e._aiStuck=moved<.16?Math.min(55,(e._aiStuck||0)+1):Math.max(0,(e._aiStuck||0)-4);
 e._aiLastX=e.x;e._aiLastY=e.y;
 if(e._aiStuck>12){x+=-uy*side*.8;y+=ux*side*.8;}
 return Math.hypot(x,y)>.001?Math.atan2(y,x):baseAng;
}
window.PiraliTacticalAI=Object.freeze({heading});
})();