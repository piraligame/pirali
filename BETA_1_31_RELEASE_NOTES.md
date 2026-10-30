# PIRALI Beta 1.31 — Full Route XP and all-stage shotgun shells

30 October 2026 • Player and Developer **web previews**, based on Beta 1.30.

## Gameplay
- **Simona's Full Route** rewards **20% of normal XP/score (80% less)** instead of the former 50%, to keep ranking fair for its starting 7 hearts and hunting shotgun.
- The rule applies across story kills, combo/medal/parry scoring, stage-10 Devil coins (**50** instead of **125** in Full Route; standard remains 250), and stage-11 five-wave rewards. Cumulative integer remainder is carried so small awards are not silently lost.
- **HP/healing is unchanged** from the main campaign. HP pickups were not halved by the Full Route implementation; the 50% modifier was on points.
- After the hunting shotgun is owned, its shells can drop from enemies and appear as placed pickups **in all 11 stages**, including 1–6 when replaying via Full Route. A normal player without the shotgun does not gain early ammo drops. Existing acquired gun logic in stages 7–11 remains.
- Player and Developer versions preserve menus, Georgian Gamers Guild community link/logo, saved achievements, stage unlock, map, joystick, gameplay balance, and no Facebook effect on scoring.
- No payment integration or Firebase score writes; production Android APK/AAB not built or uploaded.

## QA
- `node qa/pirali-beta131.cjs`: parity, all-stage shotgun ammo, normal vs Full Route score, heart defaults, JS syntax.
- `node qa/pirali-beta131-browser.cjs`: Chromium mobile Player/Developer, gameplay, 11-stage map, 7 HP/shotgun, 20% Devil coin reward, stage 1–11 shell placement, normal reset, menu and original logo.
- `node qa/pirali-beta125-milestones.cjs`: retained 100/500 kill achievements.

## Test in browser
- Player: https://piraligame.github.io/pirali/beta131-play/index.html
- Developer: https://piraligame.github.io/pirali/beta131-dev/index.html
