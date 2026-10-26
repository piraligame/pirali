const FB_URL  = 'https://pirali-game-default-rtdb.firebaseio.com';
// New eleven-stage season stays isolated from pre-2026 five-stage /scores records.
// Legacy /scores are archived intact; new release season begins with an empty independent path.
const LB_PATH = FB_URL + '/pirali_beta_rating';
const LB_KEY  = window.PiraliSeasonReleaseEnabled===true?'pirali_lb_beta_1_0_s1_prod':'pirali_lb_beta_1_0_s1_rc';
const LB_LIMIT=30;
const DEV_RUN_KEY='pirali_lb_beta_1_0_s1_rc_runs';
const SEASON_ID='pirali_beta_1_0_s1';
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
    if(!key||!Number.isFinite(row.score)||!Number.isInteger(row.score)||row.score<=0||row.score>5500)continue;
    // Official season must never display a developer/prerelease test result.
    if(window.PiraliSeasonReleaseEnabled===true&&(row.dev===true||row.practice===true))continue;
    const lv=Number(row.level);
    const validLevel=Number.isInteger(lv)&&lv>=1&&lv<=11;
    const won=row.win===true;
    // Legacy (pre-Hell) level-5 wins retain their church badge.
    const church=row.churchCleared===true || (validLevel&&(lv>=8||(lv===7&&won)||(lv===5&&won)));
    const hell=row.hellCleared===true || (validLevel&&(lv===11||(lv===10&&won)));
    // Nagan is an achievement, not an automatic level-11 arrival badge.
    // Bonus stage is endless; unlock only after earning the full +500 bonus.
    const nagan=row.naganCleared===true;
    const devChurch=row.devChurch===true||(row.dev===true&&church);
    const devHell=row.devHell===true||(row.dev===true&&hell);
    const previous=byName.get(key);
    const merged={
      ...(previous&&previous.score>=row.score?previous:row),
      name:(previous&&previous.score>=row.score?previous.name:row.name).normalize('NFKC').replace(/\s+/g,' ').trim(),
      churchCleared:Boolean(previous?.churchCleared||church),
      hellCleared:Boolean(previous?.hellCleared||hell),
      naganCleared:Boolean(previous?.naganCleared||nagan),
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
const SEASON_LABEL='🏆 ფირალი BETA 1.0 • TOP 30';
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

// PLAYER 0.16.5 cloud status and offline retry queue; not shared with DEV.
const LB_PENDING_KEY='pirali_lb_beta_1_0_s1_pending';
let lbLastPushStatus='idle',lbLastError='',lbRetrying=null,lbLastRetryAt=0;
function lbPending(){
 try{
  const rows=JSON.parse(localStorage.getItem(LB_PENDING_KEY)||'[]');
  return Array.isArray(rows)?rows.slice(-30).filter(r=>r&&r.season===SEASON_ID&&
    typeof r.name==='string'&&Number.isInteger(r.score)&&r.score>0&&r.score<=5500&&
    r.dev!==true&&r.practice!==true):[];
 }catch(e){return []}
}
function lbSetPending(rows){try{localStorage.setItem(LB_PENDING_KEY,JSON.stringify(rows.slice(-30)))}catch(e){}}
function lbQueue(entry){
 const rows=lbPending();
 if(!rows.some(r=>r.runId===entry.runId))rows.push(entry);
 lbSetPending(rows);
}
// Write directly to a unique record child, not to the parent with POST.
 // The Firebase /pirali_beta_rating/$record ".write" rule is evaluated for PUT.
function lbRecordUrl(entry){
 const key=String(entry?.runId||'');
 if(!/^beta10-[a-z0-9]+-[a-z0-9]{8,12}$/.test(key))throw Error('Invalid Beta record key');
 return LB_PATH+'/'+key+'.json';
}
function lbSameEntry(data,entry){
 return Boolean(data&&data.runId===entry.runId&&data.season===SEASON_ID&&
  data.score===entry.score&&data.name===entry.name&&data.level===entry.level);
}
async function lbPostEntry(entry){
 const url=lbRecordUrl(entry);
 let res;
 try{res=await fetch(url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(entry)});}
 catch(e){throw Error('Network: '+String(e?.message||e));}
 if(res.ok){
  const receipt=await res.json();
  if(!lbSameEntry(receipt,entry))throw Error('Firebase did not confirm Beta entry');
  return entry.runId;
 }
 // A previous PUT may have succeeded even if its response was lost; only
 // treat the retry as saved when Firebase returns the exact same record.
 let existing=null;
 try{
  const read=await fetch(url);
  if(read.ok)existing=await read.json();
 }catch(e){}
 if(lbSameEntry(existing,entry))return entry.runId;
 let message='';
 try{
  if(typeof res.text==='function'){
   const raw=(await res.text()).slice(0,320);
   const body=JSON.parse(raw);
   message=String(body?.error||'').slice(0,100);
  }
 }catch(e){}
 throw Error('Firebase HTTP '+res.status+(message?' • '+message:''));
}
async function lbRetryPending(force=false){
 if(window.PiraliVisualPreviewReadonly||window.PiraliSeasonReleaseEnabled!==true)return 0;
 if(lbRetrying)return lbRetrying;
 if(!force&&Date.now()-lbLastRetryAt<60000)return 0;
 lbLastRetryAt=Date.now();
 lbRetrying=(async()=>{
  let saved=0;
  for(const entry of lbPending()){
   try{
    await lbPostEntry(entry);
    lbSetPending(lbPending().filter(r=>r.runId!==entry.runId));
    saved++;
   }catch(e){lbLastError=String(e?.message||e);break}
  }
  return saved;
 })();
 try{return await lbRetrying}finally{lbRetrying=null}
}
function lbReadableError(){
 const reason=String(lbLastError||'');
 if(/HTTP 401|HTTP 403|permission.denied|Permission denied/i.test(reason))
   return 'Firebase არ უშვებს ჩაწერას (HTTP 401/403). საჭიროა ახალი სეზონის Database Rules.';
 if(/HTTP 404/.test(reason))return 'Firebase-ის ბაზა ვერ მოიძებნა (HTTP 404). შესამოწმებელია Database URL.';
 if(/HTTP 400/.test(reason))return 'Firebase უარყოფს ჩანაწერის ფორმატს (HTTP 400).';
 if(/HTTP 5\d\d/.test(reason))return 'Firebase-ის სერვერზე დროებითი შეცდომაა ('+reason.slice(0,60)+').';
 if(/Failed to fetch|NetworkError|fetch/i.test(reason))return 'კავშირის ან CORS-ის შეცდომა — Firebase მიუწვდომელია.';
 return reason?'Firebase-ის პასუხი: '+reason.slice(0,90):'Firebase-ში ჩაწერა ვერ დადასტურდა.';
}
function lbShowCloudStatus(message,allowRetry=false){
 const box=document.querySelector('#screen .sbox');
 if(!box)return;
 let node=box.querySelector('.pirali-cloud-status');
 if(!node){
  node=document.createElement('div');
  node.className='pirali-cloud-status';
  node.style.cssText='font-size:12px;text-align:center;color:#f5d98a;margin:10px 0;';
  box.appendChild(node);
 }
 node.textContent=message;
 let button=box.querySelector('.pirali-retry-firebase');
 if(!button&&allowRetry){
  button=document.createElement('button');button.type='button';button.className='pirali-retry-firebase';
  button.textContent='↻ Firebase-ზე ხელახლა გაგზავნა';
  button.style.cssText='display:block;margin:8px auto;padding:10px 15px;border:1px solid #cb9a3d;border-radius:9px;background:#281807;color:#ffdc88;font-weight:bold;';
  button.addEventListener('click',async()=>{
   button.disabled=true;lbShowCloudStatus('⏳ ხელახლა იგზავნება...');
   const count=await lbRetryPending(true);
   if(count>0&&lbPending().length===0){
    lbLastPushStatus='saved';lbLastError='';
    lbShowCloudStatus('',false);document.querySelector('#screen .pirali-cloud-status')?.remove();button.remove();window.PiraliOutcomeRank?.refresh?.();
   }else{
    lbShowCloudStatus('⚠️ '+lbReadableError(),true);button.disabled=false;
   }
  });
  box.appendChild(button);
 }else if(button&&!allowRetry&&lbPending().length===0)button.remove();
}
// ── push one score to Firebase ──
async function lbPush(name, sc, lv, win){
  // Resumed games are unranked, including in the local developer preview.
  // Checkpoint runs are unranked; never send their points to Firebase.
  if(window.PiraliCheckpoint?.isResumedRun())return lcLoad();
  if(!Number.isInteger(sc)||sc<=0||sc>5500||!Number.isInteger(lv)||lv<1||lv>11) { const r = await lbFetch(); return r || lcLoad(); }
  const runStats=window.PiraliStats?.debug?.()||{};
  const entry = {
    name  : (name||'').trim().slice(0,20) || 'ანონიმი',
    score : sc,
    level : lv,
    season: SEASON_ID,
    gameVersion:'1.03-beta.1',
    win   : !!win,
    churchCleared: Number(lv)>=8 || (Number(lv)===7&&!!win),
    hellCleared: Number(lv)>=11 || (Number(lv)===10&&!!win),
    // This can only be earned by a new non-checkpoint run that reaches
    // the full 500-point endless bonus (NOT simply reaching stage 11).
    naganCleared: Number(lv)===11 && Number(window.PiraliStageScoring?.bonusEarned?.()||0)>=500,
    kills:Number.isInteger(runStats.kills)?Math.min(100000,Math.max(0,runStats.kills)):0,
    endlessKills:Number.isInteger(runStats.endlessKills)?Math.min(100000,Math.max(0,runStats.endlessKills)):0,
    durationMs:Number.isFinite(runStats.totalMs)?Math.min(86400000,Math.max(0,Math.round(runStats.totalMs))):0,
    runId:'beta10-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,11),
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
  // Real Firebase acknowledgement, not merely a local score.
  lbLastPushStatus='sending';lbLastError='';
  let pushOk=false;
  try{await lbPostEntry(entry);pushOk=true;}
  catch(e){lbLastError=String(e?.message||e);console.warn('lbPush:',lbLastError);}
  if(pushOk){
    lbLastPushStatus='saved';
    lcSave([...lcLoad(),entry]);
    lbRetryPending().catch(()=>{});
    const rows=await lbFetch();
    return rows!==null?rows:lcLoad();
  }
  lbLastPushStatus='pending';
  lbQueue(entry);
  // Offline fallback: add to local cache; NOT marked as saved online
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

    const gunBadges={
      ka:'სიმონას ნაგანი — მე-11 ტურის 500 ბონუს-ქულა',
      en:"Simona's Nagan — earned the full 500-point bonus in stage 11",
      ru:'Наган Симоны — все 500 бонусных очков на 11-м этапе',
      zh:'西蒙娜的纳甘手枪 — 第11关获得全部500奖励分'
    };
    const gunTitle=escHtml(gunBadges[window.PiraliLanguage?.getLanguage?.()||'ka']||gunBadges.ka);
    const winBadge=(r.churchCleared?
      '<span class="lb-milestone-church" title="ეკლესია გავლილია">⛪</span>':'')+
      (r.hellCleared?'<span class="lb-milestone-hell" title="სიმონას ჯოჯოხეთი გავლილია">✝️</span>':'')+
      (r.naganCleared?'<span class="lb-milestone-nagan" title="'+gunTitle+'" aria-label="'+gunTitle+'" role="img"><img src="assets/icons/mauser-pistol.png?v=20261016a" alt="" draggable="false"></span>':'')+
      ((r.devChurch||r.devHell||r.dev&&r.naganCleared)?'<span class="lb-milestone-dev" title="მხოლოდ ლოკალური სატესტო ჩანაწერი">🧪</span>':'');
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
  if(window.PiraliSeasonReleaseEnabled===true)lbRetryPending().then(n=>{
   if(n>0){const status=document.getElementById('lb-status');if(status)status.textContent='✅ Firebase-ში გადატანილია '+n+' შენახული შედეგი';}
  }).catch(()=>{});
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
 if(window.PiraliCheckpoint?.isResumedRun())return {saved:false,skipped:true};
 if(!Number.isInteger(sc)||sc<=0)return {saved:false,skipped:true};
 const name=localStorage.getItem('pirali_player_name')||'ანონიმი';
 try{
  await lbPush(name,sc,lv,win);
  if(lbLastPushStatus==='saved'){
   // Success is represented by the online rank above; do not show a duplicate banner.
   document.querySelector('#screen .pirali-cloud-status')?.remove();
   document.querySelector('#screen .pirali-retry-firebase')?.remove();
   return {saved:true};
  }
  lbShowCloudStatus('⚠️ '+lbReadableError()+' ქულა მოწყობილობაზე შენახულია.',true);
  return {saved:false};
 }catch(e){
  lbLastError=String(e?.message||e);
  lbShowCloudStatus('⚠️ '+lbReadableError(),true);
  return {saved:false};
 }
}

async function lbSave(){
  const nameEl=document.getElementById('lb-name');
  const name=nameEl.value.trim().slice(0,14)||'ანონიმი';
  document.getElementById('lb-name-row').style.display='none';
  document.getElementById('lb-status').textContent=lbT('saving');
  const rows=await lbPush(name,_pendingScore,_pendingLevel,_pendingWin);
  lbRender(rows,name);
  document.getElementById('lb-status').textContent=lbLastPushStatus==='saved'?'✅ Firebase-ში შენახულია':'⚠️ '+lbReadableError();
}

function lbPlay(){
  document.getElementById('lb-overlay').style.display='none';
  window.PiraliLeaderboardScrollGuard?.setOpen(false);
  document.getElementById('lb-play').style.display='none';
  startGame();
}


// Repaint text on the currently visible results without touching Firebase.
document.addEventListener('pirali:languagechange',function(){if(document.getElementById('lb-overlay')?.style.display==='flex')lbRender(lbLastRows,null);});
