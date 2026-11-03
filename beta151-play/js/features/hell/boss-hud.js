/* PIRALI Alpha 0.16.1 — localized Devil health bar */
(function(){
'use strict';
const t=window.PiraliHellText;
const oldBossUI=updateBossUI;
updateBossUI=function(){oldBossUI();if(level===10&&boss?.alive)document.getElementById('boss-lbl').textContent='🔥 '+t('devil');};
document.addEventListener('pirali:languagechange',()=>{if(level===10&&boss?.alive)document.getElementById('boss-lbl').textContent='🔥 '+t('devil');});
})();
