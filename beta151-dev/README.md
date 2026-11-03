# ფირალი / PIRALI — Beta 1.15

- 🌿 ძველი სამკურნალო ბალახი აღარ ავსებს HP-ს. ახლა გაძლევს ერთჯერად დაფნის ფარს — ერთი ტყვიის ან შეხებისგან დაცვას.
- ფარი მაქსიმუმ ერთია, შემდეგ ტურში გადაგყვება და checkpoint-შიც ინახება. დარტყმისას ქრება. ძველი checkpoint-ების წაკითხვა შენარჩუნებულია.
- ფარის მდგომარეობა ჩანს ეკრანზე და სიმონას გარშემო. პირველი ტურის რუკას დაემატა მოკლე გაკვეთილი ოთხივე ენაზე.
- 11 ტური, ბალანსი, რეიტინგი და Beta 1.13-ის ხელმოწერილი Android ფაილები უცვლელია.
- ეს ვებ-სატესტო რელიზია, ჯერ არ არის 1.15 APK/AAB.
- https://piraligame.github.io/pirali/beta115-dev/

# PIRALI BETA 1.14 — Polish Update

- Seven improvements: loot feedback, combo streak UI, localized minimap legend, touch/PC button flashes, non-blocking stage completion summary, lifetime map achievements, and stability fixes/QA.
- Combos preserve ×2 score rules; ×3 indicates consecutive kills only, not points multiplier.
- Completed stage toast never pauses / slows the transition to the next level.
- No APK/AAB in this web-only beta; signed Beta 1.13 remains the Google Play upload candidate.
- URL: https://piraligame.github.io/pirali/beta114-dev/

# PIRALI / ფირალი — BETA 1.12 DEVELOPER

**გაშვების ბმული:** https://piraligame.github.io/pirali/beta112-dev/

### 1.12 — რუკისა და PC კონტროლის დახვეწა
- რუკის გახსნისას ჩოხატაურის აღწერა ავტომატურად ჩანს; რუკის სურათიც ჩოხატაურის მონაკვეთზე იხსნება.
- ჩაკეტილ ტურზე დაჭერით გამოჩნდება მხოლოდ „ხელმიუწვდომელია — სიმონა ჯერ არ არის აქ ნამყოფი!“; ჯერ მიუღწეველი ტურის სიუჟეტი/მიზანი/ჯილდო არ იხსნება.
- ტურის აღწერების ქვედა ნაწილიდან ზედმეტი „← ჩოხატაური“ ღილაკი სრულად ამოღებულია; გახსნილ ტურზე გადასვლა რუკაზე უშუალოდ დაჭერით ხდება. „← უკან“ ზედა კუთხეში რუკის დასახურად რჩება.
- Player-ში აღმოჩენილი ტურები სამუდამოდ რჩება ლოკალურ პირად პროფილში, Developer-ში 11-ვე ტური თავიდანვე გახსნილია. Developer-ის სატესტო მონაცემები Player-ისგან განცალკევებულია.
- PC: X = ხმალი, C = „მოი აგერ!“, Space/Z = სროლა, WASD/ისრები = მოძრაობა; ფიზიკური KeyX და KeyC ყველა ენის კლავიატურაზე მუშაობს.
- მობილურის ღილაკები, ტურების საბრძოლო ბალანსი, HD რუკა, mini-map, 4 ენა და Firebase სტატისტიკა უცვლელია.
- ავტომატური შემოწმება: `node qa/pirali-beta112-release.cjs` GitHub Actions-ით.
- **მხოლოდ ვებ-რელიზია.** APK/AAB და Google Play ჯერ არ განახლებულა.

---

# PIRALI BETA 1.11.3 — რუკის მუდმივად გახსნილი ტურები

- რუკის გახსნისთანავე ავტომატურად ნაჩვენებია **პირველი ტური — ჩოხატაური** და მისი აღწერა; რუკის ქვედა ნაწილი ცარიელი აღარ არის. სხვა ტურის არჩევისას აღწერა იცვლება.
- **PLAYER:** საინფორმაციო ბარათები ხელმისაწვდომია მხოლოდ იმ ტურის ჩათვლით, სადაც მოთამაშეს ოდესმე მიუღწევია. უფრო მაღალი ტურების ნიშნულები დაბლოკილია და არ იხსნება დაჭერისას.
- **DEVELOPER:** რუკის 11-ვე ტურის საინფორმაციო ბარათი ყოველთვის ხელმისაწვდომია.
- მოთამაშის პირად სტატისტიკაში ინახება `maxReachedStage` — უმაღლესი მიღწეული ტური; მასზე გავლენას არ ახდენს თამაშის თავიდან დაწყება, სიკვდილი ან checkpoint-ის წაშლა.
- ძველი მონაცემების მიგრაცია: თუ მოთამაშეს უკვე აქვს დასრულებული ტურების საუკეთესო დროები ან შენახული checkpoint, რუკა მათგან აღადგენს უმაღლეს ტურს.
- პირადი მონაცემები იწერება მოწყობილობის/ბრაუზერის ლოკალურ საცავში, მოთამაშის სახელით; სხვა მოწყობილობაზე ავტომატურად არ სინქრონიზდება.
- Developer-ის პირადი სტატისტიკა და checkpoint განცალკევებულია Player-ის საცავისგან; Developer-ში ტურის გამოტოვება Player-ის რუკის მიღწევებს არ ზრდის.
- რუკა მხოლოდ ინფორმაციისთვისაა: არ ცვლის რეალური თამაშის გახსნილ ტურებს, რეიტინგს, საბრძოლო ბალანსს ან ონლაინ მონაცემებს.
- QA: `node qa/pirali-beta1113-player-unlocks.cjs`, `node qa/pirali-beta1112-story-map.cjs`.
- ახალი ვებ-ვერსია: **Beta 1.11.3**. Android APK/AAB და Google Play უცვლელია.

# PIRALI BETA 1.11.2 — ფირალის ინტერაქტიული რუკა

- რუკის თერთმეტივე ტური გახდა დასაჭერი საინფორმაციო ნიშნული. დაჭერისას ჩნდება მოკლე თავგადასავალი, ტურის მიზანი, ჯილდო და პროგრესის სტატუსი.
- რუკა აჩვენებს გავლილ, მიმდინარე და მომავალ ტურებს მხოლოდ შენახული checkpoint-ისა და მიმდინარე ტურის მიხედვით.
- მომავალ ტურზეც შესაძლებელია აღწერის ნახვა, მაგრამ რუკიდან ტურის დაწყება/გამოტოვება, ქულების ან checkpoint-ის შეცვლა შეუძლებელია.
- მე-7 ტურზე ნაჩვენებია გენერალი, ბატონი და დიდი გული (5→6); მე-10-ზე ეშმაკი, დიდი გული (6→7) და 250-ქულიანი მონეტები; მე-11-ზე ხუთი ტალღა, სახლი და 2000-მდე ბონუსი.
- რუკის ენა ავტომატურად მიჰყვება თამაშში არჩეულ ქართულს, ინგლისურს, რუსულს ან ჩინურს; ცალკე გადამრთველი არ არსებობს.
- მაღალხარისხიანი რუკა, შიდა მინი-რუკა, დანარჩენი 11 ტურის საბრძოლო ლოგიკა და Player/Developer განცალკევება არ იცვლება.
- ვებ-ვერსია 1.11.2; Android APK/AAB და Play Store უცვლელია.
- ტესტი: `node qa/pirali-beta1112-story-map.cjs`.

# ფირალი Beta 1.11.1 — რუკის ენა

- ფირალის რუკიდან ზედა ოთხენოვანი გადამრთველი ამოღებულია (ქართულად/English/Русский/中文).
- რუკის სათაური, ტურის სახელები, სტატუსები და ტექსტები ავტომატურად ემთხვევა თამაშში არჩეულ ენას.
- რუკა უსმენს `pirali:languagechange` მოვლენას და ენის შეცვლისას თავიდან ხატავს წარწერებს.
- HD რუკა, 11 ტურის ადგილმდებარეობა, მინი-რუკა, შენახული პროგრესი და ტურის ბალანსი უცვლელია.
- QA: `node qa/pirali-beta1111-map-language.cjs`; Player და Developer ორივე ერთნაირად განახლებულია.
- APK/AAB და Google Play უცვლელია. ეს მხოლოდ Beta 1.11.1 ვებ-ვერსიაა.

# ფირალი BETA 1.11 — DEVELOPER

## მე-7 ტური — „უდაბნოს ეკლესია“
- მე-7 ტურში მტრების საწყისი რაოდენობა Beta 1.10.2-თან შედარებით კიდევ 10%-ით შემცირდა (მთელ რიცხვზე დამრგვალებით).
- პირველ 700 სათამაშო ერთეულში მტრები არ ჩნდებიან. მარშრუტის დარჩენილ მონაკვეთებზე ისინი თანაბრად არიან განაწილებული; ეკლესიის ოთხი მცველი შენარჩუნებულია.
- ჯარისკაცებისა და გენერლის HP და შეტევის ტემპი 10%-ით შემცირდა; გენერლის დამხმარის HP-ც 10%-ით შემცირდა.
- გენერლის შემდეგ ბატონი, დიდი გული (+1 მაქსიმალური სიცოცხლე) და ეკლესიის გასასვლელი კვლავ სავალდებულოა.
- მე-6 ტურის გამარტივება, მე-11 ტურის გულების მარაგი, სხვა ტურები, ოთხი ენა, HD რუკა და მინი-რუკა უცვლელია.
- Beta 1.10.2 რჩება უცვლელი; Beta 1.11 ცალკე ვებ-ვერსიაა. APK/AAB და Google Play არ განახლებულა.
- ტესტი: `node qa/pirali-beta111-stage7-stability.cjs`.

---
## BETA 1.10.2 — მე-6 ტურის ბალანსი (2026-10-27)
- მე-6 ტურის მტრების რაოდენობა კიდევ ~10%-ით შემცირდა Beta 1.10.1-ის მიმართ (×0.81 → ×0.729 საწყისი რაოდენობიდან, დამრგვალებით).
- დასაწყისში სიმონას გამოჩენის წერტილიდან 660 სათამაშო ერთეულის რადიუსში მტრები აღარ არიან; დარჩენილები მთელ მომდევნო გზაზე ნაწილდებიან და არა მხოლოდ პირველსავე მონაკვეთში.
- მე-6 ტურში მტრის მოკვლის შემდეგ სამკურნალო გულის ჩამოგდების შანსი +20%-ით გაიზარდა (12.87% → 15.444%); ტყვიების ჩამოგდების შანსი უცვლელია.
- 1–5 და 7–11 ტურების წესები, მე-11 ტურის +20% გულები, 7 სიცოცხლის ლიმიტი, HD რუკა და Firebase უცვლელია.
- Browser cache version: `beta1102-stage6-hearts`, `beta1102-stage6-density`; ავტომატური შემოწმება: `node qa/pirali-beta1102-stage6.cjs`.

## BETA 1.10.1 — 11-ე ტურში +20% გულების შანსი
- მე-11 ტურში ტყვიებთან ერთად პერიოდულად წარმოქმნილი გულების შანსი 20%-ით გაიზარდა უშუალოდ BETA 1.10-თან შედარებით (წინა x1.15 → ახალი x1.38 საწყის შანსთან შედარებით).
- ბალანსი ეხება მხოლოდ მე-11 ტურს. 1–10 ტურებში გულის/ტყვიის შანსი უცვლელია.
- 11 ტურის 5×10 მტრის ტალღები, რეიტინგი, მაღალი ხარისხის რუკა და მაქსიმალური 7 სიცოცხლე უცვლელია.
- Player და Developer განახლებულია; `js/features/endless/waves.js`-ს ახალი cache-key აქვს: `beta1101-stage11-hearts-20`.
- სატესტო QA: `node qa/pirali-beta110-hearts.cjs` და HD map-ის ტესტი.

## BETA 1.10 — HD map verification (2026-10-27)
- Approved 1024×1536-pixel campaign map now replaces the 5 KB image in both Player and Developer at `assets/maps/pirali-approved.webp` (775,170 bytes).
- Cached map UI script, styles and image all use the `beta110-hd-20261027` cache key.
- The existing 11 tours, level names, translations and in-game mini-map are unchanged.
- CI regression check: `node qa/pirali-beta110-hd-map.cjs`.

# PIRALI BETA 1.09.2 DEV

- All eleven stages: enemies and generals weakened by an additional **10% HP and attack/movement rates**, on top of BETA 1.06 tuning.
- Eleventh stage: each of the five waves contains **10** total opponents, no landlord; wave 4 includes 1 General, wave 5 includes 2 Generals (inside the 10).
- All levels: **+10%** relative enemy Mauser ammo, hunting-shotgun shell and healing-heart drop chances; also +10% relative Mauser and heart placed item rates, subject to integer rounding; extra stage-11 periodic ammunition restocks.
- Preserved previous 1.06 features: stage-six roadside cover, sight-based AI pursuit, instant exits, stage 11 Gurian home entrance win, Georgian flag and crown, 300+300+400+400+600=2000 final bonus and 5000+2000=7000 total cap.
- DEV stays local-only and includes testing controls; PLAYER Beta scoreboard cannot be written.
- No APK/AAB or Play Store change. Live 7000-score Firebase server rule acceptance still unverified.

## Illustrated campaign map (localized)

From the main menu click 🗺️ Map. One vertically scrolling, parchment-style illustrated 11-stop route is loaded from `assets/maps/pirali-road.svg`; **all stop labels come from the actual game `PIRALI_LEVELS` translations**, so Georgian/US English/Russian/Chinese are exact, and the four language controls immediately change those overlays. Completed/current/unreached stages are marked; the map has no level-skip action. This avoids four large duplicate image files and misspellings baked into pictures.


## BETA 1.09 | დიდი გულები
- მე-7 ტური: გენერლის სიკვდილის შემდეგ დიდი გული — სიცოცხლის მაქსიმუმი 5-დან 6-მდე.
- მე-10 ტური: ეშმაკის სიკვდილის შემდეგ ცეცხლოვან კარიბჭესთან მეორე დიდი გული — მაქსიმუმი 6-დან 7-მდე. ოქროს მონეტები უცვლელია.
- თითო დიდი გული თამაშში მხოლოდ ერთხელ მიიღება; პატარა გულები მხოლოდ HP-ს აღადგენს.
- მე-7 და მე-10 ტურის გასასვლელები ითხოვენ დიდი გულის აღებას; HUD-ს და checkpoint-ს გადაჰყვება მაქსიმუმი 6/7, ახალი თამაშისას კი კვლავ 5.
- KA / US EN / RU / ZH შეტყობინებები. DEV და PLAYER განცალკევებულია; Firebase/Android უცვლელია.
- ტესტი: GitHub Actions PIRALI BETA 1.09 big hearts QA.

## BETA 1.09 — approved map & live minimap

- Chosen illustrated vertical 11-stage map replaces the previous landscape SVG in the main-menu Map overlay. Optimized asset: `assets/maps/pirali-approved.webp`.
- All 11 captions use the verified stage list in Georgian, US English, Russian and Chinese; current/completed/locked states remain informational (no stage skipping).
- Stage 11 live top HUD: `გზა სახლისაკენ 🇬🇪` and translated variants, including on checkpoint resume.
- Live, toggleable in-game minimap: Simona, facing direction, path/terrain, enemies, pickups, boss, and stage goal; north remains up.
- Beta 1.08 large hearts 5→6→7, checkpoint persistence, Firebase season isolation, score cap 7,000, and 11th-stage five waves remain preserved.
- QA: `qa/pirali-beta109-map-hud.cjs` in GitHub Actions. No Android/Google Play changes.

## BETA 1.09.1 — მინი-რუკა გულების ქვემოთ
- რუკა ეკრანის მარცხენა მხარეს, სიცოცხლის გულების პანელიდან ზუსტად 6px ქვემოთაა.
- განლაგება ავტომატურად ერგება HUD-ს, ტელეფონის მობრუნებასა და ეკრანის ზომას.
- მე-11 ტურის სათაური პატარა ეკრანზე რუკის მარჯვნივ რჩება და არ იფარება.
- ძველი BETA 1.09 უცვლელადაა შენახული; მექანიკა, 11 ტური და Firebase კვლავ იგივეა.

## BETA 1.09.2 — მტრის ნიშნულები მინი-რუკაზე
- ცოცხალი მტრების მინი-რუკის წერტილები: მკვეთრი წითელი `#ff2a2a`, რადიუსი `4.2` (ადრე `2.5`), მუქი წითელი კონტური `#5a0000`.
- გენერლის ნიშნული, სიმონას პოზიცია, პოზიციის მარცხენა განლაგება გულების ქვემოთ, 11 ტური და სხვა ბალანსი უცვლელია.
