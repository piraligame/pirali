/* PIRALI Alpha 0.13: readable, realistic top-down enemy movement (revision B).
 * Animation only: samples AI data but NEVER modifies navigation, speed, HP,
 * shooting, damage, collisions, boss phases, local stats or Firebase.
 */
(function(){
'use strict';
const memory=new WeakMap(),TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const profile={
 sword:   {pace:9.3,stride:4.6,lift:2.35,bank:.11,weight:1.18,brace:.15},
 rifle:   {pace:7.2,stride:3.25,lift:1.55,bank:.075,weight:.86,brace:1},
 officer: {pace:7.7,stride:2.8,lift:1.45,bank:.072,weight:.8,brace:.88},
 general: {pace:5.8,stride:3.6,lift:1.6,bank:.065,weight:1.38,brace:.68}
};
let on=true,updates=0,shots=0;
function sample(e,kind){
 if(!on||!e||!profile[kind])return null;
 const cfg=profile[kind],t=performance.now();
 let s=memory.get(e);
 if(!s){
  s={time:t,phase:((e.x||0)*.019+(e.y||0)*.023)%TAU,
     heading:Number.isFinite(e.ang)?e.ang:-Math.PI/2,paceBlend:0,
     kick:0,flash:0,lastShot:Math.max(0,Number(e.sT)||0),wasHit:Number(e.hf)||0,
     lastState:e.state||'',reaction:0,charge:0,swordSwing:0,
     previousVelocityAngle:Number.isFinite(e.ang)?e.ang:0};
  memory.set(e,s);
 }
 const dt=clamp((t-s.time)/1000,0,.055);s.time=t;
 const vx=Number(e.vx)||0,vy=Number(e.vy)||0,v=Math.hypot(vx,vy);
 const locomotion=clamp((v-.025)*2.55,0,1);
 s.paceBlend+=(locomotion-s.paceBlend)*clamp(dt*10,0,1);
 const a=s.paceBlend;
 const state=e.state||'patrol',attacking=state==='attack'||(kind==='general'&&(e.charging||e.groundSlamActive));
 const alerting=state==='alert',retreating=!!e.retreating;
 const aim=kind==='rifle'||kind==='officer';
 const careful=aim&&attacking;
 const turningTo=Number.isFinite(e.ang)?e.ang:s.heading;
 const delta=wrap(turningTo-s.heading);
 s.heading+=delta*clamp(dt*(kind==='general'?6.5:9.2),0,1);
 const velocityAngle=v>.05?Math.atan2(vy,vx):turningTo;
 const strafe=clamp(wrap(velocityAngle-turningTo)/Math.PI,-1,1);
 const fpsFactor=(careful?.75:1)*(retreating?1.15:1);
 if(a>.025)s.phase+=dt*cfg.pace*(.72+a*.63)*fpsFactor;
 const wave=Math.sin(s.phase),foot=Math.abs(wave),opposite=Math.cos(s.phase);
 const shootCooldown=Number(e.sT)||0;
 const fired=aim&&shootCooldown>s.lastShot+7&&shootCooldown>9;
 if(fired){s.kick=1;s.flash=1;shots++;}
 s.lastShot=shootCooldown;
 const hit=Number(e.hf)||0;
 if(hit>s.wasHit+1)s.reaction=1;
 s.wasHit=hit;
 if(state!==s.lastState){
  if(state==='alert'||state==='attack')s.reaction=.45;
  if(state==='attack'&&kind==='sword')s.swordSwing=.6;
  s.lastState=state;
 }
 const targetCharge=attacking ? 1:alerting?.48:.08;
 s.charge+=(targetCharge-s.charge)*clamp(dt*8,0,1);
 s.kick=Math.max(0,s.kick-dt*5.3);
 s.flash=Math.max(0,s.flash-dt*10.5);
 s.reaction=Math.max(0,s.reaction-dt*3.5);
 s.swordSwing=Math.max(0,s.swordSwing-dt*2.5);
 // A soldier rushing into melee makes a *visual* wind-up at close range;
 // no hitboxes, attack timing, or pathfinding are changed.
 const near=kind==='sword'&&attacking&&typeof P==='object'&&P&&Math.hypot((P.x||0)-(e.x||0),(P.y||0)-(e.y||0))<90;
 const swing=near ? Math.sin(t*.012+s.phase*.25)*.65 : s.swordSwing;
 const stride=wave*cfg.stride*a;
 const impact=foot*cfg.lift*a;
 const sideShift=strafe*a*(kind==='officer'?1.6:2.5);
 const shoulder=opposite*(kind==='sword'?2.9:1.9)*a+sideShift*.46;
 const bank=clamp(delta,-.85,.85)*cfg.bank+wave*(careful?.011:.043)*a;
 const lean=clamp(v*.28,0,.56)*cfg.weight*a+(alerting?.12:0);
 const brace=careful?cfg.brace:alerting?.55:attacking?.45:.1;
 updates++;
 return {
  active:true,kind,phase:s.phase,stride,impact,shoulder,bank,lean,brace,
  kick:s.kick,flash:s.flash,startled:s.reaction,shot:fired?1:0,
  activity:a,attack:!!attacking,aim,retreating,
  direction:turningTo,smoothedDirection:s.heading,turnAmount:delta,
  strafe,sideShift,focus:s.charge,swing,weaponOffset:s.kick*2.7,
  bodySquash:Math.min(.075,impact*.019),speed:v,stance:state
 };
}
function ground(ctx,x,y,m,kind){
 if(!m?.active||m.activity<.18||!Number.isFinite(x)||!Number.isFinite(y))return;
 ctx.save();ctx.translate(x,y);ctx.rotate(m.direction+Math.PI/2);
 const a=m.activity,step=Math.sin(m.phase);
 ctx.fillStyle='rgba(13,17,11,'+(.09+a*.12)+')';
 ctx.beginPath();ctx.ellipse(1,8,11+a*2.5,3.5,0,0,TAU);ctx.fill();
 // Fading contact patches on soil rather than painted boots on character art.
 for(const side of [-1,1]){
  const emphasis=Math.max(0,side*step),opacity=(.025+.12*emphasis)*a;
  ctx.fillStyle='rgba(31,29,21,'+opacity.toFixed(3)+')';
  ctx.beginPath();ctx.ellipse(side*6.7,11+emphasis*4,2.3,3.1,side*.1,0,TAU);ctx.fill();
 }
 if(a>.55&&(kind==='sword'||kind==='general')){
  ctx.fillStyle='rgba(193,173,126,'+(.08*a)+')';
  ctx.beginPath();ctx.ellipse(-8,13,2.8,1.4,0,0,TAU);ctx.fill();
 }
 ctx.restore();
}
window.PiraliEnemyMotion=Object.freeze({
 sample,ground,
 enabled:()=>on,enable:v=>(on=!!v),
 stats:()=>({version:'alpha-013-enemy-motion-b',on,updates,shots,roles:Object.keys(profile)}),
 roles:Object.keys(profile)
});
})();