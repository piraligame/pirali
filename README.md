# დღიური Alpha 0.04

Android offline planner. This isolated branch is not the PIRALI main game.

- Calendar: day, week, month and **year** with 12-month overview. Navigation arrows change the selected view period.
- Removed onboarding modal for existing and fresh installs.
- Premium card styling, refined header, quick-add task input.
- Overdue-task review and one-tap move to today.
- Tasks sorted by time, name or completion status; Today/Tomorrow/7-days shortcuts in editor.
- Monthly completion plus active-day streak in Insights.
- Export/import JSON backups with confirmation and validation. Import replaces existing records by request only.
- 7 languages preserved: Georgian, Russian, English, Chinese, Spanish, German, French.

Package: ge.weeklyplus.app | versionCode=4 | versionName=0.04-alpha

**Important:** CI APKs use ephemeral debug signing. To update installed DIARY Alpha 0.03 Stable, use **the separately stable-signed 0.04 update APK** signed with the same 0.03 Stable certificate. Do not use CI debug APK as a phone update. Original data keys weeklyplus_v1 stay unchanged.
