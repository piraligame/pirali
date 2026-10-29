/* PIRALI Beta 1.16 touch joystick regression suite.
   Runs offline: node qa/pirali-beta116-joystick.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const near=(a,b,msg)=>assert.ok(Math.abs(a-b)<1e-8,msg+': '+a+' !== '+b);
const t=(identifier,clientX,clientY)=>({identifier,clientX,clientY});
for(const variant of ['play','dev']){
 const base=path.join(root,'beta116-'+variant);
 const source=fs.readFileSync(path.join(base,'js/runtime/combat.js'),'utf8');
 const update=fs.readFileSync(path.join(base,'js/runtime/update.js'),'utf8');
 const style=fs.readFileSync(path.join(base,'css/style.css'),'utf8');
 const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
 assert.match(html,/window\.PiraliSeasonReleaseEnabled=false;/,'WIP input testing cannot write live leaderboard records');
 for(const file of ['js/runtime/combat.js','js/runtime/update.js']){
  const checked=spawnSync(process.execPath,['--check',path.join(base,file)],{encoding:'utf8'});
  assert.equal(checked.status,0,file+' failed syntax QA: '+checked.stderr);
 }
 const events={};
 const makeNode=()=>({style:{},addEventListener(name,fn){events[name]=fn}});
 const zone=makeNode(),baseNode=makeNode(),knob=makeNode();
 const document={getElementById(id){
  return {'joy-zone':zone,'joy-base':baseNode,'joy-knob':knob}[id];
 }};
 const prefix=source.slice(0,source.indexOf('// Keyboard events are owned'));
 assert.ok(prefix.includes('JOY_DEAD_ZONE=3'),'touch deadzone is 3px');
 const context=vm.createContext({document,Math});
 vm.runInContext(prefix,context,{timeout:1000});
 const joystick=vm.runInContext('joy',context);
 const dispatch=(name,touches)=>events[name]({preventDefault(){},changedTouches:touches});
 dispatch('touchstart',[t(11,150,400)]);
 assert.equal(joystick.active,true);
 near(joystick.dx,0,'start still');
 dispatch('touchmove',[t(11,154,400)]);
 near(joystick.dx,1,'4px swipe RIGHT moves instantly');
 near(joystick.dy,0,'horizontal direction');
 dispatch('touchmove',[t(11,150,404)]);
 near(joystick.dx,0,'direction RIGHT->DOWN');
 near(joystick.dy,1,'DOWN without ring travel');
 dispatch('touchmove',[t(11,146,400)]);
 near(joystick.dx,-1,'reverse LEFT without passing rim');
 dispatch('touchmove',[t(11,153,404)]);
 near(joystick.dx,.6,'diagonal X normalized');
 near(joystick.dy,.8,'diagonal Y normalized');
 dispatch('touchmove',[t(11,240,400)]);
 near(joystick.dx,1,'swipe past ring stays full speed');
 assert.ok(parseFloat(knob.style.left)<=150+30,'knob stays inside small ring');
 dispatch('touchmove',[t(999,150,480)]);
 near(joystick.dx,1,'second finger cannot steal control');
 dispatch('touchend',[t(999,150,480)]);
 assert.equal(joystick.active,true,'second finger lift is ignored');
 dispatch('touchcancel',[t(11,240,400)]);
 assert.equal(joystick.active,false);
 assert.equal(joystick.justReleased,true);
 near(joystick.dx,0,'cancel releases velocity input');
 assert.equal(baseNode.style.display,'none','release hides ring');
 dispatch('touchstart',[t(12,80,120)]);
 dispatch('touchmove',[t(12,82,120)]);
 near(joystick.dx,0,'accidental 2px tremor ignored');
 dispatch('touchmove',[t(12,84,120)]);
 near(joystick.dx,1,'4px intentional swipe moves');
 dispatch('touchend',[t(12,84,120)]);
 const start=update.indexOf('    const mag=Math.hypot(mx,my);');
 const end=update.indexOf('  if(dashCD>0)',start);
 assert.ok(start>=0&&end>start,'movement block found');
 // The slice starts inside the parent movement else; remove its final brace.
 const movement=update.slice(start,end).replace(/\n  }\s*$/, '\n');
 function runMovement(mx,my,touchDriving,touchStopped){
  const player={vx:.8,vy:.5,ang:0,wt:0,wf:0,stepT:0,x:200,y:200};
  const sandbox={mx,my,touchDriving,touchStopped,SPD:1.42,dt:1,
    P:player,Math,spawnPart(){}};
  vm.runInNewContext(movement,sandbox,{timeout:1000});
  return player;
 }
 const right=runMovement(1,0,true,false);
 near(right.vx,1.42,'touch speed immediate, no smoothing');
 near(right.vy,0,'touch direction immediate');
 const stopped=runMovement(0,0,false,true);
 near(stopped.vx,0,'stop immediately on lift');
 near(stopped.vy,0,'stop Y immediately on lift');
 const keyboard=runMovement(1,0,false,false);
 near(keyboard.vx,.8+(1.42-.8)*.42,'keyboard preserves original movement');
 assert.match(style,/#joy-base\{[^\n]*width:96px;height:96px/);
 assert.match(style,/#joy-knob\{[^\n]*width:40px;height:40px/);
 for(const ref of ['css/style.css?v=beta116-joystick','js/runtime/combat.js?v=beta116-joystick','js/runtime/update.js?v=beta116-joystick'])
  assert.ok(html.includes(ref),'cache-busted '+ref);
 console.log('PASS Beta 1.16 responsive joystick: '+variant);
}
console.log('PASS: swipe response, reversible direction, visual clamp, stop, multi-touch, Player/Developer');
