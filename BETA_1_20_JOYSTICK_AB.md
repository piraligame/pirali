# PIRALI Beta 1.20 — A/B joystick comparison

Feedback: Beta 1.19 fixed base stopped moving, but thumb control became unpredictable. Restore the familiar Beta 1.18 movement and allow an apples-to-apples comparison.

## A — CLASSIC (default)
- **Player:** https://piraligame.github.io/pirali/beta120-play/
- **Developer:** https://piraligame.github.io/pirali/beta120-dev/
- **Joystick:** original Beta 1.18 floating ring and thumb-follow, unchanged input physics.
- The ring follows the finger (can move up). This is the version the tester found easier.
- Visible marker: `BETA 1.20 A • CLASSIC`.

## B — FIXED (corrected)
- **Player:** https://piraligame.github.io/pirali/beta120-fixed-play/
- **Developer:** https://piraligame.github.io/pirali/beta120-fixed-dev/
- **Joystick:** exactly the same Beta 1.18 logical input computations, deadzone, release and thumb-follow.
- Only the *visual ring* stays in the lower-left; the center of thumb input still follows the finger logically.
- Beta 1.19's automatic 6px reverse-direction jump is **removed** (it caused erratic controls).
- Visible marker: `BETA 1.20 B • FIXED`.

## Fair comparison
- Same combat code after input handling, same stage balances, score, stage-5 ammo, stage-6 15% reduction, enemies, map, weapons and UI.
- Independent test save keys and no live Firebase leaderboard submissions.
- On each link, compare walking straight, diagonal direction, full-screen long swipe, brief thumb reversal after a long swipe, simultaneous fire and movement, release and stop.
- Automated tests: `node qa/pirali-beta120-joystick-ab.cjs`. A/B directions were identical at every matched touch event; B's visual ring never changed position. Both Play/Dev tested.
- Beta 1.18 and Beta 1.19 public builds remain unchanged. This is web QA, no Android APK/AAB built. Manual touchscreen comparison still needed.
