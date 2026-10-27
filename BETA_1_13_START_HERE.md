# PIRALI BETA 1.13 — START HERE

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
- **არტეფაქტები:** `downloads/beta113/` — მხოლოდ რეალურად წარმატებით აგების, ხელმოწერისა და ტესტირების შემდეგ.
- **QA:** `node qa/pirali-beta113-android.cjs`.

კრიტიკული: APK-ით არსებული ინსტალაციის განახლება შესაძლებელია მხოლოდ იმავე package ID-ის და იმავე signing certificate-ის შემთხვევაში. Play AAB უნდა იყოს ხელმოწერილი ამ Play აპის რეგისტრირებული upload key-ით. თუ Play Console-ში უკვე უფრო მაღალი versionCode არსებობს, იქვე უნდა შემოწმდეს და გაიზარდოს code ხელახალი რელიზის გამოცემამდე.

## შენარჩუნებული ფუნქციები

11 ტური, HD campaign map, ეტაპების მუდმივი პროგრესი, უცნობი ტურების დამალული ისტორია, 4 ენა, ონლაინ რეიტინგი, მე-6 და მე-7 ტურების დასუსტება, ბოლო სიუჟეტური/ბონუს ეტაპები, PC კონტროლი C/X, მობილურის ღილაკები. Android არის თამაში შეფუთული Capacitor-ის არსებულ აპში, ახალი პაკეტი არ იქმნება.
