/* PIRALI ALPHA 0.13 — Stage-aware top-down stone & earth road artwork.
 * Pure drawing layer: original path and all collision/AI/Firebase logic untouched.
 */
(function(){
'use strict';
const underlay=drawBG;
let enabled=true,currentPath=null,currentLevel=0,stoneRows=[],drawCalls=0,builds=0;
const shades=[
 null,
 {edge:'#4e412b',fill:'#9c844e',light:'#c9b077',stone:['#857c64','#b0a382','#5d6859'],grass:'#617744',rut:'rgba(60,42,24,.28)'},
 {edge:'#3c4643',fill:'#687e70',light:'#adc0b2',stone:['#788c84','#b1bcb1','#53635c'],grass:'#60897b',rut:'rgba(31,48,45,.30)'},
 {edge:'#725637',fill:'#ab8851',light:'#d3b079',stone:['#887a5e','#d1ba8c','#6d624e'],grass:'#9e8f59',rut:'rgba(86,54,30,.32)'},
 {edge:'#774629',fill:'#ad7445',light:'#d5a46c',stone:['#976742','#dcb07a','#74583f'],grass:'#a38a57',rut:'rgba(99,52,25,.34)'},
 {edge:'#3c3931',fill:'#786e5c',light:'#bcb09a',stone:['#948b79','#c0b7a0','#625f53'],grass:'#687568',rut:'rgba(39,35,31,.34)'}
];
const rnd=(n)=>{let v=n|0;return()=>{v=(Math.imul(v,1664525)+1013904223)|0;return(v>>>0)/4294967296;};};
function prepare(){
 if(path===currentPath&&level===currentLevel)return;
 currentPath=path;currentLevel=level;stoneRows=[];builds++;
 if(!Array.isArray(path)||path.length<2)return;
 const random=rnd(550122+level*9911);
 for(let i=0;i<path.length-1;i++){
  const a=path[i],b=path[i+1],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
  if(len<.01)continue;
  const nx=-dy/len,ny=dx/len;
  for(let d=9;d<len-8;d+=16){
   const t=d/len,x=a.x+dx*t,y=a.y+dy*t;
   // 3-dimensional-looking paving, positioned in the game world's coordinates.
   for(let lane=-2;lane<=2;lane++){
    const offset=lane*13+(random()-.5)*6;
    const xx=x+nx*offset,yy=y+ny*offset;
    const size=3.7+random()*3.6;
    stoneRows.push({x:xx,y:yy,rx:size,ry:size*(.48+random()*.25),angle:(random()-.5)*1.2,variant:Math.floor(random()*3),mark:random(),side:false});
   }
   if(random()>.52){
    for(const side of[-1,1]){
     const offset=36+random()*9,xx=x+nx*offset*side,yy=y+ny*offset*side;
     stoneRows.push({x:xx,y:yy,rx:2.5+random()*5,ry:1.7+random()*3,angle:random()*.9,variant:Math.floor(random()*3),mark:random(),side:true});
    }
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
 ellipse(1.7,1.9,r*1.13,t*1.10,'rgba(18,16,13,.39)');
 ctx.fillStyle=p.stone[v.variant];ctx.beginPath();
 ctx.moveTo(-r*.95,-t*.28);ctx.lineTo(-r*.59,-t*.90);ctx.lineTo(r*.47,-t*.96);
 ctx.lineTo(r,-t*.22);ctx.lineTo(r*.74,t*.75);ctx.lineTo(-r*.45,t);
 ctx.lineTo(-r*.94,t*.43);ctx.closePath();ctx.fill();
 ctx.strokeStyle='rgba(37,35,32,.39)';ctx.lineWidth=.85;ctx.stroke();
 ctx.beginPath();ctx.moveTo(-r*.55,-t*.44);ctx.lineTo(r*.28,-t*.67);
 ctx.strokeStyle='rgba(244,228,195,.49)';ctx.stroke();
 if(v.mark>.88){ctx.beginPath();ctx.moveTo(-r*.12,-t*.3);ctx.lineTo(r*.32,t*.26);
 ctx.strokeStyle='rgba(42,37,30,.37)';ctx.lineWidth=.75;ctx.stroke();}
 ctx.restore();
}
function paint(){
 if(!enabled||!Array.isArray(path)||path.length<2)return;
 const stage=Math.max(1,Math.min(level,5)),palette=shades[stage];
 prepare();drawCalls++;
 ctx.save();
 // Convincing road depth: dark recessed outline + light shoulder + worn interior.
 strokeRoute('rgba(8,11,8,.20)',83);
 strokeRoute(palette.edge,75);
 strokeRoute(palette.fill,65);
 strokeRoute(palette.light,49);
 strokeRoute('rgba(255,244,206,.13)',24);
 if(stage===1||stage===3||stage===4){
  // Wheel-ruts reinforce a playable road rather than a decorative yellow ribbon.
  strokeRoute(palette.rut,31,[7,20]);
 }
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
 stats:()=>({enabled,stage:level,roadObjects:stoneRows.length,worldBuilds:builds,drawCalls,version:'0.13-graphics-phase1'}),
 roadTypes:['','Forest earth','Wet stone','Rural track','Desert rock','Monastery flagstone']
});
})();