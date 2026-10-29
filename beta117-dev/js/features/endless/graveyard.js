/* PIRALI 0.16.3 DEV — solid grey crosses in stage eleven. */
(function(){'use strict';
const COUNT=22;
function populate(){
 if(level!==11)return;
 let added=0;
 for(let trial=0;added<COUNT&&trial<COUNT*180;trial++){
  const angle=trial*2.399963229728653+Math.random()*.25;
  const radius=260+Math.sqrt(Math.random())*340;
  const x=Math.max(75,Math.min(WW-75,P.x+Math.cos(angle)*radius));
  const y=Math.max(220,Math.min(WH-170,P.y+Math.sin(angle)*radius));
  if(Math.hypot(x-P.x,y-P.y)<225)continue;
  if(trees.some(t=>Math.hypot(t.x-x,t.y-y)<t.r*.5+74))continue;
  const r=22+Math.random()*12;
  trees.push({x,y,r,kind:'grave-cross',off:Math.random()*6.28});
  added++;
 }
 window.PiraliGraveyardLast={level,added};
}
function drawCross(c,t,x,y){
 const r=t.r;
 c.save();c.translate(x,y);
 c.fillStyle='rgba(4,5,7,.46)';c.beginPath();
 c.ellipse(3,7,r*.85,r*.3,0,0,Math.PI*2);c.fill();
 c.fillStyle='#54575f';c.beginPath();c.ellipse(0,3,r*.45,r*.22,0,0,Math.PI*2);c.fill();
 c.fillStyle='#9699a0';c.fillRect(-r*.14,-r*1.5,r*.28,r*1.55);
 c.fillRect(-r*.66,-r*1.2,r*1.32,r*.28);
 c.fillStyle='rgba(235,236,240,.35)';
 c.fillRect(-r*.1,-r*1.42,r*.06,r*1.25);
 c.fillRect(-r*.56,-r*1.14,r*1.05,r*.05);
 c.strokeStyle='#363840';c.lineWidth=1.3;
 c.strokeRect(-r*.14,-r*1.5,r*.28,r*1.55);
 c.strokeRect(-r*.66,-r*1.2,r*1.32,r*.28);
 c.restore();return true;
}
window.PiraliGraveyard=Object.freeze({populate,drawCross,count:COUNT});
})();