# PIRALI Alpha 0.14 / Test-only HUD change B1

**Live developer test:** https://piraligame.github.io/pirali/alpha014-test/

User-requested two visual adjustments to the **Alpha 0.14 Study D developer test**, not a new player APK:

1. **Shotgun switch** moved upward by 13 CSS pixels (using a top offset on the switch). It now displays four painted shotgun shell cartridges, dimmed if fewer than four shells remain, and the exact remaining ammunition count (e.g. `× 4`, `× 3`), updated when firing or collecting shells. The separate floating shell HUD is hidden to prevent a duplicate panel.
2. **"მოი აგერ!" dash cooldown line** moved from top-right of the game screen to an 84px track immediately above the 84px dash action button. Its fill still follows the existing cooldown timer.

Implementation: `css/alpha014-hud.css`, `js/config/alpha-gear-v2.js`, `index.html`. The top HUD no longer duplicates the dash cooldown.

QA: real Chrome checks at 390×844 mobile portrait and 844×390 mobile landscape confirm: switch position, four shotgun shell icons, ammo count decremented 4→3 after a real shotgun shot, line centered 8px above dash button, actual cooldown 50% visual fill, zero JS errors, no Firebase writes. Test-only changes do not affect gameplay, combat damage, or pickups.

**Protected:** `main/play` standard Alpha 0.13 player, Alpha 0.14 APK/AAB signed release and download, Study D Simona, Firebase records. Do not deploy this visual tweak to Android or normal player channel before user approval.
