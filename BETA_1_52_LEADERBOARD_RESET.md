# PIRALI Beta 1.52 leaderboard reset / Firebase deployment

New beta rating path: /pirali_release_152_rating
New season id: pirali_release_152_s1
Record keys: beta152-<timestamp>-<random>
Maximum score: 7000
Old beta rating path: /pirali_beta_rating (archive, DO NOT DELETE)
Legacy Alpha 0.15 path: /scores (DO NOT TOUCH)

The Player APK/AAB and public Player web build write to the new path.
The Developer/Tester web build is read-only against Firebase, and writes only to a distinct local preview cache.
Firebase database rules must be deployed and verified before publishing the Player build.
This is a new leaderboard, not an irreversible deletion of old data.
Public append-only writes suit controlled testing only; production needs authentication and score verification.
