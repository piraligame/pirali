/* Beta 1.17.1 QA: stage-five placed ammo +10%, all other stages unchanged.
 * Run: node qa/pirali-beta1171-ammo.cjs */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
for(const mode of ['play','dev']){
  const root=path.resolve(__dirname,'../beta1171-'+mode);
  const modulePath=path.join(root,'js/features/loot/stage5-scattered-ammo.js');
  const src=fs.readFileSync(modulePath,'utf8');
  const syntax=spawnSync(process.execPath,['--check',modulePath],{encoding:'utf8'});
  assert.equal(syntax.status,0,mode+': invalid JS '+syntax.stderr);
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/BETA 1\.17\.1 TEST/,'new patch version on screen');
  assert.match(html,/PiraliGameVersion='1\.17\.1-beta\.1/,'new runtime version');
  assert.match(html,/js\/features\/loot\/stage5-scattered-ammo\.js\?v=beta1171-stage5-ammo10/,'script loaded with new cache identifier');
  assert.ok(html.lastIndexOf('js/features/loot/stage5-scattered-ammo.js')>html.lastIndexOf('js/features/loot/map-pickups.js'),'extra ammo applies after global map balance');
  assert.ok(html.includes('window.PiraliSeasonReleaseEnabled=false'),'never write live Firebase scores');
  for(const count of [0,4,7,9,10,14,20,31]){
    for(let stage=1;stage<=11;stage++){
      const w={};
      const scene={Math,window:w,level:stage,WW:2000,WH:3800,trees:[],path:[],
        pickups:[],genWorld(){
          this.pickups=[];
          for(let i=0;i<count;i++)this.pickups.push({x:560+(i%5)*140,y:650+(i%7)*320,bob:.1,col:false,type:'ammo'});
          this.pickups.push({x:1100,y:400,type:'health',col:false});
          this.pickups.push({x:1250,y:520,type:'medal',col:false});
          this.pickups.push({x:1300,y:600,type:'alpha-shells',col:false});
        }};
      // In the browser, top-level globals resolve as lexical identifiers.
      // These assignments are read inside vm's genWorld, so avoid "this".
      scene.genWorld=function(){
        scene.pickups=[];
        for(let i=0;i<count;i++)scene.pickups.push({x:560+(i%5)*140,y:650+(i%7)*320,bob:.1,col:false,type:'ammo'});
        scene.pickups.push({x:1100,y:400,type:'health',col:false});
        scene.pickups.push({x:1250,y:520,type:'medal',col:false});
        scene.pickups.push({x:1300,y:600,type:'alpha-shells',col:false});
        scene.path=Array.from({length:24},(_,i)=>({x:980+Math.sin(i*.5)*80,y:3680-i*140}));
      };
      vm.createContext(scene);
      vm.runInContext(src,scene,{filename:modulePath,timeout:700});
      scene.genWorld();
      const ammo=scene.pickups.filter(x=>x.type==='ammo');
      const extra=stage===5?Math.max(1,Math.round(count*.10)):0;
      assert.equal(ammo.length,count+extra,mode+' stage '+stage+' count='+count);
      assert.equal(scene.pickups.filter(x=>x.type==='health').length,1);
      assert.equal(scene.pickups.filter(x=>x.type==='medal').length,1);
      assert.equal(scene.pickups.filter(x=>x.type==='alpha-shells').length,1);
      assert.ok(scene.pickups.slice(count+3).every(x=>x.type==='ammo'),'new pickup type Mauser ammo');
      assert.ok(scene.pickups.slice(count+3).every(x=>x.amount===undefined),'ammo per box unchanged');
      for(const a of ammo){assert.ok(a.x>=40&&a.x<=1960&&a.y>=220&&a.y<=3660,'reachable map positions');}
      if(stage===5){
        assert.equal(w.PiraliStageFiveAmmoLast.before,count);
        assert.equal(w.PiraliStageFiveAmmoLast.added,extra);
        assert.equal(w.PiraliStageFiveAmmo.extraRate,.1);
      }else{
        assert.equal(w.PiraliStageFiveAmmoLast,undefined,'other stages must not be modified');
      }
    }
  }
  // No removal or duplication during every new stage generation.
  console.log('PASS stage 5 +10% scattered Mauser ammo, all 10 other stages unchanged: '+mode);
}
console.log('PASS PIRALI Beta 1.17.1 ammo hotfix.');
