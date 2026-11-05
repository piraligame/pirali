/* PIRALI BETA 1.04 — count remaining foes in a fifteen-enemy waves with gradual arrival. */
(function(){
'use strict';
const labels={
 ka:{wave:'ტალღა',kills:'სულ მოკლული',remaining:'დარჩენილი',home:'🏠 შედი სახლში!'},
 en:{wave:'Wave',kills:'Total kills',remaining:'Remaining',home:'🏠 Enter the house!'},
 ru:{wave:'Волна',kills:'Всего убито',remaining:'Осталось',home:'🏠 Войди в дом!'},
 zh:{wave:'波次',kills:'总击败',remaining:'剩余',home:'🏠 进入小屋！'}
};
let panel=null;
function hide(){if(panel)panel.style.display='none';}
function refresh(){
 const active=level===11&&running&&!P.dead;
 if(!active){hide();return;}
 const state=window.PiraliEndless?.state?.();
 if(!state?.active){hide();return;}
 if(!panel){
  panel=document.createElement('aside');panel.id='pirali-endless-hud';
  panel.setAttribute('aria-live','off');document.body.appendChild(panel);
 }
 panel.style.display='block';
 const t=labels[window.PiraliLanguage?.getLanguage?.()||'ka']||labels.ka;
 panel.textContent=state.cleared?t.home:t.wave+' '+state.wave+'/'+state.maxWaves+'  •  '+
  t.remaining+' '+state.remaining+'/'+state.waveTarget+'  •  '+
  t.kills+' '+state.kills;
}
document.addEventListener('pirali:languagechange',refresh);
window.PiraliEndlessHUD=Object.freeze({refresh,hide});
})();