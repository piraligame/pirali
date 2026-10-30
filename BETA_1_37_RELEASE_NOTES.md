# PIRALI Beta 1.37 — visible enemies, reduced detection/fire distance and larger hostile bullets

New features:
- All enemy-fired bullet art is enlarged 2× in both dimensions; Simona's ammunition stays unchanged. No increase in collision or damage radius.
- Ordinary enemy visual detection changes from 560 to 455 units on first sight, 475 for an already-seeing enemy (small hysteresis prevents flicker).
- Ordinary rifle troops shoot at <=315 instead of 380; red officers at <=365 instead of 450.
- All ordinary enemies require both clear line-of-sight through trees and shooter visibility inside the active camera window before a shot. This applies in stage 11 even though enemies always chase Simona across all five waves.
- Primary generals and Devil now only fire when visible and unobstructed within 445. Secondary General fires within 440 instead of 620.
- Enemy projectile flight is now capped by actual travel distance: rifle 395, officer 445, boss 500, second General 445. Simona's fired rounds and parried rounds are unchanged.
- No changes to HP, bullet damage, shot cooldowns, enemy counts, scoring, joystick, 7-heart full-route, leaderboards, item drop rates or scenery.

Developer:
The ONE comparison switch below Immortality now says **Beta 1.37 გაუმჯობესებები**. OFF restores Beta 1.36 shooting/detection/lifetime/size; ON restores Beta 1.37. Earlier Beta 1.36 menu portrait spacing and brass bullet art stay enabled.

QA includes Node functional checks of on-screen and tree-blocked detection, projectile expiry, preservation of protected gameplay, previous Beta 1.31–1.36 QA, and mobile Chromium Player/Developer checks. Web preview only. No APK/AAB built.
