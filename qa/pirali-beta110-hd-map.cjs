'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const hashes = [];
for (const role of ['play', 'dev']) {
  const root = path.join(__dirname, '..', 'beta110-' + role);
  const asset = fs.readFileSync(path.join(root, 'assets/maps/pirali-approved.webp'));
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const js = fs.readFileSync(path.join(root, 'js/features/map/story-map.js'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'css/story-map.css'), 'utf8');
  const metadata = JSON.parse(fs.readFileSync(path.join(root, 'RELEASE_INFO.json'), 'utf8'));

  assert.equal(asset.toString('ascii', 0, 4), 'RIFF', role + ': invalid RIFF');
  assert.equal(asset.toString('ascii', 8, 12), 'WEBP', role + ': not WebP');
  assert.equal(asset.toString('ascii', 12, 16), 'VP8 ', role + ': unexpected WebP encoding');
  assert.equal(asset.readUInt16LE(26) & 0x3fff, 1024, role + ': image width changed');
  assert.equal(asset.readUInt16LE(28) & 0x3fff, 1536, role + ': image height changed');
  assert(asset.length > 400000, role + ': image replaced by low-resolution placeholder');
  assert.equal(metadata.mapAsset, 'assets/maps/pirali-approved.webp');
  assert.equal(metadata.mapAssetCacheVersion, 'beta110-hd-20261027');
  assert.equal(css.includes('aspect-ratio:1024/1536'), true, role + ': map aspect ratio stale');
  assert(html.includes('css/story-map.css?v=beta110-hd-20261027'), role + ': CSS cache key stale');
  assert(html.includes('js/features/map/story-map.js?v=beta110-hd-20261027'), role + ': JS cache key stale');
  assert(js.includes('assets/maps/pirali-approved.webp?v=beta110-hd-20261027'), role + ': image cache key stale');
  assert(js.includes('{n:11,'), role + ': stage 11 missing');
  assert(fs.existsSync(path.join(root, 'js/features/map/live-minimap.js')), role + ': in-game minimap missing');
  assert(fs.existsSync(path.join(root, 'js/features/loot/large-heart.js')), role + ': health upgrades missing');
  if (role === 'play') assert(!html.includes('<script src="js/preview-controls.js'), 'Developer controls leaked into Player');
  else assert(html.includes('<script src="js/preview-controls.js'), 'Developer controls not present');

  hashes.push(crypto.createHash('sha256').update(asset).digest('hex'));
  console.log('PASS Beta 1.10 ' + role + ': HD map, cache, 11 stages, minimap, separation');
}
assert.equal(hashes[0], hashes[1], 'Player/Developer HD images differ');
console.log('PASS Beta 1.10 HD artwork identical across both versions');
