/* PIRALI: isolated mobile lifecycle and Android back navigation. No database changes. */
(function(){
  'use strict';
  const el=id=>document.getElementById(id);
  const shown=node=>!!node&&getComputedStyle(node).display!=='none';
  const tr=key=>window.PiraliLanguage?PiraliLanguage.t(key):key;

  function resetInputs(){
    // Prevent stuck movement when Android swallows the last touch event.
    if(typeof joy!=='undefined'){
      joy.active=false;joy.id=-1;joy.dx=0;joy.dy=0;
    }
    if(typeof K!=='undefined')K.l=K.r=K.u=K.d=false;
    for(const id of ['joy-base','joy-knob'])if(el(id))el(id).style.display='none';
    document.querySelectorAll('.act-btn.pressed').forEach(node=>node.classList.remove('pressed'));
  }

  function pauseForBackground(){
    resetInputs();
    if(typeof running!=='undefined'&&typeof paused!=='undefined'&&running&&!paused){
      togglePause();  // preserves level, health, ammo, score and pause overlay
    }
    if(typeof bgmStop==='function')bgmStop();
    const video=el('pirali-intro-video');
    if(video&&!video.paused){
      video.pause();
      if(el('pirali-intro-play'))el('pirali-intro-play').style.display='block';
      const status=el('pirali-intro-status');
      if(status){
        status.dataset.piraliStatus='introPrompt';
        status.textContent=tr('introPrompt');
        status.style.display='block';
      }
    }
  }

  function nativeApp(){
    const cap=window.Capacitor;
    return cap&&typeof cap.getPlatform==='function'&&cap.getPlatform()==='android'
      ? cap.Plugins&&cap.Plugins.App : null;
  }

  let dialog=null;
  function closeQuit(){if(dialog)dialog.hidden=true;}
  function translateQuit(){
    if(!dialog)return;
    for(const [id,key] of [
      ['pirali-exit-title','exitTitle'],['pirali-exit-info','exitWarning'],
      ['pirali-exit-stay','exitCancel'],['pirali-exit-confirm','exitConfirm']
    ])if(el(id))el(id).textContent=tr(key);
  }
  function showQuit(){
    if(!dialog){
      dialog=document.createElement('div');
      dialog.id='pirali-exit-dialog';
      dialog.setAttribute('role','dialog');
      dialog.setAttribute('aria-modal','true');
      dialog.setAttribute('aria-labelledby','pirali-exit-title');
      dialog.hidden=true;
      const card=document.createElement('div');card.className='pirali-exit-card';
      const title=document.createElement('h2');title.id='pirali-exit-title';
      const description=document.createElement('p');description.id='pirali-exit-info';
      const actions=document.createElement('div');actions.className='pirali-exit-actions';
      const stay=document.createElement('button');stay.id='pirali-exit-stay';stay.type='button';
      stay.addEventListener('click',closeQuit);
      const exit=document.createElement('button');exit.id='pirali-exit-confirm';exit.type='button';
      exit.addEventListener('click',()=>{
        const native=nativeApp();closeQuit();
        if(native&&typeof native.exitApp==='function')native.exitApp();
      });
      actions.append(stay,exit);card.append(title,description,actions);
      dialog.appendChild(card);document.body.appendChild(dialog);
    }
    translateQuit();dialog.hidden=false;
    el('pirali-exit-stay').focus();
  }

  function handleBack(){
    if(window.PiraliStats?.visible()){window.PiraliStats.hide();return 'close-personal-stats';}
    if(dialog&&!dialog.hidden){closeQuit();return 'cancel-exit';}
    if(el('pirali-video-intro')){
      el('pirali-intro-skip')?.click();
      return 'skip-intro';
    }
    const lb=el('lb-overlay');
    if(shown(lb)){
      const back=el('pirali-lb-close');
      if(shown(back))back.click();
      else{
        lb.style.display='none';
        if(el('screen'))el('screen').style.display='flex';
      }
      return 'close-leaderboard';
    }
    const confirmation=el('menu-confirm');
    if(shown(confirmation)){
      confirmation.style.display='none';return 'cancel-menu-confirm';
    }
    if(typeof paused!=='undefined'&&paused){
      showMenuConfirm();return 'show-menu-confirm';
    }
    if(typeof running!=='undefined'&&running){
      togglePause();return 'pause-game';
    }
    // The app may be closed ONLY by explicit confirmation.
    showQuit();return 'show-exit-confirmation';
  }

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)pauseForBackground();
  });
  window.addEventListener('pagehide',pauseForBackground);
  document.addEventListener('pirali:languagechange',translateQuit);
  document.addEventListener('keydown',e=>{
    if(dialog&&!dialog.hidden&&(e.key==='Escape'||e.key==='Backspace')){
      e.preventDefault();e.stopImmediatePropagation();closeQuit();
    }
  },true);

  const app=nativeApp();
  if(app&&typeof app.addListener==='function'){
    // App plugin overrides Capacitor's automatic Back => Exit behavior.
    Promise.resolve(app.addListener('backButton',handleBack))
      .catch(e=>console.warn('PIRALI: back handler not registered',e));
    Promise.resolve(app.addListener('appStateChange',state=>{
      if(!state.isActive)pauseForBackground();
    })).catch(e=>console.warn('PIRALI: app state handler not registered',e));
  }
  window.PiraliMobile={handleBack,pauseForBackground,resetInputs,closeQuit};
})();
