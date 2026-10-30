'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function files(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(dir+'/'+e.name):[dir+'/'+e.name]);}
for(const variant of ['play','dev']){
 const old='beta149-'+variant,now='beta150-'+variant;
 const oldFiles=files(old).map(p=>p.slice(old.length+1)).sort();
 const newFiles=files(now).map(p=>p.slice(now.length+1)).sort();
 assert.deepEqual(newFiles,oldFiles,'All Beta 1.49 assets retained '+variant);
 const changed=new Set(['index.html','js/menu.js','js/runtime/render.js','js/features/stages/beta105-balance.js','TEST_INFO.json','RELEASE_INFO.json']);
 for(const file of oldFiles){
  const before=fs.readFileSync(path.join(root,old,file));
  const after=fs.readFileSync(path.join(root,now,file));
  if(changed.has(file))assert.notDeepEqual(after,before,'Expected change '+file);
  else assert.deepEqual(after,before,'Unchanged asset/logic '+file);
  if(file.endsWith('.js'))new vm.Script(after.toString('utf8'),{filename:now+'/'+file});
 }
 const render=read(now+'/js/runtime/render.js');
 assert.match(render,/if\(inventory\.laurelShield===1\)drawEquippedArmorLine\(ctx,sx\(P\.x\),sy\(P\.y\)-42\)/);
 assert.match(render,/function drawEquippedArmorLine\(context,x,y\)/);
 assert.match(render,/strokeStyle='#45e878'/);
 assert.match(render,/lineWidth=2/);
 assert.doesNotMatch(render,/drawEquippedShieldEmblem|glowing GOLDEN half-circle/);
 const stage=read(now+'/js/features/stages/beta105-balance.js');
 assert.match(stage,/4:Object\.freeze\(\{count:\.90,hp:\.95\*\.90\*\.90,attack:\.95\*\.90\*\.90\}\)/);
 const ctx={window:{},level:4,enemies:Array.from({length:20},(_,i)=>({id:i,hp:10,maxHp:10})),
    boss:null,genWorld(){return 'ok';}};
 vm.createContext(ctx);
 vm.runInContext(stage,ctx);
 assert.equal(vm.runInContext('genWorld()',ctx),'ok');
 assert.equal(ctx.enemies.length,18,'Stage 4 is 10% less dense');
 assert.equal(ctx.enemies[0].id,0);
 assert.equal(ctx.enemies[17].id,19,'Keep enemies along the entire route');
 assert.equal(ctx.enemies[0].hp,Number((10*.95*.90*.90).toFixed(3)));
 assert.equal(ctx.window.PiraliStageTuning.attack(4),.95*.90*.90);
 assert.equal(ctx.window.PiraliStageFourTuning.countMultiplier,.9);
 ctx.level=3;
 ctx.enemies=Array.from({length:20},(_,i)=>({id:i,hp:10,maxHp:10}));
 vm.runInContext('genWorld()',ctx);
 assert.equal(ctx.enemies.length,20,'Other stages preserve their original count');
 assert.equal(ctx.window.PiraliStageTuning.attack(3),.95*.90);
 const html=read(now+'/index.html');
 assert.match(html,new RegExp('1\\.50-classic\\.'+variant));
 assert.match(html,/render\.js\?v=beta150-green-armor-line/);
 assert.match(html,/beta105-balance\.js\?v=beta150-stage4-balance/);
 assert.match(read(now+'/js/menu.js'),/BETA 1\.50/);
 const info=JSON.parse(read(now+'/TEST_INFO.json'));
 assert.equal(info.armor150.widthPx,20);
 assert.equal(info.stage4_150.countMultiplier,.9);
 assert.equal(info.camera148.playerScreenY,.7);
 const rel=JSON.parse(read(now+'/RELEASE_INFO.json'));
 assert.equal(rel.version,'1.50-beta.1'+(variant==='dev'?'-dev':''));
 assert.equal(rel.releaseReady,false);
 assert.equal(rel.androidBuilt,false);
 assert.equal(rel.aabBuilt,false);
 assert.equal(rel.firebaseWritesBlocked,true);
}
console.log('PASS Beta 1.50: 20px green bar, 1-hit shield unchanged, stage4 -10% density/HP/attack, all other assets identical.');
