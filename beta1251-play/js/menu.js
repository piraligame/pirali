/* PIRALI menu actions, independent of gameplay core. */
(function(){
  'use strict';
  const screen=document.getElementById('screen');
  const leaderboard=document.getElementById('lb-overlay');
  if(!screen||!leaderboard)return;

  const privacyLabels={ka:'კონფიდენციალურობა',en:'PRIVACY POLICY',ru:'ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ',zh:'隐私政策'};
  function refreshPrivacyLabel(){
    const button=document.querySelector('#screen .menu-privacy');
    if(button)button.textContent='🔒 '+(privacyLabels[window.PiraliLanguage?.getLanguage?.()||'ka']||privacyLabels.ka);
  }
  function showPrivacyPolicy(){
    if(document.getElementById('pirali-privacy-overlay'))return;
    const overlay=document.createElement('div');overlay.id='pirali-privacy-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
    const panel=document.createElement('div');panel.className='pirali-privacy-panel';
    const close=document.createElement('button');close.type='button';close.className='pirali-privacy-close';close.textContent='✕';close.setAttribute('aria-label','Close privacy policy');
    close.addEventListener('click',()=>overlay.remove());
    const frame=document.createElement('iframe');frame.src='privacy.html';frame.title='PIRALI — Privacy Policy';
    panel.append(close,frame);overlay.appendChild(panel);document.body.appendChild(overlay);
    overlay.addEventListener('click',event=>{if(event.target===overlay)overlay.remove()});close.focus();
  }
  document.addEventListener('pirali:languagechange',refreshPrivacyLabel);
  document.addEventListener('keydown',event=>{if(event.key==='Escape')document.getElementById('pirali-privacy-overlay')?.remove()});

  function addMenuPanel(){
    if(screen.classList.contains('gameover-screen')||screen.classList.contains('victory-screen'))return;
    if(screen.querySelector('.main-menu-panel'))return;
    if(!screen.querySelector('.sbtn'))return;

    const card=document.createElement('div');
    card.className='main-menu-panel';
    const existing=Array.from(screen.children).filter(x=>x.id!=='screen-overlay');
    existing.forEach(x=>card.appendChild(x));
    screen.appendChild(card);

    const actions=document.createElement('div');
    actions.className='menu-actions';
    const records=document.createElement('button');
    records.type='button';
    records.className='menu-records';
    records.textContent='🏆 საუკეთესო მოთამაშეები';
    records.addEventListener('click',function(){
      if(typeof lbShow!=='function')return;
      if(window.PiraliLanguage)window.PiraliLanguage.applyLeaderboard?.();
      lbShow();
      const play=document.getElementById('lb-play');
      if(play)play.style.display='none';
      back.style.display='block';
    });
    actions.appendChild(records);
    window.PiraliStats?.mountMenu(actions);
    window.PiraliReplay?.mountMenu(actions);
    card.appendChild(actions);
    window.PiraliCheckpoint?.mountMenu(card);

    // Four-language selector. English is the US variant (🇺🇸).
    const picker=document.createElement('div');
    picker.className='menu-language';
    const title=document.createElement('div');
    title.className='menu-lang-title';
    title.textContent='ენა / LANGUAGE';
    picker.appendChild(title);
    const choices=document.createElement('div');
    choices.className='menu-language-choices';
    choices.setAttribute('role','group');
    choices.setAttribute('aria-label','Language / ენა');
    for(const item of [
      ['ka','🇬🇪 ქართული'],
      ['en','🇺🇸 English'],
      ['ru','🇷🇺 Русский'],
      ['zh','🇨🇳 中文']
    ]){
      const button=document.createElement('button');
      button.type='button';
      button.className='menu-language-option';
      button.dataset.piraliLang=item[0];
      button.textContent=item[1];
      button.addEventListener('click',()=>{
        if(window.PiraliLanguage)window.PiraliLanguage.setLanguage(item[0]);
      });
      choices.appendChild(button);
    }
    picker.appendChild(choices);
    card.insertBefore(picker,card.firstChild);

    const privacy=document.createElement('button');
    privacy.type='button';privacy.className='menu-privacy';
    privacy.addEventListener('click',showPrivacyPolicy);
    card.appendChild(privacy);refreshPrivacyLabel();
    const version=document.createElement('div');
    version.className='menu-version';
    version.textContent='PIRALI • BETA 1.25.1 • 11 ტური';
    card.appendChild(version);
    if(window.PiraliLanguage)window.PiraliLanguage.apply();
  }
  const back=document.createElement('button');
  back.id='pirali-lb-close';
  back.type='button';
  back.textContent='← მთავარ მენიუში დაბრუნება';
  back.addEventListener('click',function(){
    leaderboard.style.display='none';
    window.PiraliLeaderboardScrollGuard?.setOpen(false);
    back.style.display='none';
    if(typeof goToMenu==='function')goToMenu();
  });
  leaderboard.appendChild(back);

  const leaderboardObserver=new MutationObserver(function(){
    if(leaderboard.style.display==='flex')back.style.display='block';
  });
  leaderboardObserver.observe(leaderboard,{attributes:true,attributeFilter:['style']});

  // Game code reconstructs the menu after exiting a level.
  // Recreate only menu presentation after that built-in transition.
  const observer=new MutationObserver(function(){
    if(screen.querySelector('.main-menu-panel'))return;
    if(screen.classList.contains('gameover-screen')||screen.classList.contains('victory-screen'))return;
    if(!screen.querySelector('.sbtn'))return;
    addMenuPanel();
  });
  observer.observe(screen,{childList:true});
  addMenuPanel();
})();
