# SIMONA'S HELL — modular features
These scripts are loaded at the end of `alpha0161-test/index.html` in the following order:

1. `text.js` — shared four-language strings (window.PiraliHellText)
2. `score-bonus.js` — +20% points earned in stage six, capped at +5000
3. `scenery.js` — fiery atmosphere and embers
4. `gate.js` — replacement for church: Gate of Fire
5. `devil.js` — animated Devil appearance (horns, wings, trident)
6. `boss-hud.js` — localized boss title

Actual gameplay belongs in `../../runtime/` and `../../config/`. This directory owns stage-six visuals and score decoration only. No Firebase writes are performed here.
