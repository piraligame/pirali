# PIRALI Beta 1.39 — Evolution Update

## Main menu
Responsive compact design retains original cinematic Simona portrait and full four-language story; the language strip should be visible on common mobile screens without scrolling. One small **Collection** button houses all historic-fiction notes and cosmetic outfits, rather than seven new bulky main buttons. Title stays "ფირალი" in Georgian and "PIRALI" internationally.

## New mechanics
- **Lookout**: one existing ordinary soldier is designated lookout in each regular stage; seeing Simona winds up a 2-second warning. Killing him interrupts the alarm. Alarm recruits nearby existing soldiers; no new kills are generated.
- **Sneak**: toggle near lower-left side of screen, walks at 55% normal speed and is harder to see inside bushes or four placed long-grass patches. Firing/dashing breaks stealth. Beta 1.38 joystick unchanged.
- **11 optional missions**: one visual parchment goal per stage (letters, rescue, outposts, hideouts). It is interactable from nearby, not necessary to complete the stage. Includes a four-language **fictional** story collection stored locally.
- **Ambushes**: stages 2–9 hold back two pre-existing soldiers for a short warned ambush; stage-11 five waves are untouched.
- **Commander**: one existing soldier in stages 3–10 becomes squad commander. His presence gives nearby soldiers small flanking adjustments; killing him restores their old tactical movement.
- **Three cosmetic cloaks**: unlock on 3, 7 and 10 collected letters. No health, damage, drop or leaderboard benefits.
- **Developer compare**: single newest changes toggle switches the latest mechanics without reverting prior joystick or enemy-range improvements.

## Protected invariants
Total ranked points from stages 1–10 remain 5000, stage 11 remains 2000; Full Route uses 20% score and 7 hearts. No additional score sources, additional enemies, or Firebase writes from the new code. Existing levels, checkpoint system, animations, map, boss health, joystick and leaderboards remain.

## QA
Node static/syntax checks, prior Beta 1.31–1.38 regression tests, mobile browser checks for Player and Developer, then GitHub Pages publication. Web previews only; no Google Play APK/AAB produced.
