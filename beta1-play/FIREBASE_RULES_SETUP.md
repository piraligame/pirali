# PIRALI Beta 1.0 Firebase configuration

Firebase project: `pirali-game`; instance `pirali-game-default-rtdb`.

**DO NOT CHANGE:** live Alpha 0.15 leaderboard `/scores`, its current Security Rules, records or access.

**NEW:** Beta 1.0 logical leaderboard node `/pirali_beta_rating`, only season ID `pirali_beta_1_0_s1`; top 30 and earned score maximum 5,500.

Firebase Console → Realtime Database → Data/Rules: (1) back up the existing database and full existing Rules document, (2) add *only* a child-scoped `pirali_beta_rating` rule under existing root `rules`, preserving all other child and parent rules, (3) prefer authenticated create-only writes and schema validation, never enable root `.write:true`, (4) confirm first successful Beta REST POST and that its record appears under `pirali_beta_rating`, (5) check `/scores` still works for Alpha 0.15.

The current browser client has no user authentication token; secure auth-only Rules will reject REST POST until Firebase Authentication (or a trusted backend) is implemented. Unauthenticated public write access makes a public leaderboard vulnerable to fake scores, so should not be enabled as a permanent fix. If a record cannot be saved, Beta stores it in its own on-device queue and displays the error.

**Not completed:** live Firebase admin connection, actual creation of the server node, rules deployment, successful live write, Android APK/AAB.
