const FB_URL  = 'https://pirali-game-default-rtdb.firebaseio.com';
const LB_PATH = FB_URL + '/scores';
const LB_KEY  = 'pirali_lb_v1';

let _pendingScore = 0, _pendingLevel = 0, _pendingWin = false;

// ── local cache ──
function lcLoad(){
  try{
    const raw = JSON.parse(localStorage.getItem(LB_KEY)||'[]');
    if(!Array.isArray(raw)) return [];
    // Filter broken/zero entries
    const valid = raw.filter(r => r && r.name && typeof r.score === 'number' && r.score > 0);
    // Deduplicate: keep best score per name (handles old cache bloat)
    const best = {};
    valid.forEach(r => {
      if(!best[r.name] || r.score > best[r.name].score) best[r.name] = r;
    });
    return Object.values(best).sort((a,b) => b.score - a.score);
  }catch(e){ return []; }
}
function lcSave(rows){
  try{ localStorage.setItem(LB_KEY, JSON.stringify(rows.slice(0,100))); }catch(e){}
}

// ── fetch top scores from Firebase ──
async function lbFetch(){
  try{
    // Simple fetch — no custom headers to avoid CORS preflight blocking
    const res = await fetch(LB_PATH + '.json?orderBy="score"&limitToLast=100');
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if(!data || typeof data !== 'object') return [];
    const rows = Object.values(data)
      .filter(x => x && x.name && typeof x.score === 'number' && x.score > 0);
    rows.sort((a,b) => b.score - a.score);
    lcSave(rows);
    return rows;
  }catch(e){
    console.warn('lbFetch:', e.message);
    return null;
  }
}

// ── push one score to Firebase ──
async function lbPush(name, sc, lv, win){
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

  // Normalise: filter out broken entries
  const safe = (Array.isArray(rows) ? rows : [])
    .filter(function(r){ return r && typeof r === 'object' && r.name && typeof r.score === 'number'; });

  if(safe.length === 0){
    list.innerHTML = '<div style="text-align:center;color:#5a4018;font-size:13px;padding:24px 0;letter-spacing:1px;">ჩანაწერი ჯერ არ არის</div>';
    return;
  }

  // Sort descending by score
  safe.sort(function(a,b){ return b.score - a.score; });

  safe.slice(0, 50).forEach(function(r, i){
    const rank = i + 1;
    const row  = document.createElement('div');
    let cls = 'lb-row';
    if(rank === 1) cls += ' top1';
    else if(rank === 2) cls += ' top2';
    else if(rank === 3) cls += ' top3';
    if(highlightName && r.name === highlightName) cls += ' mine';
    row.className = cls;

    let rankHtml = '<span class="lb-rank">' + rank + '</span>';
    if(rank === 1) rankHtml = '<span class="lb-rank gold">🥇</span>';
    else if(rank === 2) rankHtml = '<span class="lb-rank silver">🥈</span>';
    else if(rank === 3) rankHtml = '<span class="lb-rank bronze">🥉</span>';

    const winBadge = r.win ? ' <span style="font-size:9px;color:#c89820;">⛪</span>' : '';
    const lvlBadge = r.level ? '<span class="lb-lvl">Lv' + r.level + '</span>' : '';

    row.innerHTML =
      rankHtml +
      '<span class="lb-name-col">' + escHtml(r.name) + winBadge + '</span>' +
      '<span class="lb-score-col">' + Number(r.score).toLocaleString() + '</span>' +
      lvlBadge;

    list.appendChild(row);
  });
}

// ── safe HTML escape ──
function escHtml(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── auto-save after game ends ──

async function lbShow(){
  document.getElementById('lb-play').style.display='block';bgmFadeIn(0.28);
  const nameEl=document.getElementById('lb-name');
  nameEl.value=localStorage.getItem('pirali_player_name')||'';
  document.getElementById('lb-name-row').style.display='none';
  document.getElementById('lb-overlay').style.display='flex';
  setTimeout(()=>nameEl.focus(),120);

  // Show cached rows IMMEDIATELY — no waiting
  const cached=lcLoad();
  if(cached.length){
    try{ lbRender(cached,null); }catch(e){}
    document.getElementById('lb-status').textContent=`📱 ${cached.length} (cached) • იტვირთება...`;
  } else {
    document.getElementById('lb-status').textContent='⏳ იტვირთება...';
  }

  // Timeout fallback — if fetch hangs >3s, stop waiting
  let settled = false;
  const fallbackTimer = setTimeout(()=>{
    if(settled) return;
    settled = true;
    const local=lcLoad();
    try{ lbRender(local,null); }catch(e){}
    document.getElementById('lb-status').textContent=
      local.length?`📱 ${local.length} (offline)`:'📱 ჩანაწერი ჯერ არ არის';
  }, 3000);

  try{
    const rows=await lbFetch();
    settled = true;
    clearTimeout(fallbackTimer);
    if(rows !== null){
      try{ lbRender(rows,null); }catch(e){ console.warn('lbRender error',e); }
      document.getElementById('lb-status').textContent=
        rows.length?`🌐 ${rows.length} მოთამაშე`:'🌐 ჩანაწერი ჯერ არ არის';
    } else {
      // Firebase unreachable — show local cache
      const local=lcLoad();
      try{ lbRender(local,null); }catch(err){}
      document.getElementById('lb-status').textContent=
        local.length?`📱 ${local.length} (offline)`:'📱 ჩანაწერი ჯერ არ არის';
    }
  }catch(e){
    settled = true;
    clearTimeout(fallbackTimer);
    const local=lcLoad();
    try{ lbRender(local,null); }catch(err){}
    document.getElementById('lb-status').textContent=
      local.length?`📱 ${local.length} (offline)`:'📱 ჩანაწერი ჯერ არ არის';
  }
}

function lbSetupSave(){} // disabled - URL hardcoded

async function autoSaveScore(sc,lv,win){
  if(!sc || sc <= 0) return;  // skip zero scores
  const name = localStorage.getItem('pirali_player_name') || 'ანონიმი';
  try{ await lbPush(name, sc, lv, win); }catch(e){}
}

async function lbSave(){
  const nameEl=document.getElementById('lb-name');
  const name=nameEl.value.trim().slice(0,14)||'ანონიმი';
  document.getElementById('lb-name-row').style.display='none';
  document.getElementById('lb-status').textContent='⏳ ინახება...';
  const rows=await lbPush(name,_pendingScore,_pendingLevel,_pendingWin);
  lbRender(rows,name);
  document.getElementById('lb-status').textContent=
    rows.length ? `🌐 ${rows.length} მოთამაშე • ✅ შენახულია` : `✅ შენახულია`;
}

function lbPlay(){
  document.getElementById('lb-overlay').style.display='none';
  document.getElementById('lb-play').style.display='none';
  startGame();
}

