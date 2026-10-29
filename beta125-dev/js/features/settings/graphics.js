/* PIRALI Beta 1.25: configurable draw effects only; physics/balance untouched. */
(function(){
'use strict';
const KEY='pirali_beta125_graphics_quality',allowed=new Set(['low','medium','high']);
const lang={
 ka:{title:'🎨 გრაფიკა',low:'დაბალი',medium:'საშუალო',high:'მაღალი'},
 en:{title:'🎨 GRAPHICS',low:'Low',medium:'Medium',high:'High'},
 ru:{title:'🎨 ГРАФИКА',low:'Низкая',medium:'Средняя',high:'Высокая'},
 zh:{title:'🎨 画质',low:'低',medium:'中',high:'高'}
};
const txt=()=>lang[window.PiraliLanguage?.getLanguage?.()||'ka']||lang.ka;
let mode='high';try{const saved=localStorage.getItem(KEY);if(allowed.has(saved))mode=saved;}catch(e){}
function setMode(next){if(!allowed.has(next))return false;mode=next;
 try{localStorage.setItem(KEY,mode);}catch(e){}
 document.documentElement.dataset.piraliGraphics=mode;return true;
}
setMode(mode);
function drawEffects(frame){return mode==='high'||mode==='medium'?true:frame%3===0;}
function showWeather(frame){return mode==='high'||mode==='medium'?true:frame%4===0;}
function mountMenu(parent){
 if(!parent||parent.querySelector('.menu-graphics'))return;
 const row=document.createElement('label');row.className='menu-graphics';
 const title=document.createElement('span');title.textContent=txt().title;
 const select=document.createElement('select');select.setAttribute('aria-label',txt().title);
 for(const key of ['low','medium','high']){
  const option=document.createElement('option');option.value=key;option.textContent=txt()[key];select.appendChild(option);
 }
 select.value=mode;
 select.addEventListener('change',()=>setMode(select.value));
 row.append(title,select);parent.appendChild(row);
 document.addEventListener('pirali:languagechange',()=>{
  title.textContent=txt().title;select.setAttribute('aria-label',txt().title);
  Array.from(select.options).forEach(op=>op.textContent=txt()[op.value]);
 });
}
window.PiraliGraphics=Object.freeze({setMode,mode:()=>mode,mountMenu,drawEffects,showWeather});
})();