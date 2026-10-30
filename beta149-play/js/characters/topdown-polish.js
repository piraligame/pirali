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
 const motion=opts.motion||null;
 const soldierPose=opts.enemyMotion||null;
 const gait=motion?motion.sway:(speed>.12?Math.sin((typeof frame==='number'?frame:0)*.19)*Math.min(3,speed):Math.sin(Date.now()*.002)*.25);
 ctx.save();ctx.translate(px,py);ctx.rotate((Number.isFinite(motion?.angle)?motion.angle:(Number.isFinite(angle)?angle:-PI/2))+PI/2+(motion?.lean||0)+(soldierPose?.bank||0));ctx.scale(scale,scale);
 // True birds-eye view: compact silhouette. No feet or boots in the elevated-camera
 // renderer, even while the body rotates. Walking still animates fabric folds.
 ellipse(1.8,7.1,13.6,4.3,'rgba(9,11,8,.20)');
 // Movement comes from the shared Alpha animation clock; shadow stays planted.
 if(motion)ctx.translate(0,-Math.min(3.5,Math.max(-.45,motion.bob))-(soldierPose?.impact||0));
 if(soldierPose){
  // Pivots, sidesteps and natural weight shifts; gameplay x/y stay untouched.
  ctx.translate(soldierPose.sideShift*.6,-soldierPose.lean*1.25+soldierPose.kick*.7);
  ctx.scale(1-soldierPose.bodySquash*.55,1+soldierPose.bodySquash);
 }
 const lean=gait*.95+(soldierPose?.stride||0);
 // Cloak folds move visibly with each step; no frozen feet/hands.
 if(motion?.moving){
   path([[-8,8],[-10+lean,17],[-5+lean,14],[-3,9]],p.shadow,p.rim,.6);
   path([[8,8],[10+lean,17],[5+lean,14],[3,9]],p.light,p.rim,.6);
 }
 // Tail panels stop just beneath the waist: heels never show past the coat.
 path([[-8,3],[-3,5],[-3+lean,12.2],[-9+lean,11.8],[-11,8.8]],p.shadow,p.rim,1.2);
 path([[3,5],[8,3],[11,8.8],[9+lean,11.8],[3+lean,12.2]],p.coat,p.rim,1.2);
 seg(-7,7,-8.2+lean,10.8,p.seam,.75);
 seg(7,7,8.2+lean,10.8,p.seam,.75);
 // Cut shoulders and tapered waist in top view, not a front-facing human sprite.
 path([[-9,-9],[-14,-8],[-16,-4],[-15,4],[-9,11],[-5,12],[5,12],[9,11],[15,4],[16,-4],[14,-8],[9,-9]],p.rim,null);
 path([[-8,-8],[-13,-7],[-14,-2],[-11,7],[-6,10],[6,10],[11,7],[14,-2],[13,-7],[8,-8]],p.coat,null);
 path([[-10,-7],[-13,-3],[-10,5],[-6,8],[-2,8],[-3,-7]],p.light,null);
 path([[7,-7],[12,-5],[13,3],[8,8],[3,8]],p.shadow,null);
 // Alpha 0.13: moving seam panels convey turning shoulders and changing weight.
 // Integrated within uniform, not separate frozen hands or visible feet.
 if(soldierPose){
  const c=soldierPose,sw=c.shoulder,br=c.brace;
  for(const side of[-1,1]){
   const off=side*(2+Math.abs(sw)*.44);
   path([[side*10,-8],[side*(13+br*.7+c.focus*.5),-5+sw*.5],[side*(12+br),2+sw*.52],[side*8,5]],side<0?p.light:p.shadow,p.seam,.72);
   seg(side*9,-5,side*10+off*.2,4+sw*.8,p.seam,.8+c.activity*.3);
  }
  // Waist cloth flexes with each footfall, but the actual foot remains hidden.
  seg(-7,9,-8.5+c.stride*.7,11.5,p.seam,1);
  seg(7,9,8.5-c.stride*.7,11.5,p.seam,1);
  if(c.kind==='sword'&&c.attack&&c.swing>.2){
   // Small overhand sword-motion trail. Original hit timing still controls damage.
   ctx.beginPath();ctx.arc(-1,-5,18,-1.35-c.swing*.28,-.45+c.swing*.28);
   ctx.strokeStyle='rgba(231,226,198,'+(Math.min(.47,Math.abs(c.swing)*.65))+')';
   ctx.lineWidth=1.5;ctx.stroke();
  }
  if(c.aim&&c.attack){
   path([[-9,-6],[0,-9+br],[10,-4],[9,0],[0,-4]],'rgba(13,13,12,.22)',null);
   seg(-5,-7,6,-1,p.metal,.7);
   if(c.kick>.05){
    // Distinct rifle/pistol shoulder bracing during the real shooting cooldown.
    seg(-9,-5,8-c.weaponOffset,-5,p.metal,.8+c.kick*.4);
    ellipse(13-c.weaponOffset,-16,1.8+c.kick*.8,2.7+c.kick*1.4,
     'rgba(249,207,106,'+(c.flash*.65)+')');
   }
  }else if(c.kind==='sword'&&c.attack){
   seg(-11,-5,-7-c.stride*.6,4,p.seam,1.4);
  }
  if(c.kind==='general'&&c.attack){
   seg(-12,-1,-11-c.shoulder*.7,6,p.metal,1.2);
  }
  if(c.startled>.01){
   ring(0,-2,15+c.startled*2,'rgba(245,223,147,'+(c.startled*.24)+')',1.2);
  }
 }
 // No static arms, gloves or bare hands attached to the top-down model.
 // The original active walk, aim and strike animations are retained.
 // A collar and seam seen through the shoulders.
 ellipse(0,-5.5,6.7,4.6,p.shadow);ellipse(0,-6,5.8,3.8,p.light);
 seg(-8,8,8,8,p.strap,2.7);
 // Costumes retain the tiny top-down silhouettes while gaining readable seams.
 seg(-10,-5,-8.5,6,p.seam,.85);seg(10,-5,8.5,6,p.seam,.85);
 seg(-5.1,-5,-3.1,5,'rgba(255,229,176,.20)',.8);
 seg(5.1,-5,3.1,5,'rgba(12,9,8,.34)',.8);
 for(const side of [-1,1]){
  seg(side*10,-8,side*14,-3,p.seam,1);
  seg(side*10,-6,side*13,-2,p.light,.7);
 }
 path([[-2,6],[2,6],[2,9],[-2,9]],p.metal,p.rim,.7);
 if(type==='simona'){
  // Paired brass gazyr on the original Georgian chokha.
  for(const side of [-1,1])for(let i=0;i<5;i++){
   const cx=side*(7.5-i*.17),cy=-4+i*1.8;
   seg(cx-1.1,cy,cx+1.1,cy,'#28150d',2.1);seg(cx-.9,cy,cx+.9,cy,p.metal,1.1);
  }
  seg(-9,-9,7,8,p.rim,3);seg(-9,-9,7,8,'#b5854e',1.1);
  // Brass chokha cartridge strap, hand-stitched collar and clasp.
  seg(-8,-8,8,-8,'#cb9b60',.95);
  seg(-6,-7,-4,6,'rgba(238,173,81,.65)',.8);
  ellipse(0,7,1.6,1.5,'#f0c46e');
 }else if(type==='officer'||boss){
  for(const side of[-1,1])ellipse(side*11.7,-6.2,4.1,2.6,p.metal,-side*.2);
  seg(-6,-5,6,6,p.metal,1.3);
  ellipse(4.7,0,2.1,2.1,'#ead08b');
  if(boss){
   ellipse(-4.7,1.3,2.1,2.1,'#9cbdc8');
   for(const side of [-1,1]){
    seg(side*10,-8,side*15,-7,'#e9bf69',2);
    seg(side*9,-3,side*14,-3,'#e9bf69',1);
   }
   seg(-4,3,4,3,'#ecc578',1.3);
   ellipse(0,1.2,2.2,2,'#9b322f');
  }
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
  seg(-3,-19,3,-19,'#afc279',1);
 }else{
  path([[-8,-16],[-9,-20],[-3,-22],[3,-22],[9,-20],[8,-16]],p.hat,p.rim,.9);
  seg(-8,-17,8,-17,p.metal,boss?2.15:1.5);
  ellipse(0,-12.2,2,2,p.metal);
  if(type==='rifle')seg(-4,-12,4,-12,'#e3a464',1);
  if(type==='officer')seg(-4,-13,4,-13,'#d7bb85',1);
  if(boss)seg(-5,-12,5,-12,'#ffd487',1.5);
  path([[-9,-19],[9,-19],[11,-15],[0,-14],[-11,-15]],p.shadow,p.rim,.8);
  if(boss)ellipse(0,-12,2.8,2.5,'#ae3029');
 }
 ellipse(0,-19,4,1.3,p.skin);
 // Brief costume recoil glint; existing animated equipment remains unchanged.
 if(motion?.kick>0){
   seg(-6,7,6,7+motion.kick,'rgba(235,210,157,'+(.12+motion.kick*.3)+')',.8);
 }
 if(motion?.flash>0&&weapon!=='sword'){
   const k=motion.flash;
   ellipse(19,-29,2.3*k,3.6*k,'rgba(255,217,105,'+(.7*k)+')');
 }
 // Keep animated original weapons and arms; no painted static grip.
 if(opts.rage){seg(-11,7,-6,15,'#d4423c',1.2);seg(11,7,6,15,'#dd5349',1.2);}
 ctx.restore();
}
drawPlayer=function(){
 if(!enabled)return originalPlayer();
 if(P.dead)return;
 const weapon=swordOn?'sword':window.PiraliAlphaGear?.status?.().selected==='shotgun'?'shotgun':'mauser';
 const speed=Math.hypot(P.vx,P.vy);
 const motion=window.PiraliAlphaMotion?.enabled()?
  window.PiraliAlphaMotion.sample(P,'simona',P.ang,speed,shootCD,swordOn):null;
 // Approved for Alpha 0.14: KEEP the exact Alpha 0.13 character body/face/chokha.
 // The original weapon is suppressed inside originalPlayer ONLY while Study D is enabled.
 // New Mauser, sword and shotgun animation is drawn on top AFTER the original 0.13 polish.
 // This is cosmetic only: gameplay, bullets, collision, Firebase and enemies stay untouched.
 originalPlayer();
 topdownPerson('simona',P.x,P.y,P.ang,speed,weapon,{motion});
 if(window.PiraliHybrid014?.isEnabled()){
  window.PiraliHybrid014.draw(ctx,{
   x:sx(P.x),y:sy(P.y),angle:P.ang,speed,motion,weapon,
   sword:swordOn,swordT,time:Date.now(),shoot:shootCD>0
  });
 }
};
drawEnemy=function(e){
 if(!enabled||!e?.alive||e.etype==='landlord')return originalEnemy(e);
 // The landlord is intentionally NOT modified until the user sends his image.
 originalEnemy(e);
 const kind=e.etype==='rifle'?'rifle':e.etype==='officer'?'officer':'sword';
 const weapon=kind==='rifle'?'rifle':kind==='sword'?'sword':'pistol';
 const motion=window.PiraliAlphaMotion?.enabled()?window.PiraliAlphaMotion.sample(e,kind,e.ang,Math.hypot(e.vx||0,e.vy||0),e.sT||0,e.state==='attack'&&kind==='sword'):null;
 const enemyMotion=window.PiraliEnemyMotion?.sample(e,kind,motion)||null;
 if(enemyMotion)window.PiraliEnemyMotion.ground(ctx,sx(e.x),sy(e.y),enemyMotion,kind);
 topdownPerson(kind,e.x,e.y,e.ang,Math.hypot(e.vx||0,e.vy||0),weapon,{motion,enemyMotion});
};
drawBoss=function(b){
 if(!enabled||!b?.alive)return originalBoss(b);
 originalBoss(b);
 const movement=window.PiraliAlphaMotion;
 const motion=movement?.enabled()?movement.sample(b,'general',b.ang,Math.hypot(b.vx||0,b.vy||0),b.sT||0,b.charging||b.groundSlamActive):null;
 const enemyMotion=window.PiraliEnemyMotion?.sample(b,'general',motion)||null;
 if(enemyMotion)window.PiraliEnemyMotion.ground(ctx,sx(b.x),sy(b.y),enemyMotion,'general');
 topdownPerson('general',b.x,b.y,b.ang,Math.hypot(b.vx||0,b.vy||0),'sword',{rage:!!b.rageMode,motion,enemyMotion});
 // These ring accents communicate the existing attack state; hitbox is not changed.
 if(!movement?.enabled())return;
 const px=sx(b.x),py=sy(b.y),t=performance.now()*.0045,warning=b.charging||b.groundSlamActive;
 ctx.save();ctx.translate(px,py);
 if(warning){
  ctx.strokeStyle=b.charging?'rgba(255,173,53,.9)':'rgba(246,72,45,.9)';
  ctx.lineWidth=b.charging?3.2:2.8;ctx.setLineDash([8,5]);ctx.lineDashOffset=-t*7;
  ctx.beginPath();ctx.arc(0,0,43+Math.sin(t*2)*3,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  for(let i=0;i<4;i++){const a=t+i*Math.PI/2;ctx.fillStyle='rgba(255,203,88,.7)';
    ctx.beginPath();ctx.arc(Math.cos(a)*39,Math.sin(a)*39,2.2,0,Math.PI*2);ctx.fill();}
 }else if(b.rageMode){
  ctx.strokeStyle='rgba(245,84,60,'+(.34+Math.sin(t*2)*.12)+')';
  ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,38+Math.sin(t)*2,0,Math.PI*2);ctx.stroke();
 }
 ctx.restore();
};
window.PiraliTopdownPolish=Object.freeze({
 enable:value=>{enabled=!!value;return enabled;},
 isEnabled:()=>enabled,
 originalPlayer,originalEnemy,originalBoss,
 version:'1.46-topdown-visual-refinement',
 touched:['Simona','sword soldier','rifle soldier','officer','general','general rage'],
 landlordUntouched:true
});
})();
