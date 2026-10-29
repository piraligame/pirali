/* PIRALI Beta 1.18 — real touch movement and stage 6 relative balance tests.
 * node qa/pirali-beta118-regression.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const near=(a,b,m)=>assert.ok(Math.abs(a-b)<1e-7,m+': '+a+' != '+b);
function testJoy(source,kind){
 const marker='// Keyboard events are owned';
 const prefix=source.slice(0,source.indexOf(marker));
 assert.ok(prefix.includes('JOY_FOLLOW_LIMIT=35'),'follow limit declared');
 const listeners={};
 const make=()=>({style:{},addEventListener(n,fn){listeners[n]=fn;}});
 const zone=make(),base=make(),knob=make();
 const scene={document:{getElementById(id){return {'joy-zone':zone,'joy-base':base,'joy-knob':knob}[id];}},
  running:true,P:{dead:false},Math};
 vm.createContext(scene);vm.runInContext(prefix,scene,{timeout:700});
 const joy=vm.runInContext('joy',scene);
 const finger=(id,x,y)=>({identifier:id,clientX:x,clientY:y});
 const event=(kind,...touches)=>listeners[kind]({changedTouches:touches,preventDefault(){}});
 event('touchstart',finger(1,100,300));assert.equal(joy.active,true);
 assert.equal(joy.dx,0,'finger touching still');
 event('touchmove',finger(1,102,300));assert.equal(joy.dx,0,'2px should not creep');
 event('touchmove',finger(1,104,300));near(joy.dx,1,'4px full-speed motion');
 event('touchmove',finger(1,102,300));near(joy.dx,1,'hysteresis avoids chatter');
 event('touchmove',finger(1,101,300));near(joy.dx,0,'release at centre stops');
 event('touchmove',finger(1,100,304));near(joy.dy,1,'down turns immediately');
 event('touchmove',finger(1,100,296));near(joy.dy,-1,'up reverses immediately');
 event('touchmove',finger(1,300,300));
 near(joy.bx,265,'floating origin follows a long swipe');
 near(joy.dx,1,'long swipe still full-speed');
 assert.ok(Number.parseFloat(knob.style.left)<=joy.bx+30+1e-6,'knob stays in ring');
 event('touchmove',finger(1,260,300));near(joy.dx,-1,'reverse after huge drag without returning to start');
 event('touchmove',finger(1,268,304));near(Math.hypot(joy.dx,joy.dy),1,'diagonal normalized');
 event('touchmove',finger(99,500,500));assert.equal(joy.id,1,'second finger ignored');
 event('touchend',finger(99,500,500));assert.equal(joy.active,true,'secondary touch release ignored');
 event('touchcancel',finger(1,268,304));assert.equal(joy.active,false);
 assert.equal(joy.justReleased,true);near(joy.dx,0,'cancel clears direction');
 assert.equal(base.style.display,'none','ring hidden on cancel');
 scene.running=false;
 event('touchstart',finger(2,100,300));assert.equal(joy.active,false,'no control while game stopped');
 scene.running=true;scene.P.dead=true;
 event('touchstart',finger(2,100,300));assert.equal(joy.active,false,'no control while dead');
 scene.P.dead=false;
 event('touchstart',finger(3,120,320));assert.equal(joy.active,true,'can restart after cancel');
 event('touchend',finger(3,120,320));assert.equal(joy.active,false);
 console.log('PASS '+kind+' touch: 3px start, hysteresis, reversal, dynamic anchor, multitouch, stop');
}
function balance(src,stage){
 const initial=Array.from({length:26},(_,i)=>({
  x:1000,y:3500-i*105,r:12,alive:true,hp:1.75,maxHp:1.75,etype:'rifle',
  patrol:{cx:1000,cy:3500-i*105,radius:36,t:0,spd:.3},
  groupId:i,state:'patrol',vx:0,vy:0
 }));
 const context={level:stage,enemies:[],boss:null,WW:2000,WH:3800,CHURCH_Y:120,
   Math,Number,window:{PiraliDualGenerals:{second:()=>null}},
   path:Array.from({length:24},(_,i)=>({x:1000,y:3720-i*148}))};
 context.genWorld=()=>{context.enemies=initial.map(e=>({...e,patrol:{...e.patrol}}));};
 vm.createContext(context);vm.runInContext(src,context,{timeout:700});context.genWorld();
 return {hp:context.enemies[0]?.hp,config:context.window.PiraliStageTuning.config(stage),
  attack:context.window.PiraliStageTuning.attack(stage),count:context.enemies.length};
}
for(const variant of ['play','dev']){
 const base=path.join(root,'beta118-'+variant);
 const prior=path.join(root,'beta1171-'+variant);
 const take=(p)=>fs.readFileSync(path.join(base,p),'utf8');
 for(const p of ['js/runtime/combat.js','js/runtime/update.js','js/features/stages/beta105-balance.js',
  'js/platform/mobile-lifecycle.js','js/features/stages/early-start-spacing.js']){
  const s=spawnSync(process.execPath,['--check',path.join(base,p)],{encoding:'utf8'});
  assert.equal(s.status,0,variant+' '+p+' syntax error '+s.stderr);
 }
 testJoy(take('js/runtime/combat.js'),variant);
 const newBalance=take('js/features/stages/beta105-balance.js');
 const oldBalance=fs.readFileSync(path.join(prior,'js/features/stages/beta105-balance.js'),'utf8');
 for(const n of [6,7,8,9,10,11]){
  const before=balance(oldBalance,n),after=balance(newBalance,n);
  near(after.config.hp/before.config.hp,n===6?.85:1,'HP multiplier on stage '+n);
  near(after.attack/before.attack,n===6?.85:1,'attack multiplier on stage '+n);
  assert.ok(Math.abs(after.hp/before.hp-(n===6?.85:1))<.002,'actual rounded HP stage '+n);
  assert.equal(after.count,before.count,'enemy count unchanged stage '+n);
 }
 const html=take('index.html');
 for(const token of ["BETA 1.18 TEST","PiraliGameVersion='1.18.0-beta.1",
  'js/runtime/combat.js?v=beta118-floating-follow',
  'js/features/stages/beta105-balance.js?v=beta118-stage6-weak15',
  'js/platform/mobile-lifecycle.js?v=beta118-input-reset']){
  assert.ok(html.includes(token),'missing version cache '+token);
 }
 assert.ok(html.includes('window.PiraliSeasonReleaseEnabled=false'),'test build must not submit scores');
 assert.ok(html.includes('stage5-scattered-ammo.js'),'keep stage five ammo increase');
 const lifecycle=take('js/platform/mobile-lifecycle.js');
 assert.ok(lifecycle.includes('joy.engaged=false;joy.justReleased=true'),'background restores joystick state');
 const css=take('css/style.css');assert.ok(css.includes('touch-action:none;overscroll-behavior:contain'),'touch scrolling disabled');
 const update=take('js/runtime/update.js');
 assert.ok(update.includes('if(touchDriving){P.vx=mx*sp;P.vy=my*sp;}'),'instant touch movement preserved');
 console.log('PASS '+variant+' stage 6 weakness -15% plus all other stage balances and score/UI intact');
}
console.log('PASS Beta 1.18 Player & Developer automated regression');
