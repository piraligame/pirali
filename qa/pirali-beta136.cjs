'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function files(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(dir+'/'+x.name):[dir+'/'+x.name]);}
const common=new Set(['css/menu.css','js/menu.js','js/runtime/render.js','js/features/loot/pickup-visibility.js','index.html','TEST_INFO.json']);
for(const variant of ['play','dev']){
 const old='beta135-'+variant,now='beta136-'+variant,modified=new Set(common);
 if(variant==='dev'){modified.add('js/preview-controls.js');modified.add('js/features/polish/beta134-experience.js');}
 const oldFiles=files(old).map(x=>x.slice(old.length+1)).sort(),newFiles=files(now).map(x=>x.slice(now.length+1)).sort();
 assert.deepEqual(newFiles,[...oldFiles,'js/features/loot/bullet-art136.js'].sort(),'No deleted prior files');
 for(const file of oldFiles){
  const previous=read(old+'/'+file),current=read(now+'/'+file);
  if(modified.has(file))assert.notEqual(current,previous,'Changed planned file '+file);
  else assert.equal(current,previous,'Protected existing file '+file);
  if(file.endsWith('.js'))new vm.Script(current,{filename:now+'/'+file});
 }
 const info=JSON.parse(read(now+'/TEST_INFO.json')),html=read(now+'/index.html');
 const menu=read(now+'/js/menu.js'),css=read(now+'/css/menu.css'),render=read(now+'/js/runtime/render.js');
 const art=read(now+'/js/features/loot/bullet-art136.js'),halo=read(now+'/js/features/loot/pickup-visibility.js');
 new vm.Script(art);
 assert.equal(info.features136.length,5);
 assert.equal(info.premiumFullRoute.pointsMultiplier,.2);
 assert.equal(info.premiumFullRoute.startingHearts,7);
 assert.equal(info.premiumFullRoute.shellDropsAllStagesIfOwned,true);
 assert.equal(info.mobileControlsPreserved,true);
 assert.equal(info.androidBuilt,false);assert.equal(info.aabBuilt,false);
 assert.equal(info.menuLayout,'portrait-lowered-v136');
 assert.ok(html.includes("1.36-classic."+variant));
 assert.match(css,/padding-top:clamp\(310px,46dvh,420px\)!important/);
 assert.match(css,/overflow-y:auto!important/);
 assert.match(menu,/pirali-menu136-on/);
 assert.match(render,/PiraliBulletArt136\?\.drawPickup/);
 assert.match(render,/PiraliBulletArt136\?\.drawProjectile/);
 assert.match(halo,/PiraliBulletArt136\?\.suppressHalo/);
 assert.match(html,/js\/features\/loot\/bullet-art136\.js\?v=136/);
 assert.match(art,/quadraticCurveTo/);
 assert.ok(!art.includes('ctx.arc('),'Bullet art never draws glowing dots or circular rings');
 const env={window:{},Math};vm.runInNewContext(art,env);
 const a=env.window.PiraliBulletArt136;
 assert.equal(a.suppressHalo({type:'ammo'}),true);
 assert.equal(a.suppressHalo({type:'health'}),false);
 assert.equal(a.suppressHalo({type:'alpha-shells'}),true);
 const marks=[];const mock={save(){},restore(){},translate(){},rotate(){},beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){marks.push('taper')},closePath(){},fill(){marks.push('fill')},fillRect(){marks.push('body')}};
 assert.equal(a.drawPickup(mock,{type:'ammo',col:false},10,10),true);
 assert.equal(a.drawProjectile(mock,{vx:7,vy:0,fp:true,alive:true},10,10),true);
 assert.ok(marks.includes('taper'),'Projectile must have a pointed nose');
 assert.equal(a.drawPickup(mock,{type:'health',col:false},10,10),false);
 if(variant==='dev'){
  assert.match(html,/js\/preview-controls\.js\?v=beta136-compare/);
  assert.match(read(now+'/js/preview-controls.js'),/Beta 1\.36 გაუმჯობესებები/);
  assert.match(read(now+'/js/preview-controls.js'),/classList\.toggle\('pirali-menu136-on'/);
  assert.match(read(now+'/js/features/polish/beta134-experience.js'),/const enabled=\(\)=>true/);
  env.window.PiraliDevComparison={latestEnabled:()=>false};
  assert.equal(a.drawProjectile(mock,{vx:7,vy:0,fp:true,alive:true},10,10),false,'Dev OFF returns classic projectile');
  assert.equal(a.suppressHalo({type:'ammo'}),false,'Dev OFF returns old ring');
  assert.equal(a.drawPickup(mock,{type:'ammo',col:false},10,10),false,'Dev OFF returns prior emoji');
 }else{
  assert.equal(info.developerComparison,null);
  assert.ok(!html.includes('js/preview-controls.js'));
 }
}
console.log('PASS Beta 1.36: lower face-clear menu, solid cartridge pickups and directional bullet art; all prior gameplay, sound, health, rankings and achievements preserved');
