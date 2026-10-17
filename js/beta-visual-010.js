/* PIRALI Beta 0.11 — restrained image reskin over the existing world and motion. */
(function(){
  'use strict';
  const image=(src)=>{const i=new Image();i.decoding='async';i.src=src;return i;};
  const ground=image('assets/images/beta/chokhatauri-forest-ground.webp?v=beta-010b');
  const hero=image('assets/images/beta/simona-nabadi-qabalakhi.webp?v=beta-010b');
  const soldiers={
    saber:image('assets/images/beta/russian-soldier-green-saber.webp?v=beta-010b'),
    rifle:image('assets/images/beta/russian-soldier-yellow-pistol.webp?v=beta-010b'),
    officer:image('assets/images/beta/russian-soldier-red-officer.webp?v=beta-010b')
  };
  const ready=i=>i.complete&&i.naturalWidth>0;

  function groundReady(){return ready(ground);}
  function fillGround(ctx,W,H,camX,camY,lvl){
    if(lvl!==1||!groundReady())return false;
    const pattern=ctx.createPattern(ground,'repeat');
    if(!pattern)return false;
    ctx.save();
    // Keep the original level colors and details visible; use the new art as a quiet ground texture.
    ctx.globalAlpha=.24;
    ctx.translate(-camX,-camY);ctx.scale(2.25,2.25);
    ctx.fillStyle=pattern;ctx.fillRect(camX/2.25,camY/2.25,W/2.25,H/2.25);
    ctx.restore();
    return true;
  }

  function drawHero(ctx,P,x,y,lvl,frame){
    if(lvl!==1||!ready(hero))return false;
    if(P.dead)return true;
    const speed=Math.hypot(P.vx||0,P.vy||0);
    // Preserve the existing walk/breath rhythm without rotating the full illustration toward auto-aim.
    const walk=typeof P.wAnim==='number'?P.wAnim:frame*.22;
    const bob=speed>.12?Math.sin(walk)*1.5:Math.sin(frame*.025)*.35;
    ctx.save();
    if(invincible&&Math.floor(Date.now()/85)%2===0)ctx.globalAlpha=.62;
    if(dashing)ctx.globalAlpha=.55;
    ctx.fillStyle='rgba(13,9,5,.35)';
    ctx.beginPath();ctx.ellipse(x+2,y+11,15,5,.08,0,Math.PI*2);ctx.fill();
    ctx.translate(x,y+bob);
    // Keep Simona upright like the original screen-oriented character; movement/aim stay in game logic.
    const h=48,w=h*(hero.naturalWidth/hero.naturalHeight);
    ctx.drawImage(hero,-w*.5,-h*.5,w,h);
    ctx.restore();
    if(swordOn){
      const sweep=(P.ang||0)+.55*(1-(swordT||0)/22)*Math.PI;
      ctx.save();ctx.shadowBlur=12;ctx.shadowColor='rgba(220,232,255,.8)';
      ctx.strokeStyle='#d9e0ec';ctx.lineWidth=4;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(x+Math.cos(sweep)*11,y+Math.sin(sweep)*11);
      ctx.lineTo(x+Math.cos(sweep)*39,y+Math.sin(sweep)*39);ctx.stroke();
      ctx.strokeStyle='#bf8e25';ctx.lineWidth=5;ctx.beginPath();
      ctx.moveTo(x+Math.cos(sweep+.55)*15,y+Math.sin(sweep+.55)*15);
      ctx.lineTo(x+Math.cos(sweep-.55)*15,y+Math.sin(sweep-.55)*15);ctx.stroke();ctx.restore();
    }
    return true;
  }

  function drawEnemy(ctx,e,x,y,lvl){
    const soldier=soldiers[e.etype];
    if(lvl!==1||!soldier||!ready(soldier)||!e.alive||e.etype==='landlord')return false;
    ctx.save();
    if(e.hf>0&&e.hf%2===0)ctx.filter='brightness(2.7)';
    ctx.fillStyle='rgba(12,8,4,.38)';ctx.beginPath();ctx.ellipse(x+2,y+11,14,4.5,.08,0,Math.PI*2);ctx.fill();
    // Soldiers travel and attack through the original AI; their portrait art stays screen-upright.
    ctx.translate(x,y);
    const h=46,w=h*(soldier.naturalWidth/soldier.naturalHeight);
    ctx.drawImage(soldier,-w*.5,-h*.5,w,h);
    // Uniform colors identify the three enemy roles: green saber, yellow pistol, red officer with both.
    const tierColor=e.etype==='officer'?'#a61e18':e.etype==='rifle'?'#d6a721':'#397647';
    ctx.fillStyle=tierColor;ctx.fillRect(-w*.16,-h*.04,w*.32,2.2);
    ctx.restore();
    // Enemy health stays clearly readable above the soldier, including level-one enemies.
    const barY=y-36,barW=26;
    ctx.fillStyle='rgba(28,12,8,.85)';ctx.fillRect(x-barW*.5-1,barY-1,barW+2,5);
    ctx.fillStyle='#b21916';ctx.fillRect(x-barW*.5,barY,barW,3);
    ctx.fillStyle='#f04a34';ctx.fillRect(x-barW*.5,barY,barW*Math.max(0,e.hp/e.maxHp),1.2);
    if(e.state==='alert'){
      ctx.font='bold 10px serif';ctx.textAlign='center';ctx.fillStyle='#ffd14a';ctx.fillText('!',x,barY-3);
    }
    return true;
  }

  window.PiraliBetaVisual=Object.freeze({groundReady,fillGround,drawHero,drawEnemy});
})();
