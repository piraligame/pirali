# Firebase: ფირალი ბეტა რეიტინგის გამართვა

Firebase project: `pirali-game`; database: `pirali-game-default-rtdb`.

### Preserve old 0.15 live ranking
Existing `/scores` MUST remain untouched, readable and writable by the already published Alpha 0.15 app exactly as it is now.

### New Beta ranking path
New child node: `/pirali_beta_rating`. Player 0.16.5c and subsequent releases will POST there with `season: 'pirali_beta_rating_s1'`. Initially the path may be absent/null. Firebase creates it upon the first authorized write.

1. Firebase Console → Realtime Database → Data: check old `scores`; do not delete it.
2. Realtime Database → Rules: first BACK UP the complete EXISTING rules document.
3. Under the existing `rules` root object, add a child-specific rule for `pirali_beta_rating` only. Preserve ALL previous children and inherited rules.
4. Prefer authenticated create-only writes and schema/size validation. The current web client is unauthenticated, so authenticated-only rules require updating Player with proper Firebase Authentication. Public POST is easily forged and is suitable only for a temporary restricted test, not a public competitive ladder.
5. Publish securely scoped rules, run one real Beta test write, confirm the new `pirali_beta_rating` node contains the score and that old `scores` remains untouched.

**Not done in this conversation:** creating a server-side Firebase node, installing new Firebase Rules, authenticating users, validating server read/write. GitHub is not Firebase admin access; do not claim the database exists until Firebase acknowledges a write.

Official documentation: https://firebase.google.com/docs/database/security
