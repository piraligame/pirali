# ფირალი / PIRALI — სამუშაოს შენახვა 2026-10-27 (Beta 1.15)

## მიმდინარე დასრულებული მდგომარეობა
- **ვებ Player:** https://piraligame.github.io/pirali/beta115-play/
- **ვებ Developer:** https://piraligame.github.io/pirali/beta115-dev/
- **კოდი:** `piraligame/pirali` რეპოზიტორიის `main`; 11 ტური, ქართული/ინგლისური/რუსული/ჩინური ენები.
- **ხელმოწერილი Android Beta 1.15 მზადაა**. პაკეტი `ge.piraligame.pirali`, `versionCode=20`, `versionName=1.15`. Alpha 0.15-ის კოდია 18, Beta 1.13-ის — 19.
- [APK ჩამოტვირთვა](https://raw.githubusercontent.com/piraligame/pirali/main/downloads/beta115/PIRALI_Beta_1.15_Signed_Update.apk) — `PIRALI_Beta_1.15_Signed_Update.apk` (7,527,655 ბაიტი).
- [AAB ჩამოტვირთვა](https://raw.githubusercontent.com/piraligame/pirali/main/downloads/beta115/PIRALI_Beta_1.15_Play_Upload.aab) — `PIRALI_Beta_1.15_Play_Upload.aab` (7,391,130 ბაიტი).
- [რელიზის დეტალური ინსტრუქცია](../BETA_1_15_ANDROID_START_HERE.md).
- [SHA-256 და ვერსიის ჩანაწერი](../downloads/beta115/PIRALI_Beta_1.15_RELEASE_INFO.json).

## რა შეიცვალა Beta 1.15-ში
1. მწვანე 🌿 ფოთოლი, რომელიც ადრე +2 HP-ს იძლეოდა, ახლა ერთჯერად დაფნის ფარს იძლევა (მაქსიმუმ 1 ერთდროულად). ერთი ტყვიის ან მტრის შეხების დარტყმა იცილება, შემდეგ ფარი იხარჯება. გამოუყენებელი ფარი გადადის შემდეგ ტურში და checkpoint-ში ინახება.
2. ახალი HUD 🌿🛡, მწვანე ვიზუალური რგოლი, აღების/დახარჯვის ეფექტები.
3. ჩოხატაურის, I ტურის რუკის ისტორიაში დაემატა სწრაფი ტუტორიალი ოთხივე ენაზე.
4. შენარჩუნებულია Beta 1.14-ის შვიდი Polish გაუმჯობესება, Player/Developer გამიჯვნა, მინი-რუკა, ფიზიკური C/X ღილაკები, 11 ტურის ბალანსი, რუკის ისტორიების პროგრესული გახსნა, Firebase ფუნქციები.

## Android-ის დადასტურება
- Windows-ის დაცული, **იგივე ორიგინალი Alpha 0.15 upload key** გამოყენებულია; გასაღებები/პაროლები GitHub-ზე არ აიტვირთა.
- APK-ის ხელმოწერა შეესაბამება ძველ Alpha 0.15 APK-ს. AAB upload-სერტიფიკატი შეესაბამება Alpha 0.15-სა და Beta 1.13-ს.
- Gradle `assembleRelease bundleRelease` წარმატებით დასრულდა. APK/AAB არქივებში ნამდვილად არის Beta 1.15 Player-ის ფარი, რუკა და index.html; Developer-ის `preview-controls.js` არ არის.
- `node qa/pirali-beta115-laurel.cjs` და `node qa/pirali-beta115-android.cjs` ტესტები გავლილია. [Android QA წარმატებული](https://github.com/piraligame/pirali/actions/runs/40529091272).
- **APK SHA-256:** `99A6237DC750579280F55B28C469B748887FD1AF6FDEFAAC5CAC3798A46054F9`
- **AAB SHA-256:** `17914BA8DA3B7B37D738A4188F8BBF04505A34B7EF3E1C6CFE29DC4C3C6A00E5`

## შენახული ასლები კომპიუტერში
- Desktop: `C:\Users\punis\OneDrive\Desktop\PIRALI_GOOGLE_PLAY_UPLOAD_BETA_1.15\`
- Backup: `C:\Users\punis\Documents\PIRALI_ALPHA_PUBLIC_ARTIFACTS\BETA_1_15_PLAY_UPLOAD_BACKUP\`
- Android build source: `C:\Users\punis\Documents\PIRALI_ANDROID_TOOLS\PIRALI_BETA115_ANDROID_RELEASE\`
- Beta 1.13-ის ძველი ხელმოწერილი APK/AAB და მისი backup ხელუხლებელია.

## ხვალიდან გასაგრძელებელი
- ჯერ დაუტესტავი ელემენტების **რეალურ ტელეფონზე** გადამოწმება: დაფნის ფარი, ტურის შეცვლისას ფარის შენარჩუნება, ძველი Alpha 0.15 აპიდან განახლება, 4 ენა, რუკა და თამაშის დასრულება. ავტომატური ტესტები ვერ ცვლის მობილურზე სრულ გავლას.
- Google Play Console-ის სავალდებულო Closed Testing მიმდინარე პერიოდშია; Production-ზე წვდომის დამტკიცება ჯერ **არ დადასტურებულა**.
- Production-ზე ნებართვის შემდეგ **იგივე არსებული PIRALI აპის** ახალი რელიზისთვის `PIRALI_Beta_1.15_Play_Upload.aab` აიტვირთება. გადაამოწმე Play Console-ში versionCode 20 უკვე გამოყენებული ხომ არ არის. **არ შექმნა ახალი აპი**.
- Google Play Console-ში Beta 1.15 **ჯერ არ ატვირთულა**. App Signing-ის განსხვავების შემთხვევაში Play-იდან დაყენებული Alpha უნდა განახლდეს უშუალოდ Play-ით; პირდაპირ APK-ის განახლება მხოლოდ იდენტურ ხელმოწერაზეა შესაძლებელი.
- ახალი ცვლილებები მხოლოდ ცალკე Beta 1.16 ან მომდევნო სატესტო ვერსიაში; შენახული 1.15 APK/AAB უცვლელად დატოვე, სანამ სპეციალურად არ მოვითხოვთ ახალ Android რელიზს.

**ამ თარიღზე მუშაობა შეჩერებულია მომხმარებლის თხოვნით.**

## 2026-10-28-ის დამატებითი გეგმა — საბრძოლო ბალანსი
- **სანადირო თოფის ტყვიების რაოდენობა 15%-ით შემცირდეს** მიმდინარე Beta 1.15-ის შესაბამის მაჩვენებელთან შედარებით. ცვლილება ეხება თოფის ხელმისაწვდომ საბრძოლო მარაგს/მოპოვებად ტყვიებს, არა ტყვიის დაზიანების ძალას.
- განხორციელებამდე გადავამოწმოთ თოფის საწყისი მარაგი, ნადავლის/ყუთების ტყვიების რაოდენობა და ეტაპებს შორის მარაგის გადატანა; შემცირება იყოს დაახლოებით 15% და მთელი რიცხვების დამრგვალება გასაგები.
- დაიტესტოს Player და Developer ვერსიებში, ისე რომ Mauser-ის ტყვიები, ფარის მექანიკა, 11 ტურის პროგრესი და ხელმოწერილი Beta 1.15 APK/AAB **უცვლელად დარჩეს**, სანამ ახალ ვერსიას ცალკე არ გამოვუშვებთ.
- სტატუსი: **დაგეგმილია, ჯერ არ არის შესრულებული**.
