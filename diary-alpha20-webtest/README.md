# დღიური / WEEKLY+ — Alpha 0.20 browser preview (derived from verified 0.19)

Base: `diary-alpha19-webtest/index.html` (calendar red outline fixes preserved). This is a **new, isolated preview directory**; the Alpha 0.19 files, native APK/AAB and store testing release were not modified.

Preview URL: https://piraligame.github.io/pirali/diary-alpha20-webtest/

## Interactive in this browser preview
- 12-month compact annual calendar, year switching, month/day navigation and red rings around dates with planned tasks or journal entries;
- quick journal entry shortcut;
- daily/weekly/monthly recurring tasks (from 0.19) plus preview options for biweekly, weekdays and annual recurrence;
- task category dots and journal note categories;
- pinning journal notes above ordinary notes (the common checklist also retains its previous pin feature);
- JSON backup/restore including preview notes, pin metadata and small file attachments;
- upload/preview/download small images and documents on journal notes, limited to 300 KB per file, up to three per save;
- detailed weekly task review;
- a visual example of the Android home-screen widget and PIN UI. **These are illustrative only**, not functional OS widgets, cryptographic protection or biometric authentication.

## Deliberately isolated
- This page uses separate localStorage keys for tasks, journal, checklist and Joker; it does not overwrite the previous 0.19 browser data.
- Firebase cloud login/sync is not loaded in this demonstration. Data remains local to this browser.
- Search and TOP sections are hidden in this preview as requested; existing production code and data remain untouched.
- Browser reminders work only while the page and browser allow them. Native Android widget, OS alarm behavior and biometric security require native APK development.

This is a demonstration version, **not** an Android app update or a Play Store package.
