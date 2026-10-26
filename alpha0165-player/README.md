# PIRALI 0.16.5 — Player Online (11-stage Season 1)

**Player web URL:** https://piraligame.github.io/pirali/alpha0165-player/?v=0165cloud1

## Live Firebase integration

- This is the first **Player web build with Firebase score submissions enabled**, while the old Player RC, DEV and the current public game stay untouched.
- Firebase Realtime Database: `https://pirali-game-default-rtdb.firebaseio.com/scores_11stage_s1_5k_2026`. The old five-stage `/scores` dataset is NOT read, copied, reset, or modified by this version.
- A fresh eligible run starts at **stage 1, score 0**; up to **5,000 story points** and **+500 stage 11 bonus** can be earned; no artificial free points.
- Every ended **new, non-checkpoint** run sends `season, name, score, level, win, churchCleared, hellCleared, naganCleared, kills, endlessKills, durationMs, gameVersion, ts, runId` to Firebase.
- TOP 30 displays the best score for each normalized name, keeping milestones if earned in another attempt. DEV-only and resumed practice records do not qualify.
- The player's **existing nickname and language are preserved**; a new separate personal-statistics store starts at zero, with achievements and personal bests tracked locally.
- Online result verification: a green Firebase saved notice appears only after successful HTTP POST with a valid Firebase receipt.
- If the network or database rules block saving, an amber warning appears, and the run is retained in a **device-local retry queue**. This is NOT presented as a cloud-saved result. Queued runs are re-sent when the leaderboard is reopened.
- The ordinary personal stats dashboard is still **local-only**, not cross-device synced to an authenticated player account. The Firebase results include each completed run's basic stats.

## Important server-side setup

The REST client has been configured to post only into this new-season path, but **actual Firebase permissions and live read/write access could not be independently verified**. Firebase Security Rules must allow appropriately authenticated writes and restrict data validity; a public nickname-only system is vulnerable to forged scores. Do not treat a browser-side score cap as server-side anti-cheat. A backend account/authenticated rules setup is recommended for a broadly public release.

DEV/RC remain read-only. No Android APK/AAB was built, and no Google Play rollout has been performed.
