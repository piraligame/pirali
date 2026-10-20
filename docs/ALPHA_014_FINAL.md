# PIRALI Alpha 0.14 — FINAL / 2026-10-20

**Production Android version:** `versionName 0.14`, `versionCode 15`. Same package name and private signing identity as Alpha 0.13 and first Alpha 0.14, so can update without uninstalling. Version code increased from 14 to 15 explicitly to update over a previously installed Alpha 0.14.

## Approved features
- Study D approved Simona: Alpha 0.13 body/head/chokha with Alpha 0.14 Mauser, sword, hunting shotgun graphics.
- Weapon switch moved up ~13px; displays four shotgun shells + exact ammo count, dynamically decrementing as shots fire.
- "მოი აგერ!" dash cooldown line placed exactly above and aligned with its own button.
- All five original stages, online leaderboard, 4 languages, updated menu and standard game HUD preserved.

## Channels
- Final browser player (without developer controls): `/alpha014-play/`.
- Developer-only web preview (Firebase writes blocked): `/alpha014-test/`.
  - Development panel now includes **five-stage switching**, **immortality toggle**, and **one boss teleport**.
  - Removed redundant separate "church teleport" button because boss teleport reaches the same encounter.
  - No changes made to Google Play build from this developer test panel.
- Final signed Android APK: `/downloads/PIRALI_Alpha_Test_0.14_FINAL.apk`.
- Play Console upload AAB: `/downloads/PIRALI_Alpha_Test_0.14_FINAL.aab`.
- Final download page: `/downloads/alpha014-final.html`.
- Original Alpha 0.13 `/play/`, old APK/AAB and earlier Alpha 0.14 packages are NOT overwritten.

## QA and signing
- Dev HUD mobile portrait 390×844 and landscape 844×390: four cartridge graphics (4→3 after firing), correct dash line placement and 50% cooldown, zero JavaScript or asset errors, no Firebase writes.
- Final player smoke: all 5 tours, stage 5 shotgun pickups, clean player UI, no unexpected Firebase writes or JavaScript errors.
- Developer controls: five stages, single boss teleport, no church teleport, no online leaderboard writes.
- APK and AAB: Gradle assembled and signed successfully. APK key certificate matches Alpha 0.13. Android package: `ge.piraligame.pirali`.
- Device update is user-tested separately; no physical phone installation performed by assistant.
