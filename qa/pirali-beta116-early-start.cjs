/* PIRALI Beta 1.16: stage 1–5 safe opening tests.
   Run with: node qa/pirali-beta116-early-start.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
function fixtures(kind){
  const ys=kind==='crowded'?Array.from({length:12},(_,i)=>3570-i*48):
    kind==='clear'?[2700,2500,2250,2020]:
    [3530,3440,3350,3200,3000,2790,2560,2330,2100];
  return ys.map((y,i)=>({
    x:1000+(i%3-1)*35,y,r:12,alive:true,etype:i%2?'saber':'rifle',
    hp:2+i*.1,maxHp:2+i*.1,attack:.4,
    patrol:{cx:1000+(i%3-1)*35,cy:y,radius:40,t:0,spd:.2},
    state:'patrol',alertTimer:0,vx:0,vy:0,groupId:i
  }));
}
for(const variant of ['play','dev']){
  const dir=path.join(root,'beta116-'+variant);
  const file=path.join(dir,'js/features/stages/early-start-spacing.js');
  const source=fs.readFileSync(file,'utf8');
  const syntax=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  assert.equal(syntax.status,0,'syntax '+variant+' '+syntax.stderr);
  const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
  const oldWrapper=html.indexOf('js/features/stages/beta106-cover.js');
  const newWrapper=html.indexOf('js/features/stages/early-start-spacing.js');
  assert.ok(oldWrapper>=0&&newWrapper>oldWrapper,'safe spawn must wrap final world generation');
  for(let stage=1;stage<=11;stage++){
    for(const kind of ['normal','crowded','clear']){
      const context={
        level:stage,WW:2000,WH:3800,CHURCH_Y:120,
        P:{x:1000,y:3620,r:16},trees:[{x:1450,y:2900,r:25}],
        path:Array.from({length:20},(_,i)=>({x:1000+Math.sin(i*.5)*48,y:3700-i*180})),
        enemies:[],window:{},Math
      };
      context.genWorld=()=>{context.enemies=fixtures(kind);};
      vm.createContext(context);
      vm.runInContext(source,context,{filename:file,timeout:1000});
      context.genWorld();
      const es=context.enemies;
      const original=fixtures(kind);
      assert.equal(es.length,original.length,'no enemies removed on '+stage+' '+kind);
      const beforeClose=original.filter(e=>Math.hypot(e.x-1000,e.y-3620)<750).length;
      if(stage>=1&&stage<=5){
        assert.equal(context.window.PiraliEarlyStageSpacing.moved,beforeClose,'only close soldiers move');
        assert.equal(context.window.PiraliEarlyStageSpacing.afterCount,original.length,'same enemy count');
        assert.equal(context.window.PiraliEarlyStageSpacing.clearance,750,'minimum start clearance');
        for(const e of es){
          assert.ok(Math.hypot(e.x-1000,e.y-3620)>=750-1e-9,'no enemy in opening area');
          assert.equal(e.patrol.cx,e.x,'patrol X follows moved enemy');
          assert.equal(e.patrol.cy,e.y,'patrol Y follows moved enemy');
        }
        const repositioned=es.filter((e,i)=>e.y!==original[i].y||e.x!==original[i].x);
        for(let i=0;i<repositioned.length;i++){
          for(let j=i+1;j<repositioned.length;j++){
            assert.ok(Math.hypot(repositioned[i].x-repositioned[j].x,
              repositioned[i].y-repositioned[j].y)>=96,'new enemy positions separated');
          }
        }
      }else{
        assert.equal(context.window.PiraliEarlyStageSpacing,undefined,'later stages unaffected');
        for(let i=0;i<es.length;i++){
          assert.equal(es[i].x,original[i].x,'stage 6–11 X unchanged');
          assert.equal(es[i].y,original[i].y,'stage 6–11 Y unchanged');
        }
      }
      for(let i=0;i<es.length;i++){
        assert.equal(es[i].hp,original[i].hp,'enemy HP unchanged');
        assert.equal(es[i].attack,original[i].attack,'enemy damage unchanged');
        assert.equal(es[i].groupId,original[i].groupId,'enemy groups unchanged');
      }
    }
  }
  console.log('PASS Beta 1.16 stage 1–5 opening clearance, 6–11 untouched: '+variant);
}
console.log('PASS safe opening: both builds, normal/crowded/clear spawns, untouched AI balance');
