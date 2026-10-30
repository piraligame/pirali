# PIRALI / ფირალი — final public update: leaderboard starts at zero

**Status:** APPROVED RELEASE REQUIREMENT — NOT EXECUTED. Never reset or delete current tester records during Beta 1.50 testing. Do not publish or enable Firebase writes automatically.

## Decision (2026-10-30)
The next **public app update** must launch with a fresh empty online TOP-30 leaderboard. Existing testing/beta scores must not appear in the new public ranking. Old score data must be preserved for rollback/reference rather than destructively zeroed.

## Prepare before release
1. Freeze the gameplay candidate and finish closed testing, Android/device QA, and Play Console approval.
2. Back up existing RTDB rules and export the current `/pirali_beta_rating` leaderboard. Leave legacy `/scores` and previous test seasons unchanged.
3. Allocate a **new and empty** Firebase RTDB namespace for the official season (proposed `/pirali_public_s1_rating`) and unique season ID (proposed `pirali_public_s1_2026`). Do not reuse `/pirali_beta_rating` or its local-storage cache/queued retry keys.
4. In the **release build only**, update leaderboard reads/writes, per-season local cache and pending score queue, season filtering, record identifiers and write allowlist together. No old Beta leaderboard rows may migrate into the official season. Preserve campaign checkpoints, personal statistics, player identity and unlocked stages: only online rating is restarted.
5. Prepare and independently review Firebase rules for this new path, including valid run IDs, score range **1–7000**, level range **1–11**, season ID, and protection against overwrites. Previous test rules documented in `beta150-play/FIREBASE_RULES_SETUP.md` allow scores up to **5500**, not 7000. For production use authenticated, server-validated score writes instead of trusting arbitrary unauthenticated client scores.
6. With release writes still disabled, verify the new Firebase path is empty; TOP 30 shows an empty-state message and personal rank has no result. Ensure zero beta records appear on devices with old local caches and on clean installs.
7. Test one legitimate score submission and reading in a **separate staging season**, plus duplicate-name handling, rank outside TOP 30, retries, Firebase failure/offline behavior, four language labels and 7000-point maximum. Do not seed the public production namespace with a test record.
8. Produce signed Player-only Android App Bundle with the existing authorized upload key and the next unused versionCode. Do not package Developer controls or use the unsigned web bundle as an AAB.
9. **Launch together:** verified release build, approved production rules, fresh empty public season, and Play Console update. Keep `window.PiraliSeasonReleaseEnabled=false` until all gates pass. Do not turn live writes on in preview or Developer builds.
10. After rollout, verify: empty leaderboard initially, genuine new users can submit scores, first real scorer appears, top-30 sorted correctly, historical Beta scores stay isolated, and rollback preserves old data.

## Strict constraints
- **Do not delete, overwrite, or reset** `/pirali_beta_rating`, `/scores`, or the user's local progress as a shortcut.
- **Do not silently reset current testers now.** The official reset is tied to the *final Play Store release*, not a Beta web preview.
- **Do not claim the app is released** until Google Play and Firebase production state have been verified.
- The final update should show a clearly new season, with **zero preexisting leaderboard entries**. The first score should come from a real player after launch.
