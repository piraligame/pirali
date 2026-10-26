# PIRALI / ფირალი — Beta 1.0

Web game: https://piraligame.github.io/pirali/beta1-play/?v=beta1001

Beta 1.0 is a separate 11-stage player build cloned from Alpha 0.16.5c, NOT an update to the Alpha 0.15 app currently on Google Play. Main-game story 1–10 cap 5000, stage-11 bonus up to +500, overall 5500; stage 9 siege 20, stage 11 max 20 enemies, fifth stage pink, Devil coins +250, red Nagan milestone.

New ranking UI: **ფირალი ბეტა რეიტინგი TOP 30**. Firebase Realtime Database node: `/pirali_beta_rating` (existing project `pirali-game`); only records with new Beta 1.0 season `pirali_beta_1_0_s1` count. Each fresh run starts at stage 1 with 0 points. New Beta local stats, achievements, checkpoints, cache and pending retry records use different localStorage keys; player's saved name and language remain.

The new Player attempts Firebase REST POST only to its designated Beta path for finished non-checkpoint runs; green confirmation only on a valid server receipt, otherwise an explicit error and local retry queue. Live Firebase rules/admin access remain **UNVERIFIED**, so cloud saving might fail until server permissions are configured. GitHub code cannot create the Firebase node/rules on its own. See FIREBASE_RULES_SETUP.md.

Alpha 0.15 continues using `/scores` exactly as before, with its data and on-store APK/AAB untouched. Old Alpha 0.16.5c and DEV folders also remain as-is. No Beta Android package or Play Store rollout is included.
