/* 0.28 web preview on 0.23 base; local browser data stays in its existing keys. */
(function(){
'use strict';
const g=id=>document.getElementById(id);
const keyNotes='dgiuri_web028_color_notes',keyHours='dgiuri_web028_hours';
const read=k=>{try{const a=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(a)?a:[]}catch{return []}};
const store=(k,a)=>{try{localStorage.setItem(k,JSON.stringify(a))}catch(e){message('შენახვის შეცდომა')}};
let notes=read(keyNotes),hours=read(keyHours),noteId=null,hourId=null,noteColor=0,hourDate=dateIso(new Date());
let loaded=false;const colors=['#1a8767','#865db6','#3978c3','#c35a8a','#b17c27','#109ba0','#586575'];
function init(){
 if(loaded)return;loaded=true;
 document.querySelector('nav.bottom button[data-page="home"]')?.remove();
 const other=document.querySelector('#other .addonsList');
 if(other){
  const buttons=[...other.querySelectorAll('.addonTile')];
  const by=t=>buttons.find(b=>b.getAttribute('onclick')?.includes(t));
  const make=(icon,label,sub,target)=>{
   const b=document.createElement('button');b.type='button';b.className='addonTile';
   b.innerHTML='<span class="addonIcon">'+icon+'</span><span class="addonCopy"><strong>'+label+'</strong><small>'+sub+'</small></span><span class="addonArrow">›</span>';
   b.onclick=()=>show(target);return b;
  };
  const clock=by("show('clock')");
  if(clock){const el=clock.querySelector('strong');el.removeAttribute('data-v13');el.textContent='მაღვიძარა'}
  const compass=document.querySelector('#other > button.addonTile');
  other.replaceChildren(...[
   make('▤','ფერადი ნოუთები','ფერადი ბარათები და ჭიკარტი','notes28'),
   make('◷','საათობრივი განრიგი','24-საათიანი დღის სია','hours28'),
   by('journalOpen()'),clock,by("show('joker')"),compass].filter(Boolean));
  document.querySelector('#other .addonFuture')?.remove();
 }
 const backup=document.querySelector('#settings button[onclick="exportData()"]');
 if(backup){
  const article=backup.closest('article.panel');
  if(article)article.innerHTML='<b class="paneltitle">კონფიდენციალურობა</b><p class="muted tiny">ჩანაწერები ბრაუზერის ადგილობრივ მეხსიერებაში ინახება. Google-ის ანგარიშთან დაკავშირება არ ნიშნავს ავტომატურ ორმხრივ სინქრონიზაციას.</p>';
 }
 const main=document.querySelector('main');
 const n=document.createElement('section');n.id='notes28';n.className='page';
 n.innerHTML='<div class="addonBack"><button class="secondary" onclick="show(\'other\')">‹ სხვა</button></div><div class="hrow"><h1 class="h1">ფერადი ნოუთები</h1><button class="primary" onclick="d28NewNote()">+ ახალი</button></div><input id="note28search" class="fieldinput" placeholder="ნოუთების ძიება..." oninput="d28RenderNotes()" type="search"><div id="note28cards" class="d28notes"></div><article class="panel" id="note28editor" hidden><h2>ფერადი ნოუთი</h2><input id="note28title" class="fieldinput" placeholder="სათაური" maxlength="180"><textarea id="note28body" class="fieldinput" rows="7" maxlength="30000" placeholder="ჩანაწერი"></textarea><div id="note28colors" class="d28colors"></div><label class="field" for="note28folder">საქაღალდე</label><select id="note28folder" class="fieldinput"><option>პირადი</option><option>სამუშაო</option><option>ოჯახი</option><option>იდეები</option><option>სხვა</option></select><label><input id="note28pin" type="checkbox"> 📌 დამაგრება</label><div class="hrow"><button class="primary" onclick="d28SaveNote()">შენახვა</button><button class="secondary" onclick="d28CloseNote()">დახურვა</button><button id="note28delete" class="secondary" onclick="d28DeleteNote()" hidden>წაშლა</button></div></article>';
 main.append(n);
 const h=document.createElement('section');h.id='hours28';h.className='page';
 h.innerHTML='<div class="addonBack"><button class="secondary" onclick="show(\'other\')">‹ სხვა</button></div><h1 class="h1">საათობრივი განრიგი</h1><p class="muted tiny">24 საათის საქმეები. ფონური შეხსენებები გარანტირებულია მხოლოდ Android აპში, არა ბრაუზერში.</p><article class="panel"><label class="field">თარიღი</label><input type="date" id="hours28date" class="fieldinput" onchange="d28HourDate(this.value)"><label class="field">სათაური</label><input id="hours28title" class="fieldinput" placeholder="საქმის სათაური" maxlength="200"><label class="field">დრო</label><input type="time" id="hours28time" class="fieldinput" value="12:00"><button class="primary" onclick="d28SaveHour()">+ დამატება / შენახვა</button><button class="secondary" onclick="d28ResetHour()">გაუქმება</button></article><div id="hours28list"></div>';
 main.append(h);
 const cal=g('calendar');
 const quick=document.createElement('article');quick.className='panel';quick.id='cal28day';
 quick.innerHTML='<div class="quickadd"><input id="cal28quick" placeholder="სწრაფად დაამატე საქმე..." maxlength="160" onkeydown="if(event.key===\'Enter\')d28QuickAdd()"><button onclick="d28QuickAdd()">＋</button></div><div class="hrow"><b class="paneltitle">დღის საქმეები</b><strong id="cal28count"></strong></div><div id="cal28tasks"></div>';
 cal.querySelector('#calendarGrid').insertAdjacentElement('afterend',quick);
 const listing=document.createElement('article');listing.className='panel';listing.id='cal28list';cal.append(listing);
}
const idsafe=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
function noteColors(){g('note28colors').innerHTML=colors.map((c,i)=>'<button class="d28swatch '+(i===noteColor?'selected':'')+'" type="button" style="background:'+c+'" onclick="d28PickColor('+i+')">'+(i===noteColor?'✓':'')+'</button>').join('')}
window.d28PickColor=i=>{noteColor=i;noteColors()};
window.d28NewNote=()=>{noteId=null;noteColor=0;g('note28title').value='';g('note28body').value='';g('note28pin').checked=false;g('note28folder').value='პირადი';g('note28delete').hidden=true;noteColors();g('note28editor').hidden=false;g('note28title').focus()};
window.d28OpenNote=id=>{const n=notes.find(x=>x.id===id);if(!n)return;noteId=id;noteColor=n.color||0;g('note28title').value=n.title;g('note28body').value=n.body;g('note28pin').checked=n.pinned;g('note28folder').value=n.folder||'პირადი';g('note28delete').hidden=false;noteColors();g('note28editor').hidden=false};
window.d28CloseNote=()=>g('note28editor').hidden=true;
window.d28SaveNote=()=>{
 const title=g('note28title').value.trim(),body=g('note28body').value.trim();if(!title&&!body){message('შეავსე ნოუთი');return}
 const obj={id:noteId||idsafe(),title,body,color:noteColor,pinned:g('note28pin').checked,folder:g('note28folder').value,at:Date.now()};
 notes=notes.filter(x=>x.id!==obj.id).concat(obj);store(keyNotes,notes);d28CloseNote();d28RenderNotes();message('ნოუთი შენახულია');
};
window.d28DeleteNote=()=>{if(!confirm('წავშალოთ ნოუთი?'))return;notes=notes.filter(x=>x.id!==noteId);store(keyNotes,notes);d28CloseNote();d28RenderNotes()};
window.d28RenderNotes=()=>{
 const q=g('note28search').value.toLocaleLowerCase(),filtered=notes.filter(n=>(n.title+' '+n.body).toLocaleLowerCase().includes(q)).sort((a,b)=>Number(b.pinned)-Number(a.pinned)||b.at-a.at);
 g('note28cards').innerHTML=filtered.map(n=>'<button class="d28note" style="border-color:'+colors[n.color]+'" onclick="d28OpenNote(\''+esc(n.id)+'\')"><strong>'+esc(n.title||'ჩანაწერი')+'</strong><small>'+esc(n.body).slice(0,200)+'</small><span>'+(n.pinned?'📌 ':'')+new Date(n.at).toLocaleDateString('ka-GE')+' · '+esc(n.folder||'პირადი')+'</span></button>').join('')||'<p class="muted tiny">ნოუთები ჯერ არ არის.</p>';
};
window.d28HourDate=x=>{if(/^\d{4}-\d{2}-\d{2}$/.test(x)){hourDate=x;d28RenderHours()}};
window.d28ResetHour=()=>{hourId=null;g('hours28title').value='';g('hours28time').value='12:00'};
window.d28SaveHour=()=>{
 const title=g('hours28title').value.trim(),time=g('hours28time').value;
 if(!title||!/^\d\d:\d\d$/.test(time)){message('შეავსე სათაური და დრო');return}
 const obj={id:hourId||idsafe(),date:hourDate,title,time};hours=hours.filter(x=>x.id!==obj.id).concat(obj);store(keyHours,hours);d28ResetHour();d28RenderHours();message('შენახულია');
};
window.d28EditHour=id=>{const x=hours.find(x=>x.id===id);if(!x)return;hourId=id;hourDate=x.date;g('hours28title').value=x.title;g('hours28time').value=x.time;d28RenderHours()};
window.d28DeleteHour=id=>{if(!confirm('წავშალოთ განრიგის საქმე?'))return;hours=hours.filter(x=>x.id!==id);store(keyHours,hours);d28RenderHours()};
window.d28RenderHours=()=>{
 g('hours28date').value=hourDate;
 const all=hours.filter(x=>x.date===hourDate).sort((a,b)=>a.time.localeCompare(b.time));
 g('hours28list').innerHTML=Array.from({length:24},(_,i)=>{
 const at=all.filter(x=>+x.time.slice(0,2)===i);
 return '<div class="d28hour"><b>'+String(i).padStart(2,'0')+':00</b><div>'+(at.length?at.map(x=>'<div><strong>'+esc(x.time)+'</strong> '+esc(x.title)+' <button class="secondary" onclick="d28EditHour(\''+esc(x.id)+'\')">✎</button><button class="secondary" onclick="d28DeleteHour(\''+esc(x.id)+'\')">✕</button></div>').join(''):'—')+'</div></div>'}).join('');
};
window.d28QuickAdd=()=>{
 const i=g('cal28quick'),title=i.value.trim();if(!title)return;
 tasks.push({id:'t'+idsafe(),title,date:selected,time:'12:00',details:'',category:'პირადი',repeat:'none',reminder:-1,goalId:'',completed:{},priorities:{}});
 i.value='';persist();render();message('საქმე შენახულია');
};
window.d28Day=iso=>{selected=iso;mode='day';render()};
function calendar28(){
 const cal=g('calendar'),daily=page==='calendar'&&mode==='day',annual=page==='calendar'&&mode==='year';
 cal.querySelector('.roundPlus').hidden=!daily;
 g('cal28day').hidden=!daily;g('cal28list').hidden=daily||annual;
 g('calendarGrid').style.display=daily?'none':'';
 const old=g('calendarTasks')?.closest('article.panel');if(old)old.style.display='none';
 if(daily){const t=forDay(selected);g('cal28count').textContent=t.filter(x=>done(x,selected)).length+'/'+t.length;g('cal28tasks').innerHTML=t.map(x=>taskHtml(x,selected)).join('')||'<p class="empty">ამ დღისთვის საქმე ჯერ არ არის.</p>';return}
 if(annual){g('calendarGrid').querySelectorAll('.v20month').forEach((el,m)=>{
 el.onclick=e=>{e.preventDefault();e.stopPropagation();openMonth(m)};
 el.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openMonth(m)},true);
 el.style.cursor='pointer';el.tabIndex=0;el.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();openMonth(m)}};
 });return}
 const d=fromIso(selected),start=new Date(d.getFullYear(),d.getMonth(),1,12),days=mode==='week'?7:new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
 if(mode==='week')start.setDate(d.getDate()-((d.getDay()+6)%7));
 const entries=[];for(let n=0;n<days;n++){const ds=dateIso(addDays(start,n));forDay(ds).forEach(t=>entries.push([ds,t]))}
 entries.sort((a,b)=>a[0].localeCompare(b[0])||(a[1].time||'99:99').localeCompare(b[1].time||'99:99'));
 g('cal28list').innerHTML='<div class="hrow"><b class="paneltitle">'+(mode==='week'?'კვირის საქმეები':'თვის საქმეები')+'</b><b>'+entries.length+'</b></div>'+
 (entries.length?entries.map(([ds,t])=>'<div class="d28task"><button onclick="d28Day(\''+ds+'\')"><strong>'+ds.slice(5)+'</strong><small>'+esc(t.time||'—')+'</small></button><input type="checkbox" '+(done(t,ds)?'checked':'')+' onchange="toggleDone(\''+esc(t.id)+'\',\''+ds+'\')"><button onclick="openTask(\''+esc(t.id)+'\')">'+esc(t.title)+'</button></div>').join(''):'<p class="empty">ამ პერიოდში საქმეები არ არის.</p>');
}
let toast;
message=function(str){const el=g('banner');if(!el)return;clearTimeout(toast);el.textContent=str;el.classList.add('visible');toast=setTimeout(()=>el.classList.remove('visible'),3000)};
const oldSet=setPage;setPage=function(p){oldSet(p);if(['notes28','hours28'].includes(p))document.querySelector('.bottom button[data-page="other"]')?.classList.add('active')};
const oldShow=show;show=function(p){if(p==='calendar'&&page!=='calendar'){selected=dateIso(new Date());mode='day'}oldShow(p)};
const oldRender=render;render=function(){oldRender();document.title='დღიური · α 0.28 WEB';if(!loaded)init();calendar28();if(page==='notes28')d28RenderNotes();if(page==='hours28')d28RenderHours()};
const oldOpenTask=openTask;openTask=function(id){oldOpenTask(id);if(!id&&g('taskTime'))g('taskTime').value='12:00'};
init();mode='day';render();
})();