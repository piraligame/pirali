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
  function celebrate() {
    const dialog = document.createElement('dialog');
    dialog.id = 'route151-unlocked';
    const [,,heading,action] = labels();
    const title = document.createElement('h2');
    title.textContent = heading;
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
    map.append(img,svg);
    const button = document.createElement('button');
    button.textContent = action;
    dialog.append(title,map,button);
    document.body.append(dialog);
    dialog.showModal();
    if (!paused) togglePause();
    const resume = () => { dialog.close(); dialog.remove(); if (paused) togglePause(); };
    dialog.onclick = resume;
    dialog.oncancel = e => { e.preventDefault(); resume(); };
    button.focus();
  }
  window.PiraliRoute151 = { reveal, celebrate };
})();
