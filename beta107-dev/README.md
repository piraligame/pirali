# PIRALI BETA 1.07 DEV

- All eleven stages: enemies and generals weakened by an additional **10% HP and attack/movement rates**, on top of BETA 1.06 tuning.
- Eleventh stage: each of the five waves contains **10** total opponents, no landlord; wave 4 includes 1 General, wave 5 includes 2 Generals (inside the 10).
- All levels: **+10%** relative enemy Mauser ammo, hunting-shotgun shell and healing-heart drop chances; also +10% relative Mauser and heart placed item rates, subject to integer rounding; extra stage-11 periodic ammunition restocks.
- Preserved previous 1.06 features: stage-six roadside cover, sight-based AI pursuit, instant exits, stage 11 Gurian home entrance win, Georgian flag and crown, 300+300+400+400+600=2000 final bonus and 5000+2000=7000 total cap.
- DEV stays local-only and includes testing controls; PLAYER Beta scoreboard cannot be written.
- No APK/AAB or Play Store change. Live 7000-score Firebase server rule acceptance still unverified.

## Illustrated campaign map (localized)

From the main menu click 🗺️ Map. One vertically scrolling, parchment-style illustrated 11-stop route is loaded from `assets/maps/pirali-road.svg`; **all stop labels come from the actual game `PIRALI_LEVELS` translations**, so Georgian/US English/Russian/Chinese are exact, and the four language controls immediately change those overlays. Completed/current/unreached stages are marked; the map has no level-skip action. This avoids four large duplicate image files and misspellings baked into pictures.
