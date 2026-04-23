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
