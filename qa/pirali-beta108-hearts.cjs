const assert=require('node:assert/strict');
const {chromium,devices}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});let pass=0,fail=0;
 for(const mode of ['dev','play'])for(const mobile of [false,true]){
  const ctx=await browser.newContext(mobile?{...devices['Pixel 7']}:{viewport:{width:1280,height:850}});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route(url=>url.includes('firebaseio.com'),route=>route.fulfill({status:200,contentType:'application/json',body:'{}'}));
  await page.addInitScript(()=>localStorage.setItem('pirali_player_name','B108_CI_NO_FIREBASE'));
  try{
   const res=await page.goto('http://127.0.0.1:8765/beta108-'+mode+'/',{waitUntil:'load',timeout:45000});
   assert.equal(res.status(),200);
   await page.waitForFunction(()=>window.PiraliBigHearts&&window.PiraliCheckpoint&&window.PiraliEndless,{timeout:15000});
   const result=await page.evaluate(()=>{
    const hearts=()=>document.querySelectorAll('#hearts .heart').length;
    startGame();invincible=true;
    const fresh={hp:health,max:maxHealth,hearts:hearts(),flags:window.PiraliBigHearts.status()};
    level=7;genWorld();const g=boss;hitBoss(g,g.hp+30);
    const pk7=pickups.find(p=>p.type==='large-heart');
    const check7={exists:!!pk7,source:pk7?.sourceStage,initialMax:maxHealth,generalDead:!g.alive,lord:enemies.some(e=>e.etype==='landlord'&&e.alive)};
    hitBoss(g,500);
    check7.drops=pickups.filter(p=>p.type==='large-heart').length;
    P.x=pk7.x;P.y=pk7.y;P.vx=P.vy=0;update(1);
    check7.after={max:maxHealth,hp:health,hearts:hearts(),claimed:window.PiraliBigHearts.claimed(7)};
    window.PiraliBigHearts.collect({...pk7,col:false});
    check7.noDuplicate=maxHealth===6;
    const lord=enemies.find(e=>e.etype==='landlord'&&e.alive);
    killEnemy(lord);P.x=CHURCH_X;P.y=CHURCH_Y;P.vx=P.vy=0;update(1);
    const cp8=window.PiraliCheckpoint.get();
    const eight={level,save:cp8?.level,max:maxHealth,cpMax:cp8?.maxHealth,flag:cp8?.bigHearts?.seven};
    startGame(cp8);const resume={level,max:maxHealth,hp:health,flag:window.PiraliBigHearts.claimed(7),hearts:hearts()};
    level=9;genWorld();const nine={max:maxHealth,hearts:hearts()};
    level=10;genWorld();hitBoss(boss,boss.hp+30);
    const pk10=pickups.find(p=>p.type==='large-heart'),coin=pickups.find(p=>p.type==='hell-coins');
    const ten={big:!!pk10,coins:!!coin,distinct:pk10!==coin,source:pk10?.sourceStage,preMax:maxHealth};
    P.x=pk10.x;P.y=pk10.y;P.vx=P.vy=0;update(1);
    ten.after={max:maxHealth,hp:health,hearts:hearts(),claimed:window.PiraliBigHearts.claimed(10)};
    P.x=coin.x;P.y=coin.y;P.vx=P.vy=0;update(1);
    ten.coinsClaimed=window.PiraliHellLoot.rewardCollected();
    P.x=CHURCH_X;P.y=CHURCH_Y;P.vx=P.vy=0;update(1);
    const cp11=window.PiraliCheckpoint.get();
    const eleven={level,max:maxHealth,hearts:hearts(),save:cp11?.level,cpMax:cp11?.maxHealth,flags:cp11?.bigHearts};
    startGame(cp11);
    const resume11={level,max:maxHealth,hearts:hearts(),flags:window.PiraliBigHearts.status()};
    startGame();
    const restarted={max:maxHealth,health,hearts:hearts(),flags:window.PiraliBigHearts.status()};
    return {fresh,check7,eight,resume,nine,ten,eleven,resume11,restarted};
   });
   assert.equal(result.fresh.max,5);assert.equal(result.fresh.hearts,5);
   assert(result.check7.exists&&result.check7.lord&&result.check7.generalDead);assert.equal(result.check7.drops,1);
   assert.deepEqual(result.check7.after,{max:6,hp:6,hearts:6,claimed:true});
   assert(result.check7.noDuplicate);
   assert.equal(result.eight.level,8);assert.equal(result.eight.save,8);assert.equal(result.eight.cpMax,6);assert(result.eight.flag);
   assert.equal(result.resume.max,6);assert(result.resume.flag);assert.equal(result.nine.max,6);
   assert(result.ten.big&&result.ten.coins&&result.ten.distinct);assert.equal(result.ten.preMax,6);
   assert.deepEqual(result.ten.after,{max:7,hp:7,hearts:7,claimed:true});
   assert(result.ten.coinsClaimed);assert.equal(result.eleven.level,11);assert.equal(result.eleven.cpMax,7);
   assert(result.eleven.flags.seven&&result.eleven.flags.ten);
   assert.equal(result.resume11.max,7);assert.equal(result.resume11.hearts,7);
   assert.deepEqual(result.restarted,{max:5,health:5,hearts:5,flags:{seven:false,ten:false}});
   assert.equal(errors.length,0,errors.join(' | '));
   console.log('PASS BETA108 '+mode+' '+(mobile?'mobile':'desktop')+' '+JSON.stringify(result));pass++;
  }catch(e){fail++;console.error('FAIL BETA108 '+mode+' '+(mobile?'mobile':'desktop')+' '+e.stack);}
  await ctx.close();
 }
 await browser.close();console.log('BETA108 QA:',JSON.stringify({passed:pass,failed:fail}));if(fail)process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exit(1)});
