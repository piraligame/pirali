/* Beta-only convenience: jump to any level to verify visuals/loot.
 * Beta Firebase scoring stays read-only, and Alpha never loads this file.
 */
const PiraliBetaLevels=(function(){
 'use strict';
 const t={
  ka:{title:'🧪 ტურის სწრაფი ტესტი',hint:'აირჩიე სასურველი ტური. ეს ბეტა ტესტია — ქულა ონლაინ რეიტინგში არ ჩაიწერება.',start:'გაშვება',cancel:'დახურვა',button:'🧪 ტურის ტესტირება'},
  en:{title:'🧪 Test any level',hint:'Choose a stage to preview. Beta scores are not submitted online.',start:'START',cancel:'CLOSE',button:'🧪 TEST A LEVEL'},
  ru:{title:'🧪 Проверка уровня',hint:'Выберите уровень. Результаты бета-теста не отправляются в рейтинг.',start:'ИГРАТЬ',cancel:'ЗАКРЫТЬ',button:'🧪 ТЕСТ УРОВНЯ'},
  zh:{title:'🧪 关卡测试',hint:'选择任意关卡。测试分数不会上传在线排行榜。',start:'开始',cancel:'关闭',button:'🧪 测试关卡'}
 };
 const current=()=>window.PiraliLanguage?.getLanguage()||'ka';
 const label=k=>(t[current()]||t.ka)[k];
 let overlay=null;
 function close(){if(overlay)overlay.hidden=true;}
 function update(){
   const open=document.getElementById('beta-stage-open');if(open)open.textContent=label('button');
   if(!overlay)return;
   for(const [id,key] of [['beta-stage-title','title'],['beta-stage-hint','hint'],['beta-stage-start','start'],['beta-stage-cancel','cancel']]){
     const x=document.getElementById(id);if(x)x.textContent=label(key);
   }
   const select=document.getElementById('beta-stage-choice'),old=select?.value;
   if(select){
     select.replaceChildren();
     for(let n=1;n<=5;n++){
       const o=document.createElement('option');o.value=n;o.textContent=n+' — '+(PiraliLanguage?.getLevelName(n)||PIRALI_LEVELS[n-1].ka);
       select.appendChild(o);
     }
     select.value=old||'1';
   }
 }
 function show(){
   if(!overlay){
     overlay=document.createElement('div');overlay.id='beta-stage-overlay';overlay.hidden=true;
     overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
     const box=document.createElement('section');box.className='beta-stage-card';
     const title=document.createElement('h2');title.id='beta-stage-title';
     const hint=document.createElement('p');hint.id='beta-stage-hint';
     const select=document.createElement('select');select.id='beta-stage-choice';select.setAttribute('aria-label','Choose beta stage');
     const buttons=document.createElement('div');buttons.className='beta-stage-actions';
     const cancel=document.createElement('button');cancel.id='beta-stage-cancel';cancel.type='button';cancel.addEventListener('click',close);
     const start=document.createElement('button');start.id='beta-stage-start';start.type='button';
     start.addEventListener('click',()=>{
       const n=Number(document.getElementById('beta-stage-choice').value);
       if(!Number.isInteger(n)||n<1||n>5)return;
       close();
       if(typeof bgmStop==='function')bgmStop();
       const cp=n===1?null:{version:1,level:n,health:5,ammo:8,score:0,inventory:{herbs:0,medals:0},savedAt:Date.now()};
       startGame(cp); // practice checkpoint run; Firebase leaderboard writes disabled independently.
     });
     buttons.append(cancel,start);box.append(title,hint,select,buttons);overlay.append(box);document.body.appendChild(overlay);
   }
   update();overlay.hidden=false;document.getElementById('beta-stage-choice')?.focus();
 }
 function mount(card){
   if(!card||card.querySelector('#beta-stage-open'))return;
   const btn=document.createElement('button');btn.id='beta-stage-open';btn.type='button';
   btn.textContent=label('button');btn.addEventListener('click',show);
   const version=card.querySelector('.menu-version');
   if(version)card.insertBefore(btn,version);
   else card.appendChild(btn);
   update();
 }
 document.addEventListener('pirali:languagechange',update);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay&&!overlay.hidden){e.stopImmediatePropagation();e.preventDefault();close()}},true);
 return Object.freeze({mount,show,close,visible:()=>!!overlay&&!overlay.hidden});
})();
