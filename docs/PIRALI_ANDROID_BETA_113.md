# PIRALI 1.13 Android — უსაფრთხო განახლება Alpha 0.15-დან

## ზუსტი იდენტობა

| მაჩვენებელი | Alpha 0.15 | Beta 1.13 |
|---|---|---|
| Android `applicationId` | `ge.piraligame.pirali` | `ge.piraligame.pirali` |
| `versionCode` | 18 | 19 |
| `versionName` | 0.15 | 1.13 |
| Signing | ძველი private upload key | **იგივე key** |
| თამაშის წყარო | წინა Alpha | `beta113-play/` |

## Build და ხელმოწერის დაცვა

`scripts/build-android-beta113.cjs` კოპირებს `beta113-play/` წყაროს `dist/android-web/`-ში და ამოწმებს ვერსიას, ფაილებს და Player რეჟიმს. `scripts/build-beta113-signed.ps1` იყენებს მხოლოდ არსებულ Windows DPAPI დაცულ პაროლს და keystore-ს (არავითარი ახალი გასაღები). Gradle აწყობს `assembleRelease bundleRelease`-ს; შემდეგ შემოწმდება APK/AAB ხელმოწერა, APK package/version და ძველი Alpha 0.15 APK-ის signer.

არ ატვირთო GitHub-ზე `.p12`, `.jks`, პაროლები, DPAPI ფაილები, გარემოს ცვლადები ან არ გააზიარო ისინი. APK/AAB ფაილებში გასაღები არ ინახება.

## Play Console

Closed Testing → Create new release → Upload `PIRALI_Beta_1.13_Play_Upload.aab` → release notes → Review and roll out to testers. წინასწარ გადაამოწმე appId, upload-key acceptance და versionCode. Google Play-ის უკვე არსებული ტესტირების სტატუსი და მიღებული გამოცემები არ წაშალო; production ხელმისაწვდომობა Play-ის წესებზეა დამოკიდებული.

**APK** `PIRALI_Beta_1.13_Signed_Update.apk` ტელეფონზე ცალკე ინსტალაციის გარეშე უნდა განაახლებდეს Alpha 0.15-ს, თუ ის იმავე signing identity-ითაა დაყენებული. APK-ის ინსტალაციისას შენახული თამაშის ლოკალური მონაცემების დასაკარგად თავიდან დაყენება არ არის საჭირო.

დასასრულს მოძებნე `downloads/beta113/PIRALI_Beta_1.13_RELEASE_INFO.json` და QA ტესტის შედეგები. ხელით მობილურზე სრული თამაში და Play Console-ში AAB-ის მიღება უნდა დადასტურდეს დამატებით.
