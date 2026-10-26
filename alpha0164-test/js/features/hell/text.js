/* PIRALI Alpha 0.16.1 — four-language Hell labels */
(function(){
'use strict';
const words={
 ka:{gate:'ჯოჯოხეთის ცეცხლოვანი კარიბჭე',devil:'ეშმაკი — ჯოჯოხეთის მცველი',enter:'შედი კარიბჭეში',lifeDrop:'❤️ სიცოცხლე',heartDrop:'💝 ეშმაკის გული • 5000 ქულა',heartTaken:'💝 ჯოჯოხეთის გული • 5000 ქულა'},
 en:{gate:'Hell’s Flaming Gate',devil:'The Devil — Gatekeeper',enter:'Enter the gate',lifeDrop:'❤️ Health',heartDrop:'💝 Devil’s Heart • 5000 points',heartTaken:'💝 Hell Heart • 5000 points'},
 ru:{gate:'Огненные врата ада',devil:'Дьявол — страж врат',enter:'Войди во врата',lifeDrop:'❤️ Здоровье',heartDrop:'💝 Сердце дьявола • 5000 очков',heartTaken:'💝 Сердце ада • 5000 очков'},
 zh:{gate:'地狱烈焰之门',devil:'恶魔——守门者',enter:'进入大门',lifeDrop:'❤️ 生命',heartDrop:'💝 恶魔之心 • 5000分',heartTaken:'💝 地狱之心 • 5000分'}
};
const t=k=>(words[window.PiraliLanguage?.getLanguage?.()||'ka']||words.ka)[k];

window.PiraliHellText=t;
})();
