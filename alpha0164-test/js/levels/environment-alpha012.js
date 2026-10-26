/* PIRALI Alpha 0.12 Phase 3: distinct top-down scenery for 5 levels.
 * Visual-only: no path geometry, spawn, enemy AI, collision, score or Firebase changes.
 */
(function(){
'use strict';
const oldBG=drawBG,BIOMES=[
 null,
 {name:'Chokhatauri',tint:'rgba(17,55,23,.26)',leaf:'#36734b',hi:'#76a464',ground:'#1f473b'},
 {name:'Gogolesubani',tint:'rgba(20,56,79,.29)',leaf:'#406d63',hi:'#a4c3b2',ground:'#244751'},
 {name:'Shua Ganakhleba',tint:'rgba(134,83,34,.24)',leaf:'#938949',hi:'#ebc67e',ground:'#6c592d'},
 {name:'Udabno',tint:'rgba(151,61,24,.34)',leaf:'#956039',hi:'#e8bb7d',ground:'#713b26'},
 {name:'Udabnos Eklesia',tint:'rgba(8,24,69,.39)',leaf:'#354e49',hi:'#c9a063',ground:'#172e3e'}
];
// Sameba uses stage-1 forest geometry but exclusively pastel-pink foliage.
const SAMEBA_PINK={name:'Sameba / Pink Bloom',tint:'rgba(255,196,223,.35)',leaf:'#e5a3c8',hi:'#ffe0ee',ground:'#b57c9f'};
const visualStage=n=>({4:3,5:1,6:4,7:5,8:4,9:4,10:5,11:2}[n]||Math.min(5,Math.max(1,n)));
const TS=256,tiles=new Map();
let enabled=true,lastPath=null,lastLevel=0,objects=[];
const randFn=(seed)=>{let s=seed|0;return()=>{s=(Math.imul(s,1664525)+1013904223)|0;return(s>>>0)/4294967296;};};
const disc=(c,x,y,w,h,color,angle=0)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,w,h,angle,0,Math.PI*2);c.fill();};
const line=(c,x1,y1,x2,y2,color,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();};
function tile(stage){
 if(tiles.has(stage))return tiles.get(stage);
 const el=document.createElement('canvas');el.width=TS;el.height=TS;
 const g=el.getContext('2d'),rand=randFn(1002+stage*3301);
 for(let i=0;i<400;i++){
  const x=rand()*TS,y=rand()*TS,s=.5+rand()*2.7;
  if(stage>=3&&stage<=4){
   disc(g,x,y,s*3,s*.30,i%3?'rgba(82,49,18,.22)':'rgba(243,207,133,.22)',rand());
  }else{
   disc(g,x,y,s*1.7,s*.65,i%3?'rgba(16,39,27,.21)':'rgba(205,235,193,.12)',rand()*3);
  }
 }
 for(let i=0;i<30;i++){
  const x=rand()*TS,y=rand()*TS,s=3+rand()*8;
  if(stage===4){line(g,x-s,y,x+s,y-2,'rgba(69,36,17,.20)',1.4);}
  else if(stage===5)disc(g,x,y,s*1.8,s*.5,'rgba(165,205,188,.07)');
  else disc(g,x,y,s,s*.45,stage===2?'rgba(170,205,197,.17)':'rgba(65,77,25,.14)');
 }
 tiles.set(stage,el);return el;
}
function populate(){
 if(lastPath===path&&lastLevel===level)return;
 lastPath=path;lastLevel=level;objects=[];
 if(!path?.length)return;
 const rand=randFn(1771+level*21799),n=visualStage(level)===5?210:visualStage(level)===4?260:290;
 for(let k=0;k<n;k++){
  const x=45+rand()*(WW-90),y=190+rand()*(WH-360);
  // Decorations intentionally outside the walkable road and church area.
  if(dpth(x,y)<106||Math.hypot(x-CHURCH_X,y-CHURCH_Y)<200)continue;
  objects.push({x,y,s:.6+rand()*1.35,r:rand(),angle:rand()*Math.PI*2});
 }
}
function flowers(c,x,y,s,b,o){
 disc(c,x+2,y+4,10*s,3.8*s,'rgba(8,24,13,.24)');
 for(let j=0;j<5;j++){
  const a=o.angle+j*6.283/5,xx=x+Math.cos(a)*6*s,yy=y+Math.sin(a)*4*s;
  disc(c,xx,yy,4.2*s,2.2*s,j%2?b.leaf:b.hi,a*.3);
 }
 disc(c,x,y,2*s,2*s,b.ground);
}
function item(o,stage,b){
 const x=sx(o.x),y=sy(o.y),s=o.s;
 if(x<-48||x>W+48||y<-48||y>H+48)return;
 ctx.save();
 if(stage===1){
  flowers(ctx,x,y,s,b,o);
  if(o.r>.6){disc(ctx,x+10*s,y-8*s,2.3*s,3*s,'#e9c77a');disc(ctx,x+9*s,y-9*s,.9*s,s,'#fff1cc');}
 }else if(stage===2){
  if(o.r<.52){
   disc(ctx,x,y+4*s,16*s,6*s,'rgba(10,39,51,.34)',o.angle*.15);
   disc(ctx,x,y+2*s,14*s,4*s,'rgba(170,209,202,.32)',o.angle*.15);
   line(ctx,x-7*s,y,x+5*s,y-2*s,'rgba(236,255,244,.22)',1.5);
  }else flowers(ctx,x,y,s,b,o);
 }else if(stage===3){
  if(o.r>.38){
   for(let k=-2;k<=2;k++){
    const xx=x+k*4*s;
    line(ctx,xx,y+6*s,xx+1*s,y-9*s,'rgba(93,71,26,.45)',1.7);
    disc(ctx,xx+1*s,y-10*s,2.1*s,5*s,k%2?'#ddbe6d':'#f1d897',.16);
   }
  }else{
   disc(ctx,x,y,14*s,5*s,'rgba(79,56,22,.30)',o.angle);
   for(let k=-1;k<=2;k++)line(ctx,x+k*4*s,y-2*s,x+(k+2)*5*s,y+2*s,'rgba(238,193,107,.48)',1);
  }
 }else if(stage===4){
  if(o.r>.39){
   disc(ctx,x+3*s,y+4*s,15*s,5*s,'rgba(36,21,11,.32)');
   ctx.fillStyle=b.leaf;ctx.beginPath();ctx.moveTo(x-12*s,y+3*s);ctx.lineTo(x-5*s,y-9*s);ctx.lineTo(x+9*s,y-6*s);ctx.lineTo(x+13*s,y+3*s);ctx.closePath();ctx.fill();
   line(ctx,x-4*s,y-8*s,x+9*s,y-5*s,b.hi,2);
  }else{
   disc(ctx,x,y,22*s,6*s,'rgba(91,43,19,.25)',-.15);
   line(ctx,x-18*s,y,x+14*s,y-2*s,'rgba(251,200,122,.28)',1.5);
  }
 }else{
  if(o.r<.44){
   disc(ctx,x,y+7*s,11*s,4*s,'rgba(0,0,0,.37)');
   ctx.fillStyle='#51635d';ctx.fillRect(x-5*s,y-7*s,10*s,13*s);
   ctx.fillStyle='#8faaa3';ctx.fillRect(x-5*s,y-7*s,10*s,2*s);
   line(ctx,x,y-5*s,x,y+4*s,'rgba(19,41,39,.55)',1.2);
  }else if(o.r<.80)flowers(ctx,x,y,s*.8,b,o);
  else{
   disc(ctx,x,y,15*s,10*s,'rgba(243,180,73,.12)');
   disc(ctx,x,y,2.6*s,3.7*s,'#d6a15e');
   disc(ctx,x,y-3*s,1.5*s,2.8*s,'#f9efb6');
  }
 }
 ctx.restore();
}
function renderScenery(){
 if(!enabled||!path?.length)return;
 const stage=visualStage(level),b=level===5?SAMEBA_PINK:BIOMES[stage];
 populate();ctx.save();
 ctx.fillStyle=b.tint;ctx.fillRect(0,0,W,H);
 const pat=ctx.createPattern(tile(stage),'repeat');
 if(pat){
  const dx=((camX%TS)+TS)%TS,dy=((camY%TS)+TS)%TS;
  ctx.globalAlpha=.68;ctx.translate(-dx,-dy);ctx.fillStyle=pat;ctx.fillRect(0,0,W+TS,H+TS);
  ctx.translate(dx,dy);ctx.globalAlpha=1;
 }
 for(let i=0;i<objects.length;i++)item(objects[i],stage,b);
 if(stage===5){
  const x=sx(CHURCH_X),y=sy(CHURCH_Y);
  if(x>-170&&x<W+170&&y>-180&&y<H+170){
   const g=ctx.createRadialGradient(x,y+40,12,x,y+40,155);
   g.addColorStop(0,'rgba(248,184,91,.23)');g.addColorStop(1,'rgba(248,170,72,0)');
   ctx.fillStyle=g;ctx.fillRect(x-155,y-115,310,310);
  }
 }
 ctx.restore();
}
drawBG=function(){oldBG();renderScenery();};
window.PiraliAlphaEnvironment=Object.freeze({
 enabled:()=>enabled,enable:v=>(enabled=!!v),
 stats:()=>({version:'alpha012-scenery-phase3',level,biome:level===5?SAMEBA_PINK.name:BIOMES[visualStage(level)]?.name,decorations:objects.length,cachedTiles:tiles.size}),
 biomes:BIOMES.slice(1).map((b,i)=>({level:i+1,name:b.name}))
});
})();