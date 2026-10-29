# PIRALI Beta 1.28.1 — correct Firebase preview status and clean outcome panel

Based on Beta 1.28, separate Player and Developer web builds. No changes to legacy versions.

## Diagnosis and changes
- Confirmed the live Realtime Database **GET** from /pirali_beta_rating.json works in the mobile browser, returning actual season records. There was **not** a network connectivity failure.
- Beta Player previews deliberately have `PiraliSeasonReleaseEnabled=false`: write operations to the real Firebase database are disabled as agreed. The game was incorrectly treating this intended local-only path as an upload error. Corrected: local score saves are explicitly labelled as local internally; no false "Firebase could not save" message or misleading retry button is displayed.
- The death/victory screen no longer shows a fabricated player TOP-30 place based on the unsubmitted preview score. The unwanted "Best: 6,075 · online ranking" footer and the entire unconfirmed preview-ranking box have been removed from outcome displays. The real leaderboard remains accessible via the Records button and still READS Firebase.
- The outdated "Player Online" footer on victory was also removed.
- In a future authorized release with live uploads enabled, the original Firebase PUT pathway remains intact and the rank panel may be shown on confirmed results.
- **Actual online submission of preview scores is NOT enabled here**; this is not a Firebase rules update. No live Firebase writes, rules, deletes or resets were performed.

## Preserved
Existing classic joystick, 11 levels, four languages, gameplay balance, stage stars, 100/500 enemy milestones, mandatory 3-letter name, automatic stats/device-local safety snapshots, Beta 1.28 mobile HUD and minimap, Player restrictions and Developer tour/invincibility controls. No APK/AAB or Google Play changes.

## Tests
- `node qa/pirali-beta1281.cjs` — source parity, Firebase status, no accidental release enablement, JS syntax, UI cleanup.
- `node qa/pirali-beta125-milestones.cjs` — 100 and 500 enemy achievements.
- `node qa/pirali-beta1281-browser.cjs` — mobile Chrome Player/Developer: 175-point death, no false Firebase error, no unconfirmed TOP-30 or best/online footer, real Firebase GET returns records, **zero PUT/POST/PATCH/DELETE**, 11-stage smoke, no JS exceptions.

## Web previews
- Player: https://piraligame.github.io/pirali/beta1281-play/index.html
- Developer: https://piraligame.github.io/pirali/beta1281-dev/index.html
