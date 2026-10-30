# PIRALI BETA 1.04 — 20-enemy stage-11 wave QA

Date: 2026-10-26

## Real browser engine tests (Chromium)
The GitHub Pages DEV and PLAYER builds were launched in Chrome on an authorized Windows PC. Each build was tested once as desktop (1365×860) and once with Pixel 7 mobile emulation, **4 configurations**.

All 4 scenarios passed with HTTP 200 and **zero JavaScript page errors**.

| Test | Verified result |
| --- | --- |
| Initial 11th stage wave | Exactly 20 total live foes, wave 1 |
| Kill 19 enemies, wait ~8 seconds with ticks | 1 surviving foe, no replacement or new wave |
| Kill the twentieth foe | Wave 2 started on next game tick, 20 foes |
| Wave 2 strength | Multiplier 1.10; comparable rifle HP 2.203 → 2.423 |
| Complete wave 2 | Wave 3 starts with 20; strength multiplier 1.21 |
| Complete wave 3 | Wave 4 starts with 19 soldiers + 1 General = 20 |
| Damage wave-4 General into rage | No extra soldier reinforcements; still 20 total |
| Kill all 20 on wave 4 | Wave 5 starts with 20 |
| Score cap | With 4000 baseline, bonus stops at +500; 4500 total |
| Other stages (1, 5, 9, 10) | World generated, one update completed; endless state inactive |
| Firebase isolation | DEV preview flags enforce local-only; PLAYER uses existing Beta leaderboard; no QA upload |

## Limits
These are real browser programmatic-combat and stage-smoke checks; the tests do **not** constitute a complete manual playthrough on a physical Android phone. They do verify stage 11 using the real combat kill functions (`killEnemy`, `hitBoss`) and actual `PiraliEndless.tick` transitions on both display profiles.

Original Alpha 0.15 store build and old `/scores` records have not been modified, nor have the new Beta leaderboard records been reset.

## URLs
- https://piraligame.github.io/pirali/beta104-dev/?v=beta104
- https://piraligame.github.io/pirali/beta104-play/?v=beta104
