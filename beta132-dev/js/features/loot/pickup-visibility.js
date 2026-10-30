/* PIRALI Beta 1.32: distinct accessible ground-item outlines.
   Visual-only; pickup counts, positions, amount and collision are unchanged. */
(function(){
'use strict';
const COLORS={
 ammo:'#ffd16e',health:'#ff6570',herb:'#82ed8a',
 medal:'#ffe16b','alpha-shells':'#ffbd64',
 'alpha-shotgun':'#ffdca0','large-heart':'#ff8b9b',
 'hell-coins':'#ffe17b'
};
// Strong, shape-coded outlines stay readable on small screens and in dark biomes.
// One capped shadow per visible pickup; does not change loot quantities or positions.
const IMPORTANT=new Set(['ammo','health','alpha-shells','large-heart']);
function draw(ctx,pk,x,y,frame){
 if(!pk||pk.col)return;
 const color=COLORS[pk.type]||'#f1c87b';
 const important=IMPORTANT.has(pk.type),pulse=.5+.5*Math.sin(frame*.065+(pk.bob||0));
 const radius=(important?15:11)+pulse*(important?3.2:2);
 ctx.save();ctx.translate(x,y-7);
 ctx.globalAlpha=important?.85:.45;
 ctx.strokeStyle='rgba(17,10,5,.86)';ctx.lineWidth=important?5:3.5;
 ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();
 ctx.strokeStyle=color;ctx.lineWidth=important?2.7:2.1;
 ctx.shadowColor=color;ctx.shadowBlur=important?9:5;
 ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();
 ctx.shadowBlur=0;ctx.globalAlpha=.67+.29*pulse;
 ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=2.2;
 if(pk.type==='health'||pk.type==='large-heart'){
  // Cross mark: distinct from bullets even without color perception.
  ctx.fillRect(-1.8,-6.2,3.6,12.4);ctx.fillRect(-6.2,-1.8,12.4,3.6);
 }else if(pk.type==='ammo'||pk.type==='alpha-shells'){
  const h=pk.type==='alpha-shells'?13:11,w=pk.type==='alpha-shells'?6:4.5;
  ctx.fillRect(-w/2,-h/2,w,h-3);
  ctx.beginPath();ctx.moveTo(-w/2,-h/2);ctx.lineTo(0,-h/2-4);ctx.lineTo(w/2,-h/2);ctx.stroke();
 }else{
  ctx.beginPath();ctx.arc(0,0,3.1,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();
}
window.PiraliPickupVisibility=Object.freeze({draw});
})();
