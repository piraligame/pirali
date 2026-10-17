/* Beta 0.12: painted Chokhatauri backdrop for level one only. */
(function(){
  'use strict';
  const map=new Image();
  map.decoding='async';
  map.src='assets/images/beta/chokhatauri-level1.webp?v=beta-012a';
  const ready=()=>map.complete&&map.naturalWidth>0;
  window.PiraliBetaLevelOne=Object.freeze({
    isActive(level){return level===1&&ready();},
    draw(ctx,camX,camY,worldWidth,worldHeight){
      ctx.save();
      ctx.imageSmoothingEnabled=true;
      ctx.imageSmoothingQuality='high';
      ctx.drawImage(map,-camX,-camY,worldWidth,worldHeight);
      ctx.restore();
    }
  });
})();
