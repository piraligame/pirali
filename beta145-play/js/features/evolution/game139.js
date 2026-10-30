/* PIRALI 1.40 — lookout, commander, ambush and optional story objectives.
 * All scored enemies are reused; no additions to score pools or wave composition.
 */
(function(){
'use strict';
const lang=()=>window.PiraliLanguage?.getLanguage?.()||'ka';
const T=a=>a[{ka:0,en:1,ru:2,zh:3}[lang()]||0];
const goals=[
null,
['ფირალის პირველი წერილი','First outlaw letter','Первое письмо','第一封密信'],
['გაათავისუფლე ტყვე','Rescue the captive','Освободи пленного','解救俘虏'],
['გაანეიტრალე საგუშაგო','Disable the outpost','Устрани пост','摧毁哨站'],
['იპოვე საბუთები','Recover the papers','Найди документы','寻找文件'],
['გადაარჩინე სოფლის მცხოვრები','Rescue a villager','Спаси жителя','救出村民'],
['აღმოაჩინე სამალავი','Find the hideout','Найди тайник','发现藏身处'],
['იპოვე ეკლესიის ხელნაწერი','Recover the manuscript','Найди рукопись','寻找手稿'],
['გააჩუმე მეთვალყურე','Silence the lookout','Останови дозорного','阻止哨兵'],
['გაანეიტრალე შტაბი','Disable the command post','Обезвредь штаб','解除指挥所'],
['იპოვე ცეცხლგამოვლილი წერილი','Recover the scorched letter','Найди письмо','寻找烧焦的信'],
['იპოვე ბოლო წერილი სახლის წინ','Find the final letter before the yard','Найди последнее письмо перед двором','在院子外寻找最后一封信']];
const chapters={
ka:[null,'ჩოხატაურის ტყეში სიმონამ წერილი იპოვა: „როცა სამართალი დუმს, ტყე გზას გვიჩვენებს.“','გოგოლესუბანში გათავისუფლებულმა გლეხმა უთხრა: „სოფელი თავის მცველს არ დაივიწყებს.“','საგუშაგოს ძველ რუკაზე მთებისკენ მიმავალი ბილიკი იყო შემოხაზული.','დამალულ საბუთებზე ერთი სიტყვა ეწერა — თავისუფლება.','გადარჩენილმა მცხოვრებმა სიმონას წყალი და კეთილი სიტყვა გაატანა.','უდაბნოს სამალავში კედელზე ამოკვეთილი იყო: „მარტო არ ხარ.“','ეკლესიის ჩანაწერში ეწერა: „სიბნელეში სინათლე ხსოვნას მოაქვს.“','მეთვალყურის ჩანაწერმა ჯარისკაცების საიდუმლო გზა გაამხილა.','ალყის მოხსნის შემდეგ სოფლისკენ მიმავალი გზა გაიხსნა.','ცეცხლში გადარჩენილ ფურცელზე ჩანდა: „ხსოვნა არასოდეს ქრება.“','ბოლო წერილში სიმონამ წაიკითხა: „გზა სახლისკენაც თავგადასავალია.“'],
en:[null,'The first letter read: “When justice falls silent, the forest shows the way.”','The rescued villager whispered: “A village remembers its protectors.”','The outpost map marked a secret mountain path.','The recovered papers bore one word: “Freedom.”','The villager offered Simona water and a blessing.','Carved into the hideout wall: “You are not alone.”','The church manuscript spoke of light carried by memory.','The lookout notes revealed a hidden soldier route.','The road to the village opened after the siege.','The scorched paper read: “Memory survives.”','The last letter said: “Even the road home is an adventure.”'],
ru:[null,'В письме было сказано: «Когда закон молчит, лес указывает путь».','Спасённый житель сказал: «Деревня помнит своих защитников».','На карте дозора была отмечена горная тропа.','В документах было одно слово: «Свобода».','Житель передал Симоне воду и добрые слова.','На стене тайника было вырезано: «Ты не один».','Рукопись говорила о свете, который несёт память.','Записи дозорного раскрыли тайную дорогу солдат.','После осады дорога к селу открылась.','На обгоревшем листе осталось: «Память живёт».','Последнее письмо гласило: «Дорога домой тоже приключение».'],
zh:[null,'首封密信写着：“正义沉默时，森林会指引道路。”','获救村民说：“村庄永远记得守护者。”','哨站地图标出了一条隐秘山路。','文件上只有一个词：“自由”。','村民向西蒙娜送上水和祝福。','藏身处的墙上刻着：“你并不孤单。”','教堂手稿记载记忆中的光明。','哨兵笔记揭示了隐秘的行军路线。','围困解除后，通往村庄的道路畅通了。','烧焦的纸上写着：“记忆永存。”','最后一封信写着：“回家的路也是冒险。”']};
const key=()=>window.PiraliVisualPreviewReadonly?'pirali139_dev_collection':'pirali139_player_collection';
function load(){try{const x=JSON.parse(localStorage.getItem(key())||'null');if(x&&Array.isArray(x.found)&&Array.isArray(x.unlocked))return x}catch{}return {found:[],unlocked:['classic'],outfit:'classic'}}
let profile=load();
function save(){try{localStorage.setItem(key(),JSON.stringify(profile));}catch{}}
const outfits={classic:['კლასიკური','Classic','Классика','经典'],forest:['ტყის მოსასხამი','Forest cloak','Лесной плащ','森林披风'],shadow:['ღამის მოსასხამი','Night cloak','Ночной плащ','夜幕披风'],gold:['ოქროს არშია','Gold trim','Золотая отделка','金边披风']};
const enabled=()=>window.PiraliDevComparison?.latestEnabled?.()!==false;
let stage=0,scout=null,commander=null,ambush=null,goal=null;
const rescue=n=>n===2||n===5;
const combatQuest=n=>n===8||n===9;
function newStage(){
 stage=level;scout=commander=null;ambush=null;
 const i=level===11?-1:Math.max(3,Math.min(path.length-4,Math.floor(path.length*.52)));
 // House yard gate is at CHURCH_Y+153: last letter is BEFORE the yard.
 const p=level===11?{x:CHURCH_X+30,y:CHURCH_Y+245}:path[i]||{x:P.x,y:P.y-130};
 const x=p.x+(level===11?0:((level%2)?-46:46));
 const kind=rescue(level)?'captive':level===8?'lookout':level===9?'outpost':'letter';
 goal={x,y:p.y,baseX:x,baseY:p.y,kind,level,done:![2,5,8,9,11].includes(level)&&profile.found.includes(level),
   escape:0,runT:0,dir:1,r:level===9?35:level===8?16:12,
   hp:level===9?4:1,alive:true,shotStamp:null};
 if(level===11)return;
 const regular=enemies.filter(e=>e.alive&&!e.isNPC);
 if(regular.length<4)return;
 scout=regular[Math.floor(regular.length*.24)];scout.evoRole='scout';scout.evoWarn=0;scout.evoAlarmed=false;
 if(level>=3){commander=regular[Math.floor(regular.length*.73)];if(commander!==scout)commander.evoRole='commander';}
 if(path.length>10){
  if(level>=2&&level<=9&&regular.length>=8){
   const pool=regular.filter(e=>e!==scout&&e!==commander);
   const pair=pool.slice(-2);
   const at=path[Math.floor(path.length*(.38+level%3*.08))];
   if(pair.length===2&&at){ambush={at,group:pair,triggered:false,delay:0};pair.forEach(e=>e.evoDormant=true);}
  }
 }
}
function dormant(e){return enabled()&&!!e?.evoDormant;}
function heading(e,angle){
 if(!enabled()||!commander?.alive||!e.alive||e===commander||Math.hypot(e.x-commander.x,e.y-commander.y)>220)return angle;
 return angle+(Number(e.groupId)%2===0?.23:-.23);
}
function before(dt){
 if(!enabled()||!running||P.dead)return;
 // Story items and captives activate simply by approaching them.
 if(goal?.done&&rescue(goal.level)&&goal.escape>0)goal.escape+=dt;
 if(goal?.kind==='lookout'&&!goal.done){
  goal.runT+=dt;
  goal.x=goal.baseX+Math.sin(goal.runT*.085)*155;
  goal.y=goal.baseY+Math.sin(goal.runT*.17)*18;
  goal.dir=Math.cos(goal.runT*.085)>=0?1:-1;
 }
 if(goal&&!goal.done&&!combatQuest(level)&&Math.hypot(P.x-goal.x,P.y-goal.y)<49)interact();
 if(scout?.alive&&!scout.evoDormant&&!scout.evoAlarmed){
  const sees=scout.seesSimona&&Math.hypot(P.x-scout.x,P.y-scout.y)<400;
  scout.evoWarn=Math.max(0,(scout.evoWarn||0)+(sees?dt:-dt*2));
  if(scout.evoWarn>=120){
   scout.evoAlarmed=true;showBanner(T(['⚠ განგაში!','⚠ Alarm!','⚠ Тревога!','⚠ 警报！']));
   for(const e of enemies){
    if(!e.alive||e.isNPC||e.evoDormant||Math.hypot(e.x-scout.x,e.y-scout.y)>280)continue;
    e.state='attack';e.alertTimer=125;e.lastSeenX=P.x;e.lastSeenY=P.y;
   }
  }
 }
 if(ambush&&!ambush.triggered&&Math.hypot(P.x-ambush.at.x,P.y-ambush.at.y)<225){
  ambush.triggered=true;ambush.delay=68;
  showBanner(T(['⚠ ჩასაფრება!','⚠ Ambush!','⚠ Засада!','⚠ 埋伏！']));
 }
 if(ambush?.delay>0){
  ambush.delay-=dt;
  if(ambush.delay<=0){
   ambush.group.forEach((e,i)=>{
    if(!e.alive)return;
    const x=ambush.at.x+(i?-150:150),y=ambush.at.y+115;
    e.x=Math.max(25,Math.min(WW-25,x));e.y=Math.max(25,Math.min(WH-25,y));
    e.evoDormant=false;e.patrol.cx=e.x;e.patrol.cy=e.y;
    e.state='alert';e.lastSeenX=P.x;e.lastSeenY=P.y;
   });
  }
 }
}
function completeGoal(){
 if(!enabled()||!running||P.dead||!goal||goal.done||goal.level!==level)return false;
 goal.done=true;goal.alive=false;if(rescue(level))goal.escape=1;
 if(!profile.found.includes(level))profile.found.push(level);
 for(const [count,id] of [[3,'forest'],[7,'shadow'],[10,'gold']])if(profile.found.length>=count&&!profile.unlocked.includes(id))profile.unlocked.push(id);
 save();showBanner((rescue(level)?'🧍 ':level===8?'🔔 ':level===9?'💥 ':'📜 ')+T(goals[level])+' ✓');updateHUD();return true;
}
function interact(){
 if(!goal||combatQuest(level)||Math.hypot(P.x-goal.x,P.y-goal.y)>65)return false;
 return completeGoal();
}
function objectiveTarget(){return enabled()&&running&&goal&&!goal.done&&combatQuest(level)?goal:null}
function hitQuestTarget(target,bullet){
 if(target!==goal||!objectiveTarget()||!bullet?.fp)return false;
 // One trigger pull counts once, even when shotgun fires multiple pellets.
 if(bullet.shot144!=null&&goal.shotStamp===bullet.shot144)return true;
 goal.shotStamp=bullet.shot144??null;
 goal.hp=Math.max(0,goal.hp-1);
 if(typeof spawnPart==='function')for(let i=0;i<7;i++)
  spawnPart(goal.x,goal.y,(Math.random()-.5)*5,(Math.random()-.5)*5,14,level===9?'#ebae59':'#b74426',2);
 if(goal.hp<=0)completeGoal();
 return true;
}
function swordQuestHit(x,y,angle,range,arc){
 if(level!==8||!objectiveTarget())return false;
 const dx=goal.x-x,dy=goal.y-y,d=Math.hypot(dx,dy);
 const delta=Math.atan2(Math.sin(Math.atan2(dy,dx)-angle),Math.cos(Math.atan2(dy,dx)-angle));
 if(d>range+goal.r||Math.abs(delta)>arc)return false;
 return hitQuestTarget(goal,{fp:true});
}
function dead(e){if(enabled()&&e===scout&&!e.evoAlarmed)showBanner(T(['✓ განგაში შეჩერდა','✓ Alarm prevented','✓ Тревога предотвращена','✓ 警报已阻止']));}
let hud;
function elt(tag,cls,content){const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e;}
function ensureHUD(){
 if(hud)return;
 hud=elt('div','pirali139-hud');hud.id='pirali139-hud';
 document.body.append(hud); // Beta 1.44: no button/keyboard press needed.
 document.addEventListener('pirali:languagechange',updateHUD);
}
function updateHUD(){
 ensureHUD();
 const on=enabled()&&running&&!P.dead&&level>=1&&level<=11;
 const wasHidden=hud.hidden;
 hud.hidden=!on;
 if(!on){
  if(!wasHidden)window.PiraliQuestHud141?.request();
  return;
 }
 const label=(rescue(level)?'🧍 ':level===8?'🔔 ':level===9?'🏕️ ':'📜 ')+T(goals[level])+(goal.done?' ✓':'');
 if(wasHidden||hud.textContent!==label){
  hud.textContent=label;
  window.PiraliQuestHud141?.request();
 }
}
function drawVillager(ctx,x,y,run,bound){
 ctx.save();ctx.translate(x,y);ctx.globalAlpha=run>125?Math.max(0,(155-run)/30):1;
 const sway=run>0?Math.sin(run*.38)*4:0;
 ctx.fillStyle='#543e2a';ctx.fillRect(-7,-2,6,12+sway);ctx.fillRect(2,-2,6,12-sway);
 ctx.fillStyle='#c8aa77';ctx.fillRect(-10,-19,20,20);
 ctx.strokeStyle=bound?'#bb7440':'#d6c38e';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(-13,-15);ctx.lineTo(-20+sway,-5);ctx.moveTo(13,-15);ctx.lineTo(18-sway,-4);ctx.stroke();
 ctx.fillStyle='#ddc09d';ctx.beginPath();ctx.arc(0,-25,8,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#382921';ctx.fillRect(-9,-31,18,4);
 if(bound){ctx.strokeStyle='#bb8d53';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,-12);ctx.lineTo(10,-9);ctx.stroke()}
 ctx.restore();
}
function drawWorld(ctx,sx,sy,w,h){
 if(!enabled()||!running||!goal)return;
 if(rescue(level)&&(!goal.done||(goal.escape>0&&goal.escape<155))){
  const run=goal.done?goal.escape:0;
  const x=sx(goal.baseX+Math.sin(run*.08)*Math.min(28,run*.15)),y=sy(goal.baseY-run*1.45);
  if(x>-40&&y>-45&&x<w+40&&y<h+45)drawVillager(ctx,x,y,run,!goal.done);
  return;
 }
 if(goal.done)return;
 const x=sx(goal.x),y=sy(goal.y);
 if(x< -65||y< -65||x>w+65||y>h+65)return;
 ctx.save();ctx.translate(x,y);
 if(goal.kind==='lookout'){
  const step=Math.sin(goal.runT*.5)*7;
  ctx.fillStyle='#312d22';ctx.fillRect(-7,4,5,15+step);ctx.fillRect(3,4,5,15-step);
  ctx.fillStyle='#6d7c38';ctx.fillRect(-11,-16,22,24);
  ctx.strokeStyle='#d1b990';ctx.lineWidth=3;ctx.beginPath();
  ctx.moveTo(-10,-11);ctx.lineTo(-16,-4-step*.5);ctx.moveTo(10,-11);ctx.lineTo(15,-4+step*.5);ctx.stroke();
  ctx.fillStyle='#e2bd92';ctx.beginPath();ctx.arc(0,-23,8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#2a3524';ctx.fillRect(-12,-31,24,6);
  ctx.fillStyle='#ffcf5e';ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText('!',0,-42);
 }else if(goal.kind==='outpost'){
  ctx.fillStyle='#705033';ctx.strokeStyle='#2e2115';ctx.lineWidth=3;
  ctx.fillRect(-29,-24,58,46);ctx.strokeRect(-29,-24,58,46);
  for(let k=0;k<3;k++){ctx.strokeStyle='#b98a53';ctx.beginPath();ctx.moveTo(-26,-12+k*14);ctx.lineTo(26,-12+k*14);ctx.stroke()}
  ctx.fillStyle='#3e3021';ctx.fillRect(-8,-7,16,29);
  ctx.fillStyle='#543019';ctx.beginPath();ctx.moveTo(-39,-23);ctx.lineTo(0,-48);ctx.lineTo(39,-23);ctx.closePath();ctx.fill();
  ctx.fillStyle='#d6ad62';ctx.textAlign='center';ctx.font='bold 12px sans-serif';ctx.fillText('⚑',0,-27);
  for(let k=0;k<4;k++){ctx.fillStyle=k<goal.hp?'#ffcd68':'#54331d';ctx.fillRect(-26+k*14,31,10,6)}
 }else{
  ctx.translate(0,Math.sin(frame*.05)*2);
  ctx.fillStyle='#e5c88a';ctx.strokeStyle='#8b5d2b';ctx.lineWidth=2;
  ctx.fillRect(-12,-8,24,17);ctx.strokeRect(-12,-8,24,17);
  ctx.beginPath();ctx.moveTo(-11,-7);ctx.lineTo(0,1);ctx.lineTo(11,-7);ctx.stroke();
 }
 ctx.restore();
}
function drawMarkers(ctx,sx,sy,w,h){
 if(!enabled()||!running)return;
 for(const e of [scout,commander]){
  if(!e?.alive||e.evoDormant)continue;const x=sx(e.x),y=sy(e.y)-34;
  if(x<0||y<0||x>w||y>h)continue;
  ctx.save();ctx.textAlign='center';ctx.font='bold 15px sans-serif';ctx.fillText(e.evoRole==='scout'?'🔔':'⚑',x,y);
  if(e===scout&&e.evoWarn>0&&!e.evoAlarmed){ctx.fillStyle='#43290e';ctx.fillRect(x-18,y-20,36,4);ctx.fillStyle='#eab449';ctx.fillRect(x-18,y-20,36*Math.min(1,e.evoWarn/120),4);}
  ctx.restore();
 }
}
function drawOutfit(ctx,sx,sy){
 if(!enabled()||profile.outfit==='classic'||!running)return;
 const col={forest:'#32784a',shadow:'#40354d',gold:'#daa847'}[profile.outfit]||'#956b2e';
 ctx.save();ctx.translate(sx(P.x),sy(P.y));ctx.rotate(P.ang+Math.PI/2);
 ctx.strokeStyle=col;ctx.lineWidth=4;ctx.globalAlpha=.88;
 ctx.beginPath();ctx.moveTo(-10,6);ctx.quadraticCurveTo(0,17,10,6);ctx.stroke();ctx.restore();
}
function debug(){return{stage,scout:!!scout,commander:!!commander,ambush:!!ambush,
 quest:goal?{stage:goal.level,done:goal.done,kind:goal.kind,hp:goal.hp,x:goal.x,y:goal.y}:null,found:profile.found.length,scoreModified:false};}
const originalWorld=genWorld;
genWorld=function(...args){const result=originalWorld.apply(this,args);newStage();return result};
const originalUpdate=update;
update=function(dt){if(stage!==level&&running)newStage();before(dt);const result=originalUpdate.apply(this,arguments);updateHUD();return result;};
const originalRender=render;
render=function(...args){const result=originalRender.apply(this,args);drawMarkers(ctx,sx,sy,W,H);drawOutfit(ctx,sx,sy);return result};
const originalKill=killEnemy;killEnemy=function(e,...args){if(e?.alive)dead(e);return originalKill.call(this,e,...args)};
ensureHUD();
window.PiraliEvolution139=Object.freeze({enabled,dormant,heading,drawWorld,interact,objectiveTarget,hitQuestTarget,swordQuestHit,debug,
 getProfile:()=>({found:[...profile.found],unlocked:[...profile.unlocked],outfit:profile.outfit}),
 setOutfit:id=>{if(!profile.unlocked.includes(id))return false;profile.outfit=id;save();return true},
 names:()=>goals,chapter:n=>chapters[lang()]?.[n]||chapters.ka[n],outfits,
 resetStage:newStage});
})();