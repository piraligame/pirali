/* PIRALI 1.14 — non-blocking polish; never alters scoring, health, saves or combat. */
(function(){
'use strict';
const LANG={
 ka:{hp:'სიცოცხლე',ammo:'ტყვია',combo:'კომბო',complete:'ტური დასრულებულია',kills:'მტერი',score:'ქულები',next:'შემდეგი',shield:'ფარი აღებულია',medal:'მედალი',shells:'საფანტი',coins:'მონეტა'},
 en:{hp:'HEALTH',ammo:'AMMO',combo:'COMBO',complete:'STAGE COMPLETE',kills:'ENEMIES',score:'POINTS',next:'NEXT',shield:'Shield collected',medal:'Medal',shells:'Shells',coins:'Coins'},
 ru:{hp:'ЗДОРОВЬЕ',ammo:'ПАТРОНЫ',combo:'КОМБО',complete:'УРОВЕНЬ ПРОЙДЕН',kills:'ВРАГИ',score:'ОЧКИ',next:'ДАЛЬШЕ',shield:'Щит получен',medal:'Медаль',shells:'Дробь',coins:'Монеты'},
 zh:{hp:'生命',ammo:'弹药',combo:'连击',complete:'关卡完成',kills:'击败敌人',score:'得分',next:'下一关',shield:'获得护盾',medal:'勋章',shells:'霰弹',coins:'金币'}
};
const text=()=>LANG[window.PiraliLanguage?.getLanguage?.()||'ka']||LANG.ka;
let stage=0,startScore=0,kills=0;
// One shared short-lived visual flash for combo, streak and collected items.
const ids={flash:'pirali-polish-flash',stage:'pirali-polish-stage'};
const tokens={flash:0,stage:0,heal:0};
function box(group){
 let e=document.getElementById(ids[group]);
 if(!e){e=document.createElement('div');e.id=ids[group];e.className='pirali-polish-toast '+group;
  e.setAttribute('aria-live','off');e.setAttribute('aria-hidden','true');document.body.appendChild(e);}
 return e;
}
function display(type,msg,ms){
 const group=type==='stage'?'stage':'flash',el=box(group),seq=++tokens[group];
 el.classList.remove('shown');
 if(group==='flash')el.classList.toggle('is-loot',type==='loot');
 el.textContent=msg;
 void el.offsetWidth;el.classList.add('shown');
 setTimeout(()=>{if(seq===tokens[group])el.classList.remove('shown');},ms);
}
function onPickup(kind,value){
 if(kind==='quest'||kind==='shotgun'){
  if(typeof value==='string'&&value)display('loot',value,650);
  return;
 }
 if(kind==='shield'){display('loot','🛡 '+text().shield,590);return;}
 if(!Number.isFinite(value)||value<=0)return;
 if(kind==='health'){
  display('loot','❤ +'+value+' HP',580);
  document.body.classList.add('pirali-polish-healed');
  const seq=++tokens.heal;
  setTimeout(()=>{if(seq===tokens.heal)document.body.classList.remove('pirali-polish-healed');},400);
 }else if(kind==='ammo')display('loot','✦ +'+value+' '+text().ammo,580);
 else if(kind==='shells')display('loot','✦ +'+value+' '+text().shells,580);
 else if(kind==='medal')display('loot','🏅 +'+value+' '+text().medal,580);
 else if(kind==='coins')display('loot','🪙 +'+value+' '+text().coins,580);
}
function onCombo(chain){
 if(!Number.isInteger(chain)||chain<2)return;
 display('combo','⚡ '+text().combo+' ×'+chain,640);
}
function onStreak(count){
 if(!Number.isInteger(count)||count<3)return;
 display('combo','⚔ '+count+' '+text().kills,620);
}
function onStageBegin(n){
 if(!Number.isInteger(n)||n<1||n>11)return;
 stage=n;startScore=Number(typeof score!=='undefined'?score:0)||0;kills=0;
}
function onKill(n){if(!Number.isInteger(n)||n<1||n>11)return;if(stage!==n)onStageBegin(n);kills++;}
function onStageComplete(n,currentScore){
 if(stage!==n)return;
 const t=text(),earned=Math.max(0,(Number(currentScore)||0)-startScore);
 const next=window.PiraliLanguage?.getLevelName?.(n+1)||(n+1);
 const enhanced=window.PiraliBeta134?.enabled?.()!==false&&!!window.PiraliBeta134;
 const combo=enhanced?'\n⚡ '+t.combo+': '+window.PiraliBeta134.maxCombo():'';
 const newBest=enhanced&&window.PiraliStageStars?.latest?.()?.newBest?'\n🏆 ★':'';
 display('stage','✓ '+t.complete+' · '+n+'\n⚔ '+t.kills+': '+kills+'   ★ '+t.score+': +'+earned+combo+newBest+'\n'+t.next+': '+next,enhanced?2500:2200);
 box('stage').classList.toggle('pirali134-stage-win',enhanced);
}
const actionIds={shoot:'btn-shoot',sword:'btn-sword',dash:'btn-dash'},flashes={};
function onAction(name){
 const btn=document.getElementById(actionIds[name]);if(!btn)return;
 btn.classList.remove('pirali-polish-action');void btn.offsetWidth;btn.classList.add('pirali-polish-action');
 const gen=flashes[name]=(flashes[name]||0)+1;
 setTimeout(()=>{if(flashes[name]===gen)btn.classList.remove('pirali-polish-action');},190);
}
function playing(target){
 return typeof running!=='undefined'&&running&&typeof paused!=='undefined'&&!paused&&
 typeof P!=='undefined'&&!P.dead&&!target?.isContentEditable&&
 !/^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName||'');
}
document.addEventListener('keydown',e=>{
 if(!playing(e.target)||e.repeat||e.altKey||e.metaKey||e.ctrlKey)return;
 const name=e.code==='KeyX'?'sword':e.code==='KeyC'?'dash':
 e.code==='KeyZ'||e.code==='Space'?'shoot':null;
 if(name)onAction(name);
});
for(const kind of ['touchstart','mousedown'])document.addEventListener(kind,e=>{
 if(!playing(e.target))return;
 const btn=e.target?.closest?.('#btn-shoot,#btn-sword,#btn-dash');
 if(btn){const name=Object.keys(actionIds).find(k=>actionIds[k]===btn.id);if(name)onAction(name);}
},{passive:true});
window.PiraliPolish=Object.freeze({onPickup,onCombo,onStreak,onStageBegin,onStageComplete,onKill,onAction,
 state:()=>({stage,startScore,kills})});
})();
