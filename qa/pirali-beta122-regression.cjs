/* PIRALI Beta 1.22: byte-identical Classic A joystick, minimalist DEV test UI.
   Run: node qa/pirali-beta122-regression.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=(dir,rel)=>fs.readFileSync(path.join(root,dir,rel),'utf8');
for(const kind of ['play','dev']){
 const dir='beta122-'+kind,baseline='beta120-'+kind;
 const classic=read(baseline,'js/runtime/combat.js');
 const updated=read(dir,'js/runtime/combat.js');
 assert.equal(updated,classic,'Classic A input must be byte-for-byte identical');
 for(const file of ['js/runtime/combat.js','js/runtime/update.js','js/progression/checkpoints.js']){
  const result=spawnSync(process.execPath,['--check',path.join(root,dir,file)],{encoding:'utf8'});
  assert.equal(result.status,0,file+' syntax error: '+result.stderr);
 }
 const html=read(dir,'index.html');
 assert.match(html,/BETA 1\.22 • CLASSIC/,'build tag');
 assert.ok(html.includes("window.PiraliGameVersion='1.22.0-classic."+kind+"'"),'runtime version');
 assert.match(html,/combat\.js\?v=beta122-classic-restored/,'fresh joystick cache key');
 assert.match(html,/checkpoints\.js\?v=beta122-classic-(?:play|dev)-save/,'fresh checkpoint cache key');
 assert.match(html,/stage5-scattered-ammo\.js/,'prior stage 5 ammo retained');
 assert.match(html,/beta118-stage6-weak15/,'stage 6 balance retained');
 assert.match(html,/beta117-cap/,'story score ceiling preserved');
 assert.match(html,/window\.PiraliSeasonReleaseEnabled=false/,'test scores cannot write production');
 assert.ok(read(dir,'js/progression/checkpoints.js').includes('pirali_checkpoint_beta_1_22_classic_'),'saves isolated');
 for(const p of [
  'js/runtime/update.js','js/features/stages/beta105-balance.js',
  'js/features/scoring/stage-awards.js','js/features/loot/stage5-scattered-ammo.js',
  'css/style.css']){
  assert.equal(read(dir,p),read(baseline,p),'game content must be unchanged: '+p);
 }
 if(kind==='play'){
  assert.ok(!html.includes('js/preview-controls.js'),'Player cannot load test menu');
  assert.ok(!html.includes('PiraliVisualPreviewReadonly=true'),'Player must not be DEV');
 }
 console.log('PASS '+kind+': exact Classic A joystick and prior gameplay preserved');
}
const script=read('beta122-dev','js/preview-controls.js');
const old=read('beta121-dev','js/preview-controls.js');
assert.ok(script.length<old.length,'removed unused controls');
for(const token of [
 'visitFinal','laurelButton','hitButton','finalBoss','dataset.boss',
 '🎯 ტესტი: 1 დარტყმა','🌿 დაფნის ფარი: ჩართე','⚔️ ბოლო ბოსთან გადასვლა'])
 assert.ok(!script.includes(token),'forbidden developer shortcut remains: '+token);
assert.match(script,/data(?:set)?\.level|dataset\.level/,'stage selectors remain');
assert.match(script,/immortality\.dataset\.immortality='toggle'/,'immortality toggle remains');
assert.ok(read('beta122-dev','index.html').includes('js/preview-controls.js?v=beta122-minimal-test'),'fresh dev test menu loaded');
const syntax=spawnSync(process.execPath,['--check',path.join(root,'beta122-dev/js/preview-controls.js')],{encoding:'utf8'});
assert.equal(syntax.status,0,syntax.stderr);
const made=[];
const makeElement=(tag)=>({
 tagName:tag,style:{},dataset:{},attributes:{},children:[],
 events:{},textContent:'',tabIndex:undefined,
 addEventListener(name,fn){this.events[name]=fn;},
 setAttribute(name,value){this.attributes[name]=value;},
 appendChild(child){this.children.push(child);return child;},
 append(...children){this.children.push(...children);return this;}
});
const body=makeElement('body');
const document={
 readyState:'complete',
 body,
 createElement(tag){const node=makeElement(tag);made.push(node);return node;},
 addEventListener(){throw Error('DOMContentLoaded should be ready');}
};
let level=1,damageCalls=0,worldCalls=0,scoreCalls=0,elevenCalls=0;
const ctx={
 window:{
  PiraliVisualPreviewReadonly:true,PiraliAlpha014Test:true,
  PiraliStats:{stageReady(n){ctx.readyStage=n;}},
  PiraliStageScoring:{beginEndless(){elevenCalls++;}}
 },
 PIRALI_LEVELS:Array.from({length:11},(_,i)=>({ka:'ტური '+(i+1)})),
 document,
 get level(){return level;},
 set level(n){level=n;},
 running:true,
 takeDmg(){damageCalls++;},
 genWorld(){worldCalls++;},
 updateScoreUI(){scoreCalls++;},
 updateAmmoUI(){},
 setInterval(fn,ms){ctx.interval=fn;assert.equal(ms,350);}
};
vm.createContext(ctx);
vm.runInContext(script,ctx,{timeout:1000});
assert.equal(body.children.length,1,'one test panel');
const panel=body.children[0];
assert.equal(panel.id,'pirali-scenery-test-panel');
assert.equal(panel.children.length,5,'only header, levels, title, immortality, note');
const [header,row,title,immortality,note]=panel.children;
assert.equal(row.children.length,11,'all 11 stages available');
assert.ok(immortality.textContent.includes('უკვდავება'));
assert.ok(note.textContent.includes('BETA 1.22'));
assert.equal(panel.style.display,undefined,'panel initially hidden by inline style');
function click(node){node.events.click({preventDefault(){},stopPropagation(){}});}
click(header);
assert.equal(row.style.display,'grid','expand test panel');
for(let i=1;i<=11;i++){
 assert.equal(row.children[i-1].dataset.level,String(i));
 click(row.children[i-1]);
 assert.equal(level,i,'stage selector '+i);
 assert.equal(ctx.readyStage,i,'stats stage ready '+i);
}
assert.equal(worldCalls,11,'one world generation per stage click');
assert.equal(scoreCalls,11,'score UI refreshed');
assert.equal(elevenCalls,1,'stage 11 properly initialized');
assert.equal(title.textContent,'ტური 11');
ctx.takeDmg();assert.equal(damageCalls,1,'normal damage occurs before immortality');
click(immortality);
assert.equal(immortality.attributes['aria-pressed'],'true','immortality on');
ctx.takeDmg();assert.equal(damageCalls,1,'immortality prevents damage');
click(immortality);
assert.equal(immortality.attributes['aria-pressed'],'false','immortality off');
ctx.takeDmg();assert.equal(damageCalls,2,'normal damage restored');
ctx.interval();assert.equal(panel.style.display,'flex','test panel visible while playing');
ctx.running=false;ctx.interval();assert.equal(panel.style.display,'none','test panel hidden when game stops');
console.log('PASS dev menu: 11 stages, immortality on/off, no shield/hit/boss button');
console.log('PASS Beta 1.22 automated Player and Developer regression');
