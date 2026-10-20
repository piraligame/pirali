/*
 * PIRALI Alpha 0.14 Study E — three gentle improvements over the APPROVED Study D.
 * All paint-only accents; original 0.13 head, outline, body, original movement
 * and exact Study D Mauser / saber / shotgun are left untouched.
 * Does not mutate any gameplay variables or access Firebase.
 */
(function(){
'use strict';
const PI=Math.PI,T=PI*2;
function stroke(c,x,y,xx,yy,color,w=1){
 c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;
 c.lineWidth=w;c.lineCap='round';c.stroke();
}
function linePoints(c,p,color,w=1){
 c.beginPath();p.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));
 c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke();
}
function oval(c,x,y,rx,ry,col){
 c.beginPath();c.ellipse(x,y,rx,ry,0,0,T);c.fillStyle=col;c.fill();
}
function rect(c,x,y,w,h,col){
 c.fillStyle=col;c.fillRect(x,y,w,h);
}
function draw(c,{x=0,y=0,angle=-PI/2,variant=0,motion=null,scale=1.01}={}){
 if(variant===0)return;
 const lean=Number.isFinite(motion?.lean)?motion.lean:0;
 const sway=Number.isFinite(motion?.step)?motion.step:0;
 c.save();
 c.translate(x,y);c.rotate(angle+PI/2+lean);c.scale(scale,scale);
 if(variant===1){
  // The Heritage: carefully polished Georgian chokha trim. Slight refinement,
  // identical approved torso/coat silhouette; no extra arms/tails/hat shapes.
  linePoints(c,[[-10.5,-6],[-8.7,2.8],[-7.8,7.1]],'#c99761',.85);
  linePoints(c,[[10.5,-6],[8.7,2.8],[7.8,7.1]],'#78452f',.80);
  for(const s of[-1,1]){
   for(let i=0;i<4;i++){
    const cy=-3.8+i*1.78,cx=s*(6.15-.13*i);
    stroke(c,cx-1.4,cy,cx+1.5,cy,'#e1bb78',.73);
   }
  }
  // Restitch the diagonal sling, avoiding the face and weapon.
  stroke(c,-8.9,-8.1,6.6,7.9,'#e3b77e',.82);
  stroke(c,-7.8,8.3,7.8,8.3,'#c89450',.75);
  oval(c,0,-18.5,1.5,1.15,'#ebbe70');
 }else if(variant===2){
  // Field-tested Simona: muted leather, worn seams, gentle fabric creases;
  // never damaged geometry, never spikes or scissor tails.
  linePoints(c,[[-11.8,-6],[-12.2,1],[-9.6,6.5]],'#55301f',1.45);
  linePoints(c,[[11.7,-6],[12.3,1],[9.6,6.5]],'#4b271f',1.45);
  stroke(c,-11,-6,-8,3,'#9b7651',.9);
  stroke(c,11,-6,8,3,'#715036',.85);
  // Weathering marks: fixed positions, subtle scratches, no flicker.
  for(const [x,y] of [[-10,-1],[-9.1,1.1],[-8,5.8],[9.5,-1],[8.3,3.8],[4.7,8.1]]){
   stroke(c,x,y,x+1.5,y-.6,'rgba(206,157,111,.67)',.57);
  }
  // A heavier distressed waist strap on the original coat.
  stroke(c,-8,8.1,8,8.1,'#352015',1.55);
  stroke(c,-7.4,8.75,7.4,8.75,'#a47443',.7);
  rect(c,-1.45,7.1,2.9,2.5,'#ad8959');
  stroke(c,-1.7,-7,5.9,4.5,'rgba(41,25,18,.48)',2.5);
  stroke(c,-1.6,-7,5.9,4.5,'#866544',.7);
  oval(c,0,-18.5,1.5,1.15,'#bd9653');
 }else if(variant===3){
  // Noble minimalism: stronger symmetrical embroidery and clear torso lines.
  // Stays within 0.13 body artwork: no different head, elbows or hem.
  linePoints(c,[[-10,-5.5],[-8.7,2],[-6.9,6.9]],'#e0c68f',1.03);
  linePoints(c,[[10,-5.5],[8.7,2],[6.9,6.9]],'#d1ab70',1.03);
  stroke(c,-8.2,8.5,8.2,8.5,'#dfb56f',1.2);
  for(const s of[-1,1]){
   for(let i=0;i<4;i++){
    const cx=s*(7.7-i*.13),cy=-3.5+i*1.85;
    oval(c,cx,cy,1.0,.42,'#f1d38b');
   }
  }
  // Fine spine-like silver/cream line on the chin-to-waist clothing axis.
  stroke(c,0,-2.5,0,5.5,'#ca9565',.53);
  rect(c,-1.7,7.2,3.4,2.35,'#dcc081');
  rect(c,-.9,7.6,1.8,1.45,'#59402b');
  oval(c,0,-18.6,1.68,1.35,'#f3d38b');
  stroke(c,-5.7,-13.8,5.7,-13.8,'rgba(223,192,130,.57)',.85);
 }
 c.restore();
}
window.PiraliCostumeVariants=Object.freeze({
 version:'alpha014-study-e-previews',
 draw,
 options:[
  {id:0,title:'Study D — დამტკიცებული',desc:'არსებული Alpha 0.13 სიმონა + Alpha 0.14-ის იარაღები.'},
  {id:1,title:'A — კლასიკური',desc:'სუფთა ნაკერები, დახვეწილი ოქროსფერი გაზირები და სამხრეები.'},
  {id:2,title:'B — მებრძოლი',desc:'მუქი ტყავის დეტალები, ნაზი ნაკაწრები და გამოყენებული ჩოხის ტექსტურა.'},
  {id:3,title:'C — დახვეწილი',desc:'სიმეტრიული ოქროსფერი გაწყობა, მკაფიო სარტყელი და სადა დეტალები.'}
 ]
});
})();
