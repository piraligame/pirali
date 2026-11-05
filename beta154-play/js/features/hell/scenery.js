/* PIRALI Alpha 0.16.1 — ember ambience and fire */
(function(){
'use strict';
const baseBackground=drawBG;
drawBG=function(){
 baseBackground();
 if(level!==10)return;
 ctx.save();ctx.fillStyle='rgba(85,9,14,.28)';ctx.fillRect(0,0,W,H);
 for(const a of trees){
  if(a.kind!=='dead'&&a.kind!=='rock')continue;
  if(Math.abs(Math.floor(a.x*3+a.y*7))%4!==0)continue;
  const x=sx(a.x),y=sy(a.y);if(x< -50||x>W+50||y< -65||y>H+65)continue;
  ctx.save();ctx.translate(x,y);
  const f=25+Math.sin(frame*.075+a.off)*10;
  const g=ctx.createRadialGradient(0,-5,1,0,-5,42);
  g.addColorStop(0,'rgba(255,105,20,.4)');g.addColorStop(1,'rgba(255,60,0,0)');
  ctx.fillStyle=g;ctx.fillRect(-45,-50,90,85);
  ctx.fillStyle='#ed5218';ctx.beginPath();ctx.moveTo(-11,9);ctx.quadraticCurveTo(-15,-10,0,-f);ctx.quadraticCurveTo(15,-7,11,9);ctx.fill();
  ctx.fillStyle='#ffe07b';ctx.beginPath();ctx.moveTo(-4,8);ctx.quadraticCurveTo(-9,-2,2,-f*.55);ctx.quadraticCurveTo(10,1,5,8);ctx.fill();ctx.restore();
 }
 ctx.restore();
};
})();
