/* PIRALI Alpha 0.12 / Phase 4 — historically inspired Georgian medieval church.
 * A readable overhead silhouette: domed cross-in-square stone church and monastery yard.
 * Visual only, no changes to CHURCH_X/Y, map, path, AI, hit boxes or Firebase.
 * Based on Georgian medieval masonry motifs, NOT a verified reconstruction of a specific monument.
 */
(function(){
'use strict';
const previousChurch=drawChurch,previousBG=drawBG;
let enabled=true,marks=0;
const TWO_PI=Math.PI*2;
function oval(x,y,a,b,color,rot=0){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,a,b,rot,0,TWO_PI);ctx.fill();}
function segment(a,b,c,d,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke();}
function polygon(pts,fill,line=null,width=1){
 ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();
 ctx.fillStyle=fill;ctx.fill();if(line){ctx.strokeStyle=line;ctx.lineWidth=width;ctx.stroke();}
}
function wall(x,y,w,h,seed=0){
 // Weathered Georgian fieldstone and lime mortar. Stone rows are deliberately irregular.
 ctx.fillStyle='#343c37';ctx.fillRect(x+3,y+5,w,h);
 ctx.fillStyle='#877f6c';ctx.fillRect(x,y,w,h);
 ctx.fillStyle='#a79f89';ctx.fillRect(x+2,y+2,w-4,Math.min(4,h-1));
 ctx.strokeStyle='#564f43';ctx.lineWidth=.8;
 for(let row=0;row<Math.max(1,Math.floor(h/7));row++){
  const yy=y+row*7+5; if(yy>=y+h)break;
  segment(x+1,yy,x+w-1,yy,'rgba(60,55,43,.50)',.8);
  for(let col=0;col<Math.floor(w/14)+1;col++){
   const xx=x+(((col*13+(row%2)*7+seed)%Math.max(1,w-5)));
   segment(xx,yy-6,xx,yy,'rgba(62,56,43,.39)',.75);
  }
 }
}
function course(x,y,w,h,top,shadow,rows=6){
 ctx.fillStyle=shadow;ctx.fillRect(x+5,y+6,w,h);
 ctx.fillStyle=top;ctx.fillRect(x,y,w,h);
 ctx.strokeStyle='rgba(69,56,42,.4)';ctx.lineWidth=.75;
 for(let j=1;j<rows;j++){
  const yy=y+(h/rows)*j;segment(x,yy,x+w,yy,'rgba(77,60,41,.45)',.65);
  const n=Math.max(2,Math.floor(w/12));
  for(let k=1;k<n;k++){
   const xx=x+((k+(j%2)*.5)/n)*w;
   segment(xx,yy-h/rows,xx,yy,'rgba(65,55,42,.28)',.6);
  }
 }
}
function roofSegment(x,y,w,h,hor){
 const c1='#72695c',c2='#afa38c',c3='#d3c6a6';
 ctx.fillStyle='#554d42';ctx.fillRect(x+5,y+8,w,h);
 ctx.fillStyle=c1;ctx.fillRect(x,y,w,h);
 if(hor){
  polygon([[x,y],[x+w,y],[x+w,y+h/2],[x,y+h/2]],c2);
  polygon([[x,y],[x+w,y],[x+w,y+3],[x,y+3]],c3);
  segment(x,y+h/2,x+w,y+h/2,'#ddd0b2',2.2);
  for(let j=9;j<w-2;j+=10)segment(x+j,y+3,x+j,y+h-3,'rgba(43,36,32,.2)',.8);
 }else{
  polygon([[x,y],[x+w/2,y],[x+w/2,y+h],[x,y+h]],c2);
  polygon([[x,y],[x+3,y],[x+3,y+h],[x,y+h]],c3);
  segment(x+w/2,y,x+w/2,y+h,'#dfd1b0',2.2);
  for(let j=10;j<h-2;j+=11)segment(x+3,y+j,x+w-3,y+j,'rgba(43,36,32,.23)',.8);
 }
 ctx.strokeStyle='#4f463d';ctx.lineWidth=1.5;ctx.strokeRect(x,y,w,h);
}
function churchYard(cx,cy){
 // Enclosure wall and age-worn slabs around the doorway, leaving road access open.
 // The old collision and victory trigger remain at their exact original coordinates.
 oval(cx+7,cy+34,112,90,'rgba(3,7,5,.24)',.12);
 polygon([[cx-102,cy-103],[cx+100,cy-107],[cx+116,cy+89],[cx+67,cy+103],[cx-57,cy+103],[cx-111,cy+77]],'#635d4b','#38372f',3);
 polygon([[cx-93,cy-93],[cx+89,cy-95],[cx+102,cy+77],[cx-96,cy+74]],'#86806a','#b4aa89',1.2);
 const rng=i=>((Math.sin(i*19.883+7.71)*43758.5453)%1+1)%1;
 // Small squared stone paving stones as a readable world-anchored yard.
 for(let row=0;row<11;row++){
  const yy=cy-87+row*15;
  for(let col=0;col<12;col++){
   const xx=cx-85+col*15+(row%2)*7;
   if(xx>cx+93||yy>cy+70)continue;
   const jitter=rng(row*27+col);
   ctx.fillStyle=jitter>.5?'rgba(216,202,163,.11)':'rgba(32,31,26,.11)';
   ctx.fillRect(xx,yy,12-jitter*3,12-jitter);
   segment(xx,yy+13,xx+12,yy+13,'rgba(36,35,29,.12)',.8);
  }
 }
 // Courtyard wall is broken at the south entrance where path arrives.
 wall(cx-111,cy-103,12,155,3);wall(cx+99,cy-107,12,158,6);
 wall(cx-102,cy-108,198,11,5);
 wall(cx-110,cy+71,53,9,1);wall(cx+62,cy+71,49,9,5);
 // Courtyard entrance steps, extending towards the existing path end.
 for(let j=0;j<4;j++){
  const yy=cy+75+j*12;
  ctx.fillStyle=j%2?'#aaa18e':'#c7bba0';ctx.fillRect(cx-28-j*3,yy,56+j*6,10);
  segment(cx-29-j*3,yy+9,cx+29+j*3,yy+9,'#48463a',1.4);
 }
 // Historic standing-stone and grave marker shapes outside the main footprint.
 for(let i=0;i<5;i++){
  const s=i%2?-1:1,x=cx+s*(80+(i%2)*8),y=cy-78+i*31;
  oval(x+4,y+6,12,3,'rgba(0,0,0,.31)');
  polygon([[x-5,y-9],[x+5,y-9],[x+7,y+4],[x-8,y+4]],'#998e78','#5a574c',1);
  segment(x-3,y-7,x+3,y-7,'rgba(216,205,180,.5)',1.3);
 }
}
function stoneDome(cx,cy){
 // Ring of windows supports an elevated octagonal stone drum and roof seen overhead.
 oval(cx+8,cy+11,31,27,'rgba(0,0,0,.35)');
 oval(cx,cy,25.5,25,'#554d40');
 for(let k=0;k<8;k++){
  const a=k*TWO_PI/8;
  const a2=(k+1)*TWO_PI/8;
  polygon([
   [cx+Math.cos(a)*25,cy+Math.sin(a)*25],
   [cx+Math.cos(a2)*25,cy+Math.sin(a2)*25],
   [cx+Math.cos(a2)*20,cy+Math.sin(a2)*20],
   [cx+Math.cos(a)*20,cy+Math.sin(a)*20]
  ],k%2?'#b9af99':'#938a77','#62584c',1);
 }
 // Top-down roofs converge at the center: octagonal dome, not a frontal facade.
 ctx.fillStyle='#b7a68b';ctx.beginPath();
 for(let i=0;i<8;i++){
  const a=(i/8)*TWO_PI+Math.PI/8;
  const x=cx+Math.cos(a)*20.5,y=cy+Math.sin(a)*20.5;
  if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
 }
 ctx.closePath();ctx.fill();ctx.strokeStyle='#554c3f';ctx.lineWidth=2;ctx.stroke();
 for(let i=0;i<8;i++){
  const a=(i/8)*TWO_PI+Math.PI/8;
  polygon([[cx,cy],[cx+Math.cos(a)*20,cy+Math.sin(a)*20],[cx+Math.cos(a+TWO_PI/8)*20,cy+Math.sin(a+TWO_PI/8)*20]],i%2?'#998a76':'#c7b99f');
  segment(cx,cy,cx+Math.cos(a)*20,cy+Math.sin(a)*20,'rgba(64,52,43,.32)',.8);
 }
 oval(cx,cy,5,5,'#554c40');
 oval(cx-1.8,cy-2,2.6,2.8,'#ddcfb0');
}
function renderHistoricalChurch(){
 const cx=sx(CHURCH_X),cy=sy(CHURCH_Y);
 if(cx<-225||cx>W+225||cy<-225||cy>H+230)return;
 ctx.save();
 // Soft earthly daylight is deliberate; remove fantasy glow from the earlier building.
 churchYard(cx,cy);
 // Cross-in-square footprint of Georgian medieval domed architecture.
 const side='#575146';
 course(cx-31,cy-65,62,127,'#aca18b',side,8);
 course(cx-62,cy-27,124,59,'#a99d86',side,5);
 // The raised eastern altar apse is opposite the southern entrance.
 oval(cx,cy-73,31,21,'#665b4c');
 oval(cx,cy-77,27,17,'#a59b83');
 segment(cx-25,cy-77,cx+25,cy-77,'#d4c6a5',1.5);
 roofSegment(cx-26,cy-67,52,135,false);
 roofSegment(cx-57,cy-23,114,48,true);
 // Roof gutters and projecting dressed-stone eaves.
 ctx.strokeStyle='#3f3b34';ctx.lineWidth=2.4;ctx.strokeRect(cx-25.5,cy-66.5,51,133);
 ctx.strokeStyle='rgba(242,222,181,.58)';ctx.lineWidth=1.3;ctx.strokeRect(cx-55,cy-22,110,46);
 for(let side=0;side<2;side++){
  const xx=side?cx+50:cx-54;
  for(let k=0;k<3;k++){
   ctx.fillStyle='#2c3435';ctx.fillRect(xx,cy-11+k*15,4,6);
   segment(xx+1,cy-11+k*15,xx+3,cy-9+k*15,'#ded3b6',.9);
  }
 }
 stoneDome(cx,cy-1);
 // South porch, carved stonework and shadow at the historical entrance.
 ctx.fillStyle='#4d453b';ctx.fillRect(cx-20,cy+60,40,12);
 ctx.fillStyle='#b4a68b';ctx.fillRect(cx-20,cy+57,40,8);
 for(let k=0;k<5;k++)segment(cx-16+k*8,cy+57,cx-16+k*8,cy+65,'#635747',.7);
 ctx.fillStyle='#282620';ctx.fillRect(cx-8,cy+58,16,8);
 // Tiny gold cross, modest and architectural rather than supernatural.
 segment(cx,cy-6,cx,cy+5,'#efd9a1',1.6);
 segment(cx-4,cy-2,cx+4,cy-2,'#efd9a1',1.6);
 // Retain the localized final-church label, without the old magical glow.
 ctx.textAlign='center';ctx.font='bold 12px Noto Sans Georgian, sans-serif';
 const title=window.PiraliLanguage?.gameText?.('church')||'უდაბნოს ეკლესია';
 ctx.fillStyle='rgba(13,19,17,.83)';ctx.fillText(title,cx+1,cy-130);
 ctx.fillStyle='#efdec0';ctx.fillText(title,cx,cy-131);
 ctx.restore();marks++;
}
function roadStones(){
 // Alpha 0.13: the forest, mist and church approach stay completely stone-free.
 if(!(level===3||level===4)||!Array.isArray(path)||path.length<2)return;
 // Consistent, fixed stones on the exterior shoulders. Never cover the main road.
 ctx.save();
 const shades=level===5?['#696b5e','#a9a28b']:level>=4?['#ac8259','#d3a46f']:['#657354','#a2a083'];
 for(let i=0;i<path.length-1;i++){
  const a=path[i],b=path[i+1],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
  if(len<1)continue;
  const nx=-dy/len,ny=dx/len;
  for(let t=32;t<len;t+=52){
   const pct=t/len,wx=a.x+dx*pct,wy=a.y+dy*pct;
   if(wx<camX-120||wx>camX+W+120||wy<camY-120||wy>camY+H+120)continue;
   const jitter=Math.sin((i*731+t)*.079)*5;
   for(const side of[-1,1]){
    const d=46+jitter+(side>0?2:0),x=sx(wx+nx*d),y=sy(wy+ny*d);
    oval(x+3,y+3,6,2.7,'rgba(13,10,7,.26)');
    oval(x,y,5.2,3.2,shades[(i+Math.floor(t/52)+(side>0?1:0))%2],.2);
    segment(x-3,y-1,x+2,y-2,'rgba(255,244,214,.30)',.8);
   }
  }
 }
 ctx.restore();
}
drawBG=function(){
 previousBG();
 if(enabled)roadStones();
};
drawChurch=function(){
 if(!enabled||level!==5)return previousChurch();
 return renderHistoricalChurch();
};
window.PiraliHistoricalPhase4=Object.freeze({
 enable:v=>(enabled=!!v),
 enabled:()=>enabled,
 stats:()=>({enabled,level,churchStyle:'historic-georgian-stone-domed-overhead',drawCalls:marks}),
 originalChurch:previousChurch
});
})();