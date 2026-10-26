# ხმლის cooldown

`sword-cooldown.js` განსაზღვრავს ხელახლა მოქნევის დროს.

| ტიპი | Alpha 0.16.1-მდე | ახალი 0.16.1 DEV |
|---|---:|---:|
| ჩვეულებრივი მოქნევა | 27.2 კადრი | 21.76 კადრი |
| კომბო | 19.2 კადრი | 15.36 კადრი |

კოდში: `normalFrames: 34`, `comboFrames: 24`, `previousMultiplier: 0.8`, `currentMultiplier: 0.8`.
ორივე მოქნევის cooldown წინა მდგომარეობასთან შედარებით კიდევ 20%-ით შემცირდა. ქნევის ანიმაციის სიგრძე და ზიანი არ შეცვლილა.

`../../runtime/combat.js` იყენებს `window.PiraliSwordCooldown.forCombo(isCombo)`-ს.
