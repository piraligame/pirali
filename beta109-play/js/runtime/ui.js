function updateHealthUI(){
  const c=document.getElementById('hearts');c.innerHTML='';
  for(let i=0;i<maxHealth;i++){const s=document.createElement('span');s.className='heart'+(i>=health?' lost':'');s.textContent='❤️';c.appendChild(s);}
}
function updateScoreUI(){document.getElementById('score-val').textContent=score;const el=document.getElementById('score-val');el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');setTimeout(()=>el.classList.remove('bump'),250);}
// ── PAUSE ──
let paused=false;
function togglePause(){
  if(!running&&!paused)return;
  paused=!paused;
  const overlay=document.getElementById('pause-overlay');
  const btn=document.getElementById('btn-pause');
  if(paused){
    overlay.style.display='flex';
    btn.textContent='▶';
    running=false;
    bgmStop();
  } else {
    overlay.style.display='none';
    btn.textContent='⏸';
    running=true;
    const mc=document.getElementById('menu-confirm');if(mc)mc.style.display='none';
    // მუსიკა თამაშში არ ჩაირთვება — მხოლოდ მენიუში/game over-ში ჩაირთვება
  }
}
function showMenuConfirm(){
  const c=document.getElementById('menu-confirm');
  if(c) c.style.display='flex';
}
function goToMenu(){
  const c=document.getElementById('menu-confirm');
  if(c) c.style.display='none';
  running=false;
  paused=false;
  document.getElementById('pause-overlay').style.display='none';
  document.getElementById('btn-pause').textContent='⏸';
  bgmStop();
  setTimeout(()=>bgmFadeIn(0.38),400);
  const s=document.getElementById('screen');
  s.className='';
  s.innerHTML=`<div id="screen-overlay"></div>
  <div class="tdeco" style="letter-spacing:8px;color:#c8a040;">— ქართული ლეგენდა —</div>
  <h1 style="font-size:62px;letter-spacing:10px;text-shadow:0 0 60px rgba(224,168,32,.9),0 4px 0 #0a0500,0 0 120px rgba(200,140,20,.4);">ფირალი</h1>
  <div style="font-size:11px;color:#a08030;letter-spacing:6px;text-transform:uppercase;margin-bottom:4px;z-index:1;position:relative;">Rise of the Outlaw</div>
  <div class="tsub">სიმონას გზა</div>
  <div class="sbox"><p>როცა სამართალი ხმას კარგავს,<br>ტყე ხდება თავშესაფარი.<br><br>სიმონა დოლიძე —<br>კაცი, რომელმაც არჩევანი გააკეთა:<br>დაემორჩილოს… ან იბრძოლოს.<br><br>მოღალატედ შერაცხული,<br>მაგრამ ხალხისთვის — გმირი.</p></div>
  <button class="sbtn" onclick="bgmStop();document.getElementById('screen').style.display='none';showIntro(startGame)">თამაშის დაწყება</button>`;
  s.style.display='flex';
  window.PiraliCheckpoint?.updateMode();
  window.PiraliEndlessHUD?.hide?.();
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'||e.key==='p'||e.key==='P'){if(running||paused)togglePause();}});
function updateAmmoUI(){const c=document.getElementById('bullets');c.innerHTML='';for(let i=0;i<maxAmmo;i++){const b=document.createElement('div');b.className='bi'+(i>=ammo?' e':'');c.appendChild(b);}}
function updateProgressUI(){
  document.getElementById('prog-fill').style.width=level===11?(window.PiraliEndless?.state?.().cleared?Math.min(100,(1-P.y/WH)*100)+'%':'0%'):Math.min(100,(1-P.y/WH)*100)+'%';
  const badge=document.getElementById('level-badge');
  if(badge){const tod=((LEVEL_ENV[Math.min(level,11)]||{}).tod||'');badge.textContent=level===11?(window.PiraliLanguage?.getLevelName?.(11)||'გზა სახლისაკენ 🇬🇪'):(window.PiraliLanguage?window.PiraliLanguage.translateLevel(level,tod):LEVEL_NAMES[Math.min(level,11)]);badge.classList.toggle('pirali-home-stage',level===11);}
  if(level!==11)window.PiraliEndlessHUD?.hide?.();
  const label=document.getElementById('prog-lbl');
  if(label&&level===11){
    const texts={ka:'სახლისკენ',en:'TO HOME',ru:'К ДОМУ',zh:'前往家园'};
    label.textContent=texts[window.PiraliLanguage?.getLanguage?.()||'ka']||texts.ka;
  }
}
function updateInventoryUI(){
  const hi=document.getElementById('inv-herbs');const mi=document.getElementById('inv-medals');
  if(inventory.herbs>0){hi.classList.add('visible');document.getElementById('inv-herbs-n').textContent=inventory.herbs;}else hi.classList.remove('visible');
  if(inventory.medals>0){mi.classList.add('visible');document.getElementById('inv-medals-n').textContent=inventory.medals;}else mi.classList.remove('visible');
}
function updateBossUI(){if(boss&&boss.alive){const pct=(boss.hp/boss.maxHp)*100;document.getElementById('boss-fill').style.width=pct+'%';}}
function hideBossUI(){document.getElementById('boss-bar').style.display='none';}
function updateDashUI(){const pct=Math.max(0,1-dashCD/DASH_COOLDOWN)*100;document.getElementById('dash-fill').style.width=pct+'%';}
function showBanner(text){const b=document.getElementById('lvlbanner');b.textContent=window.PiraliLanguage?window.PiraliLanguage.translateBanner(text):text;b.style.opacity='1';b.style.transition='opacity 0.3s';setTimeout(()=>{b.style.transition='opacity 1.1s';b.style.opacity='0';},3000);}
// ══════════════════════════════════════════════════
//  LEADERBOARD — Firebase REST API (GitHub Pages ready)
// ══════════════════════════════════════════════════
