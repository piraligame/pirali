'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
let checked = 0;
for (const variant of ['play', 'dev']) {
  const dir = path.join(root, 'beta152-' + variant);
  const read = p => fs.readFileSync(path.join(dir, p), 'utf8');
  const html = read('index.html');
  const info = JSON.parse(read('RELEASE_INFO.json'));
  assert.match(html, new RegExp("window\\.PiraliGameVersion='1\\.52-classic\\." + variant + "'"));
  assert.match(html, /window\.PiraliSeasonReleaseEnabled=false;/);
  assert.match(html, /window\.PiraliVisualPreviewReadonly=(true|false);/);
  assert.equal(info.version, '1.52-beta.1' + (variant === 'dev' ? '-dev' : ''));
  assert.equal(info.firebaseWritesBlocked, true, 'Do not unexpectedly turn on live writes');
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
  const fullPath = read('js/features/full-path/demo.js');
  assert.match(fullPath, /25%-ით/);
  assert.match(fullPath, /25% fewer points/);
}
console.log('PASS Beta 1.52: both variants, all HTML resources, '+checked+' JS syntax checks, 25% full-route penalty, and Firebase test-mode guards.');
