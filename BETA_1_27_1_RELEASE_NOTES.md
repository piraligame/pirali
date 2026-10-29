# PIRALI Beta 1.27.1 — automatic statistics saving, no backup menu button

Based on Beta 1.27. Separate Player and Developer web previews, preserving previous releases.

- The **💾 Statistics backup** menu button has been removed from both builds.
- Standard personal stats and 100/500-kill achievements continue saving automatically to their original localStorage keys.
- A second, named-player **automatic local safety snapshot** is captured periodically following normal stats writes, after each completed stage/stars update, when the page becomes hidden, and when it is closed.
- On future play, only if the current named player profile is **missing or invalid**, the game attempts to recover from its valid local snapshot. Valid existing profiles are never replaced. A backup is separated by Player/Developer storage key and user name.
- The backup UI and its manual import/export buttons are not mounted. No automatic JSON file downloads, cloud storage, device fingerprinting, account sync or Firebase writes are attempted. A browser cannot silently download and store persistent backup files without permission.
- **Important:** These copies reside in the same browser on the same device. Clearing site data, changing browser, reinstalling the browser or moving to another phone can remove both the original and safety copies.

Unchanged: classic joystick, 11 stages, balanced combat, four languages, leaderboard settings, mandatory 3-letter name, profile display, 100/500 enemy achievements, Beta 1.27 props and mobile UI, Developer tour/invincibility controls only, Player no stage selection or replay. No APK/AAB or Google Play updates.

## QA
- `node qa/pirali-beta1271.cjs` — static preservation, menu removal, snapshot/recovery and JavaScript syntax.
- `node qa/pirali-beta125-milestones.cjs` — 100 and 500 kill milestone boundaries.
- `node qa/pirali-beta1271-browser.cjs` — headless mobile Chrome (360×760), Player & Developer, automatic snapshot, corruption/recovery, 11 stage smoke, no JS exceptions.

## Preview links
- https://piraligame.github.io/pirali/beta1271-play/index.html
- https://piraligame.github.io/pirali/beta1271-dev/index.html
