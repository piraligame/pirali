/* PIRALI 0.16.4f — large golden coin pickup effect. */
(function(){
'use strict';
function draw(ctx,pk,x,y){
 if(pk.type!=='hell-coins')return false;
 const bob=Math.sin((pk.bob||0)*2)*3;
 ctx.save();ctx.translate(x,y-22+bob);
 const glow=ctx.createRadialGradient(0,0,4,0,0,65);
 glow.addColorStop(0,'rgba(255,244,120,.48)');
 glow.addColorStop(1,'rgba(255,190,40,0)');
 ctx.fillStyle=glow;ctx.fillRect(-70,-70,140,140);
 function coin(cx,cy,r){
  const gold=ctx.createRadialGradient(cx-r*.4,cy-r*.45,1,cx,cy,r);
  gold.addColorStop(0,'#fff4aa');gold.addColorStop(.4,'#ffe16c');gold.addColorStop(1,'#b87316');
  ctx.shadowColor='#ffce42';ctx.shadowBlur=12;ctx.fillStyle=gold;
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.strokeStyle='#fff3b0';ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy,r-4,0,Math.PI*2);ctx.strokeStyle='#a16c19';ctx.stroke();
  ctx.font='900 '+Math.round(r*1.2)+'px Georgia,serif';
  ctx.fillStyle='#a16919';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('★',cx,cy+1);
 }
 coin(-22,3,17);coin(22,3,17);coin(0,-12,23);
 ctx.fillStyle='#2b1b08';ctx.fillRect(-33,26,66,24);
 ctx.strokeStyle='#f6c54f';ctx.lineWidth=2;ctx.strokeRect(-33,26,66,24);
 ctx.fillStyle='#fff3a8';ctx.font='900 18px sans-serif';ctx.textAlign='center';
 ctx.fillText('+250',0,39);
 ctx.restore();return true;
}
window.PiraliHellCoinsArt=Object.freeze({draw});
})();
