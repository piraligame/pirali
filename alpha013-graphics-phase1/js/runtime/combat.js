const joy={active:false,id:-1,bx:0,by:0,dx:0,dy:0,mr:54};
const K={l:false,r:false,u:false,d:false};
const jZ=document.getElementById('joy-zone');
const jB=document.getElementById('joy-base');
const jK=document.getElementById('joy-knob');
function jStart(e){if(joy.active)return;const t=e.changedTouches[0];joy.active=true;joy.id=t.identifier;joy.bx=t.clientX;joy.by=t.clientY;joy.dx=joy.dy=0;jB.style.left=t.clientX+'px';jB.style.top=t.clientY+'px';jB.style.display='block';jK.style.left=t.clientX+'px';jK.style.top=t.clientY+'px';jK.style.display='block';}
function jMove(e){if(!joy.active)return;for(let i=0;i<e.changedTouches.length;i++){const t=e.changedTouches[i];if(t.identifier!==joy.id)continue;const dx=t.clientX-joy.bx,dy=t.clientY-joy.by;const dist=Math.hypot(dx,dy),cl=Math.min(dist,joy.mr),a=Math.atan2(dy,dx);jK.style.left=(joy.bx+Math.cos(a)*cl)+'px';jK.style.top=(joy.by+Math.sin(a)*cl)+'px';joy.dx=Math.max(-1,Math.min(1,dx/joy.mr));joy.dy=Math.max(-1,Math.min(1,dy/joy.mr));}}
function jEnd(e){for(let i=0;i<e.changedTouches.length;i++){if(e.changedTouches[i].identifier!==joy.id)continue;joy.active=false;joy.dx=joy.dy=0;jB.style.display='none';jK.style.display='none';}}
jZ.addEventListener('touchstart',e=>{e.preventDefault();jStart(e);},{passive:false});
jZ.addEventListener('touchmove',e=>{e.preventDefault();jMove(e);},{passive:false});
jZ.addEventListener('touchend',e=>{e.preventDefault();jEnd(e);},{passive:false});
jZ.addEventListener('touchcancel',e=>{e.preventDefault();jEnd(e);},{passive:false});
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft')K.l=true;if(e.key==='ArrowRight')K.r=true;
  if(e.key==='ArrowUp')K.u=true;if(e.key==='ArrowDown')K.d=true;
  if(e.key==='z'||e.key==='Z')shoot();if(e.key==='x'||e.key==='X')swordSwing();
  if(e.key==='c'||e.key==='C')dash();
});
document.addEventListener('keyup',e=>{if(e.key==='ArrowLeft')K.l=false;if(e.key==='ArrowRight')K.r=false;if(e.key==='ArrowUp')K.u=false;if(e.key==='ArrowDown')K.d=false;});
function regBtn(id,fn){const el=document.getElementById(id);el.addEventListener('touchstart',e=>{e.preventDefault();fn();el.classList.add('pressed');},{passive:false});el.addEventListener('touchend',e=>{e.preventDefault();el.classList.remove('pressed');},{passive:false});el.addEventListener('touchcancel',e=>{e.preventDefault();el.classList.remove('pressed');},{passive:false});el.addEventListener('mousedown',fn);}
regBtn('btn-shoot',shoot);regBtn('btn-sword',swordSwing);regBtn('btn-dash',dash);

// ── COMBAT ──
function shoot(){
  if(!running||P.dead||shootCD>0)return;
  if(window.PiraliAlphaGear?.fireIfSelected())return;
  if(ammo<=0)return;
  ammo--;updateAmmoUI();shootCD=22;
  playGunshot();
  let tgt=null,best=1e9;
  enemies.forEach(e=>{if(!e.alive)return;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<best){best=d;tgt=e;}});
  if(boss&&boss.alive){const d=Math.hypot(boss.x-P.x,boss.y-P.y);if(d<best){best=d;tgt=boss;}}
  const ang=tgt?Math.atan2(tgt.y-P.y,tgt.x-P.x):P.ang;
  if(tgt)P.ang=ang;
  const bx=P.x+Math.cos(ang)*(P.r+5),by=P.y+Math.sin(ang)*(P.r+5);
  bullets.push({x:bx,y:by,vx:Math.cos(ang)*BSPD,vy:Math.sin(ang)*BSPD,fp:true,alive:true,life:115});
  PiraliFX.shoot(bx,by,ang);
  for(let i=0;i<6;i++) spawnPart(bx,by,Math.cos(ang+(Math.random()-.5)*.9)*(2+Math.random()*4),Math.sin(ang+(Math.random()-.5)*.9)*(2+Math.random()*4),8,Math.random()>.5?'#ffdd44':'#ff9900',2+Math.random()*2);
}

function swordSwing(){
  if(!running||swordCD>0||P.dead)return;
  // Combo: second hit within 0.5s is faster and wider
  swordComboTimer-=0; // reset handled in update
  const isCombo=(swordCombo>0&&swordComboTimer>0);
  swordCombo=isCombo?0:1;
  swordComboTimer=30; // frames to land combo
  swordCD=isCombo?24:34;
  swordOn=true;swordT=isCombo?16:22;
  playSword();
  PiraliFX.sword(P.x,P.y,P.ang,isCombo);
  parryActive=true;setTimeout(()=>{parryActive=false;},190);
  const sf=document.getElementById('sword-flash');sf.style.opacity='1';setTimeout(()=>sf.style.opacity='0',75);
  const range=isCombo?88:72;
  const arc=isCombo?1.7:1.4;
  enemies.forEach(e=>{
    if(!e.alive)return;
    const d=Math.hypot(e.x-P.x,e.y-P.y);
    const ad=Math.abs(Math.atan2(e.y-P.y,e.x-P.x)-P.ang);
    if(d<range&&(ad<arc||ad>6.28-arc)){
      hitEnemy(e);
      if(isCombo){for(let k=0;k<5;k++) spawnPart(e.x,e.y,(Math.random()-.5)*8,(Math.random()-.5)*8,14,'#ff8800',3);}
    }
  });
  if(boss&&boss.alive){
    const d=Math.hypot(boss.x-P.x,boss.y-P.y);
    if(d<78)hitBoss(boss,isCombo?3:2);
  }
}

function dash(){
  if(!running||P.dead||dashCD>0)return;
  dashCD=DASH_COOLDOWN;dashT=DASH_DUR;dashing=true;
  playDashSound();
  PiraliFX.dash(P.x,P.y,P.ang);
  PiraliFX.dashAccent();
  let mx=0,my=0;
  if(joy.active){mx=joy.dx;my=joy.dy;}
  else{if(K.l)mx-=1;if(K.r)mx+=1;if(K.u)my-=1;if(K.d)my+=1;}
  const l=Math.hypot(mx,my);
  if(l>0.1){dashDx=mx/l*DASH_FORCE;dashDy=my/l*DASH_FORCE;}
  else{dashDx=Math.cos(P.ang)*DASH_FORCE;dashDy=Math.sin(P.ang)*DASH_FORCE;}
  const df=document.getElementById('dash-flash');df.style.opacity='1';setTimeout(()=>df.style.opacity='0',55);
  // Leave afterimage particles
  for(let i=0;i<12;i++) spawnPart(P.x+(Math.random()-.5)*8,P.y+(Math.random()-.5)*8,(Math.random()-.5)*2,(Math.random()-.5)*2,9,'rgba(80,180,255,0.5)',3+Math.random()*3);
}

function hitEnemy(e){
  e.hp--;e.hf=14;
  playHit();
  PiraliFX.hit(e.x,e.y,false);
  for(let i=0;i<8;i++) spawnPart(e.x,e.y,(Math.random()-.5)*5.5,(Math.random()-.5)*5.5,14,'#cc1010',2+Math.random()*2.5);
  if(e.hp<=0)killEnemy(e);
}

function killEnemy(e){
  e.alive=false;
  window.PiraliStats?.kill();
  if(e.etype==='landlord'){
    if(finalVictoryPending)return;
    finalVictoryPending=true;
    running=false; // stop incoming bullets while the victory screen is queued
    score+=5000;updateScoreUI();playDeath();
    for(let i=0;i<22;i++)spawnPart(e.x,e.y,(Math.random()-.5)*7,(Math.random()-.5)*7,27,'#f0b040',3);
    setTimeout(showVictory,900);
    return;
  }
  // Kill streak bonus
  killStreak++;killStreakTimer=180;
  const bonus=killStreak>=5?300:killStreak>=3?200:100;
  score+=bonus*level;updateScoreUI();
  if(killStreak===3)showFloatingText(e.x,e.y,'3 '+ (window.PiraliLanguage?window.PiraliLanguage.gameText('combo'):'ჯარი')+'! +'+bonus*level,'#f0c020');
  else if(killStreak===5)showFloatingText(e.x,e.y,'5 '+ (window.PiraliLanguage?window.PiraliLanguage.gameText('combo'):'ჯარი')+'! +'+bonus*level,'#ff8020');
  else if(killStreak>=7)showFloatingText(e.x,e.y,(window.PiraliLanguage?window.PiraliLanguage.gameText('streak'):'სერია!')+' +'+bonus*level,'#ff4444');
  playDeath();
  corpses.push({x:e.x,y:e.y,ang:e.ang,r:e.r,etype:e.etype});
  // Persistent blood decal
  bloodDecals.push({x:e.x+(Math.random()-.5)*10,y:e.y+(Math.random()-.5)*10,
    r:8+Math.random()*10,ang:Math.random()*6.28,alpha:.55});
  if(bloodDecals.length>40)bloodDecals.shift();
  for(let i=0;i<16;i++) spawnPart(e.x,e.y,(Math.random()-.5)*8,(Math.random()-.5)*8,26,i%3===0?'#7a0808':'#cc1818',3+Math.random()*3.5);
  if(Math.random()>.35) pickups.push({x:e.x+(Math.random()-.5)*22,y:e.y+(Math.random()-.5)*22,bob:Math.random()*6.28,col:false,type:Math.random()>.8?'health':'ammo'});

}

function hitBoss(b,dmg=1){
  b.hp-=dmg;b.hf=10;
  playHit();
  PiraliFX.hit(b.x,b.y,true);
  for(let i=0;i<8;i++) spawnPart(b.x,b.y,(Math.random()-.5)*6,(Math.random()-.5)*6,14,'#cc2020',3+Math.random()*3);
  // Phase 2 transition is handled by update() (one source of truth).
  updateBossUI();
  if(b.hp<=0){b.alive=false;window.PiraliStats?.kill();score+=1000*level;updateScoreUI();hideBossUI();
    for(let i=0;i<30;i++) spawnPart(b.x,b.y,(Math.random()-.5)*10,(Math.random()-.5)*10,30,i%4===0?'#f0c020':'#cc1818',4+Math.random()*4);
    corpses.push({x:b.x,y:b.y,ang:b.ang,r:b.r,etype:'boss'});
    if(level===5&&!finalLordSpawned)spawnLandlordNPC(b.x,b.y);
  }
}

function takeDmg(){
  if(invincible||dashing)return;
  health--;invincible=true;setTimeout(()=>invincible=false,PIRALI_BALANCE.playerIFrameMs);
  playHurt();
  PiraliFX.hurt(P.x,P.y);
  // Screen shake
  shakePow=10;
  killStreak=0; // reset streak on taking damage
  const fl=document.getElementById('dflash');fl.style.opacity='1';setTimeout(()=>fl.style.opacity='0',160);
  updateHealthUI();
  if(health<=0){P.dead=true;setTimeout(showGameOver,1100);}
}

function spawnPart(x,y,vx,vy,life,col,sz){parts.push({x,y,vx,vy,life,ml:life,col,sz});}

// ── UPDATE ──
