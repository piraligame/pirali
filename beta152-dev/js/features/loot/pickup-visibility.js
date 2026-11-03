/* PIRALI Beta 1.23: restrained pulsing ground-item halos.
   Visual-only; pickup counts, positions, amount and collision are unchanged. */
(function(){
'use strict';
const COLORS={
 ammo:'#ffd16e',health:'#ff6570',herb:'#82ed8a',
 medal:'#ffe16b','alpha-shells':'#ffbd64',
 'alpha-shotgun':'#ffdca0','large-heart':'#ff8b9b',
 'hell-coins':'#ffe17b'
};
function draw(ctx,pk,x,y,frame){
 if(!pk||pk.col||window.PiraliBulletArt136?.suppressHalo(pk))return;
 const color=COLORS[pk.type]||'#f1c87b';
 const pulse=.5+.5*Math.sin(frame*.07+(pk.bob||0));
 ctx.save();
 ctx.globalAlpha=.18+pulse*.15;
 ctx.shadowColor=color;ctx.shadowBlur=16;
 ctx.strokeStyle=color;ctx.lineWidth=2.2;
 ctx.beginPath();ctx.arc(x,y-7,12+pulse*3,0,Math.PI*2);ctx.stroke();
 ctx.globalAlpha=.16+pulse*.11;
 ctx.fillStyle=color;
 ctx.beginPath();ctx.arc(x,y-7,6+pulse*2.3,0,Math.PI*2);ctx.fill();
 ctx.restore();
}
window.PiraliPickupVisibility=Object.freeze({draw});
})();
