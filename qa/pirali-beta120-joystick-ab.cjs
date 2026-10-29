/* PIRALI Beta 1.20 A/B controls: verify both modes have IDENTICAL thumb
   direction, while the B visual base remains fixed.
   node qa/pirali-beta120-joystick-ab.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const near=(a,b,msg)=>assert.ok(Math.abs(a-b)<1e-7,msg+': '+a+' != '+b);
function load(mode,variant){
 const directory=path.join(root,mode==='classic'?'beta120-'+variant:'beta120-fixed-'+variant);
 const file=path.join(directory,'js/runtime/combat.js');
 const source=fs.readFileSync(file,'utf8');
 const syntax=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 assert.equal(syntax.status,0,file+' invalid: '+syntax.stderr);
 const prefix=source.slice(0,source.indexOf('// Keyboard events are owned'));
 assert.ok(prefix.length>1000,'combat content missing');
 const handlers={},other={};
 function makeNode(){return {style:{},addEventListener(name,fn){handlers[name]=fn;}};}
 const zone=makeNode(),base=makeNode(),knob=makeNode();
 const win={innerWidth:390,innerHeight:820,addEventListener(name,fn){other[name]=fn;}};
 const doc={documentElement:{clientWidth:390,clientHeight:820},
   getElementById(name){return {'joy-zone':zone,'joy-base':base,'joy-knob':knob}[name];}};
 const ctx={Math,window:win,document:doc,running:true,P:{dead:false}};
 vm.createContext(ctx);vm.runInContext(prefix,ctx,{filename:file,timeout:1000});
 const joy=vm.runInContext('joy',ctx);
 const move=(kind,touches)=>handlers[kind]({changedTouches:touches,preventDefault(){}});
 const finger=(id,x,y)=>({identifier:id,clientX:x,clientY:y});
 const html=fs.readFileSync(path.join(directory,'index.html'),'utf8');
 const tag=mode==='classic'?'BETA 1.20 A • CLASSIC':'BETA 1.20 B • FIXED';
 assert.ok(html.includes(tag),'variant label missing: '+directory);
 assert.ok(html.includes('beta120-'+mode+'-input'),'new input cache key missing');
 assert.ok(html.includes('window.PiraliSeasonReleaseEnabled=false'),'A/B must not write live Firebase leaderboard');
 const checkpoint=fs.readFileSync(path.join(directory,'js/progression/checkpoints.js'),'utf8');
 assert.ok(checkpoint.includes('pirali_checkpoint_beta_1_20_'+mode),'checkpoints not isolated');
 const css=fs.readFileSync(path.join(directory,'css/style.css'),'utf8');
 if(mode==='classic')assert.match(css,/#joy-zone\{[^}]*height:100%/,'classic capture restored');
 else assert.match(css,/#joy-zone\{[^}]*height:60%/,'fixed capture isolated');
 assert.ok(html.includes('beta118-stage6-weak15'),'stage-6 reduction intact');
 assert.ok(html.includes('stage5-scattered-ammo.js'),'stage-5 additional ammo intact');
 assert.ok(html.includes('beta117-cap'),'stage-9 hard score cap intact');
 return {joy,move,base,knob,win,other,ctx,finger,directory};
}
for(const variant of ['play','dev']){
 const a=load('classic',variant),b=load('fixed',variant);
 // Stage scripts used by both builds must be byte-for-byte identical.
 const rels=['js/runtime/update.js','js/features/stages/beta105-balance.js',
  'js/features/scoring/stage-awards.js','js/features/loot/stage5-scattered-ammo.js'];
 for(const rel of rels){
  assert.equal(fs.readFileSync(path.join(a.directory,rel),'utf8'),
   fs.readFileSync(path.join(b.directory,rel),'utf8'),
   'A/B gameplay mismatch in '+rel);
 }
 function both(kind,points){
  for(const h of [a,b])h.move(kind,points.map(p=>h.finger(...p)));
  near(a.joy.dx,b.joy.dx,'A/B X direction after '+kind);
  near(a.joy.dy,b.joy.dy,'A/B Y direction after '+kind);
  assert.equal(a.joy.engaged,b.joy.engaged,'A/B engaged state');
  assert.equal(a.joy.active,b.joy.active,'A/B active state');
 }
 both('touchstart',[[7,80,675]]);
 assert.equal(b.base.style.left,'85.8px'); // fixed at 22% of 390
 assert.equal(b.base.style.top,'639.6px');
 const baseX=b.base.style.left,baseY=b.base.style.top;
 const moves=[
  [80,673],[80,670],[80,666],[80,635],[95,595],[160,440],
  [190,285],[178,298],[161,319],[80,360],[50,450],[82,550],
  [130,630],[180,650],[160,675],[100,681],[81,676],[78,674]
 ];
 for(const [x,y] of moves){
  both('touchmove',[[7,x,y]]);
  assert.equal(b.base.style.left,baseX,'fixed ring should NEVER move horizontally');
  assert.equal(b.base.style.top,baseY,'fixed ring should NEVER move vertically');
  const knobX=parseFloat(b.knob.style.left)-b.joy.visualX;
  const knobY=parseFloat(b.knob.style.top)-b.joy.visualY;
  assert.ok(Math.hypot(knobX,knobY)<=30.001,'B knob remains inside ring');
 }
 assert.notEqual(a.base.style.top,baseY,'A classic floating ring follows the thumb');
 // Multi-touch must never steal control from a left-side touch.
 both('touchmove',[[13,200,500]]);
 assert.equal(b.joy.id,7);
 both('touchend',[[13,200,500]]);
 assert.equal(b.joy.active,true);
 both('touchcancel',[[7,78,674]]);
 assert.equal(a.joy.active,false);assert.equal(b.joy.active,false);
 near(a.joy.dx,0,'A stops');near(b.joy.dx,0,'B stops');
 // Different aspect ratio: only B fixed visual centre changes on rotation.
 const before=b.joy.visualX;
 both('touchstart',[[8,90,670]]);
 b.win.innerWidth=720;b.win.innerHeight=1320;b.other.resize();
 assert.notEqual(b.joy.visualX,before,'fixed base repositions on orientation');
 near(b.joy.visualX,142,'fixed visual clamps x on tablet');
 near(b.joy.visualY,1080,'fixed visual positions near bottom');
 both('touchend',[[8,90,670]]);
 a.ctx.running=false;b.ctx.running=false;
 both('touchstart',[[9,80,675]]);
 assert.equal(a.joy.active,false);assert.equal(b.joy.active,false);
 console.log('PASS '+variant+': identical real input A/B; classic ring follows, fixed B remains anchored; multitouch/rotate/stop; all gameplay identical');
}
console.log('PASS PIRALI Beta 1.20 both A and B Player/Developer joystick comparison.');
