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


  // Make the community link part of the core menu. This also protects against
  // a cached Full Route script which may not include the community addition.
  const communityLabels={ka:'გეიმერების საზოგადოება',en:'Gaming Community',ru:'Сообщество игроков',zh:'玩家社区'};
  function ensureCommunity(actions){
    if(!actions?.isConnected)return;
    const records=actions.querySelector('.menu-records');
    if(!records)return;
    let link=actions.querySelector('.pirali-community-menu');
    if(!link){
      link=document.createElement('a');
      link.className='pirali-community-menu';
      link.href='https://www.facebook.com/share/1LfEa8WSfU/';
      link.target='_blank';
      link.rel='noopener noreferrer';
      link.setAttribute('aria-label','Georgian Gamers Guild — Facebook');
      const emblem=document.createElement('img');
      emblem.src='assets/icons/ggg-community.webp';
      emblem.alt='Georgian Gamers Guild';
      emblem.width=36;emblem.height=36;
      const label=document.createElement('span');
      label.className='pirali-community-label';
      const arrow=document.createElement('span');
      arrow.className='pirali-community-external';
      arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
      link.append(emblem,label,arrow);
      actions.insertBefore(link,records);
    }
    const full=actions.querySelector('.pirali-full-menu');
    if(full&&full.nextElementSibling!==link)actions.insertBefore(link,full.nextSibling);
    else if(!full&&link.nextElementSibling!==records)actions.insertBefore(link,records);
    const label=link.querySelector('.pirali-community-label');
    const nextText=communityLabels[window.PiraliLanguage?.getLanguage?.()||'ka']||communityLabels.ka;
    if(label&&label.textContent!==nextText)label.textContent=nextText;
  }
  document.addEventListener('pirali:languagechange',()=>{
    const actions=document.querySelector('#screen .main-menu-panel .menu-actions');
    if(actions)ensureCommunity(actions);
  });

  function addMenuPanel(){
    if(screen.classList.contains('gameover-screen')||screen.classList.contains('victory-screen'))return;
    if(screen.querySelector('.main-menu-panel'))return;
    if(!screen.querySelector('.sbtn'))return;

    const card=document.createElement('div');
    card.className='main-menu-panel';
    const existing=Array.from(screen.children).filter(x=>x.id!=='screen-overlay');
    existing.forEach(x=>card.appendChild(x));
    screen.appendChild(card);
    // Keep the real translated introductory story, but paint it on the
    // right-hand sky of the original background rather than inside the card.
    const lore=card.querySelector('.sbox');
    if(lore){
      lore.classList.add('menu-story-lore');
      screen.insertBefore(lore,card);
    }
    screen.classList.add('pirali-menu-135');

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
    card.appendChild(actions);
    // Track subsequent Full Route insertion; never remove or duplicate this link.
    const communityObserver=new MutationObserver(()=>ensureCommunity(actions));
    communityObserver.observe(actions,{childList:true});
    ensureCommunity(actions);
    window.PiraliCheckpoint?.mountMenu(card);
    // The player's real saved name sits directly beneath My Statistics.
    window.PiraliPlayerIdentity?.mountMenu(actions);

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
    // Language selector follows the complete action stack and player name.
    card.appendChild(picker);

    const privacy=document.createElement('button');
    privacy.type='button';privacy.className='menu-privacy';
    privacy.addEventListener('click',showPrivacyPolicy);
    card.appendChild(privacy);refreshPrivacyLabel();
    const version=document.createElement('div');
    version.className='menu-version';
    version.textContent='PIRALI • BETA 1.35 • 11 ტური';
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
