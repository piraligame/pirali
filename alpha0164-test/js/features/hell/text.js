/* PIRALI Alpha 0.16.1 — four-language Hell labels */
(function(){
'use strict';
const words={
 ka:{gate:'ჯოჯოხეთის ცეცხლოვანი კარიბჭე',devil:'ეშმაკი — ჯოჯოხეთის მცველი',enter:'შედი კარიბჭეში',lifeDrop:'❤️ სიცოცხლე',heartDrop:'💝 ეშმაკის გული • 250 ქულა',heartTaken:'💝 ჯოჯოხეთის გული • 250 ქულა'},
 en:{gate:'Hell’s Flaming Gate',devil:'The Devil — Gatekeeper',enter:'Enter the gate',lifeDrop:'❤️ Health',heartDrop:'💝 Devil’s Heart • 250 points',heartTaken:'💝 Hell Heart • 250 points'},
 ru:{gate:'Огненные врата ада',devil:'Дьявол — страж врат',enter:'Войди во врата',lifeDrop:'❤️ Здоровье',heartDrop:'💝 Сердце дьявола • 250 очков',heartTaken:'💝 Сердце ада • 250 очков'},
 zh:{gate:'地狱烈焰之门',devil:'恶魔——守门者',enter:'进入大门',lifeDrop:'❤️ 生命',heartDrop:'💝 恶魔之心 • 250分',heartTaken:'💝 地狱之心 • 250分'}
};
const t=k=>(words[window.PiraliLanguage?.getLanguage?.()||'ka']||words.ka)[k];

window.PiraliHellText=t;
})();
