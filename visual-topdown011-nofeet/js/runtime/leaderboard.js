const FB_URL  = 'https://pirali-game-default-rtdb.firebaseio.com';
const LB_PATH = FB_URL + '/scores';
const LB_KEY  = 'topdown011_nofeet_pirali_lb_v1';
function lbT(key){return window.PiraliLanguage?window.PiraliLanguage.t(key):({empty:'ჩანაწერი ჯერ არ არის',loading:'⏳ იტვირთება...',saving:'⏳ ინახება...',saved:'✅ შენახულია',players:'მოთამაშე'})[key]||key;}


// Display-only normalization. No Firebase records are edited or deleted.
// Normalizing NFKC, letter case and whitespace merges visual name duplicates.
function lbNameKey(name){
  return String(name || '').normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();
}
function lbBest(rows){
  const byName=new Map();
  for(const row of (Array.isArray(rows)?rows:[])){
    if(!row||typeof row!=='object'||typeof row.name!=='string')continue;
    const key=lbNameKey(row.name);
    if(!key||!Number.isFinite(row.score)||row.score<=0)continue;
    const previous=byName.get(key);
    if(!previous||row.score>previous.score){
      byName.set(key,{...row,name:row.name.normalize('NFKC').replace(/\s+/g,' ').trim()});
    }
  }
  return [...byName.values()].sort((a,b)=>b.score-a.score||lbNameKey(a.name).localeCompare(lbNameKey(b.name)));
}
let lbLastRows=[];
function lbShowPersonal(rows){
  const card=document.getElementById('lb-personal');
  if(!card)return;
  const name=localStorage.getItem('topdown011_nofeet_pirali_player_name')||'';
  const ranked=lbBest(rows);
  const bestName=lbNameKey(name);
  const position=bestName?ranked.findIndex(x=>lbNameKey(x.name)===bestName):-1;
  const label=document.createElement('span');
  label.className='lb-personal-label';
  label.textContent='🎖 '+lbT('myBest');
  const value=document.createElement('strong');
  value.className='lb-personal-score';
  value.textContent=position>=0?ranked[position].score.toLocaleString():lbT(name?'noPersonalScore':'playToSeeBest');
  const sub=document.createElement('span');
  sub.className='lb-personal-rank';
  sub.textContent=position>=0?'#'+(position+1)+' • '+ranked[position].name:'';
  card.replaceChildren(label,value,sub);
}

let _pendingScore = 0, _pendingLevel = 0, _pendingWin = false;

// ── local cache ──
function lcLoad(){
  try{
    const raw = JSON.parse(localStorage.getItem(LB_KEY)||'[]');
    if(!Array.isArray(raw)) return [];
    return lbBest(raw);
  }catch(e){ return []; }
}
function lcSave(rows){
  try{ localStorage.setItem(LB_KEY, JSON.stringify(lbBest(rows).slice(0,100))); }catch(e){}
}

// ── fetch top scores from Firebase ──
async function lbFetch(){
  try{
    // Simple fetch — no custom headers to avoid CORS preflight blocking
    const res = await fetch(LB_PATH + '.json'); // GET only: read existing data, no write or migration
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if(!data || typeof data !== 'object') return [];
    const rows = lbBest(Object.values(data));
    lcSave(rows);
    return rows;
  }catch(e){
    console.warn('lbFetch:', e.message);
    return null;
  }
}

// ── push one score to Firebase ──
async function lbPush(name, sc, lv, win){
  if(window.PiraliVisualPreviewReadonly){const rows=await lbFetch();return rows||lcLoad();}
  // Checkpoint runs are unranked; never send their points to Firebase.
  if(window.PiraliCheckpoint?.isResumedRun())return lcLoad();
  if(!sc || sc <= 0) { const r = await lbFetch(); return r || lcLoad(); }
  const entry = {
    name  : (name||'').trim().slice(0,20) || 'ანონიმი',
    score : sc,
    level : lv,
    win   : !!win,
    ts    : Date.now()
  };
  // Push to Firebase first; only update local cache when push succeeds
  let pushOk = false;
  try{
    const res = await fetch(LB_PATH + '.json', {
      method  : 'POST',
      headers : {'Content-Type':'application/json'},
      body    : JSON.stringify(entry)
    });
    if(!res.ok) throw new Error('HTTP ' + res.status);
    pushOk = true;
  }catch(e){
    console.warn('lbPush:', e.message);
  }
  if(pushOk){
    const rows = await lbFetch();
    return rows !== null ? rows : lcLoad();
  }
  // Offline fallback: add to local cache, deduplicate by ts
  const local = lcLoad().filter(r => r && r.ts !== entry.ts);
  local.push(entry);
  local.sort((a,b) => b.score - a.score);
  lcSave(local);
  return local;
}

// ── helper: always returns the hardcoded DB URL ──
function getDbUrl(){
  return FB_URL;
}

// ── render leaderboard rows into #lb-list ──
function lbRender(rows, highlightName){
  const list = document.getElementById('lb-list');
  if(!list) return;
  list.innerHTML = '';

  // One visible row per normalized player name, highest score only.
  const safe = lbBest(rows);
  lbLastRows=safe;

  if(safe.length === 0){
    list.innerHTML = '<div style="text-align:center;color:#5a4018;font-size:13px;padding:24px 0;letter-spacing:1px;">' + lbT('empty') + '</div>';
    lbShowPersonal(safe);
    return;
  }

  // Present TOP 20; personal record is shown separately, even below 20th place.
  safe.slice(0, 20).forEach(function(r, i){
    const rank = i + 1;
    const row  = document.createElement('div');
    let cls = 'lb-row';
    if(rank === 1) cls += ' top1';
    else if(rank === 2) cls += ' top2';
    else if(rank === 3) cls += ' top3';
    if((highlightName || localStorage.getItem('topdown011_nofeet_pirali_player_name')) && lbNameKey(r.name) === lbNameKey(highlightName || localStorage.getItem('topdown011_nofeet_pirali_player_name'))) cls += ' mine';
    row.className = cls;

    let rankHtml = '<span class="lb-rank">' + rank + '</span>';
    if(rank === 1) rankHtml = '<span class="lb-rank gold">🥇</span>';
    else if(rank === 2) rankHtml = '<span class="lb-rank silver">🥈</span>';
    else if(rank === 3) rankHtml = '<span class="lb-rank bronze">🥉</span>';

    const winBadge = r.win ? ' <span style="font-size:9px;color:#c89820;">⛪</span>' : '';
    // Firebase values are untrusted; never inject a raw level field into HTML.
    const lvl=Number(r.level);
    const lvlBadge=Number.isFinite(lvl)&&lvl>0&&lvl<=99 ? '<span class="lb-lvl">Lv' + Math.floor(lvl) + '</span>' : '';

    row.innerHTML =
      rankHtml +
      '<span class="lb-name-col">' + escHtml(r.name) + winBadge + '</span>' +
      '<span class="lb-score-col">' + Number(r.score).toLocaleString() + '</span>' +
      lvlBadge;

    list.appendChild(row);
  });
  lbShowPersonal(safe);
}

// ── safe HTML escape ──
function escHtml(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── auto-save after game ends ──

async function lbShow(){
  window.PiraliStats?.mountLeaderboard();
  document.getElementById('lb-play').style.display='block';bgmFadeIn(0.28);
  const nameEl=document.getElementById('lb-name');
  nameEl.value=localStorage.getItem('topdown011_nofeet_pirali_player_name')||'';
  document.getElementById('lb-name-row').style.display='none';
  document.getElementById('lb-overlay').style.display='flex';
  setTimeout(()=>nameEl.focus(),120);

  // Show cached rows IMMEDIATELY — no waiting
  const cached=lcLoad();
  if(cached.length){
    try{ lbRender(cached,null); }catch(e){}
    document.getElementById('lb-status').textContent=`📱 ${cached.length} (${lbT('cached')}) • ${lbT('loading')}`;
  } else {
    document.getElementById('lb-status').textContent=lbT('loading');
  }

  // Timeout fallback — if fetch hangs >3s, stop waiting
  let settled = false;
  const fallbackTimer = setTimeout(()=>{
    if(settled) return;
    settled = true;
    const local=lcLoad();
    try{ lbRender(local,null); }catch(e){}
    document.getElementById('lb-status').textContent=
      local.length?`📱 ${local.length} (${lbT('offline')})`:'📱 '+lbT('empty');
  }, 3000);

  try{
    const rows=await lbFetch();
    settled = true;
    clearTimeout(fallbackTimer);
    if(rows !== null){
      try{ lbRender(rows,null); }catch(e){ console.warn('lbRender error',e); }
      document.getElementById('lb-status').textContent=
        rows.length?`🌐 ${rows.length} ${lbT('players')}`:'🌐 '+lbT('empty');
    } else {
      // Firebase unreachable — show local cache
      const local=lcLoad();
      try{ lbRender(local,null); }catch(err){}
      document.getElementById('lb-status').textContent=
        local.length?`📱 ${local.length} (${lbT('offline')})`:'📱 '+lbT('empty');
    }
  }catch(e){
    settled = true;
    clearTimeout(fallbackTimer);
    const local=lcLoad();
    try{ lbRender(local,null); }catch(err){}
    document.getElementById('lb-status').textContent=
      local.length?`📱 ${local.length} (${lbT('offline')})`:'📱 '+lbT('empty');
  }
}

function lbSetupSave(){} // disabled - URL hardcoded

async function autoSaveScore(sc,lv,win){
  if(window.PiraliVisualPreviewReadonly)return;
  if(window.PiraliCheckpoint?.isResumedRun())return;
  if(!sc || sc <= 0) return;  // skip zero scores
  const name = localStorage.getItem('topdown011_nofeet_pirali_player_name') || 'ანონიმი';
  try{ await lbPush(name, sc, lv, win); }catch(e){}
}

async function lbSave(){
  const nameEl=document.getElementById('lb-name');
  const name=nameEl.value.trim().slice(0,14)||'ანონიმი';
  document.getElementById('lb-name-row').style.display='none';
  document.getElementById('lb-status').textContent=lbT('saving');
  const rows=await lbPush(name,_pendingScore,_pendingLevel,_pendingWin);
  lbRender(rows,name);
  document.getElementById('lb-status').textContent=
    rows.length ? `🌐 ${rows.length} ${lbT('players')} • ${lbT('saved')}` : lbT('saved');
}

function lbPlay(){
  document.getElementById('lb-overlay').style.display='none';
  document.getElementById('lb-play').style.display='none';
  startGame();
}


// Repaint text on the currently visible results without touching Firebase.
document.addEventListener('pirali:languagechange',function(){if(document.getElementById('lb-overlay')?.style.display==='flex')lbRender(lbLastRows,null);});
