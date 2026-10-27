/* PIRALI Alpha 0.13 — Biome colors for level 2 and level 3 ONLY.
 * Level 2: damp blue-sage forest and mist. Level 3: olive-green Gurian farmland.
 * Draw-only overlay; leaves routes, collisions, trees, enemies and Firebase untouched.
 * Does nothing at all in levels 1, 4 and 5.
 */
(function(){
'use strict';
const oldBG=drawBG;
let enabled=true,cachedWorld=null,cachedLevel=0,details=[],textureCache=new Map(),drawCalls=0;
const TS=256,PI2=Math.PI*2;
const look={
 2:{name:'Gogolesubani • cool misty woods',wash:'rgba(48,101,133,.33)',shade:'#5e9188',light:'#b2c7ae',soil:'#344d4d'},
 3:{name:'Shua Ganakhleba • green farmland',wash:'rgba(82,147,76,.33)',shade:'#788950',light:'#d4c58a',soil:'#7e8555'}
};
function rng(seed){let n=seed|0;return()=>{n=(Math.imul(n,1664525)+1013904223)|0;return (n>>>0)/4294967296;};}
function oval(c,x,y,rx,ry,color,angle=0){
 c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,angle,0,PI2);c.fill();
}
function stroke(c,x,y,ex,ey,color,width=1){
 c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();
}
function tile(stage){
 if(textureCache.has(stage))return textureCache.get(stage);
 const cn=document.createElement('canvas');cn.width=cn.height=TS;
 const g=cn.getContext('2d'),rnd=rng(stage*14917+23);
 // Each tile is lightweight and world-anchored (won't shimmer while camera moves).
 for(let k=0;k<78;k++){
  const x=rnd()*TS,y=rnd()*TS,r=1+rnd()*3;
  if(stage===2){
   oval(g,x,y,r*1.7,r*.55,k%3?'rgba(203,227,222,.14)':'rgba(38,68,82,.10)',rnd()*3);
  }else{
   oval(g,x,y,r*2.2,r*.5,k%2?'rgba(67,123,42,.16)':'rgba(230,212,148,.15)',rnd()*.4);
  }
 }
 textureCache.set(stage,cn);return cn;
}
function rebuild(stage){
 if(cachedLevel===stage&&cachedWorld===path)return;
 cachedLevel=stage;cachedWorld=path;details=[];
 if(!Array.isArray(path)||!path.length)return;
 const rnd=rng(stage*73517+51);
 const count=stage===2?180:135;
 for(let i=0;i<count;i++){
  const x=55+rnd()*(WW-110),y=170+rnd()*(WH-350);
  // Keep every visual detail out of the path and out of the final battle yard.
  if(dpth(x,y)<102||Math.hypot(x-CHURCH_X,y-CHURCH_Y)<175)continue;
  details.push({x,y,s:.55+rnd()*.8,kind:rnd(),angle:(rnd()-.5)*2});
 }
}
function drawItem(o,stage){
 const x=sx(o.x),y=sy(o.y),s=o.s;
 if(x<-28||y<-28||x>W+28||y>H+28)return;
 if(stage===2){
  if(o.kind<.53){
   // Silver-blue dew and damp fern clusters: unlike Chokhatauri's green shrubs.
   oval(ctx,x+1,y+2,12*s,4*s,'rgba(34,63,74,.17)',o.angle);
   for(let k=-2;k<=2;k++){
    const xx=x+k*3.2*s;
    stroke(ctx,xx,y+2*s,xx+1.5*s,y-6*s-3*(k===0),'rgba(47,94,95,.44)',1.2*s);
    oval(ctx,xx+2*s,y-4*s,3.4*s,1.55*s,k%2?'rgba(135,177,151,.55)':'rgba(77,135,119,.51)',-.3);
   }
  }else{
   oval(ctx,x+2,y+3,12*s,4*s,'rgba(15,56,64,.16)',-.1);
   oval(ctx,x,y,10*s,2.8*s,'rgba(185,214,214,.18)',.08);
   stroke(ctx,x-6*s,y,x+6*s,y-1*s,'rgba(229,241,222,.25)',.7);
  }
 }else if(o.kind<.56){
  // Village pasture grass, not desert gravel.
  for(let k=-2;k<=2;k++){
   const ox=x+k*3.5*s,h=5.5*s+(k%2?1:3)*s;
   stroke(ctx,ox,y+2*s,ox+(k%2?1:-1)*2.2*s,y-h,'rgba(56,107,47,.37)',1.2*s);
   if(k===0||k===2)oval(ctx,ox,y-h,1.2*s,2*s,'rgba(210,190,110,.52)');
  }
 }else{
  // Golden hay fragments and clover distinguish a rural village from Udabno.
  oval(ctx,x+1,y+2,10*s,3.5*s,'rgba(85,93,39,.11)',o.angle);
  for(let k=-2;k<=2;k++){
   stroke(ctx,x+k*3*s,y-3*s,x+(k+1)*3*s,y+2*s,'rgba(201,185,106,.28)',.8);
  }
 }
}
function paint(){
 if(!enabled||(level!==2&&level!==3)||!Array.isArray(path)||!path.length)return;
 const stage=level;rebuild(stage);drawCalls++;
 ctx.save();
 ctx.fillStyle=look[stage].wash;ctx.fillRect(0,0,W,H);
 const pattern=ctx.createPattern(tile(stage),'repeat');
 if(pattern){
  const dx=((camX%TS)+TS)%TS,dy=((camY%TS)+TS)%TS;
  ctx.globalAlpha=.65;ctx.translate(-dx,-dy);
  ctx.fillStyle=pattern;ctx.fillRect(0,0,W+TS,H+TS);ctx.translate(dx,dy);
  ctx.globalAlpha=1;
 }
 for(let i=0;i<details.length;i++)drawItem(details[i],stage);
 ctx.restore();
}
drawBG=function(){oldBG();paint();};
window.PiraliBiomes013=Object.freeze({
 enable:v=>(enabled=!!v),enabled:()=>enabled,
 stats:()=>({enabled,level,biome:look[level]?.name||'unchanged',details:level===2||level===3?details.length:0,drawCalls}),
 editedLevels:[2,3],preservedLevels:[1,4,5]
});
})();