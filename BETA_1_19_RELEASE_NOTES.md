# PIRALI Beta 1.19 — Fixed Joystick Preview

**Why:** Beta 1.18 screenshot showed the whole joystick ring traveling far up the left half of the phone. The user wants the ring to stay in the lower-left during movement.

## Completed
- Joystick base stays in a fixed lower-left position within the current viewport. It never follows long drags.
- Joystick knob is visually constrained to a 30px radius inside the 96px ring.
- Lower-left 60% height is the joystick activation region, leaving the upper-left free for the minimap.
- Logical origin tracks long finger swipes without moving the ring.
- A deliberate 6px reverse swipe immediately reverses direction, even after moving a long distance.
- Hysteresis: movement starts at >4px, stops at <=2px, preventing tap jitter.
- Second finger remains independent for shooting, sword, dash and weapon switch.
- Release, cancel, Android background and rotate handling preserve appropriate input state.
- Previous Beta 1.18 stage 6 -15% HP/attack, stage 5 +10% map ammo, stage 9 score cap, stage 11 HUD, four languages and minimap preserved.
- Firebase leaderboard writes remain disabled in test builds; the published Android APK/AAB is not changed.

## Web previews (new, not overwriting 1.18)
- Player: https://piraligame.github.io/pirali/beta119-play/
- Developer: https://piraligame.github.io/pirali/beta119-dev/

## QA
- `node qa/pirali-beta119-joystick.cjs` confirmed two builds, 400+px swipe, reverse in 10px, fixed base coordinates, visual radius, multitouch, orientation change, paused/dead input block and prior balance preservation.
- GitHub Actions: successful.
- Manual Android touchscreen playthrough still needed.
