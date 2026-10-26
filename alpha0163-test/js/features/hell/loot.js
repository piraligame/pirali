/* PIRALI 0.16.1 — Batoni drops health, Devil drops the 4500-point heart. */
(function(){
'use strict';
const t=window.PiraliHellText;
function addPickup(x,y,type){
 const pk={
  x:Math.max(38,Math.min(WW-38,x)),
  y:Math.max(38,Math.min(WH-38,y)),
  bob:Math.random()*Math.PI*2,col:false,type
 };
 pickups.push(pk);return pk;
}
function batoni(e){
 if(level!==10||e?.etype!=='landlord')return;
 addPickup(e.x,e.y,'health');
 if(typeof showFloatingText==='function')
  showFloatingText(e.x,e.y-42,t('lifeDrop'),'#ff808e');
}
function devil(b){
 if(level!==10||!b)return;
 // Make the collectible visible just south of the fallen boss, on the path
 // players take towards the flaming gate. It stays until picked up.
 const dx=P.x-b.x,dy=P.y-b.y,len=Math.hypot(dx,dy)||1;
 const px=b.x+(dx/len)*56,py=b.y+(dy/len)*56;
 const heart=addPickup(px,py,'hell-heart');
 heart.points=4500;
 if(typeof showFloatingText==='function')
  showFloatingText(heart.x,heart.y-50,t('heartDrop'),'#ffe494');
}
function collect(pk){
 if(level!==10||!pk||pk.type!=='hell-heart')return false;
 window.PiraliHellScore?.claimHeart();
 if(typeof showFloatingText==='function')
  showFloatingText(pk.x,pk.y-38,t('heartTaken'),'#ffe39a');
 for(let i=0;i<24;i++){
   const a=i*Math.PI*2/24,spd=2+Math.random()*3;
   spawnPart(pk.x,pk.y,Math.cos(a)*spd,Math.sin(a)*spd,25,
     i%2?'#ff6487':'#ffd866',3+Math.random()*4);
 }
 return true;
}
window.PiraliHellLoot=Object.freeze({batoni,devil,collect});
})();
