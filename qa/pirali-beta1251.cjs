'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function read(p){return fs.readFileSync(path.join(root,p),'utf8');}
function list(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(dir+'/'+e.name):[dir+'/'+e.name]);}
const touched=new Set(['index.html','js/menu.js','js/runtime/render.js','js/effects/combat-fx.js','css/beta125.css']);
for(const mode of ['play','dev']){
 const older='beta125-'+mode,fresh='beta1251-'+mode;
 const prev=list(older).map(x=>x.slice(older.length+1)).sort();
 const next=list(fresh).map(x=>x.slice(fresh.length+1)).sort();
 assert.deepEqual(next,prev.filter(x=>x!=='js/features/settings/graphics.js'),'No missing game files '+mode);
 assert.ok(!next.includes('js/features/settings/graphics.js'));
 for(const file of next){
   if(file.endsWith('.js'))new vm.Script(read(fresh+'/'+file),{filename:fresh+'/'+file});
   if(!touched.has(file))assert.deepEqual(fs.readFileSync(path.join(root,fresh,file)),fs.readFileSync(path.join(root,older,file)),'Unintended change '+file);
 }
 const html=read(fresh+'/index.html'),menu=read(fresh+'/js/menu.js');
 const css=read(fresh+'/css/beta125.css'),renderer=read(fresh+'/js/runtime/render.js'),fx=read(fresh+'/js/effects/combat-fx.js');
 assert.match(html,/1\.25\.1-classic\./);
 assert.equal(html.includes('PiraliAlpha014Test=true'),mode==='dev','Developer panel isolation');
 assert.doesNotMatch(html,/features\/settings\/graphics/);
 assert.doesNotMatch(menu,/menu-graphics|PiraliGraphics/);
 assert.doesNotMatch(css,/menu-graphics|data-pirali-graphics/);
 assert.doesNotMatch(renderer,/PiraliGraphics/);
 assert.match(renderer,/^  PiraliFX\.draw\(ctx,sx,sy,W,H\);$/m);
 assert.match(renderer,/^  drawWeatherOverlay\(\);$/m);
 assert.doesNotMatch(fx,/PiraliGraphics/);
 assert.match(fx,/const MAX=28/);
 for(const stable of ['js/config/balance.js','js/config/stage-balance.js','js/runtime/update.js','js/runtime/combat.js','js/runtime/world.js','js/progression/player-stats.js','js/progression/checkpoints.js','js/features/scoring/stage-awards.js','js/features/endless/waves.js','js/i18n.js','js/features/map/live-minimap.js']){
   assert.equal(read(fresh+'/'+stable),read(older+'/'+stable),'Gameplay/save preservation '+stable);
 }
}
console.log('PASS Beta 1.25.1: fixed quality, no selector, unchanged input/balance, both variants, JS syntax and all assets.');
