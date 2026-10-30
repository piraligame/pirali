/* PIRALI 1.39 — patrol, lookout, leader, stealth, fair ambush and side objectives.
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
['იპოვე ბოლო წერილი სახლში','Find the last letter','Найди последнее письмо','寻找最后的信']];
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
let stage=0,scout=null,commander=null,grass=[],ambush=null,goal=null,sneak=false,noise=0;
function newStage(){
 stage=level;scout=commander=null;grass=[];ambush=null;sneak=false;noise=0;
 const i=level===11?-1:Math.max(3,Math.min(path.length-4,Math.floor(path.length*.52)));
 const p=level===11?{x:CHURCH_X+98,y:CHURCH_Y+65}:path[i]||{x:P.x,y:P.y-130};
 goal={x:p.x+((level%2)?-46:46),y:p.y,done:profile.found.includes(level),level};
 if(level===11)return;
 const regular=enemies.filter(e=>e.alive&&!e.isNPC);
 if(regular.length<4)return;
 scout=regular[Math.floor(regular.length*.24)];scout.evoRole='scout';scout.evoWarn=0;scout.evoAlarmed=false;
 if(level>=3){commander=regular[Math.floor(regular.length*.73)];if(commander!==scout)commander.evoRole='commander';}
 if(path.length>10){
  for(const factor of [.3,.6])for(const side of [-1,1]){
   const pt=path[Math.floor(path.length*factor)];
   if(pt)grass.push({x:pt.x+side*52,y:pt.y+side*38,r:40});
  }
  if(level>=2&&level<=9&&regular.length>=8){
   const pool=regular.filter(e=>e!==scout&&e!==commander);
   const pair=pool.slice(-2);
   const at=path[Math.floor(path.length*(.38+level%3*.08))];
   if(pair.length===2&&at){ambush={at,group:pair,triggered:false,delay:0};pair.forEach(e=>e.evoDormant=true);}
  }
 }
}
function inCover(){return grass.some(p=>Math.hypot(P.x-p.x,P.y-p.y)<p.r+20)||trees.some(t=>t.kind==='bush'&&Math.hypot(P.x-t.x,P.y-t.y)<t.r+25);}
function canDetect(e,v,d){if(!enabled()||!sneak||!v||level===11||noise>0||!inCover())return v;return d<175;}
function speedFactor(){return enabled()&&sneak?.55:1;}
function breakStealth(){if(sneak){sneak=false;noise=150;updateHUD();}}
function dormant(e){return enabled()&&!!e?.evoDormant;}
function heading(e,angle){
 if(!enabled()||!commander?.alive||!e.alive||e===commander||Math.hypot(e.x-commander.x,e.y-commander.y)>220)return angle;
 return angle+(Number(e.groupId)%2===0?.23:-.23);
}
function before(dt){
 if(!enabled()||!running||P.dead)return;
 noise=Math.max(0,noise-dt);
 if(sneak&&dashing)breakStealth();
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
function interact(){
 if(!enabled()||!running||P.dead||!goal||goal.done||goal.level!==level||Math.hypot(P.x-goal.x,P.y-goal.y)>65)return false;
 goal.done=true;if(!profile.found.includes(level))profile.found.push(level);
 for(const [count,id] of [[3,'forest'],[7,'shadow'],[10,'gold']])if(profile.found.length>=count&&!profile.unlocked.includes(id))profile.unlocked.push(id);
 save();showBanner('📜 '+T(goals[level])+' ✓');updateHUD();return true;
}
function dead(e){if(enabled()&&e===scout&&!e.evoAlarmed)showBanner(T(['✓ განგაში შეჩერდა','✓ Alarm prevented','✓ Тревога предотвращена','✓ 警报已阻止']));}
let hud,quiet,interactButton;
function elt(tag,cls,content){const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e;}
function ensureHUD(){
 if(hud)return;
 hud=elt('div','pirali139-hud');hud.id='pirali139-hud';
 quiet=elt('button','pirali139-quiet');quiet.type='button';
 quiet.onclick=()=>{if(!enabled()||level===11||!running)return;sneak=!sneak;updateHUD()};
 interactButton=elt('button','pirali139-interact');interactButton.type='button';interactButton.onclick=interact;
 document.body.append(hud,quiet,interactButton);
 document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='e'&&running)interact()});
 document.addEventListener('pirali:languagechange',updateHUD);
}
function updateHUD(){
 ensureHUD();
 const on=enabled()&&running&&!P.dead&&level>=1&&level<=11;
 hud.hidden=!on;quiet.hidden=!on||level===11;
 interactButton.hidden=!on||!goal||goal.done||Math.hypot(P.x-goal.x,P.y-goal.y)>65;
 if(!on)return;
 hud.textContent='📜 '+T(goals[level])+(goal.done?' ✓':'');
 quiet.textContent=sneak?T(['🌿 ჩუმად: ჩართული','🌿 SNEAK ON','🌿 СКРЫТНО','🌿 潜行开启']):T(['🌿 ჩუმად','🌿 SNEAK','🌿 СКРЫТНО','🌿 潜行']);
 quiet.setAttribute('aria-pressed',String(sneak));
 interactButton.textContent=T(['✋ აიღე','✋ INTERACT','✋ ВЗЯТЬ','✋ 拾取']);
}
function drawWorld(ctx,sx,sy,w,h){
 if(!enabled()||!running)return;
 for(const g of grass){
  const x=sx(g.x),y=sy(g.y);if(x<-60||y<-60||x>w+60||y>h+60)continue;
  ctx.save();ctx.translate(x,y);ctx.strokeStyle='#658d4b';ctx.lineWidth=3;
  for(let i=0;i<9;i++){
   const a=i*2.4,r=10+i%3*11;
   ctx.beginPath();ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);ctx.quadraticCurveTo(0,-25,Math.cos(a+.4)*(r+4),-39-i%3*5);ctx.stroke();
  }ctx.restore();
 }
 if(goal&&!goal.done){
  const x=sx(goal.x),y=sy(goal.y);if(x>-25&&y>-25&&x<w+25&&y<h+25){
   ctx.save();ctx.translate(x,y+Math.sin(frame*.05)*2);ctx.fillStyle='#e5c88a';ctx.strokeStyle='#8b5d2b';ctx.lineWidth=2;
   ctx.fillRect(-12,-8,24,17);ctx.strokeRect(-12,-8,24,17);
   ctx.beginPath();ctx.moveTo(-11,-7);ctx.lineTo(0,1);ctx.lineTo(11,-7);ctx.stroke();
   ctx.restore();
  }
 }
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
function debug(){return{stage,scout:!!scout,commander:!!commander,grass:grass.length,ambush:!!ambush,
 quest:goal?{stage:goal.level,done:goal.done}:null,sneak,found:profile.found.length,scoreModified:false};}
const originalWorld=genWorld;
genWorld=function(...args){const result=originalWorld.apply(this,args);newStage();return result};
const originalUpdate=update;
update=function(dt){if(stage!==level&&running)newStage();before(dt);const result=originalUpdate.apply(this,arguments);updateHUD();return result;};
const originalRender=render;
render=function(...args){const result=originalRender.apply(this,args);drawMarkers(ctx,sx,sy,W,H);drawOutfit(ctx,sx,sy);return result};
const originalShoot=shoot;shoot=function(...args){breakStealth();return originalShoot.apply(this,args)};
const originalDash=dash;dash=function(...args){breakStealth();return originalDash.apply(this,args)};
const originalKill=killEnemy;killEnemy=function(e,...args){if(e?.alive)dead(e);return originalKill.call(this,e,...args)};
ensureHUD();
window.PiraliEvolution139=Object.freeze({enabled,canDetect,speedFactor,dormant,heading,drawWorld,interact,debug,
 getProfile:()=>({found:[...profile.found],unlocked:[...profile.unlocked],outfit:profile.outfit}),
 setOutfit:id=>{if(!profile.unlocked.includes(id))return false;profile.outfit=id;save();return true},
 names:()=>goals,chapter:n=>chapters[lang()]?.[n]||chapters.ka[n],outfits,
 resetStage:newStage});
})();