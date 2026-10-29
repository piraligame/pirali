/* PIRALI Beta 1.25: replay only previously reached stages, never ranked. */
(function(){
'use strict';
const langs={
 ka:{button:'↻ ტურის ხელახლა თამაში',heading:'ტურის გამეორება',note:'მხოლოდ გახსნილი ტურები • სავარჯიშო რეჟიმი • რეიტინგში არ ჩაიწერება',close:'← დაბრუნება',locked:'ჩაკეტილია'},
 en:{button:'↻ REPLAY STAGE',heading:'Stage replay',note:'Unlocked stages only • Practice mode • Not ranked',close:'← Back',locked:'Locked'},
 ru:{button:'↻ ПОВТОРИТЬ ТУР',heading:'Повтор тура',note:'Только открытые туры • Тренировка • Без рейтинга',close:'← Назад',locked:'Закрыто'},
 zh:{button:'↻ 重玩关卡',heading:'重玩关卡',note:'仅已解锁关卡 · 练习模式 · 不计入排行榜',close:'← 返回',locked:'未解锁'}
};
const tr=()=>langs[window.PiraliLanguage?.getLanguage?.()||'ka']||langs.ka;
let overlay=null;
function close(){if(overlay)overlay.style.display='none';}
function open(){
 if(!overlay){
  overlay=document.createElement('div');overlay.id='pirali-replay-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  document.body.appendChild(overlay);
 }
 overlay.replaceChildren();
 const card=document.createElement('section');card.className='pirali-replay-card';
 const title=document.createElement('h2');title.textContent=tr().heading;
 const note=document.createElement('p');note.textContent=tr().note;
 const grid=document.createElement('div');grid.className='pirali-replay-grid';
 const highest=Math.max(1,Math.min(11,window.PiraliStats?.highestReached?.()||1));
 for(let n=1;n<=11;n++){
  const btn=document.createElement('button');btn.type='button';btn.disabled=n>highest;
  btn.className='pirali-replay-stage';
  btn.textContent=String(n)+' · '+(window.PiraliLanguage?.getLevelName?.(n)||PIRALI_LEVELS[n-1]?.ka||n)+(n>highest?' 🔒':'');
  btn.setAttribute('aria-label',n>highest?tr().locked+': '+n:tr().button+': '+n);
  btn.addEventListener('click',()=>{
   if(n>highest||typeof startGame!=='function')return;
   close();startGame(null,n);
  });
  grid.appendChild(btn);
 }
 const back=document.createElement('button');back.type='button';back.className='pirali-replay-close';back.textContent=tr().close;back.addEventListener('click',close);
 card.append(title,note,grid,back);overlay.appendChild(card);overlay.style.display='flex';back.focus();
}
function mountMenu(parent){
 if(!parent||parent.querySelector('.menu-replay'))return;
 const btn=document.createElement('button');btn.type='button';btn.className='menu-replay';btn.textContent=tr().button;
 btn.addEventListener('click',open);parent.appendChild(btn);
}
document.addEventListener('pirali:languagechange',()=>{
 document.querySelectorAll('.menu-replay').forEach(btn=>btn.textContent=tr().button);
 if(overlay?.style.display==='flex')open();
});
window.PiraliReplay=Object.freeze({mountMenu,open,close});
})();