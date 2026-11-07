# დღიური Alpha 0.14 — browser preview

[Launch DGIURI 0.14](https://piraligame.github.io/pirali/diary-alpha14-webtest/index.html?v=14)

This is the browser-only preview; no Android APK/AAB has been built for 0.14.

## Changes over 0.13
- First tab: **List / სია**, an unlimited checkbox list separate from dated tasks; completed rows turn red and are struck through.
- Six destinations: List, Today, Calendar, Results, Other, Settings. Results return next to Calendar.
- **Combined results**: 7-day dated tasks plus the whole List completion count. The chart still represents dated tasks for the past week.
- Two new accent colors: Cyan and Slate (seven total).
- In Settings: Google login & Firestore sync integration, using a *separate* Firebase project (not PIRALI's database).
- Cloud snapshot contains tasks, TOP priorities, categories, preferences, List, diary history, Joker sheet/matches, clock configuration; statistics are calculated from the synced data.
- Alarm volume slider increases **in-page** generated web tones, not Android's hardware/system ringtone. The browser cannot reliably schedule alarms when closed.
- Keeps the design, Joker, diary, dark-mode contrast and backup export/import from 0.13.

## Firebase admin configuration / release gate
The Firebase project and Firestore database/rules have been created:
- Project: \`dgiuri-weeklyplus-ge-2026\`
- Web app: \`DGIURI-WEB\`
- Firestore security rules only allow authenticated users to read/write \`profiles/{uid}/data/{documentId}\` for matching \`uid\`.

**Google sign-in is not fully enabled merely by adding the button or creating Firestore.** Before declaring cloud login ready, in Firebase Console:
1. Enable Firebase Authentication and **Google** as a sign-in provider; set the required project support email.
2. Under Authentication → Settings → Authorized domains, explicitly authorize \`piraligame.github.io\` (as well as the Firebase auth handler domain).
3. Test the real OAuth popup, save, sign out and sign in on a second device, and confirm Firestore rules and data access. Until verified, cloud sync is a *preview/pending setup*, not a guaranteed live account service.

Browser data remain local before sign-in. Existing data should be backed up before testing the cloud transition. The app doesn't sell data or require sign-in for local functionality.

**Important:** The Firestore demo uses bounded per-domain documents (Firestore has document size limits); large journals require per-entry document sync before production release.
