/* PIRALI 0.16.2 DEV — gentle colors for newly inserted levels 4, 5, 8, 9.
   This is visual-only. Historical church and original road artwork stay intact. */
(function(){
 'use strict';
 const oldDraw=drawBG;
 const shades={
  4:'rgba(155,83,46,.16)',   // Ganakhleba — ochre sunset
  5:'rgba(38,100,65,.14)',   // Sameba — green woodlands
  8:'rgba(85,56,123,.22)',   // Road to Infinity — violet evening
  9:'rgba(12,47,106,.23)'    // Under Siege — steel-blue night
 };
 drawBG=function(){
  oldDraw();
  const tint=shades[level];
  if(tint){ctx.save();ctx.fillStyle=tint;ctx.fillRect(0,0,W,H);ctx.restore();}
 };
})();
