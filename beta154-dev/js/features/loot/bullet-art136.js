/* PIRALI Beta 1.36: solid elongated ammunition art, no bullet circles.
 * Appearance only. Projectile velocities, pickup collision, ammo, HP unchanged.
 */
(function(){
'use strict';
const enabled=()=>true; // Beta 1.36 previous art remains ON while comparing Beta 1.37.
function suppressHalo(pk){return enabled()&&(pk?.type==='ammo'||pk?.type==='alpha-shells');}
function drawPickup(ctx,pk,x,y){
 if(!enabled()||pk?.col||pk?.type!=='ammo')return false;
 ctx.save();ctx.translate(x,y-7);
 // Upright brass cartridge matching the loaded-ammo HUD, with pointed tip.
 ctx.fillStyle='#82521f';ctx.fillRect(-3.4,-5.4,6.8,13);
 ctx.fillStyle='#e2b74d';ctx.fillRect(-2.6,-5.0,5.2,11.5);
 ctx.fillStyle='#fff0a7';ctx.fillRect(-1.6,-4.1,1.3,8.8);
 ctx.fillStyle='#ba7930';ctx.beginPath();ctx.moveTo(-2.7,-5.2);
 ctx.lineTo(0,-10.5);ctx.lineTo(2.7,-5.2);ctx.closePath();ctx.fill();
 ctx.fillStyle='#70411b';ctx.fillRect(-3.5,6.1,7,2);
 ctx.fillStyle='#f5d46b';ctx.fillRect(-2.4,6.8,4.8,.7);
 ctx.restore();return true;
}
function drawProjectile(ctx,b,x,y){
 if(!enabled()||!b?.alive)return false;
 const angle=Math.atan2(Number(b.vy)||0,Number(b.vx)||0);
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);
 // Enemy-only visual ×2; Simona remains 1× and physics/hitboxes unchanged.
 if(!b.fp&&window.PiraliEnemyRange137?.enabled()!==false)ctx.scale(2,2);
 // 14.5×4.5px metallic round with tapered nose. No halo, arc or outline.
 ctx.fillStyle=b.fp?'#c78e2f':'#aa4730';
 ctx.beginPath();ctx.moveTo(-6.5,-2.25);ctx.lineTo(2,-2.25);
 ctx.quadraticCurveTo(5.5,-2.25,8,0);
 ctx.quadraticCurveTo(5.5,2.25,2,2.25);
 ctx.lineTo(-6.5,2.25);ctx.closePath();ctx.fill();
 ctx.fillStyle=b.fp?'#efca69':'#ea7753';ctx.fillRect(-4.9,-1.55,8,3.1);
 ctx.fillStyle=b.fp?'#fff0a5':'#ffc2a3';ctx.fillRect(-3.5,-1.45,6.1,.72);
 ctx.fillStyle=b.fp?'#78501c':'#702422';ctx.fillRect(-6.6,-2.25,1.5,4.5);
 ctx.restore();return true;
}
window.PiraliBulletArt136=Object.freeze({enabled,suppressHalo,drawPickup,drawProjectile});
})();