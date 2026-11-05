/* PIRALI 0.16.2 DEV — single hook for specialized 8/9 world setup.
   One module owns changes to genWorld, with no duplicate global overrides. */
(function(){
'use strict';
const originalWorld=genWorld;
genWorld=function(...args){
 const result=originalWorld.apply(this,args);
 window.PiraliDualGenerals?.setup();
 window.PiraliSiege?.setup();
 return result;
};
})();
