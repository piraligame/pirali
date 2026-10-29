# PIRALI Beta 1.23 — Tactical AI, earned stage stars, glowing pickups

Based directly on **Beta 1.22** (Player and Developer), including the exact Classic A joystick, all existing difficulty multipliers, gun ammunition and 5000+2000 point caps.

## Three changes
1. **Tactical enemy movement** — swordsmen take a gentler flanking angle, riflemen and officers try to retain some space when Simona approaches closely, neighboring soldiers separate rather than overlap. AI only provides movement **direction**; no edits to enemy damage, HP, speed, shooting intervals, loot drop or enemy counts. Bosses, landlord NPC, searching and stage-11 wave movement are excluded.
2. **1–3 stage stars** — earned points relative to the *current stage's* attainable budget: <55% = ★☆☆, 55–84% = ★★☆, >=85% = ★★★. Show on each 1–10 stage completion with earned points and elapsed time; stage 11 shows final wave score on the victory screen. Best stars stored locally, not on the official leaderboard. Checkpoint scores and official score logic untouched.
3. **Ground pickup highlights** — subtle pulsing halo behind ammunition, health, herbs, medals, shotgun ammo and special pickups. Pure visual rendering effect; no modification to item spawning, amount, pickup distance or inventory.

## Preservation
- Player/Developer combat.js **byte-identical** to Beta 1.22.
- Core world generation, stage balancing, score calculation, enemy spawn count and player stats **byte-identical** to Beta 1.22.
- No official Firebase writes from test previews; Developer retains only stage selection and immortality, Player has no debug panel.
- Independent Beta 1.23 checkpoints.
- Android APK/AAB and prior Beta 1.22 are unchanged.

## QA
GitHub Actions: `node qa/pirali-beta123-regression.cjs` — PASS in both variants. Tested tactical behavior, no stage-11 AI effect, 1–3 star thresholds and local persistence, all pickup categories, render hooks, code parity of Classic A joystick and game balance.

Real Android hands-on gameplay is still necessary. These are web previews, not Play Store builds.

Player: https://piraligame.github.io/pirali/beta123-play/index.html

Developer: https://piraligame.github.io/pirali/beta123-dev/index.html
