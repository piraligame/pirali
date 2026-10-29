/* PIRALI Beta 1.21: A movement-preservation and visible-range tests */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
function setup(file){
 const src=fs.readFileSync(file,'utf8');
 const syntax=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 assert.equal(syntax.status,0,syntax.stderr);
 const p=src.slice(0,src.indexOf('// Keyboard events are owned'));
 const callbacks={};
 const node=()=>({style:{},addEventListener(event,fn){callbacks[event]=fn;}});
 const zone=node(),base=node(),knob=node();
 const doc={getElementById(id){return {'joy-zone':zone,'joy-base':base,'joy-knob':knob}[id]}};
 const ctx={document:doc,Math,running:true,P:{dead:false}};
 vm.createContext(ctx);vm.runInContext(p,ctx,{filename:file,timeout:1000});
 return {ctx,joy:vm.runInContext('joy',ctx),base,knob,fire(type,points){
   callbacks[type]({changedTouches:points.map(([identifier,x,y])=>({identifier,clientX:x,clientY:y})),preventDefault(){}});
 }};
}
const near=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-8,label+': '+a+' '+b);
for(const mode of ['play','dev']){
 const old=setup(path.join(root,'beta120-'+mode+'/js/runtime/combat.js'));
 const next=setup(path.join(root,'beta121-'+mode+'/js/runtime/combat.js'));
 const eq=(type,points)=>{
  old.fire(type,points);next.fire(type,points);
  near(old.joy.dx,next.joy.dx,'same X response after '+type);
  near(old.joy.dy,next.joy.dy,'same Y response after '+type);
  near(old.joy.bx,next.joy.bx,'same logical X origin');
  near(old.joy.by,next.joy.by,'same logical Y origin');
  assert.equal(old.joy.engaged,next.joy.engaged,'same deadzone');
 };
 eq('touchstart',[[1,100,700]]);
 const firstX=next.joy.startX,firstY=next.joy.startY;
 const samples=[[103,700],[110,700],[130,690],[180,630],[210,540],[190,410],
  [120,270],[100,220],[90,280],[70,500],[80,650],[120,760],
  [160,900],[220,930],[110,690],[101,701],[100,700]];
 let lowestOldBaseY=Number.POSITIVE_INFINITY;
 for(const [x,y] of samples){
  eq('touchmove',[[1,x,y]]);
  lowestOldBaseY=Math.min(lowestOldBaseY,old.joy.by);
  assert.ok(Math.abs(next.joy.visualX-firstX)<=90+1e-6,'ring moves max 90px horizontally');
  assert.ok(Math.abs(next.joy.visualY-firstY)<=96+1e-6,'ring moves max 96px vertically');
  near(parseFloat(next.base.style.left),next.joy.visualX,'ring X matches visible center');
  near(parseFloat(next.base.style.top),next.joy.visualY,'ring Y matches visible center');
  assert.ok(Math.hypot(
    parseFloat(next.knob.style.left)-next.joy.visualX,
    parseFloat(next.knob.style.top)-next.joy.visualY)<=30+1e-6,'knob stays inside ring');
 }
 assert.ok(lowestOldBaseY<firstY-96,'older A visual ring can travel much higher');
 assert.ok(next.joy.visualY>=firstY-96,'new A keeps visual ring near first touch');
 eq('touchmove',[[22,400,100]]);assert.equal(next.joy.id,1,'second finger ignored');
 eq('touchend',[[22,400,100]]);assert.equal(next.joy.active,true);
 eq('touchcancel',[[1,100,700]]);assert.equal(next.joy.active,false);
 eq('touchstart',[[2,180,900]]);
 eq('touchmove',[[2,180,880]]);
 near(old.joy.dy,next.joy.dy,'new session still identical input');
 eq('touchend',[[2,180,880]]);
 const directory=path.join(root,'beta121-'+mode);
 const index=fs.readFileSync(path.join(directory,'index.html'),'utf8');
 assert.match(index,/BETA 1\.21 • CLASSIC/);
 assert.match(index,/combat\.js\?v=beta121-classic-polish/);
 assert.match(index,/stage5-scattered-ammo\.js/);
 assert.match(index,/beta118-stage6-weak15/);
 assert.match(index,/beta117-cap/);
 assert.match(index,/window\.PiraliSeasonReleaseEnabled=false/);
 const save=fs.readFileSync(path.join(directory,'js/progression/checkpoints.js'),'utf8');
 assert.ok(save.includes('pirali_checkpoint_beta_1_21_classic_'),'independent save key');
 for(const p of ['js/runtime/update.js','js/features/stages/beta105-balance.js',
   'js/features/scoring/stage-awards.js','js/features/loot/stage5-scattered-ammo.js']){
  assert.equal(fs.readFileSync(path.join(root,'beta120-'+mode,p),'utf8'),
    fs.readFileSync(path.join(directory,p),'utf8'),'must preserve game behavior: '+p);
 }
 console.log('PASS '+mode+': exact Classic A movement, visual drift cap, multi-touch and earlier gameplay preserved');
}
console.log('PASS Beta 1.21 both builds');
