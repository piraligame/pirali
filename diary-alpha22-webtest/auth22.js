/* WEEKLY+ Alpha 0.22 — Firebase Google sign-in and READ ONLY cloud check. */
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {getFirestore,collection,getDocs} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const config={
 apiKey:"AIzaSyAEonlHFAO-cFo155dT8JLLKhajL2hHGlY",
 authDomain:"dgiuri-weeklyplus-ge-2026.firebaseapp.com",
 projectId:"dgiuri-weeklyplus-ge-2026",
 storageBucket:"dgiuri-weeklyplus-ge-2026.firebasestorage.app",
 messagingSenderId:"657081408131",
 appId:"1:657081408131:web:9a959037e6a346d25119b6"
};
const firebase=initializeApp(config);
const auth=getAuth(firebase);
const db=getFirestore(firebase);
const provider=new GoogleAuthProvider();
const el=id=>document.getElementById(id);
const local=(ka,en)=>document.documentElement.lang==="en"?en:ka;
const state={user:null,state:"signed-out",login,logout,syncNow,scheduleSync:()=>{}};
window.dgiuriCloud=state;
function display(message){
 const status=el("cloudStatus");
 if(status)status.textContent=message;
 const inEl=el("cloudSignedIn"),outEl=el("cloudSignedOut");
 if(inEl)inEl.hidden=!state.user;
 if(outEl)outEl.hidden=!!state.user;
 if(state.user){
  const u=state.user;
  const name=el("cloudUserName"),email=el("cloudUserEmail"),avatar=el("cloudAvatar");
  if(name)name.textContent=u.displayName||local("Google ანგარიში","Google Account");
  if(email)email.textContent=u.email||"";
  if(avatar&&u.photoURL){avatar.src=u.photoURL;avatar.hidden=false}
 }
 const sync=el("cloudSignedIn")?.querySelector("[data-v14='cloudSync']");
 if(sync)sync.textContent=local("ღრუბლის შემოწმება","Check cloud");
}
function readable(error){
 const x=error?.code||"";
 if(x==="auth/popup-blocked")return local("Chrome-ში დაუშვი Google შესვლის ფანჯარა.","Allow the Google popup in Chrome.");
 if(x==="auth/unauthorized-domain")return local("Firebase-ს ეს დომენი არ აქვს დაშვებული.","This domain is not authorized in Firebase.");
 if(x==="auth/popup-closed-by-user")return local("შესვლა გაუქმდა.","Sign-in cancelled.");
 return local("Google-ის შეცდომა: ","Google error: ")+(error?.message||x||"unknown").slice(0,130);
}
async function login(){
 if(state.user)return;
 try{
  auth.languageCode=document.documentElement.lang||"ka";
  display(local("იხსნება Google ანგარიშის არჩევა...","Opening Google account..."));
  await signInWithPopup(auth,provider);
 }catch(e){display(readable(e))}
}
async function logout(){
 try{
  await signOut(auth);
  display(local("გამოხვედი Google ანგარიშიდან. ადგილობრივი ჩანაწერები შენარჩუნებულია.",
  "Signed out. Local entries were kept."));
 }catch(e){display(readable(e))}
}
async function syncNow(){
 if(!state.user){display(local("ჯერ შედი Google-ით.","Please sign in first."));return}
 try {
  display(local("ღრუბლოვანი მონაცემების წაკითხვა...","Reading cloud data..."));
  const q=await getDocs(collection(db,"profiles",state.user.uid,"data"));
  const map=new Map(q.docs.map(d=>[d.id,d.data()?.payload||{}]));
  const tasks=map.get("tasks")?.items;
  const notes=map.get("journal")?.items;
  const list=map.get("list")?.items;
  display(local("ღრუბელშია: ","In cloud: ")+
   (Array.isArray(tasks)?tasks.length:0)+local(" საქმე, "," tasks, ")+
   (Array.isArray(notes)?notes.length:0)+local(" ჩანაწერი და "," notes and ")+
   (Array.isArray(list)?list.length:0)+local(" სიის ელემენტი. არაფერი შეცვლილა.",
   " list items. Nothing was modified."));
 } catch(e){display(readable(e))}
}
onAuthStateChanged(auth,u=>{
 state.user=u;state.state=u?"signed-in":"signed-out";
 display(u?local("Google-ით შესული ხარ. შეგიძლია გადაამოწმო ღრუბლოვანი ჩანაწერები.",
    "Signed in. You can check cloud records.") :
   local("Google-ით შესვლა — ღრუბლის მხოლოდ წაკითხვის რეჟიმი.",
    "Google sign-in — read-only cloud preview."));
});
