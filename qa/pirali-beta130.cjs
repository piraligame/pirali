'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function files(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(dir+'/'+x.name):[dir+'/'+x.name]);}
for(const variant of ['play','dev']){
 const old='beta129-'+variant,now='beta130-'+variant;
 const a=files(old).map(x=>x.slice(old.length+1)).sort(),b=files(now).map(x=>x.slice(now.length+1)).sort();
 const logo='assets/icons/ggg-community.webp';
 assert.ok(b.includes(logo),'Community badge exists');
 assert.deepEqual(a,b.filter(f=>f!==logo),'All previous resources preserved '+variant);
 assert.ok(fs.statSync(path.join(root,now,logo)).size>1000,'Real badge graphic saved');
 const changed=new Set(['index.html','TEST_INFO.json','js/menu.js','js/runtime/outcome.js','js/features/full-path/demo.js','css/beta129-full-path.css']);
 for(const f of a){
  if(!changed.has(f))assert.equal(read(old+'/'+f),read(now+'/'+f),'Unrequested edit '+f);
  if(f.endsWith('.js'))new vm.Script(read(now+'/'+f),{filename:now+'/'+f});
 }
 const html=read(now+'/index.html'),menu=read(now+'/js/menu.js'),demo=read(now+'/js/features/full-path/demo.js'),outcome=read(now+'/js/runtime/outcome.js');
 assert.match(html,/1\.30-classic\./);
 assert.match(menu,/PIRALI • BETA 1\.30/);
 assert.ok(menu.includes('function ensureCommunity(actions)'),'Core menu always mounts community');
 assert.ok(menu.includes('communityObserver.observe(actions,{childList:true})'),'Core menu tracks Full Route insertion');
 assert.ok(menu.includes('https://www.facebook.com/share/1LfEa8WSfU/'),'Core menu uses requested Facebook URL');
 assert.ok(html.includes('js/menu.js?v=beta130-ggg-core2'),'New core menu URL invalidates cache');
 assert.ok(demo.includes('actions.insertBefore(community,records)'),'Community comes before leaderboard');
 assert.ok(demo.includes('actions.insertBefore(community,full.nextSibling)'),'Community comes after full route');
 assert.match(demo,/გეიმერების საზოგადოება/,'Georgian label');
 assert.ok(demo.includes('https://www.facebook.com/share/1LfEa8WSfU/'),'Correct community URL');
 assert.match(demo,/PiraliStats\?\.get/);
 assert.match(demo,/stageBestMs\[9\]/);
 assert.match(demo,/maxReachedStage>=11/);
 assert.doesNotMatch(demo,/₾|0\.50|0,50|Billing|demoUnlock|activateDemo|localStorage/,'No paid or bypass unlock UI');
 assert.match(outcome,/if\(!window\.PiraliFullPath\?\.isActive\?\.\(\)\)window\.PiraliCheckpoint\?\.clear\(\)/);
 assert.equal(read(now+'/js/features/scoring/stage-awards.js'),read(old+'/js/features/scoring/stage-awards.js'),'Half scoring preserved');
 assert.equal(read(now+'/js/runtime/game-init.js'),read(old+'/js/runtime/game-init.js'),'7 hearts and shotgun preserved');
 assert.equal(html.includes('window.PiraliAlpha014Test=true'),variant==='dev');
 assert.equal(html.includes('window.PiraliSeasonReleaseEnabled=false'),true);
 const info=JSON.parse(read(now+'/TEST_INFO.json'));assert.equal(info.premiumFullRoute.paymentEnabled,false);
 assert.equal(info.premiumFullRoute.pointsMultiplier,0.5);assert.equal(info.premiumFullRoute.startingHearts,7);
 assert.equal(info.androidBuilt,false);assert.equal(info.aabBuilt,false);
 // Test unlock function without a real browser: a Developer preview's
 // highestReached()==11 bypass must not unlock an unfinished profile.
 let profile={runs:0,wins:0,defeats:0,kills:0,bestScore:0,bestRunMs:null,stageBestMs:Array(11).fill(null),achievements:{},maxReachedStage:1};
 let selected=null;
 const doc={getElementById:()=>null,querySelector:()=>null,addEventListener:()=>{},body:{classList:{add(){},remove(){},toggle(){}}}};
 const win={PiraliVisualPreviewReadonly:variant==='dev',PiraliStats:{get:()=>profile,highestReached:()=>11},PiraliCheckpoint:{get:()=>null},PiraliStoryMap:{stops:[]}};
 const context={window:win,document:doc,MutationObserver:class{},requestAnimationFrame:()=>{},startGame:()=>{selected=win.PiraliFullPath.consumeStart();}};
 vm.runInNewContext(demo,context);
 assert.equal(win.PiraliFullPath.unlocked(),false,'Initially locked even on Developer');
 assert.equal(win.PiraliFullPath.chooseStage(8),false,'Locked stage selection rejected');
 profile={...profile,maxReachedStage:11};
 assert.equal(win.PiraliFullPath.unlocked(),true,'Stage 11 reached');
 assert.equal(win.PiraliFullPath.chooseStage(8),true);
 assert.equal(selected.stage,8);assert.equal(selected.health,7);assert.equal(selected.shotgun,true);
 win.PiraliFullPath.clearActive();
 assert.equal(win.PiraliFullPath.isActive(),false);
 profile={...profile,maxReachedStage:1,stageBestMs:Array(11).fill(null)};
 profile.stageBestMs[9]=45000;
 assert.equal(win.PiraliFullPath.unlocked(),true,'Migrated completed 10th stage');
}
console.log('PASS Beta 1.30: correct stage10->11 unlock, menu order, no price/demo activation, shotgun/7 hearts/half score, normal checkpoints, Player/Dev role isolation');
