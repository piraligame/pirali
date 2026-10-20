/*
 PIRALI Alpha 0.14 Simona / Study B — articulated arms and animated weapons.
 Purely visual. No change to position, collision, hitboxes, combat, inventory or Firebase.
 Original 0.13 is retained on the release channel and when this renderer is disabled.
*/
(function(){
'use strict';
const TAU=Math.PI*2;
let enabled=true;
const C={
 edge:'#160d0a', deep:'#30130e', base:'#58251d', lit:'#8d4932',
 high:'#ad6345', lining:'#bc7956', brass:'#deb777', darkBrass:'#8d5f33',
 leather:'#4b2c21', wrap:'#292820', wrapLight:'#5a5540', skin:'#b78359'
};
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const pt=(x,y)=>[x,y];
function poly(c,p,fill,edge=null,w=1){
 c.beginPath();for(let i=0;i<p.length;i++)i?c.lineTo(...p[i]):c.moveTo(...p[i]);
 c.closePath();c.fillStyle=fill;c.fill();
 if(edge){c.strokeStyle=edge;c.lineWidth=w;c.lineJoin='round';c.stroke();}
}
function oval(c,x,y,rx,ry,color,ang=0){
 c.beginPath();c.ellipse(x,y,rx,ry,ang,0,TAU);c.fillStyle=color;c.fill();
}
function seg(c,x1,y1,x2,y2,color,w=1){
 c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;
 c.lineCap='round';c.lineWidth=w;c.stroke();
}
function curve(c,x1,y1,x2,y2,x3,y3,color,w=1){
 c.beginPath();c.moveTo(x1,y1);c.quadraticCurveTo(x2,y2,x3,y3);
 c.lineWidth=w;c.lineCap='round';c.strokeStyle=color;c.stroke();
}
function joint(c,a,b,d,side){
 // Anatomical shoulder→elbow→wrist; cuffs follow the player instead of freezing.
 const col=side<0?'#7e3b2b':'#48201a',shine=side<0?'#b36b48':'#80442e';
 c.lineJoin='round';
 for(const [color,w] of [[C.edge,8],[col,6.3]]){
  c.beginPath();c.moveTo(...a);c.quadraticCurveTo(b[0],b[1],b[0],b[1]);
  c.lineTo(...d);c.lineCap='round';c.strokeStyle=color;c.lineWidth=w;c.stroke();
 }
 oval(c,b[0],b[1],3.55,3.65,col);
 seg(c,a[0]-.7,a[1],b[0]-.6,b[1],shine,1.1);
 seg(c,b[0]-.3,b[1],d[0]-.5,d[1],shine,.8);
 oval(c,d[0],d[1],3.4,3.2,C.edge);
 oval(c,d[0],d[1],2.5,2.4,C.skin);
}
function mauser(c,hand,kick,sway,glow){
 c.save();c.translate(hand[0],hand[1]);c.rotate(.34+sway*.12-kick*.19);
 // Grip is firmly attached to right hand. Muzzle points forward (-Y).
 poly(c,[[-2.7,2.7],[3,2.7],[3.8,-6.7],[-3.8,-6.7]],'#221b18',C.edge,.75);
 poly(c,[[-2.1,2.1],[2.4,1.7],[2.8,-4.1],[-2.6,-4.1]],'#8f5b3c',C.edge,.6);
 for(let i=0;i<3;i++)seg(c,-1.5,-.5+i*.9,1.8,-.5+i*.9,'#c48e5d',.45);
 // Characteristic boxy Mauser receiver and long visible barrel.
 poly(c,[[-4.2,-5.6],[4.2,-5.6],[4.4,-12.3],[-4.4,-12.3]],'#33383a','#121516',1);
 poly(c,[[-2.6,-11.7],[2.6,-11.7],[2.6,-22.5],[-2.6,-22.5]],'#535c61','#171a1b',.9);
 seg(c,-1.65,-20.6,-1.65,-11.9,'#89949a',.85);
 poly(c,[[-2.7,-21.7],[2.7,-21.7],[2.7,-24.3],[-2.7,-24.3]],'#22282c','#141719',.65);
 seg(c,-1.1,-24.2,1.1,-24.2,'#c4c6bd',.7);
 poly(c,[[-1.4,-5],[1.4,-5],[1.4,-8],[-1.4,-8]],'#1c1c1b');
 if(kick>.34&&glow){
  c.fillStyle='rgba(255,198,92,'+(.68*kick)+')';
  poly(c,[[0,-24],[2,-29],[0,-36],[-2,-29]],'rgba(255,220,114,'+(.75*kick)+')');
  oval(c,0,-25,1.6,2.3,'#fff1c8');
 }
 c.restore();
}
function shotgun(c,hand,kick,sway,glow){
 c.save();c.translate(hand[0],hand[1]);c.rotate(sway*.033-kick*.105);
 // Wooden stock, receiver, twin sight lines and long dark hunting barrel.
 poly(c,[[-3,7],[3.4,7],[3.4,-7],[-3,-7]],'#8e5d37','#221912',.9);
 seg(c,-1.8,6,-1.8,-5,'#c8965d',1);
 poly(c,[[-4,-6],[4.2,-6],[4.4,-14],[-4,-14]],'#363c3e','#161b1d',.8);
 poly(c,[[-2.3,-13],[2.3,-13],[2.3,-36],[-2.3,-36]],'#616b6d','#202628',.8);
 seg(c,-.8,-34,-.8,-14,'#adb7b2',.7);
 seg(c,2.4,-32,2.4,-15,'#292c30',1);
 poly(c,[[-3,-36],[3,-36],[3,-38],[-3,-38]],'#22272b');
 if(kick>.3&&glow){
  oval(c,0,-39,3.3,4.8,'rgba(255,206,99,'+(kick*.6)+')');
  oval(c,0,-42,1.65,3.4,'#fff1c8');
 }
 c.restore();
}
function blade(c,hand,yaw,attack,progress,glow){
 c.save();c.translate(...hand);c.rotate(yaw);
 // Rigid curved blade attached to an actual animated wrist/hand.
 poly(c,[[-4,5],[4,5],[3.5,-4],[-3.5,-4]],'#684127','#241c15',.8);
 seg(c,-6,0,6,0,'#d6a34c',2.9);
 seg(c,0,6,0,-2,'#8d5c31',2.2);
 const gleam=c.createLinearGradient(-4,-45,5,0);
 gleam.addColorStop(0,'#ecf3ed');gleam.addColorStop(.5,'#9daeb3');gleam.addColorStop(1,'#505c5e');
 poly(c,[[-2.8,-4],[-3.8,-19],[-1.7,-34],[1,-43],[2.6,-34],[3.6,-19],[2.7,-4]],
   gleam,'#37464b',.8);
 seg(c,-1.1,-11,-.9,-33,'rgba(255,255,255,.67)',.65);
 if(attack&&glow){
  c.strokeStyle='rgba(240,231,193,'+(.32+Math.sin(progress*Math.PI)*.24)+')';
  c.lineWidth=1.7;c.beginPath();c.arc(0,0,37,-1.1,.15);c.stroke();
 }
 c.restore();
}
function draw(c,{
 x=0,y=0,angle=-Math.PI/2,speed=0,motion=null,phase=0,dash=false,shoot=false,
 weapon='mauser',sword=false,swordT=22,parry=false,invincible=false,
 scale=1,glow=true,time=performance.now(),radius=18
}={}){
 const activeSword=sword||weapon==='sword';
 const gun=weapon==='shotgun'?'shotgun':'mauser';
 const moving=speed>.12,run=speed>2.2;
 const speedK=moving?clamp(speed/3.2,.32,1):0;
 const step=Number.isFinite(motion?.step)?motion.step:Math.sin(phase);
 const swing=step*speedK*(run?1:.77);
 const bob=Number.isFinite(motion?.bob)?clamp(motion.bob,-1,3):moving?Math.abs(step)*2.1:Math.sin(time*.0016)*.12;
 const kick=clamp(Number.isFinite(motion?.kick)?motion.kick:shoot?.85:0,0,1);
 const lean=Number.isFinite(motion?.lean)?motion.lean:swing*.045;
 const facing=Number.isFinite(motion?.angle)?motion.angle:angle;
 const t=clamp(1-(Number(swordT)||0)/22,0,1),ease=t*t*(3-2*t);
 // Existing i-frame/dash state remains a cosmetic draw-state, not a physics change.
 c.save();if(invincible&&Math.floor(time/85)%2===0)c.globalAlpha=.62;
 if(dash)c.globalAlpha*=.67;
 c.translate(x,y);
 oval(c,0,8.2,13.7,4.5,'rgba(7,9,6,.26)');
 oval(c,0,7.8,8.4,2.4,'rgba(6,8,5,.15)');
 c.rotate(facing+Math.PI/2+lean);
 c.scale(scale,scale);c.translate(0,-bob*.68-(dash?2:0));
 // Skirts/coat tails respond to alternate steps.
 const ls=-swing*2.9-(dash?3:0),rs=swing*2.9+(dash?3:0);
 poly(c,[[-8,4],[-4.1,5.5],[-4.1+ls,11.7],[-9.5+ls,14.3],[-11,9]],C.deep,C.edge,1.05);
 poly(c,[[4.1,5.5],[8,4],[11,9],[9.5+rs,14.3],[4.1+rs,11.7]],C.base,C.edge,1.05);
 poly(c,[[-8,6],[-5.5,6.6],[-6+ls,11.2],[-9+ls,12.5]],'#74402e');
 poly(c,[[5.5,6.6],[8,6],[9+rs,12.5],[6+rs,11.2]],C.lit);
 curve(c,-8.5,8,-10+ls,10,-9+ls,13.3,C.lining,.85);
 curve(c,8.5,8,10+rs,10,9+rs,13.3,C.lining,.85);
 // Coat shoulders should never look like rigid mounted decorations.
 for(const side of[-1,1]){
  const o=side*swing*1.5-kick*.5;
  poly(c,[[side*7,-8.2+o],[side*12,-8.9+o],[side*16,-4.6+o],
    [side*15.4,1+o],[side*11,6.4+o],[side*8.4,5.2+o]],
   side<0?'#753828':C.deep,C.edge,1);
 }
 const grad=c.createLinearGradient(-14,-9,12,8);
 grad.addColorStop(0,C.lit);grad.addColorStop(.38,C.base);
 grad.addColorStop(.85,C.deep);grad.addColorStop(1,C.edge);
 poly(c,[[-9,-11],[-13,-7.5],[-12.5,-1.2],[-10,7],[-6.8,10],
  [6.8,10],[10,7],[12.5,-1.2],[13,-7.5],[9,-11]],grad,C.edge,1.5);
 poly(c,[[-4.8,-9.8],[0,-8.7],[0,7.1],[-4.2,8.4],[-5.8,1.2]],'#7b3729');
 poly(c,[[0,-8.7],[4.8,-9.8],[5.8,1.2],[4.2,8.4],[0,7.1]],'#3d1a15');
 seg(c,0,-9,0,7.9,C.edge,1.1);
 for(const sign of[-1,1]){
  curve(c,sign*4.9,-9,sign*4.4,-.2,sign*4.3,7.5,
    sign<0?'#d28a5a':'#95533e',.85);
 }
 seg(c,-10.3,-8.4,6.7,8.4,C.leather,2.85);
 seg(c,-9.8,-8.3,6.5,8.1,'#b88654',.9);
 oval(c,-9.6,-8.5,1.3,1.45,C.brass);
 seg(c,-8.8,7.3,8.8,7.3,'#2b1b14',3.25);
 seg(c,-8.8,7.1,8.8,7.1,'#9e6741',1);
 poly(c,[[-2.5,5.2],[2.5,5.2],[2.5,9.4],[-2.5,9.4]],C.brass,C.edge,.9);
 poly(c,[[-1.2,6.1],[1.2,6.1],[1.2,8.6],[-1.2,8.6]],C.deep);
 for(const s of[-1,1])for(let i=0;i<5;i++){
  const xx=s*(7.95-i*.25),yy=-6.15+i*2.12;
  poly(c,[[xx-1.9,yy-1.15],[xx+1.9,yy-1.15],[xx+1.7,yy+1],[xx-1.7,yy+1]],C.edge);
  seg(c,xx-1.4,yy-.32,xx+1.3,yy-.32,C.darkBrass,2.1);
  seg(c,xx-1.3,yy-.83,xx+1.15,yy-.83,C.brass,1.02);
 }
 // Distinct stride phase for LEFT arm. The RIGHT arm grips the equipped weapon.
 const idlePulse=moving?0:Math.sin(time*.002)*.42;
 const leftElbow=pt(-18.7,-.3-swing*3.5+idlePulse);
 const leftWrist=activeSword?pt(-15.7,-9.2+swing*3.0):
  gun==='shotgun'?pt(-2.7,-16.9+kick*1.2):pt(-17.5,5.7-swing*6.1+idlePulse);
 const rightElbow=pt(19.1,-.5+swing*2.8+kick*2.0);
 const yaw=activeSword?-1.30+ease*2.60:0;
 const rightWrist=activeSword?pt(16+Math.sin(yaw)*5.1,-11-Math.cos(yaw)*3.1):
  gun==='shotgun'?pt(5.5,-10.2+kick*3.5):pt(10.4+swing*1.05,-11.4+kick*3.6);
 joint(c,pt(-12,-5.6),leftElbow,leftWrist,-1);
 joint(c,pt(12,-5.6),rightElbow,rightWrist,1);
 // Head/collar above arms, keep the approved top-down crown.
 oval(c,0,-8.3,7.9,4.9,C.deep);
 oval(c,0,-9.2,6.3,3.4,'#8f573d');
 curve(c,-6,-8,-3,-5.3,0,-7.8,C.brass,.82);
 curve(c,6,-8,3,-5.3,0,-7.8,C.brass,.82);
 oval(c,.1,-13.2,9.2,9.3,C.edge);
 oval(c,-.2,-13.8,8.15,8.15,C.wrap);
 oval(c,-2.1,-15.75,5.65,4.35,C.wrapLight,-.25);
 oval(c,-2.6,-17,3.3,1.8,'rgba(209,188,136,.19)',-.3);
 c.beginPath();c.arc(-.2,-13.8,7,.25,Math.PI*1.93);
 c.strokeStyle='#171811';c.lineWidth=1.75;c.stroke();
 curve(c,-5.5,-15.8,.8,-11,5.5,-15.7,'#93856b',1.02);
 curve(c,-6.1,-11.2,-2,-8.2,5.1,-11.3,'#1d1d17',1.2);
 oval(c,.1,-19.7,1.45,1.45,C.brass);
 oval(c,.1,-19.7,.64,.64,'#f4d892');
 poly(c,[[6,-10],[10,-7],[11.3+swing*.55,-2.2],[14+swing,1.3],[11,0],[8.1,-5]],
  C.wrap,C.edge,.8);
 seg(c,9.8,-5,11+swing*.7,-.6,'#847a58',.75);
 oval(c,0,-5.95,3.4,1.13,C.skin);
 // No duplicate fixed legacy weapon: every weapon follows its grip.
 if(activeSword)blade(c,rightWrist,yaw,true,t,glow);
 else if(gun==='shotgun')shotgun(c,rightWrist,kick,swing,glow);
 else mauser(c,rightWrist,kick,swing,glow);
 if(dash){
  seg(c,-9,15,-8,20,'rgba(130,214,233,.7)',1.2);
  seg(c,9,15,8,20,'rgba(130,214,233,.7)',1.2);
 }
 c.restore();
 // Status rings remain in world-space and follow the true P.r used in the game.
 if(parry||dash){
  c.save();c.translate(x,y);
  if(parry){c.strokeStyle='#f8e838';c.lineWidth=3;c.shadowColor='#f8e838';c.shadowBlur=17;
   c.beginPath();c.arc(0,0,radius+10,0,TAU);c.stroke();}
  if(dash){c.strokeStyle='rgba(85,204,255,.7)';c.lineWidth=2.5;
   c.beginPath();c.arc(0,0,radius+6,0,TAU);c.stroke();}
  c.restore();
 }
}
window.PiraliSimona014=Object.freeze({
 version:'alpha014-simona-study-b',
 draw,enable:v=>(enabled=!!v),isEnabled:()=>enabled,
 metadata:{poses:['idle','walk','run','fire','dash','sword','shotgun'],
 orientations:4,articulatedArms:true,animatedSword:true,animatedMauser:true,
 shotgunModel:true,collisionUntouched:true,weaponLogicUntouched:true}
});
})();
