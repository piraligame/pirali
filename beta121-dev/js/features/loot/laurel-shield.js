/* PIRALI Beta 1.15: non-stackable, one-hit laurel ward. No combat balance alterations. */
(function(){
'use strict';
const texts={
 ka:{title:'🌿 დაფნის ფარი — 1 დარტყმა',pickup:'🌿 დაფნის ფარი მზადაა!',block:'🛡 დაფნის ფარმა დარტყმა აგარიდა!'},
 en:{title:'🌿 Laurel shield — one hit',pickup:'🌿 Laurel shield ready!',block:'🛡 Laurel shield blocked the hit!'},
 ru:{title:'🌿 Лавровый щит — один удар',pickup:'🌿 Лавровый щит готов!',block:'🛡 Лавровый щит защитил от удара!'},
 zh:{title:'🌿 月桂护盾 — 可抵挡一次攻击',pickup:'🌿 月桂护盾已就绪！',block:'🛡 月桂护盾挡住了一次攻击！'}
};
const t=()=>texts[window.PiraliLanguage?.getLanguage?.()]||texts.ka;
function onCollect(pk){
 if(typeof showFloatingText==='function')showFloatingText(pk.x,pk.y-32,t().pickup,'#b7ffa7');
}
function onBlock(){
 if(typeof showFloatingText==='function')showFloatingText(P.x,P.y-42,t().block,'#bcffc8');
 if(typeof spawnPart==='function')for(let k=0;k<18;k++){const a=k*Math.PI/9;spawnPart(P.x,P.y,Math.cos(a)*4,Math.sin(a)*4,17,'#7df5a2',2.5);}
 const f=document.getElementById('parry-flash');
 if(f){f.style.background='rgba(80,230,125,.23)';f.style.opacity='1';setTimeout(()=>{f.style.opacity='0';},160);}
}
window.PiraliLaurel=Object.freeze({onCollect,onBlock,title:()=>t().title,active:()=>inventory.laurelShield===1});
})();
