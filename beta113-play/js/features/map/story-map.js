/* PIRALI BETA 1.12 — progressive map journal with locked-stage notice, no redundant back button. */
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
 ka:{
  open:'🗺️ ფირალის რუკა',title:'ფირალის თავგადასავლის რუკა',
  subtitle:'სიმონას გზა ჩოხატაურიდან სახლამდე',back:'← უკან',
  completed:'გავლილი',current:'მიმდინარე',locked:'შემდეგი',max:'მაქსიმალური ქულა: 7 000',
  tour:'ტური',summary:'თავგადასავალი',goal:'მიზანი',reward:'ჯილდო',closeDetails:'← ჩოხატაური',
  infoOnly:'რუკა საინფორმაციოა — აქედან ტურის დაწყება ან გამოტოვება შეუძლებელია.',
  lockedDetails:'ხელმიუწვდომელია — სიმონა ჯერ არ არის აქ ნამყოფი!',unavailable:'ხელმიუწვდომელია',
  chapters:[
   'სიმონას მოგზაურობა ჩოხატაურიდან იწყება. წინ პირველი მტრები და ტყის გზა ელის.',
   'სიმონა გოგოლესუბნის გავლით აგრძელებს გზას და მტრების წინააღმდეგ იბრძვის.',
   'გზა შუა განახლებაზე გადის, სადაც მტრის ახალი რაზმებია.',
   'სიმონა განახლების გზაზე აგრძელებს ბრძოლას და წინ მიიწევს.',
   'სამებისკენ მიმავალი გზა შემდეგი სახიფათო მონაკვეთია.',
   'უდაბნოს გზაზე საჭიროა სიმტკიცე, ტყვიების შეგროვება და ფრთხილი ბრძოლა.',
   'უდაბნოს ეკლესიასთან სიმონა გენერალსა და ბატონს უპირისპირდება.',
   'უსასრულობის გზაზე ბრძოლაში ორი გენერალი მონაწილეობს.',
   'სიმონა ალყაშია: გზა მტრის მსროლელებმა ჩაკეტეს.',
   'სიმონას ჯოჯოხეთში ცეცხლოვანი კარიბჭე და ეშმაკი ელოდება.',
   'სიმონა სახლისკენ იბრძვის: ხუთი ტალღის დაძლევის შემდეგ გზის ბოლოა.'
  ],
  goals:{
   route:'მტრები დაამარცხე და მიაღწიე ტურის გასასვლელს.',
   church:'დაამარცხე გენერალი და ბატონი, აიღე დიდი გული და შედი ეკლესიაში.',
   generals:'დაამარცხე ორივე გენერალი და გააგრძელე გზა.',
   siege:'გაანადგურე ალყაში მოქცეული 15 მსროლელი და გაარღვიე ალყა.',
   hell:'დაამარცხე ეშმაკი, აიღე დიდი გული და გადადი ცეცხლოვან კარიბჭეში.',
   home:'გაუძელი მტრების ხუთ ტალღას და გამარჯვებისთვის შედი სახლში.'
  },
  rewards:{
   drops:'მტრებთან ბრძოლაში შესაძლებელია ტყვიების, გულებისა და ქულების მოპოვება.',
   heart7:'გენერლის დიდი გული ზრდის სიცოცხლის მაქსიმუმს 5-დან 6-მდე.',
   heart10:'ეშმაკის დიდი გული ზრდის სიცოცხლის მაქსიმუმს 6-დან 7-მდე; მონეტები იძლევა 250 ქულას.',
   home:'საბოლოო გამარჯვება: ბონუსები მაქსიმუმ 2 000 ქულამდე, გვირგვინი და საქართველოს დროშა.'
  }
 },
 en:{
  open:'🗺️ Campaign Map',title:'PIRALI — Adventure Map',
  subtitle:'Simona’s journey from Chokhatauri to home',back:'← Back',
  completed:'Completed',current:'Current',locked:'Ahead',max:'Maximum score: 7,000',
  tour:'Stage',summary:'Story',goal:'Objective',reward:'Rewards',closeDetails:'← Chokhatauri',
  infoOnly:'This map is informational — you cannot start or skip stages here.',
  lockedDetails:'Unavailable — Simona has not been here yet!',unavailable:'Unavailable',
  chapters:[
   'Simona sets out from Chokhatauri, facing the first enemies along a forest road.',
   'The journey passes through Gogolesubani, with soldiers standing in the way.',
   'At Shua Ganakhleba, Simona meets another stretch of enemy territory.',
   'Simona pushes onward along the route through Ganakhleba.',
   'The road toward Sameba becomes another dangerous stretch of the journey.',
   'Crossing Udabno calls for careful combat and conserving ammunition.',
   'At the Desert Church, Simona must confront a General and Batoni.',
   'The Road to Infinity brings a battle against two Generals.',
   'Simona is surrounded by enemy riflemen and must break the siege.',
   'In Simona’s Hell, a flaming gate and the Devil stand in the way.',
   'Simona fights toward home. Five enemy waves stand between her and the finish.'
  ],
  goals:{
   route:'Defeat the enemies and reach the stage exit.',
   church:'Defeat the General and Batoni, collect the big heart, and enter the church.',
   generals:'Defeat both Generals to continue.',
   siege:'Defeat the 15 riflemen and break the siege.',
   hell:'Defeat the Devil, collect the big heart, and pass through the flaming gate.',
   home:'Survive five enemy waves and enter the house to win.'
  },
  rewards:{
   drops:'Ammo, healing hearts and points may be earned during combat.',
   heart7:'The General’s big heart raises maximum health from 5 to 6.',
   heart10:'The Devil’s big heart raises maximum health from 6 to 7; coins award 250 points.',
   home:'Final victory: up to 2,000 bonus points, a crown and the Georgian flag.'
  }
 },
 ru:{
  open:'🗺️ Карта игры',title:'ПИРАЛИ — карта приключения',
  subtitle:'Путь Симоны от Чохатаури до дома',back:'← Назад',
  completed:'Пройдено',current:'Текущий',locked:'Впереди',max:'Максимум очков: 7 000',
  tour:'Уровень',summary:'История',goal:'Цель',reward:'Награда',closeDetails:'← Чохатаури',
  infoOnly:'Карта носит информационный характер — здесь нельзя начать или пропустить уровень.',
  lockedDetails:'Недоступно — Симона здесь ещё не была!',unavailable:'Недоступно',
  chapters:[
   'Симона отправляется из Чохатаури: впереди первые враги и лесная дорога.',
   'Путь проходит через Гоголесубани, где дорогу преграждают солдаты.',
   'В Шуа Ганахлеба Симону ждёт новый участок вражеской территории.',
   'Симона продолжает путь и сражается на дороге через Ганахлеба.',
   'Дорога к Самеба становится ещё одним опасным участком путешествия.',
   'В Удабно важно сражаться осторожно и собирать боеприпасы.',
   'У пустынной церкви Симона встретит Генерала и Батони.',
   'На Дороге к бесконечности предстоит бой с двумя Генералами.',
   'Симона в окружении: дорогу перекрыли вражеские стрелки.',
   'В Аду Симоны на пути стоят пылающие врата и Дьявол.',
   'Симона пробивается домой, сражаясь с пятью волнами врагов.'
  ],
  goals:{
   route:'Победи врагов и доберись до выхода с уровня.',
   church:'Победи Генерала и Батони, подбери большое сердце и войди в церковь.',
   generals:'Победи обоих Генералов, чтобы продолжить путь.',
   siege:'Победи 15 стрелков и прорви окружение.',
   hell:'Победи Дьявола, подбери большое сердце и пройди через огненные врата.',
   home:'Переживи пять волн врагов и войди в дом для победы.'
  },
  rewards:{
   drops:'В бою можно получать боеприпасы, сердца и очки.',
   heart7:'Большое сердце Генерала повышает максимум здоровья с 5 до 6.',
   heart10:'Большое сердце Дьявола повышает максимум здоровья с 6 до 7; монеты дают 250 очков.',
   home:'Финальная победа: до 2 000 бонусных очков, корона и флаг Грузии.'
  }
 },
 zh:{
  open:'🗺️ 冒险地图',title:'PIRALI 冒险地图',
  subtitle:'西蒙娜从乔哈陶里到家乡的旅程',back:'← 返回',
  completed:'已完成',current:'当前',locked:'未解锁',max:'最高分：7,000',
  tour:'关卡',summary:'故事',goal:'目标',reward:'奖励',closeDetails:'← 乔哈陶里',
  infoOnly:'地图仅供查看，不能在这里开始或跳过关卡。',
  lockedDetails:'无法访问——西蒙娜还没有到过这里！',unavailable:'无法访问',
  chapters:[
   '西蒙娜从乔哈陶里出发，在森林道路上迎战第一批敌人。',
   '旅途经过戈戈莱苏巴尼，士兵们挡住了前进的道路。',
   '在舒阿·加纳赫莱巴，西蒙娜进入另一片敌方控制区。',
   '西蒙娜沿着加纳赫莱巴的道路继续战斗。',
   '通往萨梅巴的道路成为另一段危险旅程。',
   '穿过乌达布诺，需要谨慎作战并收集弹药。',
   '在沙漠教堂，西蒙娜必须面对将军和巴托尼。',
   '在无尽之路上，西蒙娜将与两名将军交战。',
   '西蒙娜遭到包围，必须突破敌方枪手的封锁。',
   '在西蒙娜的地狱中，恶魔守在火焰之门前。',
   '西蒙娜向家园前进，必须战胜五波敌人。'
  ],
  goals:{
   route:'击败敌人，到达关卡出口。',
   church:'击败将军和巴托尼，拾取大爱心，然后进入教堂。',
   generals:'击败两名将军，继续前进。',
   siege:'击败15名枪手，突破包围。',
   hell:'击败恶魔，拾取大爱心，穿过火焰之门。',
   home:'抵御五波敌人，进入房屋赢得胜利。'
  },
  rewards:{
   drops:'战斗中有机会获得弹药、爱心和积分。',
   heart7:'将军的大爱心使最大生命值从5增加到6。',
   heart10:'恶魔的大爱心使最大生命值从6增加到7；金币奖励250分。',
   home:'最终胜利：最多2,000分奖励、王冠和格鲁吉亚国旗。'
  }
 }
};
const getLang=()=>window.PiraliLanguage?.getLanguage?.()||'ka';
const word=()=>WORDS[getLang()]||WORDS.ka;
// Only the Developer preview exposes all eleven journals. PLAYER uses the
// locally persisted, player-name-scoped highest stage; a cleared checkpoint
// must never remove previously earned discoveries.
const developer=()=>window.PiraliVisualPreviewReadonly===true;
const discovered=()=>{
 if(developer())return 11;
 const stage=Number(window.PiraliStats?.highestReached?.()??window.PiraliCheckpoint?.get?.()?.level??1);
 return Number.isInteger(stage)?Math.max(1,Math.min(11,stage)):1;
};
const goalKey=n=>n===7?'church':n===8?'generals':n===9?'siege':n===10?'hell':n===11?'home':'route';
const rewardKey=n=>n===7?'heart7':n===10?'heart10':n===11?'home':'drops';
let overlay=null,button=null,selectedStage=null,lockedNotice=null;
function label(n){return window.PiraliLanguage?.getLevelName?.(n)||PIRALI_LEVELS[n-1]?.ka||'';}
function renderDetails(w,current){
 const pane=overlay.querySelector('.story-map-details');
 if(selectedStage===null)selectedStage=1;
 const n=selectedStage;
 if(!developer()&&n>current){selectedStage=1;return renderDetails(w,current);}
 const blocked=!developer()&&Number.isInteger(lockedNotice)&&lockedNotice>current;
 const state=blocked?w.unavailable:n<current?w.completed:n===current?w.current:w.locked;
 pane.hidden=false;
 pane.querySelector('.story-map-details-content').hidden=blocked;
 const alert=pane.querySelector('.story-map-locked-message');
 alert.hidden=!blocked;
 alert.textContent=blocked?w.lockedDetails:'';
 if(blocked){
  pane.querySelector('.story-map-details-status').textContent=w.unavailable;
  pane.querySelector('.story-map-details-heading').textContent=w.tour+' '+lockedNotice+' — '+label(lockedNotice);
  pane.setAttribute('aria-label',w.lockedDetails);
  return;
 }
 pane.querySelector('.story-map-details-status').textContent=state;
 pane.querySelector('.story-map-details-heading').textContent=w.tour+' '+n+' — '+label(n);
 pane.querySelector('.story-map-details-story-label').textContent=w.summary+': ';
 pane.querySelector('.story-map-details-story').textContent=w.chapters[n-1];
 pane.querySelector('.story-map-details-goal-label').textContent=w.goal+': ';
 pane.querySelector('.story-map-details-goal').textContent=w.goals[goalKey(n)];
 pane.querySelector('.story-map-details-reward-label').textContent=w.reward+': ';
 pane.querySelector('.story-map-details-reward').textContent=w.rewards[rewardKey(n)];
 pane.querySelector('.story-map-details-note').textContent=w.infoOnly;
 pane.setAttribute('aria-label',w.tour+' '+n+' — '+label(n));
}
function render(){
 const w=word();
 if(button)button.textContent=w.open;
 if(!overlay)return;
 overlay.querySelector('.story-map-title').textContent=w.title;
 overlay.querySelector('.story-map-subtitle').textContent=w.subtitle;
 overlay.querySelector('.story-map-back').textContent=w.back;
 overlay.querySelector('.story-map-max').textContent=w.max;
 const current=discovered();
 if(selectedStage===null||(!developer()&&selectedStage>current))selectedStage=1;
 if(developer()||lockedNotice!==null&&lockedNotice<=current)lockedNotice=null;
 for(const element of overlay.querySelectorAll('.story-map-stage')){
  const n=Number(element.dataset.stage);
  element.classList.toggle('complete',n<current);
  element.classList.toggle('current',n===current);
  const unavailable=!developer()&&n>current;
  element.classList.toggle('locked',unavailable);
  element.classList.toggle('selected',n===selectedStage&&lockedNotice===null);
  element.classList.toggle('locked-tapped',n===lockedNotice);
  // Do NOT disable locked pins: the user must be able to tap for the
  // localized unavailable notice, without seeing unreached story spoilers.
  element.disabled=false;
  element.setAttribute('aria-disabled','false');
  const state=n<current?w.completed:n===current?w.current:w.locked;
  const name=element.querySelector('.story-map-name');
  name.textContent=label(n);
  element.title=w.tour+' '+n+': '+label(n)+' · '+(unavailable?w.unavailable:state);
  element.setAttribute('aria-label',element.title);
  element.setAttribute('aria-pressed',String((selectedStage===n&&lockedNotice===null)||lockedNotice===n));
  if(n===current)element.setAttribute('aria-current','step');
  else element.removeAttribute('aria-current');
 }
 renderDetails(w,current);
}
function selectStage(n){
 if(!overlay||!Number.isInteger(n)||n<1||n>11)return;
 if(!developer()&&n>discovered()){
  lockedNotice=n;render();return;
 }
 lockedNotice=null;selectedStage=n;render();
}
function close(){if(!overlay)return;overlay.remove();overlay=null;selectedStage=null;lockedNotice=null;button?.focus();}
function open(){
 if(overlay){render();return;}
 selectedStage=1;lockedNotice=null;
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
  '<section class="story-map-details" role="region" hidden>'+
  '<div class="story-map-details-head"><span class="story-map-details-status"></span></div>'+
  '<h3 class="story-map-details-heading"></h3>'+
  '<p class="story-map-locked-message" role="status" aria-live="polite" hidden></p>'+
  '<div class="story-map-details-content">'+
  '<p><strong class="story-map-details-story-label"></strong><span class="story-map-details-story"></span></p>'+
  '<p><strong class="story-map-details-goal-label"></strong><span class="story-map-details-goal"></span></p>'+
  '<p><strong class="story-map-details-reward-label"></strong><span class="story-map-details-reward"></span></p>'+
  '<p class="story-map-details-note"></p></div></section>'+
  '<footer><span class="story-map-max"></span></footer></section>';
 const art=overlay.querySelector('.story-map-art');
 for(const item of STOPS){
  const e=document.createElement('button');
  e.type='button';e.className='story-map-stage';e.dataset.stage=String(item.n);
  e.style.left=item.l+'%';e.style.top=item.t+'%';e.style.width=item.w+'%';
  e.addEventListener('click',()=>selectStage(item.n));
  const name=document.createElement('span');name.className='story-map-name';e.appendChild(name);
  art.appendChild(e);
 }
 overlay.querySelector('.story-map-back').addEventListener('click',close);
 overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
 document.body.appendChild(overlay);
 render();
 requestAnimationFrame(()=>{
  const scroll=overlay?.querySelector('.story-map-scroll');
  const stage=overlay?.querySelector('.story-map-stage[data-stage="1"]');
  if(scroll&&stage)scroll.scrollTop=Math.max(0,stage.offsetTop+65-scroll.clientHeight*.58);
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
document.addEventListener('keydown',e=>{
 if(e.key!=='Escape'||!overlay)return;
 e.preventDefault();
 close();
});
const screen=document.getElementById('screen');
if(screen)new MutationObserver(mount).observe(screen,{childList:true,subtree:true});
mount();
window.PiraliStoryMap=Object.freeze({open,close,mount,refresh:render,selectStage,selectedStage:()=>selectedStage,lockedNotice:()=>lockedNotice,stops:STOPS});
})();
