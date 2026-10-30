'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function all(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?all(dir+'/'+e.name):[dir+'/'+e.name]);}
function simulate(file,isDev){
 const storage=new Map(),events=[];
 const api={
  window:{PiraliVisualPreviewReadonly:isDev,PiraliLanguage:{getLanguage:()=> 'ka'}},
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
  document:{body:{append(){}},createElement:()=>({hidden:false,style:{},addEventListener(){}}),addEventListener(){},
   dispatchEvent:e=>events.push(e)},
  CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},
  level:1,running:true,frame:0,path:Array.from({length:25},(_,i)=>({x:150+i*20,y:600-i*10})),
  CHURCH_X:450,CHURCH_Y:400,WW:1600,WH:1900,P:{x:0,y:0,r:14,dead:false},
  enemies:[],genWorld(){},update(){},render(){},killEnemy(){},showBanner(){},
  Math,Date,Number,Set,JSON,console
 };
 const ctx=vm.createContext(api);
 new vm.Script(read(file),{filename:file}).runInContext(ctx);
 const quest=()=>ctx.window.PiraliEvolution139;
 function enter(n){ctx.level=n;ctx.genWorld();return quest().debug().quest;}
 function finish(n){
  const q=enter(n);
  assert.equal(q.done,false,'Fresh mission required on stage '+n);
  if(n===8||n===9){
   const target=quest().objectiveTarget();assert.ok(target);
   const hits=n===9?4:1;
   for(let i=0;i<hits;i++)assert.equal(quest().hitQuestTarget(target,{fp:true,shot144:2000+i}),true);
  }else{
   ctx.P.x=q.x;ctx.P.y=q.y;ctx.update(.1);
  }
  assert.equal(quest().debug().quest.done,true,'Quest must be completed in stage '+n);
 }
 finish(1);
 const original=quest().getProfile();assert.equal(original.found.length,1);
 finish(1);assert.equal(quest().getProfile().found.length,1,'Replay does not duplicate collection');
 for(let i=2;i<=11;i++)finish(i);
 const progress=quest().getProfile();
 assert.equal(progress.found.length,11);
 assert.deepEqual(Array.from(progress.unlocked).sort(),['classic','forest','gold','shadow']);
 assert.equal(events.filter(e=>e.type==='pirali:questcomplete').length,12);
 assert.equal(enter(2).done,false,'Saved second quest is playable next run');
 assert.equal(enter(11).done,false,'Saved final letter is playable next run');
 const copy=JSON.parse(storage.get(isDev?'pirali139_dev_collection':'pirali139_player_collection'));
 assert.equal(copy.found.length,11);
 assert.equal(copy.outfit,'classic');
 const fresh=vm.createContext({...api,window:{PiraliVisualPreviewReadonly:isDev,PiraliLanguage:{getLanguage:()=> 'ka'}},
  document:{...api.document},genWorld(){},update(){},render(){},killEnemy(){}});
 new vm.Script(read(file),{filename:file}).runInContext(fresh);
 assert.equal(fresh.window.PiraliEvolution139.getProfile().found.length,11,'Collection survives reload');
 fresh.level=2;fresh.genWorld();
 assert.equal(fresh.window.PiraliEvolution139.debug().quest.done,false,'Objective survives as repeatable after reload');
}
for(const v of ['play','dev']){
 const prev='beta145-'+v,now='beta146-'+v;
 const old=all(prev).map(p=>p.slice(prev.length+1)).sort(),
   next=all(now).map(p=>p.slice(now.length+1)).sort();
 assert.deepEqual(next,old,'Beta 1.45 game files preserved');
 const changed=['index.html','js/menu.js','TEST_INFO.json','js/features/evolution/game139.js',
  'js/features/evolution/menu139.js','js/progression/player-stats.js',
  'js/characters/topdown-polish.js','js/features/hell/devil.js'];
 if(v==='dev')changed.push('js/preview-controls.js');
 for(const name of old){
  const oldText=read(prev+'/'+name),newText=read(now+'/'+name);
  if(changed.includes(name))assert.notEqual(oldText,newText,'Expected update '+name);
  else assert.equal(oldText,newText,'Preserved game asset '+name);
  if(name.endsWith('.js'))new vm.Script(newText,{filename:now+'/'+name});
 }
 const html=read(now+'/index.html'),game=read(now+'/js/features/evolution/game139.js'),
  visual=read(now+'/js/characters/topdown-polish.js'),
  inferno=read(now+'/js/features/hell/devil.js'),
  stats=read(now+'/js/progression/player-stats.js');
 assert.match(html,new RegExp('1\\.46-classic\\.'+v));
 assert.match(game,/done:false, \/\/ Replay the objective every time/);
 assert.match(game,/drawVillager\(ctx,x,y,run,!goal.done,level===2\)/);
 assert.match(game,/prisoner\?'#d9c48b'/);
 assert.match(game,/pirali:questcomplete/);
 assert.match(stats,/Quests completed/);
 assert.match(stats,/missionLabel\(0\)/);
 assert.match(visual,/1\.46-topdown-visual-refinement/);
 assert.match(inferno,/Devil's horned armour/);
 const meta=JSON.parse(read(now+'/TEST_INFO.json'));
 assert.equal(meta.version,'1.46-beta.1'+(v==='dev'?'-dev':''));
 assert.equal(meta.maxTotalPoints,7000);
 assert.equal(meta.quests146.replayableAll,true);
 assert.equal(meta.androidBuilt,false);
 simulate(now+'/js/features/evolution/game139.js',v==='dev');
}
console.log('PASS PIRALI Beta 1.46: all 11 missions replay while collection persists, stage 2 captive, achievements, artwork, parity, syntax.');
