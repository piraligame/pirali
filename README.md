# დღიური / DIARY Alpha 0.11

Native Android planner update from Alpha 0.04. Existing package `ge.weeklyplus.app`, updated versionCode 5, versionName `0.11-alpha`, target SDK 36.

## Features

- Timer: configurable countdown, persists when app is closed; Android notification/alarm after expiration.
- Daily alarm: time, label, enable/disable; restarts after boot.
- Android exact alarm special access is requested in the Alarm/Timer pages; while denied an inexact fallback is used, so alarm may be delayed.
- Joker: 24 rounds / four players, totals and pulks, match history, JSON import/export; saved locally. Rules should be checked by game players for their house variant.
- Removed Goals from visible navigation and task editing; preserves underlying legacy records for backward compatibility.
- Dark theme choice, clearer settings dropdown and Georgian Gamers Guild, PIRALI and GEORGIA links.
- Scrollable bottom navigation on narrow screens, to avoid clipping.

## Release safety

**Only use the stable-signed release APK as an update to existing Alpha 0.04.** Debug APK uses a different certificate and cannot update installations.

Do not commit the private signing key, password or credentials to GitHub. The Gradle release signing reads `DGIURI_KEY_FILE` and `DGIURI_KEY_PASSWORD` from private environment variables.

The developer has NOT reported runtime verification on a physical phone yet. Exact notification delivery can vary with Android battery settings, Do Not Disturb and permissions.
