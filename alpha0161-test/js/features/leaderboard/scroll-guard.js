/* PIRALI DEV 0.16.1 — keep a fixed opaque backdrop behind
   the scrollable leaderboard while and only while it is visible. */
(function(){
 'use strict';
 function init(){
   const overlay=document.getElementById('lb-overlay');
   if(!overlay||document.getElementById('pirali-lb-overscroll-backdrop'))return;
   const backdrop=document.createElement('div');
   backdrop.id='pirali-lb-overscroll-backdrop';
   backdrop.setAttribute('aria-hidden','true');
   document.body.appendChild(backdrop);
   function sync(){
     const visible=getComputedStyle(overlay).display!=='none';
     backdrop.classList.toggle('is-open',visible);
   }
   const observer=new MutationObserver(sync);
   observer.observe(overlay,{attributes:true,attributeFilter:['style','class']});
   sync();
 }
 if(document.readyState==='loading')
   document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
