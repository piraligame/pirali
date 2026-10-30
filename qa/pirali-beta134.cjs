'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function files(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(dir+'/'+x.name):[dir+'/'+x.name]);}
const changed=new Set(['index.html','js/menu.js','TEST_INFO.json','js/main.js','js/runtime/render.js','js/characters/motion-alpha012.js','js/features/polish/feedback.js']);
for(const v of ['play','dev']){
 const old='beta133-'+v,now='beta134-'+v;
 const a=files(old).map(p=>p.slice(old.length+1)).sort(),b=files(now).map(p=>p.slice(now.length+1)).sort();
 assert.deepEqual(b,[...a,'js/features/polish/beta134-experience.js','css/beta134-experience.css'].sort(),'All old assets retained');
 for(const file of a){
  const before=read(old+'/'+file),after=read(now+'/'+file);
  if(changed.has(file)||(v==='dev'&&file==='js/preview-controls.js'))assert.notEqual(before,after,'Updated '+file);
  else assert.equal(before,after,'Unchanged '+file);
  if(file.endsWith('.js'))new vm.Script(after,{filename:now+'/'+file});
 }
 const h=read(now+'/index.html'),info=JSON.parse(read(now+'/TEST_INFO.json'));
 assert.ok(h.includes('1.34-classic.'+v));assert.ok(h.includes('BETA 1.34'));
 assert.equal(info.features134.length,5);
 assert.equal(info.premiumFullRoute.pointsMultiplier,.2);
 assert.equal(info.premiumFullRoute.startingHearts,7);
 assert.equal(info.premiumFullRoute.shellDropsAllStagesIfOwned,true);
 assert.equal(info.mobileControlsPreserved,true);
 assert.equal(info.androidBuilt,false);assert.equal(info.aabBuilt,false);
 assert.match(h,/js\/features\/polish\/beta134-experience\.js\?v=134/);
 assert.match(h,/css\/beta134-experience\.css\?v=134/);
 const experience=read(now+'/js/features/polish/beta134-experience.js');
 new vm.Script(experience);assert.match(experience,/playGunshot/);assert.match(experience,/shotgun/);
 assert.match(experience,/playSword/);assert.match(experience,/playHit/);
 assert.match(experience,/pirali134-victory-summary/);
 const context={window:{PiraliDevComparison:v==='dev'?{latestEnabled:()=>false}:undefined},Math,document:{addEventListener(){}}};
 vm.runInNewContext(experience,context);
 assert.equal(context.window.PiraliBeta134.enabled(),v!=='dev');
 assert.equal(context.window.PiraliBeta134.maxCombo(),0);
 assert.match(read(now+'/js/runtime/render.js'),/health===1&&window\.PiraliBeta134/);
 assert.match(read(now+'/js/characters/motion-alpha012.js'),/refinedSimona/);
 assert.match(read(now+'/js/features/polish/feedback.js'),/pirali134-stage-win/);
 for(const p of ['js/runtime/combat.js','js/runtime/update.js','js/runtime/game-init.js',
  'js/config/alpha-gear-v2.js','js/features/scoring/stage-awards.js','js/features/scoring/kill-combos.js',
  'js/runtime/leaderboard.js','js/progression/player-stats.js','js/features/full-path/demo.js',
  'js/platform/desktop-controls.js','css/player-stats.css','css/style.css']){
  assert.equal(read(now+'/'+p),read(old+'/'+p),'Gameplay immutable '+p);
 }
 if(v==='dev'){
  const preview=read(now+'/js/preview-controls.js');
  assert.match(preview,/Beta 1\.34 გაუმჯობესებები/);
  assert.match(preview,/dockBelowMap/);assert.match(preview,/latestEnabled:\(\)=>newestEnabled/);
  assert.match(preview,/enabled:\(\)=>true/);
  assert.match(h,/js\/preview-controls\.js\?v=beta134-map-dock/);
 }else{
  assert.equal(info.developerComparison,null);
  assert.ok(!h.includes('js/preview-controls.js'));
 }
}
console.log('PASS Beta 1.34: SFX, movement visuals, critical HP, victory panel and minimap-docked Developer tools');
