# PIRALI Beta 1.33 — classic pickup visuals + comparison switch + timer placement

- Exact Beta 1.31 ground-item halo renderer restored in both Player and Developer. No change to hearts/ammo/shells spawn or collection.
- Stage timer moved to 10px from top, directly to the right of the top-centred pause button on both variants. Time counting logic unchanged; HUD does not cover action controls.
- Developer test panel now has **one** latest-changes switch immediately below immortality, initially ON: “✨ Beta 1.32 გაუმჯობესებები”. OFF reverts 1.32 combat visual additions, three-role AI heading to exact Beta 1.31 routine, boss telegraphs and render/minimap optimizations. ON restores them without reload. Test-only ephemeral state, not persisted, not available to Player. Subsequent updates should replace the label and comparison group rather than stacking switches.
- Existing 1.31–1.32 scoring, full route, joystick, leaderboards, earned achievements, Facebook link, and all 11 stages preserved.
- Web preview only. No Android APK/AAB built.
