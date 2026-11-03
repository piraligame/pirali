/* PIRALI Alpha 0.16.1 — four-language Hell labels */
(function(){
'use strict';
const words={
 ka:{gate:'ჯოჯოხეთის ცეცხლოვანი კარიბჭე',devil:'ეშმაკი — ჯოჯოხეთის მცველი',enter:'გადი კარიბჭიდან',lifeDrop:'❤️ სიცოცხლე',coinDrop:'🪙 ეშმაკის მონეტები • 250 ქულა',coinTaken:'🪙 ოქროს მონეტები • 250 ქულა'},
 en:{gate:'Hell’s Flaming Gate',devil:'The Devil — Gatekeeper',enter:'Exit through the gate',lifeDrop:'❤️ Health',coinDrop:'🪙 Devil’s Coins • 250 points',coinTaken:'🪙 Gold Coins • 250 points'},
 ru:{gate:'Огненные врата ада',devil:'Дьявол — страж врат',enter:'Выйди через врата',lifeDrop:'❤️ Здоровье',coinDrop:'🪙 Монеты дьявола • 250 очков',coinTaken:'🪙 Золотые монеты • 250 очков'},
 zh:{gate:'地狱烈焰之门',devil:'恶魔——守门者',enter:'穿过大门离开',lifeDrop:'❤️ 生命',coinDrop:'🪙 恶魔金币 • 250分',coinTaken:'🪙 金币 • 250分'}
};
const t=k=>(words[window.PiraliLanguage?.getLanguage?.()||'ka']||words.ka)[k];

window.PiraliHellText=t;
})();
