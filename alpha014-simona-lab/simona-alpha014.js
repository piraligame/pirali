/*
 * PIRALI Alpha 0.14 / Simona Study A — true overhead Georgian chokha.
 * Cosmetic renderer ONLY. P.x/y, collision, weapons, cooldowns, damage, Firebase untouched.
 * Facing = game radians (front of figure points along angle).
 * Feet and detached arms intentionally hidden (approved overhead silhouette).
 */
(function(){
'use strict';
const TAU=Math.PI*2;
let enabled=true;
const C={
 edge:'#160d0a', deep:'#30130e', base:'#58251d', lit:'#8d4932',
 high:'#ad6345', lining:'#bc7956', brass:'#deb777',
 darkBrass:'#8d5f33', leather:'#4b2c21', wrap:'#292820',
 wrapLight:'#5a5540', shadow:'#100d0b', skin:'#b78359'
};
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
function poly(c,points,color,stroke=null,width=1){
 c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));
 c.closePath();c.fillStyle=color;c.fill();
 if(stroke){c.lineWidth=width;c.lineJoin='round';c.strokeStyle=stroke;c.stroke();}
}
function oval(c,x,y,rx,ry,color,rotation=0){
 c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,TAU);c.fill();
}
function line(c,x1,y1,x2,y2,color,width=1){
 c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);
 c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();
}
function curve(c,p0,p1,p2,color,width=1){
 c.beginPath();c.moveTo(...p0);c.quadraticCurveTo(...p1,...p2);
 c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();
}
function draw(c,{x=0,y=0,angle=-Math.PI/2,speed=0,motion=null,phase=0,dash=false,shoot=false,scale=1,glow=true}={}){
 const moving=speed>.12;
 const fast=speed>2.2;
 const speedK=moving?clamp(speed/3.2,.35,1):0;
 const gait=motion&&Number.isFinite(motion.step)?motion.step:Math.sin(phase);
 const swing=gait*speedK*(fast?1:0.72);
 const lift=motion&&Number.isFinite(motion.bob)?clamp(motion.bob,-1,3):moving?Math.abs(gait)*2.1:Math.sin(phase*.35)*.15;
 const recoil=motion&&Number.isFinite(motion.kick)?motion.kick:shoot?.75:0;
 const turn=motion&&Number.isFinite(motion.lean)?motion.lean:0;
 const air=dash?1:0;
 const facing=Number.isFinite(motion?.angle)?motion.angle:angle;
 c.save();c.translate(x,y);c.rotate(facing+Math.PI/2+turn);c.scale(scale,scale);
 // Ground contact stays stationary even when upper body bobs.
 oval(c,0,7.5,13.8,4.1,'rgba(11,12,9,.26)');
 oval(c,0,7.8,9.3,2.6,'rgba(10,10,9,.17)');
 c.translate(0,-lift*.66-air*2);
 // Two separated, flowing lower chokha skirts; NO feet/boots.
 const leftSwing=-swing*2.7-air*3.3, rightSwing=swing*2.7+air*3.3;
 poly(c,[[-8,4],[-4.2,5.5],[-4.1+leftSwing,11.7],[-9.5+leftSwing,14.3],[-11,9]],
   C.deep,C.edge,1.05);
 poly(c,[[4.1,5.5],[8,4],[11,9],[9.5+rightSwing,14.3],[4.1+rightSwing,11.7]],
   C.base,C.edge,1.05);
 poly(c,[[-8.1,6],[-5.6,6.6],[-6+leftSwing,11.2],[-9+leftSwing,12.5]],'#74402e');
 poly(c,[[5.6,6.6],[8.1,6],[9+rightSwing,12.5],[6+rightSwing,11.2]],C.lit);
 curve(c,[-8.5,8],[-10+leftSwing,10],[-9+leftSwing,13.3],C.lining,.85);
 curve(c,[8.5,8],[10+rightSwing,10],[9+rightSwing,13.3],C.lining,.85);

 // Lateral shoulders articulate *inside* fabric (no detached toy arms).
 const rock=swing*1.5-recoil*1.15;
 for(const side of[-1,1]){
   const yoff=side*rock;
   poly(c,[[side*7,-8.2+yoff],[side*12,-8.9+yoff],[side*16,-4.6+yoff],
      [side*15.4,1+yoff],[side*11,6.4+yoff],[side*8.4,5.2+yoff]],
      side<0?'#753828':C.deep,C.edge,1);
   line(c,side*13,-6+yoff,side*12,3+yoff,
      side<0?'#b77856':'#663125',.9);
 }

 // Fitted torso, broad shoulders taper into slim waist.
 const torso=c.createLinearGradient(-14,-9,12,8);
 torso.addColorStop(0,C.lit);
 torso.addColorStop(.38,C.base);
 torso.addColorStop(.85,C.deep);
 torso.addColorStop(1,C.edge);
 poly(c,[[-9,-11],[-13.1,-7.5],[-12.5,-1.2],[-10,7],
   [-6.8,10],[6.8,10],[10,7],[12.5,-1.2],[13.1,-7.5],[9,-11]],
   torso,C.edge,1.5);
 // Seam, lapels and stitched Georgian chokha panel.
 poly(c,[[-4.8,-9.8],[0,-8.7],[0,7.1],[-4.2,8.4],[-5.8,1.2]],'#7b3729');
 poly(c,[[0,-8.7],[4.8,-9.8],[5.8,1.2],[4.2,8.4],[0,7.1]],'#3d1a15');
 line(c,0,-9,0,7.9,C.edge,1.1);
 for(let sign of[-1,1]){
   curve(c,[sign*4.9,-9],[sign*4.4,-.2],[sign*4.3,7.5],
      sign<0?'#d28a5a':'#95533e',.85);
 }
 // Crossbody leather sling reads diagonally in a top-down view.
 line(c,-10.3,-8.4,6.7,8.4,C.leather,2.85);
 line(c,-9.8,-8.3,6.5,8.1,'#b88654',.9);
 oval(c,-9.6,-8.5,1.3,1.45,C.brass);
 // Belt and square clasp
 line(c,-8.8,7.3,8.8,7.3,'#2b1b14',3.25);
 line(c,-8.8,7.1,8.8,7.1,'#9e6741',1);
 poly(c,[[-2.5,5.2],[2.5,5.2],[2.5,9.4],[-2.5,9.4]],C.brass,C.edge,.9);
 poly(c,[[-1.2,6.1],[1.2,6.1],[1.2,8.6],[-1.2,8.6]],C.deep);

 // Two neat rows of tapered brass gazyrs; 5 per side, individually rim-lit.
 for(const s of[-1,1]){
   for(let i=0;i<5;i++){
     const xx=s*(7.95-i*.25), yy=-6.15+i*2.12;
     poly(c,[[xx-1.9,yy-1.15],[xx+1.9,yy-1.15],[xx+1.7,yy+1.0],[xx-1.7,yy+1]],C.edge);
     line(c,xx-1.4,yy-.32,xx+1.3,yy-.32,C.darkBrass,2.1);
     line(c,xx-1.3,yy-.83,xx+1.15,yy-.83,C.brass,1.02);
   }
 }
 // Cloth collar under the crown.
 oval(c,0,-8.3,7.9,4.9,C.deep);
 oval(c,0,-9.2,6.3,3.4,'#8f573d');
 curve(c,[-6,-8],[-3,-5.3],[0,-7.8],C.brass,.82);
 curve(c,[6,-8],[3,-5.3],[0,-7.8],C.brass,.82);

 // Qabalakhi: large crown from overhead, not a frontal face.
 oval(c,.1,-13.2,9.2,9.3,C.edge);
 oval(c,-.2,-13.8,8.15,8.15,C.wrap);
 oval(c,-2.1,-15.75,5.65,4.35,C.wrapLight,-.25);
 oval(c,-2.6,-17,3.3,1.8,'rgba(209,188,136,.19)',-.3);
 c.beginPath();c.arc(-.2,-13.8,7.0,.25,Math.PI*1.93);
 c.strokeStyle='#171811';c.lineWidth=1.75;c.stroke();
 curve(c,[-5.5,-15.8],[.8,-11],[5.5,-15.7],'#93856b',1.02);
 curve(c,[-6.1,-11.2],[-2,-8.2],[5.1,-11.3],'#1d1d17',1.2);
 oval(c,.1,-19.7,1.45,1.45,C.brass);
 oval(c,.1,-19.7,.64,.64,'#f4d892');
 // Cloth tail changes position with steps.
 poly(c,[[6,-10],[10,-7],[11.3+swing*.55,-2.2],[14+swing,1.3],[11,0],[8.1,-5]],
   C.wrap,C.edge,.8);
 line(c,9.8,-5,11+swing*.7,-.6,'#847a58',.75);
 // Only a sliver of face visible from the elevated camera.
 oval(c,0,-5.95,3.4,1.13,C.skin);
 // Controlled visual response to pistol recoil; no change to game shooting.
 if(recoil>.04){
   line(c,-12,-4, -10-recoil*2.4,4,'#c99568',1.05+recoil*.65);
   if(glow)oval(c,15,-22,1.9+recoil*.7,2.2+recoil*.8,
     'rgba(255,211,111,'+(recoil*.48)+')');
 }
 if(dash){
   line(c,-9,15,-8,21,'rgba(198,169,128,.55)',1.2);
   line(c,9,15,8,21,'rgba(198,169,128,.55)',1.2);
 }
 c.restore();
}
window.PiraliSimona014=Object.freeze({
 version:'alpha014-simona-study-a',
 draw,
 enable(v){enabled=!!v;return enabled;},
 isEnabled(){return enabled;},
 metadata:{poses:['idle','walk','run','fire','dash'],orientations:4,collisionUntouched:true,weaponLogicUntouched:true}
});
})();
