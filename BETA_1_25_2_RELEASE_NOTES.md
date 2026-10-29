# PIRALI Beta 1.25.2 — locked Player progression
Based on Beta 1.25.1, unchanged previous builds.

- Removed replay-stage menu button, replay modal, stage picker, and their JavaScript module from **both** builds.
- Player stage progression is once again strictly sequential; new runs start at stage 1 and players can only resume their actual saved checkpoint.
- Restored original Beta 1.24 game-init and checkpoint logic to remove all optional practice-stage arguments or stage jumping; retained exact local save keys and existing save data.
- Developer retains its **separate** stage 1–11 selector and invincibility only.
- All 11 stages, classic Beta 1.22 joystick movement, scoring caps, 100/500 cumulative kills, four languages, maps and graphics unchanged.
- Existing Beta 1.25.1 links remain available; this is a separate preview variant.

## Player
https://piraligame.github.io/pirali/beta1252-play/index.html

## Developer
https://piraligame.github.io/pirali/beta1252-dev/index.html

## QA
`node qa/pirali-beta1252.cjs`
`node qa/pirali-beta125-milestones.cjs`
Web previews, not APK/AAB.
