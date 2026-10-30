'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function files(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(dir+'/'+x.name):[dir+'/'+x.name]);}
const changes=new Set(['js/runtime/combat.js','css/style.css','index.html','js/menu.js','TEST_INFO.json']);
for(const variant of ['play','dev']){
 const old='beta137-'+variant,next='beta138-'+variant;
 const expected=files(old).map(x=>x.slice(old.length+1)).sort(),current=files(next).map(x=>x.slice(next.length+1)).sort();
 assert.deepEqual(current,expected,'Beta 1.38 preserves all Beta 1.37 assets');
 const changed=new Set(changes);
 if(variant==='dev'){changed.add('js/preview-controls.js');changed.add('js/features/enemies/range137.js');}
 for(const f of expected){
  const prev=read(old+'/'+f),now=read(next+'/'+f);
  if(changed.has(f))assert.notEqual(now,prev,'Planned modification '+variant+'/'+f);
  else assert.equal(now,prev,'Preserve previous gameplay and rewards '+variant+'/'+f);
  if(f.endsWith('.js'))new vm.Script(now,{filename:next+'/'+f});
 }
 const info=JSON.parse(read(next+'/TEST_INFO.json')),html=read(next+'/index.html');
 assert.equal(info.features138.length,5);
 assert.equal(info.premiumFullRoute.pointsMultiplier,.2);
 assert.equal(info.premiumFullRoute.startingHearts,7);
 assert.equal(info.premiumFullRoute.shellDropsAllStagesIfOwned,true);
 assert.equal(info.enemyRange137.enemyBulletScale,2);
 assert.equal(info.mobileControlsPreserved,true);
 assert.equal(info.androidBuilt,false);assert.equal(info.aabBuilt,false);
 assert.ok(html.includes('1.38-classic.'+variant));
 assert.match(html,/js\/runtime\/combat\.js\?v=beta138-stick/);
 assert.match(html,/css\/style\.css\?v=beta138-joystick-zone/);
 const css=read(next+'/css/style.css'),combat=read(next+'/js/runtime/combat.js');
 assert.match(css,/width:min\(48vw,275px\)!important/);
 assert.match(css,/height:min\(48dvh,370px\)!important/);
 assert.match(css,/body\.pirali-joy138-classic/);
 assert.match(combat,/JOY_FULL_SPEED=6\.5/);
 assert.match(combat,/JOY_DEAD_ZONE=2/);
 assert.match(combat,/Math\.min\(dist,maxRadius\)/);
 assert.match(combat,/joy\.startX=t\.clientX/);
 assert.match(combat,/jZ\.addEventListener\('touchcancel'/);
 assert.match(combat,/resetJoy138/);
 // Run the exact production joystick input handlers in an isolated browser-like VM.
 const handlers={},styles={},element=id=>({
  style:(styles[id]??={}),getBoundingClientRect:()=>({left:0,right:172,top:395,bottom:760}),
  addEventListener:(name,fn)=>{if(id==='joy-zone')handlers[name]=fn}
 });
 const elements=new Map();
 const document={getElementById:id=>{if(!elements.has(id))elements.set(id,element(id));return elements.get(id);}};
 const env={window:{},document,running:true,paused:false,P:{dead:false},Math};
 vm.createContext(env);
 const input=combat.slice(0,combat.indexOf('// Keyboard events are owned by'));
 vm.runInContext(input,env);
 const fire=(name,touches)=>{handlers[name]({changedTouches:touches,preventDefault(){}});return vm.runInContext('window.PiraliJoy138.debug()',env)};
 const start=fire('touchstart',[{identifier:3,clientX:70,clientY:630}]);
 assert.equal(start.active,true);assert.equal(start.bx,70);assert.equal(start.by,630);
 let move=fire('touchmove',[{identifier:3,clientX:74,clientY:630}]);
 assert.ok(move.dx>.35&&move.dx<1,'Small thumb travel should engage with smooth sensitivity');
 move=fire('touchmove',[{identifier:3,clientX:520,clientY:100}]);
 assert.equal(move.bx,70,'Anchored base must not follow a huge drag horizontally');
 assert.equal(move.by,630,'Anchored base must not follow a huge drag vertically');
 const knobX=Number.parseFloat(styles['joy-knob'].left),knobY=Number.parseFloat(styles['joy-knob'].top);
 assert.ok(Math.hypot(knobX-70,knobY-630)<=29.05,'Knob cannot move beyond stick radius');
 const foreign=fire('touchmove',[{identifier:8,clientX:100,clientY:650}]);
 assert.equal(foreign.dx,move.dx,'Second finger ignored');
 let stop=fire('touchend',[{identifier:8,clientX:100,clientY:650}]);
 assert.equal(stop.active,true,'Other finger cannot stop joystick');
 stop=fire('touchcancel',[{identifier:3,clientX:520,clientY:100}]);
 assert.equal(stop.active,false);assert.equal(stop.dx,0);assert.equal(stop.dy,0);
 assert.equal(styles['joy-base'].display,'none');
 assert.equal(styles['joy-knob'].display,'none');
 vm.runInContext('paused=true',env);
 const paused=fire('touchstart',[{identifier:5,clientX:70,clientY:630}]);
 assert.equal(paused.active,false,'Pause must block joystick');
 vm.runInContext('paused=false',env);
 if(variant==='dev'){
  assert.match(html,/js\/preview-controls\.js\?v=beta138-compare/);
  const dev=read(next+'/js/preview-controls.js');
  assert.match(dev,/Beta 1\.38 გაუმჯობესებები/);
  assert.match(dev,/pirali-joy138-classic/);
  assert.match(dev,/PiraliJoy138\?\.reset/);
  assert.match(read(next+'/js/features/enemies/range137.js'),/const enabled=\(\)=>true/);
  env.window.PiraliDevComparison={latestEnabled:()=>false};
  assert.equal(vm.runInContext('window.PiraliJoy138.modern()',env),false);
  const classic=fire('touchstart',[{identifier:12,clientX:70,clientY:630}]);
  assert.equal(classic.active,true);
  const follow=fire('touchmove',[{identifier:12,clientX:450,clientY:190}]);
  assert.ok(follow.bx>70,'Dev OFF: old floating-center follow works');
  fire('touchend',[{identifier:12}]);
  env.window.PiraliDevComparison.latestEnabled=()=>true;
  assert.equal(vm.runInContext('window.PiraliJoy138.modern()',env),true);
 }else{
  assert.equal(info.developerComparison,null);
  assert.ok(!html.includes('js/preview-controls.js'));
 }
}
console.log('PASS Beta 1.38: anchored lower-left joystick, 6.5px full engagement, multi-touch safety, pause/reset, Dev comparison, preserved scoring/balance/11 stages');
