/* PIRALI ALPHA 0.13: enemy motion polish — four military silhouettes.
 * VISUAL ONLY. Reads existing velocity, heading, state, reload cooldown and hit flash.
 * Does not mutate entity coordinates, AI, attacks, scoring or leaderboard.
 */
(function(){
'use strict';
const memory=new WeakMap();
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const profile={
 sword:{pace:7.7,stride:3.7,lift:2.0,turn:.1,weight:1.15},
 rifle:{pace:6.6,stride:2.7,lift:1.4,turn:.062,weight:.90},
 officer:{pace:6.9,stride:2.3,lift:1.15,turn:.047,weight:.78},
 general:{pace:5.7,stride:2.6,lift:1.05,turn:.045,weight:1.38}
};
let on=true,updates=0;
function sample(e,kind,base){
 if(!on||!e||!profile[kind])return null;
 const p=profile[kind],t=performance.now();
 let s=memory.get(e);
 if(!s){s={t,phase:((e.x||0)*.019+(e.y||0)*.023)%6.283,heading:Number.isFinite(e.ang)?e.ang:-1.57,kick:0,flash:0,lastShot:Math.max(0,e.sT||0),wasHit:e.hf||0,lastState:e.state||'',startled:0};memory.set(e,s);}
 const dt=clamp((t-s.t)/1000,0,.05);s.t=t;
 const vx=Number(e.vx)||0,vy=Number(e.vy)||0,speed=Math.hypot(vx,vy);
 const activity=clamp((speed-.035)*2.9,0,1);
 const aim=kind==='rifle'||kind==='officer';
 const alarm=e.state==='alert' || (kind==='general'&&(e.charging||e.groundSlamActive));
 const fighting=e.state==='attack'||(kind==='general'&&(e.charging||e.groundSlamActive));
 const careful=aim&&fighting;
 const rpm=careful?.72:1;
 if(activity>.02)s.phase+=dt*p.pace*(.60+activity*.78)*rpm;
 const wave=Math.sin(s.phase),heel=Math.abs(Math.sin(s.phase)),turn=wrap((Number(e.ang)||0)-s.heading);
 s.heading+=(turn)*clamp(dt*11,0,1);
 let shot=0;
 const timer=Number(e.sT)||0;
 if(aim&&timer>s.lastShot+7&&timer>10){s.kick=1;s.flash=1;shot=1;}
 s.lastShot=timer;
 if(alarm&&s.lastState!==e.state)s.startled=1;
 s.lastState=e.state||'';
 if(Number(e.hf)>Number(s.wasHit)+1){s.startled=1;}
 s.wasHit=Number(e.hf)||0;
 s.kick=Math.max(0,s.kick-dt*8.3);
 s.flash=Math.max(0,s.flash-dt*12);
 s.startled=Math.max(0,s.startled-dt*4.3);
 // Readable momentum but still top-down: hips, coat and weight; never static legs.
 const stride=wave*p.stride*activity,impact=heel*p.lift*activity;
 const shoulder=Math.sin(s.phase+Math.PI/2)*1.6*activity;
 const bank=clamp(turn,-.6,.6)*p.turn + wave*(careful?.009:.027)*activity;
 const lean=clamp(speed*.13,0,.7)*p.weight*activity;
 const brace=careful?1:alarm?.75:.25;
 updates++;
 return {
  active:true,kind,phase:s.phase,stride,impact,shoulder,bank,lean,
  brace,kick:s.kick,flash:s.flash,startled:s.startled,shot,
  activity,attack:!!fighting,aim,retreating:!!e.retreating,
  // delta rendering data never used by world simulation.
  direction:Number.isFinite(e.ang)?e.ang:-Math.PI/2,
  speed
 };
}
function ground(ctx,x,y,m,kind){
 if(!m?.active||m.activity<.13||!Number.isFinite(x)||!Number.isFinite(y))return;
 ctx.save();ctx.translate(x,y);ctx.rotate(m.direction+Math.PI/2);
 const a=m.activity,step=Math.sin(m.phase);
 ctx.fillStyle='rgba(10,15,11,'+(.13+a*.10)+')';
 ctx.beginPath();ctx.ellipse(1,8,11+a*3,4,0,0,Math.PI*2);ctx.fill();
 // Two faint timed contact stamps on the *ground*, never painted boots.
 for(const side of[-1,1]){
  const weight=Math.max(0,side*step),opacity=(.05+weight*.16)*a;
  ctx.fillStyle='rgba(27,28,21,'+opacity.toFixed(3)+')';
  ctx.beginPath();ctx.ellipse(side*7,12+weight*6,2.2,4.0,side*.2,0,Math.PI*2);ctx.fill();
 }
 if(a>.4 && (kind==='sword'||kind==='general')){
  ctx.globalAlpha=(.16+.10*Math.max(0,step))*a;
  ctx.fillStyle='#c3ab7c';
  for(let i=0;i<3;i++){
   const off=i-1;
   ctx.beginPath();ctx.arc(off*9,14+Math.abs(step)*5,1.6+i*.3,0,Math.PI*2);ctx.fill();
  }
 }
 ctx.restore();
}
window.PiraliEnemyMotion=Object.freeze({
 sample,ground,
 enabled:()=>on,enable:v=>(on=!!v),
 stats:()=>({version:'alpha-013-enemy-motion-a',on,updates,roles:Object.keys(profile)}),
 roles:Object.keys(profile)
});
})();