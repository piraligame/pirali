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
