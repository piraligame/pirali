'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(e,data)=>{if(e){res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data)});
});
async function run(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const variant of ['play','dev']){
   const context=await browser.newContext({viewport:{width:360,height:760},isMobile:true,hasTouch:true,deviceScaleFactor:2});
   const page=await context.newPage(),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route(/firebaseio\.com/,r=>{requests.push(r.request().method());r.abort()});
   const r=await page.goto('http://127.0.0.1:'+server.address().port+'/beta145-'+variant+'/index.html',{waitUntil:'load',timeout:45000});
   assert.equal(r.status(),200);
   assert.equal(await page.evaluate(()=>window.PiraliGameVersion),'1.45-classic.'+variant);
   // Approved cinematic menu layout: full translated text outside the card,
   // language options at bottom and saved player label after stats.
   const menuGeometry=await page.evaluate(()=>{
     const story=document.querySelector('#screen > .menu-story-lore');
     const panel=document.querySelector('#screen .main-menu-panel');
     const picker=panel.querySelector('.menu-language');
     const actions=panel.querySelector('.menu-actions');
     const player=actions.querySelector('.pirali-player-name');
     const stats=actions.querySelector('.menu-stats');
     return {story:story?.getBoundingClientRect().toJSON(),panel:panel?.getBoundingClientRect().toJSON(),
       picker:picker?.getBoundingClientRect().toJSON(),actions:actions?.getBoundingClientRect().toJSON(),
       hasStory:!!story,storyText:story?.textContent||'',inPanel:!!panel?.querySelector('.sbox'),
       playerAfterStats:player?.previousElementSibling===stats,
       languagesAfterActions:picker?.previousElementSibling===actions,
       background:getComputedStyle(document.getElementById('screen')).backgroundImage};
   });
   assert.equal(menuGeometry.hasStory,true,'The full story is a standalone background element');
   assert.match(menuGeometry.storyText,/როცა სამართალი ხმას კარგავს/);
   assert.match(menuGeometry.storyText,/მისი გზა სიბნელიდან იწყება/);
   assert.equal(menuGeometry.inPanel,false,'No long story box inside menu card');
   assert.equal(menuGeometry.playerAfterStats,true,'Player name must directly follow My Statistics');
   assert.equal(menuGeometry.languagesAfterActions,true,'Languages should follow the action stack');
   assert.match(menuGeometry.background,/menu-background\.jpg/);
   assert.ok(menuGeometry.story.x>=120,'Expanded story stays on upper-right sky '+JSON.stringify(menuGeometry));
   assert.ok(menuGeometry.panel.y>menuGeometry.story.y+75,'Portrait remains visible above menu '+JSON.stringify(menuGeometry));
   assert.ok(menuGeometry.panel.y>=240&&menuGeometry.panel.y<=460,'Expanded menu stays below Simona eyes and above bottom controls '+JSON.stringify(menuGeometry));
   const scrollData=await page.evaluate(()=>({scrollHeight:document.getElementById('screen').scrollHeight,
     clientHeight:document.getElementById('screen').clientHeight,
     classOn:document.getElementById('screen').classList.contains('pirali-menu136-on')}));
   assert.equal(scrollData.classOn,true);
   const languageFit=await page.evaluate(()=>({bottom:document.querySelector('#screen .menu-language').getBoundingClientRect().bottom,viewport:innerHeight}));
   assert.ok(languageFit.bottom<=languageFit.viewport+2,'Language strip must show without scrolling '+JSON.stringify(languageFit));
    const menuTextFit=await page.evaluate(()=>{
      const story=document.querySelector('#screen > .menu-story-lore'),p=story.querySelector('p'),
        panel=document.querySelector('#screen .main-menu-panel'),
        screen=document.getElementById('screen');
      const s=story.getBoundingClientRect(),m=panel.getBoundingClientRect();
      return {font:parseFloat(getComputedStyle(p).fontSize),top:s.top,bottom:s.bottom,
        panelTop:m.top,panelBottom:m.bottom,viewport:innerHeight,
        screenScroll:screen.scrollHeight,screenHeight:screen.clientHeight};
    });
    assert.ok(menuTextFit.font>=10,'Expanded story should be comfortably legible '+JSON.stringify(menuTextFit));
    assert.ok(menuTextFit.bottom<menuTextFit.panelTop,'Story should not overlap the menu panel '+JSON.stringify(menuTextFit));
    assert.ok(menuTextFit.panelBottom<=menuTextFit.viewport+2,'No scrolling needed for enlarged menu '+JSON.stringify(menuTextFit));
   const cartridge=await page.evaluate(()=>{
     const art=window.PiraliBulletArt136,canvas=document.createElement('canvas');
     canvas.width=70;canvas.height=50;const ctx=canvas.getContext('2d');
     art.drawProjectile(ctx,{fp:true,alive:true,vx:9,vy:0},30,20);
     const rgba=ctx.getImageData(0,0,70,50).data;
     let minX=70,maxX=-1,minY=50,maxY=-1;
     for(let y=0;y<50;y++)for(let x=0;x<70;x++){
       if(rgba[(y*70+x)*4+3]>50){minX=Math.min(x,minX);maxX=Math.max(x,maxX);minY=Math.min(y,minY);maxY=Math.max(y,maxY);}
     }
     return {w:maxX-minX+1,h:maxY-minY+1,ammo:art.suppressHalo({type:'ammo'}),heart:art.suppressHalo({type:'health'}),shell:art.suppressHalo({type:'alpha-shells'})};
   });
   assert.ok(cartridge.w>=12&&cartridge.w>cartridge.h*2,'Flying bullets must look elongated '+JSON.stringify(cartridge));
   assert.equal(cartridge.ammo,true,'Ammo pickups have no ring');
   assert.equal(cartridge.shell,true,'Shells have no ring');
   assert.equal(cartridge.heart,false,'Health pickup halo remains unchanged');

   assert.ok(menuGeometry.picker.y>menuGeometry.actions.y,'Languages moved below actions');
   await page.evaluate(()=>{
     localStorage.setItem('pirali_player_name','Dato');
     document.dispatchEvent(new Event('pirali:player-registered'));
   });
   const playerName=page.locator('#screen .menu-actions .pirali-player-name');
   assert.match(await playerName.innerText(),/Dato/,'Saved player name appears immediately below My Statistics');
   for(const [language,word] of [['en','When justice loses'],['ru','Когда правосудие'],['zh','当正义失去声音'],['ka','როცა სამართალი']]){
     await page.evaluate(code=>{window.PiraliLanguage.setLanguage(code);window.PiraliMenu139.fit();},language);
     assert.ok((await page.locator('#screen > .menu-story-lore').innerText()).includes(word),
      'Story translated with '+language);
     assert.equal(await page.locator('.menu-language-option.is-active').getAttribute('data-pirali-lang'),language);
     const box=await page.evaluate(()=>{
       window.PiraliMenu139.fit();
       const language=document.querySelector('#screen .menu-language').getBoundingClientRect(),
         panel=document.querySelector('#screen .main-menu-panel').getBoundingClientRect();
       return {bottom:language.bottom,screen:innerHeight,top:panel.top};
     });
     assert.ok(box.bottom<=box.screen+2,'Languages without scroll in '+language+' '+JSON.stringify(box));
     assert.ok(box.top>=235&&box.top<=470,'Expanded menu beneath the hero portrait in '+language+' '+JSON.stringify(box));
   }
   const newCombat=await page.evaluate(()=>{
     const api=window.PiraliEnemyRange137,rules=api.rules;
     const player={x:camX+130,y:camY+190},visibleEnemy={x:camX+75,y:camY+190,r:12};
     const clear=api.mayFire(visibleEnemy,player,[],315);
     const treeBlocked=api.mayFire(visibleEnemy,player,[{x:camX+102,y:camY+190,r:20}],315);
     const tooFar=api.mayFire(visibleEnemy,{x:camX+800,y:camY+190},[],315);
     const deadBullet={fp:false,alive:true,vx:4,vy:0,maxTravel137:40};
     const early=api.expired(deadBullet,8),late=api.expired(deadBullet,3);
     const draw=fp=>{
       const cv=document.createElement('canvas');cv.width=90;cv.height=90;
       const ctx=cv.getContext('2d');
       window.PiraliBulletArt136.drawProjectile(ctx,{fp,alive:true,vx:8,vy:0},45,45);
       const pixels=ctx.getImageData(0,0,90,90).data;
       let minx=90,maxx=0,miny=90,maxy=0;
       for(let y=0;y<90;y++)for(let x=0;x<90;x++){
         if(pixels[(y*90+x)*4+3]>128){minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);}
       }
       return {w:maxx-minx+1,h:maxy-miny+1};
     };
     return {rules,clear,treeBlocked,tooFar,early,late,playerArt:draw(true),enemyArt:draw(false)};
   });
   assert.equal(newCombat.rules.sightAcquire,455);
   assert.equal(newCombat.rules.rifleFire,315);
   assert.equal(newCombat.rules.officerFire,365);
   assert.equal(newCombat.clear,true);
   assert.equal(newCombat.treeBlocked,false);
   assert.equal(newCombat.tooFar,false);
   assert.equal(newCombat.early,false);
   assert.equal(newCombat.late,true);
   assert.ok(newCombat.enemyArt.w>=newCombat.playerArt.w*1.8,'Enemy projectile visibly doubled '+JSON.stringify(newCombat));
   assert.ok(newCombat.enemyArt.h>=newCombat.playerArt.h*1.8,'Enemy projectile twice as thick '+JSON.stringify(newCombat));
   const polish=await page.evaluate(()=>{
     const fx=PiraliFX;
     fx.reset();fx.shoot(800,800,0);fx.hit(810,810,false);
     for(let i=0;i<85;i++)fx.hit(810,810,true);
     const snapshot=fx.debug();
     const ctx=document.getElementById('gameCanvas').getContext('2d');
     fx.draw(ctx,x=>x-camX,y=>y-camY,W,H);
     window.PiraliPickupVisibility.draw(ctx,{type:'health',col:false,bob:0},90,90,16);
     window.PiraliPickupVisibility.draw(ctx,{type:'alpha-shells',col:false,bob:1},120,90,16);
     window.PiraliBoss126.drawSecondaryWarning(ctx,x=>x,y=>y,{alive:true,x:100,y:100,sT:7});
     return {count:snapshot.count,max:snapshot.max,types:snapshot.types,roles:{...window.PiraliTacticalAI.roles}};
   });
   assert.ok(polish.count<=28,'FX remains mobile capped');
   assert.ok(polish.types.includes('impact-arc'),'New impact visual loads');
   assert.equal(await page.locator('#pirali-time-hud').count(),1,'Timer exists');
   assert.equal(await page.locator('#screen .pirali139-collection-link').count(),1);
   await page.locator('#screen .pirali139-collection-link').click();
   assert.equal(await page.locator('#pirali139-collection .pirali139-letter').count(),11);
   await page.locator('#pirali139-collection .pirali139-header button').click();
   assert.equal(polish.roles.saber,'direct-pressure');
   assert.equal(polish.roles.rifle,'keep-distance');
   assert.equal(polish.roles.officer,'stable-flank');
   const order=await page.evaluate(()=>[...document.querySelectorAll('#screen .menu-actions>button')].map(x=>x.className));
   const map=order.findIndex(x=>x.split(/\s+/).includes('story-map-open')),full=order.findIndex(x=>x.split(/\s+/).includes('pirali-full-menu')),records=order.findIndex(x=>x.split(/\s+/).includes('menu-records'));
   assert.ok(map>=0&&map<full&&full<records,'Premium action must be between campaign map and leaderboard '+order);
   const community=page.locator('#screen .pirali-community-menu');
   assert.equal(await community.getAttribute('href'),'https://www.facebook.com/share/1LfEa8WSfU/');
   assert.equal(await community.getAttribute('target'),'_blank');
   assert.match(await community.innerText(),/გეიმერების საზოგადოება/);
   assert.equal(await community.locator('img').evaluate(i=>i.complete&&i.naturalWidth>0),true,'Original community emblem loads');
   const menuClasses=await page.evaluate(()=>[...document.querySelector('#screen .menu-actions').children].map(e=>e.className));
   const fullAt=menuClasses.findIndex(x=>x.split(/\s+/).includes('pirali-full-menu')),communityAt=menuClasses.indexOf('pirali-community-menu'),collectionAt=menuClasses.indexOf('pirali139-collection-link'),recordsAt=menuClasses.indexOf('menu-records');
   assert.ok(fullAt>=0&&communityAt===fullAt+1&&collectionAt===communityAt+1&&recordsAt===collectionAt+1,'Full Route -> Community -> Collection -> Leaderboard '+menuClasses);
   const cb=await community.boundingBox(),rb=await page.locator('#screen .menu-records').boundingBox();
   assert.ok(Math.abs(cb.width-rb.width)<=2,'Community button same width as leaderboard');
   const button=page.locator('#screen .pirali-full-menu');assert.match(await button.textContent(),/🔒/);
   await button.click();
   assert.equal(await page.locator('.pirali-full-pin').count(),0,'Locked route cannot choose stage');
   assert.match(await page.locator('#pirali-full-overlay').innerText(),/10/);
   assert.doesNotMatch(await page.locator('#pirali-full-overlay').innerText(),/₾|0\.50|0,50|Billing|გადახდა/);
   await page.locator('.pirali-full-back').click();
   const noBypass=await page.evaluate(()=>{localStorage.setItem('pirali_beta129_demo_fullpath_play','yes');return window.PiraliFullPath.unlocked()});
   assert.equal(noBypass,false,'Old premium demo flag no longer gives access');
   await page.evaluate(()=>{
     localStorage.setItem('pirali_player_name','Dato');
     const key=window.PiraliVisualPreviewReadonly?'pirali_personal_stats_beta_1_0_s1_dev_preview':'pirali_personal_stats_beta_1_0_s1_rc';
     const profile={runs:1,wins:1,defeats:0,kills:14,bestScore:800,bestRunMs:99000,stageBestMs:Array(11).fill(null),achievements:{victory:1},maxReachedStage:11};
     localStorage.setItem(key,JSON.stringify({version:1,profiles:{dato:profile}}));
     window.PiraliFullPath.refresh();
   });
   assert.equal(await page.evaluate(()=>window.PiraliFullPath.unlocked()),true);
   await button.click();
   assert.equal(await page.locator('.pirali-full-pin').count(),11);
   await page.locator('.pirali-full-pin[data-stage="10"]').scrollIntoViewIfNeeded();
   await page.locator('.pirali-full-pin[data-stage="10"]').click();
   const started=await page.evaluate(()=>({level,health,maxHealth,gear:window.PiraliAlphaGear.status(),active:window.PiraliFullPath.isActive()}));
   assert.equal(started.level,10);assert.equal(started.health,7);assert.equal(started.maxHealth,7);
   assert.equal(started.gear.owned,true);assert.equal(started.gear.selected,'shotgun');assert.equal(started.active,true);
   const joystick=await page.evaluate(()=>{
     const z=document.getElementById('joy-zone'),rect=z.getBoundingClientRect();
     const start={identifier:301,clientX:Math.round(rect.left+rect.width*.48),clientY:Math.round(rect.top+rect.height*.56)};
     function evt(type,touches){
       const points=touches.map(t=>new Touch({identifier:t.identifier,target:z,clientX:t.clientX,clientY:t.clientY,
         pageX:t.clientX,pageY:t.clientY,screenX:t.clientX,screenY:t.clientY}));
       z.dispatchEvent(new TouchEvent(type,{changedTouches:points,touches:type==='touchend'||type==='touchcancel'?[]:points,bubbles:true,cancelable:true}));
       return window.PiraliJoy138.debug();
     }
     const original=evt('touchstart',[start]);
     const sensitive=evt('touchmove',[{...start,clientX:start.clientX+4}]);
     const huge=evt('touchmove',[{...start,clientX:start.clientX+330,clientY:start.clientY-260}]);
     const base=document.getElementById('joy-base').getBoundingClientRect();
     const knob=document.getElementById('joy-knob').getBoundingClientRect();
     const physical={baseX:base.x+base.width/2,baseY:base.y+base.height/2,knobX:knob.x+knob.width/2,knobY:knob.y+knob.height/2};
     const release=evt('touchend',[start]);
     return {zone:{x:rect.x,y:rect.y,w:rect.width,h:rect.height},original,sensitive,huge,physical,release,
       screen:{width:innerWidth,height:innerHeight}};
   });
   assert.ok(joystick.zone.y>=joystick.screen.height*.48,'Touch input only lower-left '+JSON.stringify(joystick));
   assert.ok(joystick.zone.w<=joystick.screen.width*.49,'Joystick cannot cover the whole screen');
   assert.ok(joystick.sensitive.dx>.3,'Short thumb move engages');
   assert.equal(joystick.original.bx,joystick.huge.bx,'Base never follows huge drag');
   assert.equal(joystick.original.by,joystick.huge.by,'Base never follows vertical drag');
   assert.ok(Math.hypot(joystick.physical.knobX-joystick.physical.baseX,
     joystick.physical.knobY-joystick.physical.baseY)<31,'Knob remains bounded');
   assert.equal(joystick.release.active,false,'Touchend clears joystick');
   assert.equal(joystick.release.dx,0,'No movement after release');
   await page.waitForTimeout(380);
   const questLayout=await page.evaluate(()=>{
     window.PiraliQuestHud141.align();
     const h=document.querySelector('#ui > .ui-panel:first-child').getBoundingClientRect();
     const q=document.getElementById('pirali139-hud').getBoundingClientRect();
     const m=document.getElementById('pirali-mini-map').getBoundingClientRect();
     return {on:window.PiraliQuestHud141.debug().active,viewport:innerHeight,
      heartBottom:h.bottom,questTop:q.top,questBottom:q.bottom,mapTop:m.top,mapBottom:m.bottom,
      questLeft:q.left,mapLeft:m.left};
   });
   assert.equal(questLayout.on,true,'Live mission positioning active');
   assert.ok(questLayout.questTop>=questLayout.heartBottom+4,
      'Quest under hearts '+JSON.stringify(questLayout));
   assert.ok(questLayout.mapTop>=questLayout.questBottom+4,
      'Minimap begins below the complete mission text '+JSON.stringify(questLayout));
   assert.ok(Math.abs(questLayout.questLeft-questLayout.mapLeft)<=8,
      'Quest and minimap left edges aligned '+JSON.stringify(questLayout));
   assert.ok(questLayout.mapBottom<questLayout.viewport*.85,
      'Minimap still fits after dedicated quest row '+JSON.stringify(questLayout));
   const timerBox=await page.locator('#pirali-time-hud').boundingBox();
   const pauseBox=await page.locator('#btn-pause').boundingBox();
   assert.ok(timerBox&&pauseBox,'Visible game timer and pause');
   assert.ok(timerBox.x>=pauseBox.x+pauseBox.width+4,'Timer to the right of pause');
   assert.ok(Math.abs(timerBox.y-pauseBox.y)<=3,'Timer aligned with pause: timer='+JSON.stringify(timerBox)+' pause='+JSON.stringify(pauseBox));
   assert.ok(timerBox.x+timerBox.width<=360,'Timer fits the mobile viewport');
   if(variant==='dev'){
     const test=page.locator('#pirali-scenery-test-panel');
     const comp=test.locator('[data-latest-improvements="toggle"]');
     assert.equal(await comp.count(),1,'One latest-improvements switch');
     const imm=test.locator('[data-immortality="toggle"]');
     assert.equal(await comp.evaluate(e=>e.previousElementSibling?.dataset.immortality),'toggle','Comparison switch directly beneath immortality');
     assert.equal(await page.evaluate(()=>window.PiraliDevComparison.latestEnabled()),true);
     await comp.evaluate(el=>el.click());
     assert.equal(await page.evaluate(()=>window.PiraliDevComparison.latestEnabled()),false);
      assert.equal(await page.evaluate(()=>window.PiraliEvolution139.enabled()),false,'Evolution group disabled');
     assert.equal(await page.evaluate(()=>window.PiraliJoy138.modern()),true,'Previous joystick remains enabled');
     assert.equal(await page.evaluate(()=>document.body.classList.contains('pirali-joy138-classic')),false);
     assert.equal(await page.evaluate(()=>window.PiraliEnemyRange137.enabled()),true,'Earlier enemy ranges remain ON');
     assert.equal(await page.evaluate(()=>window.PiraliEnemyRange137.fireRange('rifle')),315);
     assert.equal(await page.evaluate(()=>window.PiraliBeta134.enabled()),true,'Prior 1.34 group remains ON');
     assert.equal(await page.evaluate(()=>window.PiraliBulletArt136.enabled()),true,'Old brass art stays enabled');
     assert.equal(await page.evaluate(()=>window.PiraliDevComparison.enabled()),true,'Old Beta 1.32 stays ON');
     assert.equal(await comp.getAttribute('aria-pressed'),'false');
     const disabledVisual=await page.evaluate(()=>{PiraliFX.reset();PiraliFX.hit(P.x,P.y,true);return PiraliFX.debug().types});
     assert.equal(disabledVisual.includes('impact-arc'),true,'Existing Beta 1.32 FX stays enabled');
     await comp.evaluate(el=>el.click());
     assert.equal(await page.evaluate(()=>window.PiraliDevComparison.latestEnabled()),true);
     assert.equal(await page.evaluate(()=>window.PiraliJoy138.modern()),true,'Previous joystick remains ON');
      assert.equal(await page.evaluate(()=>window.PiraliEvolution139.enabled()),true,'Evolution restored');
     assert.equal(await page.evaluate(()=>document.body.classList.contains('pirali-joy138-classic')),false);
     assert.equal(await page.evaluate(()=>window.PiraliEnemyRange137.enabled()),true,'Earlier enemy ranges still ON');
     assert.equal(await page.evaluate(()=>window.PiraliEnemyRange137.fireRange('rifle')),315);
     assert.equal(await comp.getAttribute('aria-pressed'),'true');
     assert.equal(await page.evaluate(()=>window.PiraliBeta134.enabled()),true,'Old experience remains ON');
     assert.equal(await page.evaluate(()=>window.PiraliBulletArt136.enabled()),true,'Old brass art remains active');
     await page.waitForTimeout(420);
     const dock=await page.evaluate(()=>{
       const map=document.getElementById('pirali-mini-map').getBoundingClientRect();
       const panel=document.getElementById('pirali-scenery-test-panel').getBoundingClientRect();
       return {map:{x:map.x,y:map.y,width:map.width,height:map.height},
         panel:{x:panel.x,y:panel.y,width:panel.width,height:panel.height}};
     });
     assert.ok(dock.panel.y>=dock.map.y+dock.map.height+5,'Dev test below minimap '+JSON.stringify(dock));
     assert.ok(Math.abs(dock.panel.x-dock.map.x)<=12,'Dev test aligned with minimap');
     const enabledVisual=await page.evaluate(()=>{PiraliFX.reset();PiraliFX.hit(P.x,P.y,true);return PiraliFX.debug().types});
     assert.equal(enabledVisual.includes('impact-arc'),true,'New impact restored immediately');
   }else{
     assert.equal(await page.locator('[data-latest-improvements="toggle"]').count(),0,'Player cannot access Dev comparison controls');
     assert.equal(await page.evaluate(()=>!!window.PiraliDevComparison),false,'Player comparison API absent');
   }
   const coins=await page.evaluate(()=>{const old=score;window.PiraliStageScoring.claimDevilCoins();return score-old;});
   assert.equal(coins,50,'Full Route coins reduced 80%');
   // Full Route owns shotgun: static shell boxes are available from every
   // stage; enemy shell drops are verified in the structural VM test.
   const stageShells=await page.evaluate(()=>{
     const oldLevel=level;
     const sample=Array.from({length:24},(_,i)=>({x:650+i*8,y:450+i*78}));
     const summary=[];
     for(let n=1;n<=11;n++){
       level=n;pickups=[];
       window.PiraliAlphaGear.scatterOnFinal(sample,pickups,n);
       summary.push({stage:n,boxes:pickups.filter(p=>p.type==='alpha-shells').length});
     }
     level=oldLevel;pickups=[];
     return summary;
   });
   assert.equal(stageShells.length,11);
   for(const n of stageShells)assert.ok(n.boxes>=3,'Owned shotgun shell placements stage '+n.stage);
   const bonusStageShells=await page.evaluate(()=>{
     level=11;
     window.PiraliEndless.setup();
     return pickups.filter(p=>p.type==='alpha-shells'&&!p.col).length;
   });
   assert.ok(bonusStageShells>=3,'Stage 11 wave reset retains acquired shotgun shell supply');
   await page.evaluate(()=>startGame());
   const normal=await page.evaluate(()=>({level,health,maxHealth,gear:window.PiraliAlphaGear.status(),active:window.PiraliFullPath.isActive()}));
   await page.waitForTimeout(150);
   for(const locale of ['ka','en','ru','zh']){
    const q=await page.evaluate(language=>{
      window.PiraliLanguage.setLanguage(language);
      const a=window.PiraliQuestHud141;a.align();
      const h=document.querySelector('#ui > .ui-panel:first-child').getBoundingClientRect(),
        x=document.getElementById('pirali139-hud').getBoundingClientRect(),
        m=document.getElementById('pirali-mini-map').getBoundingClientRect();
      return {language,heart:h.bottom,top:x.top,bottom:x.bottom,map:m.top,
       label:document.getElementById('pirali139-hud').textContent};
    },locale);
    assert.ok(q.top>=q.heart+4,'Mission below hearts in '+JSON.stringify(q));
    assert.ok(q.map>=q.bottom+4,'Mission does not overlap map in '+JSON.stringify(q));
    assert.ok(q.label.length>5,'Mission label translated in '+locale);
   }
   await page.evaluate(()=>window.PiraliLanguage.setLanguage('ka'));
   assert.equal(normal.level,1);assert.equal(normal.health,5);assert.equal(normal.maxHealth,5);assert.equal(normal.gear.owned,false);assert.equal(normal.active,false);
   assert.ok(requests.every(m=>m==='GET'),'No Firebase writes');
   assert.equal(await page.evaluate(()=>typeof window.PiraliBeta134?.celebrate),'function');
   const evolution=await page.evaluate(()=>window.PiraliEvolution139.debug());
   assert.ok(evolution.stage>=1&&evolution.stage<=11);
   assert.equal(await page.locator('#pirali139-hud').count(),1);
   assert.equal(await page.locator('.pirali139-quiet').count(),0,'No sneak button');
   assert.equal(await page.evaluate(()=>('speedFactor' in window.PiraliEvolution139)),false,'No hidden speed modifier');
   assert.equal(await page.evaluate(()=>('canDetect' in window.PiraliEvolution139)),false,'No hidden stealth detection');
   assert.equal(Object.hasOwn(evolution,'sneak'),false,'No stealth state');
   // Real mobile game QA for full pickups and automatic rescue.
   const pickup144=await page.evaluate(()=>{
    const oldHealth=health,oldMax=maxHealth,oldAmmo=ammo,oldAmmoMax=maxAmmo,
      oldWard=inventory.laurelShield,oldPickups=pickups;
    health=maxHealth;ammo=maxAmmo;inventory.laurelShield=1;
    pickups=['health','ammo','herb'].map((type,i)=>({type,col:false,x:P.x+i,y:P.y,bob:0}));
    const before=pickups.map(x=>x.type);
    update(.01);
    const preserved=pickups.map(x=>!x.col);
    health=oldHealth;maxHealth=oldMax;ammo=oldAmmo;maxAmmo=oldAmmoMax;
    inventory.laurelShield=oldWard;pickups=oldPickups;
    return {before,preserved};
   });
   assert.deepEqual(pickup144.preserved,[true,true,true],'Full health/ammo/shield pickups stay on ground');
   const rescue144=await page.evaluate(()=>{
     level=2;genWorld();P.dead=false;running=true;
     const p=path[Math.max(3,Math.min(path.length-4,Math.floor(path.length*.52)))];
     P.x=p.x+46;P.y=p.y;update(.1);
     return {quest:window.PiraliEvolution139.debug().quest,
       manualButtons:document.querySelectorAll('.pirali139-interact').length};
   });
   assert.equal(rescue144.manualButtons,0,'No manual quest button');
   assert.equal(rescue144.quest.stage,2);
   assert.equal(rescue144.quest.done,true,'Captive auto-rescued by walking nearby');
   const boss144=await page.evaluate(()=>{
     level=10;genWorld();return {
       hp:boss?.maxHp,
       expected:PIRALI_BALANCE.finalBossHp*3*.85*1.20*window.PiraliStageTuning.config(10).hp,
       aim:window.PiraliBoss144.aim({x:0,y:0},{x:110,y:40,vx:1,vy:2},20)
     };
   });
   assert.ok(Math.abs(boss144.hp-boss144.expected)<.01,'Devil +20% health');
   assert.ok(Number.isFinite(boss144.aim),'Smarter boss aiming API live');

   // Beta 1.45: each new mission is a real visual object, with an action,
   // while prior unlocks and the leaderboard remain untouched.
   const stage5=await page.evaluate(()=>{
    level=5;genWorld();running=true;P.dead=false;invincible=true;enemies=[];
    const before=window.PiraliEvolution139.debug().quest;
    P.x=before.x;P.y=before.y;
    update(.1);
    const after=window.PiraliEvolution139.debug().quest;
    return {before,after,profile:window.PiraliEvolution139.getProfile()};
   });
   assert.equal(stage5.before.kind,'captive','Stage 5 is a human, not a letter');
   assert.equal(stage5.before.done,false);
   assert.equal(stage5.after.done,true,'Walk to villager -> rescued automatically');
   assert.ok(stage5.profile.found.includes(5));
   const stage8=await page.evaluate(()=>{
    level=8;genWorld();running=true;P.dead=false;invincible=true;enemies=[];trees=[];boss=null;
    const api=window.PiraliEvolution139;
    const before=api.debug().quest;P.x=before.x;P.y=before.y;
    update(.1);const arrived=api.debug().quest;
    for(let i=0;i<12;i++)update(1);
    const moved=api.debug().quest;
    const objective=api.objectiveTarget();
    const shot={x:objective.x+40,y:objective.y,vx:8,vy:0,fp:true,alive:true,life:40};
    const intercepted=window.PiraliAim.bulletImpact(shot,objective.x-40,objective.y);
    return {before,arrived,moved,intercepted,after:api.debug().quest};
   });
   assert.equal(stage8.before.kind,'lookout','Stage 8 has a running guard');
   assert.equal(stage8.arrived.done,false,'Moving near guard does not collect a letter');
   assert.ok(Math.abs(stage8.before.x-stage8.moved.x)>15,'Lookout runs left/right');
   assert.equal(stage8.intercepted,true,'Actual projectile hits the lookout');
   assert.equal(stage8.after.done,true,'Lookout elimination completes the mission');
   const stage9=await page.evaluate(()=>{
    level=9;genWorld();running=true;P.dead=false;invincible=true;enemies=[];trees=[];boss=null;
    const api=window.PiraliEvolution139,goal=api.objectiveTarget();
    P.x=goal.x;P.y=goal.y;update(.1);
    const initial=api.debug().quest;
    function hit(shotId){
      const q=api.objectiveTarget();
      if(!q)return false;
      const b={x:q.x+50,y:q.y,fp:true,alive:true,shot144:shotId,life:90};
      return window.PiraliAim.bulletImpact(b,q.x-50,q.y);
    }
    hit(500);hit(500);hit(500); // One shotgun burst cannot deal 3 hits.
    const afterBurst=api.debug().quest;
    hit(501);hit(502);
    const afterThree=api.debug().quest;
    hit(503);
    const afterFour=api.debug().quest;
    return {initial,afterBurst,afterThree,afterFour};
   });
   assert.equal(stage9.initial.kind,'outpost','Stage 9 is a guard post');
   assert.equal(stage9.initial.done,false,'Walking up cannot deactivate an armed outpost');
   assert.equal(stage9.initial.hp,4,'Four shots required');
   assert.equal(stage9.afterBurst.hp,3,'Three shotgun pellets in one burst count as one shot');
   assert.equal(stage9.afterThree.hp,1);
   assert.equal(stage9.afterThree.done,false);
   assert.equal(stage9.afterFour.hp,0);
   assert.equal(stage9.afterFour.done,true,'Fourth distinct shot destroys the outpost');
   const stage11=await page.evaluate(()=>{
    level=11;genWorld();running=true;P.dead=false;invincible=true;
    const api=window.PiraliEvolution139,q=api.debug().quest;
    const gate=CHURCH_Y+153;
    return {q,gate,house:window.PiraliGurianHome?.entry};
   });
   assert.equal(stage11.q.kind,'letter','Stage 11 is a letter');
   assert.equal(stage11.q.done,false,'Letter is available on replays');
   assert.ok(stage11.q.y>stage11.gate+45,
     'Letter is outside/south of house yard gate '+JSON.stringify(stage11));
   assert.ok(stage11.q.y<stage11.gate+220,
     'Letter is near the front courtyard, not far from house '+JSON.stringify(stage11));
   async function checkOutcome(kind){
    await page.evaluate(type=>{
      score=884;level=type==='victory'?10:4;
      if(type==='victory')showVictory();else showGameOver();
    },kind);
    await page.waitForFunction(()=>window.PiraliOutcome142?.debug()?.active
      && document.querySelectorAll('#screen .pirali142-actions > button').length>=4);
    for(const [width,height] of [[360,760],[320,568],[390,844],[740,360]]){
      await page.setViewportSize({width,height});
      for(const language of ['ka','en','ru','zh']){
        const obj=await page.evaluate(lang=>{
          window.PiraliLanguage.setLanguage(lang);
          window.PiraliOutcome142.fit();
          const screen=document.getElementById('screen'),card=screen.querySelector('.pirali142-stack'),
            buttons=[...screen.querySelectorAll('.pirali142-actions > button')];
          return {height:screen.clientHeight,scroll:screen.scrollHeight,
            card:card.getBoundingClientRect().toJSON(),
            buttons:buttons.map(x=>({text:x.textContent,rect:x.getBoundingClientRect().toJSON()})),
            score:screen.querySelector('.sbox')?.textContent||'',
            title:screen.querySelector('h1')?.textContent||'',
            background:getComputedStyle(screen).backgroundPosition,
            face:window.PiraliOutcome142.debug().faceSpace};
        },language);
        assert.equal(obj.buttons.length,4,'All four buttons '+JSON.stringify({kind,width,height,language,obj}));
        assert.ok(obj.card.top>=-2&&obj.card.bottom<=obj.height+2,
          'Result fully on screen '+JSON.stringify({kind,width,height,language,obj}));
        assert.ok(obj.buttons.every(x=>x.rect.top>=-2&&x.rect.bottom<=obj.height+2&&
          x.rect.left>=-2&&x.rect.right<=width+2),
          'Result controls fully on screen '+JSON.stringify({kind,width,height,language,obj}));
        assert.ok(obj.scroll<=obj.height+2,
          'No result scrolling '+JSON.stringify({kind,width,height,language,obj}));
        assert.ok(obj.background.startsWith('0%'),'Face-first background left '+obj.background);
        if(height>=690)assert.ok(obj.card.top<=height*.70,
          'Outcome raised toward requested marked area '+JSON.stringify({kind,width,height,language,obj}));
        assert.match(obj.score,/884/);
        assert.ok(obj.title.length>0);
        if(height>=700)assert.ok(obj.card.top>=height*.20,
          'Simona portrait remains unobstructed above result '+JSON.stringify({kind,width,height,language,obj}));
      }
    }
    await page.setViewportSize({width:360,height:760});
   }
   await checkOutcome('defeat');
   await checkOutcome('victory');
   assert.deepEqual(errors,[]);
   console.log('PASS Beta 1.45 '+variant+' mobile: locked-until-stage11, real progress unlock, correct menu order, 11 stage pins, 7 hearts shotgun, 20% points, normal game unchanged');
   await context.close();
  }
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
run().catch(e=>{console.error(e);server.close();process.exitCode=1});
