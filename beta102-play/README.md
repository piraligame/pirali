# PIRALI BETA 1.02 — PLAYER
Link: https://piraligame.github.io/pirali/beta102-play/?v=beta102

- Uses the existing **online** Firebase `/pirali_beta_rating`, season `pirali_beta_1_0_s1`. Old BETA 1.0/1.01 and new BETA 1.02 share actual Beta ranking; Alpha 0.15 /scores untouched.
- At game over, waits for the current Firebase score submission before calculating the player's position using EVERY Beta record. Deduplicates names and uses each player's BEST score. Displays exact rank even when outside TOP 30. The standalone TOP 30 overlay remains limited to 30.
- Lower redundant "Firebase saved" status is removed after successful persistence. Failed submissions still show an error and manual retry; no false online rank if save has failed and no previously confirmed score exists.
- Same 11 levels and gameplay tuning; no APK/AAB has been built or deployed.
