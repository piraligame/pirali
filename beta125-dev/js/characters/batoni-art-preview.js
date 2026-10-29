/* PIRALI 0.11 Batoni test: user's red man, top-down sprites from concept preview.
 * This module only replaces the visual drawing for e.etype === 'landlord'.
 * Original NPC update/combat, 1-hit behavior and Firebase remain unchanged.
 */
(function(){
  'use strict';
  const drawExistingEnemy=drawEnemy;
  const atlas=new Image();
  const TILE=48, SIZE=53;
  let ready=false,enabled=true,failed=false;
  atlas.onload=()=>{ready=atlas.width===192&&atlas.height===48;failed=!ready;};
  atlas.onerror=()=>{ready=false;failed=true;};
  atlas.src='assets/sprites/batoni-atlas-48.webp';
  function tileIndex(e){
    const vx=Number(e?.vx)||0,vy=Number(e?.vy)||0;
    const ang=Math.hypot(vx,vy)>.08?Math.atan2(vy,vx):Number.isFinite(e?.ang)?e.ang:-Math.PI/2;
    // Frames in atlas: north, south, west, east.
    if(Math.abs(Math.cos(ang))>Math.abs(Math.sin(ang)))return Math.cos(ang)>=0?3:2;
    return Math.sin(ang)>=0?1:0;
  }
  drawEnemy=function(e){
    if(!enabled||!e||e.etype!=='landlord'||!e.alive||!ready){
      return drawExistingEnemy(e);
    }
    const x=sx(e.x),y=sy(e.y);
    if(x<-(SIZE+10)||x>W+SIZE+10||y<-SIZE||y>H+SIZE)return;
    const motion=window.PiraliAlphaMotion?.sample(e,'batoni',Math.atan2(e.vy||0,e.vx||0),Math.hypot(e.vx||0,e.vy||0));
    const active=!!motion?.enabled;
    const bob=active?motion.bob*1.25:Math.sin(Date.now()*.007)*.65;
    ctx.save();
    if(e.hf>0&&Math.floor(e.hf)%2===0)ctx.globalAlpha=.63;
    ctx.fillStyle='rgba(10,9,6,.27)';
    ctx.beginPath();ctx.ellipse(x+1,y+13,19,5.5,0,0,Math.PI*2);ctx.fill();
    const tile=tileIndex(e);
    if(active&&motion.moving){
      // A pair of fading footfall streaks behind his escape trajectory.
      const a=Math.atan2(e.vy||0,e.vx||0),backX=Math.cos(a),backY=Math.sin(a);
      ctx.strokeStyle='rgba(222,195,117,.35)';ctx.lineWidth=1.7;ctx.lineCap='round';
      for(let j=-1;j<=1;j+=2){
        ctx.beginPath();
        ctx.moveTo(x-backX*13-backY*j*9,y-backY*13+backX*j*9);
        ctx.lineTo(x-backX*(24+motion.bob*1.5)-backY*j*9,y-backY*(24+motion.bob*1.5)+backX*j*9);
        ctx.stroke();
      }
    }
    ctx.save();ctx.translate(x,y+bob);
    if(active){ctx.rotate(motion.lean*1.2);const pulse=Math.sin(motion.step*2);
      ctx.scale(1+pulse*.045,1-pulse*.07);}
    ctx.drawImage(atlas,tile*TILE,0,TILE,TILE,-SIZE/2,-SIZE/2,SIZE,SIZE);
    ctx.restore();
    ctx.fillStyle='#ffe5d2';ctx.font='bold 10px sans-serif';ctx.textAlign='center';
    ctx.shadowColor='#6f0506';ctx.shadowBlur=4;
    const label=window.PiraliLanguage?.gameText?.('landlord')||'ბატონი';
    ctx.fillText(label,x,y-SIZE/2-7+bob);
    ctx.restore();
  };
  window.PiraliBatoniArt=Object.freeze({
    enable:v=>{enabled=!!v;return enabled;},
    status:()=>({ready,failed,enabled,source:'red-coat concept sprite atlas',tiles:4,tileSize:TILE}),
    originalDrawEnemy:drawExistingEnemy
  });
})();
