# PIRALI Alpha 0.15 — Google Play submission kit

## Build identity
- App name (Android launcher): **PIRALI**
- Package ID: `ge.piraligame.pirali` — unchanged across alpha versions.
- Version name: `0.15`; version code: **18** (greater than Alpha 0.14.2 / 17).
- Android min SDK 24, target SDK 36.
- The private upload signing key must be reused. Keep all signing credentials outside GitHub.
- Signed APK (device testing): `downloads/PIRALI_Alpha_Test_0.15_FINAL.apk`.
- Signed AAB (Play upload): `downloads/PIRALI_Alpha_Test_0.15_FINAL.aab`.
- Public player (no debug UI): `alpha015-play/`.
- Developer-only QA (no Firebase score writes): `alpha015-test/`.
- Baseline Alpha 0.14.2 and all previous links stay unchanged.

## Quality and safety changes
- Approved Simona Study D, weapons, 5-level path/church positions, spread church guards, sword cooldown 20% faster and multitouch weapon switching all retained.
- Android back navigation now closes the privacy dialog rather than pausing the game / showing exit confirmation behind it.
- Native app label / Capacitor appName / web manifest updated to **PIRALI**, not `PIRALI Alpha Test`.
- Online leaderboard and Firebase database logic and records unchanged.
- QA: 100 generated worlds, mobile portrait/landscape sword cooldown and multitouch tests, and privacy Back regression.

## Suggested Play Console store listing
App title: **PIRALI**
Short description (English):
A Georgian legend of courage. Fight across five stages as Simona Dolidze.

Full description (English):
PIRALI is a top-down action adventure inspired by a Georgian outlaw legend. Guide Simona Dolidze through forest paths and villages toward the church. Fight enemy soldiers with a Mauser, sword and hunting shotgun. Master movement, quick attacks and weapon switching, survive five challenging stages, face the final boss, and compete on the optional online leaderboard.

Features:
• Five Georgian-inspired stages
• Responsive on-screen mobile controls
• Sword, Mauser and hunting shotgun
• Four text languages: Georgian, English, Russian and Chinese
• Optional online leaderboard (nickname and score)
• Free to play; no advertisements or in-app purchases in this build

## Required Console declarations / checks (not automatically completed)
- Choose **Game**, appropriate action category, free/paid setting, and countries.
- Complete content rating questionnaire accurately: combat, blades and firearms are depicted. Do **not** select 'Everyone' without evaluation.
- Specify target age group based on developer intention; check any child-directed rules if applicable.
- Privacy policy URL (after deploying): `https://piraligame.github.io/pirali/alpha015-play/privacy.html` and make it available inside the app.
- Data safety questionnaire: optional online nickname, score, level, victory state and timestamp are transmitted to Google Firebase Realtime Database; network providers can process technical connection data such as IP. Local preferences and stats are stored on device. Review SDK and server settings before selecting data categories.
- Ads: none; purchases: none, provided the published build remains identical.
- Add support email: `piraligameofficial@gmail.com`.
- Draft assets prepared for developer review: `store-assets/feature-graphic-1024x500.png` (1024×500), `store-assets/screenshots/PIRALI_01_MainMenu.png` (1080×1920), `store-assets/screenshots/PIRALI_02_Gameplay.png` (780×1440), plus the existing 512×512 launcher icon. Check the actual Console requirements and approve the visual content before submission.
- Complete country availability, contact details, declarations and app access (game has no account login).
- First-time personal developer accounts may require a closed test with at least 12 opted-in testers for 14 consecutive days before Production access; verify live Console eligibility.
- Play Console upload, release selection and final submission are separate steps; local AAB creation does not imply publication.

## Post-install test (requires physical Android phone)
Install the APK **over** existing Alpha 0.14.2; confirm the OS upgrades without uninstall. Open app, test portrait/landscape, character movement + sword + gun multitouch, last stage boss/church, pause/resume, native Android Back, privacy policy, online/offline leaderboard, app icon and initial launch.
