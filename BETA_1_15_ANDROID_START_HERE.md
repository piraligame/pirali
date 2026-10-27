# ფირალი / PIRALI — Beta 1.15 — ხელმოწერილი Android Release

## ჩამოტვირთე

- **[Beta 1.15 APK — ტელეფონზე არსებული თამაშის განახლება](https://raw.githubusercontent.com/piraligame/pirali/main/downloads/beta115/PIRALI_Beta_1.15_Signed_Update.apk)**
- **[Beta 1.15 AAB — Google Play Console-ში ასატვირთად](https://raw.githubusercontent.com/piraligame/pirali/main/downloads/beta115/PIRALI_Beta_1.15_Play_Upload.aab)**
- [SHA-256, ვერსია და დადასტურებული ხელმოწერის მონაცემები](downloads/beta115/PIRALI_Beta_1.15_RELEASE_INFO.json)

## ძველ Alpha 0.15-თან თავსებადობა

| პარამეტრი | Alpha 0.15 | Beta 1.13 | Beta 1.15 |
|---|---|---|---|
| `applicationId` | `ge.piraligame.pirali` | იგივე | იგივე |
| `versionCode` | 18 | 19 | **20** |
| `versionName` | 0.15 | 1.13 | **1.15** |
| upload key | თავდაპირველი | იგივე | **იგივე** |

**შემოწმებულია ლეპტოპზე:** `assembleRelease bundleRelease` წარმატებით დასრულდა, APK ხელმოწერაა იგივე Alpha 0.15-ის APK-სთან, AAB upload-სერტიფიკატი ემთხვევა Alpha 0.15-სა და Beta 1.13-ს. ორივე ZIP პაკეტში ნამდვილად არის `laurel-shield.js`, ოთხენოვანი რუკა და Beta 1.15 Player-ის `index.html`; არ არის Developer-ის `preview-controls.js`. `apksigner` და `jarsigner` გავლილია. SHA-256 დამოუკიდებლად გადამოწმებულია ორ ასლზე.

## რა შეიცვალა

Beta 1.14-ის ნაცვლად Beta 1.15-ში მწვანე 🌿 ფოთოლი აღარ მატებს +2 HP-ს. ახლა აქტიურია **ერთჯერადი დაფნის ფარი**: პირველ რეალურ ტყვიას ან შეხების დარტყმას უძლებს, სიცოცხლეს არ აკლებს, შემდეგ ქრება. მაქსიმუმ ერთი ფარია. გამოუყენებელი გადადის შემდეგ ტურში და checkpoint-შიც ინახება. ძველი checkpoint-ების წაკითხვა მუშაობს. ჩოხატაურის რუკის ისტორიას ემატება მოკლე ოთხენოვანი ტუტორიალი; რუკაზე დანარჩენი ისტორია იგივეა.

## სად არის კომპიუტერში

- **Desktop**: `PIRALI_GOOGLE_PLAY_UPLOAD_BETA_1.15/`
- **სარეზერვო ასლი**: `Documents/PIRALI_ALPHA_PUBLIC_ARTIFACTS/BETA_1_15_PLAY_UPLOAD_BACKUP/`
- პროექტის წყარო: `Documents/PIRALI_ANDROID_TOOLS/PIRALI_BETA115_ANDROID_RELEASE/`

## ატვირთვის ინსტრუქცია

1. გახსენი **Google Play Console → არსებული PIRALI აპი** (`ge.piraligame.pirali`).
2. Production-ზე ნებართვის მიღების შემდეგ გადადი **Production → Create new release**. თუ ჯერ Production ნებადართული არ არის, AAB შეიძლება სატესტო ტრეკზეც ატვირთო განახლებისთვის.
3. ატვირთე `PIRALI_Beta_1.15_Play_Upload.aab` (არ ატვირთო APK Play-ის AAB ველში).
4. გადაამოწმე ვერსიის კოდი **20** და რომ Play Console-ს ჯერ არ აქვს 20 ან მეტი კოდი გამოყენებული. საჭიროების შემთხვევაში მომდევნო კოდი ცალკე უნდა გაიზარდოს და თავიდან მოეწეროს ხელი.
5. მიუთითე ცვლილებების მოკლე აღწერა, გადაამოწმე ქვეყნები და გაგზავნე განხილვაზე.

**სიფრთხილე:** Google Play App Signing აპებს საკუთარი საბოლოო ხელმოწერა აქვთ. APK პირდაპირ განაახლებს მხოლოდ იმავე signing certificate-ით დაყენებულ Alpha 0.15-ს; თუ აპი Play Store-დანაა დაყენებული და მისი app-signing სერტიფიკატი განსხვავდება upload key-ისგან, განახლება Play-ით უნდა მოხდეს. **არც ახალი აპი, არც ახალი signing key არ შექმნა.** Play Console-ში ჯერ არაფერი ატვირთულა.

## QA

- `node qa/pirali-beta115-laurel.cjs`
- `node qa/pirali-beta115-android.cjs`

**შენიშვნა:** ხელმოწერა, პაკეტისა და ZIP-შიგთავსის შემოწმება რეალურად შესრულდა. სრული თამაშის ხელით გავლა კონკრეტულ ტელეფონზე და Google Play-ის მიერ AAB-ის მიღება ჯერ ცალკე დასადასტურებელია. Beta 1.13-ის წინასწარ ხელმოწერილი ფაილები ხელუხლებელია.
