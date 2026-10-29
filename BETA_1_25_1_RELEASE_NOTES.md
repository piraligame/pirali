# PIRALI Beta 1.25.1 — Fixed balanced graphics
A focused hotfix built on Beta 1.25. Both preview variants are separate; Beta 1.25 remains untouched.

- Completely removes the low/medium/high graphics selector and its settings module. Prior graphics preference is ignored.
- One constant, visually consistent profile on every device: full backgrounds, foliage, sprite details, combat/charge indicators, and weather redraw every game frame.
- Bounded visual FX queue (28 instead of 36) and reduced GPU shadow blur/spark segments. No alternating-frame skipping, which can cause visible flicker.
- All 11 levels, four languages, Beta 1.22 classic joystick, enemies, difficulty, score caps, achievements (100/500) and saved progress unchanged.
- Developer: only stages and invincibility; Player: no dev controls.
- Performance on every Android hardware model cannot be guaranteed without real-device profiling; this hotfix minimizes the visual workload without gameplay changes.

## Web previews
- Player: https://piraligame.github.io/pirali/beta1251-play/index.html
- Developer: https://piraligame.github.io/pirali/beta1251-dev/index.html

## QA
`node qa/pirali-beta1251.cjs` and `node qa/pirali-beta125-milestones.cjs`.
