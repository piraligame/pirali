// Share one decoded map across both menu views and the campaign celebration.
(() => {
  'use strict';
  const url = 'assets/maps/pirali-approved.webp?v=beta151';
  const warm = new Image();
  warm.src = url;
  warm.decode?.().catch(() => {});
  const words = {
    ka:['რუკა იტვირთება…','რუკა ვერ ჩაიტვირთა','სიმონას სრული გზა გახსნილია','მე-11 ტურში გადასვლა'],
    en:['Loading map…','Map unavailable','Simona’s Full Route unlocked','Enter stage 11'],
    ru:['Загрузка карты…','Карта недоступна','Весь путь Симоны открыт','Перейти на уровень 11'],
    zh:['地图加载中…','地图暂不可用','西蒙娜的完整旅程已解锁','进入第11关']
  };
  const labels = () => words[window.PiraliLanguage?.getLanguage?.()] || words.ka;
  function reveal(art) {
    const img = art.querySelector('img');
    const status = document.createElement('span');
    status.className = 'map151-status';
    status.textContent = labels()[0];
    art.before(status);
    art.style.visibility = 'hidden';
    const ready = () => { art.style.visibility = ''; status.remove(); };
    const failed = () => { img.hidden = true; art.style.visibility = ''; status.textContent = labels()[1]; };
    if (img.decode) img.decode().then(ready, failed);
    else if (img.complete) img.naturalWidth ? ready() : failed();
    else { img.onload = ready; img.onerror = failed; }
  }
  const acknowledged = new Set();
  function noticeKey() {
    let name = '';
    try { name = localStorage.getItem('pirali_player_name') || ''; } catch {}
    const variant = window.PiraliVisualPreviewReadonly ? 'dev' : 'play';
    return 'pirali_route_notice_v1:' + variant + ':' + name.normalize('NFKC').trim().toLocaleLowerCase();
  }
  function celebrate({ afterMap, preview = true } = {}) {
    const key = noticeKey();
    let seen = acknowledged.has(key);
    try { seen ||= localStorage.getItem(key) === '1'; } catch {}
    const first = preview || !seen;
    if (document.getElementById('route151-unlocked')) return;
    const language = window.PiraliLanguage?.getLanguage?.() || 'ka';
    const messages = {
      ka:['მე-10 ტური დასრულებულია','გაგრძელება','შენ გახსენი „სიმონას სრული გზა“ მთავარ მენიუში!','ტესტში დაბრუნება'],
      en:['Stage 10 complete','Continue','You unlocked Simona’s Full Route in the main menu!','Return to test'],
      ru:['Уровень 10 пройден','Продолжить','Вы открыли «Весь путь Симоны» в главном меню!','Вернуться к тесту'],
      zh:['第10关已完成','继续','你已解锁主菜单中的「西蒙娜的完整旅程」！','返回测试']
    };
    const [mapTitle,next,unlocked,returnToTest] = messages[language] || messages.ka;
    const dialog = document.createElement('dialog');
    dialog.id = 'route151-unlocked';
    const [,,,action] = labels();
    const title = document.createElement('h2');
    title.textContent = mapTitle;
    const map = document.createElement('div');
    map.className = 'route151-art';
    const img = new Image();
    img.src = url;
    img.alt = '';
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS,'svg');
    svg.setAttribute('viewBox','0 0 100 100');
    svg.setAttribute('preserveAspectRatio','none');
    const line = document.createElementNS(svgNS,'polyline');
    line.setAttribute('points',window.PiraliStoryMap.stops.slice(0,10).map(s => s.l+','+s.t).join(' '));
    line.setAttribute('pathLength','1');
    svg.append(line);
    const surface = document.createElement('div');
    surface.className = 'route152-surface';
    surface.append(img,svg);
    map.append(surface);
    const button = document.createElement('button');
    button.textContent = first ? next : action;
    dialog.append(title,map,button);
    document.body.append(dialog);
    dialog.showModal();
    const pauseHere = running && !paused;
    if (pauseHere) togglePause();
    line.style.animationPlayState = 'paused';
    const animate = () => { line.style.animationPlayState = 'running'; };
    if (img.decode) img.decode().then(animate, animate);
    else animate();
    let showingMap = true;
    const resume = () => {
      if (showingMap) {
        showingMap = false;
        if (afterMap) afterMap();
        if (first) {
          map.remove();
          title.textContent = '🧭 ' + unlocked;
          if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
            title.animate?.([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:520,easing:'ease-out'});
          button.textContent = preview ? returnToTest : action;
          return;
        }
      }
      if (first && !preview) {
        acknowledged.add(key);
        try { localStorage.setItem(key, '1'); } catch {}
      }
      dialog.close(); dialog.remove();
      if (pauseHere && paused) togglePause();
    };
    // A tap ending on the map while the player is fighting must not skip it.
    button.onclick = resume;
    dialog.oncancel = e => { e.preventDefault(); resume(); };
    button.focus();
  }
  window.PiraliRoute151 = { reveal, celebrate };
})();
