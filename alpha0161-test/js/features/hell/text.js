/* PIRALI Alpha 0.16.1 — four-language Hell labels */
(function(){
'use strict';
const words={
 ka:{gate:'ცეცხლიანი კარიბჭე',devil:'ეშმაკი — ჯოჯოხეთის მცველი',enter:'შედი კარიბჭეში'},
 en:{gate:'Gate of Fire',devil:'The Devil — Gatekeeper',enter:'Enter the gate'},
 ru:{gate:'Огненные врата',devil:'Дьявол — страж врат',enter:'Войди во врата'},
 zh:{gate:'烈焰之门',devil:'恶魔——守门者',enter:'进入大门'}
};
const t=k=>(words[window.PiraliLanguage?.getLanguage?.()||'ka']||words.ka)[k];

window.PiraliHellText=t;
})();
