/* Pirali 0.16.1: fiery sixth stage, refined boss, stage-six bonus. */
(function(){
'use strict';
const words={
 ka:{gate:'ცეცხლიანი კარიბჭე',devil:'ეშმაკი — ჯოჯოხეთის მცველი',enter:'შედი კარიბჭეში'},
 en:{gate:'Gate of Fire',devil:'The Devil — Gatekeeper',enter:'Enter the gate'},
 ru:{gate:'Огненные врата',devil:'Дьявол — страж врат',enter:'Войди во врата'},
 zh:{gate:'烈焰之门',devil:'恶魔——守门者',enter:'进入大门'}
};
const t=k=>(words[window.PiraliLanguage?.getLanguage?.()||'ka']||words.ka)[k];
let tracking=false,baseline=0,previous=0,earned=0;
const oldScore=updateScoreUI;
updateScoreUI=function(){
 if(level!==6){tracking=false;oldScore();return;}
 if(!tracking){tracking=true;baseline=score;previous=score;earned=0;}
 else{const raw=score-previous;if(raw>0)earned=Math.min(5000,earned+Math.round(raw*1.2));score=baseline+earned;previous=score;}
 oldScore();
};
const baseBackground=drawBG;
drawBG=function(){
 baseBackground();
 if(level!==6)return;
 ctx.save();ctx.fillStyle='rgba(85,9,14,.28)';ctx.fillRect(0,0,W,H);
 for(const a of trees){
  if(a.kind!=='dead'&&a.kind!=='rock')continue;
  if(Math.abs(Math.floor(a.x*3+a.y*7))%4!==0)continue;
  const x=sx(a.x),y=sy(a.y);if(x< -50||x>W+50||y< -65||y>H+65)continue;
  ctx.save();ctx.translate(x,y);
  const f=25+Math.sin(frame*.075+a.off)*10;
  const g=ctx.createRadialGradient(0,-5,1,0,-5,42);
  g.addColorStop(0,'rgba(255,105,20,.4)');g.addColorStop(1,'rgba(255,60,0,0)');
  ctx.fillStyle=g;ctx.fillRect(-45,-50,90,85);
  ctx.fillStyle='#ed5218';ctx.beginPath();ctx.moveTo(-11,9);ctx.quadraticCurveTo(-15,-10,0,-f);ctx.quadraticCurveTo(15,-7,11,9);ctx.fill();
  ctx.fillStyle='#ffe07b';ctx.beginPath();ctx.moveTo(-4,8);ctx.quadraticCurveTo(-9,-2,2,-f*.55);ctx.quadraticCurveTo(10,1,5,8);ctx.fill();ctx.restore();
 }
 ctx.restore();
};
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
 ctx.fillStyle='#ffe0ac';ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText(t('gate'),0,112);
 if(boss&&!boss.alive){ctx.fillStyle='#b5f99a';ctx.font='bold 12px sans-serif';ctx.fillText(t('enter'),0,133);}
 ctx.restore();
};
const normalBoss=drawBoss;
drawBoss=function(b){
 if(level!==6){normalBoss(b);return;}
 const x=sx(b.x),y=sy(b.y);if(x< -120||x>W+120||y< -145||y>H+145)return;
 ctx.save();ctx.translate(x,y);ctx.scale(1.32,1.32);
 const beat=Math.sin(frame*.07),rage=b.rageMode;
 const g=ctx.createRadialGradient(0,-15,5,0,-15,95);g.addColorStop(0,rage?'rgba(255,69,10,.56)':'rgba(184,37,19,.36)');g.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=g;ctx.fillRect(-100,-113,200,200);
 ctx.fillStyle='#15080caa';ctx.beginPath();ctx.ellipse(0,37,45,13,0,0,Math.PI*2);ctx.fill();
 for(const side of[-1,1]){
  ctx.save();ctx.scale(side,1);ctx.fillStyle=rage?'#88261e':'#542027';ctx.strokeStyle='#e85e36';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(14,-12);ctx.quadraticCurveTo(50,-60-beat*8,88,-63-beat*8);ctx.lineTo(70,-25);ctx.lineTo(60,-44);ctx.lineTo(46,2);ctx.lineTo(34,-20);ctx.lineTo(13,12);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#f17b43';ctx.beginPath();ctx.moveTo(14,-12);ctx.lineTo(85,-61-beat*8);ctx.moveTo(22,-5);ctx.lineTo(61,-42);ctx.stroke();ctx.restore();
 }
 ctx.strokeStyle='#8f291f';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(13,20);ctx.bezierCurveTo(47,39,48,-8,72,-15+beat*5);ctx.stroke();
 ctx.fillStyle='#efba62';ctx.beginPath();ctx.moveTo(72,-15+beat*5);ctx.lineTo(63,-27+beat*5);ctx.lineTo(78,-27+beat*5);ctx.closePath();ctx.fill();
 ctx.fillStyle='#1a1014';ctx.fillRect(-22,27,17,12);ctx.fillRect(6,27,17,12);
 ctx.fillStyle='#82231d';ctx.beginPath();ctx.ellipse(0,3,27,34,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=b.hf>0?'#ffe0aa':rage?'#f45e2f':'#b63a2e';ctx.beginPath();ctx.ellipse(0,-11,20,25,0,0,Math.PI*2);ctx.fill();
 for(const side of[-1,1]){
  ctx.fillStyle='#eac99a';ctx.strokeStyle='#783f30';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(side*9,-27);ctx.bezierCurveTo(side*24,-32,side*36,-62,side*18,-74);ctx.bezierCurveTo(side*38,-63,side*39,-35,side*17,-19);ctx.closePath();ctx.fill();ctx.stroke();
 }
 ctx.fillStyle='#ffe32e';ctx.shadowColor='#ff4207';ctx.shadowBlur=10;ctx.beginPath();ctx.ellipse(-9,-13,5,3,-.1,0,Math.PI*2);ctx.ellipse(9,-13,5,3,.1,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 ctx.fillStyle='#260509';ctx.fillRect(-7,-14,2,4);ctx.fillRect(7,-14,2,4);
 ctx.strokeStyle='#3b070b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,10,.1,Math.PI-.1);ctx.stroke();
 ctx.strokeStyle='#bf7646';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(26,33);ctx.lineTo(26,-67);ctx.stroke();
 ctx.strokeStyle='#ffb868';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(26,-69);ctx.lineTo(26,-86);ctx.moveTo(14,-80);ctx.lineTo(14,-66);ctx.quadraticCurveTo(26,-54,38,-66);ctx.lineTo(38,-80);ctx.stroke();
 ctx.fillStyle='#ff712b';ctx.beginPath();ctx.arc(26,-86,5+beat,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#201015';ctx.fillRect(-31,43,62,6);ctx.fillStyle=rage?'#ff6824':'#d33729';ctx.fillRect(-31,43,62*Math.max(0,b.hp/b.maxHp),6);
 ctx.restore();
};
const oldBossUI=updateBossUI;
updateBossUI=function(){oldBossUI();if(level===6&&boss?.alive)document.getElementById('boss-lbl').textContent='🔥 '+t('devil');};
document.addEventListener('pirali:languagechange',()=>{if(level===6&&boss?.alive)document.getElementById('boss-lbl').textContent='🔥 '+t('devil');});
})();
