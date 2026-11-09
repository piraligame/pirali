
/* WEEKLY+ / DGIURI 0.20 isolated web prototype built on verified 0.19.
   This preview is NOT a native APK and does NOT connect to production cloud sync. */
(function(){
'use strict';
const V20_PIN='dgiuri_v20preview_note_pins';
const V20_META='dgiuri_v20preview_note_meta';
const V20_FILES='dgiuri_v20preview_note_files';
const readJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch{return fallback}};
let v20pins=readJSON(V20_PIN,{});
let v20meta=readJSON(V20_META,{});
let v20files=readJSON(V20_FILES,{});
const v20Save=()=>{try{localStorage.setItem(V20_PIN,JSON.stringify(v20pins));localStorage.setItem(V20_META,JSON.stringify(v20meta));localStorage.setItem(V20_FILES,JSON.stringify(v20files))}catch(e){message('საცდელი ფაილების შენახვა ვერ მოხერხდა — გადაამოწმე ადგილი')}};
const colorMap={'პირადი':'#42ac83','ოჯახი':'#ed9871','სამუშაო':'#498fe6','ჯანმრთელობა':'#e76e86','სწავლა':'#aa75d7','საყიდლები':'#e3b046','სხვა':'#7b889b'};
const v20BaseTaskHtml=taskHtml;
taskHtml=function(t,d){
 const old=v20BaseTaskHtml(t,d);
 return old.replace('<div class="taskmeta">','<div class="taskmeta"><span class="v20category" style="background:'+ (colorMap[t.category]||colorMap['სხვა']) +'"></span>');
};
const v20BaseOccurs=occurs;
occurs=function(t,day){
 if(t.repeat==='yearly'){
   if(day<t.date)return false;
   const a=fromIso(t.date),b=fromIso(day);
   return a.getDate()===b.getDate()&&a.getMonth()===b.getMonth();
 }
 if(t.repeat==='biweekly'){
   if(day<t.date)return false;
   const a=fromIso(t.date),b=fromIso(day);
   return Math.round((b-a)/86400000)%14===0;
 }
 if(t.repeat==='weekdays'){
   if(day<t.date)return false;
   const dw=fromIso(day).getDay();
   return dw!==0&&dw!==6;
 }
 return v20BaseOccurs(t,day);
};
const v20BaseShift=shift;
shift=function(n){
 if(page==='calendar'&&mode==='year'){
   const d=fromIso(selected);d.setFullYear(d.getFullYear()+n);selected=dateIso(d);render();
 }else v20BaseShift(n);
};
window.v20PickDay=function(iso){selected=iso;mode='day';render()};
window.v20QuickNote=function(){journalNew();show('mydiary');document.getElementById('journalTitle')?.focus()};
function v20Year(){
 if(page!=='calendar'||mode!=='year')return;
 const y=fromIso(selected).getFullYear(),current=dateIso(new Date());
 const week=['ო','ს','ო','ხ','პ','შ','კ'];
 let html='<div class="v20year">';
 for(let m=0;m<12;m++){
   const first=new Date(y,m,1,12),off=(first.getDay()+6)%7;
   const count=new Date(y,m+1,0).getDate();
   const month=first.toLocaleDateString(localeTag(),{month:'short'});
   html+='<div class="v20month"><button class="v20monthTitle" onclick="openMonth('+m+')">'+esc(month)+'</button>';
   html+='<div class="v20week">'+week.map(s=>'<span>'+s+'</span>').join('')+'</div><div class="v20days">';
   for(let e=0;e<off;e++)html+='<span class="v20spacer"></span>';
   for(let day=1;day<=count;day++){
      const ds=dateIso(new Date(y,m,day,12)),has=forDay(ds).length>0||diaryNotes.some(n=>dateIso(new Date(n.createdAt))===ds);
      html+='<button class="v20day '+(has?'marked ':'')+(ds===selected?'selected ':'')+(ds===current?'selected ':'')+(new Date(y,m,day).getDay()===0?'sun':'')+'" onclick="v20PickDay(\''+ds+'\')" title="'+ds+'">'+day+'</button>';
   }
   html+='</div></div>';
 }
 html+='</div>';
 $('calendarGrid').innerHTML=html;
 $('calDate').textContent=String(y);
 $('mode-year').classList.add('active');
}
function v20AddRepeatOptions(){
 const sel=$('taskRepeat');if(!sel||sel.querySelector('option[value="yearly"]'))return;
 [{v:'biweekly',ka:'ყოველ 2 კვირაში',en:'Every 2 weeks'},{v:'weekdays',ka:'სამუშაო დღეებში',en:'Weekdays'},{v:'yearly',ka:'ყოველწლიურად',en:'Yearly'}].forEach(o=>{
  const el=document.createElement('option');el.value=o.v;el.textContent=L(o.ka,o.en);sel.append(el);
 });
}
function v20Widget(){
 const target=$('v20Widget');if(!target)return;
 const day=selected,items=forDay(day),next=items.filter(x=>!done(x,day)).slice(0,3);
 target.innerHTML='<div class="v20widget"><b>▤ '+L('ვიჯეტის წინასწარი ხედი','Widget preview')+'</b>'+
 '<div class="v20banner">'+esc(dateLabel(fromIso(day)))+'</div>'+
 (next.length?next.map(t=>'<div style="padding:5px 0">☐ '+esc(t.title)+'</div>').join(''):'<p class="muted tiny">დღისთვის საქმე არ არის</p>')+
 '<div class="v20banner">ეს მხოლოდ ვიზუალური ნიმუშია. Android მთავარ ეკრანზე ვიჯეტი მოითხოვს მშობლიურ APK-ს.</div></div>';
}
function v20Week(){
 const target=$('v20Week');if(!target)return;
 const end=new Date(),week=Array.from({length:7},(_,n)=>dateIso(addDays(end,n-6)));
 let total=0,doneCount=0,missed=0;const categoryTotals={};
 week.forEach(ds=>forDay(ds).forEach(t=>{
   total++;if(done(t,ds))doneCount++;else if(ds<dateIso(new Date()))missed++;
   categoryTotals[t.category]=(categoryTotals[t.category]||0)+1;
 }));
 const cat=Object.entries(categoryTotals).sort((a,b)=>b[1]-a[1]).slice(0,3);
 target.innerHTML='<div class="panel"><b class="paneltitle">📊 '+L('კვირის მიმოხილვა','Weekly overview')+'</b>'+
 '<p>'+L('დაგეგმილი','Planned')+': <b>'+total+'</b> · '+L('შესრულებული','Completed')+': <b>'+doneCount+'</b> · '+L('გამოტოვებული','Missed')+': <b>'+missed+'</b></p>'+
 '<p class="muted tiny">'+cat.map(([k,v])=>esc(k)+': '+v).join(' · ')+'</p></div>';
}
function v20AddPanel(){
 if(!$('v20Week')){
    const panel=document.createElement('div');panel.id='v20Week';
    document.querySelector('#insights')?.append(panel);
 }
 if(!$('v20Privacy')){
    const block=document.createElement('article');block.className='panel';block.id='v20Privacy';
    block.innerHTML='<b class="paneltitle">🔐 '+L('ჩანაწერების პირადი დაცვა','Private diary')+' (UI Preview)</b>'+
    '<p class="muted tiny">ეს მხოლოდ დიზაინის ნიმუშია. ჩანაწერები ამ პროტოტიპში არ იშიფრება და PIN-ს რეალური დაცვა არ აქვს. ბიომეტრიული დაცვა Android აპში უნდა განხორციელდეს.</p>'+
    '<div class="v20actions"><input id="v20DemoPin" class="fieldinput" type="password" inputmode="numeric" maxlength="6" placeholder="PIN დიზაინი" style="max-width:140px"><button class="secondary" onclick="v20LockVisual()">🔒 '+L('დიზაინის ჩვენება','Preview lock')+'</button></div>';
    document.querySelector('#settings h1')?.insertAdjacentElement('afterend',block);
 }
 if(!$('v20NoteCategory')){
    const label=document.createElement('label');label.className='field';label.textContent='ფერადი კატეგორია';
    const select=document.createElement('select');select.id='v20NoteCategory';select.className='fieldinput';
    Object.keys(colorMap).forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=k;select.append(o)});
    $('journalBody')?.insertAdjacentElement('afterend',select);
    select.insertAdjacentElement('beforebegin',label);
 }
}
window.v20LockVisual=function(){
 const input=$('v20DemoPin');if(!input?.value){message('შეიყვანე საცდელი PIN');return}
 message('PIN ველის დიზაინი შემოწმებულია. ეს არ შიფრავს ან არ კეტავს ნამდვილ მონაცემებს.');
 input.value='';
};
const v20BaseJournalRender=journalRender;
journalRender=function(){
 v20BaseJournalRender();
 const container=$('journalItems');if(!container)return;
 const shown=diaryNotes.filter(n=>!journalSearch||(n.title+' '+n.body).toLocaleLowerCase().includes(journalSearch.toLocaleLowerCase())).slice().sort((a,b)=>b.createdAt-a.createdAt);
 const cards=[...container.querySelectorAll('.journalItem')];
 cards.forEach((card,i)=>{
   const note=shown[i];if(!note)return;
   const pinned=!!v20pins[note.id],cat=v20meta[note.id]||'პირადი';
   card.dataset.v20Id=note.id;
   card.classList.toggle('v20Pinned',pinned);
   const badge=document.createElement('span');badge.style.cssText='display:inline-block;margin:6px 0;border-radius:9px;padding:3px 9px;background:'+colorMap[cat]+';color:white;font-size:11px';badge.textContent=cat;
   card.querySelector('h3')?.insertAdjacentElement('afterend',badge);
   const btn=document.createElement('button');btn.type='button';btn.className='v20pin';
   btn.textContent=pinned?'📌 მოხსნა':'📌 დამაგრება';btn.onclick=()=>v20Pin(note.id);
   card.querySelector('.noteActions')?.prepend(btn);
   const files=v20files[note.id]||[];
   if(files.length){
     const wrap=document.createElement('div');wrap.className='v20attached';
     files.forEach(f=>{
       const a=document.createElement('a');a.href=f.data;a.download=f.name;a.title=f.name;
       if(f.type.startsWith('image/')){const img=document.createElement('img');img.src=f.data;img.alt=f.name;a.append(img)}
       else a.textContent='📎 '+f.name;
       wrap.append(a);
     });
     card.querySelector('.noteActions')?.before(wrap);
   }
 });
 cards.sort((a,b)=>Number(!!v20pins[b.dataset.v20Id])-Number(!!v20pins[a.dataset.v20Id])).forEach(c=>container.append(c));
};
window.v20Pin=function(id){v20pins[id]=!v20pins[id];v20Save();journalRender()};
const v20BaseJournalEdit=journalEdit;
journalEdit=function(id){v20BaseJournalEdit(id);if($('v20NoteCategory'))$('v20NoteCategory').value=v20meta[id]||'პირადი'};
const v20BaseJournalNew=journalNew;
journalNew=function(){v20BaseJournalNew();if($('v20NoteCategory'))$('v20NoteCategory').value='პირადი';if($('v20Attachments'))$('v20Attachments').value=''};
function v20ReadFile(f){
 return new Promise((resolve,reject)=>{const rd=new FileReader();rd.onerror=reject;rd.onload=()=>resolve({name:f.name.slice(0,90),type:f.type||'application/octet-stream',data:rd.result});rd.readAsDataURL(f)});
}
const v20BaseJournalSave=journalSave;
journalSave=async function(e){
 e.preventDefault();
 const id=journalEditing,category=$('v20NoteCategory')?.value||'პირადი';
 const fs=[...($('v20Attachments')?.files||[])].slice(0,3);
 if(fs.some(f=>f.size>300000)){message('თითოეული საცდელი ფაილი უნდა იყოს 300 KB-მდე');return}
 let files=[];
 try{files=await Promise.all(fs.map(v20ReadFile))}catch{message('ფაილის წაკითხვა ვერ მოხერხდა');return}
 if(!$('journalBody').value.trim()){v20BaseJournalSave(e);return}
 v20BaseJournalSave(e);
 const key=id||(diaryNotes[0]&&diaryNotes[0].id);
 if(!key)return;
 v20meta[key]=category;
 if(files.length)v20files[key]=(v20files[key]||[]).concat(files).slice(-4);
 v20Save();journalRender();
};
const v20BaseJournalDelete=journalDelete;
journalDelete=function(id){
 v20BaseJournalDelete(id);
 if(!diaryNotes.some(n=>n.id===id)){delete v20pins[id];delete v20meta[id];delete v20files[id];v20Save()}
};
const v20BaseExport=exportData;
exportData=function(){
 const backup={version:'0.20-preview',exported:new Date().toISOString(),prefs,tasks,goals,checklist,diaryClock,diaryNotes,joker,jokerHistory,v20pins,v20meta,v20files};
 const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='DGIURI_0.20_Preview_Backup_'+dateIso(new Date())+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
};
importData=async function(e){
 const f=e.target.files?.[0];if(!f)return;
 try{
   const obj=JSON.parse(await f.text());
   if(!Array.isArray(obj.tasks)||!Array.isArray(obj.goals))throw Error('bad file');
   if(!confirm(L('ჩავანაცვლოთ მხოლოდ სატესტო ვერსიის მონაცემები?','Replace preview-only data?')))return;
   tasks=obj.tasks;goals=obj.goals;prefs={...prefs,...obj.prefs};
   if(obj.joker&&Array.isArray(obj.joker.players)){joker=jokerImport(obj.joker);jokerSave()}
   if(Array.isArray(obj.jokerHistory)){jokerHistory=obj.jokerHistory;historyPersist()}
   if(Array.isArray(obj.diaryNotes)){diaryNotes=journalClean(obj.diaryNotes);journalPersist()}
   if(Array.isArray(obj.checklist)){checklist=listClean(obj.checklist);listPersist()}
   if(obj.diaryClock&&typeof obj.diaryClock==='object'){diaryClock={...diaryClock,...obj.diaryClock};saveDiaryClock()}
   v20pins=(obj.v20pins&&typeof obj.v20pins==='object')?obj.v20pins:{};
   v20meta=(obj.v20meta&&typeof obj.v20meta==='object')?obj.v20meta:{};
   v20files=(obj.v20files&&typeof obj.v20files==='object')?obj.v20files:{};
   v20Save();persist();render();message(L('სატესტო ასლი აღდგენილია','Preview backup restored'));
 }catch(err){message(L('სარეზერვო ფაილი არასწორია','Invalid backup file'))}
 finally{e.target.value=''}
};
const v20BaseRender=render;
render=function(){
 v20BaseRender();
 v20AddRepeatOptions();
 $('mode-year')?.classList.toggle('active',mode==='year');
 v20Year();v20Widget();v20Week();
 if(page==='calendar'&&(mode==='month'||mode==='week')){
   const d=fromIso(selected),start=new Date(d);
   if(mode==='month')start.setDate(1);
   start.setDate(start.getDate()-((start.getDay()+6)%7));
   document.querySelectorAll('#calendarGrid .day').forEach((el,i)=>{
     const ds=dateIso(addDays(start,i));
     if(diaryNotes.some(n=>dateIso(new Date(n.createdAt))===ds))el.classList.add('has-entry');
   });
 }
 if(page==='mydiary')journalRender();
};
v20AddPanel();
v20AddRepeatOptions();
render();
})();
