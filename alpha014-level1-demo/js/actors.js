/* PIRALI top-down artist study: male Simona variant #4.
   Soft-shaded fully overhead view, no scissor coat tails, no exposed elbows.
   Keeps Mauser, saber and shotgun animations as requested. */
(function(){
'use strict';
const TAU=Math.PI*2;
function poly(c,v,col,edge=null,sw=1){
 c.beginPath();v.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();
 c.fillStyle=col;c.fill();if(edge){c.lineWidth=sw;c.strokeStyle=edge;c.stroke();}
}
function ellipse(c,x,y,w,h,col,a=0){
 c.fillStyle=col;c.beginPath();c.ellipse(x,y,w,h,a,0,TAU);c.fill();
}
function line(c,x,y,X,Y,col,w=1){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke();}
function radial(c,x,y,r,stops){
 const g=c.createRadialGradient(x-r*.3,y-r*.35,0,x,y,r);
 stops.forEach(([p,col])=>g.addColorStop(p,col));return g;
}
function blade(c,swing,slash){
 c.save();c.translate(15,-1);
 const rotate=slash>0?(0.1+(1-slash)*2.4):.25;
 c.rotate(rotate);
 poly(c,[[-2,3],[2,3],[2.3,-5],[-2.3,-5]],'#845d3c','#211a15',.85);
 line(c,-5,-3,5,-3,'#d1ac62',2.8);
 const steel=c.createLinearGradient(-4,-38,3,0);
 steel.addColorStop(0,'#dae5df');steel.addColorStop(.4,'#94a6a8');steel.addColorStop(1,'#46545a');
 poly(c,[[-3,-5],[-3,-27],[-1,-38],[0,-43],[2.5,-31],[3,-5]],steel,'#293333',1);
 line(c,-1.1,-8,-1.2,-31,'#e9ece4',.8);
 if(slash>0){
  c.strokeStyle='rgba(255,230,172,'+Math.min(.66,slash*.58)+')';
  c.lineWidth=1.5;c.beginPath();c.arc(0,-2,38,-.9,1.3);c.stroke();
 }
 c.restore();
}
function mauser(c,recoil=0,flash=0){
 c.save();c.translate(14,-10+recoil*4);
 c.rotate(.13-recoil*.13);
 poly(c,[[-3,7],[3,7],[4,-8],[-4,-8]],'#805537','#241b17',1);
 poly(c,[[-4,-7],[4,-7],[4.6,-17],[-4.6,-17]],'#343d3f','#171a1c',1);
 poly(c,[[-2.5,-17],[2.5,-17],[2.5,-34],[-2.5,-34]],'#647177','#20272b',.85);
 line(c,-1.5,-31,-1.5,-18,'#adb6b6',1);
 poly(c,[[-3,-34],[3,-34],[3,-36],[-3,-36]],'#191e22');
 if(flash>0){
  ellipse(c,0,-37,3+flash*3,4+flash*4,'rgba(255,206,101,'+(flash*.8)+')');
  ellipse(c,0,-39,2,2,'#f9f2cf');
 }
 c.restore();
}
function shotgun(c,recoil=0,flash=0){
 c.save();c.translate(6,-7+recoil*5);
 poly(c,[[-3.8,13],[3.8,13],[4,-8],[-4,-8]],'#96633e','#312116',1);
 poly(c,[[-4,-9],[4,-9],[5,-17],[-5,-17]],'#485052','#171e20',1);
 poly(c,[[-2.5,-15],[2.5,-15],[2.5,-51],[-2.5,-51]],'#68777a','#273034',1);
 line(c,-.95,-17,-.95,-49,'#b7c5c1',.8);
 line(c,2.5,-19,2.5,-47,'#313b3d',1.2);
 if(flash>0){
  ellipse(c,0,-53,4.3,5,'rgba(255,202,87,'+(flash*.75)+')');
  ellipse(c,0,-56,2,3,'#fff5d0');
 }
 c.restore();
}
function figure(c,a,hero=false,time=0){
 const speed=Math.hypot(a.vx||0,a.vy||0);
 const moving=speed>.07,phase=(a.phase||0);
 const step=moving?Math.sin(phase):Math.sin(time*.0015)*.14;
 const bob=moving?Math.abs(step)*1.6:Math.sin(time*.0012)*.3;
 const swordSwing=Math.max(0,(a.slash||0));
 const gunKick=Math.max(0,(a.recoil||0));
 const facing=a.angle||0;
 c.save();c.translate(a.x,a.y);
 ellipse(c,7,13,22,10,'rgba(9,17,11,.37)',-.1);
 if(a.hit>0){c.shadowBlur=12;c.shadowColor='#e38d5b'}
 c.rotate(facing+Math.PI/2);
 const scale=hero?1.35:1.20;
 c.scale(scale,scale);
 c.translate(0,-bob);
 // Boots are tucked under the hem in overhead view.
 for(let side of[-1,1]){
   const foot=step*side*2.2;
   ellipse(c,side*7,19+foot,4.3,6.4,hero?'#29241d':'#252925');
   line(c,side*5.7,19+foot,side*8.1,19+foot,'#87704e',.6);
 }
 // Single coherent coat hem, never split into two scissor-like tails.
 const grad=c.createLinearGradient(-18,-13,15,18);
 if(hero){grad.addColorStop(0,'#994a39');grad.addColorStop(.36,'#682d24');grad.addColorStop(1,'#291a18')}
 else{grad.addColorStop(0,a.rank==='officer'?'#74694c':'#626d51');grad.addColorStop(.46,'#454d39');grad.addColorStop(1,'#242c27')}
 poly(c,[[-12,3],[-15,17],[-12,24],[10,24],[14,19],[12,4]],grad,'#221e1b',1.8);
 // Intricate folding of the coat, but no separate dangling panels.
 for(let s of[-1,1]){
  line(c,s*9,9,s*(9+step*1.1),21,hero?'#b77655':'#8d9272',1.1);
  line(c,s*6,13,s*(6+step*.8),21,'rgba(19,19,15,.65)',1);
 }
 // Torso, shoulders slope into waist; lighter side opposite deep shadow.
 const fabric=c.createLinearGradient(-18,-13,17,14);
 if(hero){
  fabric.addColorStop(0,'#ac6042');fabric.addColorStop(.32,'#773528');
  fabric.addColorStop(.72,'#4a221d');fabric.addColorStop(1,'#2a1a17');
 }else{
  fabric.addColorStop(0,a.rank==='officer'?'#8a866c':'#7b8867');
  fabric.addColorStop(.35,a.rank==='officer'?'#5a5b49':'#536449');
  fabric.addColorStop(1,'#29342c');
 }
 poly(c,[[-10,-15],[-17,-11],[-18,-3],[-13,11],[-9,13],[9,13],
  [13,11],[18,-3],[17,-11],[10,-15]],fabric,'#1b201a',1.4);
 // Subtle sleeves on either side, move at shoulders, elbows never shown.
 for(let s of[-1,1]){
  const kick=(hero&&a.weapon==='mauser'&&s===1)?gunKick*2:0;
  const armFront=(a.weapon==='shotgun')?-7:((hero&&s===1)?-8:2+step*s*2.1);
  poly(c,[[s*12,-11],[s*18,-7],[s*(18+step*.5),armFront+2+kick],
    [s*13,armFront+4+kick],[s*10,-3]],
    hero?(s<0?'#8d4935':'#4d251f'):'#4f5d45','#1d231e',1);
  line(c,s*15,-7,s*(15+step*.4),armFront+2+kick,
    hero?'#b76d4e':'#8e9673',.9);
 }
 // Belts, gun strap, gazyrs in convincing overhead costume orientation.
 line(c,-10,10,10,10,'#24180f',3);
 line(c,-10,10,10,10,hero?'#aa8556':'#807558',1);
 poly(c,[[-3,8],[3,8],[3,12],[-3,12]],'#d5ad66','#241910',.8);
 line(c,-11,-14,9,11,hero?'#6e4428':'#725b45',3.1);
 line(c,-10,-13,9,11,'#bf986b',1.05);
 if(hero){
  for(const s of[-1,1])for(let i=0;i<6;i++){
   const x=s*(8-i*.13),y=-8+i*2.65;
   line(c,x-2,y,x+2,y,'#1b100d',2.9);
   line(c,x-1.6,y-.5,x+1.6,y-.5,'#ead09a',1.3);
  }
 }else{
  for(let side of[-1,1])line(c,side*8,-11,side*8,3,'#8e9070',1.2);
 }
 // Collar is above sleeves. Neck readable from every rotation.
 ellipse(c,0,-15,8,5,hero?'#402b22':'#36392f');
 ellipse(c,0,-15.5,6,3.1,hero?'#ac8060':'#a18b66');
 // Hair crown viewed from above, unmistakably face forward at local -Y.
 ellipse(c,0,-21,9.7,9.7,'#1a1a15');
 ellipse(c,-1,-22,8.5,8.7,hero?'#31241b':'#414233');
 ellipse(c,-2,-24,5.8,5,hero?'#604536':'#515444');
 // Skin at FORWARD edge, opposite nape; fixes inverted head complaint.
 poly(c,[[-5.3,-25.7],[-3.9,-30.2],[0,-32],[3.9,-30.2],[5.3,-25.7],[3,-26.6],[-3,-26.6]],
   hero?'#b88861':'#9c795c');
 ellipse(c,0,-31,1.35,2.0,'#bd8862');
 line(c,-3.4,-28,-1.6,-28,'#28211c',.65);
 line(c,1.6,-28,3.4,-28,'#28211c',.65);
 // Hairline and back crown highlight stays behind face, never swapped.
 line(c,-6,-24,-1,-26,hero?'#71543b':'#78775c',1);
 // Equipment is in front of body and follows actual aim.
 if(a.weapon==='sword')blade(c,step,swordSwing);
 else if(a.weapon==='shotgun'){
  // Two tucked arms meet rifle receiver; no oversized elbows.
  line(c,-12,-4,3,-17,hero?'#975338':'#6f7f5a',4.4);
  line(c,10,-7,7,-17,hero?'#764232':'#586545',4.3);
  shotgun(c,gunKick,a.flash||0);
 }else if(a.weapon==='mauser'||a.rank==='rifle'||a.rank==='officer'){
  if(a.weapon==='mauser'||hero)mauser(c,gunKick,a.flash||0);
  else shotgun(c,gunKick,a.flash||0);
 }
 c.restore();
}
function hero(c,a,t){figure(c,a,true,t)}
function enemy(c,a,t){
 const k={...a,weapon:a.rank==='sword'?'sword':'shotgun'};
 figure(c,k,false,t);
 if(a.health<a.maxHealth){
  c.fillStyle='rgba(12,16,13,.75)';c.fillRect(a.x-20,a.y-47,40,5);
  c.fillStyle='#bb6751';c.fillRect(a.x-19,a.y-46,38*Math.max(0,a.health/a.maxHealth),3);
 }
}
window.PiraliDemoActors=Object.freeze({hero,enemy});
})();
