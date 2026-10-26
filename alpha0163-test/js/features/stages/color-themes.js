/* PIRALI 0.16.2 DEV — gentle colors for newly inserted levels 4, 5, 8, 9.
   This is visual-only. Historical church and original road artwork stay intact. */
(function(){
 'use strict';
 const oldDraw=drawBG;
 const shades={
  4:'rgba(255,208,52,.34)',  // Ganakhleba — bright GOLDEN YELLOW
  5:'rgba(38,100,65,.14)',   // Sameba — green woodlands
  8:'rgba(85,56,123,.22)',   // Road to Infinity — violet evening
  9:'rgba(245,114,28,.33)',  // Under Siege — vivid CARROT ORANGE
 11:'rgba(122,125,132,.35)' // Endless — ASH GREY
 };
 drawBG=function(){
  oldDraw();
  if(level===11){ctx.save();ctx.globalCompositeOperation='saturation';
   ctx.fillStyle='#888';ctx.fillRect(0,0,W,H);ctx.restore();}
  const tint=shades[level];
  if(tint){ctx.save();ctx.fillStyle=tint;ctx.fillRect(0,0,W,H);ctx.restore();}
 };
})();
