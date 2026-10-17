function showGameOver(){
  window.PiraliStats?.result(false,score);
  running=false;paused=false;
  document.getElementById('pause-overlay').style.display='none';
  document.getElementById('btn-pause').textContent='⏸';
  setTimeout(()=>bgmFadeIn(0.38),800);
  _pendingScore=score;_pendingLevel=level;_pendingWin=false;autoSaveScore(score,level,false);
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
  _pendingScore=score;_pendingLevel=level;_pendingWin=true;autoSaveScore(score,level,true);
  const s=document.getElementById('screen');
  s.className='victory-screen';
  s.innerHTML=`<div id="screen-overlay"></div>
  <div class="tdeco" style="color:#c8a840;letter-spacing:8px;">— გამარჯვება! —</div>
  <h1 style="font-size:48px;">⛪</h1>
  <h1 style="font-size:28px;letter-spacing:6px;margin-top:-8px;">ეკლესია!</h1>
  <div class="tsub">სამშობლო გადარჩა</div>
  <div class="sbox"><p>ქულა: <strong style="color:#f0d020;font-size:24px;" class="score-reveal">${score.toLocaleString()}</strong><br><span style="font-size:11px;color:#907030;">სიმონა თამარის ეკლესიამდე მივიდა!</span></p></div>
  <button class="sbtn" style="background:linear-gradient(180deg,#5c380a,#2e1a04);border-color:#d8a820;" onclick="document.getElementById('screen').style.display='none';lbShow()">🏆 რეკორდები</button>`;
  s.style.display='flex';
  if(window.PiraliLanguage)window.PiraliLanguage.applyOutcome();
  window.PiraliCheckpoint?.outcomeNotice();
  window.PiraliCheckpoint?.updateMode();
  window.PiraliStats?.renderResult();
}




						83 container
							84 text function showGameOver ( ) {
						85 container
							86 text window . PiraliStats ?. result ( false , score ) ;
						87 container
							88 text running = false ; paused = false ;
						89 container
							90 text document . getElementById ( 'pause-overlay' ) . style . display = 'none' ;
						91 container
							92 text document . getElementById ( 'btn-pause' ) . textContent = '⏸' ;
						93 container
							94 text setTimeout ( ( ) => bgmFadeIn ( 0.38 ) , 800 ) ;
						95 container
							96 text _pendingScore = score ; _pendingLevel = level ; _pendingWin = false ; autoSaveScore ( score , level , false ) ;
						97 container
							98 text const s = document . getElementById ( 'screen' ) ;
						99 container
							100 text s . className = 'gameover-screen' ;
						101 container
							102 text s . innerHTML = `<div id="screen-overlay"></div>
						103 text   <div class="tdeco">— ბრძოლა დასრულდა —</div>
						104 text   <h1 style="font-size:38px;color:#c83030;text-shadow:0 0 40px rgba(200,30,30,0.8),0 2px 0 #0a0200;">სიმონა დაეცა</h1>
						105 text   <div class="tsub">გამარჯვება ხვალ მოვა</div>
						106 text   <button class="sbtn alpha-outcome-menu" onclick="goToMenu()">🏠 მთავარ მენიუში</button>
						107 container
							108 text   <div class="sbox"><p>ქულა: <strong style="color:#d09820;font-size:22px;" class="score-reveal"> ${ score . toLocaleString ( ) } </strong><br><span style="color:#7a5820;font-size:10px;letter-spacing:2px;">დონე  ${ level }  •  ${ level <= 2 ? 'ადვილი' : level <= 4 ? 'საშუალო' : 'რთული' } </span></p></div>
						109 container
							110 text   <button class="sbtn" onclick="document.getElementById('screen').style.display='none';lbShow()">🏆 რეკორდები</button>` ;
						111 container
							112 text s . style . display = 'flex' ;
						113 container
							114 text if ( window . PiraliLanguage ) window . PiraliLanguage . applyOutcome ( ) ;
						115 container
							116 text window . PiraliCheckpoint ?. outcomeNotice ( ) ;
						117 container
							118 text window . PiraliCheckpoint ?. updateMode ( ) ;
						119 container
							120 text window . PiraliStats ?. renderResult ( ) ;
						121 text }
						122 container
							123 text function showVictory ( ) {
						124 container
							125 text window . PiraliStats ?. result ( true , score ) ;
						126 container
							127 text running = false ; paused = false ;
						128 container
							129 text document . getElementById ( 'pause-overlay' ) . style . display = 'none' ;
						130 container
							131 text document . getElementById ( 'btn-pause' ) . textContent = '⏸' ;
						132 container
							133 text setTimeout ( ( ) => bgmFadeIn ( 0.42 ) , 800 ) ;
						134 container
							135 text window . PiraliCheckpoint ?. clear ( ) ;  // Victory closes the completed checkpoint
						136 container
							137 text _pendingScore = score ; _pendingLevel = level ; _pendingWin = true ; autoSaveScore ( score , level , true ) ;
						138 container
							139 text const s = document . getElementById ( 'screen' ) ;
						140 container
							141 text s . className = 'victory-screen' ;
						142 container
							143 text s . innerHTML = `<div id="screen-overlay"></div>
						144 text   <div class="tdeco" style="color:#c8a840;letter-spacing:8px;">— გამარჯვება! —</div>
						145 text   <h1 style="font-size:48px;">⛪</h1>
						146 text   <h1 style="font-size:28px;letter-spacing:6px;margin-top:-8px;">ეკლესია!</h1>
						147 text   <div class="tsub">სამშობლო გადარჩა</div>
						148 container
							149 text   <div class="sbox"><p>ქულა: <strong style="color:#f0d020;font-size:24px;" class="score-reveal"> ${ score . toLocaleString ( ) } </strong><br><span style="font-size:11px;color:#907030;">სიმონა თამარის ეკლესიამდე მივიდა!</span></p></div>
						150 container
							151 text   <button class="sbtn" style="background:linear-gradient(180deg,#5c380a,#2e1a04);border-color:#d8a820;" onclick="document.getElementById('screen').style.display='none';lbShow()">🏆 რეკორდები</button>` ;
						152 container
							153 text s . style . display = 'flex' ;
						154 container
							155 text if ( window . PiraliLanguage ) window . PiraliLanguage . applyOutcome ( ) ;
						156 container
							157 text window . PiraliCheckpoint ?. outcomeNotice ( ) ;
						158 container
							159 text window . PiraliCheckpoint ?. updateMode ( ) ;
						160 container
							161 text window . PiraliStats ?. renderResult ( ) ;
						162 text }
				163 container focus-trap-help-panel
					164 text Use 
					165 text Control + Shift + m
					166 text  to toggle the 
					167 text tab
					168 text  key moving focus. Alternatively, use 
					169 text esc
					170 text  then 
					171 text tab
					172 text  to move to the next interactive element on the page.

The focused UI element is 82 text entry area (settable) Editing outcome.js file contents Use Control + Shift + m to toggle the tab key moving focus. Alternatively, use esc then tab to move to the next interactive element on the page., Value: function showGameOver(){
  window.PiraliStats?.result(false,score);
  running=false;paused=false;
  document.getElementById('pause-overlay').style.display='none';
  document.getElementById('btn-pause').textContent='⏸';
  setTimeout(()=>bgmFadeIn(0.38),800);
  _pendingScore=score;_pendingLevel=level;_pendingWin=false;autoSaveScore(score,level,false);
  const s=document.getElementById('screen');
  s.className='gameover-screen';
  s.innerHTML=`<div id="screen-overlay"></div>
  <div class="tdeco">— ბრძოლა დასრულდა —</div>
  <h1 style="font-size:38px;color:#c83030;text-shadow:0 0 40px rgba(200,30,30,0.8),0 2px 0 #0a0200;">სიმონა დაეცა</h1>
  <div class="tsub">გამარჯვება ხვალ მოვა</div>
  <button class="sbtn alpha-outcome-menu" onclick="goToMenu()">🏠 მთავარ მენიუში</button>
  <div class="sbox"><p>ქულა: <strong style="color:#d09820;font-size:22px;" class="score-reveal">${score.toLocaleString()}</strong><br><span style="color:#7a5820;font-size:10px;letter-spacing:2px;">დონე ${level} • ${level<=2?'ადვილი':level<=4?'საშუალო':'რთული'}</span></p></div>
  <button class="sbtn" onclick="document.getElementById('screen').style.display='none';lbShow()">🏆 რეკორდები</button>`;
  s.style.display='flex';
  if(window.PiraliLanguage)window.PiraliLanguage.applyOutcome();
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
  _pendingScore=score;_pendingLevel=level;_pendingWin=true;autoSaveScore(score,level,true);
  const s=document.getElementById('screen');
  s.className='victory-screen';
  s.innerHTML=`<div id="screen-overlay"></div>
  <div class="tdeco" style="color:#c8a840;letter-spacing:8px;">— გამარჯვება! —</div>
  <h1 style="font-size:48px;">⛪</h1>
  <h1 style="font-size:28px;letter-spacing:6px;margin-top:-8px;">ეკლესია!</h1>
  <div class="tsub">სამშობლო გადარჩა</div>
  <div class="sbox"><p>ქულა: <strong style="color:#f0d020;font-size:24px;" class="score-reveal">${score.toLocaleString()}</strong><br><span style="font-size:11px;color:#907030;">სიმონა თამარის ეკლესიამდე მივიდა!</span></p></div>
  <button class="sbtn" style="background:linear-gradient(180deg,#5c380a,#2e1a04);border-color:#d8a820;" onclick="document.getElementById('screen').style.display='none';lbShow()">🏆 რეკორდები</button>`;
  s.style.display='flex';
  if(window.PiraliLanguage)window.PiraliLanguage.applyOutcome();
  window.PiraliCheckpoint?.outcomeNotice();
  window.PiraliCheckpoint?.updateMode();
  window.PiraliStats?.renderResult();
}


