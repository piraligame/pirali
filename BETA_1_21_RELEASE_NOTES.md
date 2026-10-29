# PIRALI Beta 1.21 — Classic A retained, small visual polish

## Included
- **Exactly the same Beta 1.20 A / Beta 1.18 input logic**: same logical joystick origin, 35px following, 3px movement start, 1.5px stop, immediate direction and speed. No Beta 1.19 reverse-jump algorithm and no B fixed joystick.
- The joystick's **visible ring** follows the thumb, but cannot move more than 90px horizontally or 96px vertically from its initial visual position. The underlying input direction is unaffected by this *display-only* limit.
- Ring stays 96px, knob 40px. Multitouch, sword, shooting, dash and other controls untouched.
- Level balancing, stage 5 +10% ammunition, stage 6 -15%, score limits and leaderboard test settings untouched.
- Dedicated save keys for Beta 1.21; does not alter Beta 1.20 A/B or Android.
- Automated baseline comparison succeeded for Player and Developer, including many gestures and a high upward swipe.
- Full physical Android thumb test remains necessary.

## Web preview after Pages deployment
- Player: https://piraligame.github.io/pirali/beta121-play/index.html
- Developer: https://piraligame.github.io/pirali/beta121-dev/index.html

## Next possible gameplay improvement (proposal, not implemented)
Add a brief 0.3–0.4-second visual aiming tell before Russian riflemen shoot, with more discreet indication for officers. This should make dodging purposeful and intuitive instead of feeling like an unseen bullet hit; preserve attack count and game difficulty initially, play-test separately.
