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
