# PIRALI Beta 1.26 — coordinated combat, boss warnings, mobile map

New **Player** and **Developer** browser previews are based on Beta 1.25.2, with all earlier releases preserved.

## Preview URLs
- Player: https://piraligame.github.io/pirali/beta126-play/index.html
- Developer: https://piraligame.github.io/pirali/beta126-dev/index.html

## Improvements
1. **Coordinated enemy movement:** saber (green) closes directly; rifle (yellow) stays at distance and uses nearby saber as cover; officer (red) alternates flank wings. Spatial bins avoid repeated full-list neighbor scans. Existing combat speed, damage, HP, range and firing intervals remain unchanged.
2. **Visual-only combat feedback:** short, capped hit reactions in enemy/general rendering; original Mauser recoil, sword visuals and hit sparks retained. Bullet trajectories, collision and damage unchanged.
3. **Boss patterns with readable warnings:** every third *eligible normal volley* is replaced by the General's crossing fan or the Devil's inferno ring. 26-frame warning, same number/speed/lifetime of bullets; no extra shots, boss HP change or new boss damage. Existing charging/slam and second General remain.
4. **Mobile performance:** tree collision and tactical steering use cached spatial grids, heading computations are throttled one of two ticks, minimap refresh changes 15 to ~10 Hz while gameplay still updates normally. One fixed visual quality; no graphics picker.
5. **Minimap:** distinct high-contrast diamond boss markers, including offscreen direction, clearer goal ring, localized boss legend (KA/EN/RU/ZH), hide/show saved under the existing key.

## Preserved contract
- Same 11-stage balance, enemy strengths, stage progression, level names, four languages, checkpoint key, stats and 100/500 lifetime achievements.
- Same Beta 1.22-style Classic A joystick, existing touch buttons and world assets.
- Player: *no* stage replay/selection; only stage 1 normal start or actual saved checkpoint continuation.
- Developer: only tour selection 1–11 and invincibility; remote Firebase writes blocked.
- No Firebase data/rules/leaderboard reset; Player Beta 1.26 remains a web preview, season release disabled. No APK or AAB generated and nothing deployed to Google Play.

## Tested
- `node qa/pirali-beta126.cjs` PASS (both copies, JavaScript syntax, assets, balances, AI cache, boss warning timing and bullet counts).
- `node qa/pirali-beta125-milestones.cjs` PASS (99→100 and 499→500 boundaries).
- `node qa/pirali-beta126-browser.cjs` PASS (local server + headless Chrome Pixel-class emulation, Player/Developer, all 11 stages, no runtime JS errors, Developer stage jump, no Player replay).
- Tests block Firebase access. They do not represent a complete human playthrough of all boss encounters or performance certification on all real Android devices.

GitHub Pages must be allowed to deploy the new folder; these URLs are previews and not the Google Play package.
