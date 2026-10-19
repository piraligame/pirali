/*
 * PIRALI 0.11 — overhead character polish.
 * Canvas art refinement of the ORIGINAL top-down characters, not frontal sprites.
 * Keeps original draw functions for a safe rollback. Does not touch hitboxes, AI,
 * speed, score, Firebase, levels, or landlord NPC (user will supply his image).
 */
(function(){
'use strict';
const originalPlayer=drawPlayer,originalEnemy=drawEnemy,originalBoss=drawBoss;
let enabled=true;
const PI=Math.PI,TAU=PI*2;
const COLORS={
 simona:{rim:'#190c08',coat:'#582316',light:'#89432c',shadow:'#2e100a',seam:'#be7650',legs:'#2e241c',boots:'#1d1712',hat:'#292012',hatLight:'#544129',skin:'#ad754f',metal:'#d4ab52',strap:'#674128'},
 sword:{rim:'#151c12',coat:'#34452b',light:'#596a3d',shadow:'#212c1b',seam:'#8e9b64',legs:'#343b2d',boots:'#181b16',hat:'#34452a',hatLight:'#68734a',skin:'#bc8d60',metal:'#b64632',strap:'#826c46'},
 rifle:{rim:'#231210',coat:'#602c26',light:'#884039',shadow:'#361a17',seam:'#b47860',legs:'#3c2e26',boots:'#1b1713',hat:'#272522',hatLight:'#4b4036',skin:'#bb8a62',metal:'#c6ab73',strap:'#947455'},
 officer:{rim:'#181719',coat:'#333233',light:'#565253',shadow:'#232125',seam:'#a19b91',legs:'#343033',boots:'#151316',hat:'#252529',hatLight:'#57514a',skin:'#be906d',metal:'#e3b45d',strap:'#99815e'},
 general:{rim:'#19070b',coat:'#51111c',light:'#77242d',shadow:'#2e0b12',seam:'#a5524e',legs:'#352124',boots:'#1a1415',hat:'#260b10',hatLight:'#59313a',skin:'#bf8760',metal:'#f3c25b',strap:'#d3a050'}
};
function path(points,fill,stroke,width=1){
 ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();
 if(fill){ctx.fillStyle=fill;ctx.fill();}
 if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineJoin='round';ctx.stroke();}
}
function seg(x1,y1,x2,y2,color,width=1){
 ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();
}
function ellipse(x,y,w,h,fill,rotate=0){
 ctx.beginPath();ctx.ellipse(x,y,w,h,rotate,0,TAU);ctx.fillStyle=fill;ctx.fill();
}
function ring(x,y,r,col,w=1){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.lineWidth=w;ctx.strokeStyle=col;ctx.stroke();}

/* Top-down camera geometry: foreshortened boots, flat overhead torso and cap tops.
 * The original game character is still drawn underneath for all existing FX. */
function topdownPerson(type,x,y,angle,speed,weapon,opts={}){
 const p=COLORS[type];if(!p)return;
 const boss=type==='general';
 const scale=boss?1.63:type==='simona'?1.01:.92;
 const px=sx(x),py=sy(y);
 if(px<-90||px>W+90||py<-90||py>H+90)return;
 const gait=speed>.12?Math.sin((typeof frame==='number'?frame:0)*.19)*Math.min(3,speed):Math.sin(Date.now()*.002)*.25;
 ctx.save();ctx.translate(px,py);ctx.rotate((Number.isFinite(angle)?angle:-PI/2)+PI/2);ctx.scale(scale,scale);
 // Ground shadow, short legs tucked BEHIND jacket, overhead silhouette.
 ellipse(2,8,14,5.4,'rgba(9,11,8,.22)');
 for(const side of [-1,1]){
  const x0=side*5.4+side*gait*.33;
  path([[x0-3,9],[x0+3,9],[x0+3,17],[x0-3,17]],p.legs,p.rim,1);
  ellipse(x0,18,3.8,2.7,p.boots);
  seg(x0-1.7,18,x0+1.5,18,'rgba(230,218,178,.19)',.8);
 }
 // Split chokha coat tails. Forward direction is negative Y.
 const lean=gait*.3;
 path([[-8,3],[-3,5],[-3+lean,18],[-10+lean,17],[-12,10]],p.shadow,p.rim,1.3);
 path([[3,5],[8,3],[12,10],[10+lean,17],[3+lean,18]],p.coat,p.rim,1.3);
 seg(-7,7,-9+lean,15,p.seam,.8);seg(7,7,9+lean,15,p.seam,.8);
 // Cut shoulders and tapered waist in top view, not a front-facing human sprite.
 path([[-9,-9],[-14,-8],[-16,-4],[-15,4],[-9,11],[-5,12],[5,12],[9,11],[15,4],[16,-4],[14,-8],[9,-9]],p.rim,null);
 path([[-8,-8],[-13,-7],[-14,-2],[-11,7],[-6,10],[6,10],[11,7],[14,-2],[13,-7],[8,-8]],p.coat,null);
 path([[-10,-7],[-13,-3],[-10,5],[-6,8],[-2,8],[-3,-7]],p.light,null);
 path([[7,-7],[12,-5],[13,3],[8,8],[3,8]],p.shadow,null);
 for(const side of [-1,1]){
  const bend=side*gait*.2;
  seg(side*12,-5,side*(17+Math.abs(bend)),2+bend,p.rim,7);
  seg(side*12,-5,side*(17+Math.abs(bend)),2+bend,p.coat,4.8);
  ellipse(side*(17+Math.abs(bend)),2+bend,2.6,2.35,p.skin);
 }
 // A collar and seam seen through the shoulders.
 ellipse(0,-5.5,6.7,4.6,p.shadow);ellipse(0,-6,5.8,3.8,p.light);
 seg(-8,8,8,8,p.strap,2.7);
 path([[-2,6],[2,6],[2,9],[-2,9]],p.metal,p.rim,.7);
 if(type==='simona'){
  // Paired brass gazyr on the original Georgian chokha.
  for(const side of [-1,1])for(let i=0;i<5;i++){
   const cx=side*(7.5-i*.17),cy=-4+i*1.8;
   seg(cx-1.1,cy,cx+1.1,cy,'#28150d',2.1);seg(cx-.9,cy,cx+.9,cy,p.metal,1.1);
  }
  seg(-9,-9,7,8,p.rim,3);seg(-9,-9,7,8,'#b5854e',1.1);
 }else if(type==='officer'||boss){
  for(const side of[-1,1])ellipse(side*11.7,-6.2,4.1,2.6,p.metal,-side*.2);
  seg(-6,-5,6,6,p.metal,1.3);
  ellipse(4.7,0,2.1,2.1,'#ead08b');
  if(boss)ellipse(-4.7,1.3,2.1,2.1,'#9cbdc8');
 }else{
  seg(-9,-7,8,9,p.strap,2.2);
  path([[-7,-2],[-3,-2],[-3,4],[-7,4]],p.shadow,p.seam,.6);
 }
 // HEAD = cap's CROWN seen FROM ABOVE. Face is only tiny edge shadow.
 ellipse(0,-11,9.3,9.2,p.rim);
 ellipse(-.6,-11.2,7.9,8.15,p.hat);
 ellipse(-2.3,-13.3,5.4,4,p.hatLight,-.15);
 if(type==='simona'){
  ctx.beginPath();ctx.ellipse(0,-11,8,7.7,0,.1,PI*1.9);
  ctx.strokeStyle='#180e0a';ctx.lineWidth=1.35;ctx.stroke();
  seg(-5,-13,5,-13,'rgba(195,158,95,.44)',.8);
  path([[7,-9],[11,-7],[14,2],[10,0]],p.hat,p.rim,.7);
  ellipse(0,-17,1.9,1.9,p.metal);
 }else if(type==='sword'){
  path([[-4,-16],[0,-25],[4,-16]],p.hat,p.rim,.95);
  ellipse(0,-12.2,2.8,2.8,p.metal);ellipse(0,-12.2,1.1,1.1,'#ffdfaa');
 }else{
  path([[-8,-16],[-9,-20],[-3,-22],[3,-22],[9,-20],[8,-16]],p.hat,p.rim,.9);
  seg(-8,-17,8,-17,p.metal,boss?2.15:1.5);
  ellipse(0,-12.2,2,2,p.metal);
  path([[-9,-19],[9,-19],[11,-15],[0,-14],[-11,-15]],p.shadow,p.rim,.8);
  if(boss)ellipse(0,-12,2.8,2.5,'#ae3029');
 }
 ellipse(0,-19,4,1.3,p.skin);
 // Keep the authentic ORIGINAL Mauser / rifle / sword / sabre. Do not double-render weapons.
 seg(12,-4,15,-11,p.coat,4.7);ellipse(15,-11,2.5,2.35,p.skin);
 seg(13,-8,15,-9,p.seam,.9);
 if(opts.rage){seg(-11,7,-6,15,'#d4423c',1.2);seg(11,7,6,15,'#dd5349',1.2);}
 ctx.restore();
}
drawPlayer=function(){
 if(!enabled)return originalPlayer();
 if(P.dead)return;
 // Keep original combat recoil, attack effects, parry and dash exactly as before.
 originalPlayer();
 let weapon=swordOn?'sword':'pistol';
 if(!swordOn&&window.PiraliAlphaGear?.status?.().selected==='shotgun')weapon='shotgun';
 topdownPerson('simona',P.x,P.y,P.ang,Math.hypot(P.vx,P.vy),weapon);
};
drawEnemy=function(e){
 if(!enabled||!e?.alive||e.etype==='landlord')return originalEnemy(e);
 // The landlord is intentionally NOT modified until the user sends his image.
 originalEnemy(e);
 const kind=e.etype==='rifle'?'rifle':e.etype==='officer'?'officer':'sword';
 const weapon=kind==='rifle'?'rifle':kind==='sword'?'sword':'pistol';
 topdownPerson(kind,e.x,e.y,e.ang,Math.hypot(e.vx||0,e.vy||0),weapon);
};
drawBoss=function(b){
 if(!enabled||!b?.alive)return originalBoss(b);
 originalBoss(b);
 topdownPerson('general',b.x,b.y,b.ang,Math.hypot(b.vx||0,b.vy||0),'sword',{rage:!!b.rageMode});
};
window.PiraliTopdownPolish=Object.freeze({
 enable:value=>{enabled=!!value;return enabled;},
 isEnabled:()=>enabled,
 originalPlayer,originalEnemy,originalBoss,
 version:'0.11-topdown-b',
 touched:['Simona','sword soldier','rifle soldier','officer','general','general rage'],
 landlordUntouched:true
});
})();
