let last=0;
function loop(ts){const dt=Math.min((ts-last)/16.67,2.5);last=ts;if(running&&!paused){update(dt);render();}requestAnimationFrame(loop);}
updateHealthUI();updateAmmoUI();
requestAnimationFrame(loop);
// Start BGM on first user interaction (mobile autoplay policy)
(function(){
  function onFirstTouch(){
    _bgmDecode(bgmPlay);
    document.removeEventListener('touchstart',onFirstTouch);
    document.removeEventListener('mousedown',onFirstTouch);
    document.removeEventListener('pointerdown',onFirstTouch);
  }
  document.addEventListener('touchstart',onFirstTouch,{once:true});
  document.addEventListener('mousedown',onFirstTouch,{once:true});
  document.addEventListener('pointerdown',onFirstTouch,{once:true});

// ── Stop music when app goes to background / tab switches / page closes ──
document.addEventListener('visibilitychange', function(){
  if(document.hidden) bgmStop();
});
window.addEventListener('pagehide', function(){ bgmStop(); });
window.addEventListener('blur', function(){ bgmStop(); });
})();
