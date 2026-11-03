/* PIRALI BETA 1.09.2 — live, localized minimap based on actual world coordinates. */
(function(){
'use strict';
const language={
 ka:{map:'შიდა რუკა',hide:'დამალვა',show:'ჩვენება',goal:'მიზანი',enemy:'მტერი',boss:'ბოსი',simona:'სიმონა'},
 en:{map:'MINIMAP',hide:'Hide',show:'Show',goal:'Goal',enemy:'Enemy',boss:'Boss',simona:'Simona'},
 ru:{map:'МИНИ-КАРТА',hide:'Скрыть',show:'Показать',goal:'Цель',enemy:'Враг',boss:'Босс',simona:'Симона'},
 zh:{map:'小地图',hide:'隐藏',show:'显示',goal:'目标',enemy:'敌人',boss:'首领',simona:'西蒙娜'}
};
const txt=()=>language[window.PiraliLanguage?.getLanguage?.()]||language.ka;
const root=document.createElement('section');root.id='pirali-mini-map';root.setAttribute('aria-label','Minimap');
const control=document.createElement('button');control.type='button';control.id='pirali-mini-map-toggle';
const canvas=document.createElement('canvas');canvas.id='pirali-mini-map-canvas';canvas.width=184;canvas.height=184;canvas.setAttribute('role','img');
root.append(control,canvas);document.body.appendChild(root);
// Beta 1.09.1: anchor minimap directly beneath the on-screen hearts.
function alignUnderHearts(){
 const heartsPanel=document.querySelector('#ui > .ui-panel:first-child');
 if(!heartsPanel)return;
 const rect=heartsPanel.getBoundingClientRect();
 if(!rect.width||!rect.height)return;
 root.style.left=Math.max(6,Math.round(rect.left))+'px';
 root.style.top=Math.round(rect.bottom+6)+'px';
 root.style.right='auto';
}
alignUnderHearts();
window.addEventListener('resize',alignUnderHearts,{passive:true});
window.addEventListener('orientationchange',alignUnderHearts,{passive:true});
if(typeof ResizeObserver!=='undefined'){
 const heartsPanel=document.querySelector('#ui > .ui-panel:first-child');
 if(heartsPanel)new ResizeObserver(alignUnderHearts).observe(heartsPanel);
}
requestAnimationFrame(alignUnderHearts);
const ctx=canvas.getContext('2d');const PREFERENCE_KEY='pirali_beta125_minimap_hidden';
let collapsed=false,tick=0;
try{collapsed=localStorage.getItem(PREFERENCE_KEY)==='1';}catch(e){}
root.classList.toggle('collapsed',collapsed);
function updateLabel(){const s=txt();control.textContent='🧭 '+s.map+' · '+(collapsed?s.show:s.hide);control.setAttribute('aria-expanded',String(!collapsed));canvas.setAttribute('aria-label',s.map+' — '+s.simona+' / '+s.goal+' / '+s.enemy);
}
control.addEventListener('click',()=>{collapsed=!collapsed;root.classList.toggle('collapsed',collapsed);try{localStorage.setItem(PREFERENCE_KEY,collapsed?'1':'0');}catch(e){}updateLabel();});
document.addEventListener('pirali:languagechange',updateLabel);updateLabel();
function getGoal(){if(level===11)return window.PiraliGurianHome?.entry||{x:CHURCH_X,y:CHURCH_Y+65};return {x:CHURCH_X,y:CHURCH_Y};}
function drawMarker(x,y,col,r,stroke){
 ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=col;ctx.fill();ctx.lineWidth=1.1;ctx.strokeStyle=stroke||'#130d04';ctx.stroke();
}
function drawBossPin(p,w,h){
 const margin=13,cx=w/2,cy=h/2,dx=p.x-cx,dy=p.y-cy;
 const clip=Math.max(1,Math.abs(dx)/(cx-margin),Math.abs(dy)/(cy-margin));
 const x=cx+dx/clip,y=cy+dy/clip;
 ctx.save();ctx.translate(x,y);
 ctx.fillStyle='#ffae2a';ctx.strokeStyle='#fff1ac';ctx.lineWidth=2.3;
 ctx.beginPath();ctx.moveTo(0,-8.2);ctx.lineTo(8.2,0);ctx.lineTo(0,8.2);ctx.lineTo(-8.2,0);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle='#381c08';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 10px sans-serif';ctx.fillText('!',0,.5);
 ctx.restore();
}
function render(){
 const visible=typeof running!=='undefined'&&running&&typeof P!=='undefined'&&!P.dead&&document.getElementById('screen')?.style.display==='none';
 const display=visible?'block':'none';
 if(root.style.display!==display)root.style.display=display;
 if(!visible||collapsed)return;
 // Camera-centered radar: exact game-world units, equal x/y scale; north always up.
 const w=canvas.width,h=canvas.height,scale=0.135,cx=w/2,cy=h/2;
 const at=(x,y)=>({x:cx+(x-P.x)*scale,y:cy+(y-P.y)*scale});
 ctx.clearRect(0,0,w,h);ctx.fillStyle='#142c24';ctx.fillRect(0,0,w,h);
 ctx.save();
 ctx.strokeStyle='#32664e';ctx.lineWidth=1;
 for(let gx=0;gx<=WW;gx+=200){const a=at(gx,0),b=at(gx,WH);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
 for(let gy=0;gy<=WH;gy+=200){const a=at(0,gy),b=at(WW,gy);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
 if(typeof path!=='undefined'&&path.length>1){
  ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();
  path.forEach((node,i)=>{const p=at(node.x,node.y);if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});
  ctx.strokeStyle='#443018';ctx.lineWidth=12;ctx.stroke();
  ctx.strokeStyle='#e9cf8d';ctx.lineWidth=6;ctx.stroke();
 }
 // Actual map obstacles.
 if(window.PiraliDevComparison?.enabled?.()===false){
 if(typeof trees!=='undefined')for(const tree of trees){const p=at(tree.x,tree.y);if(p.x>=-8&&p.x<w+8&&p.y>=-8&&p.y<h+8){ctx.fillStyle='rgba(52,120,70,.82)';ctx.beginPath();ctx.arc(p.x,p.y,Math.max(1.6,Math.min(6,tree.r*scale*.30)),0,Math.PI*2);ctx.fill();}}
 if(typeof pickups!=='undefined')for(const pk of pickups){if(pk.col)continue;const p=at(pk.x,pk.y);if(p.x<0||p.x>w||p.y<0||p.y>h)continue;drawMarker(p.x,p.y,pk.type==='health'||pk.type==='large-heart'?'#ff6c81':'#f9db7c',pk.type==='large-heart'?3.8:2.3);}
 if(typeof enemies!=='undefined')for(const enemy of enemies){if(!enemy.alive)continue;const p=at(enemy.x,enemy.y);if(p.x<0||p.x>w||p.y<0||p.y>h)continue;drawMarker(p.x,p.y,'#ff4242',5,'#3c0303');}
 }else{
 // Inline coordinate projection avoids hundreds of short-lived objects per radar refresh.
 if(typeof trees!=='undefined')for(const tree of trees){
  const x=cx+(tree.x-P.x)*scale,y=cy+(tree.y-P.y)*scale;
  if(x< -8||x>w+8||y< -8||y>h+8)continue;
  ctx.fillStyle='rgba(52,120,70,.82)';ctx.beginPath();
  ctx.arc(x,y,Math.max(1.6,Math.min(6,tree.r*scale*.30)),0,Math.PI*2);ctx.fill();
 }
 if(typeof pickups!=='undefined')for(const pk of pickups){
  if(pk.col)continue;
  const x=cx+(pk.x-P.x)*scale,y=cy+(pk.y-P.y)*scale;
  if(x<0||x>w||y<0||y>h)continue;
  drawMarker(x,y,pk.type==='health'||pk.type==='large-heart'?'#ff6c81':'#f9db7c',pk.type==='large-heart'?3.8:2.3);
 }
 if(typeof enemies!=='undefined')for(const enemy of enemies){
  if(!enemy.alive)continue;
  const x=cx+(enemy.x-P.x)*scale,y=cy+(enemy.y-P.y)*scale;
  if(x<0||x>w||y<0||y>h)continue;drawMarker(x,y,'#ff4242',5,'#3c0303');
 }
 }
 const second=window.PiraliDualGenerals?.second?.();
 for(const general of [typeof boss==='undefined'?null:boss,second])if(general?.alive)drawBossPin(at(general.x,general.y),w,h);
 const goal=getGoal(),v=at(goal.x,goal.y); // Clamp out-of-frame goal to a directional boundary.
 const margin=11,vx=v.x-cx,vy=v.y-cy,edge=Math.max(Math.abs(vx)/(cx-margin),Math.abs(vy)/(cy-margin),1);
 const tx=cx+vx/edge,ty=cy+vy/edge;drawMarker(tx,ty,'#44e7ff',8,'#fff');
 ctx.strokeStyle='#44e7ff';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(tx,ty,10.5,0,Math.PI*2);ctx.stroke();
 ctx.fillStyle='#12272b';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(level===11?'⌂':level===10?'🔥':'✝',tx,ty+.5);
 // Simona heading is always derived from actual P.ang.
 ctx.save();ctx.translate(cx,cy);ctx.rotate((Number(P.ang)||0)+Math.PI/2);
 ctx.fillStyle='#fff7af';ctx.strokeStyle='#161d27';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(6.5,7);ctx.lineTo(0,3);ctx.lineTo(-6.5,7);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
 ctx.strokeStyle='#c6ad78';ctx.lineWidth=3;ctx.strokeRect(1.5,1.5,w-3,h-3);
 ctx.fillStyle='#fff2bd';ctx.font='bold 11px sans-serif';ctx.textAlign='left';ctx.fillText('N ↑',8,15);
 ctx.restore();
}
function step(){tick++;if(tick%6===0)render();requestAnimationFrame(step);}
requestAnimationFrame(step);
window.PiraliMiniMap=Object.freeze({render,getGoal,root,canvas,open:()=>{collapsed=false;root.classList.remove('collapsed');try{localStorage.setItem(PREFERENCE_KEY,'0');}catch(e){}updateLabel();},close:()=>{collapsed=true;root.classList.add('collapsed');try{localStorage.setItem(PREFERENCE_KEY,'1');}catch(e){}updateLabel();}});
})();
