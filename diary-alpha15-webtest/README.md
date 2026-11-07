# დღიური Alpha 0.15 — Web preview

Open in a browser without installing an APK:

https://piraligame.github.io/pirali/diary-alpha15-webtest/index.html?v=15

## 0.15 changes (based on 0.14; the rest of the app is unchanged)
- The List page's new-task input uses a responsive 2-column layout; the compact plus and Add button stay inside the card, including 320px-wide mobile screens.
- List filters appear in the order: შესასრულებელი → შესრულებული → ყველა. The first filter opens by default.
- Existing list, calendar, diary, Joker and combined statistics are retained.
- Firebase Authentication's Google provider is now enabled in the separate DGIURI project; piraligame.github.io is an authorized domain.
- The OAuth popup was verified to reach the authentic Google Accounts sign-in URL in an automated Chrome test.
- Account switching resets the previous account's local copy before restoring the next account's data; returning to an already linked account treats its cloud copy as authoritative to avoid resurrecting deleted rows.

## Google sync and limits

Firebase project: dgiuri-weeklyplus-ge-2026.
Google OAuth account selection was tested without signing in to a personal Google account. End-to-end sync between two signed-in devices still requires a real user test.

The app can run locally without an account. Entries initially live in browser storage. Settings includes backup export/import. Sign-in may be blocked by some embedded WebViews; if needed, open this URL in external Chrome.

Firestore rules scope each user's data by their authenticated UID. The synced data includes tasks, TOP priorities, independent list, journal notes, Joker history, clock preferences and display settings.

Large journals may require per-entry Firestore documents rather than aggregate documents because of the Firestore per-document size limit. Back up data until a real sign-in/sync test succeeds.

No APK or AAB was created for 0.15. Browser approval is required before creating Android files.
