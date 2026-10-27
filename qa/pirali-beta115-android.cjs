'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const get=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sha=rel=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex').toUpperCase();
assert.match(get('android/app/build.gradle'),/applicationId "ge\.piraligame\.pirali"/);
assert.match(get('android/app/build.gradle'),/versionCode 20/);
assert.match(get('android/app/build.gradle'),/versionName "1\.15"/);
const capacitor=JSON.parse(get('capacitor.config.json'));
assert.equal(capacitor.appId,'ge.piraligame.pirali');
assert.equal(capacitor.webDir,'dist/android-web');
const packageInfo=JSON.parse(get('package.json'));
assert.equal(packageInfo.scripts['build:android-beta115'],'node scripts/build-android-beta115.cjs');
const builder=get('scripts/build-android-beta115.cjs');
assert(builder.includes('beta115-play')&&!builder.includes('beta115-dev'));
assert(builder.includes("window.PiraliGameVersion='1.15.0-beta.1'"));
assert(builder.includes('js/preview-controls.js'));
const html=get('beta115-play/index.html');
assert(html.includes("window.PiraliGameVersion='1.15.0-beta.1'"));
assert(html.includes('window.PiraliVisualPreviewReadonly=false'));
assert(!html.includes('<script src="js/preview-controls.js'));
assert(html.includes('js/features/loot/laurel-shield.js?v=1.15.0'));
assert(get('beta115-play/js/runtime/combat.js').includes('inventory.laurelShield===1'));
assert(get('beta115-play/js/progression/checkpoints.js').includes('laurelShield:inventory.laurelShield===1?1:0'));
const meta=JSON.parse(get('beta115-play/RELEASE_INFO.json'));
assert.equal(meta.version,'1.15.0-beta.1');
assert.equal(meta.androidVersionCode,20);
const signed=JSON.parse(get('downloads/beta115/PIRALI_Beta_1.15_RELEASE_INFO.json'));
assert.equal(signed.versionCode,20);assert.equal(signed.versionName,'1.15');
assert.equal(signed.appId,'ge.piraligame.pirali');
assert.equal(signed.source,'beta115-play');
assert.equal(signed.signedWithExistingKeystore,true);
assert.equal(signed.alpha015ApkCertificateMatches,true);
assert.equal(signed.alpha015AabUploadCertificateMatches,true);
assert.equal(signed.beta113AabUploadCertificateMatches,true);
for(const [file,field] of [
 ['downloads/beta115/PIRALI_Beta_1.15_Signed_Update.apk','apkSha256'],
 ['downloads/beta115/PIRALI_Beta_1.15_Play_Upload.aab','aabSha256']
]){
 const full=path.join(root,file);
 assert(fs.statSync(full).size>5_000_000,'Unexpected tiny release artifact');
 assert.equal(sha(file),signed[field].toUpperCase(),'Release checksum mismatch: '+file);
 console.log('PASS signed '+file+' sha256='+signed[field]);
}
const tmp=path.join(root,'dist/android-web/BUILD_INFO.json');
if(fs.existsSync(tmp)){
 const build=JSON.parse(fs.readFileSync(tmp,'utf8'));
 assert.equal(build.source,'beta115-play/');
 assert.equal(build.versionCode,20);
 assert.equal(build.version,'1.15.0-beta.1');
 assert(fs.existsSync(path.join(root,'dist/android-web/js/features/loot/laurel-shield.js')));
 assert(!fs.existsSync(path.join(root,'dist/android-web/js/preview-controls.js')));
}
console.log('PASS PIRALI Beta 1.15: signed APK + AAB SHA256, Alpha 0.15 package upgrade, web game source, safe DEV isolation');
