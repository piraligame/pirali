## BETA 1.10 — HD map verification (2026-10-27)
- Approved 1024×1536-pixel campaign map now replaces the 5 KB image in both Player and Developer at `assets/maps/pirali-approved.webp` (775,170 bytes).
- Cached map UI script, styles and image all use the `beta110-hd-20261027` cache key.
- The existing 11 tours, level names, translations and in-game mini-map are unchanged.
- CI regression check: `node qa/pirali-beta110-hd-map.cjs`.

# PIRALI BETA 1.09.2 PLAY

- All eleven stages: enemies and generals weakened by an additional **10% HP and attack/movement rates**, on top of BETA 1.06 tuning.
- Eleventh stage: each of the five waves contains **10** total opponents, no landlord; wave 4 includes 1 General, wave 5 includes 2 Generals (inside the 10).
- All levels: **+10%** relative enemy Mauser ammo, hunting-shotgun shell and healing-heart drop chances; also +10% relative Mauser and heart placed item rates, subject to integer rounding; extra stage-11 periodic ammunition restocks.
- Preserved previous 1.06 features: stage-six roadside cover, sight-based AI pursuit, instant exits, stage 11 Gurian home entrance win, Georgian flag and crown, 300+300+400+400+600=2000 final bonus and 5000+2000=7000 total cap.
- DEV not enabled; PLAYER keeps the same Beta Firebase rating path.
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
