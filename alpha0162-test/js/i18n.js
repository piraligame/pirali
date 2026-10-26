/* PIRALI translations. Gameplay mechanics and Firebase data are language-neutral. */
(function(){
  'use strict';
  const KEY='pirali_language';
  const words={
    ka:{
      page:'ფირალი — სიმონას გზა',legend:'— ქართული ლეგენდა —',title:'ფირალი',subtitle:'სიმონას გზა',
      story:'როცა სამართალი ხმას კარგავს,<br>ტყე ხდება თავშესაფარი.<br><br>სიმონა დოლიძე —<br>კაცი, რომელმაც არჩევანი გააკეთა:<br>დაემორჩილოს… ან იბრძოლოს.<br><br>მოღალატედ შერაცხული,<br>მაგრამ ხალხისთვის — გმირი.<br><br>მისი გზა სიბნელიდან იწყება,<br>მაგრამ სინათლისკენ მიდის.<br><br>ეს არის ისტორია — ფირალი',
      start:'თამაშის დაწყება',records:'🏆 საუკეთესო მოთამაშეები',back:'← მთავარ მენიუში დაბრუნება',language:'ენა / LANGUAGE',
      health:'სიცოცხლე',score:'ქულა',progress:'ეკლესიისკენ',dash:'💨 მოი აგერ!',dashButton:'მოი აგერ!',ammo:'ტყვია',
      boss:'⚔ რუსი გენერალი — ბოსი',pause:'⏸ პაუზა',paused:'თამაში შეჩერებულია',resume:'▶ გაგრძელება',
      mainMenu:'🏠 მთავარ მენიუში',confirm:'პროგრესი დაიკარგება. დარწმუნებული ხარ?',
      yes:'✔ კი',no:'✘ არა', shoot:'მაუზერით სროლა',
      leaderboard:'🏆 რეკორდები',topPlayers:'საუკეთესო მოთამაშეები',topThirty:'საუკეთესო ოცდაათეული',myBest:'ჩემი რეკორდი',noPersonalScore:'ჯერ არ გაქვს რეკორდი',playToSeeBest:'ითამაშე და დააფიქსირე რეკორდი',continueSave:'გაგრძელება',unrankedMode:'შენახული ტური',unrankedNotice:'შენახული ტურიდან გაგრძელებული თამაში რეიტინგში არ მონაწილეობს.',
      namePlaceholder:'შეიყვანე სახელი...',save:'შენახვა',replay:'თავიდან თამაში',
      empty:'ჩანაწერი ჯერ არ არის',loading:'⏳ იტვირთება...',saving:'⏳ ინახება...',
      saved:'✅ შენახულია',players:'მოთამაშე',offline:'offline',cached:'cached',
      introSkip:'გამოტოვება ›',introSkipAria:'გამოტოვე შესავალი',introLoading:'ვიდეო იტვირთება…',
      introPlay:'▶ ვიდეოს გაშვება',introPrompt:'დააჭირე ▶ ვიდეოს საყურებლად',
      introError:'ვიდეო ვერ ჩაიტვირთა — გამოიყენე გამოტოვება',
      failEyebrow:'— ბრძოლა დასრულდა —',failTitle:'სიმონა დაეცა',failSub:'გამარჯვება ხვალ მოვა',
      victoryEyebrow:'— გამარჯვება! —',victoryTitle:'ეკლესია!',victorySub:'სამშობლო გადარჩა',
      victoryText:'სიმონა თამარის ეკლესიამდე მივიდა!',level:'ტური',levelDetail:'დონე',
      easy:'ადვილი',medium:'საშუალო',hard:'რთული',achievement:'🏆 რეკორდები',
      exitTitle:'გსურს თამაშიდან გასვლა?',exitWarning:'თუ მიმდინარე ტური არ დაგისრულებია, პროგრესი დაიკარგება.',exitCancel:'დარჩენა',exitConfirm:'გასვლა'
    },
    en:{
      page:'PIRALI — Simona’s Journey',legend:'— A GEORGIAN LEGEND —',title:'PIRALI',subtitle:'SIMONA’S JOURNEY',
      story:'When justice loses its voice,<br>the forest becomes a refuge.<br><br>Simona Dolidze —<br>a man forced to choose:<br>submit… or fight.<br><br>Branded an outlaw,<br>but to the people — a hero.<br><br>His path begins in darkness,<br>yet leads toward the light.<br><br>This is the legend of PIRALI.',
      start:'START GAME',records:'🏆 LEADERBOARD',back:'← BACK TO MENU',language:'LANGUAGE / ენა',
      health:'HEALTH',score:'SCORE',progress:'TO THE CHURCH',dash:'💨 MOI AGER!',dashButton:'MOI AGER!',ammo:'AMMO',
      boss:'⚔ RUSSIAN GENERAL — BOSS',pause:'⏸ PAUSED',paused:'Game is paused',resume:'▶ RESUME',
      mainMenu:'🏠 MAIN MENU',confirm:'Your progress will be lost. Are you sure?',
      yes:'✔ YES',no:'✘ NO',shoot:'Fire Mauser',
      leaderboard:'🏆 HIGH SCORES',topPlayers:'TOP PLAYERS',topThirty:'TOP 30 PLAYERS',myBest:'MY PERSONAL BEST',noPersonalScore:'No personal best yet',playToSeeBest:'Play to set your first record',continueSave:'CONTINUE',unrankedMode:'CHECKPOINT RUN',unrankedNotice:'A resumed game does not submit scores to the leaderboard.',
      namePlaceholder:'Enter your name...',save:'SAVE',replay:'PLAY AGAIN',
      empty:'No scores yet',loading:'⏳ Loading...',saving:'⏳ Saving...',
      saved:'✅ Saved',players:'players',offline:'offline',cached:'cached',
      introSkip:'SKIP ›',introSkipAria:'Skip intro',introLoading:'Loading video…',
      introPlay:'▶ PLAY VIDEO',introPrompt:'Tap ▶ to watch the video',
      introError:'Could not load video — tap Skip',
      failEyebrow:'— BATTLE OVER —',failTitle:'SIMONA HAS FALLEN',failSub:'Victory will come another day',
      victoryEyebrow:'— VICTORY! —',victoryTitle:'THE CHURCH!',victorySub:'THE HOMELAND IS SAVED',
      victoryText:'Simona reached Queen Tamar’s church!',level:'LEVEL',levelDetail:'Level',
      easy:'Easy',medium:'Medium',hard:'Hard',achievement:'🏆 HIGH SCORES',
      exitTitle:'Exit PIRALI?',exitWarning:'Progress in your current level may be lost.',exitCancel:'STAY',exitConfirm:'EXIT'
    },

    ru:{
      page:'ПИРАЛИ — Путь Симоны',legend:'— ГРУЗИНСКАЯ ЛЕГЕНДА —',title:'ПИРАЛИ',subtitle:'ПУТЬ СИМОНЫ',
      story:'Когда правосудие теряет голос,<br>лес становится убежищем.<br><br>Симона Долидзе —<br>человек, которому пришлось выбирать:<br>покориться… или сражаться.<br><br>Для властей он разбойник,<br>для народа — герой.<br><br>Его путь начинается во тьме,<br>но ведёт к свету.<br><br>Это история Пирали.',
      start:'НАЧАТЬ ИГРУ',records:'🏆 ТАБЛИЦА РЕКОРДОВ',back:'← НАЗАД В МЕНЮ',language:'ЯЗЫК / LANGUAGE',
      health:'ЗДОРОВЬЕ',score:'ОЧКИ',progress:'К ЦЕРКВИ',dash:'💨 МОИ АГЕР!',dashButton:'МОИ АГЕР!',ammo:'ПАТРОНЫ',
      boss:'⚔ РУССКИЙ ГЕНЕРАЛ — БОСС',pause:'⏸ ПАУЗА',paused:'Игра на паузе',resume:'▶ ПРОДОЛЖИТЬ',
      mainMenu:'🏠 ГЛАВНОЕ МЕНЮ',confirm:'Прогресс будет потерян. Вы уверены?',
      yes:'✔ ДА',no:'✘ НЕТ',shoot:'Выстрел из маузера',
      leaderboard:'🏆 РЕКОРДЫ',topPlayers:'ЛУЧШИЕ ИГРОКИ',topThirty:'ТОП-30 ИГРОКОВ',myBest:'МОЙ РЕКОРД',noPersonalScore:'Рекорда пока нет',playToSeeBest:'Сыграйте и установите рекорд',continueSave:'ПРОДОЛЖИТЬ',unrankedMode:'С СОХРАНЕНИЯ',unrankedNotice:'Игра из сохранения не участвует в онлайн-рейтинге.',
      namePlaceholder:'Введите имя...',save:'СОХРАНИТЬ',replay:'ИГРАТЬ СНОВА',
      empty:'Рекордов пока нет',loading:'⏳ Загрузка...',saving:'⏳ Сохранение...',
      saved:'✅ Сохранено',players:'игроков',offline:'офлайн',cached:'кэш',
      introSkip:'ПРОПУСТИТЬ ›',introSkipAria:'Пропустить вступление',introLoading:'Загрузка видео…',
      introPlay:'▶ ЗАПУСТИТЬ ВИДЕО',introPrompt:'Нажмите ▶ для просмотра',
      introError:'Не удалось загрузить видео — нажмите «Пропустить»',
      failEyebrow:'— БИТВА ОКОНЧЕНА —',failTitle:'СИМОНА ПАЛ',failSub:'Победа придёт завтра',
      victoryEyebrow:'— ПОБЕДА! —',victoryTitle:'ЦЕРКОВЬ!',victorySub:'РОДИНА СПАСЕНА',
      victoryText:'Симона добрался до церкви царицы Тамар!',level:'УРОВЕНЬ',levelDetail:'Уровень',
      easy:'Легко',medium:'Средне',hard:'Сложно',achievement:'🏆 РЕКОРДЫ',
      exitTitle:'Выйти из ПИРАЛИ?',exitWarning:'Прогресс текущего уровня может быть потерян.',exitCancel:'ОСТАТЬСЯ',exitConfirm:'ВЫЙТИ'
    },
    zh:{
      page:'PIRALI — 西蒙娜之路',legend:'— 格鲁吉亚传奇 —',title:'PIRALI',subtitle:'西蒙娜之路',
      story:'当正义失去声音，<br>森林便成了避难所。<br><br>西蒙娜·多利泽——<br>一个必须做出抉择的人：<br>屈服……还是战斗。<br><br>在当权者眼中他是亡命之徒，<br>在人民眼中他是英雄。<br><br>他的旅程始于黑暗，<br>却通向光明。<br><br>这就是《PIRALI》的传奇。',
      start:'开始游戏',records:'🏆 排行榜',back:'← 返回主菜单',language:'语言 / LANGUAGE',
      health:'生命值',score:'得分',progress:'前往教堂',dash:'💨 来这儿！',dashButton:'来这儿！',ammo:'弹药',
      boss:'⚔ 俄军将军 — 首领',pause:'⏸ 暂停',paused:'游戏已暂停',resume:'▶ 继续',
      mainMenu:'🏠 主菜单',confirm:'当前进度将会丢失。确定吗？',
      yes:'✔ 是',no:'✘ 否',shoot:'毛瑟手枪射击',
      leaderboard:'🏆 最高得分',topPlayers:'最佳玩家',topThirty:'前30名玩家',myBest:'我的最高分',noPersonalScore:'暂无个人记录',playToSeeBest:'开始游戏，创造纪录',continueSave:'继续游戏',unrankedMode:'存档继续',unrankedNotice:'从存档继续的游戏不会上传排行榜成绩。',
      namePlaceholder:'输入名字...',save:'保存',replay:'再玩一次',
      empty:'暂无记录',loading:'⏳ 加载中...',saving:'⏳ 保存中...',
      saved:'✅ 已保存',players:'位玩家',offline:'离线',cached:'缓存',
      introSkip:'跳过 ›',introSkipAria:'跳过开场视频',introLoading:'视频加载中…',
      introPlay:'▶ 播放视频',introPrompt:'点击 ▶ 观看视频',
      introError:'视频无法加载，请点击跳过',
      failEyebrow:'— 战斗结束 —',failTitle:'西蒙娜倒下了',failSub:'胜利终将到来',
      victoryEyebrow:'— 胜利！ —',victoryTitle:'教堂！',victorySub:'祖国得救了',
      victoryText:'西蒙娜抵达了塔玛尔女王的教堂！',level:'关卡',levelDetail:'关卡',
      easy:'简单',medium:'中等',hard:'困难',achievement:'🏆 最高得分',
      exitTitle:'退出 PIRALI？',exitWarning:'当前关卡的进度可能会丢失。',exitCancel:'留下',exitConfirm:'退出'
    }
  };
  // Canvas messages, combat popups and named places.
  const gamePhrases={
    ka:{
      enemies:'მტრები',combo:'ჯარი',streak:'სერია!',church:'თამარის ეკლესია',midway:'შუა ამაღლება',
      landlord:'ბატონი',landlordAppears:'ბატონი გამოჩნდა!\nერთი დარტყმით დაამარცხე!',churchBlocked:'ჯერ დაამარცხე გენერალი და ბატონი!',
      generalRage:'⚠ RAGE ⚠\nბოსი გააფთრდა!',generalPhase:'⚠ PHASE 2 ⚠\nგენერალი გააფთრდა!',
      parry:'✦ პარი! ✦',namePrompt:'შეიყვანე შენი სახელი (მაქს. 14 სიმბოლო):',
      anonymous:'ანონიმი'
    },
    en:{
      enemies:'Enemies',combo:'KILL STREAK',streak:'STREAK!',church:'Tamar’s Church',midway:'Midway Ascent',
      landlord:'LANDLORD',landlordAppears:'The landlord appeared!\nDefeat him in one hit!',churchBlocked:'Defeat the General and the Landlord first!',
      generalRage:'⚠ RAGE ⚠\nThe boss is enraged!',generalPhase:'⚠ PHASE 2 ⚠\nThe general is enraged!',
      parry:'✦ PARRY! ✦',namePrompt:'Enter your name (max. 14 characters):',
      anonymous:'Anonymous'
    },
    ru:{
      enemies:'Враги',combo:'СЕРИЯ УБИЙСТВ',streak:'СЕРИЯ!',church:'Церковь Тамар',midway:'Средний подъём',
      landlord:'ПОМЕЩИК',landlordAppears:'Помещик появился!\nПобедите одним ударом!',churchBlocked:'Сначала победите генерала и помещика!',
      generalRage:'⚠ ЯРОСТЬ ⚠\nБосс разъярён!',generalPhase:'⚠ ФАЗА 2 ⚠\nГенерал разъярён!',
      parry:'✦ ПАРИРОВАНИЕ! ✦',namePrompt:'Введите ваше имя (до 14 символов):',
      anonymous:'Аноним'
    },
    zh:{
      enemies:'敌人',combo:'连续击杀',streak:'连击！',church:'塔玛尔教堂',midway:'半山坡',
      landlord:'地主',landlordAppears:'地主出现了！\n一击即可击败！',churchBlocked:'先击败将军和地主！',
      generalRage:'⚠ 狂暴 ⚠\n首领已狂暴！',generalPhase:'⚠ 第二阶段 ⚠\n将军已狂暴！',
      parry:'✦ 格挡！ ✦',namePrompt:'请输入名字（最多14个字符）：',
      anonymous:'匿名'
    }
  };
  function gameText(key){return (gamePhrases[current]||{})[key]||gamePhrases.ka[key]||key;}
  let current='ka';
  try{const stored=localStorage.getItem(KEY);if(['ka','en','ru','zh'].includes(stored))current=stored;}catch(e){}
  // Translations for the current five level environments (kept out of game logic).
  const tenStageBanners={
    'ჯერ დაამარცხე ორივე გენერალი!':{
      ka:'ჯერ დაამარცხე ორივე გენერალი!',en:'Defeat both generals first!',
      ru:'Сначала победи обоих генералов!',zh:'先击败两名将军！'},
    'ჯერ დაამარცხე ალყის 30 მსროლელი!':{
      ka:'ჯერ დაამარცხე ალყის 30 მსროლელი!',en:'Defeat all 30 shooters!',
      ru:'Сначала победи 30 стрелков!',zh:'先击败30名射手！'}
  };
  const timeLabels={
    en:{'დღე':'Day','შუადღე':'Noon','ცხელი სიცხე':'Heatwave','მწუხრი':'Dusk','ღამე':'Night','განახლება':'Ganakhleba','სამება':'Sameba','უსასრულობა':'Infinity','ალყა':'Siege','ჯოჯოხეთი':'Hell'},
    ru:{'დღე':'День','შუადღე':'Полдень','ცხელი სიცხე':'Жара','მწუხრი':'Сумерки','ღამე':'Ночь','განახლება':'Ганахлеба','სამება':'Самеба','უსასრულობა':'Бесконечность','ალყა':'Окружение','ჯოჯოხეთი':'Ад'},
    zh:{'დღე':'白天','შუადღე':'中午','ცხელი სიცხე':'酷暑','მწუხრი':'黄昏','ღამე':'夜晚','განახლება':'加纳赫莱巴','სამება':'萨梅巴','უსასრულობა':'无尽','ალყა':'围攻','ჯოჯოხეთი':'地狱'}
  };
  function getLevelName(n){
    const entry=PIRALI_LEVELS[Number(n)-1];
    return entry?(entry[current]||entry.ka):'';
  }
  function levelTitle(n){return t('level')+' '+n+' — '+getLevelName(n);}
  function translateTime(text){return (timeLabels[current]||{})[text]||text;}
  function translateBanner(text){
    const devBanners={...tenStageBanners,
      'ეკლესიის კარი გაიღო! შედი ეკლესიაში.':{
        ka:'ეკლესიის კარი გაიღო! შედი ეკლესიაში.',
        en:'The church is open! Enter to reach Simona’s Hell.',
        ru:'Церковь открыта! Войди, чтобы попасть в ад Симоны.',
        zh:'教堂已开启！进入后前往西蒙娜的地狱。'},
      'ჯერ დაამარცხე ეშმაკი!':{
        ka:'ჯერ დაამარცხე ეშმაკი!',en:'Defeat the Devil first!',
        ru:'Сначала победи дьявола！',zh:'先击败恶魔！'},
      'ეშმაკი დამარცხებულია! შედი ცეცხლიან კარიბჭეში.':{
        ka:'ეშმაკი დამარცხებულია! შედი ცეცხლიან კარიბჭეში.',
        en:'The Devil is defeated! Enter the Gate of Fire.',
        ru:'Дьявол повержен! Войди в огненные врата.',
        zh:'恶魔已被击败！进入烈焰之门。'},
      'ჯოჯოხეთის ცეცხლოვანი კარიბჭე გაიღო!':{
        ka:'ჯოჯოხეთის ცეცხლოვანი კარიბჭე გაიღო!',
        en:'Hell’s Flaming Gate is now open!',
        ru:'Огненные врата ада открылись!',
        zh:'地狱烈焰之门已经开启！'},
      '🔥 ეშმაკი მძვინვარებს!':{
        ka:'🔥 ეშმაკი მძვინვარებს!',en:'🔥 The Devil is enraged!',
        ru:'🔥 Дьявол в ярости!',zh:'🔥 恶魔暴怒！'},
      'სიმონამ ჯოჯოხეთი გაიარა!':{
        ka:'სიმონამ ჯოჯოხეთი გაიარა!',en:'Simona conquered Hell!',
        ru:'Симона прошёл ад!',zh:'西蒙娜闯过了地狱！'}
    };
    if(devBanners[text])return devBanners[text][current]||devBanners[text].ka;
    if(text==='ბატონი გამოჩნდა!\nერთი დარტყმით დაამარცხე!')return gameText('landlordAppears');
    if(text==='ჯერ დაამარცხე გენერალი და ბატონი!')return gameText('churchBlocked');
    if(text==='⚠ RAGE ⚠\nბოსი გააფთრდა!')return gameText('generalRage');
    if(text==='⚠ PHASE 2 ⚠\nგენერალი გააფთრდა!')return gameText('generalPhase');
    if(typeof LEVEL_NAMES!=='undefined'){
      const index=LEVEL_NAMES.indexOf(text);
      if(index>0)return levelTitle(index);
    }
    return text;
  }
  function t(key){return words[current][key]||words.ka[key]||key;}
  function setText(sel,key,parent=document){
    const el=parent.querySelector(sel);
    if(el&&el.textContent!==t(key))el.textContent=t(key);
  }
  function applyHud(){
    const mappings=[
      ['#ui .ui-panel:first-child .ui-lbl','health'],
      ['#ui .ui-panel:last-child .ui-lbl','score'],
      ['#prog-lbl','progress'],['#dash-lbl','dash'],['#ammo-lbl','ammo'],
      ['#boss-lbl','boss'],['#pause-overlay h2','pause'],
      ['#pause-overlay p','paused'],
      ['#pause-overlay > button.pause-btn:not(.secondary)','resume'],
      ['#btn-go-menu','mainMenu'],['#menu-confirm > div:first-child','confirm'],
      ['#menu-confirm button.pause-btn:first-child','yes'],
      ['#menu-confirm button.pause-btn:last-child','no']
    ];
    for(const [sel,key] of mappings)setText(sel,key);
    document.getElementById('btn-shoot')?.setAttribute('aria-label',t('shoot'));
    document.getElementById('btn-dash')?.setAttribute('aria-label',t('dash').replace(/^💨 /,''));
    document.getElementById('btn-dash')?.setAttribute('title',t('dash').replace(/^💨 /,''));
    setText('#btn-dash','dashButton');
  }
  function applyMenu(){
    const panel=document.querySelector('#screen:not(.gameover-screen):not(.victory-screen) .main-menu-panel');
    if(!panel)return;
    setText('.tdeco','legend',panel);
    setText('h1','title',panel);
    setText('.tsub','subtitle',panel);
    const description=panel.querySelector('.sbox p');
    if(description&&description.innerHTML!==t('story'))description.innerHTML=t('story');
    setText('.sbtn','start',panel);
    setText('.menu-records','records',panel);
    window.PiraliCheckpoint?.refreshMenu();
    setText('.menu-lang-title','language',panel);
    panel.querySelectorAll('[data-pirali-lang]').forEach(button=>{
      const selected=button.dataset.piraliLang===current;
      button.setAttribute('aria-pressed',String(selected));
      button.classList.toggle('is-active',selected);
    });
  }
  function applyLeaderboard(){
    setText('#lb-title','leaderboard');
    setText('#lb-sub','topThirty');
    setText('#lb-play','replay');
    setText('#lb-save','save');
    setText('#pirali-lb-close','back');
    const name=document.getElementById('lb-name');
    if(name)name.placeholder=t('namePlaceholder');
  }
  function applyOutcome(){
    const s=document.getElementById('screen');
    if(!s)return;
    if(s.classList.contains('gameover-screen')){
      setText('.tdeco','failEyebrow',s);setText('h1','failTitle',s);
      setText('.tsub','failSub',s);setText('button.sbtn','achievement',s);setText('.alpha-outcome-menu','mainMenu',s);
      const p=s.querySelector('.sbox p');
      if(p){
        const node=Array.from(p.childNodes).find(n=>n.nodeType===Node.TEXT_NODE);
        if(node)node.textContent=t('score')+': ';
        const span=p.querySelector('span');
        if(span){
          const levelNumber=(typeof level==='number'?level:1);
          const difficulty=levelNumber<=2?'easy':levelNumber<=4?'medium':'hard';
          span.textContent=t('levelDetail')+' '+levelNumber+' • '+t(difficulty);
        }
      }
    }else if(s.classList.contains('victory-screen')){
      setText('.tdeco','victoryEyebrow',s);
      setText('h1[style*="28px"]','victoryTitle',s);
      setText('.tsub','victorySub',s);setText('button.sbtn','achievement',s);setText('.alpha-outcome-menu','mainMenu',s);
      const p=s.querySelector('.sbox p');
      if(p){
        const node=Array.from(p.childNodes).find(n=>n.nodeType===Node.TEXT_NODE);
        if(node)node.textContent=t('score')+': ';
        const small=p.querySelector('span');if(small)small.textContent=t('victoryText');
      }
      if(typeof level==='number'&&level===10){
        const hellFinal={
          ka:['სიმონამ ჯოჯოხეთი გაიარა!','ეშმაკი დამარცხებულია — კარიბჭე გადალახულია','მეათე ტური დასრულებულია'],
          en:['Simona conquered Hell!','The Devil has fallen — the gate is crossed','Stage ten completed'],
          ru:['Симона прошёл ад!','Дьявол повержен — врата пройдены','Шестой этап завершён'],
          zh:['西蒙娜闯过了地狱！','恶魔已败——烈焰之门已穿越','第十关已完成']
        }[current]||['სიმონამ ჯოჯოხეთი გაიარა!','ეშმაკი დამარცხებულია — კარიბჭე გადალახულია','მეათე ტური დასრულებულია'];
        const title=s.querySelector('h1[style*="28px"]'),sub=s.querySelector('.tsub'),small=s.querySelector('.sbox p span');
        if(title)title.textContent=hellFinal[0];
        if(sub)sub.textContent=hellFinal[1];
        if(small)small.textContent=hellFinal[2];
      }
    }
  }
  function applyIntro(){
    const overlay=document.getElementById('pirali-video-intro');
    if(!overlay)return;
    const skip=overlay.querySelector('#pirali-intro-skip');
    const play=overlay.querySelector('#pirali-intro-play');
    const status=overlay.querySelector('#pirali-intro-status');
    if(skip){skip.textContent=t('introSkip');skip.setAttribute('aria-label',t('introSkipAria'));}
    if(play)play.textContent=t('introPlay');
    if(status&&status.dataset.piraliStatus)status.textContent=t(status.dataset.piraliStatus);
  }
  function apply(){
    document.documentElement.lang=current==='en'?'en-US':current==='ru'?'ru-RU':current==='zh'?'zh-CN':'ka';
    document.title=t('page')+' · Alpha 0.16.1 DEV';
    applyHud();applyMenu();applyLeaderboard();applyOutcome();applyIntro();
    if(typeof updateProgressUI==='function'&&typeof level==='number'&&typeof P!=='undefined')updateProgressUI();
  }
  function setLanguage(lang){
    if(!['ka','en','ru','zh'].includes(lang))return;
    current=lang;
    try{localStorage.setItem(KEY,lang)}catch(e){}
    apply();
    document.dispatchEvent(new CustomEvent('pirali:languagechange',{detail:{language:lang}}));
  }
  window.PiraliLanguage={getLanguage:()=>current,setLanguage,t,gameText,apply,applyIntro,applyOutcome,applyLeaderboard,translateBanner,
    getLevelName,translateLevel:(n,desc)=>levelTitle(n)};
  apply();
})();
