# PIRALI Beta 1.28.3 — restore the exact Beta 1.26 outcome ranking display

This correction restores the original Beta 1.26 death/victory ranking code and visual copy while retaining all later gameplay, HUD, and stability improvements.

## The outcome screen
- Shows the **current attempt's score** in the top score box.
- Restores the Beta 1.26 **🏆 My Best Result** card with the player's best rank among season players and total participant count.
- Restores the original line below that card: whether the player's best is in TOP 30, **Best: 6,075** (or other actual personal best), and **Online ranking** if the data were returned from Firebase; developer/local fallback explicitly identifies a test/estimate.
- The rank is based on the player's **best recorded score** (Beta 1.26 logic), rather than the most recent attempt alone. Thus, e.g. 101 points in this attempt and best 6,075 can appear separately.
- The 1.28.1 prevention of fake Firebase upload errors remains: in preview builds, score writes stay *local only*. Existing Firebase READ queries can still display an earlier confirmed best and position; the current unsent preview attempt is never falsely submitted.
- No Firebase real writes, rules or leaderboard data changes; no Google Play APK/AAB changes.

## Unchanged
The classic joystick, 11 stages, current game balance, four languages, 100/500 achievements, mini-map and mobile HUD, mandatory three-letter names, automatic local statistics backup, Player stage restrictions, and Developer tour/invincibility-only controls.

## QA
- `node qa/pirali-beta1283.cjs` — exact byte-for-byte run-rank.js comparison to Beta 1.26 in both variants, original game files preserved.
- `node qa/pirali-beta125-milestones.cjs` — existing 100/500 enemy achievements.
- `node qa/pirali-beta1283-browser.cjs` — Chrome mobile 360×760 and 412×915, Player/Developer: fixture with a confirmed 6,075 best and a new 101-point death expects result score 101, rank #1/5, TOP30, best 6,075 and original online/dev footer. No Firebase writes or JS exceptions.

## Web previews
- Player: https://piraligame.github.io/pirali/beta1283-play/index.html
- Developer: https://piraligame.github.io/pirali/beta1283-dev/index.html
