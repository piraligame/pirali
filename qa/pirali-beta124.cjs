'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const allowed=new Set(['index.html','js/features/enemies/tactical-ai.js','js/features/scoring/kill-combos.js','js/features/results/stage-stars.js','js/runtime/update.js','js/runtime/render.js','js/runtime/combat.js','css/beta123-stars.css']);
function files(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(dir+'/'+e.name):[dir+'/'+e.name]);}
for(const mode of ['play','dev']){
 const before='beta1231-'+mode,after='beta124-'+mode;
 const prev=files(before).map(p=>p.slice(before.length+1)).sort(),next=files(after).map(p=>p.slice(after.length+1)).sort();
 assert.deepEqual(next,prev,'Files and assets retained');
 for(const rel of prev){
  if(!allowed.has(rel))assert.deepEqual(fs.readFileSync(path.join(root,before,rel)),fs.readFileSync(path.join(root,after,rel)),mode+' unexpected file change '+rel);
  if(rel.endsWith('.js'))new vm.Script(read(after+'/'+rel),{filename:rel});
 }
 const html=read(after+'/index.html'),oldUpdate=read(before+'/js/runtime/update.js'),update=read(after+'/js/runtime/update.js');
 assert.match(html,/1\.24-classic\./);
 assert.equal(html.includes('PiraliAlpha014Test=true'),mode==='dev','Developer controls isolation');
 const movement=s=>s.slice(s.indexOf('  // Input: touchscreen'),s.indexOf('  // Tree collision'));
 assert.equal(movement(update),movement(oldUpdate),'Classic Beta 1.22 joystick untouched');
 for(const f of ['js/config/balance.js','js/config/stage-balance.js','js/features/endless/waves.js','js/features/scoring/stage-awards.js','js/i18n.js'])assert.equal(read(after+'/'+f),read(before+'/'+f),'Preserve '+f);
 assert.match(update,/chargeWindupT=18/);assert.match(read(after+'/js/runtime/render.js'),/drawChargeWarning/);
 assert.match(read(after+'/js/features/scoring/kill-combos.js'),/STORY_WINDOW=2000/);
 assert.match(read(after+'/js/features/results/stage-stars.js'),/pirali_beta123_stage_stars_preview/);
}
const window={},context={window,Math,Number,Object};vm.createContext(context);
vm.runInContext(read('beta124-play/js/features/enemies/tactical-ai.js'),context);
const A=window.PiraliTacticalAI;
function enemy(etype){return {x:0,y:0,r:12,state:'attack',seesSimona:true,etype,alive:true,groupId:0};}
function angle(e){return A.heading(e,{tx:100,ty:0,baseAng:0,flankAng:.3,aliveEnemies:[e],level:1,trees:[]});}
assert.ok(Math.abs(angle(enemy('saber')))<.01,'green attacks directly');
assert.ok(Math.abs(angle(enemy('rifle')))>1,'yellow maintains distance');
assert.ok(Math.abs(angle(enemy('officer')))>1,'red flanks');
console.log('Beta 1.24 QA PASS: syntax, all assets, movement, scoring, languages and role AI (both variants).');
