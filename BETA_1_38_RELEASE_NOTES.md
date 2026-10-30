# PIRALI Beta 1.38 — responsive, bounded joystick

- Previous joystick took touch input from the **entire left half of the screen**, and its center could follow the finger without bounds. This is why it wandered across the display.
- The control activation area is now limited to the lower-left **48vw × 48dvh**, capped at 275 × 370 px. The joystick's center is clamped inside this region, then fixed for the entire touch.
- The visual knob travels at most **29 CSS pixels**, regardless of thumb drag distance. Movement engages at **2px**, with full input by **6.5px**. The user gains precision with shorter thumb movements; maximum running speed remains the same.
- Multi-touch: only the originating finger controls movement; another touch cannot change direction or stop it. Release and cancellation immediately zero the input. Background pause already resets input.
- Shooting, melee, dash, keyboard, stage balances, all 11 levels, Firebase, leaderboard, Full Route and all previously approved menu and enemy improvements remain identical.
- Developer-only latest-update switch now compares the old full-screen floating joystick with the bounded sensitive Beta 1.38 joystick. Beta 1.37 enemy visibility rules remain active during comparison.
- Web builds only; Android APK/AAB not yet published.

QA includes Node input simulations, full older regression suite, and actual touch event behavior in mobile Chromium on both Player and Developer.
