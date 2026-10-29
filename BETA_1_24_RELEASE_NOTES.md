# PIRALI Beta 1.24 — Player & Developer

Based on Beta 1.23.1, which is preserved unchanged.

- Green saber soldiers attack head-on, yellow riflemen keep distance, red officers flank; local tree avoidance and stuck-escape steering.
- Boss charge: 18 simulation ticks of visible red lane before existing attack; ground slam: existing 18-tick warning now fills the exact 70-unit damage radius red.
- 2-second combo progress bar and x2 indicator reflect existing scoring only.
- Stage/final results show earned points, 1/2/3-star criteria (55%/85%), local stage record and time.
- Performance: offscreen drawing culling, visual particle cap, linear-time alive-enemy indices.
- Preserves classic Beta 1.22 joystick code, all 11 stages, HP, damage, attack speed, difficulty and stage score caps, four languages and Firebase configuration.
- Developer has level select and invincibility only; Player has no developer panel.
- Web previews only; no new signed Android APK/AAB.

## Links
Player: https://piraligame.github.io/pirali/beta124-play/index.html

Developer: https://piraligame.github.io/pirali/beta124-dev/index.html

## QA
Run `node qa/pirali-beta124.cjs`.
