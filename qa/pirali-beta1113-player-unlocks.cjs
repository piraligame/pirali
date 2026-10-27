'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');

function makeStore(){
 const values=new Map();
 return {
  getItem:k=>values.has(k)?values.get(k):null,
  setItem:(k,v)=>values.set(k,String(v)),
  removeItem:k=>values.delete(k),
  values
 };
}
function session(source,store,{developer=false,checkpoint=null}={}){
 const win={
  PiraliVisualPreviewReadonly:developer,
  PiraliSeasonReleaseEnabled:false,
  PiraliCheckpoint:{get:()=>checkpoint},
  PiraliLanguage:{getLanguage:()=> 'ka',t:x=>x,translateLevel:n=>'ტური '+n}
 };
 const doc={
  addEventListener(){},
  getElementById(){return null;},
  querySelector(){return null;},
  querySelectorAll(){return [];},
 };
 const ctx={window:win,document:doc,localStorage:store,Number,Math,Date,Object,Array,String,JSON,console};
 vm.runInNewContext(source,ctx,{timeout:3000});
 assert(win.PiraliStats,'Stats API missing');
 return {
  stats:win.PiraliStats,
  setCheckpoint:v=>checkpoint=v,
  selectPlayer:name=>store.setItem('pirali_player_name',name)
 };
}

for(const role of ['play','dev']){
 const root=path.join(__dirname,'..','beta111-'+role);
 const source=fs.readFileSync(path.join(root,'js/progression/player-stats.js'),'utf8');
 const release=JSON.parse(fs.readFileSync(path.join(root,'RELEASE_INFO.json'),'utf8'));
 assert(source.includes('maxReachedStage'),'Persisted field absent');
 assert(source.includes('highestReached,recordReached'),'Stats API not exported');
 assert.equal(release.version,role==='play'?'1.11.3-beta.1':'1.11.3-beta.1-dev');
 const storage=makeStore();storage.setItem('pirali_player_name','simona');
 const game=session(source,storage,{developer:false});
 assert.equal(game.stats.highestReached(),1,'Stage 1 is first stage');
 game.stats.start(false,1);
 assert.equal(game.stats.get().maxReachedStage,1);
 game.stats.stageReady(5);
 assert.equal(game.stats.highestReached(),5,'Reached fifth stage not recorded');
 game.stats.result(false,700);
 assert.equal(game.stats.get().maxReachedStage,5,'Death erased fifth stage');
 const afterDeath=session(source,storage,{developer:false});
 assert.equal(afterDeath.stats.highestReached(),5,'New page load erased fifth stage');
 afterDeath.stats.start(false,1);
 assert.equal(afterDeath.stats.highestReached(),5,'Restart erased fifth stage');
 afterDeath.stats.stageReady(11);
 assert.equal(afterDeath.stats.highestReached(),11,'Reached eleventh stage not recorded');
 afterDeath.stats.result(false,5000);
 assert.equal(session(source,storage,{developer:false}).stats.highestReached(),11,'11-stage discovery not persistent');

 const another=session(source,storage,{developer:false});
 another.selectPlayer('other-player');
 assert.equal(another.stats.highestReached(),1,'Player discoveries leaked to another player name');
 another.stats.start(false,1);
 another.stats.stageReady(3);
 another.stats.result(false,90);
 assert.equal(another.stats.highestReached(),3,'Other player stage 3 missing');
 another.selectPlayer('simona');
 assert.equal(another.stats.highestReached(),11,'Original player progress not restored');

 const dev=session(source,storage,{developer:true});
 assert.equal(dev.stats.highestReached(),11,'Developer must see all 11 without playing');
 dev.stats.start(false,11);
 dev.stats.stageReady(11);
 dev.stats.result(false,0);
 assert(storage.values.has('pirali_personal_stats_beta_1_0_s1_dev_preview'),'Developer profile store missing');
 assert(storage.values.has('pirali_personal_stats_beta_1_0_s1_rc'),'Player profile store missing');
 assert.notEqual(storage.values.get('pirali_personal_stats_beta_1_0_s1_dev_preview'),storage.values.get('pirali_personal_stats_beta_1_0_s1_rc'),'Developer and player stats are not isolated');

 // Older versions recorded completed-stage times, but did not yet store maxReachedStage.
 const oldStorage=makeStore();oldStorage.setItem('pirali_player_name','veteran');
 const legacy={
  runs:2,wins:0,defeats:2,kills:23,bestScore:750,bestRunMs:null,
  stageBestMs:[12000,14000,16000,18000,null,null,null,null,null,null,null],achievements:{}
 };
 oldStorage.setItem('pirali_personal_stats_beta_1_0_s1_rc',JSON.stringify({version:1,profiles:{veteran:legacy}}));
 const veteran=session(source,oldStorage,{developer:false});
 assert.equal(veteran.stats.highestReached(),5,'Older stage-4 completion should unlock fifth stage');
 assert.equal(veteran.stats.get().maxReachedStage,5,'Legacy stage records were not migrated to persistent field');

 // An existing checkpoint also counts and survives its deletion.
 const cpStore=makeStore();cpStore.setItem('pirali_player_name','checkpoint-user');
 const cp=session(source,cpStore,{developer:false,checkpoint:{level:8}});
 assert.equal(cp.stats.highestReached(),8,'Existing checkpoint not considered');
 cp.setCheckpoint(null);
 assert.equal(cp.stats.highestReached(),8,'Clearing checkpoint must not remove map access');

 assert.equal(session(source,makeStore(),{developer:false}).stats.highestReached(),1);
 console.log('PASS Beta 1.11.3 '+role+': stage 5 death, stage 11 persistence, player isolation, dev sandbox, history migration');
}
console.log('PASS BETA 1.11.3 LIFETIME PLAYER PROGRESS');
