/* PIRALI BETA 1.02 — best personal score's real online position beyond public TOP 30.
   Firebase READ only, never changes leaderboard entries. */
(function(){
'use strict';
const strings={
 ka:{title:'🏆 ჩემი საუკეთესო შედეგი',checking:'რეიტინგში ადგილი ითვლება…',position:'ადგილი',of:'მოთამაშიდან',
     top:'TOP 30-ში მოხვდი!',outside:'TOP 30-ის მიღმა',zero:'0 ქულით რეიტინგში ადგილი არ ენიჭება',
     preview:'🏆 ახალი სეზონი',online:'🌐 ონლაინ რეიტინგი',offline:'📱 ოფლაინ მონაცემებით — სავარაუდო ადგილი',
     saved:'⚑ შენახული ტურიდან გაგრძელება რეიტინგში არ ითვლება'},
 en:{title:'🏆 MY BEST SCORE',checking:'Calculating your place…',position:'Rank',of:'players',
     top:'You reached TOP 30!',outside:'Outside TOP 30',zero:'A zero-score run is not ranked',
     preview:'🏆 New season',online:'🌐 Online ranking',offline:'📱 Offline data — estimated rank',
     saved:'⚑ Continued checkpoint runs are unranked'},
 ru:{title:'🏆 МОЙ ЛУЧШИЙ РЕЗУЛЬТАТ',checking:'Определяем ваше место…',position:'Место',of:'игроков',
     top:'Вы в ТОП-30!',outside:'За пределами ТОП-30',zero:'При 0 очков место не присваивается',
     preview:'🏆 Новый сезон',online:'🌐 Онлайн-рейтинг',offline:'📱 Офлайн-данные — примерное место',
     saved:'⚑ Игра из сохранения не участвует в рейтинге'},
 zh:{title:'🏆 我的最高成绩',checking:'正在计算排名…',position:'排名',of:'名玩家',
     top:'进入前30名！',outside:'未进入前30名',zero:'0分不计入排行榜',
     preview:'🏆 新赛季',online:'🌐 在线排名',offline:'📱 离线数据——预估排名',
     saved:'⚑ 读取存档的游戏不参与排名'}
};
const lang=()=>strings[window.PiraliLanguage?.getLanguage?.()||'ka']||strings.ka;
Object.assign(strings.ka,{"best":"საუკეთესო","notYet":"ონლაინ რეიტინგში ქულა ჯერ არ არის","dev":"🧪 DEV — ლოკალური სატესტო რეიტინგი"});
Object.assign(strings.en,{"best":"Personal best","notYet":"No confirmed online score yet","dev":"🧪 DEV — local test ranking"});
Object.assign(strings.ru,{"best":"Лучший результат","notYet":"Подтверждённого онлайн-результата пока нет","dev":"🧪 DEV — локальный тестовый рейтинг"});
Object.assign(strings.zh,{"best":"最高分","notYet":"暂无已确认的在线成绩","dev":"🧪 DEV — 本地测试排名"});
let active=null,runId=0;
/* Rank the player's BEST score, never the last attempt alone.
   All unique season players count, including positions beyond TOP 30. */
function calculate(rows,name,runScore,includeUnconfirmed=false){
  const player=lbNameKey(name);
  const allBest=lbBest(Array.isArray(rows)?rows:[]);
  const official=allBest.find(r=>lbNameKey(r.name)===player);
  const personalBest=Math.max(official?.score||0,
    includeUnconfirmed&&Number.isFinite(runScore)?Math.max(0,runScore):0);
  if(personalBest<=0)return {position:null,total:allBest.length,score:0};
  const others=allBest.filter(r=>lbNameKey(r.name)!==player);
  const ranking=[...others,{name:name||'ანონიმი',score:personalBest}];
  ranking.sort((a,b)=>b.score-a.score||lbNameKey(a.name).localeCompare(lbNameKey(b.name)));
  return {position:ranking.findIndex(r=>lbNameKey(r.name)===player)+1,total:ranking.length,score:personalBest};
}
function paint(){
  if(!active||!active.element.isConnected)return;
  const s=lang(),{element,score,phase,rank,resumed}=active;
  const head=element.querySelector('.pirali-run-rank-title');
  const line=element.querySelector('.pirali-run-rank-place');
  const foot=element.querySelector('.pirali-run-rank-foot');
  if(!head||!line||!foot)return;
  head.textContent=s.title;
  element.classList.remove('pirali-in-top30');
  if(resumed){line.textContent=s.saved;foot.textContent='';return;}
  if(phase==='loading'&&!rank){line.textContent=s.checking;foot.textContent='';return;}
  if(!rank||!rank.position){
    line.textContent=phase==='online'?s.notYet:score<=0?s.zero:s.checking;
    foot.textContent=phase==='dev'?s.dev:phase==='cached'?s.offline:'';
    return;
  }
  line.textContent=s.position+' №'+rank.position+' / '+rank.total+' '+s.of;
  const origin=phase==='online'?s.online:phase==='dev'?s.dev:s.offline;
  // Rank place itself is already shown above; omit duplicate personal-best
  // and 'online ranking' footnotes on death/victory screens.
  foot.textContent='';
  element.classList.toggle('pirali-in-top30',rank.position<=30);
}
/* A disconnected, hidden or replaced result screen must never be altered by
   a late network response or by another run's rank request. */
function stillCurrent(id,card){
  const screen=document.getElementById('screen');
  return id===runId&&active?.element===card&&card.isConnected&&
         screen?.style.display==='flex'&&
         (screen.classList.contains('victory-screen')||screen.classList.contains('gameover-screen'));
}
async function refreshRank(id,card,runScore,player){
  let timer;
  try{
    // Ensure the current run has finished submitting before reading the global ranking.
    // Do NOT mistake a previously cached estimate for a confirmed online position.
    if(!window.PiraliVisualPreviewReadonly&&window.PiraliBetaSavePromise){
      const saveTask=Promise.resolve(window.PiraliBetaSavePromise).catch(()=>null);
      const completed=await Promise.race([
        saveTask.then(()=>true),
        new Promise(resolve=>{timer=setTimeout(()=>resolve(false),6500);})
      ]);
      clearTimeout(timer);
      // Slow uploads can finish after the deadline: automatically refresh then.
      if(!completed)saveTask.then(()=>{
        if(stillCurrent(id,card))refreshRank(id,card,runScore,player);
      }).catch(()=>{});
    }
    const fetchTask=lbFetch().then(rows=>({rows,online:rows!==null}));
    const winner=await Promise.race([
      fetchTask,
      new Promise(resolve=>{timer=setTimeout(()=>resolve({rows:null,online:false}),5000);})
    ]);
    clearTimeout(timer);
    if(!winner.online)fetchTask.then(later=>{
      if(later.online&&stillCurrent(id,card)){
        active.rank=calculate(later.rows,player,runScore,false);
        active.phase=window.PiraliVisualPreviewReadonly?'dev':'online';
        paint();
      }
    }).catch(()=>{});
    if(!stillCurrent(id,card))return;
    const offline=typeof lcLoad==='function'?lcLoad():[];
    const online=winner.online&&!window.PiraliVisualPreviewReadonly;
    const rows=winner.rows===null?offline:winner.rows;
    active.rank=calculate(rows,player,runScore,!online);
    active.phase=window.PiraliVisualPreviewReadonly?'dev':online?'online':'cached';
    paint();
  }catch(e){
    clearTimeout(timer);
    if(!stillCurrent(id,card))return;
    active.rank=calculate(typeof lcLoad==='function'?lcLoad():[],player,runScore,true);
    active.phase=window.PiraliVisualPreviewReadonly?'dev':'cached';
    paint();
  }
}
async function mount(){
  // These preview builds cannot submit an official score. Do not invent a
  // TOP-30 placement by inserting the unsent local run into public results.
  if(window.PiraliSeasonReleaseEnabled!==true)return;
  const screen=document.getElementById('screen'),box=screen?.querySelector('.sbox');
  if(!box)return;
  const id=++runId,scoreAtFinish=Math.max(0,Math.floor(Number(score)||0));
  const player=(localStorage.getItem('pirali_player_name')||'ანონიმი').trim()||'ანონიმი';
  const resumed=!!window.PiraliCheckpoint?.isResumedRun?.();
  const panel=document.createElement('section');
  panel.className='pirali-run-rank';panel.setAttribute('role','status');
  panel.setAttribute('aria-live','polite');
  for(const className of ['pirali-run-rank-title','pirali-run-rank-place','pirali-run-rank-foot']){
    const div=document.createElement('div');div.className=className;panel.appendChild(div);
  }
  box.appendChild(panel);
  active={element:panel,score:scoreAtFinish,name:player,phase:'loading',rank:null,resumed};
  if(!resumed){
    const cached=typeof lcLoad==='function'?lcLoad():[];
    if(cached.length){active.rank=calculate(cached,player,scoreAtFinish,true);active.phase='cached';}
  }
  paint();
  if(!resumed)await refreshRank(id,panel,scoreAtFinish,player);
}
async function refresh(){
  if(!active||active.resumed)return;
  return refreshRank(runId,active.element,active.score,active.name);
}
function cancel(){++runId;active=null;}
const originalGameOver=showGameOver, originalVictory=showVictory;
showGameOver=function(...args){cancel();const val=originalGameOver.apply(this,args);mount();return val;};
showVictory=function(...args){cancel();const val=originalVictory.apply(this,args);mount();return val;};
document.addEventListener('pirali:languagechange',paint);
window.PiraliOutcomeRank=Object.freeze({calculate,cancel,refresh});
})();
