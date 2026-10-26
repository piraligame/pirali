# PIRALI BETA 1.06 — browser QA

## Verified on published GitHub Pages
Automated run: https://github.com/piraligame/pirali/actions/runs/40400690020

**PASSED: 4 / 4** using real Chromium and Playwright, DEV and PLAYER, desktop and emulated Pixel 7. All cases HTTP 200; no uncaught JavaScript page errors.

- Stage 1 church exit: instant level 2 initialization in the same update frame (no previous 1.5–2.8s timeout).
- Stage 6: 26 soldiers instead of previously 29; stage-specific + global attack multiplier **0.72675**; +20% MORE solid roadside trees on top of existing scenery. Observed adds: +75/374, +72/362, +73/363, +74/369.
- Enemy who sees Simona switches from patrol to active attack.
- Stage 9: **15** riflemen, attack multiplier **0.76** (includes global 5% nerf).
- Level 10 fiery-gate label in Georgian: **გადი კარიბჭიდან**; equivalent text updated for EN/RU/ZH.
- Stage 11: exactly 5 waves, each **15** enemies; no landlord. All 15 spawn incrementally. Generals per wave: **0, 0, 0, 1, 2**.
- Bonus per full wave **300, 300, 400, 400, 600**; story 5000 + wave bonus 2000 = **7000 max**. Individual enemies grant no bonus points in stage 11.
- Fifth wave leaves the game RUNNING and only unlocks the wooden cottage. Only after entering the cottage triggers victory.
- Georgian five-cross flag, localised four-language victory texts, TOP30 crown based on genuine stage-11 victory and 75 total enemy defeats.
- DEV: no Firebase PUT. PLAYER: mock-intercepted PUT with win=true, level=11, 75 kills, +2000 wave bonus; NEVER sent live test scores to the user's Firebase.

## Not yet independently verified
- Full natural 11-stage playthrough on the user's physical Android phone.
- End-to-end real Firebase acceptance of scores above 5500.
- Precise Firebase production security rules: the repository's historical FIREBASE_RULES_SETUP.md has a 5500 validation limit. Verify existing deployed rules, backup, and update **only** the new Beta path to 7000 when authorized; preserve legacy Alpha /scores.
- Extended browser CI stage-exit tests are pending separate run: https://github.com/piraligame/pirali/actions/runs/40401375963. Do not count them as passed unless this workflow completes successfully.

GitHub web DEV/PLAYER only. **No APK/AAB or Google Play upload.**
