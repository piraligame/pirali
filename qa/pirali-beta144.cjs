'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function files(d){return fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(d+'/'+x.name):[d+'/'+x.name]);}
for(const v of ['play','dev']){
 const old='beta143-'+v,now='beta144-'+v;
 const previous=files(old).map(x=>x.slice(old.length+1)).sort(),current=files(now).map(x=>x.slice(now.length+1)).sort();
 assert.deepEqual(current,[...previous,'js/features/loot/preserve144.js','js/features/bosses/tactics144.js'].sort(),'Preserve old assets');
 const planned=new Set(['index.html','js/menu.js','TEST_INFO.json','js/runtime/update.js','js/runtime/world.js','js/runtime/render.js',
  'js/config/alpha-gear-v2.js','js/features/evolution/game139.js','js/features/endless/waves.js','js/features/stages/08-dual-generals.js']);
 if(v==='dev')planned.add('js/preview-controls.js');
 for(const file of previous){
  const a=read(old+'/'+file),b=read(now+'/'+file);
  if(planned.has(file))assert.notEqual(a,b,'Expected change '+file);
  else assert.equal(a,b,'Previous mechanics, scoring, UI untouched '+file);
  if(file.endsWith('.js'))new vm.Script(b,{filename:now+'/'+file});
 }
 const meta=JSON.parse(read(now+'/TEST_INFO.json')),html=read(now+'/index.html');
 assert.equal(meta.features144.length,6);assert.equal(meta.update144.bossHealthMultiplier,1.2);
 assert.equal(meta.update144.heartsPreservedAtFull,true);assert.equal(meta.update144.shieldPreservedAtFull,true);
 assert.equal(meta.update144.autoQuest,true);assert.equal(meta.update144.captiveRescue,true);
 assert.equal(meta.evolution140.sneakRemoved,true);
 assert.equal(meta.premiumFullRoute.pointsMultiplier,.2);assert.equal(meta.maxTotalPoints,7000);
 assert.equal(meta.premiumFullRoute.startingHearts,7);
 assert.equal(meta.mobileControlsPreserved,true);
 assert.equal(meta.androidBuilt,false);assert.equal(meta.aabBuilt,false);
 assert.ok(html.includes('1.44-classic.'+v));
 assert.ok(html.includes('js/features/loot/preserve144.js?v=144-preserve-full'));
 assert.ok(html.includes('js/features/bosses/tactics144.js?v=144-boss-ai'));
 const pickup=read(now+'/js/features/loot/preserve144.js'),
  bosses=read(now+'/js/features/bosses/tactics144.js'),
  update=read(now+'/js/runtime/update.js'),world=read(now+'/js/runtime/world.js'),
  stage8=read(now+'/js/features/stages/08-dual-generals.js'),
  waves=read(now+'/js/features/endless/waves.js'),quest=read(now+'/js/features/evolution/game139.js'),
  render=read(now+'/js/runtime/render.js');
 assert.match(update,/PiraliLoot144\?\.preserve\(pk\)/);
 assert.match(update,/PiraliBoss144\?\.aim\(boss,P,frame\)/);
 assert.match(world,/finalBossHp\*\(level===10\?3:1\)\*\.85\*1\.20/);
 assert.match(stage8,/generalHp\(8\)\*1\.20/);
 assert.match(waves,/power\(\)\*\.90\*\.95\*\.90\*1\.20/);
 assert.match(quest,/if\(goal&&!goal\.done&&Math\.hypot\(P\.x-goal\.x,P\.y-goal\.y\)<49\)interact/);
 assert.match(quest,/goal\.escape\+=dt/);
 assert.match(quest,/level===2&&\(!goal\.done/);
 assert.doesNotMatch(quest,/interactButton/,'No manual button');
 assert.match(render,/A glowing GOLDEN half-circle shield/);
 assert.match(render,/ctx\.arc\(px,py,spread,Math\.PI\*\.98,Math\.PI\*1\.98\)/);
 assert.match(bosses,/const HP=1\.20/);
 assert.doesNotMatch(bosses,/score\s*[\+\-]=|lbSave/);
 const fake={window:{},health:5,maxHealth:5,ammo:10,maxAmmo:10,inventory:{laurelShield:1}};
 fake.window.PiraliAlphaGear={status:()=>({owned:true,shells:16})};
 vm.runInNewContext(pickup,fake);
 for(const type of ['health','ammo','herb','alpha-shells'])
  assert.equal(fake.window.PiraliLoot144.preserve({type,col:false}),true,'Keep full pickup '+type);
 fake.health=4;fake.ammo=9;fake.inventory.laurelShield=0;
 fake.window.PiraliAlphaGear.status=()=>({owned:true,shells:15});
 for(const type of ['health','ammo','herb','alpha-shells'])
  assert.equal(fake.window.PiraliLoot144.preserve({type,col:false}),false,'Allow needed pickup '+type);
 const context={window:{},Math};vm.runInNewContext(bosses,context);
 const ai=context.window.PiraliBoss144;
 const target={x:100,y:30,vx:2,vy:1},b={x:0,y:0};
 const angle=ai.aim(b,target,120),movement=ai.move(b,target,120,angle);
 assert.ok(Number.isFinite(angle)&&Number.isFinite(movement));
 assert.ok(Math.abs(angle-Math.atan2(30,100))>0,'Boss leads a moving target');
 assert.notEqual(angle,movement,'Boss approaches on a flank');
 if(v==='dev')assert.match(read(now+'/js/preview-controls.js'),/PIRALI BETA 1\.44 DEV/);
 else assert.equal(meta.developerComparison,null);
}
console.log('PASS Beta 1.44: full-loot preservation, 20% bosses, smarter AI, auto letters, moving captive and glowing gold shield; old scoring unchanged');
