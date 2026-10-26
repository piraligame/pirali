# ფირალი 0.16.5c — ბეტა რეიტინგი

Player GitHub: https://piraligame.github.io/pirali/alpha0165-player/?v=0165c-beta

## Two active independent leaderboard namespaces

**Google Play Alpha 0.15** continues using the **existing** `/scores` Firebase path. Its files, public APK/AAB, current Firebase data, scores and live access permissions are completely unchanged.

**GitHub Player 0.16.5c and later Beta** uses the new path `/pirali_beta_rating` (display title: **ფირალი ბეტა რეიტინგი**). `season: 'pirali_beta_rating_s1'`.

The previous isolated 0.16.5 experimental path `/scores_11stage_s1_5k_2026` remains untouched but is no longer queried from this Beta Player. Its queued entries are not migrated automatically.

New Beta season has independent local cache, personal-best statistics, checkpoints and pending-write queue. Players start first tour with 0 points; their name and language are kept. TOP 30 is based on unique normalized names, up to 5,000 story points +500 bonus (total cap 5,500). The UI accepts the new Beta season records only. DEV test records and old Alpha 0.15 results do not count.

Beta Player attempts POST of earned runs to `/pirali_beta_rating.json`, with season ID, player name, score, level, kills, duration and achievement badges. Server acknowledgment is mandatory for a green 'Firebase saved' message. If permission is denied, the player's score stays in a separate on-device Beta retry queue.

**SERVER STATUS – NOT YET CREATED OR VERIFIED:** There is no connected Firebase administration tool in this chat. GitHub changes alone cannot deploy Firebase security rules or create an initially empty Firebase node. The node is materialized by the FIRST PERMITTED Firebase write. Follow `FIREBASE_RULES_SETUP.md` for exact safe admin steps; do not erase or overwrite the `/scores` data.

Public Google Play APK/AAB has not been changed.
