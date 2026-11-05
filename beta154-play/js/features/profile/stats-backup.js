/* PIRALI Beta 1.27 — opt-in, offline player statistics backup.
 * No network/fingerprint. Never imports checkpoints, modifies Firebase, or changes name.
 * Import requires the SAME current name and explicit user confirmation; merge is monotonic.
 */
(function(){
'use strict';
const STATS_KEY=window.PiraliVisualPreviewReadonly===true?'pirali_personal_stats_beta_1_0_s1_dev_preview':window.PiraliSeasonReleaseEnabled===true?'pirali_personal_stats_beta_1_0_s1_prod':'pirali_personal_stats_beta_1_0_s1_rc';
const STARS='pirali_beta123_stage_stars_preview',POINTS='pirali_beta124_stage_best_points';
const ALLOWED=['firstBlood','hundredKills','stageThree','stageFive','stageSix','stageEight','stageNine','stageTen','hell','victory','stageEleven','fiveHundredKills','crown'];
const lang=()=>window.PiraliLanguage?.getLanguage?.()||'ka';
const words={
 ka:{button:'💾 სტატისტიკის ასლი',title:'სტატისტიკის შენახვა',export:'⬇ ასლის ჩამოტვირთვა',import:'⬆ ასლის აღდგენა',apply:'✓ აღდგენის დადასტურება',close:'← დაბრუნება',hint:'ასლი ინახება შენს ტელეფონში. აღდგენა აერთიანებს მიღწევებსა და საუკეთესო შედეგებს; არსებულს არ შლის.',invalid:'არასწორი ან დაზიანებული ფაილი.',mismatch:'ასლი სხვა მოთამაშის სახელზეა შექმნილი.',ready:'ფაილი შემოწმებულია. დასადასტურებლად დააჭირე აღდგენას.',done:'სტატისტიკა აღდგენილია. გახსენი ჩემი სტატისტიკა ხელახლა.',blocked:'მოწყობილობაზე შენახვა ვერ მოხერხდა.',empty:'მოთამაშის სახელი ჯერ არ არის დადასტურებული.'},
 en:{button:'💾 BACK UP STATS',title:'Statistics backup',export:'⬇ Download backup',import:'⬆ Restore backup',apply:'✓ Confirm restore',close:'← Back',hint:'Backup is stored on your device. Restoring merges achievements and best results without erasing better records.',invalid:'Invalid or damaged backup file.',mismatch:'This backup belongs to a different player name.',ready:'Backup validated. Confirm to restore.',done:'Stats restored. Reopen My Stats.',blocked:'Cannot save locally on this device.',empty:'Register a player name first.'},
 ru:{button:'💾 КОПИЯ СТАТИСТИКИ',title:'Резервная копия',export:'⬇ Скачать копию',import:'⬆ Восстановить',apply:'✓ Подтвердить восстановление',close:'← Назад',hint:'Файл хранится на устройстве. Восстановление объединяет достижения и рекорды, не удаляя лучшие результаты.',invalid:'Недопустимый или повреждённый файл.',mismatch:'Резервная копия принадлежит другому имени.',ready:'Файл проверен. Подтвердите восстановление.',done:'Статистика восстановлена.',blocked:'Не удалось сохранить на устройстве.',empty:'Сначала зарегистрируйте имя.'},
 zh:{button:'💾 备份统计',title:'统计数据备份',export:'⬇ 下载备份',import:'⬆ 恢复备份',apply:'✓ 确认恢复',close:'← 返回',hint:'备份保存在本机，恢复时合并成就和最好成绩，不覆盖更好的记录。',invalid:'备份无效或已损坏。',mismatch:'备份属于其他玩家姓名。',ready:'备份已验证，请确认恢复。',done:'统计已恢复，请重新打开统计页面。',blocked:'无法写入本机存储。',empty:'请先登记玩家名字。'}
};
const t=k=>(words[lang()]||words.ka)[k];
const safe=(v,max=999999999)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
const name=()=>window.PiraliPlayerIdentity?.getName?.()||null;
const lower=s=>s.normalize('NFKC').trim().toLocaleLowerCase();
function read(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}}
function baseline(){return {runs:0,wins:0,defeats:0,kills:0,bestScore:0,bestRunMs:null,stageBestMs:Array(11).fill(null),achievements:{},maxReachedStage:1};}
function profile(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('profile');
 const v={};
 for(const k of ['runs','wins','defeats','kills','bestScore']){if(!safe(raw[k]))throw Error(k);v[k]=raw[k];}
 if(!(raw.bestRunMs===null||safe(raw.bestRunMs,864000000)))throw Error('bestRun');
 v.bestRunMs=raw.bestRunMs;
 if(!Array.isArray(raw.stageBestMs)||raw.stageBestMs.length!==11)throw Error('stages');
 v.stageBestMs=raw.stageBestMs.map(n=>{if(n!==null&&!safe(n,864000000))throw Error('time');return n;});
 const stage=raw.maxReachedStage===undefined?1:raw.maxReachedStage;
 if(!safe(stage,11)||stage<1)throw Error('stage');
 v.maxReachedStage=stage;
 if(!raw.achievements||typeof raw.achievements!=='object'||Array.isArray(raw.achievements))throw Error('achievements');
 v.achievements={};
 for(const k of ALLOWED){const n=raw.achievements[k];if(n!==undefined){if(!safe(n,9999999999999))throw Error('achievement');if(n>0)v.achievements[k]=n;}}
 return v;
}
function series(raw,max){
 if(raw===null)return {};
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('series');
 const out={};for(let i=1;i<=11;i++){const val=raw[i];if(val===undefined)continue;if(!safe(val,max))throw Error('series val');out[i]=val;}
 return out;
}
const minTime=(x,y)=>x===null?y:y===null?x:Math.min(x,y);
function merge(a,b){
 return {runs:Math.max(a.runs,b.runs),wins:Math.max(a.wins,b.wins),defeats:Math.max(a.defeats,b.defeats),
 kills:Math.max(a.kills,b.kills),bestScore:Math.max(a.bestScore,b.bestScore),bestRunMs:minTime(a.bestRunMs,b.bestRunMs),
 stageBestMs:a.stageBestMs.map((v,i)=>i===10?(v===null?b.stageBestMs[i]:b.stageBestMs[i]===null?v:Math.max(v,b.stageBestMs[i])):minTime(v,b.stageBestMs[i])),
 maxReachedStage:Math.max(a.maxReachedStage,b.maxReachedStage),
 achievements:Object.fromEntries(ALLOWED.filter(k=>a.achievements[k]||b.achievements[k]).map(k=>[k,Math.min(a.achievements[k]||Infinity,b.achievements[k]||Infinity)]))};
}
function exportData(){
 const n=name();if(!n)throw Error('name');
 const db=read(STATS_KEY),existing=db?.version===1&&db.profiles&&typeof db.profiles==='object'?db.profiles[lower(n)]:null;
 let current=existing?profile(existing):baseline();
 const stars=series(read(STARS),3),points=series(read(POINTS),999999999);
 return {format:'PIRALI_LOCAL_STATS',version:1,name:n,profile:current,stars,points};
}
function validate(raw){
 if(!raw||raw.format!=='PIRALI_LOCAL_STATS'||raw.version!==1||typeof raw.name!=='string'||raw.name.length>35)throw Error('format');
 const n=name();if(!n)throw Error('name');if(lower(raw.name)!==lower(n))throw Error('mismatch');
 return {format:raw.format,version:1,name:n,profile:profile(raw.profile),stars:series(raw.stars,3),points:series(raw.points,999999999)};
}
function restore(raw){
 const verified=validate(raw),n=lower(verified.name);
 const db=read(STATS_KEY),saved=db?.version===1&&db.profiles&&typeof db.profiles==='object'&&!Array.isArray(db.profiles)?db:{version:1,profiles:{}};
 const existing=saved.profiles[n];
 saved.profiles[n]=merge(existing?profile(existing):baseline(),verified.profile);
 const star=series(read(STARS),3),point=series(read(POINTS),999999999);
 for(let i=1;i<=11;i++){
  star[i]=Math.max(star[i]||0,verified.stars[i]||0);
  point[i]=Math.max(point[i]||0,verified.points[i]||0);
 }
 // No write occurs until all three payloads are fully validated and serialized.
 const serialized=[JSON.stringify(saved),JSON.stringify(star),JSON.stringify(point)];
 if(serialized[0].length>32000)throw Error('large');
 localStorage.setItem(STATS_KEY,serialized[0]);localStorage.setItem(STARS,serialized[1]);localStorage.setItem(POINTS,serialized[2]);
 return saved.profiles[n];
}
// Automatic device-local safety copy. Kept separate from the normal save key.
const AUTO_KEY=STATS_KEY+'_autocopy_beta1271';
let lastAutoWrite=0;
function autoSave(force=false){
 const now=Date.now();
 if(!force&&now-lastAutoWrite<3000)return false;
 try{
  const data=exportData(),current=read(AUTO_KEY);
  const db=current?.version===1&&current.entries&&typeof current.entries==='object'&&!Array.isArray(current.entries)?current:{version:1,entries:{}};
  const id=lower(data.name);
  db.entries[id]={savedAt:now,data};
  const ids=Object.keys(db.entries);
  if(ids.length>16){
   ids.sort((a,b)=>(db.entries[a]?.savedAt||0)-(db.entries[b]?.savedAt||0));
   for(const old of ids.slice(0,ids.length-16))delete db.entries[old];
  }
  const out=JSON.stringify(db);
  if(out.length>90000)throw Error('local snapshot too large');
  localStorage.setItem(AUTO_KEY,out);
  lastAutoWrite=now;
  return true;
 }catch(e){console.warn('PIRALI automatic local stats backup unavailable',e);return false;}
}
function recover(){
 const n=name();if(!n)return false;
 try{
  const entry=read(AUTO_KEY)?.entries?.[lower(n)]?.data;
  if(!entry)return false;
  const verified=validate(entry);
  const previous=read(STATS_KEY);
  const db=previous?.version===1&&previous.profiles&&typeof previous.profiles==='object'&&!Array.isArray(previous.profiles)?previous:{version:1,profiles:{}};
  const id=lower(n);
  if(db.profiles[id]){
    try{profile(db.profiles[id]);return false;}catch(e){}
  }
  db.profiles[id]=verified.profile;
  const result=JSON.stringify(db);
  if(result.length>32000)throw Error('too large');
  localStorage.setItem(STATS_KEY,result);
  // Existing star records are never lowered by the recovered copy.
  const stars=series(read(STARS),3),points=series(read(POINTS),999999999);
  for(let i=1;i<=11;i++){
   stars[i]=Math.max(stars[i]||0,verified.stars[i]||0);
   points[i]=Math.max(points[i]||0,verified.points[i]||0);
  }
  localStorage.setItem(STARS,JSON.stringify(stars));
  localStorage.setItem(POINTS,JSON.stringify(points));
  return true;
 }catch(e){console.warn('PIRALI stats safety copy could not be restored',e);return false;}
}
// Browsers may close the tab without a normal game-over screen.
document.addEventListener('visibilitychange',()=>{if(document.hidden)autoSave(true);});
window.addEventListener('pagehide',()=>autoSave(true));

let overlay=null;
function open(){
 if(overlay){overlay.style.display='flex';return;}
 const el=document.createElement('div');el.id='pirali-backup-overlay';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
 const card=document.createElement('section');card.className='pirali-backup-card';
 const title=document.createElement('h2'),hint=document.createElement('p'),download=document.createElement('button'),select=document.createElement('button'),apply=document.createElement('button'),close=document.createElement('button'),status=document.createElement('p'),input=document.createElement('input');
 input.type='file';input.accept='.json,application/json';input.hidden=true;apply.disabled=true;let candidate=null;
 function labels(){title.textContent=t('title');hint.textContent=t('hint');download.textContent=t('export');select.textContent=t('import');apply.textContent=t('apply');close.textContent=t('close');}
 labels();document.addEventListener('pirali:languagechange',labels);
 download.type=select.type=apply.type=close.type='button';
 download.onclick=()=>{
  try{
   const data=JSON.stringify(exportData(),null,2),blob=new Blob([data],{type:'application/json'});
   const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='PIRALI-stats-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
   status.textContent=t('hint');
  }catch(e){status.textContent=t('blocked');}
 };
 select.onclick=()=>input.click();
 input.onchange=async()=>{
  candidate=null;apply.disabled=true;
  const file=input.files?.[0];if(!file)return;
  if(file.size>65536){status.textContent=t('invalid');return;}
  try{const parsed=JSON.parse(await file.text());candidate=validate(parsed);status.textContent=t('ready');apply.disabled=false;}
  catch(e){status.textContent=t(e.message==='mismatch'?'mismatch':'invalid');}
  input.value='';
 };
 apply.onclick=()=>{
  if(!candidate)return;
  try{restore(candidate);candidate=null;apply.disabled=true;status.textContent=t('done');}
  catch(e){status.textContent=t(e.message==='mismatch'?'mismatch':'blocked');}
 };
 close.onclick=()=>{el.style.display='none';};
 status.className='pirali-backup-status';status.setAttribute('role','status');card.append(title,hint,download,select,input,apply,status,close);el.appendChild(card);
 document.body.appendChild(el);overlay=el;download.focus();
}
function mount(parent){
 if(!parent||parent.querySelector('.pirali-menu-backup'))return;
 const button=document.createElement('button');button.className='pirali-menu-backup';button.type='button';button.textContent=t('button');
 button.onclick=open;parent.appendChild(button);
 document.addEventListener('pirali:languagechange',()=>{button.textContent=t('button');});
}
window.PiraliStatsBackup=Object.freeze({autoSave,recover,exportData,validate,restore,merge,profile});
})();
