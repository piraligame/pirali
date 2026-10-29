# PIRALI Beta 1.22 — Classic A joystick restored + minimal Developer test panel

**Player and Developer test versions** based on Beta 1.21; no Google Play APK/AAB was created.

## Completed changes
- Replaced both `beta122-play/js/runtime/combat.js` and `beta122-dev/js/runtime/combat.js` with the **identical file** from `beta120-play/js/runtime/combat.js` (Classic A / Beta 1.18 joystick) without any additional visual or directional restriction.
- Developer-only `js/preview-controls.js`: removed **1-hit damage** simulator, **give laurel shield** simulator, and **jump to final boss** shortcut.
- Developer test menu now contains **stage buttons 1–11 and invincibility on/off** (plus title and explanatory label). Game attacks, actual shield and bosses still work normally.
- Player edition has **no Developer test panel**.
- Isolated Beta 1.22 checkpoint storage keys; no production Firebase writes in previews.
- Preserved Beta 1.21 mechanics and balance: stage 5 extra Mauser ammo, stage 6 -15% tuning, stage 9 score limit, stage 11 waves, min-map and languages.

## QA
- GitHub Actions passed `node qa/pirali-beta122-regression.cjs`.
- Verified original joystick file byte-for-byte matches Beta 1.20 A in both versions; all 11 Developer stage buttons and immortality toggle work, and removed commands are absent.
- Manual touch gameplay on an Android phone is still required before a signed Android APK/AAB.

## Test links after GitHub Pages deployment
- Player: https://piraligame.github.io/pirali/beta122-play/index.html
- Developer: https://piraligame.github.io/pirali/beta122-dev/index.html

Old Beta 1.20 A/B and Beta 1.21 web builds are preserved.
