# PIRALI — Alpha 0.10 / Google Play Internal Testing კანდიდატი
მომზადებულია: 2026-10-19. სამუშაო შტო: `release/alpha-0.10-play`.

## შეიცვალა
- Android applicationId უცვლელია: `ge.piraligame.pirali`.
- ვერსია `0.10` და Android `versionCode=10`.
- გამარჯვების ეკრანზე დამატებულია „მთავარ მენიუში“ ოთხივე ენაზე.
- სიკვდილის შემდეგ ძველი ტურის გაგრძელება არ აღდგება; მთავარი მენიუს ღილაკი რჩება.
- ონლაინ რეიტინგი, საბოლოო ტურის სანადირო თოფი და ვაზნები ხელუხლებელია.
- თამაშში დამატებულია კონფიდენციალურობის პოლიტიკის ნახვის ფუნქცია, ონლაინ კავშირის გარეშეც.
- გამოშვების სკრიპტში ამოღებულია `0.07`-ის მყარი ვერიფიკაცია.

## აპის შემოწმება
- კოდისა და საწყისი მენიუს ტესტები; ქართული/ინგლისური/რუსული/ჩინური ენები.
- გამარჯვება/დამარცხება → მთავარი მენიუ.
- სიკვდილის შემდეგ checkpoint-ის წაშლა, ბოლო ტურის თოფისა და ვაზნების არსებობა.
- Firebase-ის მოქმედ ბაზაში ტესტიდან **არ გაგზავნილა POST/PATCH/DELETE მოთხოვნა**.
- Signed APK და Signed AAB-ის ვალიდაცია; მიმდინარე certificate fingerprint უნდა ემთხვეოდეს Alpha 0.07-ს.
- ნამდვილ Android ტელეფონზე ინსტალაცია, განახლება, ხმები და touch-control ჯერ ცალკე დასატესტია.

## სადაა გამოსაშვები ფაილები
`ფირალი მთავარი/PIRALI_ALPHA_RELEASES/PIRALI_Alpha_Test_0.10.apk`
`ფირალი მთავარი/PIRALI_ALPHA_RELEASES/PIRALI_Alpha_Test_0.10.aab`
`ფირალი მთავარი/PIRALI_ALPHA_RELEASES/PIRALI_Alpha_Test_0.10_MANIFEST.json`

## Google Play-ის წინაპირობები
1. ახალი თამაშის ჩანაწერი — PIRALI; package ID `ge.piraligame.pirali`.
2. Google Play App Signing-ის დაყენება / upload key იგივე დაცული ადგილობრივი keystore.
3. ტესტირების სატელეფონო APK/AAB-ის შეჯერება, Android update სცენარის შემოწმება.
4. Main Store Listing: icon 512×512; მინიმუმ 2 რეალური 1080×1920 screenshot; feature graphic საჭიროების მიხედვით.
5. Data Safety: საჯარო ფსევდონიმი, რეიტინგის ქულა/დონე/გამარჯვება/დრო Firebase-ში; შესაძლო ტექნიკური ქსელის მონაცემები; localStorage. მონიშვნები გადაამოწმე Google Play Console-ში.
6. კონფიდენციალურობის საჯარო URL (მას შემდეგ, რაც `privacy.html` საჯარო ვერსიაში გამოჩნდება).
7. Content Rating, Target Audience, App Access, Ads, Privacy, Contact Email — შეავსე რეალური ფაქტებით.
8. თუ დეველოპერის ახალი პირადი ანგარიში დახურულ ტესტირებას ექვემდებარება, დაასრულე მოთხოვნილი პერიოდი/ტესტერთა რაოდენობა, სანამ Production-ს მოითხოვ.
9. Firebase უსაფრთხოების წესები ცალკე უნდა შეფასდეს: მხოლოდ სახელით დუბლიკატების UI გაერთიანება ბოროტმოქმედებისგან მონაცემთა ბაზას არ იცავს.

## Play Store / მთავარი აღწერა
**სათაური (KA):** PIRALI — სიმონას გზა
**მოკლე ტექსტი (KA):** გაიარე სიმონას გზა გურიის ტყეებიდან ეკლესიამდე — იბრძოლე და დაამყარე რეკორდი.
**სრული ტექსტი (KA):**
PIRALI — ქართული თავგადასავალი სიმონა დალიძის შესახებ. გაიარე ხუთი ტური ჩოხატაურიდან უდაბნოს ეკლესიამდე. შეებრძოლე მოწინააღმდეგეებს, გამოიყენე მაუზერი და ახლო ბრძოლის იარაღი, მოძებნე სანადირო თოფი და ვაზნები ფინალურ ტურში. დაეუფლე კონტროლს, დაიცავი სიცოცხლე და მოხვდი საუკეთესო მოთამაშეთა ონლაინ ოცეულში.

**Title (EN):** PIRALI — Simona's Journey
**Short description (EN):** Fight through five Georgian locations and reach the church. Set your high score!
**Full description (EN):**
PIRALI is a Georgian top-down action adventure following Simona Dolidze on a dangerous path through forests and villages. Battle your enemies, manage ammunition and health, and progress through five handcrafted stages toward the church. Master your Mauser, collect equipment including a hunting shotgun in the final stage, and compete on the online Top 20 leaderboard. Play in Georgian, English, Russian or Chinese.

## მნიშვნელოვანი შეზღუდვები
ეს არის **Internal Testing-ის კანდიდატი**, არა დადასტურებული საჯარო Play Store გამოშვება. Beta, Alpha 0.08 და ძირითადი main შტო არ უნდა შეიცვალოს საბოლოო ტესტირებისა და ავტორის თანხმობის გარეშე.
