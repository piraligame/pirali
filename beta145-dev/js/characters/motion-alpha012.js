/*
 * PIRALI Alpha 0.12 — coordinated motion for Simona, soldiers, General, Batoni.
 * Artwork only: never changes physical position, combat, damage, AI or Firebase.
 */
(function(){
'use strict';
const state=new WeakMap();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
let enabled=true,shots=0;
const kinds={
 simona:{turn:14,gait:12,sway:3.1,bob:2.6,tilt:.085},
 sword:{turn:12,gait:10,sway:2.9,bob:2.4,tilt:.080},
 rifle:{turn:10,gait:9,sway:2.0,bob:1.7,tilt:.048},
 officer:{turn:15,gait:10.5,sway:1.65,bob:1.8,tilt:.045},
 general:{turn:6,gait:7.5,sway:3.1,bob:1.3,tilt:.060},
 batoni:{turn:12,gait:17,sway:3.5,bob:3.0,tilt:.12}
};
const refinedSimona=Object.freeze({...kinds.simona,gait:13.5,sway:3.8,bob:3.0,tilt:.11});
function sample(entity,kind,angle,speed,trigger=0,attack=false){
 const t=performance.now(),cfg=kind==='simona'&&window.PiraliBeta134?.enabled?.()!==false?refinedSimona:(kinds[kind]||kinds.sword);
 let s=state.get(entity);
 if(!s){
  s={time:t,angle:Number.isFinite(angle)?angle:-Math.PI/2,cycle:0,kick:0,flash:0,lastTrigger:Math.max(0,Number(trigger)||0),lastAttack:!!attack,visualHits:0};
  state.set(entity,s);
 }
 const dt=clamp((t-s.time)/1000,0,.06);s.time=t;
 const inputAngle=Number.isFinite(angle)?angle:s.angle;
 if(!enabled){s.angle=inputAngle;s.kick=0;s.flash=0;return{angle:inputAngle,step:0,bob:0,sway:0,lean:0,kick:0,flash:0,attack:false,enabled:false};}
 s.angle+=wrap(inputAngle-s.angle)*clamp(dt*cfg.turn,0,1);
 const v=clamp(Number(speed)||0,0,6),moving=v>.12;
 if(moving)s.cycle+=dt*cfg.gait*(.60+Math.min(v,2.6)*.48);
 const step=Math.sin(s.cycle),bounce=Math.abs(Math.sin(s.cycle));
 const drift=moving?clamp(v*.52,.24,1):0;
 const sway=moving?step*cfg.sway*drift:Math.sin(t*.002)*.15;
 const bob=moving?bounce*cfg.bob*drift:Math.sin(t*.0022)*.15;
 const lean=moving?step*cfg.tilt*drift:0;
 const cd=Number(trigger)||0;
 // Real in-game reload cooldown jumps up when a shot occurs.
 const shot=kind!=='sword'&&kind!=='batoni'&&cd>s.lastTrigger+4&&cd>4;
 const startAttack=!!attack&&!s.lastAttack;
 if(shot){s.kick=1;s.flash=1;shots++;}
 if(startAttack){s.kick=Math.max(s.kick,.8);s.flash=Math.max(s.flash,kind==='general'?.5:0);}
 s.lastTrigger=cd;s.lastAttack=!!attack;
 s.kick=Math.max(0,s.kick-dt*5.8);
 s.flash=Math.max(0,s.flash-dt*7.8);
 return{angle:s.angle,step:step,bob,sway,lean,kick:s.kick,flash:s.flash,attack:!!attack,shot,moving,speed:v,enabled:true};
}
window.PiraliAlphaMotion=Object.freeze({
 sample,
 enable:v=>(enabled=!!v),
 enabled:()=>enabled,
 clear:obj=>{if(obj)state.delete(obj);},
 stats:()=>({version:'alpha012-motion-phase1-2',enabled,shots,kinds:Object.keys(kinds)}),
 kinds:Object.keys(kinds)
});
})();