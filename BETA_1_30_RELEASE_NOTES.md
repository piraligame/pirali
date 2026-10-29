# PIRALI Beta 1.30 — earn Simona’s Full Route through gameplay

Based on Beta 1.29, separate Player and Developer web builds.

## Unlock
- Remove the old 0.50 GEL planned price, demo activation, payment texts and local demo unlock. This is now **free to earn**.
- Player unlocks the Full Route by **completing stage 10 and reaching stage 11**. The prerequisite is derived from the registered player's persistent maximum reached stage (11) or completed 10th-stage record. An existing valid stage-11 checkpoint also proves the progress boundary. This is player-name-scoped; the Developer's global stage-testing shortcut is not accepted as a purchase/reward.
- Before earned, the menu button displays a lock and opens a clear requirement notice; no stage-selection controls.
- After earned, open the approved 11-stage map and launch any stage. It starts with **7 hearts** and a **hunting shotgun (12 shells)**. Every score award remains **halved (×0.5)** as already implemented in Beta 1.29; normal runs still start with 5 hearts and no shotgun.
- Move the Full Route action **immediately after "ფირალის რუკა" and before "საუკეთესო მოთამაშეები"** in the main menu.
- Replay-route death/victory cannot erase the checkpoint of an unfinished standard run; ordinary progression and all achievements remain intact.
- The app uses no payments, Billing, Wallet, demo-activation flags or Firebase write operations.

## QA
- node qa/pirali-beta130.cjs — structural parity, previous game preserved and stage unlock checks.
- node qa/pirali-beta125-milestones.cjs — 100/500 kills.
- node qa/pirali-beta130-browser.cjs — Playwright mobile Chrome Player/Developer, locked state, menu order, 11 stage map, stage10 start 7 hearts/shotgun and half Devil coin score; normal game unchanged.

## Preview links
- Player: https://piraligame.github.io/pirali/beta130-play/index.html
- Developer: https://piraligame.github.io/pirali/beta130-dev/index.html

This is a web release; no Google Play APK/AAB or Firebase real data/rules were modified.
