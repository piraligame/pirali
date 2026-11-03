# Pirali Alpha 0.16.1 Developer Test
Separate six-stage test cloned from alpha015-test. Existing alpha015-play and alpha016-hell-demo are unchanged.
- Dash cooldown: 180 to 72 (-60%); sword uses previous 20% improved cooldown.
- Virtual joystick: 48px travel, max movement at 37.44px, circular radial calculation; movement smoothing 0.42.
- Level 5: General and final Batoni must die; enter the church to start Simona's Hell.
- Level 6: 3x soldiers, 12 nonattacking three-hit Batoni, extra ammo, 3x health Devil.
- Sword parry stage six: 320ms and 110px front-facing cone.
- Devil visual: animated wings, horns, face, trident and fiery glow. Gate replaces church.
- Devil defeat alone never wins: enter Gate of Fire to win.
- Stage 6: +20% points per earned event, capped to +5000 from this level.
- Developer six-level selector, optional invincibility and boss teleport.
- No live leaderboard writes. Development checkpoint, personal-stat, leaderboard cache isolated locally.

## 0.16.1b — modularity, TOP 30 and milestones
- New explicit folder `js/features/hell/` replaces former single `js/features/alpha0161-visuals.js` include.
- New separate badge CSS and folder README.
- Best score + historical milestones combined per normalized username.
- Church badge: previously won level 5 or entered level 6.
- Cross: `level >= 6 && win === true`. Developer-only scores have 🧪.
- No write to Firebase. Local DEV runs stored under isolated `pirali_lb_alpha0161_local_runs` key.
- Stage 6 time and new achievements Stage Six and Hell Conquered in four languages.
- Existing live alpha-play and test variants remain unchanged.

## 0.16.1c — rank of THIS run and retry
- `js/features/results/run-rank.js`: rank among all known unique players on victory/death screen, not clipped to TOP 30.
- `js/features/results/retry.js`: replay from level 1, retaining personal achievements.
- `css/result-screen.css`: responsive styles and large touch target.
- Shows offline provisional rank when Firebase GET is unreachable; shows unranked for zero-score or resumed checkpoint runs.
- DEV scores remain local-only and never write to Firebase. Public TOP 30 unchanged.

## 0.16.1d — hell balance and loot
- 3× fewer regular Hell soldiers (`normalCount`, formerly `normalCount * 3`), evenly scattered across the route.
- 12 Batoni preserved, each always drops +1 HP pickup when killed.
- Devil always drops collectible, gold-rendered 5000-point heart. Claim fills Hell stage points up to 5000 without exceeding prior cap.
- Persistent flaming gate labeled exactly `ჯოჯოხეთის ცეცხლოვანი კარიბჭე`; death banner translated.
- Logic and graphics in separate Hell modules, not one HTML file.

## 0.16.1e — top-30 frame, version, sword and soldier tuning
- `js/features/leaderboard/frame.js`, `css/leaderboard-frame.css`: actual 30-row container replaces viewport-sized decorative border.
- `js/menu.js`: bottom version text now `PIRALI • ALPHA 0.16.1 DEV`.
- `js/features/combat/sword-cooldown.js`: existing sword cooldown reduced an additional 20%, faster attacks.
- `js/runtime/world.js`: sixth-stage soldiers 40% of 0.16.1d, rounded; Batoni and Devil unchanged.

## 0.16.1f — fix inverted sword request and mobile leaderboard fling
- Fixed 1500ms real-time sword cooldown via `performance.now()` (new module), for regular/combo.
- `combat.js` checks real elapsed milliseconds rather than frame countdown; `game-init.js` resets on new run.
- `scroll-guard.js` + `leaderboard-scroll-guard.css` keep a separate opaque fixed layer below the scrollable leaderboard, with overscroll-behavior disabled.
- No Firebase changes. Live and previous-version links unchanged.

- Combo interval extended from ~0.5s to ~2s to preserve combo moves after the 1.5-second sword gate.

## 0.16.1g — restore original 0.15 sword and fix weapon icon overscroll
- `swordSwing()` is byte-for-byte identical to `alpha015-play/js/runtime/combat.js` (CD normal 27.2 frames, combo 19.2, timer 30; parry 190ms).
- Remove 1500ms cooldown module and its index.html inclusion.
- On TOP 30, synchronously add `pirali-leaderboard-open` class and hide underlying canvas/HUD/action-zone/shoot button; restore on close. A MutationObserver remains as fallback.
- Separate scroll-guard JS and CSS updated. Existing scores remain read-only.
