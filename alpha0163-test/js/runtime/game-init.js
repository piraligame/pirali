function spawnLandlordNPC(fromX=P.x,fromY=P.y){
  if(finalLordSpawned)return;
  finalLordSpawned=true;
  const lx=Math.max(30,Math.min(WW-30,fromX+55)),ly=Math.max(30,Math.min(WH-30,fromY));
  enemies.push({
    x:lx,
    y:ly,
    r:13,hp:PIRALI_BALANCE.landlordHp,maxHp:PIRALI_BALANCE.landlordHp,
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
  // ensure player name is set
  const savedName = localStorage.getItem('pirali_player_name');
  if(!savedName){
    const n = (prompt((window.PiraliLanguage?window.PiraliLanguage.gameText('namePrompt'):'შეიყვანე შენი სახელი (მაქს. 14 სიმბოლო):')) || '').trim().slice(0,14);
    if(n) localStorage.setItem('pirali_player_name', n);
  }
  bgmStop();
  score=restore?restore.score:0;
  health=restore?restore.health:5;maxHealth=5;
  ammo=restore?restore.ammo:8;maxAmmo=8;
  level=restore?restore.level:1;
  if(level===11)score=Math.max(100000,score); // resume endless with story base
  inventory.herbs=restore?restore.inventory.herbs:0;
  inventory.medals=restore?restore.inventory.medals:0;
  window.PiraliAlphaGear?.reset();
  if(restore?.shotgun)window.PiraliAlphaGear?.restore(restore.shotgun);
  swordCombo=0;swordComboTimer=0;swordCD=0; // reset 0.15-style sword on each new run
  shakePow=0;killStreak=0;killStreakTimer=0;_floats.length=0;bloodDecals=[];
  window.PiraliKillCombo?.reset();
  paused=false;document.getElementById('pause-overlay').style.display='none';
  document.getElementById('btn-pause').textContent='⏸';
  updateHealthUI();updateScoreUI();updateAmmoUI();updateInventoryUI();hideBossUI();
  document.getElementById('screen').style.display='none';
  document.getElementById('screen').className='';
  window.PiraliCheckpoint?.beginRun(!!restore);
  genWorld();running=true;
  window.PiraliAlphaGear?.updateUI();
  window.PiraliStats?.start(!!restore,level);
  updateProgressUI();
  showBanner(LEVEL_NAMES[level]);
}

// ── LOOP ──
