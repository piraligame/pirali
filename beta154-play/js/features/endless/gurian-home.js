/* PIRALI BETA 1.06 — Gurian wooden cottage replaces the stage-11 church. */
(function(){
'use strict';
const original=drawChurch;
const labels={ka:'სახლი',en:'HOME',ru:'ДОМ',zh:'家'};
function cottage(){
 const x=sx(CHURCH_X),y=sy(CHURCH_Y);
 if(x< -240||x>W+240||y< -245||y>H+220)return;
 const cleared=!!window.PiraliEndless?.state?.().cleared;
 ctx.save();ctx.translate(x,y);
 // Small Gurian wooden oda house in a fenced yard.
 ctx.fillStyle='rgba(4,5,2,.42)';ctx.beginPath();ctx.ellipse(10,75,152,30,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#97724b';ctx.fillRect(-96,-28,192,126);
 ctx.fillStyle='#57371f';ctx.fillRect(-83,-13,166,101);
 for(let yy=0;yy<9;yy++){
  ctx.strokeStyle=yy%2?'#c69a67':'#805333';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(-82,-4+yy*10);ctx.lineTo(82,-4+yy*10);ctx.stroke();
 }
 // Two small windows with frames.
 for(const wx of[-56,56]){
  ctx.fillStyle='#e5bc71';ctx.fillRect(wx-15,16,30,32);
  ctx.fillStyle='#355263';ctx.fillRect(wx-11,20,22,24);
  ctx.strokeStyle='#f2d4a0';ctx.lineWidth=3;ctx.strokeRect(wx-11,20,22,24);
  ctx.beginPath();ctx.moveTo(wx,20);ctx.lineTo(wx,44);ctx.stroke();
 }
 // Entrance porch and door at the SOUTH face.
 ctx.fillStyle='#80532d';ctx.fillRect(-39,63,78,47);
 ctx.fillStyle='#e1b981';ctx.fillRect(-31,59,62,12);
 ctx.fillStyle='#261b14';ctx.fillRect(-20,35,40,63);
 ctx.fillStyle=cleared?'#f3be55':'#77512f';ctx.fillRect(-13,40,26,57);
 ctx.fillStyle='#f4d691';ctx.beginPath();ctx.arc(7,74,3,0,Math.PI*2);ctx.fill();
 for(let i=0;i<3;i++){ctx.fillStyle='#b28a5f';ctx.fillRect(-34,106+i*6,68,4);}
 // Pitched, slightly asymmetric timber roof.
 ctx.fillStyle='#301c12';ctx.beginPath();ctx.moveTo(-116,-20);ctx.lineTo(0,-108);
 ctx.lineTo(114,-20);ctx.lineTo(90,5);ctx.lineTo(0,-67);ctx.lineTo(-90,5);ctx.closePath();ctx.fill();
 ctx.fillStyle='#76432b';ctx.beginPath();ctx.moveTo(-108,-20);ctx.lineTo(0,-104);ctx.lineTo(108,-20);ctx.lineTo(87,-16);ctx.lineTo(0,-79);ctx.lineTo(-87,-16);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#ba7d52';ctx.lineWidth=3;
 for(let i=0;i<6;i++){
  const t=i/6;
  ctx.beginPath();ctx.moveTo(-102+t*105,-18-t*74);ctx.lineTo(0,-92);ctx.stroke();
 }
 // Fence rails with a walkable centered gate aligned to the porch.
 ctx.strokeStyle='#ae8355';ctx.lineWidth=7;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(-165,-40);ctx.lineTo(-165,153);ctx.lineTo(-43,153);
 ctx.moveTo(43,153);ctx.lineTo(165,153);ctx.lineTo(165,-40);ctx.stroke();
 ctx.strokeStyle='#d2ad77';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(-165,127);ctx.lineTo(-43,127);ctx.moveTo(43,127);ctx.lineTo(165,127);ctx.stroke();
 for(let xx=-160;xx<=160;xx+=19){
  if(Math.abs(xx)<42)continue;
  ctx.fillStyle='#72502f';ctx.fillRect(xx-3,117,7,42);
  ctx.fillStyle='#d2a678';ctx.fillRect(xx-3,112,7,8);
 }
 ctx.lineWidth=5;ctx.strokeStyle='#e4bd86';
 if(cleared){
  ctx.beginPath();ctx.moveTo(-43,153);ctx.lineTo(-80,128);
  ctx.moveTo(43,153);ctx.lineTo(80,128);ctx.stroke();
 }else{
  ctx.beginPath();ctx.moveTo(-43,153);ctx.lineTo(0,136);ctx.lineTo(43,153);ctx.stroke();
 }
 if(cleared){
  const glow=ctx.createRadialGradient(0,75,2,0,75,95);
  glow.addColorStop(0,'rgba(255,225,119,.37)');glow.addColorStop(1,'rgba(255,225,119,0)');
  ctx.fillStyle=glow;ctx.fillRect(-97,0,194,165);
 }
 ctx.font='bold 18px sans-serif';ctx.textAlign='center';ctx.shadowColor='#000';ctx.shadowBlur=7;
 ctx.fillStyle='#ffe6ad';
 ctx.fillText(labels[window.PiraliLanguage?.getLanguage?.()||'ka']||labels.ka,0,-122,230);
 ctx.restore();
}
drawChurch=function(){if(level===11)cottage();else original();};
window.PiraliGurianHome=Object.freeze({render:cottage,entry:{x:CHURCH_X,y:CHURCH_Y+65}});
})();