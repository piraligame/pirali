/* PIRALI ALPHA 0.13 — Stage-aware top-down stone & earth road artwork.
 * Pure drawing layer: original path and all collision/AI/Firebase logic untouched.
 */
(function(){
'use strict';
const underlay=drawBG;
let enabled=true,currentPath=null,currentLevel=0,stoneRows=[],drawCalls=0,builds=0;
const shades=[
 null,
 {edge:'#594a34',fill:'#ad9869',light:'#d4c18b',stone:['#b7ad90','#d2c7a8','#a6a48e'],grass:'#718358',rut:'rgba(60,42,24,.19)'},
 {edge:'#54625d',fill:'#889b90',light:'#becfc0',stone:['#acb8af','#c7d0c3','#9cafa3'],grass:'#76978a',rut:'rgba(31,48,45,.19)'},
 {edge:'#8b714e',fill:'#b99b70',light:'#dec397',stone:['#c6b393','#ddcda9','#aea08a'],grass:'#ada074',rut:'rgba(86,54,30,.20)'},
 {edge:'#925d3b',fill:'#c08b59',light:'#e1b986',stone:['#c5a07b','#e5c198','#b89576'],grass:'#b69a73',rut:'rgba(99,52,25,.21)'},
 {edge:'#57534a',fill:'#958976',light:'#d2c5af',stone:['#b8afa0','#d8cfbd','#a99f90'],grass:'#828b7c',rut:'rgba(39,35,31,.20)'}
];
const rnd=(n)=>{let v=n|0;return()=>{v=(Math.imul(v,1664525)+1013904223)|0;return(v>>>0)/4294967296;};};
function prepare(){
 if(path===currentPath&&level===currentLevel)return;
 currentPath=path;currentLevel=level;stoneRows=[];builds++;
 if(!Array.isArray(path)||path.length<2||!(level===3||level===4||level===6))return;
 const random=rnd(550122+level*9911);
 for(let i=0;i<path.length-1;i++){
  const a=path[i],b=path[i+1],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
  if(len<.01)continue;
  const nx=-dy/len,ny=dx/len;
  // Intentionally sparse: ~75-85% fewer stones than first 0.13 road preview.
  // Leave the center mostly clear; natural stones collect near both shoulders.
  for(let d=18;d<len-9;d+=39){
   const t=d/len,x=a.x+dx*t,y=a.y+dy*t;
   const patchCount=2;
   for(let k=0;k<patchCount;k++){
    if(random()<.18)continue; // irregular quiet sections instead of rows of gravel
    const side=k%2===0?-1:1;
    const offset=side*(22+random()*12);
    const xx=x+nx*offset,yy=y+ny*offset;
    const size=3.1+random()*3.0;
    stoneRows.push({x:xx,y:yy,rx:size,ry:size*(.55+random()*.15),angle:(random()-.5)*.7,variant:Math.floor(random()*3),mark:random(),side:false});
   }
   if(random()>.83){
    const side=random()>.5?1:-1,offset=39+random()*8;
    stoneRows.push({x:x+nx*offset*side,y:y+ny*offset*side,rx:2+random()*3.3,ry:1.5+random()*2.0,angle:(random()-.5)*.8,variant:Math.floor(random()*3),mark:random(),side:true});
   }
  }
 }
}
function strokeRoute(color,width,dash=[]){
 ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);
 ctx.beginPath();ctx.moveTo(sx(path[0].x),sy(path[0].y));
 for(let i=1;i<path.length-1;i++){
  const next=path[i+1],cur=path[i];
  ctx.quadraticCurveTo(sx(cur.x),sy(cur.y),sx((cur.x+next.x)*.5),sy((cur.y+next.y)*.5));
 }
 const p=path[path.length-1];ctx.lineTo(sx(p.x),sy(p.y));ctx.stroke();
 ctx.setLineDash([]);
}
function ellipse(x,y,rx,ry,col,rot=0){
 ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot,0,Math.PI*2);ctx.fill();
}
function stone(v,p){
 const x=sx(v.x),y=sy(v.y),r=v.rx,t=v.ry;
 ctx.save();ctx.translate(x,y);ctx.rotate(v.angle);
 // Rock casts a thin local shadow; no fake collision and no static gameplay object.
 ellipse(1.3,1.35,r*1.05,t*.95,'rgba(33,30,22,.14)');
 ctx.fillStyle=p.stone[v.variant];ctx.beginPath();
 ctx.moveTo(-r*.95,-t*.28);ctx.lineTo(-r*.59,-t*.90);ctx.lineTo(r*.47,-t*.96);
 ctx.lineTo(r,-t*.22);ctx.lineTo(r*.74,t*.75);ctx.lineTo(-r*.45,t);
 ctx.lineTo(-r*.94,t*.43);ctx.closePath();ctx.fill();
 ctx.strokeStyle='rgba(66,60,47,.20)';ctx.lineWidth=.6;ctx.stroke();
 ctx.beginPath();ctx.moveTo(-r*.55,-t*.44);ctx.lineTo(r*.28,-t*.67);
 ctx.strokeStyle='rgba(252,243,222,.33)';ctx.stroke();
 if(v.mark>.88){ctx.beginPath();ctx.moveTo(-r*.12,-t*.3);ctx.lineTo(r*.32,t*.26);
 ctx.strokeStyle='rgba(77,66,50,.23)';ctx.lineWidth=.6;ctx.stroke();}
 ctx.restore();
}
function paint(){
 if(!enabled||!Array.isArray(path)||path.length<2)return;
 prepare();
 if(!(level===3||level===4||level===6))return;
 const stage=level===6?4:Math.max(1,Math.min(level,5)),palette=shades[stage];
 drawCalls++;
 ctx.save();
 // Alpha 0.12's natural road is already attractive and remains fully visible.
 // No thick repaint or overlapping round-ended strokes: those created distracting
 // circular bands in the first 0.13 test. Only place a few lighter stones on top.
 // Distinct fieldstones. Culling prevents thousands of invisible draw calls on phones.
 for(let i=0;i<stoneRows.length;i++){
  const v=stoneRows[i],x=sx(v.x),y=sy(v.y);
  if(x<-14||x>W+14||y<-14||y>H+14)continue;
  if(v.side){
   if(stage===1||stage===2||stage===3){
    ellipse(x+2,y+3,v.rx*2,v.ry*1.6,'rgba(22,41,21,.17)');
    ellipse(x,y,v.rx*1.15,v.ry,palette.grass,v.angle);
    continue;
   }
  }
  stone(v,palette);
 }
 // The original 0.12 game already draws its footpath; this is a separate visual top layer.
 ctx.restore();
}
drawBG=function(){underlay();paint();};
window.PiraliAlphaRoads=Object.freeze({
 enabled:()=>enabled,
 enable:v=>(enabled=!!v),
 stats:()=>({enabled,stage:level,roadObjects:stoneRows.length,worldBuilds:builds,drawCalls,version:'0.13-graphics-roads-3-4-only'}),
 roadTypes:['','Forest earth','Wet stone','Rural track','Desert rock','Monastery flagstone']
});
})();