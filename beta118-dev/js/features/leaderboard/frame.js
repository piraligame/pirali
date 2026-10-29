/* PIRALI 0.16.1 DEV — the golden border follows the full ranked TOP 30.
   Previously, an absolutely positioned ::before border on the scroll overlay
   stopped after one viewport (visually around rank 20). Frame the actual
   leaderboard contents instead of trying to guess their pixel height. */
(function(){
 'use strict';
 function mount(){
   const overlay=document.getElementById('lb-overlay');
   const list=document.getElementById('lb-list');
   if(!overlay||!list||document.getElementById('lb-rank-frame'))return;
   const frame=document.createElement('section');
   frame.id='lb-rank-frame';
   frame.setAttribute('aria-label','TOP 30');
   const nodes=['lb-title','lb-sub','lb-status','lb-list']
     .map(id=>document.getElementById(id)).filter(Boolean);
   const anchor=nodes[0];
   if(!anchor)return;
   overlay.insertBefore(frame,anchor);
   for(const node of nodes)frame.appendChild(node);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
 window.PiraliLeaderboardFrame=Object.freeze({mount});
})();
