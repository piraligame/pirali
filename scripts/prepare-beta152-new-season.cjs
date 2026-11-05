'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const OLD='/pirali_beta_rating', NEXT='/pirali_release_152_rating';
const OLD_SEASON='pirali_beta_1_0_s1', NEW_SEASON='pirali_release_152_s1';
function edit(rel,fn){
 const file=path.join(root,rel), a=fs.readFileSync(file,'utf8'), b=fn(a);
 // Re-runs are idempotent after an interrupted staged preparation.
 fs.writeFileSync(file,b);
}
function replace(s,a,b){if(!s.includes(a)){assert.ok(s.includes(b),'Neither old nor new text found: '+a);return s;}return s.replaceAll(a,b)}
for (const kind of ['play','dev']){
 const prefix='beta152-'+kind+'/';
 edit(prefix+'js/runtime/leaderboard.js',s=>{
  s=replace(s,OLD,NEXT);
  s=replace(s,OLD_SEASON,NEW_SEASON);
  s=replace(s,'pirali_lb_beta_1_0_s1','pirali_lb_release_152_s1');
  s=replace(s,"gameVersion:'1.07-beta.1'","gameVersion:'1.52-beta.1'");
  s=replace(s,"'beta10-'","'beta152-'");
  s=replace(s,'/^beta10-[a-z0-9]+-[a-z0-9]{8,12}$/','/^beta152-[a-z0-9]+-[a-z0-9]{8,12}$/');
  const label=/const SEASON_LABEL=[^\n]+;/;
  assert.ok(label.test(s),'Season label not found');
  s=s.replace(label,"const SEASON_LABEL='PIRALI BETA 1.52 • TOP 30';");
  return s;
 });
 if(kind==='play')edit(prefix+'index.html',s=>{
  if(kind==='play'){
   s=replace(s,'window.PiraliSeasonReleaseEnabled=false; // Beta 1.16 joystick preview: local results only',
               'window.PiraliSeasonReleaseEnabled=true; // Beta 1.52 new season live-score writes enabled');
  }
  s=replace(s,OLD+'/',NEXT+'/');
  s=replace(s,'/^beta10-[a-z0-9]+-[a-z0-9]{8,12}$/','/^beta152-[a-z0-9]+-[a-z0-9]{8,12}$/');
  return s;
 });
 for(const file of ['RELEASE_INFO.json','TEST_INFO.json']){
  edit(prefix+file,s=>{
   const obj=JSON.parse(s);
   obj.season=NEW_SEASON;
   obj.firebasePath=NEXT;obj.leaderboardPath=NEXT;
   obj.firebaseTransport='PUT '+NEXT+'/<runId>.json';
   obj.firebaseWritesBlocked=kind==='dev';
   obj.firebaseGoLiveFlag='window.PiraliSeasonReleaseEnabled';
   obj.firebaseLegacyMigration='NOT REQUIRED: old scores retained untouched';
   obj.leaderboardResetMode='new empty Firebase season; old leaderboard preserved';
   obj.currentScoreLimit=7000;
   obj.playerWriteEnabled=kind==='play';
   if(kind==='play'){
     obj.notes='New empty Beta 1.52 rating season, fresh cache, Firebase online writes enabled; separate 7000-cap append-only rules required.';
   }
   return JSON.stringify(obj,null,2)+'\n';
  });
 }
}
fs.writeFileSync(path.join(root,'BETA_1_52_LEADERBOARD_RESET.md'),[
 '# PIRALI Beta 1.52 leaderboard reset / Firebase deployment','',
 'New beta rating path: /pirali_release_152_rating',
 'New season id: pirali_release_152_s1',
 'Record keys: beta152-<timestamp>-<random>',
 'Maximum score: 7000',
 'Old beta rating path: /pirali_beta_rating (archive, DO NOT DELETE)',
 'Legacy Alpha 0.15 path: /scores (DO NOT TOUCH)','',
 'The Player APK/AAB and public Player web build write to the new path.',
 'The Developer/Tester web build is read-only against Firebase, and writes only to a distinct local preview cache.',
 'Firebase database rules must be deployed and verified before publishing the Player build.',
 'This is a new leaderboard, not an irreversible deletion of old data.',
 'Public append-only writes suit controlled testing only; production needs authentication and score verification.',''
].join('\n'));
console.log('Beta 1.52 new leaderboard prepared locally; no Firebase mutations from this script.');
