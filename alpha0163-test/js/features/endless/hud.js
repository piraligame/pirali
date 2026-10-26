/* PIRALI 0.16.3 — four-language endless wave and bonus score display. */
(function(){
'use strict';
const words={
 ka:{title:'♾ სიმონა უსასრულოდ',wave:'ტალღა',kills:'მოკლული',cap:'მტერი',points:'ყოველ მტერზე +200'},
 en:{title:'♾ Simona Forever',wave:'Wave',kills:'Kills',cap:'Enemies',points:'+200 per enemy'},
 ru:{title:'♾ Симона бесконечно',wave:'Волна',kills:'Убито',cap:'Врагов',points:'+200 за врага'},
 zh:{title:'♾ 西蒙娜无尽之战',wave:'波次',kills:'击败',cap:'敌人',points:'每敌人 +200分'}
};
let n=null;
function refresh(){
 const active=level===11&&running&&!P.dead;
 if(!n){
  n=document.createElement('aside');n.id='pirali-endless-hud';n.setAttribute('aria-live','off');
  document.body.appendChild(n);
 }
 n.style.display=active?'block':'none';
 const progress=document.getElementById('progress-bar');
 if(progress)progress.style.display=active?'none':'';
 if(!active)return;
 const k=words[window.PiraliLanguage?.getLanguage?.()||'ka']||words.ka;
 const state=window.PiraliEndless?.state?.();
 if(!state)return;
 n.textContent=k.title+'  •  '+k.wave+' '+state.wave+'  •  '+k.kills+' '+state.kills+
  '  •  '+k.cap+' '+state.onScreen+'/'+state.cap+'  •  '+k.points;
}
document.addEventListener('pirali:languagechange',refresh);
window.PiraliEndlessHUD=Object.freeze({refresh});
})();
