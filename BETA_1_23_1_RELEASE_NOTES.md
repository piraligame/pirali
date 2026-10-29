# PIRALI Beta 1.23.1 — Completion results overlay hotfix

Based directly on Beta 1.23.

## Resolved
Screenshot showed two UI elements overlapping during the stage transition:
- Existing `pirali-polish-toast stage` ("ტური დასრულებულია", kills, points, next level) at approximately **21%** of the game viewport.
- New `#pirali-stage-stars` star-and-time result toast at **26%** of the viewport.

The completion summary moves slightly lower to a responsive **24vh** offset, and the star card is placed another **120–160px beneath it**. On short landscapes a compact two-card layout uses at least 108px separation.

Only `css/beta123-stars.css` and `index.html` (the version label and cache key) differ from Beta 1.23; no other gameplay files changed.

## Preserved
- Exact Beta 1.22 Classic A joystick.
- Beta 1.23 tactical AI, earned stage stars and glowing items.
- All health, ammo, difficulty, waves, stage score and Firebase state.
- Existing Beta 1.23 test save keys are retained to avoid resetting progress.
- Developer panel contains stages and invincibility only.
- No Android APK/AAB created; this is a web preview patch.

## QA
`node qa/pirali-beta1231-stage-layout.cjs` passed for Player and Developer, checking vertical spacing at 600–1600px heights and comparing all files with Beta 1.23 to verify only CSS and HTML changed.

## Web builds
- Player: https://piraligame.github.io/pirali/beta1231-play/index.html
- Developer: https://piraligame.github.io/pirali/beta1231-dev/index.html

Previous Beta 1.23 remains unchanged.
