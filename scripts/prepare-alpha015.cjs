'use strict';
/* Release candidate: isolate approved 0.14.2 into 0.15, preserve all previous channels. */
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
function write(p,value){fs.writeFileSync(path.join(root,p),value,'utf8')}
function exact(source,needle,replacement,label){
  const count=source.split(needle).length-1;
  if(count<1)throw new Error('Missing expected '+label+': '+needle);
  return source.split(needle).join(replacement);
}
for(const channel of ['play','test']){
  const from=path.join(root,'alpha0142-'+channel);
  const dest=path.join(root,'alpha015-'+channel);
  if(fs.existsSync(dest))throw Error('Refusing to overwrite '+dest);
  fs.cpSync(from,dest,{recursive:true});
  for(const file of ['index.html','js/menu.js','manifest.json']){
    const p='alpha015-'+channel+'/'+file;
    const current=read(p);
    if(file==='js/menu.js'&&!current.includes('0.14.2'))throw Error('Missing version in menu');
    write(p,current.replaceAll('0.14.2','0.15'));
  }
  // Fix Android back: close privacy policy before pausing the game / offering exit.
  const mobile='alpha015-'+channel+'/js/platform/mobile-lifecycle.js';
  write(mobile,exact(read(mobile),
    '  function handleBack(){',
    "  function handleBack(){\n    const privacy=el('pirali-privacy-overlay');\n    if(privacy){privacy.remove();return 'close-privacy';}",
    'privacy overlay back navigation'));
  const html='alpha015-'+channel+'/index.html';
  write(html,read(html).replace(/mobile-lifecycle\\.js\\?v=[^"]+/,'mobile-lifecycle.js?v=alpha015-privacyback')
                     .replace(/menu\\.js\\?v=[^"]+/,'menu.js?v=alpha015-release'));
  const manifest='alpha015-'+channel+'/manifest.json';
  let m=JSON.parse(read(manifest));
  m.name='PIRALI';
  m.short_name='PIRALI';
  m.description='Story-driven Georgian top-down action game with five stages, sword, Mauser and hunting shotgun.';
  write(manifest,JSON.stringify(m,null,2)+'\n');
  const rel='alpha015-'+channel+'/RELEASE_INFO.json';
  write(rel,JSON.stringify({version:'0.15',versionCode:18,channel,base:'approved Alpha 0.14.2',fixes:['Android privacy dialog closes correctly with Back','Google Play-ready PIRALI app branding','Gameplay and Firebase unchanged']},null,2)+'\n');
}
const gradle='android/app/build.gradle';
let g=exact(read(gradle),'versionCode 17','versionCode 18',gradle);
g=exact(g,'versionName "0.14.2"','versionName "0.15"',gradle);
write(gradle,g);
const strings='android/app/src/main/res/values/strings.xml';
let s=read(strings);
s=exact(s,'<string name="app_name">PIRALI Alpha Test</string>','<string name="app_name">PIRALI</string>',strings);
s=exact(s,'<string name="title_activity_main">PIRALI Alpha Test</string>','<string name="title_activity_main">PIRALI</string>',strings);
write(strings,s);
const cap='capacitor.config.json';
let c=JSON.parse(read(cap));c.appName='PIRALI';write(cap,JSON.stringify(c,null,2)+'\n');
// Base bundling and signature verification on the successful 0.14.2 process.
let web=read('scripts/build-alpha0142-player-web.cjs');
web=web.replaceAll('alpha0142','alpha015').replaceAll('0.14.2','0.15').replaceAll('ALPHA014','ALPHA015');
write('scripts/build-alpha015-player-web.cjs',web);
let ps=read('scripts/build-alpha0142-final.ps1');
ps=ps.replaceAll('alpha0142','alpha015').replaceAll('0.14.2','0.15').replaceAll('0\\.14\\.2','0\\.15');
ps=ps.replaceAll('\\s+17','\\s+18').replaceAll('versionCode=17','versionCode=18').replaceAll("'17'","'18'");
ps=ps.replaceAll('0.15/17','0.15/18').replaceAll("versionCode='17'","versionCode='18'");
write('scripts/build-alpha015-final.ps1',ps);
let verify=read('scripts/verify-alpha0142-release.cjs');
verify=verify.replaceAll('0.14.2','0.15').replaceAll('versionCode:17','versionCode:18');
write('scripts/verify-alpha015-release.cjs',verify);
for(const f of ['qa-alpha0142-combat.cjs','qa-alpha0142-world.cjs']){
  let script=read('scripts/'+f);
  script=script.replaceAll('alpha0142','alpha015').replaceAll('0.14.2','0.15').replaceAll('0142','015');
  script=script.replaceAll("includes('0.14')","includes('0.15')");
  script=script.replace('port=9753','port=9763').replace('port=9752','port=9762');
  write('scripts/'+f.replace('0142','015'),script);
}
const p=read('alpha015-play/index.html'),t=read('alpha015-test/index.html');
if(p.includes('preview-controls.js')||!t.includes('preview-controls.js'))throw Error('Player and developer channels mixed');
if(!read('alpha015-play/js/menu.js').includes('ALPHA TEST 0.15'))throw Error('Wrong menu version');
console.log('ALPHA_015_PREPARED: separate play and developer channels, versionCode 18, native PIRALI, privacy Back fix, old channels untouched');
