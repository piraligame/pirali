'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const get=p=>fs.readFileSync(path.join(root,p),'utf8');
const g=get('android/app/build.gradle');
assert.match(g,/applicationId "ge\.piraligame\.pirali"/);
assert.match(g,/versionCode 19/);
assert.match(g,/versionName "1\.13"/);
assert(g.includes("PIRALI_ALPHA_KEYSTORE_PATH"),'Existing keystore config removed');
assert(g.includes("PIRALI_ALPHA_STORE_PASSWORD"),'Signing secret input missing');
assert(!g.includes("storePassword '"),'Hardcoded signing password found');
const cfg=JSON.parse(get('capacitor.config.json'));
assert.equal(cfg.appId,'ge.piraligame.pirali');
assert.equal(cfg.webDir,'dist/android-web');
const builder=get('scripts/build-android-beta113.cjs');
assert(builder.includes("beta113-play"),'Android is not built from Beta 1.13 PLAYER');
assert(builder.includes("PiraliVisualPreviewReadonly=false"),'Player flag missing');
assert(!builder.includes("beta113-dev"),'Dev game must not ship to Play');
const signing=get('scripts/build-beta113-signed.ps1');
assert(signing.includes('PIRALI-ALPHA-UPLOAD-KEY.p12'),'Old signing identity not reused');
assert(signing.includes("versionCode 19"),'Signing script version verification missing');
assert(signing.includes('ALPHA_015_SIGNER_MATCH=YES'),'APK signer cross-check missing');
for(const role of ['play','dev']){
 const html=get('beta113-'+role+'/index.html');
 const info=JSON.parse(get('beta113-'+role+'/RELEASE_INFO.json'));
 assert.equal(info.version,role==='play'?'1.13.0-beta.1':'1.13.0-beta.1-dev');
 assert.equal(info.androidApplicationId,'ge.piraligame.pirali');
 assert.equal(info.androidVersionCode,19);
 assert(html.includes("window.PiraliGameVersion='"+info.version+"'"));
 if(role==='play'){
  assert(html.includes('window.PiraliSeasonReleaseEnabled=true;'));
  assert(html.includes('window.PiraliVisualPreviewReadonly=false;'));
  assert(!html.includes('<script src="js/preview-controls.js'));
 }else assert(html.includes('<script src="js/preview-controls.js'));
 assert(fs.statSync(path.join(root,'beta113-'+role+'/assets/maps/pirali-approved.webp')).size>700000);
 assert(get('beta113-'+role+'/js/features/map/story-map.js').includes('ხელმიუწვდომელია — სიმონა ჯერ არ არის აქ ნამყოფი!'));
 assert(get('beta113-'+role+'/js/platform/desktop-controls.js').includes("physical=e.code"));
}
const bundled=path.join(root,'dist/android-web');
if(fs.existsSync(path.join(bundled,'BUILD_INFO.json'))){
 const build=JSON.parse(fs.readFileSync(path.join(bundled,'BUILD_INFO.json'),'utf8'));
 assert.equal(build.versionCode,19);assert.equal(build.source,'beta113-play/');
 assert(get('dist/android-web/index.html').includes("window.PiraliGameVersion='1.13.0-beta.1'"));
 assert(fs.existsSync(path.join(bundled,'assets/maps/pirali-approved.webp')));
 assert(fs.existsSync(path.join(bundled,'assets/video/intro-local.mp4')));
 assert(!fs.existsSync(path.join(bundled,'js/preview-controls.js')));
}
console.log('PASS PIRALI 1.13: app ID, versionCode, production source, signed build key, privacy and Android bundle');
