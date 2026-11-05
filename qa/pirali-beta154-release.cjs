'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
let checked = 0;
for (const variant of ['play', 'dev']) {
  const dir = path.join(root, 'beta154-' + variant);
  const read = p => fs.readFileSync(path.join(dir, p), 'utf8');
  const html = read('index.html');
  const info = JSON.parse(read('RELEASE_INFO.json'));
  assert.ok(html.includes("window.PiraliGameVersion='1.54-classic." + variant + "'"));
  assert.ok(html.includes('window.PiraliSeasonReleaseEnabled='+(variant==='play'?'true;':'false;')));
  assert.match(html, /window\.PiraliVisualPreviewReadonly=(true|false);/);
  assert.equal(info.version, '1.54-beta.1' + (variant === 'dev' ? '-dev' : ''));
  assert.equal(info.firebaseWritesBlocked, variant === 'dev', 'Only Player may use live writes');
  assert.equal(info.developerOnly, variant === 'dev');
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const rel = m[1].split('?')[0];
    if (!rel || /^(https?:|data:|#|mailto:)/i.test(rel)) continue;
    if (rel.includes('..')) throw Error('Unsafe reference: ' + rel);
    assert.ok(fs.existsSync(path.join(dir, rel)), 'Missing ' + variant + ' asset ' + rel);
  }
  const walk = base => {
    for (const e of fs.readdirSync(base, { withFileTypes: true })) {
      const f = path.join(base, e.name);
      if (e.isDirectory()) walk(f);
      else if (f.endsWith('.js')) {
        new vm.Script(fs.readFileSync(f, 'utf8'), { filename: f });
        checked++;
      }
    }
  };
  walk(path.join(dir, 'js'));
  const scoring = read('js/features/scoring/stage-awards.js');
  assert.match(scoring, /points\*3\+bonusRemainder/);
  assert.match(scoring, /Math\.floor\(quarters\/4\)/);
  assert.match(scoring, /WAVE_CUMULATIVE\[wavesPaid\]\*0\.75/);
  const board = read('js/runtime/leaderboard.js');
  assert.ok(board.includes('/pirali_release_154_rating'));
  assert.ok(board.includes('pirali_release_154_s1'));
  assert.ok(board.includes("gameVersion:'1.54-beta.1'"));
  assert.ok(board.includes('beta154-'));
  assert.ok(!board.includes("const LB_PATH = FB_URL + '/pirali_beta_rating'"));
  assert.equal(info.leaderboardPath, '/pirali_release_154_rating');
  const fullPath = read('js/features/full-path/demo.js');
  assert.match(fullPath, /25%-ით/);
  assert.match(fullPath, /25% fewer points/);
}
console.log('PASS Beta 1.54: both variants, all HTML resources, '+checked+' JS syntax checks, 25% full-route penalty, and Firebase test-mode guards.');
