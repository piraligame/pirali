/* DGIURI web parity patch for native Alpha 0.28. No native permission claims. */
(function(){
 'use strict';
 const byId=id=>document.getElementById(id);
 const compassRoot=byId('compassWeb');
 if(!compassRoot)return;
 let compassEnabled=false,hasReading=false,bearing=0,handler=null;
 const ticks=Array.from({length:72},(_,i)=>{
   const rad=((i*5)-90)*Math.PI/180,inner=i%9===0?119:127,outer=136;
   const x1=144+inner*Math.cos(rad),y1=144+inner*Math.sin(rad),
         x2=144+outer*Math.cos(rad),y2=144+outer*Math.sin(rad);
   return '<line class="compass28tick'+(i%9===0?' major':'')+
      '" x1="'+x1.toFixed(2)+'" y1="'+y1.toFixed(2)+
      '" x2="'+x2.toFixed(2)+'" y2="'+y2.toFixed(2)+'"/>';
 }).join('');
 const compassSVG='<svg viewBox="0 0 288 288" role="img" aria-label="მაგნიტური კომპასის ციფერბლატი">'+
  '<circle class="compass28circ" cx="144" cy="144" r="137"/>'+
  '<circle class="compass28inner" cx="144" cy="144" r="104"/>'+
  ticks+
  '<g class="compass28needle" id="compassNeedle28">'+
  '<path class="north" d="M144 53 L126 150 L162 150 Z"/>'+
  '<path class="south" d="M144 235 L126 138 L162 138 Z"/>'+
  '</g>'+
  '<circle cx="144" cy="144" r="8" fill="#1d6f58"/>'+
  '<circle cx="144" cy="144" r="3.5" fill="white"/>'+
  '<text class="compass28label north" x="144" y="44" text-anchor="middle">ჩ</text>'+
  '<text class="compass28label" x="144" y="261" text-anchor="middle">ს</text>'+
  '<text class="compass28label" x="30" y="150" text-anchor="middle">დ</text>'+
  '<text class="compass28label" x="258" y="150" text-anchor="middle">ა</text>'+
 '</svg>';
 compassRoot.innerHTML=
  '<div class="addonBack"><button class="secondary" onclick="show(\'other\')">‹ სხვა</button></div>'+
  '<div class="compass28head"><h2>🧭 კომპასი</h2>'+
  '<div class="compass28sub">მაგნიტური მიმართულება</div></div>'+
  '<div class="compass28dial">'+compassSVG+'</div>'+
  '<div id="compass28heading" class="compass28degrees">—°</div>'+
  '<div id="compass28direction" class="compass28direction">სენსორის მონაცემის გარეშე</div>'+
  '<div id="compass28message" class="compass28message">'+
  'წითელი ისარი მაგნიტურ ჩრდილოეთს მიუთითებს. ბრაუზერს შეიძლება მოწყობილობის სენსორზე წვდომა არ ჰქონდეს.</div>'+
  '<div class="compass28action"><button class="secondary" type="button" id="compass28start">სენსორის ჩართვა</button></div>';
 const dirs=['ჩრდილოეთი','ჩრდილო-აღმოსავლეთი','აღმოსავლეთი','სამხრეთ-აღმოსავლეთი','სამხრეთი','სამხრეთ-დასავლეთი','დასავლეთი','ჩრდილო-დასავლეთი'];
 function updateHeading(deg){
  if(!Number.isFinite(deg))return;
  bearing=hasReading?(bearing+((((deg-bearing+540)%360)-180)*.28)+360)%360:deg;
  hasReading=true;
  const direction=Math.round(bearing)%360;
  byId('compassNeedle28').style.transform='rotate('+(-bearing)+'deg)';
  byId('compass28heading').textContent=String(direction).padStart(3,'0')+'°';
  byId('compass28direction').textContent=dirs[Math.floor(((direction+22)%360)/45)];
  byId('compass28message').textContent='წითელი ისარი ჩრდილოეთს მიუთითებს. ბრაუზერში სენსორის სიზუსტე დამოკიდებულია ტელეფონზე და ნებართვებზე.';
 }
 async function startCompass(){
  const err=byId('compass28message');
  if(!('DeviceOrientationEvent' in window)){
   err.textContent='ამ ბრაუზერში კომპასის სენსორი ხელმისაწვდომი არ არის. Android 0.28 აპში გამოიყენება მშობლიური მაგნიტური სენსორი.';
   return;
  }
  try{
   if(typeof DeviceOrientationEvent.requestPermission==='function'){
    const permission=await DeviceOrientationEvent.requestPermission();
    if(permission!=='granted')throw new Error('permission');
   }
   if(handler)window.removeEventListener('deviceorientation',handler);
   handler=ev=>{
    const heading=Number.isFinite(ev.webkitCompassHeading)?ev.webkitCompassHeading:
        ((ev.absolute===true||ev.type==='deviceorientationabsolute')&&Number.isFinite(ev.alpha)?
             (360-ev.alpha)%360:NaN);
    if(!Number.isFinite(heading)){
     err.textContent='სენსორის მიმართულება ამ ბრაუზერში არ მიეწოდება. Android აპი იყენებს მოწყობილობის სენსორებს.';
     return;
    }
    updateHeading(heading);
   };
   window.addEventListener('deviceorientation',handler,{passive:true});
   window.addEventListener('deviceorientationabsolute',handler,{passive:true});
   compassEnabled=true;
   err.textContent='სენსორის მონაცემებს ვამოწმებთ…';
  }catch(e){
   err.textContent='სენსორის ნებართვა მიუწვდომელია ან უარყოფილია. გამოიყენე Android აპის კომპასი.';
  }
 }
 byId('compass28start').addEventListener('click',startCompass);
 window.v21StartCompass=startCompass;

 // Remove the obsolete 0.20 “design-only security” mock panel, not a native feature.
 function fixSettings(){
  document.getElementById('v20Privacy')?.remove();
  const settings=byId('settings');
  if(!settings)return;
  const title=settings.querySelector('h1');
  if(title)title.textContent='პარამეტრები';
  const cloud=byId('cloudAccountPanel');
  if(cloud){
   cloud.style.display='block';
   const p=cloud.querySelector('.muted');
   if(p)p.textContent='Google-ით შესვლა და ღრუბლოვანი მონაცემების შემოწმება. სრული ორმხრივი სინქრონიზაცია ამ ვერსიაში ჯერ არ არის ჩართული.';
  }
  if(!byId('nativePrivacyNotice28')){
   const section=document.createElement('article');section.id='nativePrivacyNotice28';section.className='panel';
   section.innerHTML='<b class="paneltitle">🔐 PIN და ბიომეტრია</b>'+
    '<p class="muted tiny">პირადი დღიურის დაცვა და ტელეფონის ბიომეტრიული განბლოკვა ხელმისაწვდომია Android 0.28 APK-ში. ვებგვერდზე ამ დაცვის გამართულად ჩანაცვლება არ ხდება.</p>';
   const first=cloud?.nextElementSibling;
   if(first)first.insertAdjacentElement('afterend',section);else settings.append(section);
  }
  if(!byId('nativeWidgetNotice28')){
   const section=document.createElement('article');section.id='nativeWidgetNotice28';section.className='panel';
   section.innerHTML='<b class="paneltitle">დღის ვიჯეტი</b>'+
    '<p class="muted tiny">მთავარ ეკრანზე დასამატებელი კომპაქტური, გადასაფურცლი ვიჯეტი მხოლოდ Android APK-ში მუშაობს.</p>';
   byId('nativePrivacyNotice28')?.insertAdjacentElement('afterend',section);
  }
  if(!byId('nativeQuietHours28')){
   const section=document.createElement('article');section.id='nativeQuietHours28';section.className='panel';
   section.innerHTML='<b class="paneltitle">ჩუმი საათები</b>'+
    '<p class="muted tiny">22:00–08:00 რეჟიმი და სისტემური შეხსენებების შეჩერება Android 0.28-ში იმართება. ბრაუზერში დახურული გვერდის შეტყობინება გარანტირებული არ არის.</p>';
   const links=byId('diaryLinksPanel');
   if(links)links.insertAdjacentElement('beforebegin',section);else settings.append(section);
  }
  // Hide outdated preview-only raw helper controls (without altering their backing storage).
  const oldMock=byId('v20Widget');if(oldMock)oldMock.hidden=true;
 }
 // Change the visible web clock heading to match its 0.28 menu entry; timer still works.
 const clock=byId('clock');
 if(clock){
  const name=clock.querySelector('h1');if(name){
   name.removeAttribute('data-l10n-ka');name.removeAttribute('data-l10n-en');
   name.textContent='⏰ მაღვიძარა';
  }
 }
 // Remove legacy inline "Alpha 0.15" label when older language renderers run.
 const previousRender=window.render;
 window.render=function(){
  previousRender();
  const version=document.querySelector('.top .alpha');if(version)version.textContent='α 0.28 · WEB';
  const n=clock?.querySelector('h1');if(n)n.textContent='⏰ მაღვიძარა';
  if(page==='settings')fixSettings();
  document.title='დღიური · α 0.28 WEB';
 };
 fixSettings();
 window.render();
})();