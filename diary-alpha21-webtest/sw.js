
/* Diary Alpha 0.10: persistent display of notifications requested by an OPEN page.
 * Does not schedule alarms or claim that reminders fire after browser closure. */
self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim())});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const url=new URL('./index.html',self.registration.scope).href;
  const tabs=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const tab of tabs){
   if(tab.url.startsWith(self.registration.scope)&&'focus' in tab){await tab.focus();return}
  }
  if(self.clients.openWindow)await self.clients.openWindow(url)
 })())
});
