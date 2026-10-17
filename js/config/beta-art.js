/* PIRALI Beta 0.08: cosmetic-only historical Georgian top-down art.
   Collision, AI and weapons remain controlled by runtime/*. */
const PiraliBetaArt=(function(){
 'use strict';
 let details=[];
 const palettes=[
  null,
  {soil:'#50653c',highlight:'#a3a570',wood:'#55412c',rock:'#666b59'},
  {soil:'#45574a',highlight:'#9da68c',wood:'#584737',rock:'#6a7268'},
  {soil:'#a0875b',highlight:'#d1ba88',wood:'#70553b',rock:'#9c8564'},
  {soil:'#886945',highlight:'#b39b75',wood:'#594230',rock:'#806b53'},
  {soil:'#394438',highlight:'#88978a',wood:'#3e3530',rock:'#656e69'}
 ];
 function begin(lvl,path,WW,WH,dpth){
  details=[];
  const count=lvl===5?90:78;
  for(let i=0;i<count;i++){
    const x=70+Math.random()*(WW-140),y=190+Math.random()*(WH-310);
    if(dpth(x,y)<105)continue;
    details.push({x,y,sz:5+Math.random()*12,ang:Math.random()*6.28,
      type:i%17===0?'ruin':i%11===0?'plank':i%5===0?'pebble':'tuft'});
  }
 }
 function ground(ctx,sx,sy,W,H,level,frame){
  const p=palettes[level]||palettes[1];
  for(const d of details){
    const x=sx(d.x),y=sy(d.y);
    if(x<-48||y<-48||x>W+48||y>H+48)continue;
    ctx.save();ctx.translate(x,y);ctx.rotate(d.ang);
    if(d.type==='tuft'){
      ctx.strokeStyle=level>=3?'rgba(90,77,45,.45)':'rgba(23,68,30,.55)';
      ctx.lineCap='round';ctx.lineWidth=1.4;
      for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(k*3,2);ctx.quadraticCurveTo(k*3-3,-d.sz*.4,k*3+2,-d.sz);ctx.stroke()}
    }else if(d.type==='pebble'){
      ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(3,4,d.sz*.9,d.sz*.33,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=p.rock;ctx.beginPath();ctx.moveTo(-d.sz,1);ctx.lineTo(-d.sz*.5,-d.sz*.45);ctx.lineTo(d.sz*.3,-d.sz*.6);ctx.lineTo(d.sz,d.sz*.15);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(220,211,180,.24)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-d.sz*.5,-d.sz*.37);ctx.lineTo(d.sz*.3,-d.sz*.55);ctx.stroke();
    }else if(d.type==='plank'){
      ctx.fillStyle='rgba(0,0,0,.17)';ctx.fillRect(-d.sz-1,3,d.sz*2+2,5);
      ctx.fillStyle=p.wood;ctx.fillRect(-d.sz,-2,d.sz*2,5);
      ctx.strokeStyle='rgba(223,182,104,.24)';ctx.strokeRect(-d.sz,-2,d.sz*2,5);
      ctx.fillStyle='#382d21';ctx.fillRect(-d.sz*.6,-1,2,2);ctx.fillRect(d.sz*.55,-1,2,2);
    }else{
      // Fallen stone blocks and remnants of old rural paths.
      ctx.fillStyle='rgba(0,0,0,.26)';ctx.fillRect(-d.sz+3,4,d.sz*2,7);
      ctx.fillStyle=p.rock;ctx.fillRect(-d.sz,-d.sz*.42,d.sz*2,d.sz*.8);
      ctx.fillStyle='rgba(235,211,161,.23)';ctx.fillRect(-d.sz,-d.sz*.42,d.sz*2,2);
      ctx.strokeStyle='rgba(35,29,22,.28)';ctx.strokeRect(-d.sz,-d.sz*.42,d.sz*2,d.sz*.8);
    }
    ctx.restore();
  }
  // Geological strata / tree-root traces along the walking route.
  const stride=level<3?160:210;
  if(typeof path!=='undefined'){
    for(let k=3;k<path.length-4;k+=2){
      const n=path[k],x=sx(n.x),y=sy(n.y);
      if(x<-85||x>W+85||y<-65||y>H+65)continue;
      ctx.save();ctx.translate(x,y);ctx.rotate(((k*37)%23-11)*.04);
      ctx.globalAlpha=level===5?.24:.20;
      ctx.strokeStyle=level<3?p.soil:p.highlight;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-36,-stride*.02);ctx.quadraticCurveTo(0,8,38,-4);ctx.stroke();
      ctx.restore();
    }
  }
 }
 function hero(ctx,px,py,P,level,frame){
   if(P.dead)return;
   ctx.save();ctx.translate(px,py);ctx.rotate(P.ang+Math.PI*.5);
   // Detail, not a new hitbox: leather straps, amber shoulder stitching, cloak edge.
   ctx.strokeStyle='rgba(225,162,94,.58)';ctx.lineWidth=1.1;
   ctx.beginPath();ctx.moveTo(-9,-8);ctx.quadraticCurveTo(0,1,7,8);ctx.stroke();
   ctx.fillStyle='#2b1b12';ctx.fillRect(-4,1,8,3);
   ctx.fillStyle='#cba063';ctx.fillRect(-1,1,2,3);
   ctx.strokeStyle='rgba(245,196,123,.38)';ctx.lineWidth=.8;
   for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-11+i*2,-5);ctx.lineTo(-9+i*2,-7);ctx.stroke()}
   // A real silhouette change when the final-stage hunting gun is selected.
   if(typeof PiraliBetaGear!=='undefined'&&PiraliBetaGear.status().owned&&PiraliBetaGear.status().selected==='shotgun'){
     ctx.strokeStyle='#202527';ctx.lineWidth=4;ctx.lineCap='round';
     ctx.beginPath();ctx.moveTo(8,7);ctx.lineTo(7,-31);ctx.stroke();
     ctx.strokeStyle='#acbbc1';ctx.lineWidth=1.4;
     ctx.beginPath();ctx.moveTo(5,-31);ctx.lineTo(5,-9);ctx.stroke();
     ctx.fillStyle='#85552c';ctx.fillRect(4,-3,7,14);
     ctx.fillStyle='#d4b480';ctx.fillRect(4,6,7,2);
   }
   ctx.restore();
 }
 function enemy(ctx,e,x,y){
   if(!e.alive||e.etype==='landlord')return;
   const officer=e.etype==='officer',rifle=e.etype==='rifle';
   ctx.save();ctx.translate(x,y);ctx.rotate(e.ang+Math.PI*.5);
   // Boots, layered sleeves, cartridge belt. Keep recognisable unit silhouettes.
   ctx.fillStyle=officer?'#3b2b19':'#24271d';
   ctx.fillRect(-8,10,5,5);ctx.fillRect(4,10,5,5);
   ctx.strokeStyle=officer?'rgba(226,187,98,.78)':'rgba(158,142,104,.63)';
   ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-8,-3);ctx.lineTo(6,7);ctx.stroke();
   ctx.fillStyle=officer?'#d3ac57':rifle?'#aa7c52':'#858471';
   ctx.fillRect(-7,1,3,2);ctx.fillRect(4,1,3,2);
   ctx.restore();
 }
 function atmosphere(ctx,W,H,level,frame,P,sx,sy){
   const p=palettes[level]||palettes[1];
   ctx.save();
   // Subtle muted cinematic grade, keeps HUD unaffected.
   ctx.fillStyle=level===1?'rgba(41,38,12,.060)':level===2?'rgba(13,30,32,.095)':
    level===3?'rgba(94,62,21,.052)':level===4?'rgba(80,35,17,.085)':'rgba(4,13,33,.10)';
   ctx.fillRect(0,0,W,H);
   if(level===5){
     const x=sx(P.x),y=sy(P.y);
     const r=310;
     const glow=ctx.createRadialGradient(x,y,10,x,y,r);
     glow.addColorStop(0,'rgba(209,207,165,.082)');glow.addColorStop(.55,'rgba(151,160,178,.022)');
     glow.addColorStop(1,'rgba(0,0,0,0)');
     ctx.fillStyle=glow;ctx.fillRect(x-r,y-r,r*2,r*2);
   }
   ctx.restore();
 }
 return Object.freeze({begin,ground,hero,enemy,atmosphere});
})();
