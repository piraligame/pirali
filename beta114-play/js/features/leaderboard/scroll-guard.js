/* PIRALI 0.16.1 DEV — leaderboard mobile overscroll + gameplay suppression.
   On Android Chrome a fast fling can expose a frame of the underlying
   fixed action-zone. Hiding gameplay controls while leaderboard is open
   prevents the red Mauser button from showing through even if the
   scrollable compositing layer briefly moves.
   No gameplay state, Firebase ranking, or TOP 30 rows are changed. */
(function(){
 'use strict';
 let backdrop=null,overlay=null;
 function setOpen(open){
   const visible=!!open;
   document.documentElement.classList.toggle('pirali-leaderboard-open',visible);
   backdrop?.classList.toggle('is-open',visible);
 }
 function sync(){
   if(!overlay)return;
   setOpen(getComputedStyle(overlay).display!=='none');
 }
 function init(){
   overlay=document.getElementById('lb-overlay');
   if(!overlay)return;
   backdrop=document.getElementById('pirali-lb-overscroll-backdrop');
   if(!backdrop){
     backdrop=document.createElement('div');
     backdrop.id='pirali-lb-overscroll-backdrop';
     backdrop.setAttribute('aria-hidden','true');
     document.body.appendChild(backdrop);
   }
   new MutationObserver(sync).observe(overlay,{
     attributes:true,attributeFilter:['style','class']
   });
   sync();
 }
 window.PiraliLeaderboardScrollGuard=Object.freeze({setOpen,sync});
 if(document.readyState==='loading'){
   document.addEventListener('DOMContentLoaded',init,{once:true});
 }else init();
})();
