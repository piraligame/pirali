function spawnLandlordNPC(){
  enemies.push({
    x:player?player.x+130:P.x+130,
    y:player?player.y:P.y,
    r:13,hp:1,maxHp:1,
    vx:0,vy:0,ang:Math.PI,
    patrol:{cx:P.x+130,cy:P.y,radius:40,t:0,spd:0.1},
    sT:9999,alive:true,hf:0,wf:0,
    etype:'landlord',
    isNPC:true,
    alertTimer:0,state:'patrol',flankTimer:0,groupId:0,
    retreating:false,retreatTimer:0
  });
  showBanner('მემამულე გამოჩნდა!\nმოკალი იგი!');
}

function startGame(){
  // ensure player name is set
  const savedName = localStorage.getItem('pirali_player_name');
  if(!savedName){
    const n = (prompt('შეიყვანე შენი სახელი (მაქს. 14 სიმბოლო):') || '').trim().slice(0,14);
    if(n) localStorage.setItem('pirali_player_name', n);
  }
  bgmStop();
  score=0;health=5;maxHealth=5;ammo=8;maxAmmo=8;level=1;
  inventory.herbs=0;inventory.medals=0;swordCombo=0;swordComboTimer=0;
  shakePow=0;killStreak=0;killStreakTimer=0;_floats.length=0;bloodDecals=[];
  paused=false;document.getElementById('pause-overlay').style.display='none';
  document.getElementById('btn-pause').textContent='⏸';
  updateHealthUI();updateScoreUI();updateAmmoUI();updateInventoryUI();hideBossUI();
  document.getElementById('screen').style.display='none';
  document.getElementById('screen').className='';
  genWorld();running=true;
  showBanner(LEVEL_NAMES[1]);
}

// ── LOOP ──
