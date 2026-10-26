function update(dt){
  if(!running||P.dead)return;
  frame++;
  window.PiraliDualGenerals?.updateSecond(dt);
  window.PiraliEndless?.tick(dt);
  PiraliFX.tick(dt);
  weatherTime+=dt;

  // Input
  let mx=0,my=0;
  if(joy.active){mx=joy.dx;my=joy.dy;}
  else{if(K.l)mx-=1;if(K.r)mx+=1;if(K.u)my-=1;if(K.d)my+=1;const ll=Math.hypot(mx,my);if(ll>1){mx/=ll;my/=ll;}}

  // Dash
  if(dashing){
    dashT-=dt;
    if(dashT<=0){dashing=false;}
    else{
      P.vx=dashDx;P.vy=dashDy;
      for(let i=0;i<3;i++) spawnPart(P.x+(Math.random()-.5)*10,P.y+(Math.random()-.5)*10,(Math.random()-.5)*1.5,(Math.random()-.5)*1.5,6,'rgba(80,160,255,0.4)',2+Math.random()*2);
    }
  } else {
    const mag=Math.hypot(mx,my);
    if(mag>0.08){
      const sp=SPD*dt*Math.min(mag,1);
      P.vx+=(mx*sp-P.vx)*.42;P.vy+=(my*sp-P.vy)*.42;
      P.ang=Math.atan2(my,mx);
      P.wt+=dt;if(P.wt>6){P.wf++;P.wt=0;}
      const spd_=Math.hypot(P.vx,P.vy);
      if(!P.wAnim)P.wAnim=0;
      P.wAnim+=dt*(spd_>SPD*.6?0.18:0.11);
      // Walking dust
      P.stepT=(P.stepT||0)+dt;
      if(P.stepT>14){P.stepT=0;spawnPart(P.x+(Math.random()-.5)*8,P.y+(Math.random()-.5)*4,(Math.random()-.5)*.8,(Math.random()-.5)*.8,8,'rgba(140,100,50,0.28)',3);}
    } else {P.vx*=0.58;P.vy*=0.58;}
  }
  if(dashCD>0)dashCD-=dt;
  updateDashUI();

  // Tree collision
  let nx=P.x+P.vx,ny=P.y+P.vy;
  for(const t of trees){const tr=t.r*.4,d=Math.hypot(nx-t.x,ny-t.y);if(d<P.r+tr){const a=Math.atan2(ny-t.y,nx-t.x);nx=t.x+Math.cos(a)*(P.r+tr+1.5);ny=t.y+Math.sin(a)*(P.r+tr+1.5);}}
  P.x=Math.max(P.r,Math.min(WW-P.r,nx));P.y=Math.max(P.r,Math.min(WH-P.r,ny));

  if(swordT>0){swordT-=dt;if(swordT<=0)swordOn=false;}
  if(swordCD>0)swordCD-=dt;if(shootCD>0)shootCD-=dt;
  if(swordComboTimer>0)swordComboTimer-=dt;else swordCombo=0;
  // Screen shake decay
  if(shakePow>0){shakePow=Math.max(0,shakePow-dt*1.2);shakeX=(Math.random()-.5)*shakePow*2;shakeY=(Math.random()-.5)*shakePow*2;}else{shakeX=0;shakeY=0;}
  // Kill streak timeout
  if(killStreakTimer>0)killStreakTimer-=dt;else killStreak=0;
  // Combo popup decay
  if(comboTimer>0)comboTimer-=dt;
  // Low HP pulse
  if(health<=2)lowHpPulse=(lowHpPulse+dt*.06)%(Math.PI*2);

  // Stage 5 and stage 6 end only when Simona actually enters the exit.
  if(level!==11&&!done&&Math.hypot(P.x-CHURCH_X,P.y-CHURCH_Y)<120){
    if(level===7&&(!boss||!boss.alive)&&finalLordSpawned&&finalVictoryPending){
      done=true;window.PiraliStats?.completeStage(7);level=8;ammo=Math.min(maxAmmo,ammo+6);updateAmmoUI();updateScoreUI();
      playLevelUp();const nextLevel=level;window.PiraliCheckpoint?.save(nextLevel);
      const runId=window.PiraliCheckpoint?.getSession();
      showBanner(LEVEL_NAMES[nextLevel]);
      setTimeout(()=>{
        if(running&&level===nextLevel&&!P.dead&&runId===window.PiraliCheckpoint?.getSession()){
          genWorld();window.PiraliStats?.stageReady(nextLevel);showBanner(LEVEL_NAMES[nextLevel]);
        }
      },1800);
    }else if(level===7){
      if(!finalChurchNotice){showBanner('ჯერ დაამარცხე გენერალი და ბატონი!');finalChurchNotice=true;}
    }else if(level===8){
      if(window.PiraliDualGenerals?.defeated()){
        done=true;window.PiraliStats?.completeStage(8);level=9;
        ammo=Math.min(maxAmmo,ammo+6);updateAmmoUI();playLevelUp();
        const nextLevel=level;window.PiraliCheckpoint?.save(nextLevel);
        const runId=window.PiraliCheckpoint?.getSession();
        setTimeout(()=>{
          if(running&&level===nextLevel&&!P.dead&&runId===window.PiraliCheckpoint?.getSession()){
            genWorld();window.PiraliStats?.stageReady(nextLevel);showBanner(LEVEL_NAMES[nextLevel]);
          }
        },1600);
        showBanner(LEVEL_NAMES[nextLevel]);
      }else if(!finalChurchNotice){
        showBanner('ჯერ დაამარცხე ორივე გენერალი!');finalChurchNotice=true;
      }
    }else if(level===9){
      if(window.PiraliSiege?.clear()){
        done=true;window.PiraliStats?.completeStage(9);level=10;updateScoreUI();
        ammo=Math.min(maxAmmo,ammo+6);updateAmmoUI();playLevelUp();
        const nextLevel=level;window.PiraliCheckpoint?.save(nextLevel);
        const runId=window.PiraliCheckpoint?.getSession();
        setTimeout(()=>{
          if(running&&level===nextLevel&&!P.dead&&runId===window.PiraliCheckpoint?.getSession()){
            genWorld();window.PiraliStats?.stageReady(nextLevel);showBanner(LEVEL_NAMES[nextLevel]);
          }
        },1600);
        showBanner(LEVEL_NAMES[nextLevel]);
      }else if(!finalChurchNotice){
        showBanner('ჯერ დაამარცხე ალყის 20 მსროლელი!');finalChurchNotice=true;
      }
    }else if(level===10){
      // The boss's collectible coins MUST be taken before advancing.
      if(boss&&!boss.alive&&window.PiraliHellLoot?.rewardCollected?.()){
        done=true;window.PiraliStats?.completeStage(10);
        level=11;window.PiraliStageScoring?.beginEndless();updateScoreUI();
        ammo=Math.min(maxAmmo,ammo+6);updateAmmoUI();playLevelUp();
        const nextLevel=level;window.PiraliCheckpoint?.save(nextLevel);
        const runId=window.PiraliCheckpoint?.getSession();
        showBanner('სიმონამ ჯოჯოხეთი გაიარა! ბონუს ტური: სიმონა უსასრულოდ.');
        setTimeout(()=>{
          if(running&&level===nextLevel&&!P.dead&&runId===window.PiraliCheckpoint?.getSession()){
            genWorld();window.PiraliStats?.stageReady(nextLevel);showBanner(LEVEL_NAMES[nextLevel]);
          }
        },1550);
      }else if(boss&&!boss.alive){
        if(!finalChurchNotice){showBanner('აიღე ეშმაკის ოქროს მონეტები!');finalChurchNotice=true;}
      }else if(!finalChurchNotice){
        showBanner('ჯერ დაამარცხე ეშმაკი!');finalChurchNotice=true;
      }
    }else{
      done=true;window.PiraliStats?.completeStage(level);
      level++;ammo=Math.min(maxAmmo,ammo+6);updateAmmoUI();playLevelUp();
      const nextLevel=level;window.PiraliCheckpoint?.save(nextLevel);
      const runId=window.PiraliCheckpoint?.getSession();showBanner(LEVEL_NAMES[nextLevel]);
      setTimeout(()=>{
        if(running&&level===nextLevel&&!P.dead&&runId===window.PiraliCheckpoint?.getSession()){
          genWorld();window.PiraliStats?.stageReady(nextLevel);showBanner(LEVEL_NAMES[nextLevel]);
        }
      },2800);
    }
  }

  // Pickups
  pickups.forEach(pk=>{
    if(pk.col)return;pk.bob+=.05;
    if(Math.hypot(pk.x-P.x,pk.y-P.y)<(pk.type==='hell-coins'?43:30)){
      pk.col=true;
      playPickup();
      if(window.PiraliHellLoot?.collect(pk)){}
      else if(window.PiraliAlphaGear?.pickup(pk)){}
      else if(pk.type==='ammo'){
        // Each Mauser package contains 3 or 4 rounds, for ALL 11 stages.
        const pack=pk.amount===3||pk.amount===4?pk.amount:3+Math.floor(Math.random()*2);
        const gained=Math.max(0,Math.min(maxAmmo-ammo,pack));
        ammo=Math.min(maxAmmo,ammo+pack);updateAmmoUI();
        if(gained&&typeof showFloatingText==='function')showFloatingText(pk.x,pk.y-28,'+'+gained,'#ffe2a0');
      }
      else if(pk.type==='health'){health=Math.min(maxHealth,health+1);updateHealthUI();}
      else if(pk.type==='herb'){health=Math.min(maxHealth,health+2);updateHealthUI();inventory.herbs++;updateInventoryUI();}
      else if(pk.type==='medal'){if(level!==11){score+=(level===10?5:Math.max(1,Math.round(12.5*level)));updateScoreUI();}inventory.medals++;updateInventoryUI();}
      for(let i=0;i<10;i++) spawnPart(pk.x,pk.y,(Math.random()-.5)*5,(Math.random()-.5)*5,16,
        pk.type==='health'?'#e84040':pk.type==='herb'?'#44cc44':pk.type==='medal'?'#f0c020':'#d09820',4);
    }
  });

  // Bullets
  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i];if(!b.alive)continue;
    const oldBX=b.x,oldBY=b.y;
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    if(b.life<=0||b.x<0||b.x>WW||b.y<0||b.y>WH){b.alive=false;continue;}
    if(b.fp){
      // Swept collision resolves the FIRST object along the actual bullet path:
      // cover / nearer general / nearer soldier; never an enemy behind the boss.
      window.PiraliAim.bulletImpact(b,oldBX,oldBY);
    } else {
      let blocked=false;
      for(const t of trees){
        if(window.PiraliAim.segmentCircle(oldBX,oldBY,b.x,b.y,t.x,t.y,t.r*.48)!==null){
          b.alive=false;blocked=true;break;
        }
      }
      if(blocked)continue;
      const d=Math.hypot(b.x-P.x,b.y-P.y);
      const arc=Math.atan2(b.y-P.y,b.x-P.x)-P.ang;
      const wideParry=level===10&&parryActive&&d<110&&
        Math.abs(Math.atan2(Math.sin(arc),Math.cos(arc)))<1.95;
      if(d<P.r+7||wideParry){
        if(parryActive){
          playParry();
          b.fp=true;const ra=Math.atan2(b.vy,b.vx)+Math.PI;
          b.vx=Math.cos(ra)*BSPD*1.15;b.vy=Math.sin(ra)*BSPD*1.15;b.life=110;
          for(let k=0;k<10;k++) spawnPart(b.x,b.y,(Math.random()-.5)*8,(Math.random()-.5)*8,12,Math.random()>.5?'#f0e040':'#ffffff',2+Math.random()*2);
          const pf=document.getElementById('parry-flash');pf.style.opacity='1';setTimeout(()=>pf.style.opacity='0',65);
          showFloatingText(P.x,P.y-22,(window.PiraliLanguage?window.PiraliLanguage.gameText('parry'):'✦ პარი! ✦'),'#f8f040');
          score+=(level===11?0:level===10?1:Math.max(1,Math.round(2.5*level)));updateScoreUI();
        } else {b.alive=false;takeDmg();}
      }
    }
  }
  bullets=bullets.filter(b=>b.alive);

  // Enemy AI — states: patrol → alert → attack → retreat
  const aliveEnemies=enemies.filter(e=>e.alive);
  enemies.forEach(e=>{
    if(!e.alive)return;
    if(e.isNPC){
      // Landlord NPC: flees from player, can't attack
      const dp=Math.hypot(e.x-P.x,e.y-P.y);
      if(dp<300){
        const fa=Math.atan2(e.y-P.y,e.x-P.x);
        e.vx+=(Math.cos(fa)*PIRALI_BALANCE.landlordFleeSpeed*dt-e.vx)*0.2;
        e.vy+=(Math.sin(fa)*PIRALI_BALANCE.landlordFleeSpeed*dt-e.vy)*0.2;
        e.ang=fa+Math.PI;
      } else {e.vx*=0.85;e.vy*=0.85;}
      e.x+=e.vx;e.y+=e.vy;
      e.x=Math.max(e.r,Math.min(WW-e.r,e.x));e.y=Math.max(e.r,Math.min(WH-e.r,e.y));
      e.wf+=dt*0.3;
      // Collision with player for melee sword hit
      if(!invincible&&!dashing&&Math.hypot(e.x-P.x,e.y-P.y)<P.r+e.r+2){/* no damage from NPC */}
      return;
    }
    if(e.hf>0)e.hf-=dt;
    const dp=Math.hypot(e.x-P.x,e.y-P.y);
    const myIdx=aliveEnemies.indexOf(e);

    // State transitions
    if(dp<340&&e.state==='patrol'){e.state='alert';e.alertTimer=40;}
    if(e.state==='alert'){
      e.alertTimer-=dt;
      if(e.alertTimer<=0)e.state='attack';
    }
    if(dp>400&&e.state==='attack'){e.state='patrol';}
    // Retreat when hp is low and has allies
    if(e.hp===1&&e.maxHp>1&&dp<180&&aliveEnemies.length>2&&!e.retreating){
      e.retreating=true;e.retreatTimer=120;
    }
    if(e.retreating){
      e.retreatTimer-=dt;
      if(e.retreatTimer<=0){e.retreating=false;}
    }

    // Movement
    if(e.state==='attack'&&!e.retreating){
      const baseAng=Math.atan2(P.y-e.y,P.x-e.x);
      // Flanking offset per index
      const flankAng=baseAng+(myIdx%2===0?0.85:-0.85)*(aliveEnemies.length>1?.7:.3);
      const sp=(.36+level*.04+(e.etype==='saber'?.08:0)+(e.etype==='officer'?.04:0))*dt*(level===11?(e.wavePower||1):1);
      e.vx+=(Math.cos(flankAng)*sp-e.vx)*.24;
      e.vy+=(Math.sin(flankAng)*sp-e.vy)*.24;
      e.ang=baseAng;
    } else if(e.retreating){
      // Retreat: move away from player
      const rAng=Math.atan2(e.y-P.y,e.x-P.x);
      e.vx+=(Math.cos(rAng)*.45*dt-e.vx)*.2;
      e.vy+=(Math.sin(rAng)*.45*dt-e.vy)*.2;
      e.ang=Math.atan2(P.y-e.y,P.x-e.x);
    } else {
      e.patrol.t+=e.patrol.spd*.016*dt;
      const ptx=e.patrol.cx+Math.cos(e.patrol.t)*e.patrol.radius;
      const pty=e.patrol.cy+Math.sin(e.patrol.t)*e.patrol.radius;
      const a2=Math.atan2(pty-e.y,ptx-e.x);
      e.vx+=(Math.cos(a2)*.28*dt-e.vx)*.14;e.vy+=(Math.sin(a2)*.28*dt-e.vy)*.14;e.ang=a2;
    }
    e.x+=e.vx;e.y+=e.vy;
    e.x=Math.max(e.r,Math.min(WW-e.r,e.x));e.y=Math.max(e.r,Math.min(WH-e.r,e.y));
    e.wf+=dt*.3;

    // Shooting — rifles and officers
    if(e.etype==='rifle'||e.etype==='officer'){
      e.sT-=dt;
      const range=e.etype==='officer'?450:380;
      if(e.sT<=0&&dp<range&&e.state==='attack'){
        e.sT=(e.etype==='officer'?40+Math.random()*50:55+Math.random()*75)/(level===11?(e.wavePower||1):1);
        const spread=e.etype==='officer'?0.08:0.3;
        const a3=Math.atan2(P.y-e.y,P.x-e.x)+(Math.random()-.5)*spread;
        const spd=e.etype==='officer'?4.5:3.7;
        bullets.push({x:e.x,y:e.y,vx:Math.cos(a3)*spd,vy:Math.sin(a3)*spd,fp:false,alive:true,life:130});
        for(let k=0;k<4;k++) spawnPart(e.x,e.y,Math.cos(a3+(Math.random()-.5)*.8)*2.5,Math.sin(a3+(Math.random()-.5)*.8)*2.5,6,'#605530',1.5);
      }
    }
    if(!invincible&&!dashing&&dp<P.r+e.r)takeDmg();
  });

  // BOSS AI — Phase 1 & Phase 2
  if(boss&&boss.alive){
    const bd=Math.hypot(boss.x-P.x,boss.y-P.y);
    if(boss.hf>0)boss.hf-=dt;
    boss.wf+=dt*.2;
    if(boss.groundSlamCD>0)boss.groundSlamCD-=dt;

    // Phase 2 transition
    if(!boss.rageMode&&boss.hp<=boss.enrageHp){
      boss.rageMode=true;boss.phase=2;
      showBanner(level===10?'🔥 ეშმაკი მძვინვარებს!':'⚠ PHASE 2 ⚠\nგენერალი გააფთრდა!');
      // Spawn 2 reinforcement enemies
      for(let k=0;k<(level===11?0:PIRALI_BALANCE.finalBossReinforcements);k++){
        const ra=Math.random()*6.28;
        enemies.push({
          x:boss.x+Math.cos(ra)*80,y:boss.y+Math.sin(ra)*80,
          r:12,hp:1,maxHp:1,vx:0,vy:0,ang:ra,
          patrol:{cx:boss.x,cy:boss.y,radius:60,t:Math.random()*6.28,spd:.3},
          sT:40,alive:true,hf:0,wf:0,etype:'rifle',
          alertTimer:0,state:'attack',flankTimer:0,groupId:99,retreating:false,retreatTimer:0
        });
      }
      for(let i=0;i<20;i++) spawnPart(boss.x,boss.y,(Math.random()-.5)*12,(Math.random()-.5)*12,30,'#ff2020',4+Math.random()*4);
    }

    // Ground slam (Phase 2 only)
    if(boss.groundSlamActive){
      boss.groundSlamT-=dt;
      if(boss.groundSlamT<=0){
        boss.groundSlamActive=false;
        // Shockwave ring of particles
        for(let k=0;k<24;k++){
          const sa=k/24*Math.PI*2;
          spawnPart(boss.groundSlamX,boss.groundSlamY,Math.cos(sa)*6,Math.sin(sa)*6,18,'#cc4010',4);
        }
        // Damage if close to slam point
        if(!invincible&&Math.hypot(P.x-boss.groundSlamX,P.y-boss.groundSlamY)<70)takeDmg();
      }
    }

    const bspd=(boss.rageMode?1.1:0.55)*PIRALI_BALANCE.finalBossSpeed*dt*(level===11?(boss.wavePower||1):1);
    if(boss.charging){
      boss.x+=boss.chargeDx*6*PIRALI_BALANCE.finalBossChargeSpeed*dt;boss.y+=boss.chargeDy*6*PIRALI_BALANCE.finalBossChargeSpeed*dt;
      boss.chargeT-=dt;
      if(boss.chargeT<=0)boss.charging=false;
      if(!invincible&&!dashing&&Math.hypot(boss.x-P.x,boss.y-P.y)<P.r+boss.r)takeDmg();
    } else {
      const ba=Math.atan2(P.y-boss.y,P.x-boss.x);
      boss.vx+=(Math.cos(ba)*bspd-boss.vx)*.18;boss.vy+=(Math.sin(ba)*bspd-boss.vy)*.18;
      boss.x+=boss.vx;boss.y+=boss.vy;boss.ang=ba;
      boss.sT-=dt;
      if(boss.sT<=0){
        boss.sT=(boss.rageMode?28:50)*PIRALI_BALANCE.finalBossFireInterval*(level===10?.72:1)/(level===11?(boss.wavePower||1):1);
        const rng=Math.random();
        if(boss.rageMode&&rng<.35){
          // Charge
          boss.charging=true;boss.chargeT=20;
          boss.chargeDx=Math.cos(ba);boss.chargeDy=Math.sin(ba);
          for(let k=0;k<8;k++) spawnPart(boss.x,boss.y,(Math.random()-.5)*6,(Math.random()-.5)*6,12,'#cc2020',3);
        } else if(boss.rageMode&&rng<.6&&boss.groundSlamCD<=0&&bd<200){
          // Ground slam (Phase 2 special)
          boss.groundSlamActive=true;boss.groundSlamT=18;
          boss.groundSlamX=P.x;boss.groundSlamY=P.y;
          boss.groundSlamCD=120;
          // Warning ring
          for(let k=0;k<16;k++){
            const sa=k/16*Math.PI*2;
            spawnPart(P.x+Math.cos(sa)*60,P.y+Math.sin(sa)*60,Math.cos(sa)*.5,Math.sin(sa)*.5,18,'#ff8020',3);
          }
        } else {
          // Spread shot — more bullets in Phase 2
          const spread=Math.max(1,Math.ceil((boss.rageMode?7:3)*PIRALI_BALANCE.finalBossVolley));
          for(let s=0;s<spread;s++){
            const sa=ba+(s-(spread-1)/2)*.3;
            bullets.push({x:boss.x,y:boss.y,vx:Math.cos(sa)*4.4,vy:Math.sin(sa)*4.4,fp:false,alive:true,life:135});
          }
        }
      }
      if(!invincible&&!dashing&&bd<P.r+boss.r)takeDmg();
    }
    boss.x=Math.max(boss.r,Math.min(WW-boss.r,boss.x));boss.y=Math.max(boss.r,Math.min(WH-boss.r,boss.y));
    updateBossUI();
  }

  // Show boss bar when nearby or always in level 5 if boss alive
  if(boss&&boss.alive){
    const bd2=Math.hypot(boss.x-P.x,boss.y-P.y);
    if(bd2<600||level===7||level===8)document.getElementById('boss-bar').style.display='block';
  }

  parts.forEach(p=>{p.x+=p.vx*dt*.5;p.y+=p.vy*dt*.5;p.vx*=.88;p.vy*=.88;p.life-=dt;});
  parts=parts.filter(p=>p.life>0);

  // Camera — center on Simona + screen shake
  let tcx=P.x-W*.5, tcy=P.y-H*.5;
  tcx=Math.max(0,Math.min(WW-W,tcx));
  tcy=Math.max(0,Math.min(WH-H,tcy));
  camX+=(tcx-camX)*CAM_EASE;
  camY+=(tcy-camY)*CAM_EASE;
  // Apply shake
  camX+=shakeX; camY+=shakeY;
  updateProgressUI();
}

// ── SCREEN COORDS ──
