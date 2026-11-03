/* PIRALI 1.27: small capped roadside interactables. No stat, damage, loot or scoring changes. */
(function(){
'use strict';
const props=[];
const MAX=6;
function begin(){
 props.length=0;
 if(!Array.isArray(path)||path.length<6)return;
 const target=level===11?3:level===10?4:5;
 for(let i=0;i<path.length&&props.length<target;i++){
  const idx=2+i*3;if(idx>=path.length-2)break;
  const p=path[idx],prev=path[idx-1],next=path[idx+1];
  const dx=next.x-prev.x,dy=next.y-prev.y,l=Math.hypot(dx,dy)||1;
  const side=(i%2)?1:-1,offset=118+(i%3)*23;
  const x=p.x-side*dy/l*offset,y=p.y+side*dx/l*offset;
  const kind=i%3===0?'cart':i%3===1?'crate':'barricade';
  const r=kind==='cart'?32:kind==='barricade'?30:23;
  if(x<r+45||x>WW-r-45||y<r+45||y>WH-r-45)continue;
  if(dpth(x,y)<94||Math.hypot(x-P.x,y-P.y)<210)continue;
  if(Math.hypot(x-CHURCH_X,y-CHURCH_Y)<430)continue;
  if(trees.some(t=>Math.hypot(x-t.x,y-t.y)<r+t.r*.55+12))continue;
  if(enemies.some(e=>e.alive&&Math.hypot(x-e.x,y-e.y)<r+e.r+35))continue;
  props.push({x,y,r,kind,hp:kind==='crate'?2:kind==='cart'?4:Infinity,alive:true,flash:0});
 }
 // Level 11 is deliberately kept clear in the central five-wave combat space.
}
function hit(o){
 if(!o.alive||o.kind==='barricade')return false;
 o.hp--;o.flash=8;
 if(o.hp<=0){o.alive=false;
  for(let i=0;i<8;i++)if(typeof spawnPart==='function')spawnPart(o.x,o.y,(Math.random()-.5)*5,(Math.random()-.5)*5,12,'#bd8747',2);
 }return true;
}
function collide(actor){
 if(!actor)return;
 for(const o of props){
  if(!o.alive||Math.abs(o.x-actor.x)>o.r+actor.r+5||Math.abs(o.y-actor.y)>o.r+actor.r+5)continue;
  const dx=actor.x-o.x,dy=actor.y-o.y,dist=Math.hypot(dx,dy),limit=actor.r+o.r*.74;
  if(dist<limit){
   const ux=dist>.01?dx/dist:1,uy=dist>.01?dy/dist:0;
   actor.x=o.x+ux*limit;actor.y=o.y+uy*limit;
   actor.vx*=.5;actor.vy*=.5;
  }
 }
}
function sword(x,y,angle,range,arc){
 for(const o of props){
  if(!o.alive||o.kind==='barricade')continue;
  const dx=o.x-x,dy=o.y-y,d=Math.hypot(dx,dy);
  const diff=Math.atan2(Math.sin(Math.atan2(dy,dx)-angle),Math.cos(Math.atan2(dy,dx)-angle));
  if(d<range+o.r*.4&&Math.abs(diff)<=arc)hit(o);
 }
}
// Segment intersection: compare against earlier soldiers and generals so a crate
// behind the target cannot absorb a valid shot. Trees closer than the crate win.
function bullet(b,fromX,fromY){
 let best=Infinity,object=null;
 const tx=b.x,ty=b.y;
 for(const o of props){
  if(!o.alive)continue;
  const t=window.PiraliAim?.segmentCircle(fromX,fromY,tx,ty,o.x,o.y,o.r*.70);
  if(t!==null&&t!==undefined&&t<best){best=t;object=o;}
 }
 if(!object)return false;
 const near=(x,y,r)=>{
  const t=window.PiraliAim.segmentCircle(fromX,fromY,tx,ty,x,y,r);
  return t!==null&&t!==undefined&&t<best;
 };
 if(trees.some(t=>near(t.x,t.y,t.r*.48)))return false;
 if(b.fp){
  if(enemies.some(e=>e.alive&&near(e.x,e.y,e.r)))return false;
  if(boss?.alive&&near(boss.x,boss.y,boss.r))return false;
  const second=window.PiraliDualGenerals?.second?.();
  if(second?.alive&&near(second.x,second.y,second.r))return false;
 }else if(near(P.x,P.y,P.r+7))return false;
 b.alive=false;hit(object);object.flash=8;return true;
}
function tick(dt){for(const o of props)if(o.flash>0)o.flash=Math.max(0,o.flash-dt);}
function draw(ctx,sx,sy,w,h){
 for(const o of props){
  if(!o.alive)continue;
  const x=sx(o.x),y=sy(o.y);if(x<-65||y<-65||x>w+65||y>h+65)continue;
  ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(8,6,1,.30)';
  ctx.beginPath();ctx.ellipse(3,9,o.r+6,11,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=o.flash>0?'#f7d59a':'#76502c';ctx.strokeStyle='#2d1d14';ctx.lineWidth=3;
  if(o.kind==='crate'){
   ctx.fillRect(-21,-22,42,42);ctx.strokeRect(-21,-22,42,42);
   ctx.strokeStyle='#b88d52';ctx.lineWidth=5;
   ctx.beginPath();ctx.moveTo(-18,-19);ctx.lineTo(18,18);ctx.moveTo(18,-19);ctx.lineTo(-18,18);ctx.stroke();
  }else if(o.kind==='cart'){
   ctx.fillRect(-34,-17,68,28);ctx.strokeRect(-34,-17,68,28);
   ctx.fillStyle='#342922';for(const xw of [-23,23]){ctx.beginPath();ctx.arc(xw,20,10,0,Math.PI*2);ctx.fill();ctx.stroke();}
   ctx.strokeStyle='#d2ad73';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-29,-7);ctx.lineTo(29,-7);ctx.stroke();
  }else{
   for(let k=-1;k<=1;k++){ctx.fillRect(-30,-17+k*13,60,12);ctx.strokeRect(-30,-17+k*13,60,12);}
  }
  ctx.restore();
 }
}
const originalGen=genWorld;
genWorld=function(...args){const result=originalGen.apply(this,args);begin();return result;};
window.PiraliProps=Object.freeze({begin,collide,bullet,sword,tick,draw,
 get:()=>props.map(o=>({x:o.x,y:o.y,hp:o.hp,kind:o.kind,alive:o.alive})),debug:()=>({total:props.length,alive:props.filter(o=>o.alive).length,max:MAX})});
})();
