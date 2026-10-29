# PIRALI 0.16.2 DEV — Stage 8 & 9

- `08-dual-generals.js`: stage 8 two generals, 11 HP each; ~80% of soldiers are sword units. Second boss AI, drawing, Mauser/sword/bullet hits are reusable methods called from `js/runtime/`; both bosses must die before stage exit.
- `09-siege.js`: stage 9 precisely 30 riflemen around Simona, staggered shooting and plentiful collectible ammo/health. All must fall before the next stage.
- `flow.js`: one centralized wrapper for `genWorld()` calling both unique stage setups. This prevents multiple independent wrappers or confusing state.

CORE STAGE ROUTING: `../../runtime/update.js`. Neither stage writes to Firebase.

**0.16.3g:** მეცხრე ტურში 20 გაფანტული მსროლელია, სიცოცხლე და ammo გამრავლებულია. მეოთხე ტურის ფონი ოქროსფერია, მეცხრე — სტაფილოსფერი.

## 0.16.3h
- `09-siege-balance.js`: 24 ჯარისკაცი, რადიუსი 345–485, მხოლოდ ამ ტურის ჯარისკაცის HP ×0.9.
- `09-heart-scatter.js`: ყველა მიწაზე დაყრილი გული 15%-ით ნაკლებია და ცალ-ცალკე ნაწილდება, ხეების/ჯარისკაცების ადგილებისგან მოშორებით.
