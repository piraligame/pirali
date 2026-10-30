# PIRALI / ფირალი — Beta 1.47

## Less-obstructive on-screen notifications

- Removed the **top-center combo HUD and progress bar**.
- Removed the **bottom-center enemy-count label** and duplicated full-size canvas streak / sword combo banners.
- Kept a **single compact translucent pop-up in the center** (48% down the viewport) for combo, kill streak and collected-item feedback. New events replace earlier notices rather than stacking.
- Loot notifications quickly fade (normally **580 ms**, 590–650 ms for shield, quest and special pickup). Health, ammo, shells, weapon, laurel shield, medals, Devil coins and quest completion are covered. No click interception.
- Long game state announcements use a lighter, smaller translucent style as well, without changing stage progression.
- Timed **2× combo scoring remains exactly unchanged**; in-world kill points still appear as floating +points without a second large combo label.
- All eleven quests, achievements, existing cosmetics, controls, bosses, AI, Firebase safety, leaderboard and other Beta 1.46 content remain untouched.
- Player and Developer web builds only; **no APK/AAB built or Google Play update**.

## Preview links

- Player: https://piraligame.github.io/pirali/beta147-play/
- Developer: https://piraligame.github.io/pirali/beta147-dev/

QA: `node qa/pirali-beta147.cjs`, `node qa/pirali-beta147-browser.cjs`, and older mission regressions.
