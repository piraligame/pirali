// Modular character renderer for SIMONA. Depends on globals from runtime world/render.
function drawPlayer(){
  if(P.dead)return;
  const px=sx(P.x), py=sy(P.y);
  ctx.save();
  if(invincible&&Math.floor(Date.now()/85)%2===0)ctx.globalAlpha=.62; // softer hit flicker
  if(dashing)ctx.globalAlpha=.55;

  const spd=Math.hypot(P.vx,P.vy);
  const mv=spd>0.12;
  const run=spd>SPD*.55;
  if(!P.wAnim)P.wAnim=0;
  const lp=P.wAnim;

  const R=P.r; // original size
  const ang=P.ang;
  const ea=ang+Math.PI*.5;
  const fx=Math.cos(ang), fy=Math.sin(ang);
  const rx=Math.cos(ea),  ry=Math.sin(ea);

  const breathT=Date.now()*.0014;
  const bob=mv ? Math.sin(lp)*(run?2.2:1.4) : Math.sin(breathT)*.4;

  // ── Shadow ──
  ctx.fillStyle='rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(px+fx*1.5, py+fy*1.5+R*.52, R*1.05, R*.3, ang, 0, Math.PI*2);
  ctx.fill();

  // ── LEGS (segmented: thigh + shin + boot) ──
  const stride=run?SIMONA_STYLE.strideRun:SIMONA_STYLE.strideWalk;
  const lSwingL= Math.sin(lp)*stride;
  const lSwingR=-Math.sin(lp)*stride;

  function drawLeg(sign, swing){
    const hx=px + rx*sign*R*SIMONA_STYLE.hipOffset - fx*R*.15;
    const hy=py + ry*sign*R*SIMONA_STYLE.hipOffset - fy*R*.15;
    const kx=hx + fx*(R*.32+swing*.18) - rx*sign*1.5;
    const ky=hy + fy*(R*.32+swing*.18) + swing*.7;
    const ftx=kx + fx*(R*.25);
    const fty=ky + fy*(R*.25) + swing*.45;
    // Thigh
    ctx.strokeStyle='#4e2c16'; ctx.lineWidth=SIMONA_STYLE.upperLegWidth; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(kx,ky); ctx.stroke();
    // Shin
    ctx.strokeStyle='#3e2010'; ctx.lineWidth=SIMONA_STYLE.lowerLegWidth;
    ctx.beginPath(); ctx.moveTo(kx,ky); ctx.lineTo(ftx,fty); ctx.stroke();
    // Boot
    ctx.fillStyle='#281608';
    ctx.beginPath(); ctx.ellipse(ftx+fx*3, fty+fy*3, 4.5, 2.8, ang, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(70,38,12,.4)';
    ctx.beginPath(); ctx.ellipse(ftx+fx*2, fty+fy*2-1, 2.8, 1.6, ang, 0, Math.PI); ctx.fill();
  }

  // Preserve walk motion while hiding original feet only when overhead art is active.
  if(!window.PiraliTopdownPolish?.isEnabled?.()){
    if(lSwingL<0){ drawLeg(-1,lSwingR); drawLeg(1,lSwingL); }
    else         { drawLeg( 1,lSwingL); drawLeg(-1,lSwingR); }
  }

  // ── CHOKHA BODY — coat shape (NOT a circle, elongated + slim) ──
  ctx.save();
  ctx.translate(px, py+bob*.25);

  // Outer dark rim
  ctx.fillStyle='#160804';
  ctx.beginPath();
  ctx.ellipse(0, 0, R*SIMONA_STYLE.silhouetteOuterWidth, R*SIMONA_STYLE.silhouetteOuterLength, ang+Math.PI*.5, 0, Math.PI*2);
  ctx.fill();

  // Main coat — deep burgundy, elongated vertically
  const coatG=ctx.createRadialGradient(-R*.28,-R*.35,0, 0,0,R*1.08);
  coatG.addColorStop(0,'#7c3222');
  coatG.addColorStop(.38,'#581c14');
  coatG.addColorStop(.72,'#3a1009');
  coatG.addColorStop(1,'#220a04');
  ctx.fillStyle=coatG;
  ctx.beginPath();
  ctx.ellipse(0, 0, R*SIMONA_STYLE.coatWidth, R*SIMONA_STYLE.coatLength, ang+Math.PI*.5, 0, Math.PI*2);
  ctx.fill();

  // Front coat center opening (dark line)
  ctx.strokeStyle='rgba(14,5,1,.9)'; ctx.lineWidth=2.2;
  ctx.beginPath();
  ctx.moveTo(fx*R*.14, fy*R*.14);
  ctx.lineTo(-fx*R*.6, -fy*R*.6);
  ctx.stroke();
  // Fine Georgian chokha piping — a slimmer, tailored silhouette.
  ctx.strokeStyle='rgba(205,148,55,.42)';ctx.lineWidth=1.1;
  for(const sign of [-1,1]){
    ctx.beginPath();
    ctx.moveTo(fx*R*.27+rx*sign*R*.20, fy*R*.27+ry*sign*R*.20);
    ctx.lineTo(-fx*R*.58+rx*sign*R*.19, -fy*R*.58+ry*sign*R*.19);
    ctx.stroke();
  }

  // Side shoulder highlights (make shoulders look wide, not round)
  ctx.fillStyle='rgba(100,48,18,.55)';
  ctx.beginPath(); ctx.ellipse(rx*R*SIMONA_STYLE.shoulderOffset, ry*R*SIMONA_STYLE.shoulderOffset, R*.28, R*.16, ea, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-rx*R*SIMONA_STYLE.shoulderOffset, -ry*R*SIMONA_STYLE.shoulderOffset, R*.28, R*.16, ea, 0, Math.PI*2); ctx.fill();

  // ── Chest panel (akhalkukhi) ──
  ctx.fillStyle='#341408';
  ctx.beginPath();
  ctx.ellipse(fx*R*.2, fy*R*.2, R*.3, R*.46, ang+Math.PI*.5, -1.05, 1.05);
  ctx.fill();

  ctx.restore();

  // Cloth hem responds to the walking cycle while collision stays unchanged.
  const clothSwing=mv?Math.sin(lp)*(run?2.1:1.2):Math.sin(breathT)*.35;
  ctx.strokeStyle='rgba(191,95,54,.40)';ctx.lineWidth=1.5;ctx.lineCap='round';
  for(const sign of [-1,1]){
    const backX=px-fx*R*.60+rx*sign*R*.39;
    const backY=py-fy*R*.60+ry*sign*R*.39;
    ctx.beginPath();ctx.moveTo(backX,backY);
    ctx.quadraticCurveTo(backX-fx*R*.20+rx*sign*clothSwing*.25,backY-fy*R*.20+ry*sign*clothSwing*.25,
      backX-fx*R*.36+rx*sign*clothSwing*.35,backY-fy*R*.36+ry*sign*clothSwing*.35);
    ctx.stroke();
  }

  // ── GAZYR (5 cells on chest) ──
  for(let i=0;i<5;i++){
    const t=-0.48+i*.24;
    const gx=px + fx*R*.1 + rx*(R*SIMONA_STYLE.chestOffset+t*.04*R) + bob*.08*fy;
    const gy=py + fy*R*.1 + ry*(R*SIMONA_STYLE.chestOffset+t*.04*R) + bob*.08*(-fx)*.4;
    ctx.fillStyle='#2a1204';
    ctx.fillRect(gx-2, gy-5, 4, 10);
    const gl=ctx.createLinearGradient(gx-2,0,gx+2,0);
    gl.addColorStop(0,'#6e4210'); gl.addColorStop(.3,'#f0c030');
    gl.addColorStop(.6,'#c09010'); gl.addColorStop(1,'#4e2c06');
    ctx.fillStyle=gl; ctx.fillRect(gx-1.6,gy-4.5,3.2,4.5);
    ctx.fillStyle='#5e3208'; ctx.fillRect(gx-1.6,gy,3.2,4.5);
    ctx.fillStyle='rgba(0,0,0,.4)'; ctx.fillRect(gx+1.4,gy-5,.6,10);
  }
  // right side gazyr
  for(let i=0;i<5;i++){
    const t=-0.48+i*.24;
    const gx=px + fx*R*.1 - rx*(R*SIMONA_STYLE.chestOffset+t*.04*R) + bob*.08*fy;
    const gy=py + fy*R*.1 - ry*(R*SIMONA_STYLE.chestOffset+t*.04*R) + bob*.08*(-fx)*.4;
    ctx.fillStyle='#2a1204'; ctx.fillRect(gx-2,gy-5,4,10);
    const gl=ctx.createLinearGradient(gx-2,0,gx+2,0);
    gl.addColorStop(0,'#6e4210'); gl.addColorStop(.3,'#f0c030');
    gl.addColorStop(.6,'#c09010'); gl.addColorStop(1,'#4e2c06');
    ctx.fillStyle=gl; ctx.fillRect(gx-1.6,gy-4.5,3.2,4.5);
    ctx.fillStyle='#5e3208'; ctx.fillRect(gx-1.6,gy,3.2,4.5);
    ctx.fillStyle='rgba(0,0,0,.4)'; ctx.fillRect(gx+1.4,gy-5,.6,10);
  }

  // ── BELT (thin, not fat) ──
  ctx.strokeStyle='#b07818'; ctx.lineWidth=2.8;
  ctx.beginPath(); ctx.arc(px, py+bob*.2, R*SIMONA_STYLE.beltRadius, ang+.3, ang+Math.PI*.95); ctx.stroke();
  ctx.strokeStyle='rgba(240,200,55,.25)'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.arc(px, py+bob*.2, R*SIMONA_STYLE.beltRadius, ang+.3, ang+Math.PI*.95); ctx.stroke();
  // Buckle
  const bkx=px+fx*(R*SIMONA_STYLE.beltRadius), bky=py+fy*(R*SIMONA_STYLE.beltRadius)+bob*.2;
  ctx.fillStyle='#b88818'; ctx.fillRect(bkx-3.2,bky-3.2,6.4,6.4);
  ctx.fillStyle='#f0c838'; ctx.fillRect(bkx-2,bky-2,4,4);
  ctx.fillStyle='#180e04'; ctx.beginPath(); ctx.arc(bkx,bky,1.2,0,Math.PI*2); ctx.fill();

  // ── ARMS ──
  if(!swordOn){
    const aSwing=mv?Math.sin(lp+Math.PI)*(run?SIMONA_STYLE.runArmSwing:SIMONA_STYLE.walkArmSwing):Math.sin(breathT)*.65;
    function drawArm(sign, swing){
      const shx=px + rx*sign*R*SIMONA_STYLE.armOffset + fx*R*.06;
      const shy=py + ry*sign*R*SIMONA_STYLE.armOffset + fy*R*.06 + bob*.2;
      const elx=shx + rx*sign*2.5 + fx*3.5 + fy*swing*.4;
      const ely=shy + ry*sign*2.5 + fy*3.5 - fx*swing*.4 + swing*.45;
      const hdx=elx + fx*3 + fy*swing*.2;
      const hdy=ely + fy*3 - fx*swing*.2 + swing*.3;
      ctx.strokeStyle='#522818'; ctx.lineWidth=5; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(shx,shy); ctx.lineTo(elx,ely); ctx.stroke();
      ctx.strokeStyle='#42200e'; ctx.lineWidth=4;
      ctx.beginPath(); ctx.moveTo(elx,ely); ctx.lineTo(hdx,hdy); ctx.stroke();
      ctx.fillStyle='#c08050';
      ctx.beginPath(); ctx.arc(hdx,hdy,3.2,0,Math.PI*2); ctx.fill();
    }
    drawArm( 1,  aSwing);
    drawArm(-1, -aSwing);
  }

  // ── COLLAR ──
  ctx.strokeStyle='#cc9020'; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.arc(px+fx*R*.3,py+fy*R*.3+bob*.25, R*.4, ang-.9, ang+.9); ctx.stroke();
  ctx.strokeStyle='rgba(255,210,70,.3)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(px+fx*R*.3,py+fy*R*.3+bob*.25, R*.4, ang-.9, ang+.9); ctx.stroke();

  // ── HEAD ──
  const HR=9.5;
  const hx=px+fx*R*.55, hy=py+fy*R*.55-bob*.38;

  // Neck
  ctx.fillStyle='#be8450';
  ctx.beginPath(); ctx.ellipse(px+fx*R*.35,py+fy*R*.35+bob*.08, 4.5,3.5, ang+Math.PI*.5,0,Math.PI*2); ctx.fill();

  // Qabalakhi base
  ctx.fillStyle='#1e1408';
  ctx.beginPath(); ctx.arc(hx,hy,HR,0,Math.PI*2); ctx.fill();

  // Cloth lighting
  const hG=ctx.createRadialGradient(hx-HR*.35,hy-HR*.38,0, hx,hy,HR*1.05);
  hG.addColorStop(0,'rgba(85,62,22,.8)');
  hG.addColorStop(.42,'rgba(38,25,8,.45)');
  hG.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=hG; ctx.beginPath(); ctx.arc(hx,hy,HR,0,Math.PI*2); ctx.fill();

  // Wrap folds
  ctx.strokeStyle='rgba(8,4,1,.5)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.ellipse(hx,hy+2,HR*.85,HR*.58,.07,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(hx,hy-1.5,HR*.78,HR*.52,.03,0,Math.PI*2); ctx.stroke();

  // Nose depth shadow
  ctx.fillStyle='rgba(10,4,1,.65)';
  ctx.beginPath(); ctx.arc(hx+fx*HR*.44,hy+fy*HR*.44,3.8,0,Math.PI*2); ctx.fill();

  // Eye slit skin
  const ecx=hx+fx*HR*.2, ecy=hy+fy*HR*.2;
  ctx.fillStyle='#d48858';
  ctx.beginPath(); ctx.ellipse(ecx,ecy, HR*.78, HR*.3, ang, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(16,7,1,.55)';
  ctx.beginPath(); ctx.ellipse(ecx,ecy-3, HR*.74, HR*.2, ang, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(16,7,1,.48)';
  ctx.beginPath(); ctx.ellipse(ecx,ecy+3.2, HR*.74, HR*.2, ang, 0, Math.PI*2); ctx.fill();

  // Eyes
  for(let s of [-1,1]){
    const ex=ecx+rx*s*HR*.32, ey=ecy+ry*s*HR*.32;
    ctx.fillStyle='#ece0c4';
    ctx.beginPath(); ctx.ellipse(ex,ey, 2.8,1.8, ang,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#280e04';
    ctx.beginPath(); ctx.arc(ex+fx*1.4,ey+fy*1.4, 1.6,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.7)';
    ctx.beginPath(); ctx.arc(ex+fx*.8,ey+fy*.8, .6,0,Math.PI*2); ctx.fill();
  }
  // Brows
  ctx.strokeStyle='rgba(48,22,6,.7)'; ctx.lineWidth=1.8;
  for(let s of [-1,1]){
    const bx=ecx+rx*s*HR*.32, by=ecy+ry*s*HR*.32;
    ctx.beginPath(); ctx.moveTo(bx+rx*s*-1.5,by+ry*s*-1.5-1.5);
    ctx.lineTo(bx+rx*s*4.5,by+ry*s*4.5-1); ctx.stroke();
  }

  // Crown wrap
  ctx.fillStyle='#302010';
  ctx.beginPath(); ctx.ellipse(hx,hy-HR*.7,HR*.88,HR*.56,0,0,Math.PI); ctx.fill();
  ctx.fillStyle='#453018';
  ctx.beginPath(); ctx.ellipse(hx,hy-HR*.7,HR*.68,HR*.42,0,0,Math.PI); ctx.fill();
  ctx.strokeStyle='rgba(70,46,12,.5)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(hx,hy-HR*.22); ctx.lineTo(hx,hy-HR*1.25); ctx.stroke();
  // Gold pin
  ctx.fillStyle='#c49516';
  ctx.beginPath(); ctx.arc(hx,hy-HR*.7,2.2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#f0c830';
  ctx.beginPath(); ctx.arc(hx,hy-HR*.7,1.3,0,Math.PI*2); ctx.fill();
  // Trailing cloth
  ctx.fillStyle='#261a0c';
  ctx.beginPath();
  ctx.moveTo(hx+rx*HR*.85,hy+ry*HR*.85);
  ctx.quadraticCurveTo(hx+rx*HR*1.25,hy+ry*HR*1.05+5, hx+rx*HR*.88,hy+ry*HR*1.3+6);
  ctx.lineTo(hx+rx*HR*.58,hy+ry*HR*.8); ctx.closePath(); ctx.fill();

  // ── STATUS RINGS ──
  if(parryActive){
    ctx.save(); ctx.globalAlpha=.7;
    ctx.strokeStyle='#f8e838'; ctx.lineWidth=3;
    ctx.shadowBlur=22; ctx.shadowColor='#f8e838';
    ctx.beginPath(); ctx.arc(px,py,P.r+10,0,Math.PI*2); ctx.stroke();
    ctx.shadowBlur=0; ctx.restore();
  }
  if(dashing){
    ctx.save(); ctx.globalAlpha=.5;
    ctx.strokeStyle='#55ccff'; ctx.lineWidth=3;
    ctx.shadowBlur=18; ctx.shadowColor='#55ccff';
    ctx.beginPath(); ctx.arc(px,py,P.r+6,0,Math.PI*2); ctx.stroke();
    ctx.shadowBlur=0; ctx.restore();
    for(let i=0;i<3;i++){
      const da=ang+Math.PI+(i-1)*.28, dl=9+i*5;
      ctx.save(); ctx.globalAlpha=.2-i*.05; ctx.strokeStyle='#88ddff'; ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.moveTo(px+Math.cos(da)*(P.r+3),py+Math.sin(da)*(P.r+3));
      ctx.lineTo(px+Math.cos(da)*(P.r+3+dl),py+Math.sin(da)*(P.r+3+dl));
      ctx.stroke(); ctx.restore();
    }
  }

  // ── WEAPON ──
  if(swordOn){
    const sw=ang+.55*(1-swordT/22)*Math.PI;
    ctx.save(); ctx.shadowBlur=14; ctx.shadowColor='rgba(210,225,255,.9)';
    ctx.strokeStyle='#d8dcea'; ctx.lineWidth=5;
    ctx.beginPath(); ctx.moveTo(px+Math.cos(sw)*13,py+Math.sin(sw)*13);
    ctx.lineTo(px+Math.cos(sw)*50,py+Math.sin(sw)*50); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=1.8;
    ctx.beginPath(); ctx.moveTo(px+Math.cos(sw)*15,py+Math.sin(sw)*15);
    ctx.lineTo(px+Math.cos(sw)*50,py+Math.sin(sw)*50); ctx.stroke();
    ctx.strokeStyle='#c89a22'; ctx.lineWidth=8; ctx.shadowBlur=0;
    ctx.beginPath(); ctx.moveTo(px+Math.cos(sw+.5)*18,py+Math.sin(sw+.5)*18);
    ctx.lineTo(px+Math.cos(sw-.5)*18,py+Math.sin(sw-.5)*18); ctx.stroke();
    ctx.restore();
  } else {
    ctx.save();
    const kick=PiraliFX.recoil()*3.8; // cosmetic Mauser recoil, never moves the hitbox
    ctx.translate(px+Math.cos(ang+.82)*15-fx*kick,py+Math.sin(ang+.82)*15-fy*kick);
    ctx.rotate(ang+.82);
    ctx.fillStyle='#1e1e1e'; ctx.fillRect(-2,-3,21,6);
    ctx.fillStyle='#2a2a2a'; ctx.fillRect(-2,-3,9,3.5);
    ctx.fillStyle='#363636'; ctx.fillRect(3,-5.5,7,5.5);
    ctx.fillStyle='#242424'; ctx.beginPath(); ctx.arc(5.5,0,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#3a3a3a'; ctx.beginPath(); ctx.arc(5.5,0,2.8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#1a1a1a'; ctx.fillRect(18,-1.5,3,3);
    ctx.restore();
  }

  ctx.restore();
}
