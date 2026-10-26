const FB_URL  = 'https://pirali-game-default-rtdb.firebaseio.com';
// New eleven-stage season stays isolated from pre-2026 five-stage /scores records.
// Legacy /scores are archived intact; new release season begins with an empty independent path.
const LB_PATH = FB_URL + '/scores_11stage_release_s1_2026';
const LB_KEY  = window.PiraliSeasonReleaseEnabled===true?'pirali_lb_11stage_s1_prod':'pirali_lb_11stage_s1_rc';
const LB_LIMIT=30;
const DEV_RUN_KEY='pirali_lb_alpha0164_11stage_s1_rc_runs';
const SEASON_ID='11stage_s1_2026';
function lbT(key){return window.PiraliLanguage?window.PiraliLanguage.t(key):({empty:'ჩანაწერი ჯერ არ არის',loading:'⏳ იტვირთება...',saving:'⏳ ინახება...',saved:'✅ შენახულია',players:'მოთამაშე'})[key]||key;}


// Display-only normalization. No Firebase records are edited or deleted.
// Normalizing NFKC, letter case and whitespace merges visual name duplicates.
function lbNameKey(name){
  return String(name || '').normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();
}
function lbBest(rows){
  // Merge milestones across every run for the same normalized name, not just
  // the highest-scoring run. A later defeat must not erase a completed stage.
  const byName=new Map();
  for(const row of (Array.isArray(rows)?rows:[])){
    if(!row||typeof row!=='object'||typeof row.name!=='string')continue;
    const key=lbNameKey(row.name);
    if(!key||!Number.isFinite(row.score)||row.score<=0)continue;
    // Official season must never display a developer/prerelease test result.
    if(window.PiraliSeasonReleaseEnabled===true&&(row.dev===true||row.practice===true))continue;
    const lv=Number(row.level);
    const validLevel=Number.isInteger(lv)&&lv>=1&&lv<=11;
    const won=row.win===true;
    // Legacy (pre-Hell) level-5 wins retain their church badge.
    const church=row.churchCleared===true || (validLevel&&(lv>=8||(lv===7&&won)||(lv===5&&won)));
    const hell=row.hellCleared===true || (validLevel&&(lv===11||(lv===10&&won)));
    const devChurch=row.devChurch===true||(row.dev===true&&church);
    const devHell=row.devHell===true||(row.dev===true&&hell);
    const previous=byName.get(key);
    const merged={
      ...(previous&&previous.score>=row.score?previous:row),
      name:(previous&&previous.score>=row.score?previous.name:row.name).normalize('NFKC').replace(/\s+/g,' ').trim(),
      churchCleared:Boolean(previous?.churchCleared||church),
      hellCleared:Boolean(previous?.hellCleared||hell),
      devChurch:Boolean(previous?.devChurch||devChurch),
      devHell:Boolean(previous?.devHell||devHell)
    };
    byName.set(key,merged);
  }
  return [...byName.values()].sort((a,b)=>b.score-a.score||lbNameKey(a.name).localeCompare(lbNameKey(b.name)));
}
function lbDevRecords(){
  // RC test scores NEVER enter a live season.
  if(window.PiraliSeasonReleaseEnabled===true)return [];
  // Developer preview saves only on this device. Never migrate into Firebase.
  try{
    const rows=JSON.parse(localStorage.getItem(DEV_RUN_KEY)||'[]');
    return Array.isArray(rows)?rows.slice(-100).filter(r=>r?.dev===true):[];
  }catch(e){return [];}
}
let lbLastRows=[];
const SEASON_LABEL='🏆 11-ტურიანი სეზონი — ახალი შედეგები';
function lbShowPersonal(rows){
  // The public leaderboard presents EXACTLY the ranked TOP 30.
  // Personal records outside those 30 must not be repeated in a separate leaderboard card.
  // The user's own statistics and achievements remain available in the dedicated Stats menu.
  const card=document.getElementById('lb-personal');
  if(card){card.replaceChildren();card.hidden=true;}
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

// ── fetch new-season top scores only; old five-stage records stay archived separately ──
async function lbFetch(){
  try{
    // Simple fetch — no custom headers to avoid CORS preflight blocking
    const res = await fetch(LB_PATH + '.json'); // GET only: read existing data, no write or migration
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if(!data || typeof data !== 'object') return lbBest(lbDevRecords());
    const rows = lbBest([...Object.values(data).filter(r=>r&&r.season===SEASON_ID),...lbDevRecords()]);
    lcSave(rows);
    return rows;
  }catch(e){
    console.warn('lbFetch:', e.message);
    return null;
  }
}

// ── push one score to Firebase ──
async function lbPush(name, sc, lv, win){
  // Resumed games are unranked, including in the local developer preview.
  // Checkpoint runs are unranked; never send their points to Firebase.
  if(window.PiraliCheckpoint?.isResumedRun())return lcLoad();
  if(!sc || sc <= 0) { const r = await lbFetch(); return r || lcLoad(); }
  const entry = {
    name  : (name||'').trim().slice(0,20) || 'ანონიმი',
    score : sc,
    level : lv,
    season: SEASON_ID,
    gameVersion:'0.16.4',
    win   : !!win,
    churchCleared: Number(lv)>=8 || (Number(lv)===7&&!!win),
    hellCleared: Number(lv)>=11 || (Number(lv)===10&&!!win),
    ts    : Date.now()
  };
  // No DEV/RC scores may enter Firebase before a formally enabled release.
  if(window.PiraliVisualPreviewReadonly || window.PiraliSeasonReleaseEnabled!==true){
    const drafts=lbDevRecords();
    drafts.push({...entry,dev:true});
    try{localStorage.setItem(DEV_RUN_KEY,JSON.stringify(drafts.slice(-100)))}catch(e){}
    const merged=lbBest([...lcLoad(),...drafts,entry]);
    lcSave(merged);
    return merged;
  }
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

  // TOP 30 only: one row per player, highest score with milestones; no extra personal row.
  safe.slice(0,LB_LIMIT).forEach(function(r, i){
    const rank = i + 1;
    const row  = document.createElement('div');
    let cls = 'lb-row';
    if(rank === 1) cls += ' top1';
    else if(rank === 2) cls += ' top2';
    else if(rank === 3) cls += ' top3';
    if((highlightName || localStorage.getItem('pirali_player_name')) && lbNameKey(r.name) === lbNameKey(highlightName || localStorage.getItem('pirali_player_name'))) cls += ' mine';
    row.className = cls;

    let rankHtml = '<span class="lb-rank">' + rank + '</span>';
    if(rank === 1) rankHtml = '<span class="lb-rank gold">🥇</span>';
    else if(rank === 2) rankHtml = '<span class="lb-rank silver">🥈</span>';
    else if(rank === 3) rankHtml = '<span class="lb-rank bronze">🥉</span>';

    const winBadge=(r.churchCleared?
      '<span class="lb-milestone-church" title="მეხუთე ტური დასრულებულია">⛪</span>':'')+
      (r.hellCleared?'<span class="lb-milestone-hell" title="სიმონას ჯოჯოხეთი გავლილია">✝️</span>':'')+
      ((r.devChurch||r.devHell)?'<span class="lb-milestone-dev" title="მხოლოდ ლოკალური სატესტო ჩანაწერი">🧪</span>':'');
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
  document.getElementById('lb-sub').textContent=SEASON_LABEL;
  document.getElementById('lb-play').style.display='block';bgmFadeIn(0.28);
  const nameEl=document.getElementById('lb-name');
  nameEl.value=localStorage.getItem('pirali_player_name')||'';
  document.getElementById('lb-name-row').style.display='none';
  window.PiraliLeaderboardScrollGuard?.setOpen(true);
  document.getElementById('lb-overlay').style.display='flex';
  setTimeout(()=>nameEl.focus(),120);

  // Show cached rows IMMEDIATELY — no waiting
  const cached=lcLoad();
  if(cached.length){
    try{ lbRender(cached,null); }catch(e){}
    document.getElementById('lb-status').textContent=`📱 ${cached.length} (${lbT('cached')}) • ${lbT('loading')}`;
  } else {
    document.getElementById('lb-status').textContent=SEASON_LABEL+' • '+lbT('loading');
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
        rows.length?`🌐 ${rows.length} ${lbT('players')}${lbDevRecords().length?' • 🧪 DEV ლოკალური':''}`:'🌐 '+lbT('empty');
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
  if(window.PiraliCheckpoint?.isResumedRun())return;
  if(!sc || sc <= 0) return;  // skip zero scores
  const name = localStorage.getItem('pirali_player_name') || 'ანონიმი';
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
  window.PiraliLeaderboardScrollGuard?.setOpen(false);
  document.getElementById('lb-play').style.display='none';
  startGame();
}


// Repaint text on the currently visible results without touching Firebase.
document.addEventListener('pirali:languagechange',function(){if(document.getElementById('lb-overlay')?.style.display==='flex')lbRender(lbLastRows,null);});
