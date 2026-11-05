/* PIRALI Beta 1.44: readable, tactical 20%-HP bosses.
 * Existing projectile count and damage are unchanged.
 */
(function(){
'use strict';
const HP=1.20;
function aim(b,p,frame){
 if(!b||!p)return 0;
 const dist=Math.hypot(p.x-b.x,p.y-b.y);
 const lead=Math.max(0,Math.min(12,dist/65));
 return Math.atan2(p.y+(p.vy||0)*lead-b.y,p.x+(p.vx||0)*lead-b.x);
}
function move(b,p,frame,angle){
 if(!b||!p)return angle;
 const dist=Math.hypot(p.x-b.x,p.y-b.y);
 // Change flanking direction only occasionally. The player can read the
 // boss's behaviour rather than facing frame-by-frame jitter.
 if(!Number.isFinite(b._pirali144NextTurn)||frame>=b._pirali144NextTurn){
  b._pirali144Side=(b._pirali144Side===-1)?1:-1;
  b._pirali144NextTurn=frame+95+Math.floor(Math.random()*40);
 }
 const near=dist<185,mid=dist<320;
 return angle+(near?.56:mid?.29:0)*(b._pirali144Side||1);
}
window.PiraliBoss144=Object.freeze({aim,move,HP});
})();
