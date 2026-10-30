'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function files(d){return fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(d+'/'+x.name):[d+'/'+x.name]);}
for(const v of ['play','dev']){
 const old='beta140-'+v,now='beta141-'+v;
 const previous=files(old).map(x=>x.slice(old.length+1)).sort(),current=files(now).map(x=>x.slice(now.length+1)).sort();
 assert.deepEqual(current,[...previous,'css/objective141.css','js/features/hud/objective141.js'].sort());
 const changed=new Set(['index.html','js/features/evolution/game139.js','js/menu.js','TEST_INFO.json']);
 if(v==='dev')changed.add('js/preview-controls.js');
 for(const file of previous){
   const a=read(old+'/'+file),b=read(now+'/'+file);
   if(changed.has(file))assert.notEqual(a,b,'Modified only as planned: '+file);
   else assert.equal(a,b,'Previous mechanic and artwork unchanged: '+file);
   if(file.endsWith('.js'))new vm.Script(b,{filename:now+'/'+file});
 }
 const index=read(now+'/index.html'),hud=read(now+'/js/features/hud/objective141.js'),
  css=read(now+'/css/objective141.css'),game=read(now+'/js/features/evolution/game139.js'),
  data=JSON.parse(read(now+'/TEST_INFO.json'));
 new vm.Script(hud);
 assert.ok(index.includes('1.41-classic.'+v));
 for(const asset of ['css/objective141.css?v=141-separate-hud','js/features/hud/objective141.js?v=141-dynamic-layout'])assert.ok(index.includes(asset));
 assert.match(hud,/hearts\.getBoundingClientRect/);
 assert.match(hud,/map\.getBoundingClientRect/);
 assert.match(hud,/hud\.getBoundingClientRect/);
 assert.match(hud,/actual\.bottom\+5/);
 assert.match(hud,/ResizeObserver/);
 assert.match(hud,/pirali:languagechange/);
 assert.match(css,/body\.pirali141-quest-hud #pirali-mini-map/);
 assert.match(css,/top:var\(--pirali141-map-top\)!important/);
 assert.match(css,/body\.pirali141-quest-hud #pirali139-hud/);
 assert.match(game,/window\.PiraliQuestHud141\?\.request/);
 assert.equal(data.features141.length,4);
 assert.equal(data.objectiveHud141.scoringChanged,false);
 assert.equal(data.premiumFullRoute.pointsMultiplier,.2);
 assert.equal(data.premiumFullRoute.startingHearts,7);
 assert.equal(data.premiumFullRoute.shellDropsAllStagesIfOwned,true);
 assert.equal(data.evolution140.sneakRemoved,true);
 assert.equal(data.evolution139.rankedPointsChanged,false);
 assert.equal(data.mobileControlsPreserved,true);
 assert.equal(data.androidBuilt,false);assert.equal(data.aabBuilt,false);
 if(v==='dev')assert.match(read(now+'/js/preview-controls.js'),/PIRALI BETA 1\.41 DEV/);
 else assert.equal(data.developerComparison,null);
}
console.log('PASS Beta 1.41: mission between heart panel and map; all previous features preserved');
