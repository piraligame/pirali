function showGameOver(){
  window.PiraliCheckpoint?.clear(); // Do not resume a stage after death.
  window.PiraliStats?.result(false,score);
  running=false;paused=false;
  document.getElementById('pause-overlay').style.display='none';
  document.getElementById('btn-pause').textContent='⏸';
  setTimeout(()=>bgmFadeIn(0.38),800);
  _pendingScore=score;_pendingLevel=level;_pendingWin=false;
  window.PiraliBetaSavePromise=Promise.resolve(autoSaveScore(score,level,false));
  const s=document.getElementById('screen');
  s.className='gameover-screen';
  s.innerHTML=`<div id="screen-overlay"></div>
  <div class="tdeco">— ბრძოლა დასრულდა —</div>
  <h1 style="font-size:38px;color:#c83030;text-shadow:0 0 40px rgba(200,30,30,0.8),0 2px 0 #0a0200;">სიმონა დაეცა</h1>
  <div class="tsub">გამარჯვება ხვალ მოვა</div>
  <div class="sbox"><p>ქულა: <strong style="color:#d09820;font-size:22px;" class="score-reveal">${score.toLocaleString()}</strong><br><span style="color:#7a5820;font-size:10px;letter-spacing:2px;">დონე ${level} • ${level<=2?'ადვილი':level<=4?'საშუალო':'რთული'}</span></p></div>
  <button class="sbtn" onclick="document.getElementById('screen').style.display='none';lbShow()">🏆 რეკორდები</button>
  <button class="sbtn alpha-outcome-menu" onclick="goToMenu()">🏠 მთავარ მენიუში</button>`;
  s.style.display='flex';
  if(window.PiraliLanguage)window.PiraliLanguage.applyOutcome();
  const menuButton=s.querySelector('.alpha-outcome-menu');
  const language=window.PiraliLanguage?.getLanguage?.()||'ka';
  const menuLabels={ka:'🏠 მთავარ მენიუში',en:'🏠 MAIN MENU',ru:'🏠 ГЛАВНОЕ МЕНЮ',zh:'🏠 返回主菜单'};
  if(menuButton)menuButton.textContent=menuLabels[language]||menuLabels.ka;
  window.PiraliCheckpoint?.outcomeNotice();
  window.PiraliCheckpoint?.updateMode();
  window.PiraliStats?.renderResult();
}
function showVictory(){
  window.PiraliStats?.result(true,score);
  running=false;paused=false;
  document.getElementById('pause-overlay').style.display='none';
  document.getElementById('btn-pause').textContent='⏸';
  setTimeout(()=>bgmFadeIn(0.42),800);
  window.PiraliCheckpoint?.clear(); // Victory closes the completed checkpoint
  _pendingScore=score;_pendingLevel=level;_pendingWin=true;
  window.PiraliBetaSavePromise=Promise.resolve(autoSaveScore(score,level,true));
  const s=document.getElementById('screen');
  s.className='victory-screen';
  s.innerHTML=`<div id="screen-overlay"></div>
  <div class="tdeco" style="color:#c8a840;letter-spacing:8px;">— გამარჯვება! —</div>
  <h1 style="font-size:48px;">🔥</h1>
  <h1 style="font-size:28px;letter-spacing:2px;margin-top:-8px;">სიმონამ ჯოჯოხეთი გაიარა!</h1>
  <div class="tsub">ეშმაკი დამარცხებულია — კარიბჭე გადალახულია</div>
  <div class="sbox"><p>ქულა: <strong style="color:#f0d020;font-size:24px;" class="score-reveal">${score.toLocaleString()}</strong></p></div>
  <button class="sbtn" style="background:linear-gradient(180deg,#5c380a,#2e1a04);border-color:#d8a820;" onclick="document.getElementById('screen').style.display='none';lbShow()">🏆 რეკორდები</button>
  <button class="sbtn alpha-outcome-menu" onclick="goToMenu()">🏠 მთავარ მენიუში</button>`;
  s.style.display='flex';
  if(window.PiraliLanguage)window.PiraliLanguage.applyOutcome();
  window.PiraliStageStars?.onVictory?.();
  window.PiraliCheckpoint?.outcomeNotice();
  window.PiraliCheckpoint?.updateMode();
  window.PiraliStats?.renderResult();
}
