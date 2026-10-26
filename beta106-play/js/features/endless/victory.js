/* PIRALI BETA 1.05 — final Georgian wooden-house victory in all four locales. */
(function(){
'use strict';
const messages={
 ka:{title:'სიმონამ გაიმარჯვა!',congrats:'გილოცავთ! სიმონამ ხუთივე ტალღა დაძლია!',detail:'საქართველოს გამარჯვება • 75 მტერი დამარცხებულია'},
 en:{title:'Simona is victorious!',congrats:'Congratulations! Simona overcame all five waves!',detail:'Victory for Georgia • 75 enemies defeated'},
 ru:{title:'Симона победил!',congrats:'Поздравляем! Симона преодолел все пять волн!',detail:'Победа Грузии • 75 врагов повержено'},
 zh:{title:'西蒙娜获胜！',congrats:'恭喜！西蒙娜通过了全部五波敌人！',detail:'格鲁吉亚的胜利 • 击败75名敌人'}
};
function flag(){
 const small=[[64,41],[235,41],[64,159],[235,159]].map(([x,y])=>
  '<path fill="#e11d2e" d="M'+(x-5)+' '+(y-18)+'h10v13h13v10h-13v13h-10v-13h-13v-10h13z"/>').join('');
 return '<div class="pirali-georgia-flag" role="img" aria-label="საქართველოს დროშა">'+
  '<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
  '<rect width="300" height="200" fill="white"/>'+
  '<path fill="#e11d2e" d="M132 0h36v200h-36zM0 82h300v36H0z"/>'+small+
  '</svg></div>';
}
function render(){
 if(!window.PiraliEndless?.state?.().completed)return;
 const screen=document.getElementById('screen');
 if(!screen?.classList.contains('victory-screen'))return;
 const t=messages[window.PiraliLanguage?.getLanguage?.()||'ka']||messages.ka;
 const headings=screen.querySelectorAll('h1');
 if(headings[0]){headings[0].innerHTML=flag();headings[0].classList.add('pirali-flag-heading');}
 if(headings[1]){headings[1].textContent=t.title;headings[1].classList.add('pirali-final-title');}
 const sub=screen.querySelector('.tsub');if(sub)sub.textContent=t.congrats;
 let detail=screen.querySelector('.pirali-final-detail');
 if(!detail){detail=document.createElement('div');detail.className='pirali-final-detail';sub?.after(detail);}
 detail.textContent=t.detail;
 if(!screen.querySelector('.pirali-confetti')){
  const conf=document.createElement('div');conf.className='pirali-confetti';conf.setAttribute('aria-hidden','true');
  for(let i=0;i<16;i++){
   const bit=document.createElement('span');
   bit.style.left=(4+i*6)+'%';bit.style.animationDelay=(i%8)*-.25+'s';
   conf.appendChild(bit);
  }
  screen.appendChild(conf);
 }
}
const original=showVictory;
showVictory=function(...args){const result=original.apply(this,args);render();return result;};
document.addEventListener('pirali:languagechange',render);
window.PiraliFinalVictory=Object.freeze({render});
})();