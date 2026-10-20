# PIRALI Alpha 0.14 — Study D / signed Android player

## Approved character
- **Alpha 0.13 Simona kept**: body, hat, head, costume silhouette and motion are retained.
- **Alpha 0.14 Study D equipment**: improved Mauser, sword/swing animation, hunting shotgun (approved).
- A/B/C costume studies, Atelier F, and one-level experimental graphics **NOT** shipped.
- 5 existing levels, menu, language switch, Firebase leaderboard, pickups and enemies preserved.

## Distribution
- Android installable APK: `/downloads/PIRALI_Alpha_Test_0.14.apk` (GitHub Pages).
- APK web installer: `/downloads/alpha014.html`.
- AAB for potential Play internal testing is stored locally in `Documents/Codex/PIRALI_ALPHA_RELEASES/PIRALI_Alpha_Test_0.14.aab` and **not** submitted to Play.
- Package: `ge.piraligame.pirali`; versionName `0.14`, versionCode `14`.
- APK SHA-256: `AB7B7F59F39465D2A6CEC4580848782C25EB7AA87F8ADA7E28FF920B43DB18F9`.
- Keystore fingerprint SHA-256: `188b6c379c8a261aced04271d66367cdff91e80f312088c3ca5b2d0bb885c20a`, matches signed Alpha 0.13 so same app ID + newer code can update over installed 0.13 (subject to normal Android installer restrictions).
- Signing secret/password/private keystore are NEVER stored in Git or releases.

## Packaging details
- Built using isolated `feat/alpha-014-work` branch via `scripts/build-alpha014-approved-player.ps1`.
- Custom packaging script `scripts/build-alpha014-player-web.cjs` deliberately packages **only `play/`**; normal root `index.html` is an older development shell and must NOT be shipped.
- The built APK's embedded `assets/public/index.html` enables `PiraliHybrid014`; `js/characters/simona-weapons-only.js` and approved `js/characters/simona.js` are verified inside the APK.
- Chrome QA: 5 levels, shotgun pickup, mobile player menu, 4 language options, no developer controls; no JavaScript errors or unexpected Firebase writes.
- APK signing verification (apksigner), AAB signing (jarsigner), package code/name (aapt), and SHA-256 matched.
- Handset installation was not remotely verified: author should download, install over existing Alpha 0.13 without uninstall, and test gameplay.

## Protect baseline
- `main/play/` still publishes unchanged signed Alpha 0.13 player web game.
- `main/downloads/PIRALI_Alpha_Test_0.13.apk` unchanged.
- Alpha 0.13 signed tag and archives untouched.
- Uploading the new APK to `main/downloads` does not make Alpha 0.14 the main public browser player.
