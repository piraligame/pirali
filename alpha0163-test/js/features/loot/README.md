# ნივთების საერთო ბალანსი — PIRALI Alpha 0.16.3 DEV

- `drop-balance.js`: **11-ვე ტურში** მოკლული მტრების health 11.7%, Mauser ammo 62.4%, acquired-shotgun shells 31.2%; special Batoni healing drop 90%. აქედან იმართება დროპების საერთო ალბათობები.
- `map-pickups.js`: ყოველი ტურის განლაგებული health ×0.9 და Mauser ammo ×1.2, მთელი რიცხვის დამრგვალებით. `hell-heart` სპეციალური 4500-ქულიანი სიუჟეტის ჯილდოა და უცვლელია.
- დაყენება: `drop-balance.js` იტვირთება ძირითადი საბრძოლო ფაილების **წინ**, ხოლო `map-pickups.js` — ყველა `genWorld` wrapper-ის **შემდეგ**.
- `../combat/shotgun-balance.js`: თოფის საფანტი 1.2 damage, ხუთი pellet, 48-frame cooldown.
- Firebase-ის write-წვდომა DEV-ში გათიშულია.
