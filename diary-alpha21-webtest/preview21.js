/* 0.21 web-only layout and compass enhancements. No native security claims. */
(function(){
'use strict';
const base=render;
let scheduled=false;
function fitAnnual(){
  const grid=document.getElementById('calendarGrid');
  const nav=document.querySelector('nav.bottom');
  if(!grid||!document.body.classList.contains('v21Annual')){if(grid)grid.style.height='';return}
  const y=grid.getBoundingClientRect().top;
  const bottom=nav?.getBoundingClientRect().top??(window.innerHeight-65);
  grid.style.height=Math.max(290,bottom-y-7)+'px';
}
function refreshAnnual(){
 const annual=(page==='calendar'&&mode==='year');
 document.body.classList.toggle('v21Annual',annual);
 if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;fitAnnual()})}
}
render=function(){base();refreshAnnual()};
window.addEventListener('resize',refreshAnnual);
window.addEventListener('orientationchange',refreshAnnual);
window.v21StartCompass=async function(){
 const out=document.getElementById('v21Heading');
 const needle=document.getElementById('v21Needle');
 if(!('DeviceOrientationEvent' in window)){if(out)out.textContent='სენსორი მიუწვდომელია';return}
 try {
   if(typeof DeviceOrientationEvent.requestPermission==='function'){
     const granted=await DeviceOrientationEvent.requestPermission();
     if(granted!=='granted')throw Error('permission');
   }
   let seen=false;
   const listener=e=>{
     const degrees=Number.isFinite(e.webkitCompassHeading)?e.webkitCompassHeading:
        Number.isFinite(e.alpha)?(360-e.alpha)%360:NaN;
     if(!Number.isFinite(degrees))return;
     seen=true;
     if(out)out.textContent=Math.round(degrees)+'°';
     if(needle)needle.style.transform='rotate('+(-degrees)+'deg)';
   };
   window.addEventListener('deviceorientationabsolute',listener,{passive:true});
   window.addEventListener('deviceorientation',listener,{passive:true});
   if(out)out.textContent='სენსორის მონაცემები…';
 }catch(e){if(out)out.textContent='დაშვება ან სენსორი მიუწვდომელია'}
};
refreshAnnual();
})();
