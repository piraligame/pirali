'use strict';
// PIRALI Beta 1.48 — reproducible Android WEB ASSET PREPARATION, not a signed APK/AAB.
// The only permitted app source is beta148-play; never package DEV preview controls.
// Signing must happen on the authorized local machine using the existing upload key.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const source=path.join(root,'beta148-play');
const dest=path.join(root,'dist','android-web');
const marker=path.join(dest,'.pirali-generated-bundle');
const expectedVersion="window.PiraliGameVersion='1.48-classic.play'";
if(!fs.existsSync(path.join(source,'index.html')))throw Error('Beta 1.48 player sources are absent.');
const html=fs.readFileSync(path.join(source,'index.html'),'utf8');
if(!html.includes(expectedVersion)||!html.includes('window.PiraliVisualPreviewReadonly=false;'))
 throw Error('Wrong Player source or version.');
if(!html.includes('window.PiraliSeasonReleaseEnabled=false;'))
 throw Error('Safety mismatch: online leaderboard go-live must be validated separately.');
if(fs.existsSync(dest)){
 if(!fs.existsSync(marker))throw Error('Refusing to overwrite a non-generated Android assets directory');
 fs.rmSync(dest,{recursive:true,force:true});
}
fs.mkdirSync(dest,{recursive:true});
const copied=[];
function copy(rel){
 if(!rel||path.isAbsolute(rel)||rel.includes('..')||rel.includes(':')||rel.includes('\\'))
  throw Error('Unsafe bundle path '+rel);
 const src=path.resolve(source,rel),dst=path.resolve(dest,rel);
 if(!src.startsWith(source+path.sep)||!dst.startsWith(dest+path.sep))throw Error('Unsafe path '+rel);
 if(!fs.existsSync(src)||!fs.statSync(src).isFile())throw Error('Missing source '+rel);
 fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(src,dst);
 if(!fs.readFileSync(src).equals(fs.readFileSync(dst)))throw Error('Byte mismatch '+rel);
 copied.push(rel);
}
for(const item of ['index.html','manifest.json','RELEASE_INFO.json','privacy.html']){
 if(fs.existsSync(path.join(source,item)))copy(item);
 else if(item==='index.html'||item==='manifest.json')throw Error('Required file missing: '+item);
}
for(const dir of ['assets','css','js','data','firebase']){
 const start=path.join(source,dir);if(!fs.existsSync(start))continue;
 function walk(folder){
  for(const e of fs.readdirSync(folder,{withFileTypes:true})){
   const full=path.join(folder,e.name);
   if(e.isSymbolicLink())throw Error('Unexpected symlink '+full);
   if(e.isDirectory())walk(full);
   else if(e.isFile()&&!e.name.startsWith('.')){
    const rel=path.relative(source,full).replace(/\\/g,'/');
    if(rel==='js/preview-controls.js')throw Error('Developer controls accidentally included');
    copy(rel);
   }
  }
 }
 walk(start);
}
const refs=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi),
 ...html.matchAll(/<link\b[^>]*\bhref="([^"]+)"/gi)]
 .map(m=>m[1].split('?')[0])
 .filter(s=>s&&!/^(?:https?:|data:)/i.test(s));
for(const rel of refs){
 if(rel.startsWith('/')||rel.includes('..')||!fs.existsSync(path.join(dest,rel)))
  throw Error('Missing HTML reference '+rel);
}
const manifest=JSON.parse(fs.readFileSync(path.join(dest,'manifest.json'),'utf8'));
for(const icon of manifest.icons||[])
 if(!fs.existsSync(path.join(dest,icon.src)))throw Error('App icon missing: '+icon.src);
if(fs.existsSync(path.join(dest,'js/preview-controls.js')))throw Error('Developer script in package');
fs.writeFileSync(marker,'PIRALI Beta 1.48 local-generated unsigned web bundle.\n');
const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(dest,'index.html'))).digest('hex');
const info={ok:true,version:'1.48',source:'beta148-play',files:copied.length,
 appId:'ge.piraligame.pirali',proposedVersionCode:21,existingSignedVersionCode:20,
 signed:false,aabBuilt:false,readyForGooglePlay:false,
 htmlSha256:hash,
 requirements:['Check next unused Play Console versionCode',
 'Verify Firebase online rating rules before activating online writes',
 'Use existing local Alpha upload keystore to sign AAB',
 'Validate signed AAB with jarsigner then upload on authorized Play Console']};
fs.writeFileSync(path.join(dest,'BUILD_INFO.json'),JSON.stringify(info,null,2)+'\n');
console.log(JSON.stringify(info,null,2));
