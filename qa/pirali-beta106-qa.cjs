const assert=require('node:assert/strict');
const {chromium,devices}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 let count=0,failures=0;
 for(const mode of ['dev','play']){
  for(const mobile of [false,true]){
   const ctx=await browser.newContext(mobile?{...devices['Pixel 7']}:{viewport:{width:1320,height:850}});
   const page=await ctx.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   let put=0,payload=null;
   await page.route(/firebaseio\.com/,async route=>{
    const req=route.request();
    if(req.method()==='PUT'){
     put++;payload=JSON.parse(req.postData());
     return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(payload)});
    }
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(payload?{test:payload}:{})});
   });
   await page.addInitScript(()=>localStorage.setItem('pirali_player_name','B106_AUTOMATED_QA'));
   try{
    const response=await page.goto('https://piraligame.github.io/pirali/beta106-'+mode+'/?v=beta106-ci-test',{waitUntil:'load',timeout:60000});
    assert.equal(response.status(),200);
    await page.waitForFunction(()=>window.PiraliEndless&&window.PiraliGurianHome&&window.PiraliStageScoring&&window.PiraliLanguage,{timeout:15000});
    const result=await page.evaluate(()=>{
      startGame();
      const initial=level;
      P.x=CHURCH_X;P.y=CHURCH_Y;update(1);
      const immediate={initial,nextLevel:level,playerY:P.y};
      level=6;genWorld();
      const sixth={soldiers:enemies.filter(e=>e.alive).length,
        cover:window.PiraliStageSixCover,attack:window.PiraliStageTuning.attack(6),
        firstHP:enemies[0]?.hp};
      const e=enemies[0];
      e.x=P.x+230;e.y=P.y;e.vx=e.vy=0;e.state='patrol';
      trees=trees.filter(t=>Math.hypot(t.x-e.x,t.y-e.y)>300);
      update(1);
      const pursuit={state:e.state,vx:e.vx,alert:e.alertTimer};
      level=9;genWorld();
      const siege={count:enemies.filter(e=>e.alive).length,attack:window.PiraliStageTuning.attack(9)};
      level=10;genWorld();
      const gate=window.PiraliHellText('enter');
      level=11;score=5000;running=true;P.dead=false;paused=false;invincible=true;
      window.PiraliStageScoring.beginEndless();genWorld();window.PiraliStats.stageReady(11);
      const history=[];
      for(let expected=1;expected<=5;expected++){
       let guard=0;
       while(window.PiraliEndless.state().spawned<15&&guard++<200)window.PiraliEndless.tick(6);
       const st=window.PiraliEndless.state();
       const amount=Number(!!boss?.alive)+Number(!!window.PiraliDualGenerals?.second?.()?.alive);
       const landlord=enemies.filter(e=>e.alive&&e.etype==='landlord').length;
       const before=score,regular=enemies.filter(e=>e.alive).length;
       for(const enemy of enemies.filter(e=>e.alive))killEnemy(enemy);
       if(boss?.alive)hitBoss(boss,boss.hp+50);
       const second=window.PiraliDualGenerals?.second?.();
       if(second?.alive)hitBoss(second,second.hp+50);
       window.PiraliEndless.tick(1);
       const after=window.PiraliEndless.state();
       history.push({wave:expected,spawned:st.spawned,remaining:st.remaining,
        generalCount:amount,regular,landlord,
        award:score-before,score,waveAfter:after.wave,cleared:after.cleared});
      }
      const beforeHome={...window.PiraliEndless.state(),running,screen:document.getElementById('screen').className};
      P.x=CHURCH_X;P.y=CHURCH_Y+65;
      const entered=window.PiraliEndless.enterHouse();
      const lang={};
      for(const l of ['ka','en','ru','zh']){
       window.PiraliLanguage.setLanguage(l);
       lang[l]={title:document.getElementById('screen').querySelectorAll('h1')[1]?.textContent,
        flag:!!document.querySelector('.pirali-georgia-flag svg')};
      }
      const combined=lbBest([
       {name:'qa',score:6900,level:10,win:false},
       {name:'qa',score:7000,level:11,win:true,naganCleared:true,endlessKills:75}
      ]);
      const negative=lbBest([{name:'qa',score:7000,level:11,win:false,naganCleared:true,endlessKills:75}]);
      return {immediate,sixth,pursuit,siege,gate,history,beforeHome,entered,lang,
       score,bonus:window.PiraliStageScoring.bonusEarned(),
       completed:window.PiraliEndless.state().completed,
       crown:combined[0]?.crownCleared,negativeCrown:negative[0]?.crownCleared,
       valid7k:combined[0]?.score===7000,cssHouse:!!window.PiraliGurianHome,
       mode:{dev:!!window.PiraliVisualPreviewReadonly,online:window.PiraliSeasonReleaseEnabled}};
    });
    await page.waitForTimeout(850);
    assert.equal(result.immediate.nextLevel,2);
    assert(result.sixth.cover.added>0&&result.sixth.cover.added>=result.sixth.cover.goal*.8);
    assert(result.sixth.soldiers<=27);
    assert(result.pursuit.state==='attack');
    assert.equal(result.siege.count,15);
    assert.equal(result.gate,'გადი კარიბჭიდან');
    assert.deepEqual(result.history.map(x=>x.award),[300,300,400,400,600]);
    assert.deepEqual(result.history.map(x=>x.generalCount),[0,0,0,1,2]);
    assert(result.history.every(x=>x.spawned===15&&x.landlord===0&&x.regular+x.generalCount===15));
    assert(result.beforeHome.cleared&&!result.beforeHome.completed&&result.beforeHome.running);
    assert(result.entered&&result.completed&&result.bonus===2000&&result.score===7000);
    assert(Object.values(result.lang).every(x=>x.title?.length>3&&x.flag));
    assert(result.crown&&!result.negativeCrown&&result.valid7k);
    assert.equal(put,mode==='dev'?0:1);
    if(mode==='play')assert(payload?.win===true&&payload?.naganCleared===true&&payload?.endlessKills===75);
    assert.equal(errors.length,0,errors.join(' | '));
    count++;
    console.log('PASS',mode,mobile?'mobile':'desktop',JSON.stringify({sixth:result.sixth,siege:result.siege,awards:result.history.map(x=>x.award),generals:result.history.map(x=>x.generalCount),score:result.score,crown:result.crown,put,errors}));
   }catch(e){failures++;console.error('FAIL',mode,mobile?'mobile':'desktop',e.stack)}
   await ctx.close();
  }
 }
 await browser.close();
 console.log('QA_FINISHED',JSON.stringify({passed:count,failed:failures}));
 if(failures)process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exit(1)});