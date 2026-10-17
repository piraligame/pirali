/* PIRALI Beta — level 5 double-barrel hunting shotgun and shell pickups.
 * Entire feature is isolated here; stable Alpha and Firebase are untouched.
 */
const PiraliBetaGear=(function(){
 'use strict';
 const WORDS={
  ka:{shotgun:'სანადირო თოფი',mauser:'მაუზერი',found:'სანადირო თოფი ნაპოვნია!',shells:'საფანტის ვაზნები',switch:'შეცვალე იარაღი',noAmmo:'ვაზნები ამოგეწურა'},
  en:{shotgun:'Hunting shotgun',mauser:'Mauser',found:'Hunting shotgun acquired!',shells:'Shotgun shells',switch:'Switch weapon',noAmmo:'Out of shells'},
  ru:{shotgun:'Охотничье ружьё',mauser:'Маузер',found:'Найдено охотничье ружьё!',shells:'Патроны для дробовика',switch:'Сменить оружие',noAmmo:'Патроны кончились'},
  zh:{shotgun:'猎枪',mauser:'毛瑟手枪',found:'获得猎枪！',shells:'霰弹',switch:'切换武器',noAmmo:'霰弹已用完'}
 };
 const lang=()=>window.PiraliLanguage?.getLanguage()||'ka';
 const t=k=>(WORDS[lang()]||WORDS.ka)[k];
 let owned=false,ammo=0,selected='mauser',lastNotice=0;
 const originalIcon='assets/icons/mauser-pistol.png?v=20261016a';
 function reset(){
   owned=false;ammo=0;selected='mauser';
   updateUI();
 }
 function scatterOnFinal(path,pickups,level){
   if(level!==5)return;
   const loc=(index,dx,type)=>{const node=path[Math.max(1,Math.min(path.length-2,index))];
     if(node)pickups.push({x:node.x+dx,y:node.y,bob:Math.random()*6.28,col:false,type});};
   loc(3,12,'beta-shotgun');
   loc(5,-55,'beta-shells');loc(11,45,'beta-shells');loc(path.length-7,-55,'beta-shells');
   loc(7,52,'ammo');loc(path.length-9,50,'ammo');
 }
 function pickup(pk){
   if(pk.type==='beta-shotgun'){
     owned=true;ammo=Math.max(ammo,4);selected='shotgun';updateUI();
     if(typeof showFloatingText==='function')showFloatingText(pk.x,pk.y-26,t('found'),'#ffd792');
     return true;
   }
   if(pk.type==='beta-shells'){
     ammo=Math.min(16,ammo+4);updateUI();
     if(typeof showFloatingText==='function')showFloatingText(pk.x,pk.y-24,'+4 '+t('shells'),'#f6c76c');
     return true;
   }
   return false;
 }
 function switchWeapon(){
   if(!owned||typeof running==='undefined'||!running)return false;
   selected=selected==='shotgun'?'mauser':'shotgun';updateUI();return true;
 }
 function fireIfSelected(){
   if(selected!=='shotgun'||!owned)return false;
   if(!running||P.dead||shootCD>0)return true;
   if(ammo<=0){
     if(Date.now()-lastNotice>1600&&typeof showFloatingText==='function')showFloatingText(P.x,P.y-34,t('noAmmo'),'#ffb689');
     lastNotice=Date.now();updateUI();return true;
   }
   ammo--;shootCD=48;updateUI();
   let target=null,best=1e9;
   for(const e of enemies)if(e.alive){const dist=Math.hypot(e.x-P.x,e.y-P.y);if(dist<best){best=dist;target=e}}
   if(boss&&boss.alive){const dist=Math.hypot(boss.x-P.x,boss.y-P.y);if(dist<best){best=dist;target=boss}}
   const angle=target?Math.atan2(target.y-P.y,target.x-P.x):P.ang;
   P.ang=angle;
   const x=P.x+Math.cos(angle)*(P.r+8),y=P.y+Math.sin(angle)*(P.r+8);
   const n=5;
   for(let i=0;i<n;i++){
     const a=angle+(i-(n-1)/2)*.13;
     bullets.push({x,y,vx:Math.cos(a)*BSPD*.84,vy:Math.sin(a)*BSPD*.84,
       fp:true,alive:true,life:62,betaPellet:true});
   }
   if(typeof playGunshot==='function')playGunshot();
   if(typeof PiraliFX!=='undefined'){PiraliFX.shoot(x,y,angle);PiraliFX.shoot(x,y,angle)}
   if(typeof spawnPart==='function')for(let k=0;k<11;k++)
     spawnPart(x,y,(Math.random()-.5)*6,(Math.random()-.5)*6,12,k%2?'#eac284':'#ffb437',2+Math.random()*2);
   return true;
 }
 function updateUI(){
   const button=document.getElementById('beta-weapon-switch');
   const hud=document.getElementById('beta-shell-hud');
   const shoot=document.getElementById('btn-shoot');
   const image=shoot?.querySelector('img');
   if(button){
     button.hidden=!owned||typeof level!=='undefined'&&level!==5;
     button.textContent='↔ '+(selected==='shotgun'?t('mauser'):t('shotgun'));
     button.title=t('switch');
   }
   if(hud){
     hud.hidden=!owned;
     hud.textContent=(selected==='shotgun'?'▰ ':'◇ ')+t('shotgun')+' · '+ammo;
   }
   if(shoot){
     shoot.classList.toggle('beta-shotgun-active',owned&&selected==='shotgun');
     shoot.title=selected==='shotgun'?t('shotgun'):t('mauser');
     shoot.setAttribute('aria-label',shoot.title);
   }
   if(image)image.src=selected==='shotgun'?'assets/icons/hunting-shotgun.svg?v=beta-008b':originalIcon;
 }
 function drawPickup(ctx,pk,x,y){
   if(pk.type!=='beta-shotgun'&&pk.type!=='beta-shells')return false;
   ctx.save();ctx.translate(x,y-5);
   const rad=pk.type==='beta-shotgun'?29:18;
   ctx.globalAlpha=.38+.14*Math.sin(pk.bob*2);
   ctx.strokeStyle='#f5ca77';ctx.lineWidth=2;
   ctx.beginPath();ctx.arc(0,0,rad*.75,0,Math.PI*2);ctx.stroke();
   ctx.globalAlpha=1;ctx.shadowColor='#f2aa45';ctx.shadowBlur=8;
   if(pk.type==='beta-shotgun'){
     ctx.rotate(-.22);
     ctx.fillStyle='#291d1a';ctx.fillRect(-19,-5,40,8);
     ctx.fillStyle='#b99065';ctx.fillRect(-19,-5,13,8);
     ctx.fillStyle='#98a5a8';ctx.fillRect(-6,-4,28,2.8);
     ctx.fillStyle='#5a686b';ctx.fillRect(-6,-.3,28,2.8);
     ctx.fillStyle='#edcd8b';ctx.fillRect(-7,-4,5,7);
   }else{
     ctx.fillStyle='#5b3219';ctx.fillRect(-11,-9,23,17);
     for(let n=0;n<3;n++){
       ctx.fillStyle='#d1ad67';ctx.fillRect(-8+n*7,-6,5,13);
       ctx.fillStyle='#bf3d2a';ctx.fillRect(-8+n*7,3,5,3);
     }
   }
   ctx.restore();return true;
 }
 function initialize(){
   const button=document.getElementById('beta-weapon-switch');
   if(button)button.addEventListener('click',switchWeapon);
   document.addEventListener('keydown',e=>{if((e.key==='v'||e.key==='V')&&!e.repeat)switchWeapon()});
   document.addEventListener('pirali:languagechange',updateUI);
   updateUI();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
 else initialize();
 return Object.freeze({reset,scatterOnFinal,pickup,switchWeapon,fireIfSelected,updateUI,drawPickup,
  status:()=>({owned,shells:ammo,selected})});
})();
