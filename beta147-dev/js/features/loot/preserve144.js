/* PIRALI Beta 1.44: pickups are never consumed when the relevant meter is full. */
(function(){
'use strict';
function preserve(pk){
 if(!pk||pk.col)return false;
 if(pk.type==='health')return health>=maxHealth;
 if(pk.type==='ammo')return ammo>=maxAmmo;
 if(pk.type==='herb')return inventory.laurelShield===1;
 if(pk.type==='alpha-shells'){
  const gear=window.PiraliAlphaGear?.status?.();
  return gear?.owned===true&&gear.shells>=16;
 }
 return false;
}
window.PiraliLoot144=Object.freeze({preserve});
})();
