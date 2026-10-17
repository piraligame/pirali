/* This switch exists ONLY on the beta branch, never in stable Alpha.
 * Keep beta tester activity out of the public Firebase leaderboard.
 */
window.PIRALI_BETA=Object.freeze({
  active:true,
  version:'0.10',
  channel:'web-preview',
  leaderboardReadOnly:true
});
