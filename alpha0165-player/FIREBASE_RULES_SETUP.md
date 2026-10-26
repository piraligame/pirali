# PIRALI Firebase – NEW season-only rules (TEMPORARY testing reference)

**IMPORTANT: Not deployed. This file is only a proposed rule fragment.** GitHub Pages does not deploy Firebase Security Rules. Existing Firebase administrator access is required. The exact live rules are unknown. Do not replace the entire rules document with the content below.

Go to Firebase Console → Project `pirali-game` → Realtime Database → Rules. **Backup the full existing rules** first. Add ONLY the `scores_11stage_s1_5k_2026` child inside the CURRENT `rules` object, keeping all other paths (especially legacy `scores`) exactly as-is.

```json
{
  "scores_11stage_s1_5k_2026": {
    ".read": true,
    "$scoreId": {
      ".write": "!data.exists() && newData.exists()",
      ".validate": "newData.hasChildren(['name','score','level','season','gameVersion','win','churchCleared','hellCleared','naganCleared','kills','endlessKills','durationMs','runId','ts'])",
      "name": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 20" },
      "score": { ".validate": "newData.isNumber() && newData.val() > 0 && newData.val() <= 5500" },
      "level": { ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 11" },
      "season": { ".validate": "newData.isString() && newData.val() === '11stage_s1_5k_2026'" },
      "gameVersion": { ".validate": "newData.isString() && newData.val().length <= 20" },
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
```

This snippet is an **unauthenticated, append-only testing workaround**, not production-grade security. It grants public create-only writes for the new season; any outside person can forge 1–5500 scores and generate database usage. It should only be used temporarily for controlled testing, and then replaced with **Firebase Authentication/App Check plus server-side trusted score validation and abuse protection** before wide release. Validated fields are not proof of genuine gameplay. Do not ever set root `.write: true` to fix this problem.

If Firebase blocks writing, the Player 0.16.5b page will display the exact Firebase HTTP response (401/403 permission, 404 URL, 400 validation or network problem). Offline results remain queued under the same localStorage key and can be sent using the Retry button after rules are corrected, *on the same device/browser*. The old 5-stage `/scores` data will not be deleted.

For long-term production, an authorized Firebase admin connection is required to inspect existing rules, enable scoped anonymous/player sign-in or a server-issued token, deploy secure rules and confirm with real successful writes.

Firebase docs: https://firebase.google.com/docs/database/security and https://firebase.google.com/docs/reference/security/database
