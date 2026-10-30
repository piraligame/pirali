'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function files(d){return fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(d+'/'+x.name):[d+'/'+x.name]);}
for(const v of ['play','dev']){
 const old='beta141-'+v,now='beta142-'+v;
 const original=files(old).map(x=>x.slice(old.length+1)).sort(),current=files(now).map(x=>x.slice(now.length+1)).sort();
 assert.deepEqual(current,[...original,'css/outcome142.css','js/features/results/outcome142.js'].sort(),'No lost baseline files');
 const modified=new Set(['index.html','js/menu.js','TEST_INFO.json']);
 if(v==='dev')modified.add('js/preview-controls.js');
 for(const p of original){
  const a=read(old+'/'+p),b=read(now+'/'+p);
  if(modified.has(p))assert.notEqual(a,b,'Planned version/meta update '+p);
  else assert.equal(a,b,'Unchanged gameplay and baseline asset '+p);
  if(p.endsWith('.js'))new vm.Script(b,{filename:now+'/'+p});
 }
 const info=JSON.parse(read(now+'/TEST_INFO.json')),html=read(now+'/index.html'),
  js=read(now+'/js/features/results/outcome142.js'),css=read(now+'/css/outcome142.css');
 new vm.Script(js,{filename:now+'/js/features/results/outcome142.js'});
 assert.ok(html.includes('1.42-classic.'+v));
 assert.ok(html.includes('css/outcome142.css?v=142-compact-result'));
 assert.ok(html.includes('js/features/results/outcome142.js?v=142-fit-no-scroll'));
 assert.equal(info.features142.length,4);assert.equal(info.outcome142.gameplayChanged,false);
 assert.equal(info.evolution140.sneakRemoved,true);
 assert.equal(info.evolution139.rankedPointsChanged,false);
 assert.equal(info.premiumFullRoute.pointsMultiplier,.2);
 assert.equal(info.premiumFullRoute.startingHearts,7);
 assert.equal(info.premiumFullRoute.shellDropsAllStagesIfOwned,true);
 assert.equal(info.mobileControlsPreserved,true);assert.equal(info.androidBuilt,false);assert.equal(info.aabBuilt,false);
 assert.match(js,/originalOver=showGameOver,originalWin=showVictory/);
 assert.match(js,/MutationObserver/);assert.match(js,/requestAnimationFrame\(fit\)/);
 assert.match(js,/document\.addEventListener\('pirali:languagechange'/);
 assert.match(js,/addEventListener\('orientationchange'/);
 assert.match(js,/card\.style\.zoom/);
 assert.match(js,/actions\.appendChild\(button\)/);
 assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/background-position:0% 18%!important/);
 assert.match(css,/overflow:hidden!important/);
 assert.doesNotMatch(css,/display:flex!important;flex-direction:column!important/,'Leaderboard can hide outcome screen');
 assert.match(css,/\.pirali-georgia-flag/);
 if(v==='dev')assert.match(read(now+'/js/preview-controls.js'),/PIRALI BETA 1\.42 DEV/);
 else assert.equal(info.developerComparison,null);
}
console.log('PASS Beta 1.42: no-scroll outcomes, full original controls and score/joystick unchanged');
