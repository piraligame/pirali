# PIRALI BETA 1.13 — START HERE

## ხელმოწერილი Android ფაილები — მზადაა

- [**APK — Beta 1.13 განახლება ტელეფონზე**](https://github.com/piraligame/pirali/raw/refs/heads/main/downloads/beta113/PIRALI_Beta_1.13_Signed_Update.apk)
- [**AAB — Beta 1.13 Google Play Console-ისთვის**](https://github.com/piraligame/pirali/raw/refs/heads/main/downloads/beta113/PIRALI_Beta_1.13_Play_Upload.aab)
- [**APK/AAB ხელმოწერისა და SHA-256-ის მონაცემები**](downloads/beta113/PIRALI_Beta_1.13_RELEASE_INFO.json)

**შემოწმებულია:** ორივე ბილდი ხელმოწერილია; APK-ის სერტიფიკატი ემთხვევა Alpha 0.15 APK-ს, ხოლო AAB-ის upload სერტიფიკატი ემთხვევა Alpha 0.15 AAB-ს. პაკეტია `ge.piraligame.pirali`; ახალი `versionCode=19`. AAB ჯერ Play Console-ში არ არის ატვირთული.

## ვებ-ვერსიები

**PLAYER:** https://piraligame.github.io/pirali/beta113-play/

**DEVELOPER:** https://piraligame.github.io/pirali/beta113-dev/

Source: `beta113-play/`, `beta113-dev/`.

## Android-ის თავსებადი განახლება

- **appId:** `ge.piraligame.pirali` — იგივე აპლიკაცია, რაც Alpha 0.15.
- **ძველი ვერსია:** Alpha 0.15, `versionCode=18`, `versionName=0.15`.
- **ახალი ვერსია:** Beta 1.13, `versionCode=19`, `versionName=1.13`.
- **APK:** ტელეფონზე არსებული Alpha 0.15-ის განახლებისთვის იგივე ხელმოწერით.
- **AAB:** Google Play Console-ის Closed Testing ან სხვა ნებადართული ტრეკის განახლებისთვის, იმავე upload-key-ით.
- **Android-ის თამაში:** ყოველთვის `beta113-play/`, არა Developer.
- **ხელმოწერა:** ლოკალური ძველი `PIRALI-ALPHA-UPLOAD-KEY.p12`, პროექტისა და GitHub-ის გარეთ დაცული Windows DPAPI პაროლით.
- **Build:** `npm ci` → `powershell -ExecutionPolicy Bypass -File scripts/build-beta113-signed.ps1`.
- **არტეფაქტები:** `downloads/beta113/` — ხელმოწერილი APK/AAB უკვე შექმნილია, დადასტურებულია და ჩამოსატვირთად განთავსებულია.
- **QA:** `node qa/pirali-beta113-android.cjs`.

კრიტიკული: APK-ით არსებული ინსტალაციის განახლება შესაძლებელია მხოლოდ იმავე package ID-ის და იმავე signing certificate-ის შემთხვევაში. Play AAB უნდა იყოს ხელმოწერილი ამ Play აპის რეგისტრირებული upload key-ით. თუ Play Console-ში უკვე უფრო მაღალი versionCode არსებობს, იქვე უნდა შემოწმდეს და გაიზარდოს code ხელახალი რელიზის გამოცემამდე.

## შენარჩუნებული ფუნქციები

11 ტური, HD campaign map, ეტაპების მუდმივი პროგრესი, უცნობი ტურების დამალული ისტორია, 4 ენა, ონლაინ რეიტინგი, მე-6 და მე-7 ტურების დასუსტება, ბოლო სიუჟეტური/ბონუს ეტაპები, PC კონტროლი C/X, მობილურის ღილაკები. Android არის თამაში შეფუთული Capacitor-ის არსებულ აპში, ახალი პაკეტი არ იქმნება.
