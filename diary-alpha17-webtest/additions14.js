
/* Alpha 0.14 — independent checklist, combined results, cloud sync bridge. */
const LIST_STORAGE='dgiuri_alpha14_checklist';
function listClean(arr){return Array.isArray(arr)?arr.filter(x=>x&&typeof x==='object'&&typeof x.id==='string'&&/^[a-zA-Z0-9_-]{1,90}$/.test(x.id)&&typeof x.title==='string').slice(0,8000).map(x=>({
 id:x.id,title:x.title.slice(0,200),done:!!x.done,createdAt:Number(x.createdAt)||Date.now(),
 updatedAt:Number(x.updatedAt)||Number(x.createdAt)||Date.now(),completedAt:Number(x.completedAt)||0,
 pinned:!!x.pinned,pinOrder:Number(x.pinOrder)||0
})):[]}
let checklist=[];
try{checklist=listClean(JSON.parse(localStorage.getItem(LIST_STORAGE)||'[]'))}catch(e){console.warn('List recovery failed',e)}
let listFilter='open';
function cloudChanges(){if(!window.__dgiuriCloudApplying)window.dispatchEvent(new Event('dgiuri-data-changed'))}
function listPersist(){try{localStorage.setItem(LIST_STORAGE,JSON.stringify(checklist));cloudChanges()}catch(e){message(L('სიის შენახვა ვერ მოხერხდა','Could not save list'))}}
function listAdd(e){
 e.preventDefault();const input=$('listInput'),title=input.value.trim();if(!title)return;
 const now=Date.now();checklist.unshift({id:'l'+now.toString(36)+Math.random().toString(36).slice(2,9),title,done:false,createdAt:now,updatedAt:now,completedAt:0,pinned:false,pinOrder:0});
 input.value='';listPersist();render()
}
function listToggle(id){const item=checklist.find(x=>x.id===id);if(!item)return;item.done=!item.done;item.updatedAt=Date.now();item.completedAt=item.done?item.updatedAt:0;listPersist();render()}
function listEdit(id){const item=checklist.find(x=>x.id===id);if(!item)return;const response=prompt(v14('listEdit'),item.title);if(response===null)return;const title=response.trim();if(!title)return;item.title=title.slice(0,200);item.updatedAt=Date.now();listPersist();render()}
function listDelete(id){const item=checklist.find(x=>x.id===id);if(!item||!confirm(v14('listDeleteConfirm')))return;checklist=checklist.filter(x=>x.id!==id);listPersist();render()}
function listPin(id){
 const item=checklist.find(x=>x.id===id);if(!item)return;
 const highest=Math.max(0,...checklist.map(x=>Number(x.pinOrder)||0));
 item.pinned=!item.pinned;item.pinOrder=item.pinned?Math.max(Date.now(),highest+1):0;
 item.updatedAt=Date.now();listPersist();render();
}
function listFilterSet(filter){if(!['all','open','done'].includes(filter))return;listFilter=filter;render()}
function listRender(){
 const box=$('listItems');if(!box)return;
 const items=checklist.map((x,index)=>({...x,_index:index}))
 .filter(x=>listFilter==='all'||(listFilter==='done'?x.done:!x.done))
 .sort((a,b)=>Number(b.pinned)-Number(a.pinned)||
   (a.pinned?(Number(b.pinOrder)-Number(a.pinOrder)):0)||(a._index-b._index));
 const count=checklist.filter(x=>x.done).length;
 $('listProgress').textContent=count+'/'+checklist.length;
 $('listProgressFill').style.width=(checklist.length?Math.round(100*count/checklist.length):0)+'%';
 document.querySelectorAll('[data-list-filter]').forEach(el=>el.classList.toggle('active',el.dataset.listFilter===listFilter));
 box.innerHTML=items.map(x=>'<div class="listRow '+(x.done?'done':'')+'"><input type="checkbox" '+(x.done?'checked':'')+' aria-label="'+esc(v14('listDone'))+'" onchange="listToggle(\''+x.id+'\')">'+
 '<span class="listText">'+esc(x.title)+'</span><span class="listActions">'+
 '<button type="button" class="pinButton '+(x.pinned?'active':'')+'" aria-label="Pin" onclick="listPin(\''+x.id+'\')">📌</button>'+
 '<button type="button" aria-label="'+esc(v14('listEdit'))+'" onclick="listEdit(\''+x.id+'\')">✎</button>'+
 '<button type="button" class="danger" aria-label="'+esc(v14('listDelete'))+'" onclick="listDelete(\''+x.id+'\')">×</button></span></div>').join('')||'<p class="empty">'+v14(listFilter==='all'?'listEmpty':'listNoMatches')+'</p>'
}
function listStats(){
 const doneList=checklist.filter(x=>x.done).length,listCount=checklist.length;
 const dates=Array.from({length:7},(_,i)=>dateIso(addDays(new Date(),i-6)));
 let dailyTotal=0,dailyDone=0;
 for(const day of dates){const arr=forDay(day);dailyTotal+=arr.length;dailyDone+=arr.filter(x=>done(x,day)).length}
 const total=dailyTotal+listCount,completed=dailyDone+doneList;
 $('doneStat').textContent=String(completed);
 $('pctStat').textContent=(total?Math.round(completed/total*100):0)+'%';
 $('listStatsText').textContent=v14('listTotal')+': '+doneList+'/'+listCount+'  •  '+(listCount?Math.round(doneList/listCount*100):0)+'%';
 $('summary').textContent=v14('combinedSummary')+': '+completed+'/'+total+'  ('+v14('listTitleShort')+' '+doneList+'/'+listCount+'; '+v14('weekTasks')+' '+dailyDone+'/'+dailyTotal+').';
}
function getCloudData(){
 return {prefs:{...prefs},tasks:JSON.parse(JSON.stringify(tasks)),goals:JSON.parse(JSON.stringify(goals)),
 checklist:JSON.parse(JSON.stringify(checklist)),diaryNotes:JSON.parse(JSON.stringify(diaryNotes)),
 joker:JSON.parse(JSON.stringify(joker)),jokerHistory:JSON.parse(JSON.stringify(jokerHistory)),diaryClock:{...diaryClock}}
}
function mergeIds(serverItems,localItems){
 const map=new Map();
 for(const item of Array.isArray(localItems)?localItems:[]){if(item?.id)map.set(item.id,item)}
 for(const item of Array.isArray(serverItems)?serverItems:[]){if(!item?.id)continue;const old=map.get(item.id);const incoming=Number(item.updatedAt)||Number(item.createdAt)||0;const previous=Number(old?.updatedAt)||Number(old?.createdAt)||0;
   if(!old||incoming>=previous)map.set(item.id,item)}
 return [...map.values()]
}
function applyCloudData(data,{initial=false}={}){
 if(!data||typeof data!=='object')return;
 window.__dgiuriCloudApplying=true;
 try{
   if(Array.isArray(data.tasks))tasks=initial?mergeIds(data.tasks,tasks):data.tasks;
   if(Array.isArray(data.goals))goals=initial?mergeIds(data.goals,goals):data.goals;
   if(Array.isArray(data.checklist))checklist=listClean(initial?mergeIds(data.checklist,checklist):data.checklist);
   if(Array.isArray(data.diaryNotes))diaryNotes=journalClean(initial?mergeIds(data.diaryNotes,diaryNotes):data.diaryNotes);
   if(Array.isArray(data.jokerHistory))jokerHistory=initial?mergeIds(data.jokerHistory,jokerHistory):data.jokerHistory;
   if(data.joker&&Array.isArray(data.joker.players))joker=jokerImport(data.joker);
   if(data.diaryClock&&typeof data.diaryClock==='object')diaryClock={...diaryClock,...data.diaryClock};
   if(data.prefs&&typeof data.prefs==='object')prefs={...prefs,...data.prefs};
   const storeMain=JSON.stringify({prefs,tasks,goals});
   localStorage.setItem('weeklyplus_alpha001',storeMain);
   localStorage.setItem('diary_alpha10_joker',JSON.stringify(joker));
   localStorage.setItem('diary_alpha10_joker_history',JSON.stringify(jokerHistory));
   localStorage.setItem('dgiuri_alpha13_journal',JSON.stringify(diaryNotes));
   localStorage.setItem(LIST_STORAGE,JSON.stringify(checklist));
   localStorage.setItem(DIARY_CLOCK_KEY,JSON.stringify(diaryClock));
   if(typeof selectYear==='function'){} // retain calendar state
   render();
 }finally{window.__dgiuriCloudApplying=false}
}
function resetForAccountChange(){
 window.__dgiuriCloudApplying=true;
 try{
  prefs={english:false,dark:false,reminder:-1,color:'green',language:'ka'};
  tasks=[];goals=[];checklist=[];diaryNotes=[];jokerHistory=[];
  joker=newJoker();
  diaryClock={timerUntil:0,dailyEnabled:false,dailyTime:'08:00',dailyLabel:'მაღვიძარა',nextDaily:0};
  localStorage.setItem('weeklyplus_alpha001',JSON.stringify({prefs,tasks,goals}));
  localStorage.setItem('diary_alpha10_joker',JSON.stringify(joker));
  localStorage.setItem('diary_alpha10_joker_history',JSON.stringify(jokerHistory));
  localStorage.setItem('dgiuri_alpha13_journal',JSON.stringify(diaryNotes));
  localStorage.setItem(LIST_STORAGE,JSON.stringify(checklist));
  localStorage.setItem(DIARY_CLOCK_KEY,JSON.stringify(diaryClock));
  render();
 }finally{window.__dgiuriCloudApplying=false}
}
window.DGIURI_DATA={read:getCloudData,apply:applyCloudData,resetForAccountChange};
function cloudStatus(state,messageText,user){
 const status=$('cloudStatus');if(status)status.textContent=messageText||'';
 const signed=state==='signed-in';
 $('cloudSignedOut').hidden=signed;$('cloudSignedIn').hidden=!signed;
 if(signed&&user){
   $('cloudUserName').textContent=user.displayName||v14('cloudUser');
   $('cloudUserEmail').textContent=user.email||'';
   const avatar=$('cloudAvatar');
   if(user.photoURL&&/^https:\/\//.test(user.photoURL)){avatar.src=user.photoURL;avatar.hidden=false}else{avatar.hidden=true;avatar.removeAttribute('src')}
 }
}
window.DGIURI_CLOUD_STATUS=cloudStatus;
function queueCloudSync(){cloudChanges()}
for(const name of ['persist','jokerSave','historyPersist','journalPersist','saveDiaryClock']){
 const original=window[name];
 if(typeof original==='function'){
   window[name]=function(...args){const result=original.apply(this,args);queueCloudSync();return result};
 }
}

Object.assign(V13_WORDS,{
 list:['სია','List','Список','Lista','Liste','Liste','Lijst','清单'],
 listTitle:['☑ საერთო სია','☑ General list','☑ Общий список','☑ Lista general','☑ Liste générale','☑ Allgemeine Liste','☑ Algemene lijst','☑ 总清单'],
 listTitleShort:['სია','List','Список','Lista','Liste','Liste','Lijst','清单'],
 listDesc:['შენი დიდი საერთო სია • შესრულებული წითლად გადაიხაზება','Your big checklist • completed items turn red and are struck through','Большой список • выполненное зачёркивается красным','Lista general • las tareas realizadas se tachan en rojo','Liste générale • éléments terminés barrés en rouge','Gesamtliste • erledigte Aufgaben werden rot durchgestrichen','Algemene lijst • voltooide taken rood doorgestreept','总清单 • 已完成项目用红色划掉'],
 listAdd:['＋ დამატება','＋ Add','＋ Добавить','＋ Añadir','＋ Ajouter','＋ Hinzufügen','＋ Toevoegen','＋ 添加'],
 listAddShort:['დამატება','Add','Добавить','Añadir','Ajouter','Hinzufügen','Toevoegen','添加'],
 listAll:['ყველა','All','Все','Todos','Tous','Alle','Alle','全部'],
 listOpen:['შესასრულებელი','To do','К выполнению','Pendiente','À faire','Offen','Open','待办'],
 listDone:['შესრულებული','Completed','Выполнено','Completado','Terminé','Erledigt','Voltooid','已完成'],
 listEmpty:['ჯერ არაფერია სიაში — დაამატე პირველი საქმე.','Your list is empty. Add the first item.','Пока пусто — добавьте первую задачу.','Lista vacía. Añade tu primera tarea.','Liste vide. Ajoutez la première tâche.','Liste leer. Erste Aufgabe hinzufügen.','Lijst leeg. Voeg je eerste taak toe.','清单为空，添加第一条。'],
 listNoMatches:['ამ კატეგორიაში საქმე არ არის.','No items in this category.','В этой категории нет задач.','No hay tareas en esta categoría.','Aucune tâche ici.','Keine Aufgaben in dieser Kategorie.','Geen taken in deze categorie.','此分类暂无项目。'],
 listEdit:['საქმის რედაქტირება','Edit item','Изменить задачу','Editar tarea','Modifier la tâche','Aufgabe bearbeiten','Taak bewerken','编辑项目'],
 listDelete:['წაშლა','Delete','Удалить','Eliminar','Supprimer','Löschen','Verwijderen','删除'],
 listDeleteConfirm:['წავშალოთ ეს საქმე სიიდან?','Delete this list item?','Удалить эту задачу из списка?','¿Eliminar esta tarea?','Supprimer cette tâche ?','Diese Aufgabe löschen?','Deze taak verwijderen?','删除此项目？'],
 listStatsTitle:['საერთო სიის შედეგები','General list results','Результаты общего списка','Resultados de la lista','Statistiques de la liste','Ergebnisse der Liste','Resultaten van de lijst','总清单统计'],
 listTotal:['სიაში შესრულებულია','Completed in list','В списке выполнено','Completadas en lista','Terminées dans la liste','In Liste erledigt','Voltooid in lijst','清单已完成'],
 combinedSummary:['საერთო სტატისტიკა','Overall results','Общая статистика','Estadísticas generales','Statistiques globales','Gesamtergebnis','Totale statistieken','总统计'],
 weekTasks:['ბოლო 7 დღის საქმეები','Last 7 days','Задачи за 7 дней','Últimos 7 días','7 derniers jours','Letzte 7 Tage','Laatste 7 dagen','最近7天'],
 cloudTitle:['Google ანგარიში და სინქრონიზაცია','Google account & sync','Google-аккаунт и синхронизация','Cuenta Google y sincronización','Compte Google et synchronisation','Google-Konto und Synchronisierung','Google-account en synchronisatie','Google 帐号与同步'],
 cloudInfo:['Google-ით შესვლის შემდეგ შენი საქმეები, სია, ჩანაწერები, ჯოკერი და სტატისტიკა ანგარიშს დაუკავშირდება. ამისთვის სერვერთან კავშირია საჭირო.','Sign in with Google to sync tasks, list, notes, Joker and results across devices. Requires internet.','Войдите через Google для синхронизации задач, списка, заметок и Джокера. Нужен интернет.','Inicia sesión con Google para sincronizar tareas, lista, notas y Joker entre dispositivos. Se requiere internet.','Connectez-vous avec Google pour synchroniser vos tâches, listes et notes. Internet requis.','Mit Google anmelden, um Aufgaben, Listen, Notizen und Joker zu synchronisieren. Internet erforderlich.','Meld je aan met Google om taken, lijst, notities en Joker te synchroniseren. Internet nodig.','使用 Google 登录以在设备间同步任务、清单、笔记和小丑牌，需要网络连接。'],
 cloudLogin:['Google-ით შესვლა','Sign in with Google','Войти через Google','Iniciar con Google','Connexion Google','Mit Google anmelden','Inloggen met Google','使用 Google 登录'],
 cloudLogout:['გასვლა','Sign out','Выйти','Salir','Déconnexion','Abmelden','Uitloggen','退出登录'],
 cloudSync:['სინქრონიზაცია','Sync now','Синхронизировать','Sincronizar','Synchroniser','Jetzt synchronisieren','Nu synchroniseren','立即同步'],
 cloudUser:['მომხმარებელი','Account','Пользователь','Cuenta','Compte','Konto','Account','用户'],
 alarmVolume:['🔊 ბრაუზერის სიგნალის სიმძლავრე','🔊 Browser alarm volume','🔊 Громкость сигнала браузера','🔊 Volumen del navegador','🔊 Volume du navigateur','🔊 Browser-Signalton','🔊 Volume browseralarm','🔊 浏览器闹铃音量'],
 alarmCaution:['ბრაუზერი ვერ იყენებს ტელეფონის სისტემურ მაღვიძარას და ვერ ცვლის ტელეფონის ხმის პარამეტრებს. დახურულ გვერდზე ზარი გარანტირებული არ არის.','A browser cannot use the phone’s native alarm ringtone or change system volume. No guaranteed alarm when the page is closed.','Браузер не может использовать стандартный будильник или системную громкость телефона. В закрытом браузере сигнал не гарантирован.','El navegador no puede usar la alarma nativa ni ajustar el volumen del sistema. No suena de forma fiable con la página cerrada.','Le navigateur ne peut pas utiliser la sonnerie native ni régler le volume système. Rien de garanti après fermeture.','Ein Browser kann den Handy-Weckton und die Systemlautstärke nicht steuern. Bei geschlossener Seite kein garantierter Alarm.','De browser kan de systeemwekker of het apparaatvolume niet instellen. Bij gesloten pagina geen gegarandeerd alarm.','浏览器不能使用手机系统闹铃或调整系统音量。关闭网页后无法保证响铃。']
});
function v14(k){return v13(k)}
$('listInput').placeholder=v14('listAdd');
let browserAlarmVolume=Number(localStorage.getItem('dgiuri_alpha14_alarm_volume')||95);
browserAlarmVolume=Math.min(100,Math.max(10,Number.isFinite(browserAlarmVolume)?browserAlarmVolume:95));
function alarmVolumeChanged(v){browserAlarmVolume=Math.max(10,Math.min(100,Number(v)||95));localStorage.setItem('dgiuri_alpha14_alarm_volume',String(browserAlarmVolume));$('browserAlarmVolumeValue').textContent=browserAlarmVolume+'%'}
function v14Translate(){
 document.querySelectorAll('[data-v14]').forEach(el=>el.textContent=v14(el.dataset.v14));
 $('listInput').placeholder=v14('listAdd');
 $('browserAlarmVolume').value=String(browserAlarmVolume);
 $('browserAlarmVolumeValue').textContent=browserAlarmVolume+'%';
 listRender();
 listStats();
}
const v14BaseRender=render;
render=function(){v14BaseRender();v14Translate()};
const oldDismissWebAlarm=dismissWebAlarm;
let alertSources=[];
soundWebAlarm=function(){
 try{
  alarmAudioUnlock();
  if(!diaryAudio)return;
  const ac=diaryAudio,base=ac.currentTime,level=(browserAlarmVolume/100)*.36;
  for(let i=0;i<12;i++){
    const time=base+i*.47;
    for(const [index,frequency] of [790,1050].entries()){
      const osc=ac.createOscillator(),gain=ac.createGain();
      osc.type='sine';osc.frequency.setValueAtTime(frequency,time);
      gain.gain.setValueAtTime(.0001,time);
      gain.gain.linearRampToValueAtTime(Math.max(.0001,level),time+.045);
      gain.gain.setValueAtTime(Math.max(.0001,level),time+.29);
      gain.gain.exponentialRampToValueAtTime(.0001,time+.41);
      osc.connect(gain);gain.connect(ac.destination);
      osc.start(time+index*.012);osc.stop(time+.43);
      alertSources.push(osc);
    }
  }
  if(navigator.vibrate)navigator.vibrate([450,180,450,180,450]);
 }catch(e){console.warn('Web alarm sound failed',e)}
}
dismissWebAlarm=function(){
 alertSources.forEach(osc=>{try{osc.stop()}catch(e){}});
 alertSources=[];
 oldDismissWebAlarm();
};
window.addEventListener('dgiuri-data-changed',()=>{const c=window.dgiuriCloud;if(c&&c.state==='signed-in')c.scheduleSync()});
render();
