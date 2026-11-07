# WEEKLY+ — Alpha 0.02

Native Android offline planner in Kotlin / Jetpack Compose. This is a **separate app** from PIRALI despite this temporary isolated build branch.

**Package:** `ge.weeklyplus.app` (unchanged), **versionCode:** `2`, **versionName:** `0.02-alpha`.

## Updated features
- Built-in interactive 24-hour and minute selector in Add/Edit task. Avoids the external Android time dialog that may not appear while the keyboard is open.
- Task duration choices, and start–end time shown in the schedule.
- Search by title and notes; All / To do / Done filters.
- Daily completion progress bar.
- Duplicate existing task while clearing completion/priority history.
- Preserves all preexisting PlannerStore keys and data format.

## Build
Sources are stored in `.build/source.part*` (original verified tar.xz) plus `.build/patch-alpha002.b64` (compressed source patch). The workflow restores sources, applies compatibility fixes and builds `app-debug.apk`.

**Important:** The [CI-generated APK](https://raw.githubusercontent.com/piraligame/pirali/weekly-plus-alpha002/apks/WEEKLY_PLUS_Alpha_0.02.apk) is signed by a disposable debug certificate. It is **not** the stable-key APK. For installable future-updatable testing, use the separately distributed `WEEKLY_PLUS_Alpha_0.02_Stable.apk` with its privately preserved signing keystore.

The Alpha 0.01 signature certificate was not backed up. Android cannot update it directly using a different signing certificate. Do not uninstall Alpha 0.01 until app data is backed up. If a user needs data migration, consider using ADB run-as on the debuggable Alpha 0.01 app before uninstalling.

PIRALI main branch remains untouched.