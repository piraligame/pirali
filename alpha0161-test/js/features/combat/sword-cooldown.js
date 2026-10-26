/* PIRALI Alpha 0.16.1 DEV — fixed 1.5-second sword cooldown.
   The next swing is allowed 1500 real milliseconds after the previous one.
   The same limit applies to regular and combo swings.
   The 90-frame number returned by start() is a compatibility display value;
   readiness is determined by the monotonic wall clock instead of FPS. */
(function(){
 'use strict';
 const COOLDOWN_MS=1500;
 const FRAME_ESTIMATE=90;
 let availableAt=0;
 function clock(){return performance.now();}
 function ready(){return clock()>=availableAt;}
 function start(){
   availableAt=clock()+COOLDOWN_MS;
   return FRAME_ESTIMATE;
 }
 function reset(){availableAt=0;}
 function remainingMs(){return Math.max(0,availableAt-clock());}
 window.PiraliSwordCooldown=Object.freeze({
   ready,start,reset,remainingMs,delayMs:COOLDOWN_MS
 });
})();
