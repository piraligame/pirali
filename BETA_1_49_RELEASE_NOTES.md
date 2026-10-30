# PIRALI / ფირალი — Beta 1.49

## Visual change: shield above Simona's head

- Removed the previous large yellow/gold semi-circular protective aura.
- When a one-hit laurel-shield charge is available, a **small top-down green and silver shield insignia** appears above Simona's head.
- This new Canvas-rendered badge tracks the player and has no extra texture assets, images or network requests.
- The indicator disappears as soon as the shield absorbs its single hit. The **protection mechanic and drop rates are identical** to Beta 1.48.
- The 70% follow-camera, clear centered notifications, 11 repeatable quests, stats, achievements, AI, score balance and gameplay controls remain unchanged.

## Testing

- Player: https://piraligame.github.io/pirali/beta149-play/
- Developer: https://piraligame.github.io/pirali/beta149-dev/
- QA: `node qa/pirali-beta149.cjs` and `node qa/pirali-beta149-browser.cjs`, plus Beta 1.48 camera regression.

## Android status

New `scripts/prepare-android-beta149.cjs` prepares **unsigned Player-only web assets** for the existing app `ge.piraligame.pirali`. This does **not** produce a signed APK/AAB, does not change the upload key, does not publish Google Play, and does not change Firebase go-live flags. Validate the Android versionCode against Play Console, use the existing keystore on the authorized machine and finish real-device testing before release.
