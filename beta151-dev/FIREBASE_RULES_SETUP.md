# PIRALI BETA 1.0.1 — Firebase Rules

The user owns the Firebase project `pirali-game`. Preserve Alpha 0.15 under `/scores` unchanged. Beta uses `/pirali_beta_rating`.

### Reason for earlier 401/403
Old Beta 1.0 sent POST to the *parent* `/pirali_beta_rating.json`, but Firebase grants `.write` to child `$record`. Parent POST is not authorized by a deeper child write rule. **Beta 1.0.1** instead PUTs directly to `/pirali_beta_rating/beta10-...json`.

### Firebase Rules to merge (for temporary testing only)
Do NOT delete or alter existing `scores`. The following FULL rules example matches the previously observed legacy public rule in the Firebase Console. Verify it still matches the current rule before publishing. Preserve any other children you have since added.

```json
{
  "rules": {
    "scores": {
      ".read": true,
      ".write": true,
      ".indexOn": ["score"]
    },
    "pirali_beta_rating": {
      ".read": true,
      ".indexOn": ["score"],
      "$record": {
        ".write": "!data.exists() && newData.exists()",
        ".validate": "newData.hasChildren(['name','score','level','season','gameVersion','win','churchCleared','hellCleared','naganCleared','kills','endlessKills','durationMs','runId','ts']) && newData.child('season').val() === 'pirali_beta_1_0_s1' && newData.child('runId').val() === $record",
        "name": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 20" },
        "score": { ".validate": "newData.isNumber() && newData.val() > 0 && newData.val() <= 5500" },
        "level": { ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 11" },
        "season": { ".validate": "newData.val() === 'pirali_beta_1_0_s1'" },
        "gameVersion": { ".validate": "newData.isString() && newData.val().length <= 30" },
        "win": { ".validate": "newData.isBoolean()" },
        "churchCleared": { ".validate": "newData.isBoolean()" },
        "hellCleared": { ".validate": "newData.isBoolean()" },
        "naganCleared": { ".validate": "newData.isBoolean()" },
        "kills": { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 100000" },
        "endlessKills": { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 100000" },
        "durationMs": { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 86400000" },
        "runId": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 90" },
        "ts": { ".validate": "newData.isNumber() && newData.val() > 0 && newData.val() <= now + 300000" },
        "$other": { ".validate": false }
      }
    }
  }
}
```

These **unauthenticated append-only rules** are suitable only for short controlled tests: a malicious client can still forge scores and spam new entries. For production, add Firebase Authentication plus server-trusted score verification, and allow only authenticated writes. Avoid root `.write:true`. Back up existing rules before changes, and confirm Alpha 0.15 read/write stays active. This guide does not deploy anything to Firebase.
