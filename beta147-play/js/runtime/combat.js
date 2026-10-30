/* PIRALI Beta 1.38 — small bounded thumbstick in the lower-left corner.
 * Input physics, player maximum speed, dash, combat, score and saves unchanged.
 * Developer latest-change switch can compare old and modern control layouts.
 */
const joy={active:false,id:-1,bx:0,by:0,startX:0,startY:0,dx:0,dy:0,mr:29,justReleased:false,engaged:false};
const K={l:false,r:false,u:false,d:false};
const jZ=document.getElementById('joy-zone');
const jB=document.getElementById('joy-base');
const jK=document.getElementById('joy-knob');
const JOY_DEAD_ZONE=2,JOY_RELEASE_ZONE=1.05,JOY_FULL_SPEED=6.5;
const JOY_CLASSIC_DEAD=3,JOY_CLASSIC_RELEASE=1.5,JOY_CLASSIC_FOLLOW=35;
const joystickModern=()=>window.PiraliDevComparison?.latestEnabled?.()!==false;
function resetJoy138(){
 joy.active=false;joy.id=-1;joy.dx=joy.dy=0;joy.engaged=false;joy.justReleased=true;
 jB.style.display='none';jK.style.display='none';
}
function jStart(e){
 if(joy.active||!e.changedTouches?.length)return;
 if(typeof running!=='undefined'&&(!running||P.dead))return;
 if(typeof paused!=='undefined'&&paused)return;
 const t=e.changedTouches[0];
 joy.active=true;joy.justReleased=false;joy.engaged=false;joy.id=t.identifier;
 joy.startX=t.clientX;joy.startY=t.clientY;
 if(joystickModern()){
   const rect=jZ.getBoundingClientRect(),pad=45;
   joy.bx=Math.max(rect.left+pad,Math.min(rect.right-pad,t.clientX));
   joy.by=Math.max(rect.top+pad,Math.min(rect.bottom-pad,t.clientY));
 }else{joy.bx=t.clientX;joy.by=t.clientY;}
 joy.dx=joy.dy=0;
 jB.style.left=joy.bx+'px';jB.style.top=joy.by+'px';jB.style.display='block';
 jK.style.left=joy.bx+'px';jK.style.top=joy.by+'px';jK.style.display='block';
}
function jMove(e){
 if(!joy.active)return;
 for(const t of e.changedTouches){
  if(t.identifier!==joy.id)continue;
  const modern=joystickModern();
  let dx=t.clientX-(modern?joy.startX:joy.bx);
  let dy=t.clientY-(modern?joy.startY:joy.by);
  let dist=Math.hypot(dx,dy);
  if(!modern&&dist>JOY_CLASSIC_FOLLOW){
   const shift=(dist-JOY_CLASSIC_FOLLOW)/dist;
   joy.bx+=dx*shift;joy.by+=dy*shift;
   jB.style.left=joy.bx+'px';jB.style.top=joy.by+'px';
   dx=t.clientX-joy.bx;dy=t.clientY-joy.by;
   dist=Math.hypot(dx,dy);
  }
  const maxRadius=modern?joy.mr:30;
  const factor=dist>0?Math.min(dist,maxRadius)/dist:0;
  jK.style.left=joy.bx+dx*factor+'px';
  jK.style.top=joy.by+dy*factor+'px';
  const dead=modern?JOY_DEAD_ZONE:JOY_CLASSIC_DEAD;
  const release=modern?JOY_RELEASE_ZONE:JOY_CLASSIC_RELEASE;
  if(!joy.engaged&&dist>dead)joy.engaged=true;
  else if(joy.engaged&&dist<=release)joy.engaged=false;
  // Small movement engages earlier, reaching full speed by 6.5 px.
  // No acceleration of max player speed; only thumb travel is reduced.
  const strength=modern?Math.min(1,Math.max(0,(dist-release)/(JOY_FULL_SPEED-release))):1;
  joy.dx=joy.engaged&&dist>0?dx/dist*strength:0;
  joy.dy=joy.engaged&&dist>0?dy/dist*strength:0;
  break;
 }
}
function jEnd(e){
 if(!joy.active)return;
 for(const t of e.changedTouches){
  if(t.identifier!==joy.id)continue;
  resetJoy138();break;
 }
}
jZ.addEventListener('touchstart',e=>{e.preventDefault();jStart(e);},{passive:false});
jZ.addEventListener('touchmove',e=>{e.preventDefault();jMove(e);},{passive:false});
jZ.addEventListener('touchend',e=>{e.preventDefault();jEnd(e);},{passive:false});
jZ.addEventListener('touchcancel',e=>{e.preventDefault();jEnd(e);},{passive:false});
window.PiraliJoy138=Object.freeze({
 reset:resetJoy138,
 modern:joystickModern,
 debug:()=>({active:joy.active,id:joy.id,bx:joy.bx,by:joy.by,dx:joy.dx,dy:joy.dy,mr:joy.mr,engaged:joy.engaged})
});
// Keyboard events are owned by platform/desktop-controls.js (Beta 1.12).
// Avoid duplicate actions and use KeyboardEvent.code so Georgian/Russian
// keyboard layouts trigger physical X (sword) and C (dash) reliably.
// The mobile/touch attack buttons below remain unchanged.
function regBtn(id,fn){const el=document.getElementById(id);el.addEventListener('touchstart',e=>{e.preventDefault();fn();el.classList.add('pressed');},{passive:false});el.addEventListener('touchend',e=>{e.preventDefault();el.classList.remove('pressed');},{passive:false});el.addEventListener('touchcancel',e=>{e.preventDefault();el.classList.remove('pressed');},{passive:false});el.addEventListener('mousedown',fn);}
regBtn('btn-shoot',shoot);regBtn('btn-sword',swordSwing);regBtn('btn-dash',dash);

// ── COMBAT ──
function shoot(){
  if(!running||P.dead||shootCD>0)return;
  if(window.PiraliAlphaGear?.fireIfSelected())return;
  if(ammo<=0)return;
  ammo--;updateAmmoUI();shootCD=22;
  playGunshot();
  // Do not select foes behind the muzzle; respect the player's look direction.
  const ang=window.PiraliAim.choose();
  P.ang=ang; // barrel, muzzle flash and bullet must face the SAME target
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
  swordCD=(isCombo?24:34)*0.8; // Alpha 0.14.2: 20% shorter normal and combo cooldown.
  swordOn=true;swordT=isCombo?16:22;
  playSword();
  PiraliFX.sword(P.x,P.y,P.ang,isCombo);
  parryActive=true;setTimeout(()=>{parryActive=false;},190);
  const sf=document.getElementById('sword-flash');sf.style.opacity='1';setTimeout(()=>sf.style.opacity='0',75);
  const range=isCombo?88:72;
  const arc=isCombo?1.7:1.4;
  window.PiraliProps?.sword(P.x,P.y,P.ang,range,arc);
  window.PiraliEvolution139?.swordQuestHit?.(P.x,P.y,P.ang,range,arc);
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
  window.PiraliDualGenerals?.swordHit(isCombo?3:2);
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

function hitEnemy(e,damage=1){
  e.hp-=damage;e.hf=14;
   e._beta126Knock=6;e._beta126ImpactAngle=Math.atan2(e.y-P.y,e.x-P.x);
  playHit();
  PiraliFX.hit(e.x,e.y,false);
  for(let i=0;i<8;i++) spawnPart(e.x,e.y,(Math.random()-.5)*5.5,(Math.random()-.5)*5.5,14,'#cc1010',2+Math.random()*2.5);
  if(e.hp<=0)killEnemy(e);
}

function killEnemy(e){
  e.alive=false;
  window.PiraliPolish?.onKill(level);
  window.PiraliStats?.kill();
  if(e.etype==='landlord'&&level!==11){
    playDeath();
    for(let i=0;i<18;i++)spawnPart(e.x,e.y,(Math.random()-.5)*7,(Math.random()-.5)*7,27,'#f0b040',3);
    if(level===7){
      finalVictoryPending=true;finalChurchNotice=false;
      window.PiraliKillCombo?.award(250,e.x,e.y);
      showBanner('ეკლესიის კარი გაიღო! შედი ეკლესიაში.');
    }else if(level===10){
      window.PiraliHellLoot?.batoni(e);
      window.PiraliKillCombo?.award(3,e.x,e.y);
    }
    return;
  }
  // Fixed per-enemy award, doubled only by a correctly timed next kill.
  killStreak++;killStreakTimer=level===11?60:120;
  const base=level===11?5:level===10?1:5*level;
  window.PiraliKillCombo?.award(base,e.x,e.y);
  window.PiraliPolish?.onStreak(killStreak);
  if(level===11)window.PiraliEndless?.onKill(e);
  playDeath();
  corpses.push({x:e.x,y:e.y,ang:e.ang,r:e.r,etype:e.etype});
  if(level===11&&corpses.length>45)corpses.splice(0,corpses.length-45);
  // Persistent blood decal
  bloodDecals.push({x:e.x+(Math.random()-.5)*10,y:e.y+(Math.random()-.5)*10,
    r:8+Math.random()*10,ang:Math.random()*6.28,alpha:.55});
  if(bloodDecals.length>40)bloodDecals.shift();
  for(let i=0;i<16;i++) spawnPart(e.x,e.y,(Math.random()-.5)*8,(Math.random()-.5)*8,26,i%3===0?'#7a0808':'#cc1818',3+Math.random()*3.5);
  const lootType=window.PiraliDropBalance?.rollEnemyDrop();
  if(lootType)pickups.push({x:e.x+(Math.random()-.5)*22,y:e.y+(Math.random()-.5)*22,
    bob:Math.random()*6.28,col:false,type:lootType,amount:lootType==='ammo'?3+Math.floor(Math.random()*2):undefined});
  // Separate 24.96% shotgun shell chance once this run owns the hunting gun.
  window.PiraliAlphaGear?.maybeDropShell(e);

}

function hitBoss(b,dmg=1){
  if(!b||!b.alive)return;
  b.hp-=dmg;b.hf=10;
   b._beta126Knock=6;b._beta126ImpactAngle=Math.atan2(b.y-P.y,b.x-P.x);
  playHit();
  PiraliFX.hit(b.x,b.y,true);
  for(let i=0;i<8;i++) spawnPart(b.x,b.y,(Math.random()-.5)*6,(Math.random()-.5)*6,14,'#cc2020',3+Math.random()*3);
  // Phase 2 transition is handled by update() (one source of truth).
  updateBossUI();
  if(b.hp<=0){b.alive=false;window.PiraliPolish?.onKill(level);window.PiraliStats?.kill();
    window.PiraliKillCombo?.award(level===11?5:level===10?50:50*level,b.x,b.y);
    if(level===11)window.PiraliEndless?.onKill(b);
    hideBossUI();
    if(level===10){window.PiraliHellLoot?.devil(b);finalChurchNotice=false;showBanner('ჯოჯოხეთის ცეცხლოვანი კარიბჭე გაიღო!');}
    for(let i=0;i<30;i++) spawnPart(b.x,b.y,(Math.random()-.5)*10,(Math.random()-.5)*10,30,i%4===0?'#f0c020':'#cc1818',4+Math.random()*4);
    corpses.push({x:b.x,y:b.y,ang:b.ang,r:b.r,etype:'boss'});
    if(level===7&&!finalLordSpawned)spawnLandlordNPC(b.x,b.y);
     if(level===7||level===10)window.PiraliBigHearts?.spawn(level,b);
  }
}

function takeDmg(){
  if(invincible||dashing||P.dead)return;
  if(inventory.laurelShield===1){
    inventory.laurelShield=0;
    updateInventoryUI();
    invincible=true;
    // Prevent a single overlapping volley from taking a second hit immediately.
    setTimeout(()=>{invincible=false;},PIRALI_BALANCE.playerIFrameMs);
    window.PiraliLaurel?.onBlock();
    window.PiraliKillCombo?.reset();
    return;
  }
  health--;invincible=true;setTimeout(()=>invincible=false,PIRALI_BALANCE.playerIFrameMs);
  playHurt();
  PiraliFX.hurt(P.x,P.y);
  // Screen shake
  shakePow=10;
  killStreak=0;window.PiraliKillCombo?.reset(); // reset combos on damage
  const fl=document.getElementById('dflash');fl.style.opacity='1';setTimeout(()=>fl.style.opacity='0',160);
  updateHealthUI();
  if(health<=0){P.dead=true;setTimeout(showGameOver,1100);}
}

function spawnPart(x,y,vx,vy,life,col,sz){if(parts.length>=160)return;if(Math.abs(x-P.x)>W*1.2||Math.abs(y-P.y)>H*1.2)return;parts.push({x,y,vx,vy,life,ml:life,col,sz});}

// ── UPDATE ──
