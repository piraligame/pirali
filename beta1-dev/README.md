# ფირალი / PIRALI — BETA 1.0.1 DEV

Open: https://piraligame.github.io/pirali/beta1-dev/?v=beta101dev

## Features
This is an exact game-asset and gameplay-code copy of the current BETA 1.0.1 PLAYER `/beta1-play/`, except it **adds the optional developer controls** (stages 1–11, invincibility toggle, boss jump), DEV label, and entirely separate local DEV statistics.

- The developer build **never writes** to `/pirali_beta_rating` or legacy `/scores`. Its browser-level fetch wrapper blocks all Firebase PUT/POST/PATCH/DELETE; its leaderboard helper never queries the live Beta ranking and uses independent localStorage keys for developer runs.
- DEV rankings are **strictly local**, and do not read, upload, alter, or mix with the official Firebase TOP 30. Only PLAYER uses cloud rankings. Test runs and badges are never official records.
- Both variants share the same BETA 1.0.1 game engine, stage HP balance, rewards, pink fifth stage, coins and red Nagan badge, 11 stages, and story + bonus score caps 5,000 + 500.
- Local DEV stats key `pirali_personal_stats_beta_1_0_s1_dev` and checkpoint `pirali_checkpoint_beta_1_0_s1_dev`. Saved nickname and language are unchanged and shared on the same GitHub Pages origin.
- The regular `/beta1-play/` release is untouched. Alpha 0.15 `/scores` remains untouched.
- This is a browser development test only; no APK/AAB/Play Store upload.

Please check stage selection, HP/damage, score limits and Firebase being read-only in DEV, as well as ordinary Player online score persistence in the regular link.
