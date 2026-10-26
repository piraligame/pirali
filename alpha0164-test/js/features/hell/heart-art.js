/* PIRALI 0.16.1 — drawn separately from generic pickup art. */
(function(){
'use strict';
function draw(ctx,pk,x,y){
 if(pk.type!=='hell-heart')return false;
 const pulse=1+Math.sin((pk.bob||0)*2)*.07;
 ctx.save();
 ctx.translate(x,y-13);
 ctx.scale(pulse,pulse);
 const aura=ctx.createRadialGradient(0,-3,4,0,-3,40);
 aura.addColorStop(0,'rgba(255,201,92,.46)');
 aura.addColorStop(1,'rgba(255,113,73,0)');
 ctx.fillStyle=aura;ctx.fillRect(-44,-49,88,88);
 ctx.shadowColor='#ffae51';ctx.shadowBlur=19;
 ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font='bold 30px sans-serif';ctx.fillText('💖',0,-6);
 ctx.shadowBlur=0;
 ctx.fillStyle='rgba(24,7,10,.9)';ctx.fillRect(-30,15,60,22);
 ctx.strokeStyle='#ffc36e';ctx.lineWidth=1.5;ctx.strokeRect(-30,15,60,22);
 ctx.fillStyle='#ffe99c';ctx.font='900 15px sans-serif';
 ctx.fillText('250',0,27);
 ctx.restore();
 return true;
}
window.PiraliHellHeartArt=Object.freeze({draw});
})();
