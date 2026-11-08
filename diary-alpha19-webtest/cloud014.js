/*
 * DGIURI Alpha 0.14 — isolated Firebase Web SDK bridge.
 * Auth and Firestore are only activated after provider/domain is configured
 * in the project's Firebase Console. Never pretend cloud sync is active.
 */
import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFirestore,collection,doc,setDoc,getDocs,onSnapshot,serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const firebaseConfig={
 apiKey:'AIzaSyAEonlHFAO-cFo155dT8JLLKhajL2hHGlY',
 authDomain:'dgiuri-weeklyplus-ge-2026.firebaseapp.com',
 projectId:'dgiuri-weeklyplus-ge-2026',
 storageBucket:'dgiuri-weeklyplus-ge-2026.firebasestorage.app',
 messagingSenderId:'657081408131',
 appId:'1:657081408131:web:9a959037e6a346d25119b6'
};
const app=initializeApp(firebaseConfig);
const auth=getAuth(app),db=getFirestore(app),provider=new GoogleAuthProvider();
const ids=['profile','tasks','journal','joker','list'];
const bridge={
 state:'signed-out',
 user:null,
 dirty:false,
 syncing:false,
 debounce:null,
 remoteTimer:null,
 unsub:null,
 login,logout,syncNow,scheduleSync
};
window.dgiuriCloud=bridge;
function uiStatus(text){
 const signed=bridge.state==='signed-in';
 window.DGIURI_CLOUD_STATUS?.(signed?'signed-in':'signed-out',text,bridge.user);
}
const label=(ka,en)=>document.documentElement.lang==='ka'?ka:en;
uiStatus(label('Google-ით შესვლა: ღრუბლოვანი შენახვის გასააქტიურებლად საჭიროა ავტორიზაცია.','Sign in with Google to connect cloud storage.'));
function readableError(e){
 switch(e?.code){
  case 'auth/unauthorized-domain':return label('ამ ვებმისამართს Firebase-ში Google-ით შესვლის ნებართვა ჯერ არ აქვს.','This web domain is not authorized for Google sign-in.');
  case 'auth/operation-not-allowed':return label('Google-ით შესვლის მეთოდი Firebase-ში ჯერ ჩასართავია.','Google sign-in provider must be enabled in Firebase first.');
  case 'auth/configuration-not-found':return label('Firebase Authentication ჯერ არაა გამართული.','Firebase Authentication must be configured.');
  case 'auth/popup-blocked':case 'auth/cancelled-popup-request':return label('გამოიყენე ჩვეულებრივი Chrome ბრაუზერი და დაუშვი Google ფანჯარა.','Open in Chrome and allow the sign-in popup.');
  case 'auth/popup-closed-by-user':return label('შესვლა შეწყვეტილია.','Sign-in cancelled.');
  case 'permission-denied':return label('სერვერმა შენახვა დაბლოკა. შეამოწმე ანგარიშის წვდომა.','Cloud rules denied this write.');
  case 'unavailable':return label('სერვერთან კავშირი ვერ დამყარდა. ლოკალური მონაცემები შენარჩუნებულია.','Cloud offline; local data is retained.');
  default:return label('სინქრონიზაცია ვერ დასრულდა: ','Sync failed: ')+(e?.message||'Unknown error').slice(0,160)
 }
}
async function login(){
 if(bridge.state==='signed-in')return;
 try{
  auth.languageCode=document.documentElement.lang||'ka';
  uiStatus(label('Google ანგარიშის ფანჯარა იხსნება...','Opening Google account...'));
  await signInWithPopup(auth,provider);
 }catch(e){
  console.warn('Sign-in issue',e?.code||'unknown');
  uiStatus(readableError(e));
 }
}
async function logout(){
 if(bridge.syncing)return;
 try{
  await signOut(auth);
  uiStatus(label('ანგარიშიდან გასული ხარ. ამ ბრაუზერში არსებული ჩანაწერები შენარჩუნებულია.','Signed out. Local data remains on this browser.'));
 }catch(e){uiStatus(readableError(e))}
}
function split(data){
 return {
  profile:{prefs:data.prefs||{},goals:data.goals||[],diaryClock:data.diaryClock||{}},
  tasks:{items:data.tasks||[]},
  journal:{items:data.diaryNotes||[]},
  joker:{sheet:data.joker||{},history:data.jokerHistory||[]},
  list:{items:data.checklist||[]}
 }
}
function restore(map){
 const p=map.get('profile')||{},t=map.get('tasks')||{},j=map.get('journal')||{},k=map.get('joker')||{},l=map.get('list')||{};
 const out={};
 if(p.prefs)out.prefs=p.prefs;
 if(p.goals)out.goals=p.goals;
 if(p.diaryClock)out.diaryClock=p.diaryClock;
 if(Array.isArray(t.items))out.tasks=t.items;
 if(Array.isArray(j.items))out.diaryNotes=j.items;
 if(k.sheet&&Array.isArray(k.sheet.players))out.joker=k.sheet;
 if(Array.isArray(k.history))out.jokerHistory=k.history;
 if(Array.isArray(l.items))out.checklist=l.items;
 return out
}
const source=()=>collection(db,'profiles',bridge.user.uid,'data');
async function readParts(){
 const docs=await getDocs(source());
 return new Map(docs.docs.filter(d=>ids.includes(d.id)).map(d=>[d.id,d.data()?.payload||{}]))
}
async function writeParts(snapshot){
 const parts=split(snapshot);
 await Promise.all(ids.map(id=>setDoc(doc(db,'profiles',bridge.user.uid,'data',id),
 {payload:parts[id],version:14,updatedAt:serverTimestamp()})));
}
async function initializeUser(user){
 if(bridge.unsub){bridge.unsub();bridge.unsub=null}
 bridge.user=user;bridge.state='signed-in';
 bridge.dirty=false;
 uiStatus(label('მონაცემების ჩამოტვირთვა...','Downloading saved data...'));
 try{
  const existing=await readParts();
  const previousOwner=localStorage.getItem('dgiuri_cloud_owner_uid');
  if(previousOwner&&previousOwner!==user.uid){
   window.DGIURI_DATA.resetForAccountChange();
  }
  if(existing.size){
   window.DGIURI_DATA.apply(restore(existing),{initial:!previousOwner});
  }
  localStorage.setItem('dgiuri_cloud_owner_uid',user.uid);
  await writeParts(window.DGIURI_DATA.read());
  bridge.remoteParts=await readParts();
  bridge.unsub=onSnapshot(source(),snap=>{
    bridge.remoteParts=new Map(snap.docs.filter(d=>ids.includes(d.id)).map(d=>[d.id,d.data()?.payload||{}]));
    if(bridge.syncing||bridge.dirty)return;
    clearTimeout(bridge.remoteTimer);
    bridge.remoteTimer=setTimeout(()=>{
      if(bridge.dirty||bridge.syncing)return;
      window.DGIURI_DATA.apply(restore(bridge.remoteParts),{initial:false});
      uiStatus(label('ღრუბლოვანი მონაცემები სინქრონიზებულია.','Cloud data is synchronized.'));
    },600);
  },err=>uiStatus(readableError(err)));
  uiStatus(label('ღრუბლოვანი შენახვა ჩართულია.','Cloud sync is active.'));
 }catch(e){
  console.warn('Cloud initialization issue',e?.code||'unknown');
  uiStatus(readableError(e));
 }
}
function scheduleSync(){
 if(!bridge.user||bridge.state!=='signed-in')return;
 bridge.dirty=true;
 clearTimeout(bridge.debounce);
 bridge.debounce=setTimeout(syncNow,900);
}
async function syncNow(){
 if(!bridge.user||bridge.state!=='signed-in')return;
 if(bridge.syncing){scheduleSync();return}
 bridge.syncing=true;bridge.dirty=false;
 uiStatus(label('მონაცემების შენახვა...','Saving changes...'));
 try{
  await writeParts(window.DGIURI_DATA.read());
  uiStatus(label('ყველაფერი ღრუბელში შენახულია.','Everything saved to the cloud.'));
 }catch(e){
  bridge.dirty=true;
  uiStatus(readableError(e));
 }finally{
  bridge.syncing=false;
  if(bridge.dirty&&navigator.onLine)scheduleSync();
 }
}
onAuthStateChanged(auth,user=>{
 if(!user){
  if(bridge.unsub){bridge.unsub();bridge.unsub=null}
  bridge.user=null;bridge.state='signed-out';
  uiStatus(label('Google-ით შესვლა და მონაცემების სინქრონიზაცია.','Google sign-in and data sync.'));
  return;
 }
 initializeUser(user);
});
window.addEventListener('online',()=>{if(bridge.dirty)scheduleSync()});

async function verifyGoogleAuthSetup(){
 const btn=document.getElementById('cloudGoogleLogin');
 if(!btn)return;
 try{
  const url='https://identitytoolkit.googleapis.com/v1/projects?key='+encodeURIComponent(firebaseConfig.apiKey);
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok){
   btn.disabled=true;
   if(bridge.state!=='signed-in')uiStatus(label(
    'Google-ით შესვლა ჯერ აქტივაციის პროცესშია (Firebase Authentication). ადგილობრივი ჩანაწერები შენარჩუნებულია.',
    'Google sign-in setup is not finished yet (Firebase Authentication). Your local entries are safe.'));
  }else{
   btn.disabled=false;
   if(bridge.state!=='signed-in')uiStatus(label(
    'Google-ით შესვლა მზადაა შესამოწმებლად. მონაცემები პირველ შესვლაზე გაერთიანდება.',
    'Google login can now be tested. Existing local data will be merged on first sign-in.'));
  }
 }catch(e){
  console.warn('Auth setup check unavailable');
  if(bridge.state!=='signed-in')uiStatus(label(
   'Google-ის სერვერის გადამოწმება ვერ მოხერხდა. ადგილობრივი ჩანაწერები მუშაობს.',
   'Could not check Google service. Local entries still work.'));
 }
}
verifyGoogleAuthSetup();
