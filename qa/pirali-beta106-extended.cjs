const assert=require('node:assert/strict');
const {chromium,devices}=require('playwright');
(async()=>{
 const browser=await chromium.launch();
 let passed=0,failed=0;
 for(const mode of ['dev','play']){
  for(const mobile of [false,true]){
   const ctx=await browser.newContext(mobile?{...devices['Pixel 7']}:{viewport:{width:1280,height:768}});
   const page=await ctx.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route(/firebaseio\.com/,r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));
   await page.addInitScript(()=>localStorage.setItem('pirali_player_name','B106_StageQA'));
   try{
    await page.goto('https://piraligame.github.io/pirali/beta106-'+mode+'/?v=beta106-ci-extra',{waitUntil:'load'});
    const res=await page.evaluate(()=>{
      startGame();
      const records=[];
      const arrive=()=>{P.x=CHURCH_X;P.y=CHURCH_Y;update(1);};
      arrive();
      records.push({from:1,to:level});
      level=7;genWorld();running=true;
      if(boss?.alive)hitBoss(boss,boss.hp+50);
      const landlord=enemies.find(e=>e.etype==='landlord'&&e.alive);
      if(landlord)killEnemy(landlord);
      const sevenCanExit=!boss?.alive&&finalVictoryPending&&finalLordSpawned;
      arrive();records.push({from:7,to:level,sevenCanExit});
      level=8;genWorld();running=true;
      const second=window.PiraliDualGenerals?.second?.();
      if(boss?.alive)hitBoss(boss,boss.hp+50);
      if(second?.alive)hitBoss(second,second.hp+50);
      const eighthReady=window.PiraliDualGenerals?.defeated?.();
      arrive();records.push({from:8,to:level,eighthReady});
      level=9;genWorld();running=true;
      for(const e of enemies)e.alive=false;
      const nineReady=window.PiraliSiege?.clear?.();
      arrive();records.push({from:9,to:level,nineReady});
      level=10;genWorld();running=true;
      if(boss?.alive)hitBoss(boss,boss.hp+50);
      const coin=pickups.find(p=>p.type==='hell-coins');
      const taken=coin&&window.PiraliHellLoot?.collect?.(coin);
      arrive();records.push({from:10,to:level,taken});
      const stage11=window.PiraliEndless?.state?.();
      const translations={};
      for(const [lang,value] of Object.entries({ka:'გადი კარიბჭიდან',en:'Exit through the gate',ru:'Выйди через врата',zh:'穿过大门离开'})){
       window.PiraliLanguage.setLanguage(lang);
       translations[lang]=window.PiraliHellText('enter')===value;
      }
      return {records,stage11:stage11?.wave||0,translations};
    });
    assert.deepEqual(res.records.map(x=>x.to),[2,8,9,10,11]);
    assert(res.records[1].sevenCanExit&&res.records[2].eighthReady&&res.records[3].nineReady&&res.records[4].taken);
    assert.equal(res.stage11,1);
    assert(Object.values(res.translations).every(Boolean));
    assert.equal(errors.length,0,errors.join(' | '));
    passed++;console.log('PASS_STAGES',mode,mobile?'mobile':'desktop',JSON.stringify(res));
   }catch(e){failed++;console.error('FAIL_STAGES',mode,mobile?'mobile':'desktop',e.stack)}
   await ctx.close();
  }
 }
 await browser.close();console.log('EXTRA_QA_FINISHED',JSON.stringify({passed,failed}));
 if(failed)process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exit(1)});