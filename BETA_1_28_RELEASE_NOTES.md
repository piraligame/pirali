# PIRALI Beta 1.28 — score-side rewards and tightly fitted minimap

Based on Beta 1.27.2. Separate Player and Developer web previews; older versions remain available.

## Fixes
1. Medal, laurel shield and any further visible inventory reward counters move from the left under the health/minimap to the **right directly below the score panel**. HUD positioning follows the score panel after resize/orientation changes.
2. The minimap frame now has a fixed responsive border width matching the square canvas. Its title/toggle text uses ellipsis instead of widening the card, removing the old empty strip on the right. Map markers, mini-map heading and saved hide/show preference remain.
3. In Developer only, the testing panel moves lower to avoid covering the new score-side inventory row.
4. The 1.27.2 stage stars layout, compact map legend removal and automatic device-local statistics remain intact.

## Preserved
- Classic joystick, 11 stages, existing balance/score, multilingual menus, mandatory 3-letter name, 100/500 achievements, local automatic stats safety copy.
- Player may not select or replay stages; Developer retains only stage selection and invincibility.
- No Firebase live data/rules, Google Play APK/AAB or published store release changed.

## QA
- `node qa/pirali-beta128.cjs` — source parity, roles, version and JavaScript syntax.
- `node qa/pirali-beta125-milestones.cjs` — lifetime 100/500 kills.
- `node qa/pirali-beta128-browser.cjs` — mobile Chromium Player/Developer at 320×690, 360×760, 412×915, and 760×360. Inventory forced to show laurel and medals; asserts zero overlap with minimap or Developer tester, placement under score, tightly fitted map width, 11-stage smoke, hide/show toggle and zero uncaught page errors.

This is tested HUD/regression work, not a claim that every possible gameplay bug on every Android device has been found or fixed.

## Web previews
- Player: https://piraligame.github.io/pirali/beta128-play/index.html
- Developer: https://piraligame.github.io/pirali/beta128-dev/index.html
