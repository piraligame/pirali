/* PIRALI 1.14 — non-blocking polish; never alters scoring, health, saves or combat. */
(function(){
'use strict';
const LANG={
 ka:{hp:'სიცოცხლე',ammo:'ტყვია',combo:'კომბო',complete:'ტური დასრულებულია',kills:'მტრები',score:'ქულები',next:'შემდეგი'},
 en:{hp:'HEALTH',ammo:'AMMO',combo:'COMBO',complete:'STAGE COMPLETE',kills:'ENEMIES',score:'POINTS',next:'NEXT'},
 ru:{hp:'ЗДОРОВЬЕ',ammo:'ПАТРОНЫ',combo:'КОМБО',complete:'УРОВЕНЬ ПРОЙДЕН',kills:'ВРАГИ',score:'ОЧКИ',next:'ДАЛЬШЕ'},
 zh:{hp:'生命',ammo:'弹药',combo:'连击',complete:'关卡完成',kills:'击败敌人',score:'得分',next:'下一关'}
};
const text=()=>LANG[window.PiraliLanguage?.getLanguage?.()||'ka']||LANG.ka;
let stage=0,startScore=0,kills=0;
const ids={loot:'pirali-polish-loot',combo:'pirali-polish-combo',stage:'pirali-polish-stage'};
const tokens={loot:0,combo:0,stage:0,heal:0};
function box(type){
 let e=document.getElementById(ids[type]);
 if(!e){e=document.createElement('div');e.id=ids[type];e.className='pirali-polish-toast '+type;
  e.setAttribute('aria-live','off');e.setAttribute('aria-hidden','true');document.body.appendChild(e);}
 return e;
}
function display(type,msg,ms){
 const el=box(type),seq=++tokens[type];
 el.classList.remove('shown');el.textContent=msg;
 void el.offsetWidth;el.classList.add('shown');
 setTimeout(()=>{if(tokens[type]===seq)el.classList.remove('shown');},ms);
}
function onPickup(kind,num){
 if(!Number.isFinite(num)||num<=0)return;
 if(kind==='health'){
  display('loot','❤ +'+num+' HP · '+text().hp,800);
  document.body.classList.add('pirali-polish-healed');
  const seq=++tokens.heal;
  setTimeout(()=>{if(seq===tokens.heal)document.body.classList.remove('pirali-polish-healed');},400);
 }else if(kind==='ammo')display('loot','✦ +'+num+' '+text().ammo,800);
}
function onCombo(chain){
 if(!Number.isInteger(chain)||chain<2)return;
 // Streak ×N is visual; actual scoring remains capped ×2.
 display('combo','⚡ '+text().combo+' ×'+chain,1000);
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
 display('stage','✓ '+t.complete+' · '+n+'\n⚔ '+t.kills+': '+kills+'   ★ '+t.score+': +'+earned+'\n'+t.next+': '+next,2200);
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
window.PiraliPolish=Object.freeze({onPickup,onCombo,onStageBegin,onStageComplete,onKill,onAction,
 state:()=>({stage,startScore,kills})});
})();
