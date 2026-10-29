# PIRALI Beta 1.28.2 — restore result placement, remove only unwanted footer

Small correction to the 1.28.1 outcome screen in both Player and Developer web versions.

- Restores the **🏆 My Best Result** card and its **Rank №X / Y players** position on the defeat and victory screens.
- Keeps the current run's actual score visible in the original result-score box.
- Removes **only** the extra lower sentence combining "TOP 30", "Personal best: 6,075" and "Online ranking" — the footer stays empty.
- In web previews, Firebase writes are deliberately disabled. Therefore, the rank is explicitly labelled **Estimated rank** and calculated from this attempt's points against readable leaderboard records, not the previous high score. This prevents a 101-point run from being represented as a 6,075-point result or an official online submission.
- The main Records menu still reads the actual Firebase leaderboard; no live data, Firebase rules or Google Play binaries are changed.
- Firebase false write errors fixed in 1.28.1 remain suppressed in preview mode.

## QA
- `node qa/pirali-beta1282.cjs`: unchanged game assets, 11 stages and existing restrictions, JS syntax and ranking restoration.
- `node qa/pirali-beta125-milestones.cjs`: achievement boundaries 100/500.
- `node qa/pirali-beta1282-browser.cjs`: deterministic mobile Chromium scenario with old 6,075 best score and new 101-point defeat: rank should be projected **№3 / 5**, score **101**, footer blank and zero Firebase writes, for both Player and Developer.

## Links
- Player: https://piraligame.github.io/pirali/beta1282-play/index.html
- Developer: https://piraligame.github.io/pirali/beta1282-dev/index.html
