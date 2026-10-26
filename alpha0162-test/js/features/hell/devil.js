/* PIRALI Alpha 0.16.1 — animated horned Devil and trident */
(function(){
'use strict';
const normalBoss=drawBoss;
drawBoss=function(b){
 if(level!==6){normalBoss(b);return;}
 const x=sx(b.x),y=sy(b.y);if(x< -120||x>W+120||y< -145||y>H+145)return;
 ctx.save();ctx.translate(x,y);ctx.scale(1.32,1.32);
 const beat=Math.sin(frame*.07),rage=b.rageMode;
 const g=ctx.createRadialGradient(0,-15,5,0,-15,95);g.addColorStop(0,rage?'rgba(255,69,10,.56)':'rgba(184,37,19,.36)');g.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=g;ctx.fillRect(-100,-113,200,200);
 ctx.fillStyle='#15080caa';ctx.beginPath();ctx.ellipse(0,37,45,13,0,0,Math.PI*2);ctx.fill();
 for(const side of[-1,1]){
  ctx.save();ctx.scale(side,1);ctx.fillStyle=rage?'#88261e':'#542027';ctx.strokeStyle='#e85e36';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(14,-12);ctx.quadraticCurveTo(50,-60-beat*8,88,-63-beat*8);ctx.lineTo(70,-25);ctx.lineTo(60,-44);ctx.lineTo(46,2);ctx.lineTo(34,-20);ctx.lineTo(13,12);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#f17b43';ctx.beginPath();ctx.moveTo(14,-12);ctx.lineTo(85,-61-beat*8);ctx.moveTo(22,-5);ctx.lineTo(61,-42);ctx.stroke();ctx.restore();
 }
 ctx.strokeStyle='#8f291f';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(13,20);ctx.bezierCurveTo(47,39,48,-8,72,-15+beat*5);ctx.stroke();
 ctx.fillStyle='#efba62';ctx.beginPath();ctx.moveTo(72,-15+beat*5);ctx.lineTo(63,-27+beat*5);ctx.lineTo(78,-27+beat*5);ctx.closePath();ctx.fill();
 ctx.fillStyle='#1a1014';ctx.fillRect(-22,27,17,12);ctx.fillRect(6,27,17,12);
 ctx.fillStyle='#82231d';ctx.beginPath();ctx.ellipse(0,3,27,34,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=b.hf>0?'#ffe0aa':rage?'#f45e2f':'#b63a2e';ctx.beginPath();ctx.ellipse(0,-11,20,25,0,0,Math.PI*2);ctx.fill();
 for(const side of[-1,1]){
  ctx.fillStyle='#eac99a';ctx.strokeStyle='#783f30';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(side*9,-27);ctx.bezierCurveTo(side*24,-32,side*36,-62,side*18,-74);ctx.bezierCurveTo(side*38,-63,side*39,-35,side*17,-19);ctx.closePath();ctx.fill();ctx.stroke();
 }
 ctx.fillStyle='#ffe32e';ctx.shadowColor='#ff4207';ctx.shadowBlur=10;ctx.beginPath();ctx.ellipse(-9,-13,5,3,-.1,0,Math.PI*2);ctx.ellipse(9,-13,5,3,.1,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 ctx.fillStyle='#260509';ctx.fillRect(-7,-14,2,4);ctx.fillRect(7,-14,2,4);
 ctx.strokeStyle='#3b070b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,10,.1,Math.PI-.1);ctx.stroke();
 ctx.strokeStyle='#bf7646';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(26,33);ctx.lineTo(26,-67);ctx.stroke();
 ctx.strokeStyle='#ffb868';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(26,-69);ctx.lineTo(26,-86);ctx.moveTo(14,-80);ctx.lineTo(14,-66);ctx.quadraticCurveTo(26,-54,38,-66);ctx.lineTo(38,-80);ctx.stroke();
 ctx.fillStyle='#ff712b';ctx.beginPath();ctx.arc(26,-86,5+beat,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#201015';ctx.fillRect(-31,43,62,6);ctx.fillStyle=rage?'#ff6824':'#d33729';ctx.fillRect(-31,43,62*Math.max(0,b.hp/b.maxHp),6);
 ctx.restore();
};
})();
