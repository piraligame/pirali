# PIRALI Beta 1.36 — face visibility and elongated bullets

## New visual layout
- Menu moved down by approximately 107 CSS pixels on a 360×760 mobile display, giving a clear unblocked view of Simona's hooded face before the card.
- The full four-language story remains above the card, while all buttons are reachable by vertical scrolling. All title/identity/community controls and artwork preserved.

## Ammunition appearance
- Mauser ammunition ground pickups now look like the slim brass shells in the loaded-ammo HUD, with metallic sides and a pointed top. Removed the halo only from these pickups and shotgun-shell boxes (other item halos unchanged).
- Fired bullets now appear as pointed, orientation-aware solid brass/red projectiles, 14.5 × 4.5 canvas pixels, no circular dots or glowing outlines.
- Bullet physics, collision, damage, ammunition amount, reload, aim, scoring and drop balance unchanged.

## Developer comparison
- The single Developer-only toggle below immortality is now named **Beta 1.36 გაუმჯობესებები**. OFF shows the old menu padding and old ammo projectiles/pickups, ON shows the new art and portrait margin.
- Prior Beta 1.34 presentation improvements stay ON; previous levels and developer controls preserved.

Testing: qa/pirali-beta136.cjs, retained previous versions' QA and mobile Chromium Player/Developer smoke.
Web preview only, no Android APK/AAB publication.
