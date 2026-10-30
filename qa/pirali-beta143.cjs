'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function files(d){return fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(d+'/'+x.name):[d+'/'+x.name]);}
for(const variant of ['play','dev']){
 const prior='beta142-'+variant,now='beta143-'+variant;
 const previous=files(prior).map(x=>x.slice(prior.length+1)).sort(),current=files(now).map(x=>x.slice(now.length+1)).sort();
 assert.deepEqual(current,[...previous,'css/ui143.css'].sort(),'No feature or asset lost');
 const modified=new Set(['index.html','js/menu.js','js/features/evolution/menu139.js','js/features/results/outcome142.js','TEST_INFO.json']);
 if(variant==='dev')modified.add('js/preview-controls.js');
 for(const file of previous){
  const a=read(prior+'/'+file),b=read(now+'/'+file);
  if(modified.has(file))assert.notEqual(b,a,'Expected UI update '+file);
  else assert.equal(b,a,'Preserve every older file '+file);
  if(file.endsWith('.js'))new vm.Script(b,{filename:now+'/'+file});
 }
 const html=read(now+'/index.html'),css=read(now+'/css/ui143.css'),menu=read(now+'/js/features/evolution/menu139.js'),
  result=read(now+'/js/features/results/outcome142.js'),meta=JSON.parse(read(now+'/TEST_INFO.json'));
 assert.ok(html.includes('1.43-classic.'+variant));
 assert.ok(html.includes('css/ui143.css?v=143-expanded-menu-raised-results'));
 assert.ok(html.includes('js/features/evolution/menu139.js?v=143-expanded-menu'));
 assert.ok(html.includes('js/features/results/outcome142.js?v=143-raised-fit'));
 assert.match(menu,/screen\.classList\.add\('pirali139-compact','pirali143-menu'\)/);
 assert.match(menu,/viewport-height-bottomReserve/);
 assert.match(result,/pirali142-outcome','pirali143-result/);
 assert.match(result,/--pirali143-bottom-space/);
 assert.match(result,/viewport>=690\?Math\.min\(116/);
 assert.match(css,/\.menu-story-lore p/);
 assert.match(css,/min-height:34px!important/);
 assert.match(css,/min-height:29px!important/);
 assert.match(css,/--pirali143-bottom-space/);
 assert.equal(meta.features143.length,4);
 assert.equal(meta.ui143.gameplayChanged,false);
 assert.equal(meta.outcome142.gameplayChanged,false);
 assert.equal(meta.evolution140.sneakRemoved,true);
 assert.equal(meta.evolution139.rankedPointsChanged,false);
 assert.equal(meta.premiumFullRoute.pointsMultiplier,.2);
 assert.equal(meta.premiumFullRoute.startingHearts,7);
 assert.equal(meta.premiumFullRoute.shellDropsAllStagesIfOwned,true);
 assert.equal(meta.mobileControlsPreserved,true);
 assert.equal(meta.androidBuilt,false);assert.equal(meta.aabBuilt,false);
 if(variant==='dev')assert.match(read(now+'/js/preview-controls.js'),/PIRALI BETA 1\.43 DEV/);
 else assert.equal(meta.developerComparison,null);
}
console.log('PASS Beta 1.43: raised outcome, expanded no-scroll menu, readable four-language story; gameplay intact');
