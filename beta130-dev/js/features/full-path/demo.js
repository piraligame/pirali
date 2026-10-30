/* PIRALI Beta 1.30 — unlock Simona's full route after stage 10.
 * Free lifetime game achievement, no checkout, no payments, no ad unlock.
 * Requires a genuine profile that has reached the eleventh stage.
 */
(function(){
'use strict';
let pending=0,active=false,overlay=null;
const STRINGS={
 ka:{button:'სიმონას სრული გზა',title:'სიმონას სრული გზა',description:'ყველა 11 ტური • 7 გული • სანადირო თოფი',locked:'🔒 გაიხსნება მე-10 ტურის დასრულებისა და მე-11 ტურში გადასვლის შემდეგ.',open:'🏆 გზა გახსნილია — აირჩიე ნებისმიერი ტური!',choose:'აირჩიე ტური რუკაზე',back:'← მთავარ მენიუში',fair:'⚖ ამ რეჟიმში ქულები განახევრებულია (×0.5), რათა რეიტინგი სამართლიანი დარჩეს.',tryAgain:'ჯერ გააგრძელე სიმონას თავგადასავალი.'},
 en:{button:'Simona’s Full Route',title:'Simona’s Full Route',description:'All 11 stages • 7 hearts • hunting shotgun',locked:'🔒 Unlock by completing stage 10 and reaching stage 11.',open:'🏆 Route unlocked — choose any stage!',choose:'Choose a stage on the map',back:'← Main menu',fair:'⚖ This mode earns half points (×0.5) for fair rankings.',tryAgain:'Continue Simona’s adventure to unlock.'},
 ru:{button:'Весь путь Симоны',title:'Весь путь Симоны',description:'Все 11 уровней • 7 сердец • ружьё',locked:'🔒 Откроется после завершения 10-го уровня и перехода на 11-й.',open:'🏆 Путь открыт — выберите любой уровень!',choose:'Выберите уровень на карте',back:'← Главное меню',fair:'⚖ В этом режиме очки уменьшены вдвое (×0,5).',tryAgain:'Продолжайте путешествие Симоны.'},
 zh:{button:'西蒙娜的完整旅程',title:'西蒙娜的完整旅程',description:'全部11关 • 7颗心 • 猎枪',locked:'🔒 完成第10关并进入第11关后解锁。',open:'🏆 全部路线已解锁，可以选择任意关卡！',choose:'在地图上选择关卡',back:'← 主菜单',fair:'⚖ 此模式得分减半（×0.5），确保排行公平。',tryAgain:'请继续西蒙娜的旅程。'}
};
const lang=()=>window.PiraliLanguage?.getLanguage?.()||'ka';
const t=key=>(STRINGS[lang()]||STRINGS.ka)[key];
function unlocked(){
 // Use the persisted per-name achievement, not the Developer's blanket
 // highestReached()==11 shortcut, and never trust an old demo-unlock flag.
 const p=window.PiraliStats?.get?.();
 if(!p)return false;
 const completed10=Array.isArray(p.stageBestMs)&&p.stageBestMs[9]!==null&&p.stageBestMs[9]!==undefined;
 const reached11=Number.isInteger(p.maxReachedStage)&&p.maxReachedStage>=11;
 // A valid stage-11 checkpoint also proves the boundary was passed. DEV
 // checkpoints do not grant a special shortcut unless the profile exists.
 const checkpoint=window.PiraliVisualPreviewReadonly!==true&&window.PiraliCheckpoint?.get?.()?.level===11;
 return completed10||reached11||checkpoint;
}
function isActive(){return active;}
function clearActive(){active=false;pending=0;document.body.classList.remove('pirali-full-run');}
function consumeStart(){
 const stage=pending;pending=0;
 active=unlocked()&&Number.isInteger(stage)&&stage>=1&&stage<=11;
 document.body.classList.toggle('pirali-full-run',active);
 return active?{stage,shotgun:true,health:7}:null;
}
function close(){overlay?.remove();overlay=null;}
function chooseStage(n){
 if(!unlocked()||!Number.isInteger(n)||n<1||n>11)return false;
 pending=n;close();
 if(typeof startGame==='function'){startGame();return true;}
 pending=0;return false;
}
function mount(){
 const actions=document.querySelector('#screen .main-menu-panel .menu-actions');
 if(!actions)return;
 const records=actions.querySelector('.menu-records');
 if(!records)return;
 let full=actions.querySelector('.pirali-full-menu');
 if(!full){
  full=document.createElement('button');full.type='button';full.className='pirali-full-menu';
  full.onclick=open;actions.insertBefore(full,records);
 }
 let community=actions.querySelector('.pirali-community-menu');
 if(!community){
  community=document.createElement('a');
  community.className='pirali-community-menu';
  community.href='https://www.facebook.com/share/1LfEa8WSfU/';
  community.target='_blank';
  community.rel='noopener noreferrer';
  community.setAttribute('aria-label','Georgian Gamers Guild — Facebook');
  const img=document.createElement('img');
  img.src='assets/icons/ggg-community.webp';img.alt='Georgian Gamers Guild';img.width=36;img.height=36;
  const label=document.createElement('span');label.className='pirali-community-label';
  const arrow=document.createElement('span');arrow.className='pirali-community-external';
  arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
  community.append(img,label,arrow);
  actions.insertBefore(community,records);
 }
 if(full.nextElementSibling!==community)actions.insertBefore(community,full.nextSibling);
 refresh();
}
const COMMUNITY_LABELS={
 ka:'გეიმერების საზოგადოება',
 en:'Gaming Community',
 ru:'Сообщество игроков',
 zh:'玩家社区'
};
function refresh(){
 const btn=document.querySelector('#screen .main-menu-panel .pirali-full-menu');
 if(btn){
  const granted=unlocked();
  btn.textContent=(granted?'🗺️ ':'🔒 ')+t('button');
  btn.classList.toggle('is-locked',!granted);
  btn.setAttribute('aria-expanded',String(!!overlay));
  btn.setAttribute('aria-label',btn.textContent+(granted?'':'. '+t('locked')));
 }
 const label=document.querySelector('#screen .main-menu-panel .pirali-community-label');
 if(label)label.textContent=COMMUNITY_LABELS[lang()]||COMMUNITY_LABELS.ka;
}
function open(){
 close();
 overlay=document.createElement('div');overlay.id='pirali-full-overlay';
 overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
 const panel=document.createElement('section');panel.className='pirali-full-panel';
 const title=document.createElement('h2');title.textContent='🗺️ '+t('title');
 const sub=document.createElement('p');sub.textContent=t('description');
 panel.append(title,sub);
 if(!unlocked()){
  const locked=document.createElement('p');locked.className='pirali-full-warning';locked.textContent=t('locked');
  panel.append(locked);
 }else{
  const unlockedNote=document.createElement('p');unlockedNote.className='pirali-full-unlocked';unlockedNote.textContent=t('open');
  const fair=document.createElement('p');fair.className='pirali-full-fair';fair.textContent=t('fair');
  const heading=document.createElement('h3');heading.textContent=t('choose');
  panel.append(unlockedNote,fair,heading);
  const scroll=document.createElement('div');scroll.className='pirali-full-scroll';
  const art=document.createElement('div');art.className='pirali-full-art';
  const img=document.createElement('img');img.src='assets/maps/pirali-approved.webp?v=beta130';img.alt=t('title');img.draggable=false;art.append(img);
  for(const stop of window.PiraliStoryMap?.stops||[]){
   const pin=document.createElement('button');pin.type='button';pin.className='pirali-full-pin';pin.dataset.stage=String(stop.n);
   pin.style.left=stop.l+'%';pin.style.top=stop.t+'%';pin.style.width=stop.w+'%';
   pin.textContent=stop.n+' · '+(window.PiraliLanguage?.getLevelName?.(stop.n)||'ტური '+stop.n);
   pin.onclick=()=>chooseStage(stop.n);art.append(pin);
  }
  scroll.append(art);panel.append(scroll);
  requestAnimationFrame(()=>{const first=art.querySelector('[data-stage="1"]');if(first)scroll.scrollTop=Math.max(0,first.offsetTop-scroll.clientHeight*.55);});
 }
 const back=document.createElement('button');back.type='button';back.className='pirali-full-back';back.textContent=t('back');back.onclick=()=>{close();refresh();};
 panel.append(back);overlay.append(panel);document.body.append(overlay);
 overlay.onclick=e=>{if(e.target===overlay){close();refresh();}};
 refresh();back.focus();
}
const screen=document.getElementById('screen');
if(screen)new MutationObserver(mount).observe(screen,{childList:true,subtree:true});
document.addEventListener('pirali:languagechange',()=>{refresh();if(overlay)open();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay){e.preventDefault();close();refresh();}});
mount();
window.PiraliFullPath=Object.freeze({open,close,mount,refresh,unlocked,chooseStage,consumeStart,clearActive,isActive,pending:()=>pending,realPaymentEnabled:false});
})();