# PIRALI Beta 1.27.2 — stage results and minimap compact layout

Small Player and Developer web hotfix based on Beta 1.27.1.

- **Results position**: on portrait mobile screens, move stage stars/results card up by 50 CSS px (base) / 60 CSS px (<=390px), relative to prior layout. Landscape control/layout logic preserved. The large center-stage announcement remains in place.
- **Minimap**: remove the bottom visual key explaining Simona, enemies, boss, and destination in both variants, including its DOM and CSS. Preserve the mini-map canvas, markers (including boss/goal), top control, hide/show preference, level title, north label and accessibility descriptions.
- **Compact mini-map**: reduce the existing frame padding from 5px to 4px and canvas top margin from 4px to 3px; removing legend naturally shortens the card.
- No changes to classic joystick, 11 stages, damage, scores, enemies, pause, progress, 100/500 achievements, the four languages, mandatory three-letter name, automatic device-local stats snapshots, Player stage restrictions or Developer tour/invincibility controls.
- No Firebase data writes, rule changes, APK/AAB or Google Play update.

## QA
- `node qa/pirali-beta1272.cjs` — no unintended source modifications, syntax and role checks.
- `node qa/pirali-beta125-milestones.cjs` — lifetime 100/500-kill achievements.
- `node qa/pirali-beta1272-browser.cjs` — mobile Chromium Player/Developer at 360×760, 412×915 and 760×360. Confirm star/title geometry, compact map without legend, all core scripts running and no console-page errors. Typical portrait clearance in tested viewports: 13px and 17px.
- Device-specific full gameplay remains a separate manual QA step.

## Preview
- Player: https://piraligame.github.io/pirali/beta1272-play/index.html
- Developer: https://piraligame.github.io/pirali/beta1272-dev/index.html
