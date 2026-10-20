/* Generate the weapon-only renderer using the EXACT Study C weapon functions.
   Body and animation logic from Alpha 0.13 are not modified. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=__dirname,source=fs.readFileSync(path.resolve(root,'../alpha014-simona-lab/simona-alpha014.js'),'utf8');
const slice=(from,to)=>{
 const i=source.indexOf(from),j=source.indexOf(to,i);
 if(i<0||j<0||j<=i)throw Error('Weapon function bounds not found '+from);
 return source.slice(i,j)
};
const helpers=slice('function mauser(','function draw(c,{');
const shim=`(function(){
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
`+helpers+`
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
})();`;
new vm.Script(shim,{filename:'simona-weapons-only.js'});
fs.writeFileSync(path.join(root,'simona-weapons-only.js'),shim,'utf8');
console.log('HYBRID_BUILD',JSON.stringify({bytes:shim.length,containsMauser:shim.includes('function mauser'),containsShotgun:shim.includes('function shotgun'),containsSword:shim.includes('function blade')}));