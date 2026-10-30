(function(){
'use strict';
const TAU=Math.PI*2, C={edge:'#160d0a'};
const pt=(x,y)=>[x,y];
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function poly(c,p,fill,edge=null,w=1){
 c.beginPath();for(let i=0;i<p.length;i++)i?c.lineTo(...p[i]):c.moveTo(...p[i]);
 c.closePath();c.fillStyle=fill;c.fill();
 if(edge){c.strokeStyle=edge;c.lineWidth=w;c.lineJoin='round';c.stroke();}
}
function oval(c,x,y,rx,ry,color,ang=0){
 c.beginPath();c.ellipse(x,y,rx,ry,ang,0,TAU);c.fillStyle=color;c.fill();
}
function seg(c,x1,y1,x2,y2,color,w=1){
 c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);
 c.strokeStyle=color;c.lineCap='round';c.lineWidth=w;c.stroke();
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

let enabled=false; // Original 0.13 weapon stays active for the LEFT panel.
function draw(c,{x=0,y=0,angle=-Math.PI/2,speed=0,
  motion=null,sword=false,swordT=22,weapon='mauser',time=performance.now(),shoot=false,glow=true}={}){
 const moving=speed>.12,run=speed>2.2;
 const speedK=moving?clamp(speed/3.2,.32,1):0;
 const step=Number.isFinite(motion?.step)?motion.step:Math.sin(time*.008);
 const swing=step*speedK*(run?1:.77);
 const bob=Number.isFinite(motion?.bob)?clamp(motion.bob,-1,3):moving?Math.abs(step)*2.1:0;
 const kick=clamp(Number.isFinite(motion?.kick)?motion.kick:shoot?.85:0,0,1);
 const lean=Number.isFinite(motion?.lean)?motion.lean:swing*.045;
 const facing=Number.isFinite(motion?.angle)?motion.angle:angle;
 const activeSword=sword||weapon==='sword';
 const t=clamp(1-(Number(swordT)||0)/22,0,1),ease=t*t*(3-2*t);
 const yaw=activeSword?-1.30+ease*2.60:0;
 const rightWrist=activeSword?pt(16+Math.sin(yaw)*5.1,-11-Math.cos(yaw)*3.1):
  weapon==='shotgun'?pt(5.5,-10.2+kick*3.5):pt(10.4+swing*1.05,-11.4+kick*3.6);
 c.save();c.translate(x,y);c.rotate(facing+Math.PI/2+lean);
 c.translate(0,-bob*.68);
 if(activeSword)blade(c,rightWrist,yaw,true,t,glow);
 else if(weapon==='shotgun')shotgun(c,rightWrist,kick,swing,glow);
 else mauser(c,rightWrist,kick,swing,glow);
 c.restore();
}
window.PiraliHybrid014=Object.freeze({
 version:'alpha014-approved-013-body-with-014-weapons-studyD',
 draw,enable:v=>(enabled=!!v),isEnabled:()=>enabled,
 metadata:{base:'alpha-0.13-original-full-renderer',weapons:'alpha-0.14-study-c-exact',
  mauser:true,shotgun:true,sword:true,bodyUntouched:true,gameplayUntouched:true}
});
})();