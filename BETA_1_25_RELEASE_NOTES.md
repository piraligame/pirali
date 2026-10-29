# PIRALI Beta 1.25 — menu polish, achievements and replay
Built from Beta 1.24. Previous variants are unchanged.

## Features
1. Brighter impact flash and crisp sparks through the existing graphics-only combat FX; no hit damage, cooldowns or physics changed.
2. Existing minimap toggle now persists collapsed state in localStorage.
3. Unlocked stage replay menu (stages 1–11) in practice mode; no leaderboard submission, checkpoint save, or checkpoint clearing. Stage 11 initializes bonus scoring separately.
4. Graphics menu: Low/Medium/High. Low throttles only effects/weather drawing, without affecting enemy AI, input, hit detection or score.
5. Scrollable responsive menu, compact small landscape layout, localizable stage replay picker.
6. Personal achievements: former 10 and stage-11 50 enemy milestones replaced by 100 and 500 lifetime enemies, respectively. This counts every stage, retains existing profile kill totals, retroactively grants when existing total reaches threshold, displays 0/100 and 0/500 progress. Old 10/50 unlock flags are not imported into the new achievement IDs.

## Preserved
- Beta 1.22 joystick exact implementation.
- Beta 1.24 enemy AI, boss warning, combo, stages, Firebase read-only previews and scoring.
- All 11 levels, four languages, hearts, ammo, wave strength, point caps and balance.
- Developer panel is stage select + immortality only. Player has no dev controls.

## Web previews (publish after GitHub Pages completes)
- Player: https://piraligame.github.io/pirali/beta125-play/index.html
- Developer: https://piraligame.github.io/pirali/beta125-dev/index.html

Run `node qa/pirali-beta125.cjs` for static and invariant checks.
No Android APK/AAB generated.
