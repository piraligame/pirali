# PIRALI Alpha 0.16.4 — Season 1 release candidate

**Preview:** https://piraligame.github.io/pirali/alpha0164-release-candidate/?v=0164s1rc1

Separate clone of latest 11-stage 0.16.4 DEV balance. NOT the official player release; does not include level-skip/invincibility controls.

## Fresh 11-stage season
- Firebase scores use ONLY `/scores_11stage_release_s1_2026`; legacy five-stage `/scores` remains intact.
- Only season-tagged `season: "11stage_s1_2026"` entries appear in TOP 30. If this new path is empty, rankings begin empty; every player begins with zero season points.
- Personal statistics (runs, kills, wins, stage times, badges), offline cache and checkpoint keys are separate from all older seasons. No import from five-stage or DEV/RC testing to real release.
- Each fresh ranked run begins at stage 1 and score 0. Checkpoint resumed runs stay unranked.
- New records include `season`, `gameVersion`, `level`, `score`, and existing church/hell milestones.

## Safety
- `window.PiraliSeasonReleaseEnabled=false` in this RC. This blocks Firebase writes and stores test results locally only.
- RC / PROD use distinct local keys; when officially activated, even RC gameplay scores and achievements are not imported.
- Before official release, authenticate Firebase access; confirm the new path is empty and Firebase rules permit valid season reads/writes; run real online write/read QA; then set `window.PiraliSeasonReleaseEnabled=true` in the official release build.
- The existing public player version, live database, legacy scores and APK/AAB are NOT changed.
- **PENDING:** Firebase admin verification, production security rules, fresh DB creation/first live record, mobile QA, APK/AAB and store release.

## Release rule: reset ONLY upon official 11-stage update

- The **existing public five-stage game and its `/scores` leaderboard keep working unchanged** until the new version is officially deployed. Merely opening the DEV or release-candidate URL does not reset any public record.
- At the launch of the approved 11-stage update, start the new online season from a fresh, independent `/scores_11stage_release_s1_2026` path; no historical rows are copied. This is an **empty leaderboard**, not a deletion of player identities or a display of fictitious zero-score ranking rows.
- **Everyone's new personal statistics begin from zero** on the released build: best score, kill totals, victories, deaths, level times and badges. Old personal data is never migrated; developer and prerelease records are also excluded.
- **Keep the same saved player nickname and selected language**, reading the existing `pirali_player_name` and `pirali_language` keys. Avoid uninstalling the existing Android app or changing its package ID/signing identity when publishing an update, so these app-local settings survive.
- Each new *ranked* game starts at level 1, score 0; checkpoint continuations are practice-only and unranked. Existing season 1 records then accumulate normally, not reset every time the app opens.
- Test/RC leaderboard submissions remain local and excluded from official ranking, including if a `dev:true` record somehow exists in the online season store.
- **Before launch:** verify the fresh path is empty, secure correct Firebase read/write access, confirm one genuine production submission persists and displays, and test an Android in-place update with nickname/language retention. Only then activate `PiraliSeasonReleaseEnabled` in the final approved release, not in DEV/RC.

**Implementation status:** release candidate safeguards prepared in source; Firebase project write validation and APK/AAB production release have not yet been performed.


## Alpha 0.16.4d — 5,000+500 new-season score scale
- New 11-stage release season starts **empty**, with 0 points at stage 1 and separate online TOP 30. Uses only `/scores_11stage_s1_5k_2026` and season ID `11stage_s1_5k_2026` (old five-stage `/scores` stays unchanged).
- Main stages 1–10: **5,000 earned points maximum**; scores come from kills, bosses, parries, medals and x2 combos (within 2 seconds). Gate gives **zero** free points.
- Hell Devil collectible Heart now awards **250** instead of 5,000; regular level-10 reward ledger maximum 180.
- Endless bonus stage 11: each kill +5, consecutive kill within one second +10, cumulative bonus **limited to +500 above actual stage-10 story score**. Absolute total max **5,500**, not an automatic reward. Survival continues when score reaches cap.
- New isolated local ranking cache, personal statistics and checkpoints (5K season); **saved nickname and language preserved**. DEV/RC results excluded from production, which remains write-disabled until launch approval and Firebase rules verification.
- Existing published app, historical records and older Alpha test URLs remain unchanged. NOT yet a Firebase-tested, official APK/AAB release.


## 0.16.4e — Authentic red Nagan leaderboard badge
- In TOP 30, reuse exactly the same `assets/icons/mauser-pistol.png` visual as the lower-right **red fire button**, with its deep red circular gradient and border, NOT an old gun emoji or unrelated pistol illustration.
- Badge beside player name is ordered **church ⛪, cross ✝️, red Nagan image**.
- The 11th stage is endless, so its clear achievement is **earning the full +500 bonus points on stage 11** (from a fresh ranked run). Merely reaching stage 11 or dying there before +500 does not grant it.
- Store `naganCleared: true` in the player result only after the milestone; merge records by normalized name with OR so the badge persists even if a later best-score record is weaker on milestones.
- Test/DEV entries remain local-only; official Firebase write gate remains OFF in DEV and release candidate. New-season 5K/500 scoring and `/scores_11stage_s1_5k_2026` are unchanged.

### Stage 10 coin collection gate
After the Devil is defeated, the player can collect the big gold coins for **+250 earned points** before the game continues to stage 11. The coins remain in the world until collected; the next-stage transition does not prematurely remove them. The gate itself still gives **0 points**.
