# PIRALI / ფირალი — Beta 1.50

## Armor visual
- Removed the overhead green/silver shield emblem from Beta 1.49.
- While the one-hit armor charge is equipped, a **short 20 px, 2 px thin bright green horizontal line** appears above Simona; only a 4 px near-black contrast stroke sits behind it.
- The line disappears immediately when the shield consumes one hit. No changes to shield protection, pickup/drop rates or collision.

## Stage 4 balance only
- **10% fewer ordinary soldiers** (rounded to a whole number), selected evenly over the path to avoid an empty final section.
- Remaining ordinary soldiers have **10% lower HP** versus Beta 1.49 and **10% lower attack-tempo/speed multiplier**. Existing factors for other stages are retained.
- No changes to quests, checkpoint unlocks, scoring, bosses of other stages, camera framing or controls.

## Test in browser
- Player: https://piraligame.github.io/pirali/beta150-play/
- Developer: https://piraligame.github.io/pirali/beta150-dev/
- QA: `node qa/pirali-beta150.cjs`, `node qa/pirali-beta150-browser.cjs`.
- Android: `node scripts/prepare-android-beta150.cjs` prepares **unsigned Player-only web assets**, not APK/AAB. VersionCode 22 is only a proposal and must be checked against Play Console before signing on the authorized machine.
- Firebase release and publication remain OFF.
