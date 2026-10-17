const sx=x=>x-camX,sy=y=>y-camY;
function th2(gx,gy){let h=((gx*1664525+gy*1013904223)&0x7fffffff);h^=h>>13;return(h*1540483477&0x7fffffff)/0x7fffffff;}

// ── RENDER ──
function render(){
  ctx.clearRect(0,0,W,H);
  drawBG();
  PiraliBetaArt.ground(ctx,sx,sy,W,H,level,frame);
  drawBloodDecals();
  drawCorpses();drawAmbients();drawChurch();drawSignpost();drawPickups();drawTrees();drawParticles();
  if(boss&&boss.groundSlamActive)drawGroundSlam();
  const ents=[...enemies.filter(e=>e.alive).map(e=>({y:e.y,fn:()=>{
    if(!(window.PiraliBetaVisual?.drawEnemy(ctx,e,sx(e.x),sy(e.y),level))){drawEnemy(e);PiraliBetaArt.enemy(ctx,e,sx(e.x),sy(e.y));}
  }})),{y:P.y,fn:()=>{
    if(!(window.PiraliBetaVisual?.drawHero(ctx,P,sx(P.x),sy(P.y),level,frame))){drawPlayer();PiraliBetaArt.hero(ctx,sx(P.x),sy(P.y),P,level,frame);}
  }}];
  if(boss&&boss.alive)ents.push({y:boss.y,fn:()=>drawBoss(boss)});
  ents.sort((a,b)=>a.y-b.y).forEach(e=>e.fn());
  drawBullets();
  PiraliFX.draw(ctx,sx,sy,W,H);
  drawFloatingTexts();
  drawWeatherOverlay();
  PiraliBetaArt.atmosphere(ctx,W,H,level,frame,P,sx,sy);
  drawHUD();
}

// ── BLOOD DECALS (ground-level, persistent) ──
function drawBloodDecals(){
  bloodDecals.forEach(d=>{
    const bx=sx(d.x),by=sy(d.y);
    if(bx<-30||bx>W+30||by<-30||by>H+30)return;
    ctx.save();ctx.globalAlpha=d.alpha;ctx.translate(bx,by);ctx.rotate(d.ang);
    ctx.fillStyle='#5a0808';ctx.beginPath();ctx.ellipse(0,0,d.r,d.r*.55,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#7a0a0a';ctx.beginPath();ctx.ellipse(-d.r*.2,-d.r*.1,d.r*.45,d.r*.32,.3,0,Math.PI*2);ctx.fill();
    ctx.restore();
  });
}

// ── FLOATING TEXTS (kill streak, parry) ──
const _floats=[];
function showFloatingText(wx,wy,text,col='#f0e040'){
  _floats.push({x:wx,y:wy,text,col,life:55,ml:55});
}
function drawFloatingTexts(){
  for(let i=_floats.length-1;i>=0;i--){
    const f=_floats[i];f.y-=.55;f.life--;
    if(f.life<=0){_floats.splice(i,1);continue;}
    const fx=sx(f.x),fy=sy(f.y);
    ctx.globalAlpha=Math.min(1,f.life/15);
    ctx.font='bold 14px Noto Sans Georgian';ctx.textAlign='center';
    ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillText(f.text,fx+1,fy+1);
    ctx.fillStyle=f.col;ctx.fillText(f.text,fx,fy);
    ctx.globalAlpha=1;
  }
}

// ── HUD OVERLAY (combo, streak, low-hp warning) ──
function drawHUD(){
  // Enemy count
  const alive=enemies.filter(e=>e.alive).length;
  if(alive>0){
    ctx.fillStyle='rgba(120,16,16,0.72)';ctx.font='bold 11px Noto Sans Georgian';ctx.textAlign='center';
    ctx.fillText('⚔ '+(window.PiraliLanguage?window.PiraliLanguage.gameText('enemies'):'მტრები')+': '+alive,W/2,H-90);
  }
  // Kill streak banner
  if(killStreak>=3&&killStreakTimer>0){
    const alpha=Math.min(1,killStreakTimer/30);
    ctx.save();ctx.globalAlpha=alpha*.9;
    ctx.fillStyle='rgba(10,5,0,.75)';ctx.fillRect(W/2-80,H*.38,160,32);
    ctx.strokeStyle='rgba(240,160,20,.6)';ctx.lineWidth=1;ctx.strokeRect(W/2-80,H*.38,160,32);
    ctx.font='bold 14px Noto Sans Georgian';ctx.textAlign='center';
    const label=killStreak>=7?'💀 '+(window.PiraliLanguage?window.PiraliLanguage.gameText('streak'):'სერია!')+' '+killStreak:killStreak>=5?'🔥 '+killStreak+' '+(window.PiraliLanguage?window.PiraliLanguage.gameText('combo'):'ჯარი')+'!':'⚔ '+killStreak+' '+(window.PiraliLanguage?window.PiraliLanguage.gameText('combo'):'ჯარი');
    ctx.fillStyle='#f0c020';ctx.fillText(label,W/2,H*.38+21);
    ctx.restore();
  }
  // Low HP vignette
  if(health<=2&&health>0){
    const intensity=(.4+Math.sin(lowHpPulse)*0.28)*(health===1?.9:.55);
    const vg=ctx.createRadialGradient(W*.5,H*.5,H*.18,W*.5,H*.5,H*.72);
    vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,`rgba(180,0,0,${intensity})`);
    ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  }
  // Combo indicator (shows after sword hit)
  if(swordComboTimer>0&&swordCombo>0){
    const alpha=Math.min(1,swordComboTimer/10);
    ctx.save();ctx.globalAlpha=alpha;
    ctx.font='bold 12px Noto Sans Georgian';ctx.textAlign='center';
    ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillText('COMBO!',W/2+1,H*.46+1);
    ctx.fillStyle='#f8e040';ctx.fillText('COMBO!',W/2,H*.46);
    ctx.restore();
  }
}

// ── BACKGROUND — NO SKY, PURE GROUND ──
function drawBG(){
  const env=LEVEL_ENV[Math.min(level,5)];
  const isDesert=env.ground==='desert';
  const isNight=env.ground==='night';

  // ── FULL GROUND (100% of canvas) ──
  let g1,g2,g3;
  if(isDesert&&env.w==='hot'){g1='#c3a06b';g2='#a58454';g3='#8a6840';}
  else if(isDesert){g1='#aa8d64';g2='#8d704e';g3='#6d563d';}
  else if(isNight){g1='#243818';g2='#182808';g3='#0e1c06';}
  else if(env.w==='mist'){g1='#617960';g2='#506b4a';g3='#3b5136';}
  else{g1='#648950';g2='#507341';g3='#3b5a30';}
  if(!(window.PiraliBetaVisual?.fillGround(ctx,W,H,camX,camY,level))){ctx.fillStyle=g1;ctx.fillRect(0,0,W,H);}

  // Stars for night (behind everything)
  if(isNight){
    for(let s=0;s<80;s++){
      const stx=th2(s*7+3,3)*W, sty=th2(s*13+7,7)*H;
      if(sy(stx)>-10) continue; // only if truly off-screen world Y
      const tw=Math.sin(frame*.04+s)*.4+.6;
      ctx.globalAlpha=tw*.55;ctx.fillStyle='#e0e8ff';
      ctx.beginPath();ctx.arc(stx,sty,th2(s,s)*1.4+.4,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  // ── GROUND TEXTURE — subtle organic variation ──
  const TS=40;
  const ox=Math.floor(camX/TS)*TS, oy=Math.floor(camY/TS)*TS;
  for(let gx=ox;gx<camX+W+TS;gx+=TS){
    for(let gy=oy;gy<camY+H+TS;gy+=TS){
      const hv=th2(Math.floor(gx/TS),Math.floor(gy/TS));
      if(level===1&&window.PiraliBetaVisual?.groundReady())continue;
      const scx=sx(gx)+TS*.5, scy2=sy(gy)+TS*.5;
      if(hv<.11){
        let dc;
        if(isDesert&&env.w==='hot')dc='rgba(90,52,10,.36)';
        else if(isDesert)dc='rgba(72,40,8,.33)';
        else if(isNight)dc='rgba(6,18,4,.42)';
        else dc='rgba(28,78,8,.3)';
        ctx.fillStyle=dc;
        ctx.beginPath();ctx.ellipse(scx,scy2,TS*.44,TS*.33,.25,0,Math.PI*2);ctx.fill();
      } else if(hv>.89){
        let lc;
        if(isDesert&&env.w==='hot')lc='rgba(215,185,95,.26)';
        else if(isDesert)lc='rgba(168,118,48,.24)';
        else if(isNight)lc='rgba(42,88,22,.22)';
        else lc='rgba(108,210,52,.2)';
        ctx.fillStyle=lc;
        ctx.beginPath();ctx.ellipse(scx,scy2,TS*.36,TS*.28,-.12,0,Math.PI*2);ctx.fill();
      }
      // Tufts — only very sparse
      if(hv>.955&&hv<.975){
        let tc=isDesert?'rgba(110,72,18,.5)':isNight?'rgba(18,55,8,.5)':'rgba(28,88,8,.44)';
        ctx.fillStyle=tc;
        const bx=scx+(hv-.955)*80-2, by2=scy2+(hv-.955)*50-1;
        ctx.fillRect(bx,by2-6,2,7);ctx.fillRect(bx+5,by2-8,2,9);ctx.fillRect(bx+10,by2-5,2,6);
      }
    }
  }

  // ── DESERT SAND DUNES ──
  if(isDesert){
    for(let d=0;d<22;d++){
      const dx=th2(d*11,5)*WW, dy=200+th2(d*7,11)*(WH-400);
      const dsc=sx(dx), dscy=sy(dy);
      if(dsc<-100||dsc>W+100||dscy<-50||dscy>H+50||dpth(dx,dy)<110)continue;
      const dw=55+th2(d,d*3)*100, dh=9+th2(d*5,d)*14;
      ctx.fillStyle=env.w==='hot'?'rgba(195,145,55,.24)':'rgba(155,105,38,.22)';
      ctx.beginPath();ctx.ellipse(dsc,dscy,dw,dh,.1,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=env.w==='hot'?'rgba(228,188,98,.14)':'rgba(185,138,58,.14)';
      ctx.beginPath();ctx.ellipse(dsc-dw*.14,dscy-dh*.28,dw*.52,dh*.44,.1,0,Math.PI*2);ctx.fill();
    }
  }

  // ── NIGHT FIREFLIES ──
  if(isNight){
    for(let f=0;f<10;f++){
      const ft=frame*.016+f*.8;
      const fx=((Math.sin(ft*.7+f)*.5+.5)*W+frame*.4+f*110)%W;
      const fy2=(Math.sin(ft*1.1+f)*.5+.5)*H;
      const fa=Math.sin(ft*2.4)*.5+.5;
      ctx.save();ctx.globalAlpha=fa*.5;ctx.shadowBlur=14;ctx.shadowColor='#b0e030';
      ctx.fillStyle='#c8f040';ctx.beginPath();ctx.arc(fx,fy2,2.2,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;ctx.restore();
    }
  }

  // ── ROCKS ──
  for(let ri=0;ri<55;ri++){
    const rx=th2(ri*7,13)*WW, ry=280+th2(ri*13,7)*(WH-500);
    const rsc=sx(rx), rscy=sy(ry);
    if(rsc<-35||rsc>W+35||rscy<-35||rscy>H+35||dpth(rx,ry)<90)continue;
    const rsz=7+th2(ri*3,ri)*13;
    let rc1=isDesert?'#9a7040':isNight?'#2c3830':'#7a7060';
    let rc2=isDesert?'#b89058':isNight?'#3c5040':'#9a9080';
    ctx.fillStyle=rc1;ctx.beginPath();ctx.ellipse(rsc,rscy,rsz,rsz*.58,.2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=rc2;ctx.beginPath();ctx.ellipse(rsc-rsz*.18,rscy-rsz*.16,rsz*.46,rsz*.26,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.14)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(rsc,rscy,rsz,rsz*.58,.2,0,Math.PI*2);ctx.stroke();
  }

  // ── STONE PATH — cobblestone texture ──
  if(path.length>1){
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    function dPath(){
      ctx.beginPath();ctx.moveTo(sx(path[0].x),sy(path[0].y));
      for(let i=1;i<path.length-1;i++){
        const mx=(path[i].x+path[i+1].x)/2,my=(path[i].y+path[i+1].y)/2;
        ctx.quadraticCurveTo(sx(path[i].x),sy(path[i].y),sx(mx),sy(my));
      }ctx.lineTo(sx(path[path.length-1].x),sy(path[path.length-1].y));ctx.stroke();
    }
    // Shadow
    ctx.strokeStyle='rgba(25,14,3,.55)';ctx.lineWidth=86;dPath();
    let pD=isDesert?'#a07838':isNight?'#2e2a1a':'#9c7c3c';
    let pS=isDesert?'#c8a050':isNight?'#4a4632':'#cbba68';
    let pH=isDesert?'#ddb860':isNight?'#5e5a40':'#dcca7a';
    let pE=isDesert?'#b89040':isNight?'#3a3828':'#b8a458';
    ctx.strokeStyle=pD;ctx.lineWidth=76;dPath();
    ctx.strokeStyle=pS;ctx.lineWidth=62;dPath();
    ctx.strokeStyle=pH;ctx.lineWidth=42;dPath();
    // Center highlight strip
    ctx.strokeStyle=`${pH}88`;ctx.lineWidth=16;ctx.setLineDash([]);dPath();
    // Cross-joints (mortar lines)
    ctx.strokeStyle='rgba(100,72,28,.32)';ctx.lineWidth=1.5;ctx.setLineDash([7,15]);dPath();
    ctx.setLineDash([]);
    // Edge trim
    ctx.strokeStyle='rgba(60,40,10,.38)';ctx.lineWidth=68;
    ctx.globalAlpha=.12;dPath();ctx.globalAlpha=1;
    // Moss/edge detail
    const moss=isDesert?'rgba(90,55,10,.2)':isNight?'rgba(25,55,10,.28)':'rgba(40,90,12,.28)';
    ctx.strokeStyle=moss;ctx.lineWidth=4;dPath();
    ctx.restore();
  }
}

// ── WEATHER OVERLAY ──
function drawWeatherOverlay(){
  const env=LEVEL_ENV[Math.min(level,5)];
  if(env.w==='mist'){
    weatherAlpha=Math.min(1,weatherAlpha+.003);
    const fa=weatherAlpha*.18;
    const fg=ctx.createRadialGradient(W*.5,H*.5,H*.12,W*.5,H*.5,H*.85);
    fg.addColorStop(0,'rgba(0,0,0,0)');fg.addColorStop(1,`rgba(140,165,155,${fa})`);
    ctx.fillStyle=fg;ctx.fillRect(0,0,W,H);
    for(let f=0;f<3;f++){
      const fx=((frame*.7+f*380)%(W+600))-300;
      const fy=H*.4+Math.sin(frame*.007+f*1.6)*50;
      const wg=ctx.createRadialGradient(fx,fy,0,fx,fy,200);
      wg.addColorStop(0,`rgba(175,195,185,${fa*.45})`);wg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=wg;ctx.fillRect(fx-200,fy-80,400,160);
    }
  } else if(env.w==='rain'){
    ctx.fillStyle='rgba(18,30,45,0.09)';ctx.fillRect(0,0,W,H);
    ctx.save();ctx.globalAlpha=.2;ctx.strokeStyle='#a0c0e0';ctx.lineWidth=1;
    for(let r=0;r<55;r++){
      const rx=((th2(r,Math.floor(frame*.4))*(W+200))+frame*2.0)%(W+200)-100;
      const ry=(th2(r+300,Math.floor(frame*.4))*(H+200)+frame*3.2)%(H+200)-100;
      ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx-3,ry+11);ctx.stroke();
    }
    ctx.restore();
  } else if(env.w==='dusk'){
    const dg=ctx.createLinearGradient(0,H*.15,0,H*.5);
    dg.addColorStop(0,'rgba(200,70,10,.22)');dg.addColorStop(1,'rgba(200,70,10,0)');
    ctx.fillStyle=dg;ctx.fillRect(0,0,W,H*.5);
    const vg=ctx.createRadialGradient(W*.5,H*.5,H*.28,W*.5,H*.5,H*.9);
    vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(50,8,0,.22)');
    ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  } else if(env.w==='hot'){
    // Heat haze shimmer effect
    const hg=ctx.createLinearGradient(0,H*.15,0,H*.45);
    hg.addColorStop(0,'rgba(255,190,50,.14)');hg.addColorStop(1,'rgba(255,190,50,0)');
    ctx.fillStyle=hg;ctx.fillRect(0,0,W,H*.45);
    // Shimmer line
    const shim=Math.sin(frame*.08)*4+2;
    ctx.strokeStyle=`rgba(255,200,80,${.04+Math.sin(frame*.06)*.02})`;ctx.lineWidth=shim;
    ctx.beginPath();ctx.moveTo(0,H*.32);ctx.lineTo(W,H*.32);ctx.stroke();
  } else if(env.w==='night'){
    ctx.fillStyle='rgba(0,5,20,0.08)';ctx.fillRect(0,0,W,H);
    // Firefly effects
    for(let f=0;f<8;f++){
      const ft=frame*.018+f*0.8;
      const fx=((Math.sin(ft*.7+f)*0.5+0.5)*W+frame*.3+f*120)%W;
      const fy=H*.3+Math.sin(ft*1.1+f)*H*.15;
      const fa=Math.sin(ft*2.2)*0.5+0.5;
      ctx.save();ctx.globalAlpha=fa*.55;ctx.shadowBlur=12;ctx.shadowColor='#c0e840';
      ctx.fillStyle='#d0f050';ctx.beginPath();ctx.arc(fx,fy,2,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;ctx.restore();
    }
  }
  // Subtle vignette always
  const vg2=ctx.createRadialGradient(W*.5,H*.5,H*.2,W*.5,H*.5,H*.9);
  vg2.addColorStop(0,'rgba(0,0,0,0)');vg2.addColorStop(1,'rgba(0,0,0,.2)');
  ctx.fillStyle=vg2;ctx.fillRect(0,0,W,H);
}

// ── TREES ──
function drawTrees(){
  const env=LEVEL_ENV[Math.min(level,5)];
  const isDesert=env.ground==='desert';const isNight=env.ground==='night';
  const vis=trees.filter(t=>{const x=sx(t.x),y=sy(t.y);return x>-t.r*3&&x<W+t.r*3&&y>-t.r*3&&y<H+t.r*3;}).sort((a,b)=>a.y-b.y);
  vis.forEach(t=>{
    const tx=sx(t.x),ty=sy(t.y);

    // Shadow
    ctx.save();ctx.globalAlpha=isNight?.14:.2;ctx.fillStyle='#0a0e04';
    ctx.beginPath();ctx.ellipse(tx+4,ty+7,t.r*1.05,t.r*.44,.18,0,Math.PI*2);ctx.fill();ctx.restore();

    if(t.kind==='rock'){
      // Desert boulder
      const rg=ctx.createRadialGradient(tx-t.r*.3,ty-t.r*.3,0,tx,ty,t.r);
      if(isDesert&&env.w==='hot'){rg.addColorStop(0,'#c09050');rg.addColorStop(.6,'#8a6030');rg.addColorStop(1,'#5a3c18');}
      else{rg.addColorStop(0,'#a07850');rg.addColorStop(.6,'#785838');rg.addColorStop(1,'#4a3018');}
      ctx.fillStyle=rg;ctx.beginPath();ctx.ellipse(tx,ty,t.r,t.r*.72,.1,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(255,220,150,.18)';ctx.beginPath();ctx.ellipse(tx-t.r*.3,ty-t.r*.28,t.r*.5,t.r*.32,.1,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(tx,ty,t.r,t.r*.72,.1,0,Math.PI*2);ctx.stroke();

    } else if(t.kind==='oak'){
      ctx.fillStyle=isNight?'#2a1e0e':'#5e3c18';ctx.beginPath();ctx.arc(tx,ty,t.r*.3,0,Math.PI*2);ctx.fill();
      const g=ctx.createRadialGradient(tx-t.r*.26,ty-t.r*.3,0,tx,ty,t.r);
      if(isNight){g.addColorStop(0,'#2e5520');g.addColorStop(.45,'#1e3c12');g.addColorStop(.78,'#122808');g.addColorStop(1,'#0c1c04');}
      else if(env.w==='mist'){g.addColorStop(0,'#6aaa34');g.addColorStop(.45,'#4a8422');g.addColorStop(1,'#28540e');}
      else{g.addColorStop(0,'#7ecc38');g.addColorStop(.38,'#56aa22');g.addColorStop(.72,'#387014');g.addColorStop(1,'#205008');}
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(tx,ty,t.r,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=isNight?'rgba(60,130,40,.12)':'rgba(140,240,70,.15)';
      ctx.beginPath();ctx.arc(tx-t.r*.28,ty-t.r*.28,t.r*.42,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=isNight?'rgba(0,20,0,.2)':'rgba(0,50,0,.18)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(tx,ty,t.r,0,Math.PI*2);ctx.stroke();

    } else if(t.kind==='pine'){
      const trunk=isNight?'#2a1a0a':isDesert?'#6a3c14':'#4a2810';
      ctx.fillStyle=trunk;ctx.fillRect(tx-t.r*.1,ty,t.r*.22,t.r*.38);
      for(let l=0;l<4;l++){
        const ly=ty-l*t.r*.34,lw=t.r*(0.88-l*.19);
        let shade;
        if(isNight)shade=['#1a3810','#224414','#2a5018','#346020'][l];
        else if(env.w==='mist')shade=['#3c6a18','#487820','#548828','#609430'][l];
        else shade=['#3a6814','#4a8020','#5a9828','#6aac32'][l];
        ctx.fillStyle=shade;
        ctx.beginPath();ctx.moveTo(tx,ly-t.r*.62);ctx.lineTo(tx-lw,ly+t.r*.2);ctx.lineTo(tx+lw,ly+t.r*.2);ctx.closePath();ctx.fill();
        ctx.fillStyle=isNight?'rgba(60,120,40,.1)':'rgba(120,220,60,.12)';
        ctx.beginPath();ctx.moveTo(tx-lw*.08,ly-t.r*.52);ctx.lineTo(tx-lw*.68,ly+t.r*.12);ctx.lineTo(tx,ly+t.r*.12);ctx.closePath();ctx.fill();
      }

    } else if(t.kind==='birch'){
      const bg2=ctx.createLinearGradient(tx-t.r*.18,ty-t.r*.8,tx+t.r*.18,ty);
      bg2.addColorStop(0,isNight?'#c8b8a0':'#e8e2d4');bg2.addColorStop(1,isNight?'#887060':'#a89880');
      ctx.fillStyle=bg2;ctx.fillRect(tx-t.r*.16,ty-t.r*.9,t.r*.32,t.r*.9);
      ctx.fillStyle='#3a3428';for(let m=0;m<3;m++){ctx.fillRect(tx-t.r*.14,ty-t.r*(.24+m*.26),t.r*.28,t.r*.06);}
      const lg2=ctx.createRadialGradient(tx-t.r*.22,ty-t.r*1.1,0,tx,ty-t.r*.8,t.r*.85);
      if(isNight){lg2.addColorStop(0,'#5a8830');lg2.addColorStop(.5,'#3a6018');lg2.addColorStop(1,'rgba(20,50,10,0)');}
      else if(env.w==='mist'){lg2.addColorStop(0,'#98c458');lg2.addColorStop(.5,'#70a030');lg2.addColorStop(1,'rgba(40,80,15,0)');}
      else{lg2.addColorStop(0,'#b4e060');lg2.addColorStop(.5,'#84c038');lg2.addColorStop(1,'rgba(50,95,18,0)');}
      ctx.fillStyle=lg2;ctx.beginPath();ctx.ellipse(tx,ty-t.r*.82,t.r*.82,t.r*.7,0,0,Math.PI*2);ctx.fill();

    } else if(t.kind==='dead'){
      const deadCol=isNight?'#2c2010':isDesert?'#5a3010':'#382418';
      ctx.strokeStyle=deadCol;ctx.lineWidth=t.r*.22;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx,ty-t.r*1.3);ctx.stroke();
      ctx.lineWidth=t.r*.12;
      ctx.beginPath();ctx.moveTo(tx,ty-t.r*.6);ctx.lineTo(tx-t.r*.8,ty-t.r*1.1);ctx.stroke();
      ctx.beginPath();ctx.moveTo(tx,ty-t.r*.8);ctx.lineTo(tx+t.r*.72,ty-t.r*1.15);ctx.stroke();
      ctx.lineWidth=t.r*.07;
      ctx.beginPath();ctx.moveTo(tx-t.r*.8,ty-t.r*1.1);ctx.lineTo(tx-t.r*1.08,ty-t.r*.84);ctx.stroke();
      ctx.beginPath();ctx.moveTo(tx+t.r*.72,ty-t.r*1.15);ctx.lineTo(tx+t.r*1.0,ty-t.r*.9);ctx.stroke();
      // Glow for night dead trees
      if(isNight){
        ctx.save();ctx.globalAlpha=.15;ctx.shadowBlur=14;ctx.shadowColor='#5080c0';
        ctx.strokeStyle='#4060a0';ctx.lineWidth=t.r*.08;
        ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx,ty-t.r*1.3);ctx.stroke();
        ctx.shadowBlur=0;ctx.restore();
      }

    } else { // bush
      for(let b2=0;b2<4;b2++){
        const ba=t.off+b2*1.57,bd=t.r*.42;
        const bx2=tx+Math.cos(ba)*bd,by2=ty+Math.sin(ba)*bd*.6;
        const bg3=ctx.createRadialGradient(bx2-1,by2-1,0,bx2,by2,t.r*.6);
        if(isNight){bg3.addColorStop(0,'#2e5818');bg3.addColorStop(.6,'#1c3c0c');bg3.addColorStop(1,'#0e2208');}
        else if(isDesert&&env.w==='hot'){bg3.addColorStop(0,'#8a7820');bg3.addColorStop(.6,'#6a5810');bg3.addColorStop(1,'#3c3008');}
        else if(isDesert){bg3.addColorStop(0,'#6a6018');bg3.addColorStop(.6,'#4a4010');bg3.addColorStop(1,'#2c2408');}
        else if(env.w==='mist'){bg3.addColorStop(0,'#68a030');bg3.addColorStop(.6,'#488018');bg3.addColorStop(1,'#285408');}
        else{bg3.addColorStop(0,'#78c032');bg3.addColorStop(.6,'#54a018');bg3.addColorStop(1,'#2e6008');}
        ctx.fillStyle=bg3;ctx.beginPath();ctx.arc(bx2,by2,t.r*.58,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle=isNight?'rgba(60,130,35,.1)':'rgba(140,240,65,.12)';
      ctx.beginPath();ctx.arc(tx-t.r*.2,ty-t.r*.18,t.r*.34,0,Math.PI*2);ctx.fill();
    }
  });
}

// ── CHURCH ──
function drawChurch(){
  const cx=sx(CHURCH_X),cy=sy(CHURCH_Y);
  if(cx<-180||cx>W+180||cy<-200||cy>H+60)return;
  const gp=.6+Math.sin(frame*.042)*.4;
  ctx.save();ctx.globalAlpha=.14*gp;
  const gg=ctx.createRadialGradient(cx,cy+20,0,cx,cy+20,140);
  gg.addColorStop(0,'#f5e050');gg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=gg;ctx.beginPath();ctx.arc(cx,cy+20,140,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.save();ctx.globalAlpha=.36;ctx.fillStyle='#110e06';ctx.beginPath();ctx.ellipse(cx+7,cy+44,74,24,0,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.fillStyle='#7a6e52';ctx.fillRect(cx-58,cy-18,116,82);
  ctx.fillStyle='#8a7e60';ctx.fillRect(cx-54,cy-14,108,74);
  ctx.fillStyle='#b0a07a';ctx.fillRect(cx-44,cy-50,88,92);
  ctx.strokeStyle='rgba(90,70,28,.28)';ctx.lineWidth=1;
  for(let row=0;row<6;row++){ctx.beginPath();ctx.moveTo(cx-44,cy-50+row*14);ctx.lineTo(cx+44,cy-50+row*14);ctx.stroke();}
  for(let col=0;col<5;col++){ctx.beginPath();ctx.moveTo(cx-34+col*17,cy-50);ctx.lineTo(cx-34+col*17,cy+4);ctx.stroke();}
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(cx+26,cy-50,18,92);
  ctx.fillStyle='#c8b880';ctx.fillRect(cx-46,cy-52,92,8);
  for(const s2 of[-1,1]){
    ctx.fillStyle='#a8987a';ctx.beginPath();ctx.arc(cx+s2*50,cy+10,26,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#989068';ctx.beginPath();ctx.arc(cx+s2*50+s2*2,cy+12,18,0,Math.PI*2);ctx.fill();
  }
  for(const s2 of[-1,1]){
    const wx=cx+s2*22,wy=cy-26;
    ctx.fillStyle='#c0aa78';ctx.beginPath();ctx.arc(wx,wy,11,Math.PI,0);ctx.lineTo(wx+11,wy+18);ctx.lineTo(wx-11,wy+18);ctx.closePath();ctx.fill();
    ctx.fillStyle='#1e1608';ctx.beginPath();ctx.arc(wx,wy,8,Math.PI,0);ctx.lineTo(wx+8,wy+14);ctx.lineTo(wx-8,wy+14);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(240,190,60,.32)';ctx.beginPath();ctx.arc(wx,wy,6,Math.PI,0);ctx.lineTo(wx+6,wy+10);ctx.lineTo(wx-6,wy+10);ctx.closePath();ctx.fill();
  }
  ctx.fillStyle='#2c1a08';ctx.beginPath();ctx.arc(cx,cy+4,14,Math.PI,0);ctx.lineTo(cx+14,cy+44);ctx.lineTo(cx-14,cy+44);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#3e280e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,cy+4);ctx.lineTo(cx,cy+44);ctx.stroke();
  ctx.fillStyle='#9a8c68';ctx.beginPath();ctx.arc(cx,cy-60,20,0,Math.PI*2);ctx.fill();
  const dg=ctx.createLinearGradient(cx-20,cy-80,cx+10,cy-60);
  dg.addColorStop(0,'#d0c080');dg.addColorStop(.5,'#b0a060');dg.addColorStop(1,'#807040');
  ctx.fillStyle=dg;ctx.beginPath();ctx.moveTo(cx-20,cy-60);
  for(let a=Math.PI;a<=2*Math.PI;a+=.08)ctx.lineTo(cx+Math.cos(a)*20,cy-60+Math.sin(a)*12);
  ctx.lineTo(cx,cy-98);ctx.closePath();ctx.fill();
  ctx.shadowBlur=22*gp;ctx.shadowColor='#f0d040';ctx.fillStyle='#f5e050';
  ctx.fillRect(cx-3.5,cy-118,7,36);ctx.fillRect(cx-17,cy-108,34,8);
  ctx.fillStyle='#ffe070';ctx.fillRect(cx-2,cy-118,3,36);ctx.fillRect(cx-15,cy-107,30,4);
  ctx.shadowBlur=0;
  ctx.font='bold 14px Noto Sans Georgian';ctx.textAlign='center';
  ctx.shadowBlur=20;ctx.shadowColor='#000';ctx.fillStyle='#111';ctx.fillText((window.PiraliLanguage?window.PiraliLanguage.gameText('church'):'თამარის ეკლესია'),cx+1,cy-137);ctx.shadowBlur=0;
  ctx.shadowBlur=16;ctx.shadowColor='#c8941a';ctx.fillStyle='#f5e060';ctx.fillText((window.PiraliLanguage?window.PiraliLanguage.gameText('church'):'თამარის ეკლესია'),cx,cy-138);ctx.shadowBlur=0;
}

// ── SIGNPOST ──
function drawSignpost(){
  if(!signNode)return;
  const x=sx(signNode.x),y=sy(signNode.y);
  if(x<-120||x>W+120||y<-50||y>H+50)return;
  ctx.fillStyle='#6a4018';ctx.fillRect(x-3,y-38,6,42);ctx.fillStyle='#7a5020';ctx.fillRect(x-2,y-38,3,42);
  ctx.fillStyle='#c8a060';ctx.fillRect(x-46,y-58,92,24);ctx.fillStyle='#b89050';ctx.fillRect(x-44,y-56,88,20);
  ctx.strokeStyle='#7a5018';ctx.lineWidth=1.5;ctx.strokeRect(x-46,y-58,92,24);
  const stageLabel='↑ '+(window.PiraliLanguage?window.PiraliLanguage.getLevelName(level):PIRALI_LEVELS[level-1].ka)+' ↑';
  ctx.font='bold 10px Noto Sans Georgian';ctx.textAlign='center';
  ctx.fillStyle='rgba(0,0,0,.42)';ctx.fillText(stageLabel,x+1,y-42,89);
  ctx.fillStyle='#3c1e06';ctx.fillText(stageLabel,x,y-43,89);
}


// ── AMBIENTS ──
function drawAmbients(){
  ambients.forEach(a=>{
    const ax=sx(a.x),ay=sy(a.y);
    if(ax<-20||ax>W+20||ay<-20||ay>H+20)return;
    if(a.kind==='flower'){
      ctx.strokeStyle='#3a8010';ctx.lineWidth=1.2;
      ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax,ay-a.sz*2.5);ctx.stroke();
      for(let p=0;p<5;p++){
        const pa=a.off+p*(Math.PI*2/5)+frame*.008;
        ctx.fillStyle=a.col+'cc';
        ctx.beginPath();ctx.ellipse(ax+Math.cos(pa)*a.sz*1.2,ay-a.sz*2.5+Math.sin(pa)*a.sz*1.2,a.sz*.7,a.sz*.5,pa,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle='#ffee44';ctx.beginPath();ctx.arc(ax,ay-a.sz*2.5,a.sz*.55,0,Math.PI*2);ctx.fill();
    } else {
      ctx.fillStyle='#c8b890';ctx.fillRect(ax-1.5,ay-a.sz*1.2,3,a.sz*1.2);
      ctx.fillStyle=a.col;ctx.beginPath();ctx.ellipse(ax,ay-a.sz*1.2,a.sz*1.4,a.sz*.9,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.38)';ctx.beginPath();ctx.ellipse(ax-a.sz*.4,ay-a.sz*1.5,a.sz*.4,a.sz*.3,.2,0,Math.PI*2);ctx.fill();
    }
  });
}

// ── GROUND SLAM WARNING ──
function drawGroundSlam(){
  if(!boss||!boss.groundSlamActive)return;
  const cx=sx(boss.groundSlamX),cy=sy(boss.groundSlamY);
  const prog=1-(boss.groundSlamT/18);
  ctx.save();ctx.globalAlpha=.5+Math.sin(frame*.4)*.2;
  ctx.strokeStyle='#ff6020';ctx.lineWidth=3;ctx.shadowBlur=18;ctx.shadowColor='#ff4010';
  ctx.beginPath();ctx.arc(cx,cy,70*prog,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy,45*prog,0,Math.PI*2);ctx.stroke();
  ctx.shadowBlur=0;ctx.restore();
}

// ── CORPSES ──
function drawCorpses(){
  corpses.forEach(c=>{
    const cx2=sx(c.x),cy2=sy(c.y);
    if(cx2<-50||cx2>W+50||cy2<-50||cy2>H+50)return;
    ctx.save();ctx.globalAlpha=.68;ctx.translate(cx2,cy2);ctx.rotate(c.ang+Math.PI*.5);
    const col=c.etype==='boss'?'#5a0000':c.etype==='rifle'?'#5a0a0a':'#1c2814';
    ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(0,0,c.etype==='boss'?c.r:c.r,c.r*.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(100,0,0,.42)';ctx.beginPath();ctx.ellipse(c.r*.4,c.r*.2,c.r*.72,c.r*.48,.3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(c.r*.9,-c.r*.4,6,4,.5,0,Math.PI*2);ctx.fill();
    ctx.restore();
  });
}

// ── PICKUPS ──
function drawPickups(){
  pickups.forEach(pk=>{
    if(pk.col)return;
    const x=sx(pk.x),y=sy(pk.y)+Math.sin(pk.bob||0)*3.5;
    if(x<-24||x>W+24||y<-24||y>H+24)return;
    if(PiraliBetaGear.drawPickup(ctx,pk,x,y))return;
    const glowCol=pk.type==='health'?'#e04040':pk.type==='herb'?'#44cc44':pk.type==='medal'?'#f0c020':'#c8941a';
    ctx.shadowBlur=14;ctx.shadowColor=glowCol;
    ctx.font='16px serif';ctx.textAlign='center';
    const icon=pk.type==='health'?'❤️':pk.type==='herb'?'🌿':pk.type==='medal'?'🏅':'🔸';
    ctx.fillText(icon,x,y);
    ctx.shadowBlur=0;
    // Small glow ring
    ctx.save();ctx.globalAlpha=.18+Math.sin((pk.bob||0)*2)*.08;
    ctx.strokeStyle=glowCol;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(x,y-6,9,0,Math.PI*2);ctx.stroke();
    ctx.restore();
  });
}

// ── BULLETS ──
function drawBullets(){
  bullets.forEach(b=>{
    if(!b.alive)return;
    const bx=sx(b.x),by=sy(b.y);
    ctx.shadowBlur=10;ctx.shadowColor=b.fp?'#ffaa00':'#ff3030';
    ctx.fillStyle=b.fp?'#ffe060':'#ff5555';
    ctx.beginPath();ctx.arc(bx,by,4,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=.35;ctx.fillStyle=b.fp?'#ffc020':'#ff2020';
    ctx.beginPath();ctx.arc(bx-b.vx*.6,by-b.vy*.6,2.5,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;ctx.shadowBlur=0;
  });
}

// ── PARTICLES ──
function drawParticles(){
  parts.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life/p.ml);ctx.fillStyle=p.col;ctx.fillRect(sx(p.x)-p.sz/2,sy(p.y)-p.sz/2,p.sz,p.sz);});
  ctx.globalAlpha=1;
}

// ── PLAYER: SIMONA — top-down RPG style ──
// Character art moved to js/characters/simona.js (loaded after this file).

// ── ENEMY — 2 types ──
function drawEnemy(e){
  if(!e.alive)return;
  const ex=sx(e.x),ey=sy(e.y);
  if(ex<-60||ex>W+60||ey<-60||ey>H+60)return;
  // Landlord NPC — draw as red-coated figure
  if(e.etype==='landlord'){
    ctx.save();
    if(e.hf>0&&e.hf%2===0)ctx.filter='brightness(3.2)';
    const bob=Math.sin(Date.now()*0.006)*2;
    // shadow
    ctx.globalAlpha=0.22;ctx.fillStyle='#0e0c04';
    ctx.beginPath();ctx.ellipse(ex+2,ey+8,14,5,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    // body
    ctx.fillStyle='#991010';ctx.fillRect(ex-10,ey-14+bob,20,30);
    // coat highlight
    ctx.fillStyle='#cc1818';ctx.fillRect(ex-10,ey-14+bob,20,8);
    // arms
    ctx.fillStyle='#881010';ctx.fillRect(ex-17,ey-12+bob,8,18);ctx.fillRect(ex+9,ey-12+bob,8,18);
    // legs (flailing if scared)
    const legS=Math.sin(Date.now()*0.02)*8;
    ctx.fillStyle='#770e0e';
    ctx.fillRect(ex-9,ey+16+bob,8,20+legS);
    ctx.fillRect(ex+1,ey+16+bob,8,20-legS);
    // head
    ctx.fillStyle='#c09060';ctx.beginPath();ctx.arc(ex,ey-22+bob,11,0,Math.PI*2);ctx.fill();
    // hat
    ctx.fillStyle='#660808';ctx.fillRect(ex-12,ey-34+bob,24,8);ctx.fillRect(ex-8,ey-44+bob,16,12);
    // face (scared expression)
    ctx.fillStyle='rgba(0,0,0,0.7)';
    ctx.beginPath();ctx.arc(ex-4,ey-23+bob,2.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(ex+4,ey-23+bob,2.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(ex,ey-17+bob,3,0,Math.PI);ctx.fill();
    // HP bar
    if(e.maxHp>1){
      ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(ex-16,ey-52,32,5);
      ctx.fillStyle='#cc2020';ctx.fillRect(ex-16,ey-52,(e.hp/e.maxHp)*32,5);
    }
    // label
    ctx.fillStyle='#e04040';ctx.font='bold 10px sans-serif';ctx.textAlign='center';
    ctx.shadowBlur=6;ctx.shadowColor='#cc0000';
    ctx.fillText((window.PiraliLanguage?window.PiraliLanguage.gameText('landlord'):'მემამულე'),ex,ey-56+bob);
    ctx.shadowBlur=0;
    ctx.restore();
    return;
  }
  ctx.save();
  if(e.hf>0&&e.hf%2===0)ctx.filter='brightness(3.2)';
  const ga=ctx.globalAlpha;ctx.globalAlpha=ga*.24;ctx.fillStyle='#0e0c04';
  ctx.beginPath();ctx.ellipse(ex+3,ey+8,e.r+2,5.5,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=ga;

  const isRifle=(e.etype==='rifle');
  const isOfficer=(e.etype==='officer');

  // ── COAT color by type ──
  const coatBase=isOfficer?'#2a1e08':isRifle?'#5a0a0a':'#1c2814';
  const coatHi  =isOfficer?'#4a3412':isRifle?'#7a1010':'#263618';
  const beltCol =isOfficer?'#c8a020':isRifle?'#c04010':'#3a4828';
  const starCol =isOfficer?'#f8e040':isRifle?'#f0e040':'#cc1818';

  ctx.fillStyle=coatBase;ctx.beginPath();ctx.arc(ex,ey,e.r,0,Math.PI*2);ctx.fill();
  // Coat sheen
  const cg=ctx.createRadialGradient(ex-e.r*.3,ey-e.r*.3,0,ex,ey,e.r*1.05);
  cg.addColorStop(0,isOfficer?'rgba(100,75,20,.7)':isRifle?'rgba(100,20,20,.6)':'rgba(40,65,24,.6)');
  cg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=cg;ctx.beginPath();ctx.arc(ex,ey,e.r,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.15)';ctx.beginPath();ctx.arc(ex+e.r*.3,ey+e.r*.2,e.r*.55,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=beltCol;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(ex,ey,e.r-3,.2,Math.PI*.85);ctx.stroke();

  // Officer: epaulette details on shoulders
  if(isOfficer){
    for(const side of[-1,1]){
      const sa=e.ang+side*Math.PI*.44;
      const spx=ex+Math.cos(sa)*(e.r*.82),spy=ey+Math.sin(sa)*(e.r*.82);
      ctx.fillStyle='#b88020';ctx.beginPath();ctx.arc(spx,spy,4,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#e0aa30';ctx.beginPath();ctx.arc(spx,spy,2.2,0,Math.PI*2);ctx.fill();
    }
  }

  // Insignia star / medal
  ctx.fillStyle=starCol;ctx.font=`bold ${isOfficer?13:11}px serif`;ctx.textAlign='center';
  ctx.shadowBlur=isOfficer?8:0;ctx.shadowColor='#f8e040';
  ctx.fillText('★',ex,ey+4);ctx.shadowBlur=0;

  // ── HEAD ──
  const ehx=ex+Math.cos(e.ang)*(isOfficer?7:6),ehy=ey+Math.sin(e.ang)*(isOfficer?7:6);
  ctx.fillStyle=isOfficer?'#c8a068':'#c09060';
  ctx.beginPath();ctx.arc(ehx,ehy,isOfficer?7.5:6.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(80,40,10,.16)';ctx.beginPath();ctx.arc(ehx+1,ehy+1,isOfficer?5:4.5,0,Math.PI*2);ctx.fill();

  // Eyes
  const eea=e.ang+Math.PI*.5;
  ctx.fillStyle='#1a0a04';
  ctx.beginPath();ctx.arc(ehx+Math.cos(eea)*2+Math.cos(e.ang)*.8,ehy+Math.sin(eea)*2+Math.sin(e.ang)*.8,1.1,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(ehx-Math.cos(eea)*2+Math.cos(e.ang)*.8,ehy-Math.sin(eea)*2+Math.sin(e.ang)*.8,1.1,0,Math.PI*2);ctx.fill();
  // Mustache
  ctx.strokeStyle='#3a1e08';ctx.lineWidth=1.1;
  ctx.beginPath();ctx.moveTo(ehx+Math.cos(eea)*1+Math.cos(e.ang)*2.5,ehy+Math.sin(eea)*1+Math.sin(e.ang)*2.5);
  ctx.lineTo(ehx+Math.cos(eea)*3+Math.cos(e.ang)*2,ehy+Math.sin(eea)*3+Math.sin(e.ang)*2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(ehx-Math.cos(eea)*1+Math.cos(e.ang)*2.5,ehy-Math.sin(eea)*1+Math.sin(e.ang)*2.5);
  ctx.lineTo(ehx-Math.cos(eea)*3+Math.cos(e.ang)*2,ehy-Math.sin(eea)*3+Math.sin(e.ang)*2);ctx.stroke();

  // Officer: monocle on one eye
  if(isOfficer){
    const mx=ehx+Math.cos(eea)*2+Math.cos(e.ang)*.8,my=ehy+Math.sin(eea)*2+Math.sin(e.ang)*.8;
    ctx.strokeStyle='#c8a030';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(mx,my,2.8,0,Math.PI*2);ctx.stroke();
  }

  // ── HATS ──
  if(isOfficer){
    // Officer peaked cap — gold-trimmed
    ctx.fillStyle='#1a1008';ctx.beginPath();ctx.ellipse(ehx,ehy-4,9,5.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#c8a010';ctx.beginPath();ctx.ellipse(ehx,ehy-4,9,5.5,0,0,Math.PI,true);ctx.stroke();
    ctx.fillStyle='#2a1e10';ctx.beginPath();ctx.ellipse(ehx,ehy-5.5,7,4,0,0,Math.PI);ctx.fill();
    // Gold band
    ctx.fillStyle='#c8a010';ctx.fillRect(ehx-8.5,ehy-4.5,17,2);
    // Gold star on cap
    ctx.shadowBlur=8;ctx.shadowColor='#f0c020';
    ctx.fillStyle='#f8d030';ctx.font='9px serif';ctx.textAlign='center';ctx.fillText('★',ehx,ehy-3.8);
    ctx.shadowBlur=0;
    // Brim
    ctx.fillStyle='#111';ctx.beginPath();ctx.moveTo(ehx-9.5,ehy-4);ctx.quadraticCurveTo(ehx,ehy,ehx+9.5,ehy-4);ctx.lineTo(ehx+8,ehy-4.5);ctx.quadraticCurveTo(ehx,ehy-.5,ehx-8,ehy-4.5);ctx.closePath();ctx.fill();
  } else if(isRifle){
    // Peaked cap — red band
    ctx.fillStyle='#222';ctx.beginPath();ctx.ellipse(ehx,ehy-3,8.5,5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#9a1010';ctx.beginPath();ctx.ellipse(ehx,ehy-3.5,7,3.8,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.ellipse(ehx,ehy-5,6.5,3.5,0,0,Math.PI);ctx.fill();
    ctx.fillStyle='#f0e040';ctx.font='7px serif';ctx.textAlign='center';ctx.fillText('★',ehx,ehy-4.5);
  } else {
    // Budyonovka — pointed
    ctx.fillStyle='#1c2814';ctx.beginPath();ctx.ellipse(ehx,ehy-4,7.5,4.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#263420';ctx.beginPath();ctx.ellipse(ehx-.5,ehy-4.5,5.5,3,.06,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#1c2814';ctx.beginPath();ctx.moveTo(ehx-7,ehy-4.5);ctx.quadraticCurveTo(ehx,ehy-17,ehx+7,ehy-4.5);ctx.closePath();ctx.fill();
    ctx.fillStyle='#243020';ctx.beginPath();ctx.moveTo(ehx-4.5,ehy-5);ctx.quadraticCurveTo(ehx,ehy-15,ehx+4.5,ehy-5);ctx.closePath();ctx.fill();
    ctx.fillStyle='#cc1818';ctx.font='bold 7px serif';ctx.textAlign='center';ctx.fillText('★',ehx,ehy-5.5);
  }

  // ── WEAPON ──
  if(isRifle||isOfficer){
    ctx.save();ctx.translate(ex+Math.cos(e.ang+.58)*(e.r*.88),ey+Math.sin(e.ang+.58)*(e.r*.88));ctx.rotate(e.ang+.58);
    if(isOfficer){
      // Officer pistol — shorter, silver
      ctx.fillStyle='#888';ctx.fillRect(0,-2,14,4);ctx.fillStyle='#aaa';ctx.fillRect(0,-1.5,6,2.5);ctx.fillStyle='#4a3010';ctx.fillRect(-6,-2.2,7,4.4);
    } else {
      ctx.fillStyle='#2a2218';ctx.fillRect(0,-2,26,4);ctx.fillStyle='#383028';ctx.fillRect(0,-1.5,11,3);ctx.fillStyle='#4a3010';ctx.fillRect(-9,-2.5,10,5);
    }
    ctx.restore();
  } else {
    ctx.save();ctx.translate(ex+Math.cos(e.ang+.62)*(e.r*.85),ey+Math.sin(e.ang+.62)*(e.r*.85));ctx.rotate(e.ang+.62);
    ctx.fillStyle='#c0c2d0';ctx.fillRect(0,-1.5,28,3);ctx.fillStyle='rgba(220,230,255,.35)';ctx.fillRect(0,-1,28,1.5);ctx.fillStyle='#c09020';ctx.fillRect(-3,-5,5,10);ctx.fillStyle='#4a2c0a';ctx.fillRect(-12,-2,10,4);ctx.restore();
  }

  // ── HP BAR ──
  if(e.maxHp>1){
    ctx.fillStyle='rgba(0,0,0,.62)';ctx.fillRect(ex-18,ey-e.r-12,36,6);
    const hpCol=isOfficer?'#c89010':isRifle?'#880808':'#106010';
    const hpHi =isOfficer?'#f0c030':isRifle?'#cc1010':'#20a020';
    ctx.fillStyle=hpCol;ctx.fillRect(ex-18,ey-e.r-12,(e.hp/e.maxHp)*36,6);
    ctx.fillStyle=hpHi;ctx.fillRect(ex-18,ey-e.r-12,(e.hp/e.maxHp)*36*.55,2.5);
  }
  // Alert indicator
  if(e.state==='alert'){
    ctx.fillStyle='#ffcc00';ctx.font='bold 10px serif';ctx.textAlign='center';
    ctx.fillText('!',ex,ey-e.r-16);
  }
  ctx.restore();
}

// ── BOSS: GENERAL ──
function drawBoss(b){
  if(!b.alive)return;
  const bx=sx(b.x),by2=sy(b.y);
  if(bx<-80||bx>W+80||by2<-80||by2>H+80)return;
  ctx.save();
  if(b.hf>0&&b.hf%2===0)ctx.filter='brightness(4)';
  // Shadow
  ctx.globalAlpha=.32;ctx.fillStyle='#100c04';ctx.beginPath();ctx.ellipse(bx+6,by2+12,b.r*1.3,b.r*.55,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;

  // Phase 2 ground slam shockwave overlay
  if(b.groundSlamActive){
    ctx.save();ctx.globalAlpha=.35+Math.sin(frame*.6)*.15;
    ctx.strokeStyle='#ff5010';ctx.lineWidth=4;ctx.shadowBlur=20;ctx.shadowColor='#ff3000';
    ctx.beginPath();ctx.arc(bx,by2,b.r+14+Math.sin(frame*.3)*4,0,Math.PI*2);ctx.stroke();
    ctx.shadowBlur=0;ctx.restore();
  }

  // ── RAGE GLOW (Phase 2) ──
  if(b.rageMode){
    ctx.save();ctx.globalAlpha=.28+Math.sin(frame*.18)*.14;
    const rg=ctx.createRadialGradient(bx,by2,0,bx,by2,b.r+18);
    rg.addColorStop(0,'#ff1010');rg.addColorStop(.5,'#aa0000');rg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=rg;ctx.beginPath();ctx.arc(bx,by2,b.r+18,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }

  // ── BODY ── (Phase 2: torn coat shows red underneath)
  const bodyCol=b.rageMode?'#500808':'#380808';
  ctx.fillStyle=bodyCol;ctx.beginPath();ctx.arc(bx,by2,b.r,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=b.rageMode?'#701010':'#500a0a';ctx.beginPath();ctx.arc(bx-b.r*.2,by2-b.r*.2,b.r*.65,0,Math.PI*2);ctx.fill();
  if(b.rageMode){
    // Torn coat reveals blood-red interior
    ctx.fillStyle='rgba(180,10,10,.28)';
    for(let t=0;t<3;t++){
      const ta=b.ang+t*1.0;
      ctx.beginPath();ctx.moveTo(bx+Math.cos(ta)*b.r*.4,by2+Math.sin(ta)*b.r*.4);
      ctx.lineTo(bx+Math.cos(ta+.3)*b.r*.95,by2+Math.sin(ta+.3)*b.r*.95);
      ctx.lineTo(bx+Math.cos(ta-.15)*b.r*.9,by2+Math.sin(ta-.15)*b.r*.9);
      ctx.closePath();ctx.fill();
    }
  }
  ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.arc(bx+b.r*.28,by2+b.r*.18,b.r*.62,0,Math.PI*2);ctx.fill();
  // Gold epaulettes
  for(const s2 of[-1,1]){
    const sa=b.ang+s2*Math.PI*.42;
    ctx.fillStyle='#c89018';ctx.beginPath();ctx.arc(bx+Math.cos(sa)*(b.r*.82),by2+Math.sin(sa)*(b.r*.82),6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#e8b030';ctx.beginPath();ctx.arc(bx+Math.cos(sa)*(b.r*.82),by2+Math.sin(sa)*(b.r*.82),3.5,0,Math.PI*2);ctx.fill();
    // Epaulette fringe
    ctx.strokeStyle='#c89018';ctx.lineWidth=1.5;
    for(let fi=0;fi<4;fi++){const fa=sa+s2*(fi-.5)*.3;ctx.beginPath();ctx.moveTo(bx+Math.cos(sa)*(b.r*.78),by2+Math.sin(sa)*(b.r*.78));ctx.lineTo(bx+Math.cos(fa)*(b.r*.98),by2+Math.sin(fa)*(b.r*.98));ctx.stroke();}
  }
  // Gold braid across chest
  ctx.strokeStyle='#c89018';ctx.lineWidth=2;
  for(let gi=0;gi<4;gi++){const ga2=b.ang-1+gi*.64;ctx.beginPath();ctx.arc(bx,by2,b.r-5,ga2,ga2+.3);ctx.stroke();}
  // Medals
  const medalColors=['#f0d040','#d0d8e0','#e08020'];
  for(let mi=0;mi<3;mi++){
    const ma=b.ang-.6+mi*.6,mr=b.r-8;
    ctx.fillStyle=medalColors[mi];ctx.beginPath();ctx.arc(bx+Math.cos(ma)*mr,by2+Math.sin(ma)*mr,3.2,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(bx+Math.cos(ma)*mr,by2+Math.sin(ma)*mr,3.2,0,Math.PI*2);ctx.stroke();
  }
  // Head
  const bhx=bx+Math.cos(b.ang)*10,bhy=by2+Math.sin(b.ang)*10;
  ctx.fillStyle='#b88050';ctx.beginPath();ctx.arc(bhx,bhy,9,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(80,40,10,.2)';ctx.beginPath();ctx.arc(bhx+1,bhy+1,6,0,Math.PI*2);ctx.fill();
  const bea=b.ang+Math.PI*.5;
  ctx.fillStyle='#1a0a04';
  ctx.beginPath();ctx.arc(bhx+Math.cos(bea)*3+Math.cos(b.ang)*1,bhy+Math.sin(bea)*3+Math.sin(b.ang)*1,1.5,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(bhx-Math.cos(bea)*3+Math.cos(b.ang)*1,bhy-Math.sin(bea)*3+Math.sin(b.ang)*1,1.5,0,Math.PI*2);ctx.fill();
  // Bushy beard
  ctx.fillStyle='#8a6840';
  ctx.beginPath();ctx.ellipse(bhx+Math.cos(b.ang)*5,bhy+Math.sin(b.ang)*5,6,5,b.ang,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#a07848';
  ctx.beginPath();ctx.ellipse(bhx+Math.cos(b.ang)*4.5,bhy+Math.sin(b.ang)*4.5,4,3.5,b.ang,0,Math.PI*2);ctx.fill();
  // General hat — tall shako
  ctx.fillStyle='#1a0808';ctx.beginPath();ctx.ellipse(bhx,bhy-5,9.5,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#280a0a';ctx.fillRect(bhx-8,bhy-20,16,16);
  ctx.fillStyle='#1a0808';ctx.fillRect(bhx-9.5,bhy-21,19,4);
  ctx.fillStyle='#f0d040';ctx.fillRect(bhx-8,bhy-21,16,2);
  ctx.fillStyle='#d09020';ctx.fillRect(bhx-6,bhy-20,12,2);
  ctx.fillStyle='#ff2020';ctx.beginPath();ctx.arc(bhx,bhy-19,4.5,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=10;ctx.shadowColor='#ff4040';ctx.fillStyle='#ff4040';ctx.font='bold 10px serif';ctx.textAlign='center';ctx.fillText('★',bhx,bhy-16);ctx.shadowBlur=0;
  // Sabre — big one
  ctx.save();ctx.translate(bx+Math.cos(b.ang+.5)*(b.r*.88),by2+Math.sin(b.ang+.5)*(b.r*.88));ctx.rotate(b.ang+.5);
  ctx.shadowBlur=b.rageMode?18:8;ctx.shadowColor=b.rageMode?'#ff2020':'#c0c8e0';
  ctx.fillStyle='#d8dce8';ctx.fillRect(0,-2.5,38,5);ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(0,-1.5,38,2);
  ctx.fillStyle='#c09020';ctx.fillRect(-4,-8,7,16);ctx.fillStyle='#5a3010';ctx.fillRect(-16,-3,13,6);
  ctx.shadowBlur=0;ctx.restore();
  // Charge indicator
  if(b.charging){
    ctx.save();ctx.strokeStyle='rgba(255,50,50,.6)';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(bx,by2);ctx.lineTo(bx+b.chargeDx*60,by2+b.chargeDy*60);ctx.stroke();ctx.restore();
  }
  ctx.restore();
}

// ── UI UPDATES ──
