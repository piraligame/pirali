// PIRALI game balancing, decoupled from Firebase and artwork.
const PIRALI_BALANCE=Object.freeze({
  playerIFrameMs:900,        // used to be 1800ms
  finalEnemyMultiplier:0.5,  // half the number of level 5 enemies
  finalBaseEnemyHp:2,        // was 3
  finalBossHp:9,             // was 18
  finalBossRageHp:3,         // rage threshold was 7
  finalBossSpeed:0.5,        // movement speed halved
  finalBossFireInterval:2,  // double cooldown => fire rate halved
  finalBossVolley:0.5,      // fewer projectiles
  finalBossChargeSpeed:0.5,
  finalBossReinforcements:1, // was 2
  landlordHp:1,             // one hit to win
  landlordFleeSpeed:0.16    // used to be 0.32
});
