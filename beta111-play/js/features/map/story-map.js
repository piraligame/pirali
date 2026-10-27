/* PIRALI BETA 1.11.1 — map follows the main game's selected language. */
(function(){
'use strict';
const STOPS=[
 {n:1,l:48.6,t:97.5,w:29},{n:2,l:72,t:81,w:29},
 {n:3,l:33,t:73.3,w:31},{n:4,l:24,t:65.2,w:28},
 {n:5,l:75,t:62.8,w:23},{n:6,l:56,t:55,w:23},
 {n:7,l:19.6,t:47.3,w:24},{n:8,l:39.5,t:34.5,w:34},
 {n:9,l:79,t:46.8,w:29},{n:10,l:77.2,t:26.9,w:35},
 {n:11,l:74.2,t:12.7,w:33}
];
const WORDS={
 ka:{open:'🗺️ ფირალის რუკა',title:'ფირალის თავგადასავლის რუკა',subtitle:'სიმონას გზა ჩოხატაურიდან სახლამდე',back:'← უკან',completed:'გავლილი',current:'მიმდინარე',locked:'შემდეგი',max:'მაქსიმალური ქულა: 7 000'},
 en:{open:'🗺️ Campaign Map',title:'PIRALI — Adventure Map',subtitle:'Simona’s journey from Chokhatauri to home',back:'← Back',completed:'Completed',current:'Current',locked:'Ahead',max:'Maximum score: 7,000'},
 ru:{open:'🗺️ Карта игры',title:'ПИРАЛИ — карта приключения',subtitle:'Путь Симоны от Чохатаури до дома',back:'← Назад',completed:'Пройдено',current:'Текущий',locked:'Впереди',max:'Максимум очков: 7 000'},
 zh:{open:'🗺️ 冒险地图',title:'PIRALI 冒险地图',subtitle:'西蒙娜从乔哈陶里到家乡的旅程',back:'← 返回',completed:'已完成',current:'当前',locked:'未解锁',max:'最高分：7,000'}
};
const getLang=()=>window.PiraliLanguage?.getLanguage?.()||'ka';
const word=()=>WORDS[getLang()]||WORDS.ka;
const discovered=()=>Math.max(1,Math.min(11,Math.max(Number(window.PiraliCheckpoint?.get?.()?.level||1),Number(typeof level==='number'?level:1))));
let overlay=null,button=null;
function label(n){return window.PiraliLanguage?.getLevelName?.(n)||PIRALI_LEVELS[n-1]?.ka||'';}
function render(){
 const w=word();
 if(button)button.textContent=w.open;
 if(!overlay)return;
 overlay.querySelector('.story-map-title').textContent=w.title;
 overlay.querySelector('.story-map-subtitle').textContent=w.subtitle;
 overlay.querySelector('.story-map-back').textContent=w.back;
 overlay.querySelector('.story-map-max').textContent=w.max;
 const current=discovered();
 for(const element of overlay.querySelectorAll('.story-map-stage')){
  const n=Number(element.dataset.stage);
  element.classList.toggle('complete',n<current);
  element.classList.toggle('current',n===current);
  element.classList.toggle('locked',n>current);
  const state=n<current?w.completed:n===current?w.current:w.locked;
  const name=element.querySelector('.story-map-name');
  name.textContent=label(n);
  element.title=w.title+' — '+n+': '+label(n)+' · '+state;
  element.setAttribute('aria-label',element.title);
 }
}
function close(){if(!overlay)return;overlay.remove();overlay=null;button?.focus();}
function open(){
 if(overlay){render();return;}
 overlay=document.createElement('div');
 overlay.id='pirali-story-map';
 overlay.setAttribute('role','dialog');
 overlay.setAttribute('aria-modal','true');
 overlay.setAttribute('aria-label','PIRALI Campaign Map');
 overlay.innerHTML='<section class="story-map-shell">'+
  '<header class="story-map-head"><button type="button" class="story-map-back"></button>'+
  '<div class="story-map-title-wrap"><h2 class="story-map-title"></h2><p class="story-map-subtitle"></p></div></header>'+
  '<div class="story-map-scroll" tabindex="0" aria-label="Route map">'+
  '<div class="story-map-art"><img src="assets/maps/pirali-approved.webp?v=beta110-hd-20261027" alt="" draggable="false"></div></div>'+
  '<footer><span class="story-map-max"></span></footer></section>';
 const art=overlay.querySelector('.story-map-art');
 for(const item of STOPS){
  const e=document.createElement('div');
  e.className='story-map-stage';
  e.dataset.stage=String(item.n);
  e.style.left=item.l+'%';e.style.top=item.t+'%';e.style.width=item.w+'%';
  const name=document.createElement('span');name.className='story-map-name';e.appendChild(name);
  art.appendChild(e);
 }
 overlay.querySelector('.story-map-back').addEventListener('click',close);
 overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
 document.body.appendChild(overlay);
 render();
 // Begin with the relevant current stage visible instead of an empty top area.
 requestAnimationFrame(()=>{
  const scroll=overlay?.querySelector('.story-map-scroll');
  const stage=overlay?.querySelector('.story-map-stage.current');
  if(scroll&&stage){
   scroll.scrollTop=Math.max(0,stage.offsetTop+65-scroll.clientHeight*.58);
  }
 });
 overlay.querySelector('.story-map-back').focus();
}
function mount(){
 const actions=document.querySelector('#screen .main-menu-panel .menu-actions');
 if(!actions)return;
 if(button&&button.isConnected)return;
 button=document.createElement('button');
 button.type='button';button.className='story-map-open';
 button.addEventListener('click',open);
 actions.insertBefore(button,actions.firstChild);
 render();
}
document.addEventListener('pirali:languagechange',render);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay){e.preventDefault();close();}});
const screen=document.getElementById('screen');
if(screen)new MutationObserver(mount).observe(screen,{childList:true,subtree:true});
mount();
window.PiraliStoryMap=Object.freeze({open,close,mount,refresh:render,stops:STOPS});
})();