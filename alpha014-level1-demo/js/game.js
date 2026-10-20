/* PIRALI Alpha 0.14 / isolated one-level playable vertical slice.
 * No Firebase, online score, Google Play packaging or writes to alpha 0.13. */
(function(){
'use strict';
const W=PiraliDemoWorld,A=PiraliDemoActors,canvas=document.getElementById('game'),c=canvas.getContext('2d',{alpha:false});
const mapCanvas=document.getElementById('map'),mc=mapCanvas.getContext('2d');
const ui={
 health:document.getElementById('healthFill'),healthText:document.getElementById('healthText'),
 counter:document.getElementById('counter'),objective:document.getElementById('objective'),
 weaponTitle:document.getElementById('weaponTitle'),weaponInfo:document.getElementById('weaponInfo'),
 toast:document.getElementById('toast'),intro:document.getElementById('intro'),
 outcome:document.getElementById('outcome'),outcomeTitle:document.getElementById('outcomeTitle'),
 outcomeText:document.getElementById('outcomeText'),start:document.getElementById('start'),
 restart:document.getElementById('restart')
};
const TAU=Math.PI*2,keys=new Set(),bullets=[],sparks=[],rings=[];
const state={running:false,ended:false,kills:0,startedAt:0,lastFrame:0,ammo:8,reserve:40,shells:18,gun:'mauser',reloadUntil:0,
 hurtUntil:0,fireUntil:0,slashUntil:0,dashUntil:0,dashLeft:0,toastUntil:0,
 mouse:{x:0,y:0,active:false},fireHeld:false,mobile:matchMedia('(pointer:coarse)').matches||innerWidth<760};
let player,foes=[],screenW=0,screenH=0,dpr=1,zoom=1,camX=0,camY=0,lastMap=0;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const distance=(x,y,X,Y)=>Math.hypot(X-x,Y-y);
const angleTo=(x,y,X,Y)=>Math.atan2(Y-y,X-x);
function reset(){
 Object.assign(state,{running:false,ended:false,kills:0,ammo:8,reserve:40,shells:18,
  gun:'mauser',reloadUntil:0,hurtUntil:0,fireUntil:0,slashUntil:0,dashUntil:0,
  dashLeft:0,toastUntil:0,fireHeld:false,startedAt:performance.now()});
 const s=W.start;
 player={x:s.x,y:s.y,angle:-Math.PI/2,vx:0,vy:0,health:100,maxHealth:100,
  weapon:'mauser',slash:0,recoil:0,flash:0,phase:0,hit:0};
 foes=W.enemySpawns.map((p,i)=>({
  id:i,x:p.x,y:p.y,angle:Math.PI/2,rank:p.kind,
  vx:0,vy:0,health:i===3?70:50,maxHealth:i===3?70:50,
  alive:true,phase:i*.8,slash:0,recoil:0,flash:0,hit:0,fireAt:0,notice:false
 }));
 bullets.length=0;sparks.length=0;rings.length=0;ui.outcome.classList.add('hidden');
 ui.intro.classList.remove('hidden');updateHUD();
}
function begin(){
 resetWithoutIntro();ui.intro.classList.add('hidden');ui.outcome.classList.add('hidden');
 toast('ტური 1 — ჩოხატაური · ოთხი მოწინააღმდეგე და ეკლესია',3000);
}
function resetWithoutIntro(){
 Object.assign(state,{running:true,ended:false,kills:0,ammo:8,reserve:40,shells:18,gun:'mauser',
  reloadUntil:0,hurtUntil:0,fireUntil:0,slashUntil:0,dashUntil:0,dashLeft:0,
  startedAt:performance.now(),fireHeld:false});
 const sp=W.start;
 player={x:sp.x,y:sp.y,angle:-Math.PI/2,vx:0,vy:0,health:100,maxHealth:100,weapon:'mauser',slash:0,recoil:0,flash:0,phase:0,hit:0};
 foes=W.enemySpawns.map((p,i)=>({
  id:i,x:p.x,y:p.y,angle:Math.PI/2,rank:p.kind,
  vx:0,vy:0,health:i===3?70:50,maxHealth:i===3?70:50,
  alive:true,phase:i*.8,slash:0,recoil:0,flash:0,hit:0,
  fireAt:performance.now()+i*420,notice:false
 }));
 bullets.length=0;sparks.length=0;rings.length=0;updateHUD();
}
function toast(text,ms=1500){
 ui.toast.textContent=text;ui.toast.classList.add('show');
 state.toastUntil=performance.now()+ms;
}
function end(won){
 state.running=false;state.ended=true;state.fireHeld=false;
 ui.outcome.classList.remove('hidden');
 ui.outcomeTitle.textContent=won?'ტური დასრულებულია!':'სიმონა დაიღუპა';
 const elapsed=Math.round((performance.now()-state.startedAt)/1000);
 ui.outcomeText.textContent=won?
  'ახალი სიმონასა და ჩოხატაურის გარემოს დემო დასრულდა. დრო: '+elapsed+' წმ. ოთხივე მოწინააღმდეგე დამარცხებულია.':
  'სატესტო დონე თავიდან სცადე. გამოიყენე დისტანცია, მაუზერი, სანადირო თოფი და ხმალი.';
}
function reload(t=performance.now()){
 if(!state.running||state.gun!=='mauser'||state.ammo>=8||state.reserve<=0||state.reloadUntil>t)return;
 state.reloadUntil=t+1050;toast('მაუზერის გადატენვა…',900);
}
function nearestEnemy(range=Infinity){
 let best=null,d=range;
 for(const e of foes)if(e.alive){
  const z=distance(player.x,player.y,e.x,e.y);
  if(z<d){best=e;d=z}
 }
 return best;
}
function addSparks(x,y,color,n=7){
 for(let i=0;i<n;i++){
  const a=Math.random()*TAU,v=35+Math.random()*120;
  sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.25+Math.random()*.5,
  max:.75,color,r:1+Math.random()*2.3});
 }
}
function toggleGun(){
 if(!state.running)return;
 state.gun=state.gun==='mauser'?'shotgun':'mauser';
 toast(state.gun==='shotgun'?'სანადირო თოფი':'მაუზერი',650);
 updateHUD();
}
function sword(t=performance.now()){
 if(!state.running||t<state.slashUntil)return;
 state.slashUntil=t+650;player.slash=1;
 // The slash arc points in facing direction and deals real demo damage.
 for(const e of foes)if(e.alive){
  const d=distance(player.x,player.y,e.x,e.y);
  const angle=angleTo(player.x,player.y,e.x,e.y);
  const delta=Math.atan2(Math.sin(angle-player.angle),Math.cos(angle-player.angle));
  if(d<97&&Math.abs(delta)<1.45)hit(e,54);
 }
 rings.push({x:player.x,y:player.y,r:34,color:'#f0d7ab',life:.16,max:.16});
 addSparks(player.x+Math.cos(player.angle)*42,player.y+Math.sin(player.angle)*42,'#e4d4a6',5);
}
function dash(t=performance.now()){
 if(!state.running||t<state.dashUntil)return;
 state.dashUntil=t+900;state.dashLeft=.18;
 addSparks(player.x,player.y,'#d8c78e',11);
}
function hit(e,amount){
 if(!e.alive)return;
 e.health-=amount;e.hit=.24;
 addSparks(e.x,e.y,'#ddad78',9);
 if(e.health<=0){
  e.alive=false;state.kills++;
  rings.push({x:e.x,y:e.y,r:17,color:'#e2c080',life:.4,max:.4});
  toast('მოწინააღმდეგე დამარცხებულია • '+state.kills+'/4',1100);
  if(state.kills===4)toast('ყველა დამარცხებულია! მიაღწიე ეკლესიის კარს.',3500);
 }
 updateHUD();
}
function shoot(t=performance.now()){
 if(!state.running||t<state.fireUntil||state.reloadUntil>t)return;
 const shotgun=state.gun==='shotgun';
 if(shotgun&&state.shells<=0){toast('სანადირო ვაზნები გათავდა — Q: მაუზერი',1000);return;}
 if(!shotgun&&state.ammo<=0){reload(t);return;}
 const a=player.angle,spread=shotgun?5:1;
 state.fireUntil=t+(shotgun?720:230);
 if(shotgun)state.shells--;else state.ammo--;
 player.recoil=1;player.flash=1;
 const ox=player.x+Math.cos(a)*(shotgun?50:39),oy=player.y+Math.sin(a)*(shotgun?50:39);
 for(let i=0;i<spread;i++){
  const ang=a+(i-(spread-1)/2)*(shotgun?.11:0)+(!shotgun?(Math.random()-.5)*.02:0);
  bullets.push({x:ox,y:oy,vx:Math.cos(ang)*(shotgun?650:880),vy:Math.sin(ang)*(shotgun?650:880),
   fromEnemy:false,life:shotgun?.48:.66,damage:shotgun?16:27,r:shotgun?2.2:2.3});
 }
 addSparks(ox,oy,'#ffd68a',shotgun?15:8);
 rings.push({x:ox,y:oy,r:shotgun?13:9,color:'#f9cf84',life:.13,max:.13});
 updateHUD();
}
function updateHUD(){
 if(!player)return;
 ui.health.style.width=clamp(player.health,0,100)+'%';
 ui.healthText.textContent='ჯანმრთელობა '+Math.round(player.health)+' / 100';
 ui.counter.textContent='მოწინააღმდეგე: '+(4-state.kills)+' / 4';
 ui.objective.textContent=state.kills===4?'შედი ეკლესიის კარში':'გაანეიტრალე 4 მოწინააღმდეგე, მიაღწიე ეკლესიას';
 ui.weaponTitle.textContent=state.gun==='mauser'?
  'მაუზერი · '+state.ammo+' / '+state.reserve:
  'სანადირო თოფი · '+state.shells+' ვაზნა';
 ui.weaponInfo.textContent=state.gun==='mauser'?'R — გადატენვა | Q — თოფი':'Q — მაუზერი | Space — ხმალი';
}
function resize(){
 screenW=innerWidth;screenH=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
 canvas.width=Math.round(screenW*dpr);canvas.height=Math.round(screenH*dpr);
 zoom=screenW<720?1.08:screenW<1200?1.16:1.35;
}
function pointerWorld(px,py){
 return{x:camX+(px-screenW/2)/zoom,y:camY+(py-screenH/2)/zoom};
}
const joy={pointer:null,x:0,y:0};const stick=document.getElementById('stick');
function joyMove(ev){
 if(joy.pointer!==ev.pointerId)return;
 const b=document.getElementById('joystick').getBoundingClientRect();
 let dx=ev.clientX-(b.left+b.width/2),dy=ev.clientY-(b.top+b.height/2);
 const max=b.width*.37,mag=Math.hypot(dx,dy);
 if(mag>max){dx*=max/mag;dy*=max/mag;}
 joy.x=dx/max;joy.y=dy/max;stick.style.transform='translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px))';
}
function joyStop(ev){
 if(joy.pointer!==ev.pointerId)return;joy.pointer=null;joy.x=0;joy.y=0;
 stick.style.transform='translate(-50%,-50%)';
}
const joystick=document.getElementById('joystick');
joystick.addEventListener('pointerdown',e=>{e.preventDefault();joy.pointer=e.pointerId;joystick.setPointerCapture(e.pointerId);joyMove(e)});
joystick.addEventListener('pointermove',joyMove);
joystick.addEventListener('pointerup',joyStop);joystick.addEventListener('pointercancel',joyStop);
function action(id,fn,hold=false){
 const btn=document.getElementById(id);
 btn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();try{btn.setPointerCapture(e.pointerId)}catch{};
  if(hold)state.fireHeld=true;else fn()});
 btn.addEventListener('pointerup',e=>{e.preventDefault();if(hold)state.fireHeld=false});
 btn.addEventListener('pointercancel',()=>{if(hold)state.fireHeld=false});
}
action('btnFire',shoot,true);action('btnSword',sword);
action('btnSwitch',toggleGun);action('btnDash',dash);
canvas.addEventListener('pointermove',e=>{
 if(e.pointerType==='mouse'){state.mouse={...pointerWorld(e.clientX,e.clientY),active:true}}
});
canvas.addEventListener('pointerdown',e=>{
 if(e.pointerType!=='mouse'||e.button!==0)return;
 state.mouse={...pointerWorld(e.clientX,e.clientY),active:true};state.fireHeld=true;shoot();
});
window.addEventListener('pointerup',e=>{if(e.pointerType==='mouse')state.fireHeld=false});
window.addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();
 if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
 keys.add(k);
 if(!state.running&&k==='enter'&&!state.ended){begin();return}
 if(e.repeat)return;
 if(k===' ')sword();if(k==='q')toggleGun();if(k==='shift')dash();if(k==='r')reload();
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{keys.clear();state.fireHeld=false;joy.x=0;joy.y=0});
ui.start.addEventListener('click',begin);
ui.restart.addEventListener('click',()=>{begin()});
window.addEventListener('resize',resize);
function update(dt,t){
 if(!state.running)return;
 let mx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+joy.x;
 let my=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+joy.y;
 let len=Math.hypot(mx,my);if(len>1){mx/=len;my/=len;}else if(len<.04){mx=0;my=0;}
 const speed=state.dashLeft>0?570:205;
 player.vx=mx*speed;player.vy=my*speed;
 player.x=clamp(player.x+player.vx*dt,42,W.width-42);
 player.y=clamp(player.y+player.vy*dt,180,W.height-45);
 player.phase+=(Math.hypot(player.vx,player.vy)>1?dt*(state.dashLeft>0?20:12):0);
 if(state.dashLeft>0)state.dashLeft=Math.max(0,state.dashLeft-dt);
 // Desktop pointer always points to mouse; mobile aims nearest living enemy.
 if(state.mobile){
  // Normal walking faces the travel direction (including SOUTH).
  // Only while firing does the hero auto-aim at the nearest opponent.
  const target=state.fireHeld?nearestEnemy(680):null;
  if(target)player.angle=angleTo(player.x,player.y,target.x,target.y);
  else if(Math.hypot(mx,my)>.18)player.angle=Math.atan2(my,mx);
 }else if(state.mouse.active){
  player.angle=angleTo(player.x,player.y,state.mouse.x,state.mouse.y);
 }else if(Math.hypot(mx,my)>.18)player.angle=Math.atan2(my,mx);
 player.weapon=(t<state.slashUntil?'sword':state.gun);
 player.slash=t<state.slashUntil?Math.max(.02,(state.slashUntil-t)/650):0;
 player.recoil=Math.max(0,player.recoil-dt*7);
 player.flash=Math.max(0,player.flash-dt*10);
 player.hit=Math.max(0,player.hit-dt);
 if(state.fireHeld)shoot(t);
 if(state.reloadUntil&&t>=state.reloadUntil){
  const count=Math.min(8-state.ammo,state.reserve);
  state.ammo+=count;state.reserve-=count;state.reloadUntil=0;updateHUD();
 }
 for(const e of foes)if(e.alive){
  const d=distance(player.x,player.y,e.x,e.y);
  if(d<530){
   e.angle=angleTo(e.x,e.y,player.x,player.y);
   if(d>(e.rank==='sword'?54:180)){
    const pace=e.rank==='sword'?77:e.rank==='officer'?64:54;
    e.vx=Math.cos(e.angle)*pace;e.vy=Math.sin(e.angle)*pace;
    e.x+=e.vx*dt;e.y+=e.vy*dt;e.phase+=dt*9;
   }else{e.vx=0;e.vy=0;}
   if(d<390&&t>e.fireAt){
    e.fireAt=t+(e.rank==='sword'?1100:e.rank==='officer'?1450:1900);
    if(e.rank==='sword'){
     e.slash=1;
     if(d<90)damagePlayer(12,t);
    }else{
     e.recoil=1;e.flash=1;
     const n=e.rank==='officer'?2:1;
     for(let j=0;j<n;j++){
      const a=e.angle+(j-(n-1)/2)*.11;
      bullets.push({x:e.x+Math.cos(a)*27,y:e.y+Math.sin(a)*27,
       vx:Math.cos(a)*470,vy:Math.sin(a)*470,fromEnemy:true,life:1.2,damage:e.rank==='officer'?9:8,r:2.1});
     }
     addSparks(e.x+Math.cos(e.angle)*30,e.y+Math.sin(e.angle)*30,'#ffd585',5);
    }
   }
  }else{e.vx=0;e.vy=0;}
  e.slash=Math.max(0,e.slash-dt*2.6);
  e.recoil=Math.max(0,e.recoil-dt*4.2);
  e.flash=Math.max(0,e.flash-dt*9);
  e.hit=Math.max(0,e.hit-dt);
 }
 for(let i=bullets.length-1;i>=0;i--){
  const b=bullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
  if(b.life<=0||b.x<0||b.y<0||b.x>W.width||b.y>W.height){bullets.splice(i,1);continue}
  if(b.fromEnemy){
   if(distance(b.x,b.y,player.x,player.y)<23){
    damagePlayer(b.damage,t);bullets.splice(i,1);addSparks(b.x,b.y,'#caaa81',4);
   }
  }else{
   let collision=false;
   for(const e of foes)if(e.alive&&distance(b.x,b.y,e.x,e.y)<25){
    hit(e,b.damage);collision=true;break;
   }
   if(collision)bullets.splice(i,1);
  }
 }
 for(let i=sparks.length-1;i>=0;i--){
  const s=sparks[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.vx*=.94;s.vy*=.94;s.life-=dt;
  if(s.life<=0)sparks.splice(i,1);
 }
 for(let i=rings.length-1;i>=0;i--){rings[i].life-=dt;if(rings[i].life<=0)rings.splice(i,1)}
 if(state.toastUntil&&t>state.toastUntil){ui.toast.classList.remove('show');state.toastUntil=0;}
 if(state.kills===4&&distance(player.x,player.y,W.finish.x,W.finish.y)<92){end(true)}
}
function damagePlayer(amount,t){
 if(t<state.hurtUntil||state.dashLeft>0)return;
 player.health=Math.max(0,player.health-amount);player.hit=.35;
 state.hurtUntil=t+730;updateHUD();addSparks(player.x,player.y,'#e9ab79',7);
 if(player.health<=0)end(false);
}
function drawMinimap(t){
 const w=mapCanvas.width,h=mapCanvas.height;
 mc.clearRect(0,0,w,h);mc.fillStyle='#1b2a21';mc.fillRect(0,0,w,h);
 mc.strokeStyle='#897953';mc.lineWidth=10;mc.lineCap='round';mc.beginPath();
 for(let y=0;y<=W.height;y+=60){const x=W.route(y)/W.width*w,yy=y/W.height*h;
  if(y===0)mc.moveTo(x,yy);else mc.lineTo(x,yy)}
 mc.stroke();
 mc.fillStyle='#d9c48b';mc.fillRect(W.finish.x/W.width*w-4,W.finish.y/W.height*h-4,8,8);
 for(const e of foes)if(e.alive){mc.fillStyle='#cf5945';mc.beginPath();mc.arc(e.x/W.width*w,e.y/W.height*h,3.5,0,TAU);mc.fill()}
 mc.fillStyle='#fff1c4';mc.beginPath();mc.arc(player.x/W.width*w,player.y/W.height*h,4.6,0,TAU);mc.fill();
 mc.strokeStyle='#fff5d0';mc.lineWidth=1.2;mc.stroke();
}
function worldMarkers(t){
 const at=W.finish,open=state.kills===4;
 c.save();c.translate(at.x,at.y);
 const a=.6+.3*Math.sin(t*.004);
 c.strokeStyle=open?'rgba(213,239,142,'+a+')':'rgba(245,204,122,.46)';
 c.lineWidth=4;c.setLineDash([12,8]);c.lineDashOffset=-t*.015;
 c.beginPath();c.ellipse(0,0,75,48,0,0,TAU);c.stroke();c.setLineDash([]);
 c.fillStyle=open?'#e4ffb5':'#fff0b9';c.textAlign='center';c.font='bold 19px Georgia,serif';
 c.shadowBlur=9;c.shadowColor='#070b07';
 c.fillText(open?'შესასვლელი ღიაა':'ეკლესია',0,61);
 c.restore();
 for(const e of foes)if(e.alive){
  c.strokeStyle='rgba(183,89,63,'+(.3+.2*Math.sin(t*.002+e.id))+')';
  c.lineWidth=1.8;c.beginPath();c.arc(e.x,e.y,36,0,TAU);c.stroke();
 }
}
function render(t){
 c.setTransform(1,0,0,1,0,0);c.fillStyle='#17221a';c.fillRect(0,0,canvas.width,canvas.height);
 if(!player)return;
 const viewW=screenW/zoom,viewH=screenH/zoom;
 camX=clamp(player.x,viewW/2,W.width-viewW/2);
 camY=clamp(player.y,viewH/2,W.height-viewH/2);
 const m=dpr*zoom;c.setTransform(m,0,0,m,canvas.width/2-camX*m,canvas.height/2-camY*m);
 c.drawImage(W.background,0,0);
 worldMarkers(t);
 for(const e of foes)if(e.alive)A.enemy(c,e,t);
 A.hero(c,player,t);
 for(const b of bullets){
  const ang=Math.atan2(b.vy,b.vx);
  c.save();c.translate(b.x,b.y);c.rotate(ang);
  c.strokeStyle=b.fromEnemy?'#ff9a65':'#fbe3ac';c.lineWidth=b.r*1.7;c.lineCap='round';
  c.beginPath();c.moveTo(-13,0);c.lineTo(7,0);c.stroke();
  c.restore();
 }
 for(const s of sparks){
  c.globalAlpha=Math.max(0,Math.min(1,s.life/s.max));
  c.fillStyle=s.color;c.beginPath();c.arc(s.x,s.y,s.r,0,TAU);c.fill();
 }c.globalAlpha=1;
 for(const ring of rings){
  const progress=1-ring.life/ring.max;
  c.strokeStyle=ring.color;c.globalAlpha=(1-progress)*.7;c.lineWidth=2;
  c.beginPath();c.arc(ring.x,ring.y,ring.r*(.65+progress*1.6),0,TAU);c.stroke();
 }c.globalAlpha=1;
 // Painterly warm light grading follows scene rather than HUD.
 const shade=c.createLinearGradient(0,0,0,W.height);
 shade.addColorStop(0,'rgba(243,184,92,.07)');shade.addColorStop(1,'rgba(11,29,20,.08)');
 c.fillStyle=shade;
 const sx=camX-viewW/2,sy=camY-viewH/2;c.fillRect(sx,sy,viewW,viewH);
 // Player's forward orientation indicator for clarity during testing.
 c.strokeStyle='rgba(245,226,183,.54)';c.lineWidth=1.2;
 const x=player.x+Math.cos(player.angle)*35,y=player.y+Math.sin(player.angle)*35;
 c.beginPath();c.moveTo(x-Math.cos(player.angle)*5,y-Math.sin(player.angle)*5);
 c.lineTo(x+Math.cos(player.angle)*5,y+Math.sin(player.angle)*5);c.stroke();
 if(t-lastMap>150){drawMinimap(t);lastMap=t}
}
function loop(t){
 const dt=Math.min((t-(state.lastFrame||t))/1000,.045);state.lastFrame=t;
 try{update(dt,t);render(t)}catch(err){
  console.error('PIRALI_DEMO_RUNTIME',err);
  state.running=false;ui.outcome.classList.remove('hidden');
  ui.outcomeTitle.textContent='ტესტის შეცდომა';ui.outcomeText.textContent=String(err);
 }
 requestAnimationFrame(loop);
}
resize();reset();
window.PiraliDemo014={
 version:'level1-demo-0.14',getState:()=>({
  running:state.running,ended:state.ended,kills:state.kills,health:player?.health,
  gun:state.gun,ammo:state.ammo,shells:state.shells,
  position:player?{x:player.x,y:player.y,angle:player.angle}:null,
  opponents:foes.map(e=>({alive:e.alive,rank:e.rank,health:e.health})),
  world:{width:W.width,height:W.height,finish:W.finish}
 }),start:begin,switchGun:toggleGun,slash:sword,shoot,dash
};
requestAnimationFrame(loop);
})();
