/* PIRALI combat presentation. Canvas-only: no collision, damage, score or network logic.
 * One shared, capped queue keeps older Android phones responsive.
 * Advances in update(), draws over combatants but below HUD.
 */
const PiraliFX=(function(){
  'use strict';
  const MAX=28; // One fixed, mobile-balanced budget, independent of device menus.
  const active=[];
  let recoil=0;
  let reduced=false;
  try{reduced=!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches}catch(e){}
  function add(type,x,y,angle=0,life=16,extra=0){
    if(!Number.isFinite(x)||!Number.isFinite(y))return;
    if(active.length>=MAX)active.splice(0,active.length-MAX+1);
    active.push({type,x,y,angle,life,max:life,extra});
  }
  function reset(){active.length=0;recoil=0}
  function tick(dt){
    const n=Number.isFinite(dt)?Math.min(3,Math.max(0,dt)):1;
    recoil=Math.max(0,recoil-.15*n);
    for(let i=active.length-1;i>=0;i--){
      active[i].life-=n;
      if(active[i].life<=0)active.splice(i,1);
    }
  }
  function shoot(x,y,angle){
    recoil=1;
    add('muzzle',x,y,angle,reduced?4:10);
    add('casing',x-Math.cos(angle)*9,y-Math.sin(angle)*9,angle,18);
  }
  function sword(x,y,angle,combo){
    add('sword',x,y,angle,reduced?6:21,combo?1:0);
  }
  function dash(x,y,angle){
    add('dash',x,y,angle,reduced?6:19);
  }
  function hit(x,y,isBoss){
    add('impact',x,y,0,reduced?6:15,isBoss?1:0);
  }
  function hurt(x,y){add('hurt',x,y,0,reduced?5:13)}
  function draw(ctx,sx,sy,W,H){
    if(!active.length)return;
    ctx.save();
    for(const fx of active){
      const x=sx(fx.x),y=sy(fx.y);
      if(x<-120||y<-120||x>W+120||y>H+120)continue;
      const u=1-Math.max(0,fx.life)/fx.max;
      const a=Math.max(0,1-u);
      ctx.save();ctx.translate(x,y);ctx.rotate(fx.angle);
      if(fx.type==='muzzle'){
        const r=4+u*19;
        ctx.globalAlpha=a*.93;
        const halo=ctx.createRadialGradient(0,0,0,0,0,r);
        halo.addColorStop(0,'#fff9c7');halo.addColorStop(.38,'#fbd062');
        halo.addColorStop(1,'rgba(235,100,18,0)');
        ctx.fillStyle=halo;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fff7bf';
        for(const sign of [-1,1]){
          ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-r*.3,sign*r*.26);
          ctx.lineTo(18+u*11,0);ctx.closePath();ctx.fill();
        }
        ctx.strokeStyle='rgba(255,230,140,.9)';ctx.lineWidth=1.8;
        ctx.beginPath();ctx.moveTo(1,0);ctx.lineTo(30+u*8,0);ctx.stroke();
      }else if(fx.type==='casing'){
        ctx.globalAlpha=Math.min(.9,a*.95);
        ctx.rotate(-Math.PI*.35-u*3.4);
        ctx.translate(-u*17,-4-u*11);
        ctx.fillStyle='#e1ad41';ctx.fillRect(-3,-1.5,7,3);
        ctx.strokeStyle='#fff0a0';ctx.strokeRect(-3,-1.5,7,3);
      }else if(fx.type==='sword'){
        const radius=fx.extra?64:55,progress=Math.min(1,u*2.1);
        const mid=-.65+progress*1.9;
        ctx.globalAlpha=a*.85;
        ctx.lineCap='round';
        ctx.strokeStyle=fx.extra?'#b7d9ff':'#e6edff';
        ctx.lineWidth=fx.extra?7:5;
        ctx.shadowBlur=6;ctx.shadowColor='#b3daff';
        ctx.beginPath();ctx.arc(0,0,radius,mid-.38,mid+.35);ctx.stroke();
        ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,255,255,.96)';ctx.lineWidth=1.8;
        ctx.beginPath();ctx.arc(0,0,radius+3,mid-.30,mid+.2);ctx.stroke();
        ctx.strokeStyle='rgba(120,179,230,.52)';ctx.lineWidth=2.1;
        ctx.beginPath();ctx.arc(0,0,radius-9,mid-.50,mid+.37);ctx.stroke();
      }else if(fx.type==='dash'){
        const radius=15+u*43;
        ctx.globalAlpha=a*.7;
        ctx.strokeStyle='#64d6ff';ctx.lineWidth=3.5*a+.6;
        ctx.beginPath();ctx.arc(0,0,radius,Math.PI*.4,Math.PI*1.65);ctx.stroke();
        ctx.strokeStyle='rgba(157,228,255,.64)';ctx.lineWidth=1.5;
        for(let i=-1;i<=1;i++){
          ctx.beginPath();ctx.moveTo(-9+u*12,i*12);
          ctx.lineTo(-25-u*45,i*20);ctx.stroke();
        }
      }else if(fx.type==='impact'){
        const radius=(fx.extra?16:9)+u*(fx.extra?35:19);
        ctx.globalAlpha=a*.85;
        ctx.strokeStyle=fx.extra?'#f0a638':'#fa6460';ctx.lineWidth=(fx.extra?4:3)*a+.3;
        ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();
        // Brighter impact core and crisp directional sparks (presentation only).
        ctx.globalAlpha=a*.78;
        ctx.fillStyle=fx.extra?'#fff3b8':'#fff5da';
        ctx.beginPath();ctx.arc(0,0,(fx.extra?10:7)*a+1,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle=fx.extra?'#ffdc74':'#ffd0a9';
        ctx.lineWidth=fx.extra?2.4:1.8;
        for(let k=0;k<6;k++){
          const th=k*Math.PI/3,inner=radius*.56,outer=radius*(.85+u*.20);
          ctx.beginPath();ctx.moveTo(Math.cos(th)*inner,Math.sin(th)*inner);
          ctx.lineTo(Math.cos(th)*outer,Math.sin(th)*outer);ctx.stroke();
        }
        ctx.fillStyle=fx.extra?'#ffcf63':'#ffd9a0';
        for(let i=0;i<6;i++){
          const th=i*Math.PI/3;
          ctx.beginPath();
          ctx.arc(Math.cos(th)*radius*.86,Math.sin(th)*radius*.86,(fx.extra?3.4:2.6)*a,0,Math.PI*2);
          ctx.fill();
        }
      }else if(fx.type==='hurt'){
        ctx.globalAlpha=a*.52;ctx.strokeStyle='#ffcd77';ctx.lineWidth=4*a+.5;
        ctx.beginPath();ctx.arc(0,0,18+u*30,0,Math.PI*2);ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }
  // Two short metallic notes reinforce the dash without using speech synthesis or permissions.
  function dashAccent(){
    if(typeof _getAC!=='function')return;
    const ac=_getAC();if(!ac)return;
    if(ac.state==='suspended')ac.resume().catch(()=>{});
    const now=ac.currentTime;
    [540,710].forEach((hz,i)=>{
      const start=now+i*.055;
      const osc=ac.createOscillator(),g=ac.createGain();
      osc.type='triangle';
      osc.frequency.setValueAtTime(hz,start);
      osc.frequency.exponentialRampToValueAtTime(hz*1.08,start+.13);
      g.gain.setValueAtTime(.0001,start);
      g.gain.linearRampToValueAtTime(.025,start+.018);
      g.gain.exponentialRampToValueAtTime(.0001,start+.16);
      osc.connect(g);g.connect(ac.destination);
      osc.start(start);osc.stop(start+.17);
    });
  }
  return Object.freeze({shoot,sword,dash,hit,hurt,draw,tick,reset,dashAccent,recoil:()=>recoil,
    debug:()=>({count:active.length,max:MAX,types:active.map(item=>item.type)})});
})();
