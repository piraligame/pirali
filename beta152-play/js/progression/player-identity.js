/* PIRALI Beta 1.26.1 — required, on-device player registration.
 * Existing valid names, checkpoints, achievements, leaderboard and statistics keep their keys.
 * No device fingerprint, network account, or Firebase identity write.
 */
(function(){
'use strict';
const KEY='pirali_player_name', MAX=14;
const titles={
 ka:{title:'მოთამაშის სახელი',desc:'თამაშის დასაწყებად შეიყვანე სახელი. სახელის გამოტოვება შეუძლებელია.',placeholder:'შენი სახელი',rule:'მინიმუმ 3 ასო · მაქსიმუმ 14 სიმბოლო',invalid:'შეიყვანე მინიმუმ 3 ასო (ციფრები არ ითვლება).',invalidChars:'გამოიყენე ასოები, გამოტოვება, დეფისი ან აპოსტროფი.',confirm:'✓ დადასტურება და გაგრძელება',store:'ვერ მოხერხდა სახელის შენახვა. ჩართე ბრაუზერის ადგილობრივი მეხსიერება.',device:'სახელი და სტატისტიკა ინახება ამ მოწყობილობის ბრაუზერში.',saved:'მოთამაშე'},
 en:{title:'Player name',desc:'Choose a name to start. This step cannot be skipped.',placeholder:'Your name',rule:'At least 3 letters · up to 14 characters',invalid:'Enter at least 3 letters (numbers do not count).',invalidChars:'Use letters, spaces, hyphens or apostrophes.',confirm:'✓ Confirm and continue',store:'Could not save your name. Enable browser local storage.',device:'Your name and stats are kept in this browser on this device.',saved:'Player'},
 ru:{title:'Имя игрока',desc:'Введите имя, чтобы начать игру. Пропустить этот шаг нельзя.',placeholder:'Ваше имя',rule:'Не менее 3 букв · до 14 символов',invalid:'Введите хотя бы 3 буквы (цифры не считаются).',invalidChars:'Используйте буквы, пробелы, дефис или апостроф.',confirm:'✓ Подтвердить и продолжить',store:'Не удалось сохранить имя. Разрешите локальное хранилище браузера.',device:'Имя и статистика сохраняются в этом браузере устройства.',saved:'Игрок'},
 zh:{title:'玩家姓名',desc:'请先填写名字才能开始游戏，无法跳过。',placeholder:'你的名字',rule:'至少3个字母或汉字 · 最多14个字符',invalid:'至少输入3个字母或汉字（数字不算）。',invalidChars:'只能使用文字、空格、连字符或撇号。',confirm:'✓ 确认并继续',store:'无法保存名字，请允许浏览器本地存储。',device:'名字和统计记录保存在本设备的当前浏览器中。',saved:'玩家'}
};
const lang=()=>titles[window.PiraliLanguage?.getLanguage?.()]||titles.ka;
const clean=value=>String(value||'').normalize('NFKC').trim().replace(/\s+/gu,' ');
function check(value){
 const name=clean(value),len=Array.from(name).length;
 const characters=/^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(name);
 const letters=(name.match(/\p{L}/gu)||[]).length;
 return {valid:characters&&letters>=3&&len<=MAX,name,letters,len,characters};
}
function getName(){
 try{
  const raw=localStorage.getItem(KEY);
  const result=check(raw);
  return result.valid?result.name:null;
 }catch(e){return null;}
}
function isRegistered(){return !!getName();}
function migrateLegacyStats(oldName,newName){
 const previous=oldName||'ანონიმი';
 if(previous.toLocaleLowerCase()===newName.toLocaleLowerCase())return;
 // Only one profile key is renamed; no data is erased or uploaded.
 const statsKey=window.PiraliVisualPreviewReadonly===true?'pirali_personal_stats_beta_1_0_s1_dev_preview':
   window.PiraliSeasonReleaseEnabled===true?'pirali_personal_stats_beta_1_0_s1_prod':'pirali_personal_stats_beta_1_0_s1_rc';
 try{
  const raw=localStorage.getItem(statsKey);
  if(!raw||raw.length>32000)return;
  const db=JSON.parse(raw);
  if(db?.version!==1||!db.profiles||typeof db.profiles!=='object'||Array.isArray(db.profiles))return;
  const source=previous.normalize('NFKC').trim().toLocaleLowerCase(),dest=newName.toLocaleLowerCase();
  if(!Object.prototype.hasOwnProperty.call(db.profiles,source)||Object.prototype.hasOwnProperty.call(db.profiles,dest))return;
  db.profiles[dest]=db.profiles[source];
  // Preserve legacy profile as fallback, avoid losing old progress on storage errors.
  localStorage.setItem(statsKey,JSON.stringify(db));
 }catch(e){console.warn('PIRALI: previous stats remain unchanged',e);}
}
let overlay=null,pending=null;
function requireName(callback){
 if(isRegistered()){if(typeof callback==='function')callback();return true;}
 if(typeof callback==='function')pending=callback;
 if(overlay){overlay.querySelector('input')?.focus();return false;}
 const tr=lang(),mask=document.createElement('div');
 overlay=mask;mask.id='pirali-name-registration';mask.setAttribute('role','dialog');mask.setAttribute('aria-modal','true');
 mask.setAttribute('aria-labelledby','pirali-name-heading');
 const form=document.createElement('form');form.className='pirali-name-card';form.noValidate=true;
 const heading=document.createElement('h2');heading.id='pirali-name-heading';heading.textContent=tr.title;
 const desc=document.createElement('p');desc.className='pirali-name-description';desc.textContent=tr.desc;
 const label=document.createElement('label');label.className='pirali-name-label';label.setAttribute('for','pirali-name-input');label.textContent=tr.rule;
 const input=document.createElement('input');input.id='pirali-name-input';input.name='pirali-name';input.type='text';
 input.autocomplete='off';input.spellcheck=false;input.maxLength=28;input.placeholder=tr.placeholder;
 input.setAttribute('aria-describedby','pirali-name-help');input.setAttribute('aria-required','true');
 const help=document.createElement('p');help.id='pirali-name-help';help.className='pirali-name-help';help.textContent=tr.invalid;
 const button=document.createElement('button');button.type='submit';button.className='pirali-name-confirm';button.textContent=tr.confirm;button.disabled=true;
 const note=document.createElement('p');note.className='pirali-name-device';note.textContent=tr.device;
 const redraw=()=>{
  const v=check(input.value);
  button.disabled=!v.valid;
  help.textContent=v.valid?tr.rule:v.letters<3?tr.invalid:tr.invalidChars;
  help.dataset.valid=String(v.valid);
 };
 input.addEventListener('input',redraw);
 form.addEventListener('submit',event=>{
  event.preventDefault();const v=check(input.value);
  if(!v.valid){redraw();input.focus();return;}
  let oldName='';
  try{
   oldName=String(localStorage.getItem(KEY)||'').trim();
   localStorage.setItem(KEY,v.name);
   if(localStorage.getItem(KEY)!==v.name)throw Error('Local storage read-back failed');
  }catch(e){help.textContent=tr.store;help.dataset.valid='false';button.disabled=true;return;}
  migrateLegacyStats(oldName,v.name);
  mask.remove();overlay=null;
  document.dispatchEvent(new CustomEvent('pirali:player-registered',{detail:{name:v.name}}));
  const next=pending;pending=null;
  if(typeof next==='function')next();
 });
 mask.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();}
  if(event.key==='Tab'){
   // Modal cannot be bypassed through keyboard navigation.
   const focusables=[input,button].filter(el=>!el.disabled);
   if(focusables.length===1){event.preventDefault();input.focus();}
   else if(event.shiftKey&&document.activeElement===input){event.preventDefault();button.focus();}
   else if(!event.shiftKey&&document.activeElement===button){event.preventDefault();input.focus();}
  }
 });
 form.append(heading,desc,label,input,help,button,note);mask.appendChild(form);document.body.appendChild(mask);
 input.focus();return false;
}
function mountMenu(card){
 if(!card||card.querySelector('.pirali-player-name'))return;
 const item=document.createElement('div');item.className='pirali-player-name';
 const refresh=()=>{const name=getName();item.hidden=!name;if(name)item.textContent='👤 '+lang().saved+': '+name;};
 card.appendChild(item);refresh();
 document.addEventListener('pirali:languagechange',refresh);
 document.addEventListener('pirali:player-registered',refresh);
}
window.PiraliPlayerIdentity=Object.freeze({check,getName,isRegistered,requireName,mountMenu});
})();
