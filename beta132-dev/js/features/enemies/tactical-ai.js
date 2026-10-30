/* PIRALI Beta 1.32: refined three-role movement-only squad AI + spatial indexing.
 * Keeps every enemy's existing HP, move-speed multiplier, shot timing, damage and detection.
 * Grid is rebuilt once per update; static tree index is rebuilt only for a new world. */
(function(){
'use strict';
const ES=96,TS=110;
let enemyGrid=new Map(), treeGrid=new Map(), treeRef=null, treeLength=-1;
let currentFrame=-1, checks=0;
const key=(x,y)=>x+','+y;
function cells(grid,x,y,cell,r){
 const result=[],lowX=Math.floor((x-r)/cell),maxX=Math.floor((x+r)/cell);
 const lowY=Math.floor((y-r)/cell),maxY=Math.floor((y+r)/cell);
 for(let cx=lowX;cx<=maxX;cx++)for(let cy=lowY;cy<=maxY;cy++){
  const found=grid.get(key(cx,cy));if(found)for(const item of found)result.push(item);
 }
 return result;
}
function index(items,size){
 const grid=new Map();
 for(const item of items){if(!item||!Number.isFinite(item.x)||!Number.isFinite(item.y))continue;
  const k=key(Math.floor(item.x/size),Math.floor(item.y/size));
  let b=grid.get(k);if(!b){b=[];grid.set(k,b);}b.push(item);
 }
 return grid;
}
function prepare(alive,trees,frame){
 if(frame!==currentFrame){enemyGrid=index(alive,ES);currentFrame=frame;}
 if(treeRef!==trees||treeLength!==trees.length){
  treeRef=trees;treeLength=trees.length;treeGrid=index(trees,TS);
 }
}
function nearbyTrees(x,y,r=90){return cells(treeGrid,x,y,TS,r)}
function stableSide(e){
 if(e._b126Side)return e._b126Side;
 const g=String(e.groupId??'0');
 let h=0;for(let i=0;i<g.length;i++)h=(h*31+g.charCodeAt(i))|0;
 e._b126Side=((h+(Math.floor(e.x/90)^Math.floor(e.y/90)))&1)?1:-1;
 return e._b126Side;
}
function heading(e,o){
 const {tx,ty,baseAng,flankAng,aliveEnemies,level,trees=[]}=o;
 if(e.isNPC||e.retreating||e.state!=='attack')return flankAng;
 if(level!==11&&e.seesSimona===false)return flankAng;
 // Recompute tactical steering every other frame; cached heading reduces CPU on budget phones.
 if((currentFrame&1)===1&&Number.isFinite(e._b126Angle))return e._b126Angle;
 const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);
 if(!Number.isFinite(d)||d<1)return flankAng;
 const ux=dx/d,uy=dy/d,side=stableSide(e);
 let x=ux,y=uy;
 const neighbors=cells(enemyGrid,e.x,e.y,ES,190);
 let frontSaber=null,frontD=Infinity;
 let ax=0,ay=0,separated=0;
 for(const other of neighbors){
  checks++;
  if(other===e||!other.alive||other.isNPC)continue;
  const ox=e.x-other.x,oy=e.y-other.y;
  const dist2=ox*ox+oy*oy;
  if(dist2>1&&dist2<3600){
   const od=Math.sqrt(dist2),w=(60-od)/60;
   ax+=ox/od*w;ay+=oy/od*w;separated++;
  }
  // Rifles use a nearby sword fighter as moving cover, instead of lining up on Simona.
  if(e.etype==='rifle'&&other.etype==='saber'){
   const odx=other.x-e.x,ody=other.y-e.y,dist=Math.hypot(odx,ody);
   if(dist<145&&dist<frontD&&odx*ux+ody*uy>18){frontSaber=other;frontD=dist;}
  }
 }
 if(e.etype==='rifle'){
  // Yellow riflemen hold a firing band with hysteresis to prevent jitter.
  // Steering changes only; the update() speed and fire cadence are untouched.
  const range=e._b132HoldRange||225;
  const forward=d<range-32?-.82:d>range+38?.91:0;
  const orbit=.28+(forward===0?.12:0);
  x=ux*forward-uy*side*orbit;y=uy*forward+ux*side*orbit;
  e._b132HoldRange=range;
  if(frontSaber){
   const cx=frontSaber.x-ux*88,cy=frontSaber.y-uy*88;
   const fx=cx-e.x,fy=cy-e.y,fd=Math.hypot(fx,fy);
   if(fd>12){x=x*.52+fx/fd*.48;y=y*.52+fy/fd*.48;}
  }
 }else if(e.etype==='officer'){
  // Red officers approach from alternating wings; they do not teleport or accelerate.
  // Red officers commit to the same flank rather than switching directions.
  const lateral=d<110?.64:d>280?.76:1.03;
  const forward=d<105?-.28:d>250?.54:.18;
  x=ux*forward-uy*side*lateral;
  y=uy*forward+ux*side*lateral;
 }else if(e.etype==='saber'){
  // Green swordsmen remain the direct pressure front, with local collision spacing.
  // Green sabres take the direct line; collision separation still applies.
  x=ux;y=uy;
 }else{
  x=Math.cos(flankAng);y=Math.sin(flankAng);
 }
 const ad=Math.hypot(ax,ay);
 if(ad>.001){const k=Math.min(.3,ad*.2);x+=ax/ad*k;y+=ay/ad*k;}
 let found=0;
 for(const tree of nearbyTrees(e.x,e.y,100)){
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
 e._b126Angle=Math.hypot(x,y)>.001?Math.atan2(y,x):baseAng;
 return e._b126Angle;
}
window.PiraliTacticalAI=Object.freeze({heading,prepare,nearbyTrees,
  roles:Object.freeze({saber:'direct-pressure',rifle:'keep-distance',officer:'stable-flank'}),
  debug:()=>({frame:currentFrame,enemyCells:enemyGrid.size,treeCells:treeGrid.size,checks})});
})();