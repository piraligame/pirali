/* PIRALI Beta 1.23.1: screenshot-reported overlap hotfix regression.
   node qa/pirali-beta1231-stage-layout.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function walk(dir,relative=''){
  return fs.readdirSync(path.join(dir,relative),{withFileTypes:true}).flatMap(entry=>{
   const rel=path.join(relative,entry.name);
   return entry.isDirectory()?walk(dir,rel):[rel];
  }).sort();
}
for(const v of ['play','dev']){
 const old=path.join(root,'beta123-'+v),newDir=path.join(root,'beta1231-'+v);
 const original=walk(old),updated=walk(newDir);
 assert.deepEqual(updated,original,'hotfix cannot add/drop unrelated game files');
 const changed=[];
 for(const rel of original){
  const a=fs.readFileSync(path.join(old,rel));
  const b=fs.readFileSync(path.join(newDir,rel));
  if(!a.equals(b))changed.push(rel);
 }
 assert.deepEqual(changed,['css/beta123-stars.css','index.html'],
    'Only stage layout CSS and version/caching HTML may change');
 const css=fs.readFileSync(path.join(newDir,'css/beta123-stars.css'),'utf8');
 assert.match(css,/#pirali-stage-stars\{[^}]*top:calc\(clamp\(160px,24vh,430px\) \+ clamp\(120px,11vh,160px\)\)/);
 assert.match(css,/\.pirali-polish-toast\.stage\s*\{\s*top:clamp\(160px,24vh,430px\)/);
 assert.match(css,/@media \(max-height:760px\)/);
 assert.match(css,/top:calc\(18vh \+ 108px\)/);
 assert.match(css,/pointer-events:none/,'result UI must not block joystick/attacks');
 // Both result cards are present together after stage completion. Check their
 // vertical origins leave space for the 3-line prior summary.
 const clamp=(min,v,max)=>Math.max(min,Math.min(v,max));
 for(const h of [600,700,760,800,900,1200,1360,1600]){
  const stage=h<=760?h*.18:clamp(160,h*.24,430);
  const star=h<=760?h*.18+108:stage+clamp(120,h*.11,160);
  assert.ok(star-stage>=108,'result cards overlap at viewport height '+h);
  assert.ok(stage>h*.16,'result toast no longer overlaps the top HUD at '+h);
 }
 const html=fs.readFileSync(path.join(newDir,'index.html'),'utf8');
 assert.match(html,/BETA 1\.23\.1 • CLASSIC/);
 assert.ok(html.includes("window.PiraliGameVersion='1.23.1-classic."+v+"'"));
 assert.match(html,/css\/beta123-stars\.css\?v=beta1231-result-layout/,'cache bust must load new CSS');
 assert.match(html,/js\/runtime\/combat\.js\?v=beta122-classic-restored/,'Classic A untouched');
 assert.match(html,/js\/features\/enemies\/tactical-ai\.js\?v=beta123-ai/);
 assert.match(html,/js\/features\/results\/stage-stars\.js\?v=beta123-stars/);
 assert.match(html,/js\/features\/loot\/pickup-visibility\.js\?v=beta123-pickup-halo/);
 assert.match(html,/window\.PiraliSeasonReleaseEnabled=false/,'preview must not submit live scores');
 if(v==='play')assert.ok(!html.includes('js/preview-controls.js'),'Player remains free of test controls');
 else assert.match(html,/js\/preview-controls\.js\?v=beta122-minimal-test/,'Dev retains stages and immortality');
 console.log('PASS '+v+': result cards stacked with >=108px separation, no gameplay changes');
}
console.log('PASS PIRALI Beta 1.23.1 layout hotfix');
