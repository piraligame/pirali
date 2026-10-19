/* PIRALI personal statistics: on-device only, never sends data to Firebase.
 * These are optional player-facing achievements, NOT authenticated online identities.
 */
(function(){
  'use strict';
  const KEY='alpha012_motion_pirali_personal_stats_v1',PROFILE_LIMIT=16;
  const labels={
    ka:{button:'📊 ჩემი სტატისტიკა',heading:'ჩემი სტატისტიკა',device:'ინახება მხოლოდ ამ მოწყობილობაზე',close:'← დაბრუნება',runs:'დაწყებული თამაშები',wins:'გამარჯვებები',defeats:'დამარცხებები',kills:'დამარცხებული მტრები',bestScore:'საუკეთესო ქულა',bestRun:'საუკეთესო სრული დრო',levels:'ტურების საუკეთესო დროები',achievements:'მიღწევები',timer:'დრო',practice:'სავარჯიშო გაგრძელება',ranked:'თავიდან დაწყებული',locked:'ჯერ არ არის მიღწეული',none:'—',firstBlood:'პირველი ბრძოლა',tenKills:'10 მტერი',stageThree:'მესამე ტურამდე',stageFive:'მეხუთე ტურამდე',victory:'გამარჯვება!',scoreNote:'სტატისტიკა ადგილობრივია; TOP 20 Firebase-ში ცალკე ინახება.'},
    en:{button:'📊 MY STATS',heading:'MY STATS',device:'Stored only on this device',close:'← BACK',runs:'Runs started',wins:'Victories',defeats:'Defeats',kills:'Enemies defeated',bestScore:'Best score',bestRun:'Fastest full run',levels:'Fastest level times',achievements:'Achievements',timer:'Time',practice:'Practice resume',ranked:'New ranked run',locked:'Not unlocked yet',none:'—',firstBlood:'First blood',tenKills:'10 enemies',stageThree:'Reached level 3',stageFive:'Reached level 5',victory:'Victory!',scoreNote:'These stats are local. Firebase TOP 20 is separate.'},
    ru:{button:'📊 МОЯ СТАТИСТИКА',heading:'МОЯ СТАТИСТИКА',device:'Только на этом устройстве',close:'← НАЗАД',runs:'Начатые игры',wins:'Победы',defeats:'Поражения',kills:'Побежденные враги',bestScore:'Лучший счет',bestRun:'Лучшее время',levels:'Лучшее время по уровням',achievements:'Достижения',timer:'Время',practice:'Продолжение без рейтинга',ranked:'Новая игра с рейтингом',locked:'Пока не получено',none:'—',firstBlood:'Первая победа',tenKills:'10 врагов',stageThree:'Достигнуть уровня 3',stageFive:'Достигнуть уровня 5',victory:'Победа!',scoreNote:'Статистика локальная; TOP 20 Firebase отдельно.'},
    zh:{button:'📊 我的统计',heading:'我的统计',device:'仅保存在此设备',close:'← 返回',runs:'开始游戏次数',wins:'胜利次数',defeats:'失败次数',kills:'击败敌人数',bestScore:'最高分',bestRun:'最佳通关时间',levels:'各关最佳用时',achievements:'成就',timer:'时间',practice:'存档练习',ranked:'全新排行游戏',locked:'尚未解锁',none:'—',firstBlood:'初战告捷',tenKills:'击败10名敌人',stageThree:'到达第3关',stageFive:'到达第5关',victory:'胜利！',scoreNote:'统计仅保存在本机；Firebase TOP 20 独立管理。'}
  };
  const ACH=['firstBlood','tenKills','stageThree','stageFive','victory'];
  let run=null,lastClock=null,overlay=null;
  const lang=()=>window.PiraliLanguage?.getLanguage()||'ka';
  const t=key=>(labels[lang()]||labels.ka)[key]||labels.ka[key]||key;
  const safeInt=(v,max=10000000)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
  const name=()=>{try{return (localStorage.getItem('alpha012_motion_pirali_player_name')||'ანონიმი').normalize('NFKC').trim().slice(0,32)||'ანონიმი'}catch(e){return 'ანონიმი'}};
  const key=()=>name().toLocaleLowerCase();
  function empty(){
    return {runs:0,wins:0,defeats:0,kills:0,bestScore:0,bestRunMs:null,
      stageBestMs:[null,null,null,null,null],achievements:{}};
  }
  function valid(s){
    return !!s&&typeof s==='object'&&!Array.isArray(s)&&
      ['runs','wins','defeats','kills','bestScore'].every(k=>safeInt(s[k],999999999))&&
      (s.bestRunMs===null||safeInt(s.bestRunMs,864000000))&&
      Array.isArray(s.stageBestMs)&&s.stageBestMs.length===5&&s.stageBestMs.every(v=>v===null||safeInt(v,864000000))&&
      !!s.achievements&&typeof s.achievements==='object'&&!Array.isArray(s.achievements);
  }
  function loadStore(){
    try{
      const raw=localStorage.getItem(KEY);
      if(!raw||raw.length>32000)return {version:1,profiles:{}};
      const data=JSON.parse(raw);
      if(data?.version!==1||!data.profiles||typeof data.profiles!=='object'||Array.isArray(data.profiles))throw Error('invalid stats');
      return data;
    }catch(e){return {version:1,profiles:{}};}
  }
  function current(){
    const s=loadStore().profiles[key()];
    return valid(s)?s:empty();
  }
  function commit(data){
    if(!valid(data))return;
    try{
      const db=loadStore();const k=key();
      db.profiles[k]=data;
      const names=Object.keys(db.profiles);
      if(names.length>PROFILE_LIMIT){
        for(const old of names.filter(x=>x!==k).slice(0,names.length-PROFILE_LIMIT))delete db.profiles[old];
      }
      localStorage.setItem(KEY,JSON.stringify(db));
    }catch(e){console.warn('PIRALI local stats unavailable',e);}
  }
  function award(s,achievement){
    if(!ACH.includes(achievement))return;
    if(!s.achievements[achievement])s.achievements[achievement]=Date.now();
  }
  function clockTick(ts,active){
    if(!Number.isFinite(ts))return;
    if(run&&active&&!run.transition&&lastClock!==null){
      const elapsed=Math.max(0,Math.min(500,ts-lastClock));
      run.stageMs+=elapsed;run.totalMs+=elapsed;
    }
    lastClock=ts;
    const hud=document.getElementById('pirali-time-hud');
    if(hud){
      hud.hidden=!run||!active;
      if(run&&active&&(!run.lastDisplayed||ts-run.lastDisplayed>=250)){
        hud.textContent='⏱ '+fmt(run.stageMs);run.lastDisplayed=ts;
      }
    }
  }
  function fmt(ms){
    if(!Number.isFinite(ms)||ms<0)return t('none');
    const seconds=Math.floor(ms/1000);
    return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
  }
  function start(practice,startLevel){
    run={practice:!!practice,level:Number(startLevel)||1,stageMs:0,totalMs:0,kills:0,transition:false,lastDisplayed:0,ended:false};
    lastClock=null;
    const s=current();s.runs++;commit(s);
  }
  function kill(){
    if(!run||run.ended)return;
    run.kills++;
    const s=current();s.kills++;
    if(s.kills>=1)award(s,'firstBlood');
    if(s.kills>=10)award(s,'tenKills');
    commit(s);
  }
  function completeStage(n){
    if(!run||run.ended||run.transition||run.level!==n||n<1||n>4)return;
    const s=current();
    if(!run.practice){
      const old=s.stageBestMs[n-1];
      const ms=Math.round(run.stageMs);
      if(old===null||ms<old)s.stageBestMs[n-1]=ms;
    }
    if(n>=2)award(s,'stageThree');
    if(n>=4)award(s,'stageFive');
    commit(s);
    run.transition=true;
    run.level=n+1;run.stageMs=0;lastClock=null;
  }
  function stageReady(n){
    if(!run||run.ended)return;
    run.level=n;run.transition=false;run.stageMs=0;lastClock=null;
  }
  function result(won,sc){
    if(!run||run.ended)return;
    run.ended=true;
    const s=current();
    if(won){
      s.wins++;award(s,'victory');
      if(!run.practice){
        const ms=Math.round(run.stageMs),last=s.stageBestMs[4];
        if(last===null||ms<last)s.stageBestMs[4]=ms;
        const total=Math.round(run.totalMs);
        if(s.bestRunMs===null||total<s.bestRunMs)s.bestRunMs=total;
      }
    }else s.defeats++;
    if(!run.practice&&safeInt(sc,999999999)&&sc>s.bestScore)s.bestScore=sc;
    commit(s);renderResult();
    const hud=document.getElementById('pirali-time-hud');if(hud)hud.hidden=true;
  }
  function build(){
    if(overlay)return;
    overlay=document.createElement('div');overlay.id='pirali-stats-overlay';
    overlay.style.display='none';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-labelledby','pirali-stats-title');
    const box=document.createElement('section');box.className='pirali-stats-card';
    const title=document.createElement('h2');title.id='pirali-stats-title';
    const subtitle=document.createElement('p');subtitle.id='pirali-stats-subtitle';
    const content=document.createElement('div');content.id='pirali-stats-content';
    const close=document.createElement('button');close.id='pirali-stats-close';close.type='button';close.onclick=hide;
    box.append(title,subtitle,content,close);overlay.appendChild(box);document.body.appendChild(overlay);
  }
  function line(label,value,cls=''){const r=document.createElement('div');r.className='pirali-stats-line '+cls;
    const k=document.createElement('span');k.textContent=label;
    const v=document.createElement('strong');v.textContent=String(value);r.append(k,v);return r;}
  function section(title){const h=document.createElement('h3');h.textContent=title;return h}
  function render(){
    build();const s=current(),box=document.getElementById('pirali-stats-content');
    box.replaceChildren();
    document.getElementById('pirali-stats-title').textContent=t('heading')+' · '+name();
    document.getElementById('pirali-stats-subtitle').textContent=t('device');
    for(const [k,v] of [['runs',s.runs],['wins',s.wins],['defeats',s.defeats],['kills',s.kills],['bestScore',s.bestScore.toLocaleString()],['bestRun',fmt(s.bestRunMs)]])
      box.appendChild(line(t(k),v));
    box.appendChild(section(t('levels')));
    for(let n=1;n<=5;n++)box.appendChild(line(
      (window.PiraliLanguage?.translateLevel(n)||'ტური '+n),
      fmt(s.stageBestMs[n-1])));
    box.appendChild(section(t('achievements')));
    const icons=['⚔️','🎯','🌲','⛪','🏆'];
    ACH.forEach((a,i)=>box.appendChild(line(icons[i]+' '+t(a),s.achievements[a]?'✓':t('locked'),
      s.achievements[a]?'pirali-achieved':'pirali-locked')));
    const note=document.createElement('p');note.className='pirali-stats-note';note.textContent=t('scoreNote');box.appendChild(note);
    document.getElementById('pirali-stats-close').textContent=t('close');
    document.querySelectorAll('.pirali-show-stats,.menu-stats').forEach(button=>button.textContent=t('button'));
  }
  function show(){render();overlay.style.display='flex';document.getElementById('pirali-stats-close').focus();}
  function hide(){if(overlay)overlay.style.display='none';}
  function visible(){return !!overlay&&overlay.style.display==='flex';}
  function makeButton(cls){const b=document.createElement('button');b.type='button';b.className=cls;
    b.textContent=t('button');b.addEventListener('click',show);return b;}
  function mountMenu(parent){
    if(!parent||parent.querySelector('.menu-stats'))return;
    parent.appendChild(makeButton('menu-stats'));
  }
  function mountLeaderboard(){
    const b=document.getElementById('lb-personal');if(!b||document.getElementById('pirali-lb-stats'))return;
    const button=makeButton('pirali-show-stats');button.id='pirali-lb-stats';b.after(button);
  }
  function renderResult(){
    const screen=document.getElementById('screen');
    if(!screen||(!screen.classList.contains('victory-screen')&&!screen.classList.contains('gameover-screen')))return;
    let info=screen.querySelector('.pirali-result-stats');
    if(!info){info=document.createElement('div');info.className='pirali-result-stats';
      const btn=screen.querySelector('button.sbtn');btn?.before(info);}
    if(run)info.textContent='⏱ '+t('timer')+': '+fmt(run.totalMs)+' · ⚔ '+t('kills')+': '+run.kills;
    let button=screen.querySelector('.pirali-show-stats');
    if(!button){button=makeButton('pirali-show-stats');info.after(button);}
    button.textContent=t('button');
  }
  document.addEventListener('pirali:languagechange',()=>{if(visible())render();renderResult();document.querySelectorAll('.pirali-show-stats,.menu-stats').forEach(b=>b.textContent=t('button'))});
  window.PiraliStats=Object.freeze({start,kill,completeStage,stageReady,result,clockTick,
    mountMenu,mountLeaderboard,renderResult,show,hide,visible,get:current,format:fmt,
    debug:()=>run?{...run}:null});
})();
