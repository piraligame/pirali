# WEEKLY+ / დღიური — Alpha 0.22 web test

This is an isolated browser test based on 0.21; Android source and debug APK are in [test-native-022](https://github.com/piraligame/dgiuri/tree/test-native-022).

Google Sign-In is wired to the existing Firebase web project using a user-initiated Google popup. Firebase Auth state persists in the browser. Cloud records can be checked (counts only) with an explicit read-only action. There are no Firestore writes in this version, and the preview's separate local data cannot overwrite cloud data.

Native Android version 0.22 uses Credential Manager and Firebase Auth in the app instead of browser redirection. Android test SHA-1 and SHA-256 are registered. Device authentication success still requires physical testing. Official Google Play update remains blocked by the unavailable stable signing password.

Website: https://piraligame.github.io/pirali/diary-alpha22-webtest/index.html?v=22
