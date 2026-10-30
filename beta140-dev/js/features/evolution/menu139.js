/* PIRALI 1.40: face-first menu, one compact Collection menu for stories and cosmetic rewards.
 * No data is sent to Firebase. Mobile fit recalculates at language changes.
 */
(function(){
'use strict';
const lang=()=>window.PiraliLanguage?.getLanguage?.()||'ka';
const tr=a=>a[{ka:0,en:1,ru:2,zh:3}[lang()]||0];
const game=()=>window.PiraliEvolution139;
let dialog=null;
function el(tag,cl,txt){const n=document.createElement(tag);if(cl)n.className=cl;if(txt!==undefined)n.textContent=txt;return n}
function open(){
 if(dialog){dialog.remove();dialog=null;return}
 dialog=el('div','pirali139-backdrop');dialog.id='pirali139-collection';
 const panel=el('section','pirali139-collection-panel'),header=el('div','pirali139-header');
 const heading=el('h2','',tr(['📚 ფირალის კოლექცია','📚 PIRALI COLLECTION','📚 КОЛЛЕКЦИЯ ПИРАЛИ','📚 收藏']));
 const exit=el('button','','✕');exit.onclick=()=>{dialog.remove();dialog=null};
 header.append(heading,exit);
 const tabs=el('div','pirali139-tabs'),body=el('div','pirali139-body');
 let selected='stories';
 function draw(){
  body.replaceChildren();
  const api=game(),profile=api?.getProfile();if(!api||!profile)return;
  if(selected==='stories'){
   const goals=api.names();
   for(let i=1;i<=11;i++){
    const found=profile.found.includes(i);
    const row=el('article','pirali139-letter');
    const item=el('strong','',i+'. '+tr(goals[i])+(found?' ✓':' 🔒'));
    const para=el('p','',found?api.chapter(i):tr(['ჯერ არ არის ნაპოვნი','Not discovered yet','Ещё не найдено','尚未发现']));
    row.append(item,para);
    if(found)row.append(el('small','',tr(['გამოგონილი სიუჟეტური ჩანაწერი','Fictional story entry','Вымышленная сюжетная запись','虚构剧情记录'])));
    body.append(row);
   }
  }else{
   for(const [key,title] of Object.entries(api.outfits)){
    const unlocked=profile.unlocked.includes(key);
    const btn=el('button','pirali139-outfit',tr(title)+(profile.outfit===key?' ✓':unlocked?'':' 🔒'));
    btn.disabled=!unlocked;btn.onclick=()=>{api.setOutfit(key);draw()};
    body.append(btn);
   }
   body.append(el('p','',tr(['3, 7 და 10 წერილის პოვნისას ახალი მოსასხამები იხსნება. ისინი მხოლოდ ვიზუალურია.','Find 3, 7 and 10 letters to unlock cosmetic cloaks.','Найди 3, 7 и 10 писем, чтобы открыть декоративные плащи.','找到3、7和10封信解锁装饰斗篷。'])));
  }
 }
 for(const [id,title] of [['stories',tr(['ისტორიები','STORIES','ИСТОРИИ','故事'])],['outfits',tr(['გარეგნობა','OUTFITS','ОБЛИК','外观'])]]){
  const b=el('button','',title);b.onclick=()=>{selected=id;draw()};tabs.append(b);
 }
 panel.append(header,tabs,body);dialog.append(panel);document.body.append(dialog);
 dialog.onclick=e=>{if(e.target===dialog){dialog.remove();dialog=null}};
 draw();
}
function mount(){
 const actions=document.querySelector('#screen .main-menu-panel .menu-actions');
 if(!actions||actions.querySelector('.pirali139-collection-link'))return;
 const button=el('button','pirali139-collection-link',tr(['📚 კოლექცია','📚 COLLECTION','📚 КОЛЛЕКЦИЯ','📚 收藏']));
 button.type='button';button.onclick=open;
 // One compact entry, rather than seven extra menu buttons.
 const community=actions.querySelector('.pirali-community-menu');
 if(community)community.after(button);
 else actions.insertBefore(button,actions.querySelector('.menu-records'));
}
function fit(){
 const screen=document.getElementById('screen'),panel=screen?.querySelector('.main-menu-panel');
 if(!screen||!panel||!screen.classList.contains('pirali-menu-135'))return;
 screen.classList.add('pirali139-compact');
 mount();
 const viewport=screen.clientHeight||window.innerHeight;
 // Use available space below the menu to reveal Simona's complete hooded face.
 // On short displays, cap displacement before the language selector leaves the viewport.
 const portraitTarget=Math.max(400,Math.min(505,Math.round(viewport*.56)));
 const bottomReserve=Math.max(14,Math.min(27,Math.round(viewport*.025)));
 screen.style.setProperty('padding-top',portraitTarget+'px','important');
 const height=panel.getBoundingClientRect().height;
 const freeTop=viewport-height-bottomReserve;
 const top=Math.max(180,Math.min(portraitTarget,freeTop));
 screen.style.setProperty('padding-top',Math.round(top)+'px','important');
}
function observe(){
 const screen=document.getElementById('screen');if(!screen)return;
 const observer=new MutationObserver(()=>{
  if(screen.querySelector('.main-menu-panel'))requestAnimationFrame(fit);
  if(dialog&&!document.body.contains(dialog))dialog=null;
 });
 observer.observe(screen,{childList:true});
 document.addEventListener('pirali:languagechange',()=>{
  const button=document.querySelector('.pirali139-collection-link');
  if(button)button.textContent=tr(['📚 კოლექცია','📚 COLLECTION','📚 КОЛЛЕКЦИЯ','📚 收藏']);
  requestAnimationFrame(fit);
 });
 window.addEventListener('resize',()=>requestAnimationFrame(fit),{passive:true});
 requestAnimationFrame(fit);
}
observe();
window.PiraliMenu139=Object.freeze({fit,open});
})();