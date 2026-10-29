/* PIRALI Beta 1.29: preview-only route unlock. NO PAYMENT is collected. */
(function(){
'use strict';
let pending=0,active=false,overlay=null;
const dev=window.PiraliVisualPreviewReadonly===true;
const KEY='pirali_beta129_demo_fullpath_'+(dev?'dev':'play');
let demo=false;try{demo=localStorage.getItem(KEY)==='yes';}catch(e){}
const langs={
ka:['🗺️ გახსენი სიმონას სრული გზა · 0.50 ₾','სიმონას სრული გზა','ყველა 11 ტური • 7 გული • თოფი','₾ 0.50 — სამომავლო ფასი','დემო ვერსია: თანხა არ ჩამოგეჭრება. ნამდვილი შეძენა მხოლოდ Google Play Billing-ის ჩართვის შემდეგ იმუშავებს.','🔓 გააქტიურე უფასო დემო','⚖ ამ რეჟიმში ყველა ქულა განახევრდება (×0.5).','აირჩიე ტური რუკაზე','← მენიუში დაბრუნება','✨ სრული გზა · 7 გული · თოფი · 50% ქულა'],
en:['🗺️ Unlock Simona’s Full Route · ₾0.50','Simona’s Full Route','All 11 stages • 7 hearts • shotgun','₾0.50 — planned price','WEB DEMO: No money is charged. Real purchase will require verified Google Play Billing.','🔓 Activate free demo','⚖ Every score is halved (×0.5) in this mode.','Choose any stage on the map','← Back to menu','✨ Full route · 7 hearts · shotgun · 50% points'],
ru:['🗺️ Весь путь Симоны · 0,50 ₾','Весь путь Симоны','11 уровней • 7 сердец • ружьё','0,50 ₾ — будущая цена','ВЕБ-ДЕМО: деньги не списываются. Реальная покупка потребует Google Play Billing.','🔓 Открыть демо бесплатно','⚖ В этом режиме все очки уменьшены вдвое (×0,5).','Выберите уровень на карте','← В меню','✨ Весь путь · 7 сердец · ружьё · 50% очков'],
zh:['🗺️ 解锁西蒙娜完整旅程 · ₾0.50','西蒙娜完整旅程','全部11关 • 7颗心 • 猎枪','₾0.50 — 计划价格','仅为网页演示：不会扣费。正式购买需接入 Google Play Billing。','🔓 免费体验演示','⚖ 本模式所有分数减半 (×0.5)。','在地图中选择关卡','← 返回菜单','✨ 完整旅程 · 7颗心 · 猎枪 · 50%分数']};
const locale=()=>langs[window.PiraliLanguage?.getLanguage?.()||'ka']||langs.ka;
const allowed=()=>window.PiraliSeasonReleaseEnabled!==true;
const unlocked=()=>allowed()&&demo;
const activeRun=()=>active;
function startChoice(n){
 if(!unlocked()||!Number.isInteger(n)||n<1||n>11)return false;
 pending=n;close();
 if(typeof startGame==='function'){startGame();return true}
 return false;
}
function consumeStart(){
 const stage=pending;pending=0;
 active=unlocked()&&stage>=1&&stage<=11;
 document.body.classList.toggle('pirali-full-run',active);
 return active?{stage,shotgun:true,health:7}:null;
}
function clearActive(){active=false;pending=0;document.body.classList.remove('pirali-full-run')}
function close(){overlay?.remove();overlay=null}
function open(){
 close();
 const w=locale();
 overlay=document.createElement('div');overlay.id='pirali-full-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
 const panel=document.createElement('section');panel.className='pirali-full-panel';
 const title=document.createElement('h2');title.textContent=w[1];
 const desc=document.createElement('p');desc.textContent=w[2];
 const price=document.createElement('strong');price.className='pirali-full-price';price.textContent=w[3];
 const fair=document.createElement('p');fair.className='pirali-full-fair';fair.textContent=w[6];
 panel.append(title,desc,price,fair);
 if(!unlocked()){
  const warning=document.createElement('p');warning.className='pirali-full-warning';warning.textContent=w[4];
  const b=document.createElement('button');b.className='pirali-full-activate';b.type='button';b.textContent=w[5];b.disabled=!allowed();
  b.onclick=()=>{
   try{localStorage.setItem(KEY,'yes');demo=true;open()}catch(e){warning.textContent=w[4]+' · localStorage unavailable'}
  };
  panel.append(warning,b);
 }else{
  const head=document.createElement('h3');head.textContent=w[7];panel.append(head);
  const scroll=document.createElement('div');scroll.className='pirali-full-scroll';
  const art=document.createElement('div');art.className='pirali-full-art';
  const img=document.createElement('img');img.src='assets/maps/pirali-approved.webp?v=beta129-demo';img.alt=w[1];img.draggable=false;art.append(img);
  for(const stop of window.PiraliStoryMap?.stops||[]){
   const pin=document.createElement('button');pin.type='button';pin.className='pirali-full-pin';pin.dataset.stage=stop.n;
   pin.style.left=stop.l+'%';pin.style.top=stop.t+'%';pin.style.width=stop.w+'%';
   pin.textContent=stop.n+' · '+(window.PiraliLanguage?.getLevelName?.(stop.n)||('ტური '+stop.n));
   pin.onclick=()=>startChoice(stop.n);art.append(pin);
  }
  scroll.append(art);panel.append(scroll);
  requestAnimationFrame(()=>{const first=art.querySelector('[data-stage="1"]');if(first)scroll.scrollTop=Math.max(0,first.offsetTop-scroll.clientHeight*.55)});
 }
 const back=document.createElement('button');back.type='button';back.className='pirali-full-back';back.textContent=w[8];back.onclick=close;panel.append(back);
 overlay.append(panel);document.body.append(overlay);
 overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
 back.focus();
}
function mount(){
 const card=document.querySelector('#screen .main-menu-panel');
 if(!card||document.querySelector('#screen.gameover-screen,#screen.victory-screen')||card.querySelector('.pirali-full-menu'))return;
 const btn=document.createElement('button');btn.type='button';btn.className='pirali-full-menu';btn.textContent=locale()[0];btn.onclick=open;
 const footer=card.querySelector('.menu-version');if(footer)footer.insertAdjacentElement('afterend',btn);else card.append(btn);
}
const screen=document.getElementById('screen');if(screen)new MutationObserver(mount).observe(screen,{childList:true});
document.addEventListener('pirali:languagechange',()=>{const btn=document.querySelector('.pirali-full-menu');if(btn)btn.textContent=locale()[0];if(overlay)open()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay){e.preventDefault();close()}});
mount();
window.PiraliFullPath=Object.freeze({open,close,mount,unlocked,activateDemo:()=>{if(!allowed())return false;try{localStorage.setItem(KEY,'yes');demo=true;return true}catch{return false}},startChoice,consumeStart,clearActive,isActive:activeRun,pending:()=>pending,priceGEL:0.5,realPaymentEnabled:false});
})();