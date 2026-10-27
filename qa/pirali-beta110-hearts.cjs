'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
for(const role of ['play','dev']){
 const root=path.join(__dirname,'..','beta110-'+role);
 const oldRoot=path.join(__dirname,'..','beta1092-'+role);
 const file=fs.readFileSync(path.join(root,'js/features/endless/waves.js'),'utf8');
 const old=fs.readFileSync(path.join(oldRoot,'js/features/endless/waves.js'),'utf8');
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const metadata=JSON.parse(fs.readFileSync(path.join(root,'RELEASE_INFO.json'),'utf8'));
 assert.match(file,/const HEART_RESTOCK_MULTIPLIER=1\\.15;/);
 assert.match(file,/endlessHealthChance\\*HEART_RESTOCK_MULTIPLIER/);
 assert(!old.includes('HEART_RESTOCK_MULTIPLIER'));
 assert.match(file,/const CAP=10,FINAL_WAVE=5;/);
 assert.match(file,/wasOutsideHouse/);
 assert.equal(metadata.stage11HealingPickupIncreaseRelative,0.15);
 assert(html.includes(role==='play'?'1.10-beta.1':'1.10-beta.1-dev'));
 assert(fs.existsSync(path.join(root,'js/features/map/live-minimap.js')));
 assert(fs.existsSync(path.join(root,'js/features/loot/large-heart.js')));
 if(role==='play')assert(!html.includes('<script src="js/preview-controls.js'));
 else assert(html.includes('<script src="js/preview-controls.js'));
 console.log('PASS BETA 1.10 '+role+' stage-11 healing boost and game invariants');
}
console.log('PASS BETA 1.10 hearts checks');
