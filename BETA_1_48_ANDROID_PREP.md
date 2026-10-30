# PIRALI Beta 1.48 — Android release preparation

**Target:** 6 November 2026 (seven days after 30 October). This is a planning target, not a scheduled release and not proof of Google Play approval.

## Current deliverables
- Beta 1.48 Player and Developer **web previews** with the 70%-height follow camera.
- Reproducible release-source bundling: `node scripts/prepare-android-beta148.cjs`.
- The script copies **Player only** into `dist/android-web`, checks resource references, icons and version, and rejects any Developer controls. It writes `BUILD_INFO.json` and does not create an APK or AAB.
- Beta 1.47 remains unchanged and can be used to roll back the gameplay.

## Requirements for an uploadable AAB
1. Open Google Play Console for the existing app `ge.piraligame.pirali`. Confirm production eligibility and **the next unused versionCode**. Previous signed Beta 1.15 used 20; **21 is a candidate only**, not a verified available code.
2. On the authorized laptop use the **existing upload signing keystore**, never a new key. Preserve it locally; do not upload keys, passwords or environment files to GitHub.
3. Generate the Beta 1.48 Player web bundle with the script and check `BUILD_INFO.json`. Before a public release, separately validate Firebase rules and whether `PiraliSeasonReleaseEnabled` may safely be enabled in the *release bundle*. GitHub previews must remain isolated from the real leaderboard.
4. Once verified, set the Android Gradle `versionCode` to the unused number and `versionName` to `1.48`, run `npx cap sync android`, then build `assembleRelease` and `bundleRelease` with the existing signing environment.
5. Confirm applicationId `ge.piraligame.pirali`, upload-certificate match, language assets, Player-only content, and SHA-256 of the final AAB. Upload AAB through the existing Play Console app's release track.
6. Run a manual phone smoke test: stage 1 camera after movement (player near 70% screen), all quests, stage 10 devil, stage 11 final outcome, joystick, purchases/unlocks, score limits, local save and leaderboard.

**Unfinished:** Google Play eligibility, online Firebase write rules, unused versionCode confirmation, signed AAB and real-device QA. The authorized Desktop Commander computer was offline when preparing this update. Nothing has been uploaded to Play.

## Player links
- https://piraligame.github.io/pirali/beta148-play/
- https://piraligame.github.io/pirali/beta148-dev/

## Update summary for release notes (KA)
- კამერის ახალი ხედვა: სიმონა თამაშისას ეკრანის ქვედა ნაწილში რჩება, რათა წინ მტრები, გზები და ტყვიები ადრე გამოჩნდეს.
- დასაწყისსა და მოძრაობაში კამერის პოზიცია გათანაბრებულია.
- შენარჩუნებულია Beta 1.47-ის გამჭვირვალე შეტყობინებები და წინა ბალანსი.
