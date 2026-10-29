# PIRALI — BETA 1.03 Browser QA (October 26, 2026)

Automated Chrome / Playwright checks ran on the connected Windows laptop using live GitHub Pages Beta 1.03 DEV and PLAYER URLs. No test scores were written to live Firebase.

| Check | Scope | Result |
|---|---|---|
| Desktop Chrome, 1365×860 | DEV + PLAYER | WASD, arrows, diagonal W+D, Space shooting, mouse shooting, right-click sword, left-side mouse joystick, key release, pause/resume worked |
| Mobile Chromium emulation, Pixel 7 | DEV + PLAYER | Touch joystick, touch shoot, sword, dash worked; desktop help/control disabled on mobile |
| Stage smoke tests | 4 configurations | All 11 stages generated and rendered one update frame without page JavaScript errors (44 stage loads in all) |
| Scoring and balance | 4 configurations | Stages 1–10 capped at 5000, bonus at 500, total 5500; stage 9 siege 20; stage 11 live enemy cap 20 |
| Firebase | remote read-only | Beta Realtime Database GET HTTP 200; current database contains 7 score records; no QA score submitted or changed |
| Release boundaries | all | Alpha 0.15 code and Google Play package untouched; DEV Firebase writes blocked; no APK/AAB generated |
| Not yet tested | limitations | No human 11-stage natural playthrough on a physical Android phone; full bosses and exit-gate progression across all 11 stages not asserted; performance and device diversity still need manual QA |

## Detailed observed sample
- Desktop DEV key W: y 3620 → 3583, arrow Right x 1000 → 1029; PLAYER W: y 3620 → 3577; Right x 1000 → 1026.
- PC space triggered Mauser shot: ammo 10 → 9; mouse drag joystick set dx=1 and cleared after mouse release. PC pointer click also consumed 1 ammo; right mouse click triggered sword cooldown.
- Mobile Pixel 7 touchscreen events updated joystick dx=1 then released to 0. Touch action buttons caused shoot 10 → 9, sword cooldown >0, dash cooldown 72.
- Stage 1 through 11 `genWorld()`, `update(1)`, `render()` each completed in every browser profile with zero JS page exceptions.
- Score clamping on stages 9 and 10 capped at 5000, stage 11 at 5500 with 500 bonus.
- Live Beta Firebase node readable HTTP 200 with 7 records at the time of check. No production write performed by QA.

## Interpretation
These are automated smoke, input, score-cap and visual-render tests in desktop Chrome and mobile emulation; they do **not** prove a complete human-played 11-level mobile playthrough or absence of all gameplay bugs. DEV tour skipping is also not equivalent to natural boss/exit progression. Before publishing Android AAB, test the full normal game on a physical handset, complete boss gate conditions, check animations, graphics, memory usage, and Google Play signing/update code.

## Links
- PLAYER: https://piraligame.github.io/pirali/beta103-play/?v=beta103
- DEV: https://piraligame.github.io/pirali/beta103-dev/?v=beta103
