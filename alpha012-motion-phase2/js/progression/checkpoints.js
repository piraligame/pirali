/* PIRALI checkpoints: local-only, at completed-level boundaries. No Firebase writes. */
(function(){
  'use strict';
  const KEY='alpha012_phase2_pirali_checkpoint_v1';
  let resumedRun=false;
  let session=0;
  const text=key=>window.PiraliLanguage?window.PiraliLanguage.t(key):key;
  const int=(value,min,max)=>Number.isInteger(value)&&value>=min&&value<=max;

  function normalize(raw){
    if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.version!==1)return null;
    if(!int(raw.level,2,5)||!int(raw.health,1,5)||!int(raw.ammo,0,8))return null;
    if(!Number.isSafeInteger(raw.score)||raw.score<0||raw.score>999999999)return null;
    if(!raw.inventory||typeof raw.inventory!=='object')return null;
    if(!int(raw.inventory.herbs,0,9999)||!int(raw.inventory.medals,0,9999))return null;
    if(typeof raw.savedAt!=='number'||!Number.isFinite(raw.savedAt)||raw.savedAt<0)return null;
    return {
      version:1,level:raw.level,health:raw.health,ammo:raw.ammo,score:raw.score,
      inventory:{herbs:raw.inventory.herbs,medals:raw.inventory.medals},savedAt:raw.savedAt
    };
  }
  function get(){
    try{
      const value=localStorage.getItem(KEY);
      if(!value||value.length>4096)return null;
      return normalize(JSON.parse(value));
    }catch(e){return null}
  }
  function save(nextLevel){
    // Only crossing a completed-stage exit creates a checkpoint.
    if(!int(nextLevel,2,5))return false;
    try{
      const older=get();
      const current=normalize({
        version:1,level:nextLevel,health,ammo,score,
        inventory:{herbs:inventory.herbs,medals:inventory.medals},
        savedAt:Date.now()
      });
      if(!current)return false;
      // Preserve the farthest checkpoint, and the highest score on equal stages.
      if(older&&(older.level>nextLevel||older.level===nextLevel&&older.score>=current.score))return false;
      localStorage.setItem(KEY,JSON.stringify(current));
      refreshMenu();
      return true;
    }catch(e){console.warn('PIRALI checkpoint could not be saved',e);return false}
  }
  function clear(){
    try{localStorage.removeItem(KEY)}catch(e){}
    refreshMenu();
  }
  function beginRun(fromCheckpoint){
    resumedRun=!!fromCheckpoint;
    session++; // invalidate previous run's delayed level transitions
    updateMode();
  }
  function getSession(){return session}
  function isResumedRun(){return resumedRun}
  function updateMode(){
    const label=document.getElementById('pirali-run-mode');
    if(!label)return;
    const inGame=document.getElementById('screen')?.style.display==='none';
    label.hidden=!resumedRun||!inGame;
    if(resumedRun&&inGame)label.textContent='⚑ '+text('unrankedMode');
  }
  function refreshMenu(){
    const button=document.querySelector('#screen .menu-continue');
    if(!button)return;
    const cp=get();
    button.hidden=!cp;
    if(!cp)return;
    button.textContent='▶ '+text('continueSave')+' · '+text('level')+' '+cp.level+' — '+
      (window.PiraliLanguage?window.PiraliLanguage.getLevelName(cp.level):PIRALI_LEVELS[cp.level-1].ka);
    button.title=text('unrankedNotice');
  }
  function mountMenu(card){
    if(!card||card.querySelector('.menu-continue'))return;
    const start=card.querySelector('button.sbtn');
    if(!start)return;
    const button=document.createElement('button');
    button.className='menu-continue';button.type='button';button.hidden=true;
    button.addEventListener('click',resume);
    card.insertBefore(button,start);
    refreshMenu();
  }
  function resume(){
    const cp=get();
    if(!cp)return false;
    if(typeof startGame!=='function')return false;
    startGame(cp);
    return true;
  }
  function outcomeNotice(){
    if(!resumedRun)return;
    const box=document.querySelector('#screen .sbox');
    if(!box)return;
    let note=box.querySelector('.pirali-unranked-note');
    if(!note){note=document.createElement('div');note.className='pirali-unranked-note';box.appendChild(note)}
    note.textContent='⚑ '+text('unrankedNotice');
  }
  document.addEventListener('pirali:languagechange',()=>{
    refreshMenu();updateMode();outcomeNotice();
  });
  window.PiraliCheckpoint={
    get,save,clear,normalize,beginRun,getSession,isResumedRun,updateMode,refreshMenu,mountMenu,resume,outcomeNotice
  };
})();
