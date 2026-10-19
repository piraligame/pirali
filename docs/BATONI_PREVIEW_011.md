# PIRALI Batoni red-coat top-down sprite concept

- Four directional top-down views derived from user-supplied reference and AI-edited concept art.
- Stored as one compact 192x48 transparent WebP sprite atlas, order north/south/west/east.
- New visual module wraps drawEnemy for landlord only. When image is not loaded, original NPC drawing remains.
- Original Batoni logic, 1 HP, fleeing behavior and collisions are unchanged.
- This is a separate web preview; NOT an Android APK, Google Play submission or merge to Alpha 0.10 / Beta.
- Use PiraliBatoniArt.enable(false/true) in browser console to compare.
