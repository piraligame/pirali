const FB_URL = 'https://pirali-game-default-rtdb.firebaseio.com';
const LB_PATH = FB_URL + '/scores';
const LB_KEY = 'pirali_lb_v1';

let _pendingScore = 0,
    _pendingLevel = 0,
    _pendingWin = false;

function lcLoad() {
  try {
    const raw = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    const valid = raw.filter(r =>
      r && r.name && typeof r.score === 'number' && r.score > 0
    );

    const best = {};
    valid.forEach(r => {
      if (!best[r.name] || r.score > best[r.name].score) {
        best[r.name] = r;
      }
    });

    return Object.values(best).sort((a, b) => b.score - a.score);
  } catch (e) {
    return [];
  }
}
function lcSave(rows) {
  try {
    localStorage.setItem(LB_KEY, JSON.stringify(rows || []));
  } catch (e) {}
}

async function lbFetch() {
  try {
    const res = await fetch(`${LB_PATH}.json?orderBy="score"&limitToLast=20`);
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    if (!data) return [];

    const rows = Object.values(data)
      .filter(r => r && r.name && typeof r.score === 'number')
      .sort((a, b) => b.score - a.score);

    const best = {};
    rows.forEach(r => {
      if (!best[r.name] || r.score > best[r.name].score) {
        best[r.name] = r;
      }
    });

    const finalRows = Object.values(best).sort((a, b) => b.score - a.score);
    lcSave(finalRows);
    return finalRows;
  } catch (e) {
    return null;
  }
}

async function lbSubmit(name, score, level = 1, win = false) {
  try {
    const payload = {
      name: String(name || 'Player').trim().slice(0, 20),
      score: Number(score || 0),
      level: Number(level || 1),
      win: !!win,
      ts: Date.now()
    };

    const res = await fetch(`${LB_PATH}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('submit failed');
    return true;
  } catch (e) {
    return false;
  }
}

function lbRender(rows, targetId = 'lb-list') {
  const el = document.getElementById(targetId);
  if (!el) return;

  if (!rows || !rows.length) {
    el.innerHTML = '<div style="padding:8px;">ჯერ ჩანაწერი არ არის</div>';
    return;
  }

  el.innerHTML = rows.slice(0, 10).map((r, i) => `
    <div style="display:flex;justify-content:space-between;gap:12px;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <span>#${i + 1} ${r.name}</span>
      <span>${r.score}</span>
    </div>
  `).join('');
}

async function lbLoadAndRender() {
  const onlineRows = await lbFetch();
  if (onlineRows && onlineRows.length) {
    lbRender(onlineRows);
    return onlineRows;
  }

  const localRows = lcLoad();
  lbRender(localRows);
  return localRows;
}

function lbPlay() {
  const overlay = document.getElementById('lb-overlay');
  const playBtn = document.getElementById('lb-play');
  if (overlay) overlay.style.display = 'none';
  if (playBtn) playBtn.style.display = 'none';
  startGame();
}
