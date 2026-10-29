'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const list=p=>fs.readdirSync(path.join(root,p),{withFileTypes:true}).flatMap(x=>x.isDirectory()?list(p+'/'+x.name):[p+'/'+x.name]);
const changed=new Set(['index.html','css/beta127.css','css/live-minimap.css','js/features/map/live-minimap.js','js/menu.js','TEST_INFO.json']);
for(const v of ['play','dev']){
 const old='beta1271-'+v,now='beta1272-'+v;
 const source=list(old).map(x=>x.slice(old.length+1)).sort(),target=list(now).map(x=>x.slice(now.length+1)).sort();
 assert.deepEqual(target,source);
 for(const rel of source){
  if(!changed.has(rel))assert.equal(read(old+'/'+rel),read(now+'/'+rel),'Unexpected game change '+rel);
  if(rel.endsWith('.js'))new vm.Script(read(now+'/'+rel),{filename:now+'/'+rel});
 }
 const menu=read(now+'/js/menu.js'),index=read(now+'/index.html'),minimap=read(now+'/js/features/map/live-minimap.js'),css=read(now+'/css/beta127.css'),miniCSS=read(now+'/css/live-minimap.css');
 assert.match(index,/PiraliGameVersion='1\.27\.2-classic\./);
 assert.match(menu,/BETA 1\.27\.2/);
 assert.match(index,/beta1272-compact/);
 assert.match(index,/beta1272-no-legend/);
 assert.match(css,/clamp\(245px,43vh,420px\) - 50px/);
 assert.match(css,/clamp\(245px,44vh,330px\) - 60px/);
 assert.doesNotMatch(minimap,/\.className='pirali-mini-legend'/);
 assert.doesNotMatch(minimap,/legend\.appendChild|root\.append\(control,canvas,legend\)/);
 assert.doesNotMatch(miniCSS,/\.pirali-mini-legend|\.mini-legend-item/);
 assert.match(minimap,/pirali_beta125_minimap_hidden/);
 assert.match(minimap,/drawBossPin|drawMarker/);
 assert.equal(index.includes('js/preview-controls.js'),v==='dev');
 assert.doesNotMatch(menu,/PiraliStatsBackup\?\.mount|menu-replay|PiraliReplay/);
 assert.match(read(now+'/js/runtime/game-init.js'),/PiraliPlayerIdentity\.requireName/);
 const info=JSON.parse(read(now+'/TEST_INFO.json'));
 assert.equal(info.androidBuilt,false);assert.equal(info.aabBuilt,false);
}
console.log('PASS 1.27.2 static: minimal layout-only edit, lower legend removed, version, AI/joystick/checkpoints/11 stages/statistics unaffected');


