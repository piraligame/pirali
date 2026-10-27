'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const get=(role,p)=>fs.readFileSync(path.join(root,'beta114-'+role,p),'utf8');
const base=p=>fs.readFileSync(path.join(root,'beta113-play',p));
function feedbackRuntime(js){
 const els=new Map(),events={},timers=[],bodyClasses=new Set();
 const doc={
  body:{
   classList:{add:x=>bodyClasses.add(x),remove:x=>bodyClasses.delete(x)},
   appendChild:el=>{els.set(el.id,el);}
  },
  getElementById:id=>els.get(id)||null,
  createElement(tag){
   const classes=new Set();
   return {tagName:tag,className:'',id:'',dataset:{},offsetWidth:123,
    attributes:{},setAttribute(k,v){this.attributes[k]=v},
    classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},
    closest:()=>null
   };
  },
  addEventListener(k,fn){events[k]=fn;}
 };
 const context={
  window:{PiraliLanguage:{getLanguage:()=>context.language,getLevelName:n=>'STAGE-'+n}},
  document:doc,score:100,running:true,paused:false,P:{dead:false},language:'ka',
  setTimeout:(fn,ms)=>{timers.push([fn,ms]);return timers.length;},
  Number,Math,Object
 };
 vm.runInNewContext(js,context,{timeout:5000});
 const polish=context.window.PiraliPolish;
 assert(polish&&Object.isFrozen(polish),'Polish API not available and frozen');
 polish.onStageBegin(4);
 polish.onKill(4);polish.onKill(4);
 polish.onPickup('health',1);
 assert.equal(els.get('pirali-polish-loot').textContent.includes('HP'),true);
 assert(bodyClasses.has('pirali-polish-healed'));
 polish.onPickup('ammo',3);
 assert(els.get('pirali-polish-loot').textContent.includes('+3'));
 polish.onPickup('ammo',0);
 assert(els.get('pirali-polish-loot').textContent.includes('+3'),'No visual pickup for zero gained');
 polish.onCombo(3);
 assert(els.get('pirali-polish-combo').textContent.includes('×3'));
 polish.onStageComplete(4,147);
 assert(els.get('pirali-polish-stage').textContent.includes('მტრები: 2'));
 assert(els.get('pirali-polish-stage').textContent.includes('+47'));
 assert(els.get('pirali-polish-stage').textContent.includes('STAGE-5'));
 assert.equal(polish.state().stage,4);
 assert.equal(context.score,100,'Polish modified real score');
 context.language='ru';polish.onPickup('health',1);
 assert(els.get('pirali-polish-loot').textContent.includes('ЗДОРОВЬЕ'));
 assert(events.keydown,'Keyboard feedback listener absent');
 // KeyX responds even when printed character uses a Georgian keyboard layout.
 const x={code:'KeyX',key:'ხ',repeat:false,target:{tagName:'DIV'},altKey:false,metaKey:false,ctrlKey:false};
 const sword=doc.createElement('button');sword.id='btn-sword';els.set(sword.id,sword);
 events.keydown(x);assert(sword.classList.contains('pirali-polish-action'));
 context.paused=true;const dash=doc.createElement('button');dash.id='btn-dash';els.set(dash.id,dash);
 events.keydown({...x,code:'KeyC'});assert(!dash.classList.contains('pirali-polish-action'),'Paused input flash');
 return true;
}
for(const role of ['play','dev']){
 const info=JSON.parse(get(role,'RELEASE_INFO.json')),html=get(role,'index.html');
 assert.equal(info.version,role==='dev'?'1.14.0-beta.1-dev':'1.14.0-beta.1');
 assert(info.polish&&Object.values(info.polish).every(v=>v===true),'Seven polish flags missing');
 assert(html.includes('js/features/polish/feedback.js?v=1.14.0'));
 assert(html.includes('css/beta114-polish.css?v=1.14.0'));
 assert(html.includes('css/live-minimap.css?v=beta114-legend'));
 const update=get(role,'js/runtime/update.js');
 assert(update.includes('onStageComplete(oldLevel,score)'), 'Stage result must be delivered before level increment');
 assert(update.includes('onStageBegin(level)'), 'Stats counters must reset after world advance');
 assert(update.includes("onPickup('health',health-beforeHealth)"));
 assert(update.includes("onPickup('ammo',gained)"));
 const combat=get(role,'js/runtime/combat.js');
 assert(combat.includes('window.PiraliPolish?.onKill(level)'));
 const combo=get(role,'js/features/scoring/kill-combos.js');
 assert(combo.includes('chain=paired?Math.min(99,chain+1):1'));
 assert(combo.includes('paired?2:1'),'Actual combo award ×2 formula changed');
 assert(combo.includes('onCombo(chain)'));
 const minimap=get(role,'js/features/map/live-minimap.js');
 assert(minimap.includes('pirali-mini-legend'));
 assert(minimap.includes('s.simona')&&minimap.includes('s.enemy')&&minimap.includes('s.goal'));
 const story=get(role,'js/features/map/story-map.js');
 assert(story.includes('story-map-medal')&&story.includes('profile?.wins')&&story.includes('earnedLimit'));
 assert(story.includes('if(!developer()&&n>discovered())'),'Locked stage gate changed');
 const ui=get(role,'js/runtime/ui.js');
 assert(ui.includes('let bannerSequence=0')&&ui.includes('if(seq!==bannerSequence)return'));
 assert(ui.includes("document.getElementById('pirali-story-map')"));
 assert(feedbackRuntime(get(role,'js/features/polish/feedback.js')));
 for(const staticFile of [
  'js/features/stages/beta105-balance.js',
  'js/features/loot/drop-balance.js',
  'js/features/endless/waves.js',
  'js/features/scoring/stage-awards.js',
  'assets/maps/pirali-approved.webp',
  'js/progression/player-stats.js'
 ])assert(fs.readFileSync(path.join(root,'beta114-'+role,staticFile)).equals(base(staticFile)),
             'Stable game balance, map or save system was modified: '+staticFile);
 if(role==='play')assert(!html.includes('<script src="js/preview-controls.js'),'DEV controls in Player');
 else assert(html.includes('<script src="js/preview-controls.js'),'DEV controls missing');
 console.log('PASS PIRALI BETA 1.14 '+role+': 7 features, playback feedback, map, controls, i18n, stages & untouched balance');
}
console.log('PASS BETA 1.14 POLISH QA');
