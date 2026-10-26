# სანადირო თოფის დაზიანება, 0.16.3i

`shotgun-balance.js`: ხუთი საფანტი, თითო `1.2` HP; გასროლებს შორის `48` კადრი. იგივე 5/48 * 1.2 არის +20% საბაზო DPS ძველთან შედარებით.

`js/config/alpha-gear-v2.js` ადგენს საფანტის `damage` ველს, `js/runtime/update.js` ამ ველს აწვდის `hitEnemy`-ს და `hitBoss`-ს, ხოლო `js/features/stages/08-dual-generals.js` — მეორე გენერალს.

**ხმლის მოქნევა და კომბო უცვლელია — Alpha 0.15.**
