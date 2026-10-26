/* PIRALI DEV 0.16.1 — personal position of THIS run, even outside public TOP 30.
   Firebase READ only, never changes leaderboard entries. */
(function(){
'use strict';
const strings={
 ka:{title:'🏆 ამ ცდის შედეგი',checking:'რეიტინგში ადგილი ითვლება…',position:'ადგილი',of:'მოთამაშიდან',
     top:'TOP 30-ში მოხვდი!',outside:'TOP 30-ის მიღმა',zero:'0 ქულით რეიტინგში ადგილი არ ენიჭება',
     preview:'🏆 ახალი სეზონი',online:'🌐 ონლაინ რეიტინგი',offline:'📱 ოფლაინ მონაცემებით — სავარაუდო ადგილი',
     saved:'⚑ შენახული ტურიდან გაგრძელება რეიტინგში არ ითვლება'},
 en:{title:'🏆 THIS RUN',checking:'Calculating your place…',position:'Rank',of:'players',
     top:'You reached TOP 30!',outside:'Outside TOP 30',zero:'A zero-score run is not ranked',
     preview:'🏆 New season',online:'🌐 Online ranking',offline:'📱 Offline data — estimated rank',
     saved:'⚑ Continued checkpoint runs are unranked'},
 ru:{title:'🏆 ЭТА ПОПЫТКА',checking:'Определяем ваше место…',position:'Место',of:'игроков',
     top:'Вы в ТОП-30!',outside:'За пределами ТОП-30',zero:'При 0 очков место не присваивается',
     preview:'🏆 Новый сезон',online:'🌐 Онлайн-рейтинг',offline:'📱 Офлайн-данные — примерное место',
     saved:'⚑ Игра из сохранения не участвует в рейтинге'},
 zh:{title:'🏆 本次成绩',checking:'正在计算排名…',position:'排名',of:'名玩家',
     top:'进入前30名！',outside:'未进入前30名',zero:'0分不计入排行榜',
     preview:'🏆 新赛季',online:'🌐 在线排名',offline:'📱 离线数据——预估排名',
     saved:'⚑ 读取存档的游戏不参与排名'}
};
const lang=()=>strings[window.PiraliLanguage?.getLanguage?.()||'ka']||strings.ka;
let active=null,runId=0;
/* Compare the score from THIS attempt. Remove any older better record of the
   same normalized name first, so an old PB doesn't disguise a weaker run.
   Everybody else contributes their highest score only. */
function calculate(rows,name,runScore){
  const player=lbNameKey(name);
  const others=lbBest(Array.isArray(rows)?rows:[])
    .filter(r=>lbNameKey(r.name)!==player);
  if(!(Number.isFinite(runScore)&&runScore>0))return {position:null,total:others.length};
  const all=[...others,{name:name||'ანონიმი',score:runScore}];
  all.sort((a,b)=>b.score-a.score||lbNameKey(a.name).localeCompare(lbNameKey(b.name)));
  return {position:all.findIndex(r=>lbNameKey(r.name)===player)+1,total:all.length};
}
function paint(){
  if(!active||!active.element.isConnected)return;
  const s=lang(), {element,details,score,phase,rank,resumed}=active;
  const head=element.querySelector('.pirali-run-rank-title');
  const line=element.querySelector('.pirali-run-rank-place');
  const foot=element.querySelector('.pirali-run-rank-foot');
  if(!head||!line||!foot)return;
  head.textContent=s.title;
  if(resumed){line.textContent=s.saved;foot.textContent='';return;}
  if(score<=0){line.textContent=s.zero;foot.textContent=s.preview;return;}
  if(!rank){
    line.textContent=s.checking;
    foot.textContent=s.preview;
    return;
  }
  line.textContent=s.position+' №'+rank.position+' / '+rank.total+' '+s.of;
  foot.textContent=(rank.position<=30?s.top:s.outside)+' · '+(phase==='online'?s.online:s.offline);
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
async function mount(){
  const screen=document.getElementById('screen');
  const box=screen?.querySelector('.sbox');
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
  active={element:panel,score:scoreAtFinish,name:player,details:box,phase:'loading',rank:null,resumed};
  if(!resumed&&scoreAtFinish>0){
    const cached=typeof lcLoad==='function'?lcLoad():[];
    if(cached.length){active.rank=calculate(cached,player,scoreAtFinish);active.phase='cached';}
  }
  paint();
  if(resumed||scoreAtFinish<=0)return;
  let timeoutId;
  try{
    // A four-second bound prevents blocking result controls while the
    // Firebase read is offline. The existing local cache is our fallback.
    const winner=await Promise.race([
      lbFetch().then(rows=>({rows,online:rows!==null})),
      new Promise(resolve=>{timeoutId=setTimeout(()=>resolve({rows:null,online:false}),4000);})
    ]);
    clearTimeout(timeoutId);
    if(!stillCurrent(id,panel))return;
    const fallback=typeof lcLoad==='function'?lcLoad():[];
    const rows=winner.rows===null?fallback:winner.rows;
    active.rank=calculate(rows,player,scoreAtFinish);
    active.phase=winner.online?'online':'cached';
    paint();
  }catch(err){
    clearTimeout(timeoutId);
    if(!stillCurrent(id,panel))return;
    const cached=typeof lcLoad==='function'?lcLoad():[];
    active.rank=calculate(cached,player,scoreAtFinish);
    active.phase='cached';paint();
  }
}
function cancel(){++runId;active=null;}
const originalGameOver=showGameOver, originalVictory=showVictory;
showGameOver=function(...args){cancel();const val=originalGameOver.apply(this,args);mount();return val;};
showVictory=function(...args){cancel();const val=originalVictory.apply(this,args);mount();return val;};
document.addEventListener('pirali:languagechange',paint);
window.PiraliOutcomeRank=Object.freeze({calculate,cancel});
})();
