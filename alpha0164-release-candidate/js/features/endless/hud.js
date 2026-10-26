/* PIRALI 0.16.4f — concise stage-11-only status. The ordinary level badge owns stage names. */
(function(){
'use strict';
const labels={
 ka:{wave:'ტალღა',kills:'მოკლული',live:'მტერი'},
 en:{wave:'Wave',kills:'Kills',live:'Enemies'},
 ru:{wave:'Волна',kills:'Убито',live:'Врагов'},
 zh:{wave:'波次',kills:'击败',live:'敌人'}
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
 const labelsForLanguage=labels[window.PiraliLanguage?.getLanguage?.()||'ka']||labels.ka;
 // Stage name is shown once in the existing #level-badge (all 11 stages).
 // Don't show score bonus help text in the combat HUD.
 panel.textContent=labelsForLanguage.wave+' '+state.wave+'  •  '+
  labelsForLanguage.kills+' '+state.kills+'  •  '+
  labelsForLanguage.live+' '+state.onScreen+'/'+Math.min(20,state.cap);
}
document.addEventListener('pirali:languagechange',refresh);
window.PiraliEndlessHUD=Object.freeze({refresh,hide});
})();
