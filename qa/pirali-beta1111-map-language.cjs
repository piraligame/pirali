'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');

for(const role of ['play','dev']){
 const root=path.join(__dirname,'..','beta111-'+role);
 const map=fs.readFileSync(path.join(root,'js/features/map/story-map.js'),'utf8');
 const css=fs.readFileSync(path.join(root,'css/story-map.css'),'utf8');
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const i18n=fs.readFileSync(path.join(root,'js/i18n.js'),'utf8');
 const release=JSON.parse(fs.readFileSync(path.join(root,'RELEASE_INFO.json'),'utf8'));

 assert(!map.includes('data-map-lang'),'Extra language picker must be absent');
 assert(!map.includes('story-map-languages'),'Extra language picker HTML must be absent');
 assert(!map.includes('setLanguage?.('),'Map must not change global language');
 assert(!css.includes('.story-map-languages'),'Removed language picker CSS still present');
 assert(map.includes("const getLang=()=>window.PiraliLanguage?.getLanguage?.()||'ka'"),'Map must read game language');
 assert(map.includes("document.addEventListener('pirali:languagechange',render)"),'Map must refresh on global language changes');
 assert(map.includes("getLevelName?.(n)"),'Map stage labels must follow game translations');
 for(const lang of ['ka','en','ru','zh'])assert(map.includes(lang+':{'),'Translation missing: '+lang);
 assert(i18n.includes("new CustomEvent('pirali:languagechange'"),'Global language event absent');
 assert(html.includes('css/story-map.css?v=beta1112-stage-journal'),'CSS browser cache key absent');
 assert(html.includes('js/features/map/story-map.js?v=beta1113-persistent-unlocks'),'JS browser cache key absent');
 assert.equal(release.mapOwnLanguagePicker,false);
 assert.equal(release.version,role==='play'?'1.11.3-beta.1':'1.11.3-beta.1-dev');
 assert(html.includes("window.PiraliGameVersion='"+release.version+"'"));
 assert(fs.statSync(path.join(root,'assets/maps/pirali-approved.webp')).size>700000,'Approved HD map changed');
 assert(fs.existsSync(path.join(root,'js/features/map/live-minimap.js')),'In-game mini-map changed');
 if(role==='play')assert(!html.includes('<script src="js/preview-controls.js'),'DEV controls leaked');
 else assert(html.includes('<script src="js/preview-controls.js'),'DEV controls absent');
 console.log('PASS BETA 1.11.2 '+role+': unified language, no map picker, translated 11-stage HD map intact');
}
console.log('PASS BETA 1.11.2 language synchronization');
