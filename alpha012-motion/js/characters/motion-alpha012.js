/*
 * PIRALI Alpha 0.12 — shared visual motion controller.
 * SIMONA + SWORD SOLDIER + RIFLE SOLDIER + OFFICER: one coordinated sprint.
 * Purely visual. Does not write x/y/vx/vy/ang/HP/AI, attack timing, scores or Firebase.
 * Uses WeakMap so removed enemies cannot leak animation state.
 */
(function(){
'use strict';
const state=new WeakMap(),TAU=Math.PI*2,now=()=>performance.now();
let enabled=true,shots=0;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const kinds={
 simona:{turn:12,gait:9.0,sway:1.0},
 sword:{turn:9.5,gait:7.8,sway:1.1},
 rifle:{turn:8,gait:6.8,sway:.7},
 officer:{turn:11,gait:8.1,sway:.55}
};
function sample(entity,kind,angle,speed,trigger=0,attack=false){
 const cfg=kinds[kind]||kinds.sword;
 const t=now();
 let s=state.get(entity);
 if(!s){
   s={last:t,angle:Number.isFinite(angle)?angle:-Math.PI/2,step:0,bob:0,sway:0,
      kick:0,flash:0,weaponClock:0,prevTrigger:Number(trigger)||0,prevAttack:!!attack};
   state.set(entity,s);
 }
 let dt=clamp((t-s.last)/1000,0,.05);s.last=t;
 if(!enabled)return {angle:Number.isFinite(angle)?angle:-Math.PI/2,step:0,bob:0,sway:0,kick:0,flash:0,attack:false};
 const target=Number.isFinite(angle)?angle:s.angle;
 s.angle+=wrap(target-s.angle)*clamp(dt*cfg.turn,0,1);
 const velocity=clamp(Number(speed)||0,0,8);
 if(velocity>.12){
   s.step+=dt*cfg.gait*(.6+Math.min(velocity,2.6)*.38);
 }
 // Small swinging fabric and almost imperceptible breathing, no frozen limbs.
 const pace=velocity>.12?Math.sin(s.step):Math.sin(t*.0021)*.13;
 s.sway=pace*cfg.sway*Math.min(1,velocity*.9+.12);
 s.bob=velocity>.12?Math.abs(Math.sin(s.step))*Math.min(1.05,velocity*.44):Math.sin(t*.0018)*.10;
 const current=Number(trigger)||0;
 // Cooldowns jump upward at a shot; animation is visual and independent.
 const shot=current>s.prevTrigger+3 && current>3 && kind!=='sword';
 const strike=!!attack&&!s.prevAttack;
 if(shot){s.flash=1;s.kick=1;shots++;}
 if(strike&&kind==='sword'){s.kick=.68;}
 s.prevTrigger=current;s.prevAttack=!!attack;
 s.kick=Math.max(0,s.kick-dt*7.5);
 s.flash=Math.max(0,s.flash-dt*10);
 return {angle:s.angle,step:s.step,bob:s.bob,sway:s.sway,kick:s.kick,flash:s.flash,attack:!!attack,shot};
}
function clear(entity){if(entity)state.delete(entity);}
window.PiraliAlphaMotion=Object.freeze({
 sample,clear,enabled:()=>enabled,enable:v=>(enabled=!!v),stats:()=>({version:'alpha012-phase12-combined',enabled,shots}),
 kinds:Object.keys(kinds)
});
})();