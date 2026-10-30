# PIRALI Beta 1.46 — repeatable quests and character art

**Based on Beta 1.45, with no changes to Google Play/Android builds.**

- Every mission appears again when its stage is replayed, including the letters in stages 1, 3, 4, 6, 7, 10 and 11. First completion remains permanently in the collection (unique 0–11 count); repeating an already-recorded quest does not duplicate its rewards.
- Stage 2 now displays a **bound human NPC wearing pale-yellow, worn clothing**, rather than parchment. Simona frees the captive by touching him. Once rescued, the NPC visibly runs away. Stage 5 retains a separate brown-clothed villager.
- The Collection menu shows `quests completed / 11`. Personal Statistics / Achievements shows the same progress, milestone unlocks at 3, 7, 10, and a completed-all-11 marker.
- Top-down Simona's chokha gains seams, cartridge straps, copper details; soldiers receive refined cap, uniform and insignia differentiation; generals gain epaulettes and the Devil gets extra armour/rune detailing. Uses light canvas vectors without asset downloads or higher sprite memory usage.
- All previous drops, combat AI/HP, joystick, coins, scoring, Firebase protection and stage progression are unchanged.
- `beta146-play/` and `beta146-dev/` are separate web builds. **APK/AAB not built or submitted.**
- QA: `node qa/pirali-beta146.cjs`; existing Beta 1.45 smoke QA is kept. Mobile browser visual confirmation is recommended before shipping.
