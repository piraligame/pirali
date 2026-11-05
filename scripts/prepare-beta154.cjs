'use strict';
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const fresh='/pirali_release_154_rating', season='pirali_release_154_s1';
for(const kind of ['play','dev']){
 const prev=path.join(root,'beta152-'+kind),dest=path.join(root,'beta154-'+kind);
 if(fs.existsSync(dest))throw Error('Refuse to overwrite already generated Beta 1.54 '+dest);
 fs.cpSync(prev,dest,{recursive:true,errorOnExist:true});
 function modify(name,fn){
  const file=path.join(dest,name);
  const old=fs.readFileSync(file,'utf8');
  const now=fn(old);
  assert.notEqual(now,old,'Unchanged '+file);
  fs.writeFileSync(file,now);
 }
 for(const file of ['index.html','js/menu.js','js/runtime/leaderboard.js',...(kind==='dev'?['js/preview-controls.js']:[])]){
  modify(file,s=>{
   s=s.replaceAll('1.52','1.54').replaceAll('beta152-','beta154-');
   s=s.replaceAll('pirali_release_152_rating','pirali_release_154_rating');
   s=s.replaceAll('pirali_release_152_s1','pirali_release_154_s1');
   s=s.replaceAll('pirali_lb_release_152_s1','pirali_lb_release_154_s1');
   return s;
  });
 }
 for(const name of ['RELEASE_INFO.json','TEST_INFO.json']){
  modify(name,s=>{
   const obj=JSON.parse(s.replace(/^\uFEFF/,''));
   obj.version='1.54-beta.1'+(kind==='dev'?'-dev':'');
   obj.season=season;
   obj.firebasePath=fresh;
   obj.leaderboardPath=fresh;
   obj.firebaseTransport='PUT '+fresh+'/<runId>.json';
   obj.androidVersionCode=23;
   obj.androidBuilt=false;
   obj.aabBuilt=false;
   obj.playerWriteEnabled=kind==='play';
   obj.firebaseWritesBlocked=kind==='dev';
   obj.leaderboardResetMode='Fresh empty Beta 1.54 Firebase season, no old scores migrated';
   obj.releaseReady=false;
   obj.qa='Beta 1.54 new release numbering and clean leaderboards';
   obj.note='Firebase Beta 1.54 maximum score validated to 7000; other seasons retained';
   obj.notes='New Beta 1.54 isolated season; no old scores migrate, online Player saves allowed, Developer writes disabled.';
   if(typeof obj.displayVersion==='string') obj.displayVersion=kind==='dev'?'BETA 1.54 DEVELOPER':'BETA 1.54 PLAYER';
   return JSON.stringify(obj,null,2)+'\n';
  });
 }
 const html=fs.readFileSync(path.join(dest,'index.html'),'utf8');
 assert.ok(html.includes("window.PiraliGameVersion='1.54-classic."+kind+"'"));
 assert.ok(html.includes('pirali_release_154_rating')||kind==='dev');
 assert.ok(html.includes('window.PiraliSeasonReleaseEnabled='+(kind==='play'?'true;':'false;')));
 const board=fs.readFileSync(path.join(dest,'js/runtime/leaderboard.js'),'utf8');
 for(const token of [fresh,season,"gameVersion:'1.54-beta.1'",'beta154-']) assert.ok(board.includes(token),token);
}
fs.writeFileSync(path.join(root,'BETA_1_54_RELEASE_NOTES.md'),[
 '# PIRALI Beta 1.54 — corrected sequential release','',
 'Player: beta154-play / Developer: beta154-dev',
 'Android package: ge.piraligame.pirali',
 'VersionName: 1.54; VersionCode: 23',
 'New empty Firebase leaderboard path: /pirali_release_154_rating',
 'New season: pirali_release_154_s1',
 'Max score: 7000; TOP 30',
 'Older /scores, /pirali_beta_rating, /pirali_release_152_rating paths preserved.',
 'Android Player writes to new Firebase season. Developer is read-only.',
 'Do not upload prior Beta 1.52 v21 or v22 files.',
 'Native build is a separate step that must use the existing Alpha upload-signing key.',''
].join('\n'));
console.log('Prepared Beta 1.54 Player and Developer without modifying Beta 1.52.');
