'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const file=(role,rel)=>fs.readFileSync(path.join(ROOT,'beta115-'+role,rel),'utf8');
const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function damageTest(combat){
 const a=combat.indexOf('function takeDmg(){'),b=combat.indexOf('\nfunction spawnPart(',a);
 assert(a>=0&&b>a,'Could not locate takeDmg');
 const code=combat.slice(a,b);
 const timer=[],calls={ui:0,block:0,reset:0,hurt:0,fx:0};
 const ctx={inventory:{laurelShield:1},health:3,invincible:false,dashing:false,P:{dead:false,x:35,y:50},
  PIRALI_BALANCE:{playerIFrameMs:450},window:{PiraliLaurel:{onBlock(){calls.block++}},PiraliKillCombo:{reset(){calls.reset++}}},
  updateInventoryUI(){calls.ui++},updateHealthUI(){calls.ui++},playHurt(){calls.hurt++},
  PiraliFX:{hurt(){calls.fx++}},shakePow:0,killStreak:4,score:123,swordCD:0,
  document:{getElementById:()=>({style:{}})},
  setTimeout:fn=>timer.push(fn),showGameOver(){throw Error('Shield should not trigger game over');}
 };
 vm.runInNewContext(code,ctx,{timeout:5000});
 ctx.takeDmg();
 assert.equal(ctx.health,3,'Laurel must block HP loss');
 assert.equal(ctx.inventory.laurelShield,0,'One hit must consume shield');
 assert.equal(calls.block,1,'Block VFX missing');
 assert.equal(ctx.invincible,true,'Brief immunity missing (single volley could double-hit)');
 assert.equal(calls.hurt,0,'Blocked hits must not play normal hurt sound');
 ctx.takeDmg();assert.equal(ctx.health,3,'Overlapping hit ignored during i-frame');
 assert.equal(timer.length,1);
 timer.shift()();
 assert.equal(ctx.invincible,false);
 ctx.takeDmg();
 assert.equal(ctx.health,2,'Second hit must remove HP after shield was spent');
 assert.equal(calls.hurt,1,'Subsequent normal hit must remain functional');
 ctx.invincible=true;ctx.inventory.laurelShield=1;ctx.takeDmg();
 assert.equal(ctx.inventory.laurelShield,1,'Invincible frames must not consume charge');
 ctx.invincible=false;ctx.dashing=true;ctx.takeDmg();
 assert.equal(ctx.inventory.laurelShield,1,'Dash invulnerability must not consume charge');
 ctx.dashing=false;ctx.P.dead=true;ctx.takeDmg();
 assert.equal(ctx.inventory.laurelShield,1,'Dead player cannot consume shield');
 return calls;
}
function checkpointTest(src){
 const store=new Map();
 let savedAt=Date.now();
 const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 const ctx={window:{PiraliVisualPreviewReadonly:false,PiraliSeasonReleaseEnabled:true,
   PiraliBigHearts:{status:()=>({seven:false,ten:false})},PiraliStageScoring:{endlessBaseline:()=>0}},
  document:{addEventListener(){},getElementById(){return null},querySelector(){return null}},
  localStorage,health:4,maxHealth:5,ammo:6,score:48,
  inventory:{herbs:7,medals:3,laurelShield:1},Date,JSON,Math,Number,console};
 vm.runInNewContext(src,ctx,{timeout:5000});
 const api=ctx.window.PiraliCheckpoint;
 assert(api&&api.save(2),'Could not save checkpoint with laurel');
 assert.equal(api.get().inventory.laurelShield,1,'Shield absent from checkpoint');
 const saved=JSON.parse([...store.values()][0]);
 assert.equal(saved.inventory.laurelShield,1);
 const historical={...saved,inventory:{herbs:27,medals:3}};
 assert.equal(api.normalize(historical).inventory.laurelShield,0,'Old save must not invent shield');
 assert.equal(api.normalize({...saved,inventory:{...saved.inventory,laurelShield:2}}),null,'Reject invalid stacks');
 const newer={...saved,level:3,inventory:{...saved.inventory,laurelShield:1},savedAt:savedAt+1000};
 assert.equal(api.normalize(newer).inventory.laurelShield,1,'Saved shield lost on next stage');
 const restored=api.normalize(newer);
 assert.equal(restored.inventory.laurelShield,1,'Restored shield incorrect');
 ctx.inventory.laurelShield=0;
 assert.equal(api.save(3),true);
 assert.equal(api.get().inventory.laurelShield,0,'Consumed shield must remain consumed at future checkpoint');
 return true;
}
function pickupTest(src){
 assert(src.includes("else if(pk.type==='herb'){inventory.laurelShield=1;updateInventoryUI();window.PiraliLaurel?.onCollect(pk);}"),'Leaves are not converted to one-hit ward');
 assert(!src.includes("else if(pk.type==='herb'){const beforeHealth=health"),'Old herb healing path still exists');
 assert(!src.includes('inventory.herbs++;updateInventoryUI()'),'Old herb collectible still counts as heal');
 const stage=src.indexOf('window.PiraliCheckpoint?.save(level)');
 assert(stage>=0,'Level transition must continue saving checkpoint');
 return true;
}
function tutorialTest(src){
 assert.equal((src.match(/tutorialTitle:/g)||[]).length,4);
 assert.equal((src.match(/tutorial:'/g)||[]).length,4);
 assert(src.includes("tutorial.hidden=n!==1"),'Tutorial should display in Chokhatauri only');
 assert(src.includes("story-map-details-tutorial-text"),'Tutorial HTML element missing');
 for(const localized of ['დაფნის გვირგვინი','laurel wreath','Лавровый венок','月桂花环'])assert(src.includes(localized),'Missing localized shield guidance '+localized);
 assert(src.includes('სიმონა ჯერ არ არის აქ ნამყოფი!'),'Locked stage warning broken');
 assert(src.includes("if(!developer()&&n>discovered())"),'Map locking missing');
}
for(const role of ['play','dev']){
 const html=file(role,'index.html'),rel=JSON.parse(file(role,'RELEASE_INFO.json'));
 const wanted=role==='play'?'1.15.0-beta.1':'1.15.0-beta.1-dev';
 assert.equal(rel.version,wanted);
 assert(html.includes("window.PiraliGameVersion='"+wanted+"'"));
 assert(html.includes('js/features/loot/laurel-shield.js?v=1.15.0'));
 assert(html.includes('css/laurel-shield.css?v=1.15.0'));
 assert.equal(rel.laurelShield.maxCharges,1);
 assert.equal(rel.laurelShield.restoresHealth,false);
 assert.equal(rel.androidBuilt,role==='play','Only Beta 1.15 Player can be packaged as the signed Android release');
 if(role==='play')assert(!html.includes('<script src="js/preview-controls.js'),'DEV controls leaked to Player');
 else assert(html.includes('<script src="js/preview-controls.js'),'Dev tools missing');
 const code=file(role,'js/runtime/combat.js');
 damageTest(code);
 checkpointTest(file(role,'js/progression/checkpoints.js'));
 pickupTest(file(role,'js/runtime/update.js'));
 tutorialTest(file(role,'js/features/map/story-map.js'));
 const start=file(role,'js/runtime/game-init.js');
 assert(start.includes('inventory.laurelShield=restore?.inventory?.laurelShield===1?1:0;'),'Session restore missing');
 assert(start.includes('invincible=false;dashing=false;dashT=0;dashCD=0;'),'New run must reset immunity');
 const ui=file(role,'js/runtime/ui.js');
 assert(ui.includes("if(inventory.laurelShield===1)"),'HUD display uses old herbs count');
 const render=file(role,'js/runtime/render.js');
 assert(render.includes("if(inventory.laurelShield===1)"),'Visual shield ring absent');
 const shield=file(role,'js/features/loot/laurel-shield.js');
 assert(shield.includes('onCollect')&&shield.includes('onBlock')&&shield.includes('active:()'),'Shield interface missing');
 const localSources=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi),...html.matchAll(/<link\b[^>]*\bhref="([^"]+)"/gi)]
   .map(m=>m[1].split('?')[0]).filter(s=>s&&!/^(https?:|data:|\/\/|#)/.test(s));
 for(const res of localSources)assert(fs.existsSync(path.join(ROOT,'beta115-'+role,res)),'Broken resource '+res);
 const dir=path.join(ROOT,'beta115-'+role,'js');let count=0;
 function visit(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())visit(f);else if(e.name.endsWith('.js')){new vm.Script(fs.readFileSync(f,'utf8'),{filename:f});count++;}}}
 visit(dir);
 for(const unchanged of ['js/features/scoring/stage-awards.js','js/features/stages/beta105-balance.js',
   'js/features/endless/waves.js','js/features/loot/drop-balance.js','js/progression/player-stats.js',
   'assets/maps/pirali-approved.webp','js/runtime/leaderboard.js','js/features/scoring/kill-combos.js']){
  const a=digest(path.join(ROOT,'beta114-'+role,unchanged)),b=digest(path.join(ROOT,'beta115-'+role,unchanged));
  assert.equal(a,b,'Changed non-shield rules '+unchanged);
 }
 console.log('PASS Beta 1.15 '+role+': first hit absorbed, second damages, iFrames, stage checkpoint persistence, old save compatibility, 4-language tutorial, '+count+' JS modules');
}
console.log('PASS PIRALI BETA 1.15 LAUREL RELEASE QA');
