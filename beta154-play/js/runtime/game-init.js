function spawnLandlordNPC(fromX=P.x,fromY=P.y){
  if(finalLordSpawned)return;
  finalLordSpawned=true;
  const lx=Math.max(30,Math.min(WW-30,fromX+55)),ly=Math.max(30,Math.min(WH-30,fromY));
  enemies.push({
    x:lx,
    y:ly,
    r:13,hp:PIRALI_BALANCE.landlordHp*.85*.90,maxHp:PIRALI_BALANCE.landlordHp*.85*.90,
    vx:0,vy:0,ang:Math.PI,
    patrol:{cx:lx,cy:ly,radius:40,t:0,spd:0.1},
    sT:9999,alive:true,hf:0,wf:0,
    etype:'landlord',
    isNPC:true,
    alertTimer:0,state:'patrol',flankTimer:0,groupId:0,
    retreating:false,retreatTimer:0
  });
  showBanner('ბატონი გამოჩნდა!\nერთი დარტყმით დაამარცხე!');
}

function startGame(savedProgress=null){
  const restore=window.PiraliCheckpoint?.normalize(savedProgress)||null;
  // Required first-use registration. A cancelled/invalid/unsaved name cannot start
  // gameplay and must never increment personal stats or overwrite checkpoints.
  if(!window.PiraliPlayerIdentity?.isRegistered()){
    if(!window.PiraliPlayerIdentity){console.error('PIRALI registration module missing');return;}
    window.PiraliPlayerIdentity.requireName(()=>startGame(savedProgress));
    return;
  }
  const fullPath=restore?null:window.PiraliFullPath?.consumeStart?.()||null;
  if(restore)window.PiraliFullPath?.clearActive?.();
  bgmStop();
  score=restore?restore.score:0;
  maxHealth=fullPath?7:restore?.maxHealth||5;health=fullPath?7:restore?Math.min(restore.health,maxHealth):5;
  window.PiraliBigHearts?.reset(fullPath?{seven:true,ten:true}:restore?.bigHearts||null);
  ammo=restore?Math.min(10,restore.ammo):10;maxAmmo=10;
  level=fullPath?fullPath.stage:restore?restore.level:1;
  // Only carry actually earned points (new season range: 0–7000).
  inventory.herbs=restore?restore.inventory.herbs:0;
  inventory.laurelShield=restore?.inventory?.laurelShield===1?1:0;
  inventory.medals=restore?restore.inventory.medals:0;
  window.PiraliAlphaGear?.reset();
  if(fullPath?.shotgun)window.PiraliAlphaGear?.restore({owned:true,shells:12,selected:'shotgun',shellGrantBase:15});
  else if(restore?.shotgun)window.PiraliAlphaGear?.restore(restore.shotgun);
  invincible=false;dashing=false;dashT=0;dashCD=0;
  swordCombo=0;swordComboTimer=0;swordCD=0; // reset 0.15-style sword on each new run
  shakePow=0;killStreak=0;killStreakTimer=0;_floats.length=0;bloodDecals=[];
  window.PiraliKillCombo?.reset();
  paused=false;document.getElementById('pause-overlay').style.display='none';
  document.getElementById('btn-pause').textContent='⏸';
  // Restore the saved bonus-stage baseline BEFORE the first score-clamp call.
  window.PiraliCheckpoint?.beginRun(!!restore);
  updateHealthUI();updateScoreUI();updateAmmoUI();updateInventoryUI();hideBossUI();
  document.getElementById('screen').style.display='none';
  document.getElementById('screen').className='';
  window.PiraliCheckpoint?.updateMode();
  genWorld();running=true;
  window.PiraliAlphaGear?.updateUI();
  window.PiraliStats?.start(!!restore,level);
  updateProgressUI();
  showBanner(LEVEL_NAMES[level]);
  window.PiraliPolish?.onStageBegin(level);
}

// ── LOOP ──
