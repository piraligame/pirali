# WEEKLY+ / დღიური — Alpha 0.21 WEB preview

Based on 0.20 / 0.19, **separate** from the native Android package and its storage.

- Compact full-viewport 3×4 year calendar with 12 months and day-level red rings.
- Year dropdown remains in Year mode only.
- Existing 0.15-style Joker score sheet is preserved from the earlier 0.19/0.20 source.
- The original Day page remains clean and compact; the Web demo is not the native APK.
- Optional web device-orientation compass preview; Android native compass uses rotation-vector hardware.
- Local preview data only; no native Play app synchronization.
- **Google account sync is not available in this isolated preview.** Do not assume native login works just because a browser URL opens.
- The Android APK supports a real home-screen widget, native notification channels, and PIN/biometric gates; those OS features cannot be reproduced faithfully in this web preview.

URL: https://piraligame.github.io/pirali/diary-alpha21-webtest/index.html?v=21

Do not upload unsigned release AABs to Google Play. For the existing app, an AAB signed with the established DGIURI stable upload key and a higher versionCode is required.
