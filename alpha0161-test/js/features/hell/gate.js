/* PIRALI Alpha 0.16.1 — final flaming doorway */
(function(){
'use strict';
const t=window.PiraliHellText;
const normalChurch=drawChurch;
drawChurch=function(){
 if(level!==6){normalChurch();return;}
 const x=sx(CHURCH_X),y=sy(CHURCH_Y);if(x< -210||x>W+210||y< -250||y>H+220)return;
 ctx.save();ctx.translate(x,y+34);
 const glow=ctx.createRadialGradient(0,-25,5,0,-25,210);
 glow.addColorStop(0,'rgba(255,75,13,.65)');glow.addColorStop(1,'rgba(255,75,13,0)');
 ctx.fillStyle=glow;ctx.fillRect(-225,-230,450,440);
 ctx.shadowColor='#f95217';ctx.shadowBlur=13;ctx.fillStyle='#2d191e';ctx.strokeStyle='#af5736';ctx.lineWidth=11;
 ctx.beginPath();ctx.moveTo(-108,80);ctx.lineTo(-108,-86);ctx.quadraticCurveTo(0,-200,108,-86);ctx.lineTo(108,80);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.shadowBlur=0;ctx.fillStyle='#15080b';ctx.beginPath();ctx.moveTo(-76,71);ctx.lineTo(-76,-75);ctx.quadraticCurveTo(0,-158,76,-75);ctx.lineTo(76,71);ctx.closePath();ctx.fill();
 const fire=ctx.createLinearGradient(0,-140,0,71);fire.addColorStop(0,'#67070c');fire.addColorStop(.5,'#f34b13');fire.addColorStop(1,'#fff09c');ctx.fillStyle=fire;ctx.fill();
 for(let i=0;i<9;i++){const fx=-68+i*17,h=55+24*Math.sin(frame*.08+i);ctx.fillStyle=i%2?'#ffc12f':'#ffe787';ctx.beginPath();ctx.moveTo(fx-9,69);ctx.quadraticCurveTo(fx+13,27,fx,69-h);ctx.quadraticCurveTo(fx-13,34,fx+9,69);ctx.fill();}
 ctx.fillStyle='#ffe0ac';ctx.font='bold 13px sans-serif';ctx.textAlign='center';
 ctx.shadowColor='#150407';ctx.shadowBlur=7;ctx.fillText(t('gate'),0,112,310);ctx.shadowBlur=0;
 if(boss&&!boss.alive){ctx.fillStyle='#b5f99a';ctx.font='bold 12px sans-serif';ctx.fillText(t('enter'),0,133);}
 ctx.restore();
};
})();
