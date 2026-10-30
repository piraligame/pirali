/* PIRALI Beta 1.34: original synthetic audio accents and visual-only end screen. */
(function(){
'use strict';
const enabled=()=>true; // Previous Beta 1.34 features remain on for Beta 1.36 comparisons.
let bestCombo=0,active=false;
function tick(running){
 if(!running){active=false;return}
 if(!active){bestCombo=0;active=true}
 bestCombo=Math.max(bestCombo,window.PiraliKillCombo?.status?.().chain||0);
}
function tone(kind){
 if(!enabled()||typeof _getAC!=='function')return;
 let ac;try{ac=_getAC();}catch{return}
 if(!ac||typeof ac.createOscillator!=='function')return;
 const sounds={mauser:[[620,170,.073,.022]],shotgun:[[190,65,.14,.03],[95,44,.11,.014]],
  sword:[[820,300,.11,.016]],hit:[[360,130,.075,.012]]};
 const now=ac.currentTime;
 for(const [high,low,duration,volume] of (sounds[kind]||[])){
  const o=ac.createOscillator(),g=ac.createGain();
  o.type=kind==='shotgun'?'sawtooth':kind==='sword'?'triangle':'sine';
  o.frequency.setValueAtTime(high,now);
  o.frequency.exponentialRampToValueAtTime(low,now+duration);
  g.gain.setValueAtTime(.0001,now);
  g.gain.linearRampToValueAtTime(volume,now+.008);
  g.gain.exponentialRampToValueAtTime(.0001,now+duration);
  o.connect(g);g.connect(ac.destination);
  o.start(now);o.stop(now+duration+.005);
 }
}
for(const [name,kind] of [['playGunshot','gun'],['playSword','sword'],['playHit','hit']]){
 let original;
 if(name==='playGunshot'&&typeof playGunshot==='function'){
  original=playGunshot;
  playGunshot=function(...args){const r=original.apply(this,args);tone(window.PiraliAlphaGear?.status?.().selected==='shotgun'?'shotgun':'mauser');return r};
 }else if(name==='playSword'&&typeof playSword==='function'){
  original=playSword;playSword=function(...args){const r=original.apply(this,args);tone(kind);return r};
 }else if(name==='playHit'&&typeof playHit==='function'){
  original=playHit;playHit=function(...args){const r=original.apply(this,args);tone(kind);return r};
 }
}
const langs={
 ka:{stars:'ვარსკვლავები',kills:'მტრები',combo:'საუკეთესო კომბო',achievement:'მიღწევა',crown:'ხუთი ტალღის გამარჯვებული',victory:'გამარჯვება',points:'ქულები'},
 en:{stars:'Stars',kills:'Enemies',combo:'Best combo',achievement:'Achievement',crown:'Five-wave champion',victory:'Victory',points:'Points'},
 ru:{stars:'Звёзды',kills:'Враги',combo:'Лучшее комбо',achievement:'Достижение',crown:'Победитель пяти волн',victory:'Победа',points:'Очки'},
 zh:{stars:'星级',kills:'敌人',combo:'最高连击',achievement:'成就',crown:'五波冠军',victory:'胜利',points:'积分'}
};
function label(){return langs[window.PiraliLanguage?.getLanguage?.()||'ka']||langs.ka}
function cell(name,value){
 const el=document.createElement('div');el.className='pirali134-result-cell';
 const label=document.createElement('span');label.textContent=name;
 const strong=document.createElement('strong');strong.textContent=String(value);
 el.append(label,strong);return el;
}
function celebrate(){
 const screen=document.getElementById('screen');
 if(!screen?.classList.contains('victory-screen'))return;
 const previous=screen.querySelector('.pirali134-victory-summary');
 if(!enabled()){previous?.remove();screen.classList.remove('pirali134-celebration');return}
 const text=label(),stars=window.PiraliStageStars?.latest?.(),run=window.PiraliStats?.debug?.();
 const section=document.createElement('section');section.className='pirali134-victory-summary';
 section.setAttribute('aria-label',text.victory);
 section.append(cell('★ '+text.stars,stars?.stage===11?'★'.repeat(stars.stars)+'☆'.repeat(3-stars.stars):'—'),
  cell('⚔ '+text.kills,Number(run?.kills)||0),cell('⚡ '+text.combo,bestCombo));
 const note=document.createElement('p');note.className='pirali134-summary-note';
 note.textContent='🏆 '+text.achievement+': '+(window.PiraliStats?.get?.()?.achievements?.crown?text.crown:text.victory)+
 (stars?.stage===11?' · '+text.points+': '+stars.earned:'');
 section.append(note);
 if(previous)previous.replaceWith(section);
 else (screen.querySelector('.tsub')||screen.querySelector('h1'))?.after(section);
 screen.classList.add('pirali134-celebration');
}
if(typeof showVictory==='function'){
 const previous=showVictory;
 showVictory=function(...args){const result=previous.apply(this,args);celebrate();return result};
 document.addEventListener('pirali:languagechange',()=>{if(document.getElementById('screen')?.classList.contains('victory-screen'))celebrate()});
}
window.PiraliBeta134=Object.freeze({enabled,tick,celebrate,maxCombo:()=>bestCombo,tone});
})();