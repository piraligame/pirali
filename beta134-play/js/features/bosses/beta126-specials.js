/* PIRALI Beta 1.32 — clearer visual boss telegraphs; timings/volley damage unchanged.
 * Every third normal volley is replaced, not added. Same bullet count,
 * bullet speed, projectile lifetime and existing boss HP/cooldown as Beta 1.25.2.
 */
(function(){
'use strict';
const TAU=Math.PI*2;
function fire(b,angle,projectiles,stage,count){
 if(!b?.alive||![7,8,10].includes(stage))return false;
 b._b126Volley=(b._b126Volley||0)+1;
 if(b._b126Volley%3!==0||b._b126Special?.timer>0)return false;
 b._b126Special={timer:26,full:26,angle,count:Math.max(1,count),stage,kind:stage===10?'inferno':'crossfire'};
 return true;
}
function tick(b,dt,projectiles){
 if(!b?.alive||!b._b126Special)return;
 const s=b._b126Special;
 s.timer=Math.max(0,s.timer-Math.min(3,Math.max(0,dt||0)));
 if(s.timer>0)return;
 const n=s.count;
 if(s.kind==='inferno'){
  // Devil's circular trident fire: visible gaps and no additional projectile damage.
  for(let i=0;i<n;i++){
   const a=s.angle+i*TAU/n;
   projectiles.push({x:b.x,y:b.y,vx:Math.cos(a)*4.4,vy:Math.sin(a)*4.4,fp:false,alive:true,life:135});
  }
 }else{
  // General's crossing fan: signalled centre gap between the two wings.
  for(let i=0;i<n;i++){
   const side=i%2===0?-1:1,step=Math.floor(i/2);
   const a=s.angle+side*(.24+step*.23);
   projectiles.push({x:b.x,y:b.y,vx:Math.cos(a)*4.4,vy:Math.sin(a)*4.4,fp:false,alive:true,life:135});
  }
 }
 b._b126Special=null;
}
function draw(ctx,sx,sy,b,frame){
 const s=b?._b126Special;
 if(!b?.alive||!s||s.timer<=0)return;
 const x=sx(b.x),y=sy(b.y),progress=1-s.timer/s.full;
 ctx.save();ctx.translate(x,y);ctx.rotate(s.angle);
 const devil=s.kind==='inferno',radius=devil?66:82;
 ctx.globalAlpha=.52+progress*.42;
 ctx.strokeStyle=devil?'#ff7141':'#ffd277';ctx.fillStyle=devil?'rgba(250,62,26,.16)':'rgba(255,194,65,.13)';
 ctx.lineWidth=2.2+progress*1.8;
 ctx.beginPath();ctx.arc(0,0,radius,0,TAU);ctx.stroke();
 ctx.globalAlpha=.14+progress*.22;
 ctx.beginPath();ctx.arc(0,0,radius,0,TAU);ctx.fill();
 ctx.globalAlpha=.72+progress*.28;
 ctx.strokeStyle=devil?'#ffb16a':'#fff0a8';ctx.lineWidth=4;
 ctx.beginPath();ctx.arc(0,0,radius+9,-Math.PI/2,-Math.PI/2+progress*TAU);ctx.stroke();
 ctx.strokeStyle=devil?'#ff7141':'#ffd277';ctx.lineWidth=2.2;
 if(devil){
  ctx.beginPath();ctx.arc(0,0,16+progress*50,0,TAU);ctx.stroke();
  for(let j=0;j<3;j++){
   const a=j*TAU/3+frame*.01;
   ctx.beginPath();ctx.moveTo(Math.cos(a)*24,Math.sin(a)*24);
   ctx.lineTo(Math.cos(a)*(50+progress*15),Math.sin(a)*(50+progress*15));ctx.stroke();
  }
 }else{
  for(const side of [-1,1]){
   const a=side*.42;
   ctx.beginPath();ctx.moveTo(0,0);
   ctx.lineTo(Math.cos(a)*radius,Math.sin(a)*radius-12);
   ctx.lineTo(Math.cos(a)*radius,Math.sin(a)*radius+12);
   ctx.closePath();ctx.fill();ctx.stroke();
  }
 }
 ctx.globalAlpha=1;ctx.fillStyle='#fff4bd';ctx.font='bold 16px sans-serif';ctx.textAlign='center';
 ctx.fillText('!',0,-radius-8);
 ctx.restore();
}
// The second general has its own ordinary firing timer, so show a warning
// near the end of that existing timer WITHOUT adding bullets or a delay.
function drawSecondaryWarning(ctx,sx,sy,b){
 if(!b?.alive||!Number.isFinite(b.sT)||b.sT>15||b.sT<=0)return;
 const x=sx(b.x),y=sy(b.y),p=1-b.sT/15;
 ctx.save();ctx.translate(x,y);
 ctx.globalAlpha=.35+p*.55;ctx.strokeStyle='#ffe08b';ctx.lineWidth=2+p*1.5;
 ctx.beginPath();ctx.arc(0,0,37+p*11,0,TAU);ctx.stroke();
 ctx.beginPath();ctx.moveTo(-10,-56);ctx.lineTo(0,-67);ctx.lineTo(10,-56);ctx.stroke();
 ctx.restore();
}
window.PiraliBoss126=Object.freeze({fire,tick,draw,drawSecondaryWarning});
})();