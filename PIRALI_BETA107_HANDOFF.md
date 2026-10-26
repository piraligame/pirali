# PIRALI — BETA 1.07 unfinished work / handoff (2026-10-27)

**STATUS: PAUSED AND SAVED, NOT BUILT, NOT TESTED, NOT PUBLISHED.**
User asked to preserve ongoing plan/code and continue in their NEXT CHAT.
Do not claim a BETA 1.07 player/developer release exists yet.
DO NOT MERGE this branch to `main` or present `beta107-*` Github Pages
links as a working release until QA and metadata are complete.

## Last stable published release
BETA 1.06 in main:
- PLAYER: https://piraligame.github.io/pirali/beta106-play/?v=beta106
- DEV: https://piraligame.github.io/pirali/beta106-dev/?v=beta106
- Stable main commit immediately before work: `3f8028c55c0787a66ea4bb79d429d7f57e8faa72`.
- 8/8 browser QA reported in `beta106-play/QA_BETA106.md`.
- Existing Android Alpha 0.15 / Google Play untouched.
- Firebase `/pirali_beta_rating` supports client score cap 7000,
  but real server rules may still enforce old cap of 5500. Never blindly
  modify or overwrite existing Firebase data or rules.

## User's new BETA 1.07 requirements
1. **Every enemy in every stage (1–11) should become an additional 10%
   weaker** than BETA 1.06. Includes regular soldiers, generals and
   their attacks, and preserve all previous stage-specific balancing.
2. Stage 11 previously **5 waves of 15 enemies**; now exactly **5 waves of 10**.
   Gradual enemy arrival and approach/chase Simona still required. No
   landlords. Wave 4 = 9 soldiers + 1 general, wave 5 = 8 soldiers + 2
   generals. Total possible defeated enemies **50**. Crown requires
   genuine completion of 5 waves and house entry and 50 kills.
3. Across all stages, **ammo pickups and healing hearts +10%** compared
   with BETA 1.06. Include map pickups plus enemy drops, and shotgun
   shells after acquiring shotgun on stage 7. Stage 8 shotgun-shell
   -15% differential remains. Preserve level 10 unique gold reward.
4. Keep BETA 1.06 stage-11 scoring unchanged: five complete-wave
   bonuses +300, +300, +400, +400, +600 = 2000; story cap 5000;
   total cap 7000. House entry triggers Georgian 🇬🇪 victory;
   scoreboard crown only for actual stage-11 win.
5. Preserve stage 6 roadside +20% cover trees, earlier difficulty
   changes, and instant level transitions. DEV local scores only;
   PLAYER leaderboard online; no APK/AAB or Play Store deployment.

## What IS saved on this WIP branch
There are copied `beta107-play` and `beta107-dev` folder trees based on
the stable BETA 1.06 release, and partial matching edits in both:
- `js/features/stages/beta105-balance.js` — adds multiplicative .90 to
  stage 1–10 HP and movement/attack multipliers.
- `js/features/endless/waves.js` — wave cap 10, boss slots wave 4/5,
  additional .90 HP/wave movement and attack rate.
- `js/features/loot/drop-balance.js` — heart multiplier .90→.99,
  bullet multiplier 1.20→1.32, relative +10% enemy drops.
- `js/features/loot/map-pickups.js` — HEALTH_FACTOR .90→.99 and
  AMMO_FACTOR 1.20→1.32, relative +10% map drops.
- `js/runtime/leaderboard.js` and `js/progression/player-stats.js`
  — change required total stage-11 kills for achievement 75→50.
- `js/features/endless/victory.js` — text 75→50 in all four languages.
- `js/runtime/game-init.js` — additional HP nerf stage 7 landlord NPC.
- `js/runtime/update.js` — additionally nerf reinforcement HP.
- All changed JS files passed syntax checks at creation, but NO
  browser/functional QA has been run for BETA 1.07.

## Remaining work before calling this finished
- Update BOTH beta107 directory HTML entrypoints, JS cache query strings,
  menu version strings, player/dev outcome version, metadata
  `RELEASE_INFO.json`, `TEST_INFO.json`, README and dedicated QA report.
- Carefully review damage/attack parameters for bosses, stage 8 second
  general, stage 11 second general and reinforcement (10% nerf).
- Ensure 10-enemy wave spawn counting and scores 300/300/400/400/600.
- Check all map hearts and ammo distribution especially in stage 11
  (map restocking), stage 9 heart scatter, and shotgun shell drops.
- Replace hard-coded '15 enemy' references where they refer to stage 11,
  but leave stage 9 count exactly 15.
- Update or add *new* `qa/pirali-beta107-qa.cjs` and workflow that tests
  beta107 paths and 10 kills/wave, with network-intercepted/mock
  Firebase writes. Do not make dummy live scoreboard entries.
- GitHub Pages deploy live after complete and tested.
- Old QA scripts reference beta106 and should NOT be repurposed
  without changing URLs and expected counts.

## Working strategy for next chat
Continue from branch `beta107-wip` in `piraligame/pirali`.
Keep main and published BETA 1.06 unchanged until BETA 1.07 is fully
ready. Complete all work, perform browser QA and only then move new
directories to main for a public release. If branch protections make
merging infeasible, report a concrete limitation instead of
claiming release. User prefers frequent concise progress updates.
