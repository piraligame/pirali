'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

class Element {
 constructor(tag='div'){
  this.tagName=tag;this.id='';this.className='';this.style={};this.dataset={};
  this.children=[];this.attributes={};this.listeners={};this.textContent='';
  this.hidden=false;this.isConnected=true;this.offsetTop=300;this.clientHeight=620;
  this.classes=new Set();
  this.classList={toggle:(name,enabled)=>{if(enabled)this.classes.add(name);else this.classes.delete(name);},contains:(name)=>this.classes.has(name)};
 }
 set innerHTML(markup){
  this.html=markup;
  if(this.id!=='pirali-story-map')return;
  this.stages=[];
  this.nodes={};
  const selectors=[
   '.story-map-title','.story-map-subtitle','.story-map-back','.story-map-max',
   '.story-map-scroll','.story-map-art','.story-map-details','.story-map-details-status',
   '.story-map-details-heading','.story-map-details-story-label','.story-map-details-story',
   '.story-map-details-goal-label','.story-map-details-goal',
   '.story-map-details-reward-label','.story-map-details-reward',
   '.story-map-details-note','.story-map-details-close'
  ];
  for(const selector of selectors)this.nodes[selector]=new Element(selector===' .story-map-details-close'?'button':'div');
  this.nodes['.story-map-details'].nodes=this.nodes;
  const art=this.nodes['.story-map-art'];
  art.onAppend=el=>this.stages.push(el);
 }
 appendChild(node){this.children.push(node);if(this.onAppend)this.onAppend(node);return node;}
 insertBefore(node){this.children.unshift(node);return node;}
 setAttribute(name,value){this.attributes[name]=String(value);}
 removeAttribute(name){delete this.attributes[name];}
 addEventListener(name,fn){this.listeners[name]=fn;}
 focus(){this.focused=true;}
 remove(){this.isConnected=false;this.removed=true;}
 querySelectorAll(selector){if(selector==='.story-map-stage')return this.stages||[];return [];}
 querySelector(selector){
  if(selector==='.story-map-name')return this.children.find(x=>x.className==='story-map-name')||null;
  if(selector==='.story-map-stage.current')return (this.stages||[]).find(x=>x.classes.has('current'))||null;
  const match=selector.match(/^\.story-map-stage\[data-stage="(\d+)"\]$/);
  if(match)return (this.stages||[]).find(x=>x.dataset.stage===match[1])||null;
  return this.nodes?.[selector]||null;
 }
}
function execute(mapSource){
 let language='ka',checkpoint=5,starts=0,saves=0;
 const events={},body=new Element(),menu=new Element();
 const screen=new Element();
 const document={
  body,createElement:type=>new Element(type),
  querySelector:selector=>selector==='#screen .main-menu-panel .menu-actions'?menu:null,
  getElementById:id=>id==='screen'?screen:null,
  addEventListener:(type,handler)=>{events[type]=handler;},
  dispatchEvent:event=>events[event.type]?.(event)
 };
 const window={
  PiraliLanguage:{
   getLanguage:()=>language,getLevelName:n=>language.toUpperCase()+'-'+n,
   setLanguage:()=>{throw Error('The map must not change game language');}
  },
  PiraliCheckpoint:{get:()=>({level:checkpoint}),save:()=>{saves++;}},
  startGame:()=>{starts++;}
 };
 const context={
  document,window,level:1,
  PIRALI_LEVELS:Array.from({length:11},(_,i)=>({ka:'Stage '+(i+1)})),
  Math,Number,Set,Object,
  MutationObserver:class{observe(){}},
  requestAnimationFrame:callback=>callback()
 };
 vm.runInNewContext(mapSource,context,{timeout:5000});
 const map=window.PiraliStoryMap;
 assert(map&&map.stops.length===11,'11 interactive stops missing');
 assert.equal(menu.children.length,1,'main-menu map button missing');
 menu.children[0].listeners.click();
 const overlay=body.children[0],pane=overlay.querySelector('.story-map-details');
 assert(overlay&&!overlay.removed,'map overlay failed to open');
 const markers=overlay.querySelectorAll('.story-map-stage');
 assert.equal(markers.length,11,'missing stage pins');
 assert(markers.every(m=>m.tagName==='button'&&m.type==='button'&&!!m.listeners.click),'pins not accessible buttons');
 assert.equal(pane.hidden,true,'detail panel must begin collapsed');
 markers[6].listeners.click();
 assert.equal(map.selectedStage(),7,'stage 7 selection failed');
 assert.equal(pane.hidden,false,'stage card did not open');
 assert.equal(overlay.querySelector('.story-map-details-status').textContent,'შემდეგი','locked status incorrect');
 assert(overlay.querySelector('.story-map-details-note').textContent.includes('ჯერ არ არის გახსნილი'),'locked preview message missing');
 assert(overlay.querySelector('.story-map-details-goal').textContent.includes('ბატონი'),'stage 7 objective missing');
 assert(overlay.querySelector('.story-map-details-reward').textContent.includes('5-დან 6-მდე'),'stage 7 big heart missing');
 assert.equal(markers[6].attributes['aria-pressed'],'true');
 assert.equal(markers[4].attributes['aria-current'],'step','current checkpoint marker incorrect');
 checkpoint=11;map.refresh();
 assert.equal(overlay.querySelector('.story-map-details-status').textContent,'გავლილი','completed status should follow checkpoint');
 for(const lang of ['en','ru','zh','ka']){
  language=lang;document.dispatchEvent({type:'pirali:languagechange'});
  assert(overlay.querySelector('.story-map-details-heading').textContent.includes(lang.toUpperCase()+'-7'),'stage label did not follow game language: '+lang);
  assert(overlay.querySelector('.story-map-details-story').textContent.length>15,'description missing: '+lang);
  assert(overlay.querySelector('.story-map-details-goal').textContent.length>10,'goal missing: '+lang);
 }
 language='en';document.dispatchEvent({type:'pirali:languagechange'});
 markers[9].listeners.click();
 assert(overlay.querySelector('.story-map-details-reward').textContent.includes('250'),'stage 10 reward incorrect');
 markers[10].listeners.click();
 assert(overlay.querySelector('.story-map-details-goal').textContent.includes('five enemy waves'),'stage 11 objective missing');
 assert(overlay.querySelector('.story-map-details-reward').textContent.includes('2,000'),'stage 11 max bonus missing');
 assert.equal(starts,0,'Map launched gameplay');
 assert.equal(saves,0,'Map mutated checkpoint');
 events.keydown({key:'Escape',preventDefault(){}});
 assert.equal(pane.hidden,true,'Escape did not close detail card');
 assert.equal(map.selectedStage(),null,'Escape selection persists');
 events.keydown({key:'Escape',preventDefault(){}});
 assert.equal(overlay.removed,true,'Escape did not close map overlay');
 return {markerCount:markers.length,translated:4};
}
for(const role of ['play','dev']){
 const root=path.join(__dirname,'..','beta111-'+role);
 const map=fs.readFileSync(path.join(root,'js/features/map/story-map.js'),'utf8');
 const css=fs.readFileSync(path.join(root,'css/story-map.css'),'utf8');
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const info=JSON.parse(fs.readFileSync(path.join(root,'RELEASE_INFO.json'),'utf8'));
 const result=execute(map);
 assert.equal(result.markerCount,11);
 assert.equal(result.translated,4);
 assert(!map.includes('data-map-lang'),'Duplicate language selector returned');
 assert(!map.includes('startGame('),'Stage skip controls are forbidden');
 assert(!map.includes('PiraliCheckpoint?.save'),'Map may not save gameplay progress');
 assert(css.includes('.story-map-details[hidden]{display:none!important}'),'Collapsed details layout broken');
 assert(css.includes('.story-map-stage:focus-visible'),'Keyboard focus style missing');
 assert(html.includes('css/story-map.css?v=beta1112-stage-journal'),'CSS cache key stale');
 assert(html.includes('js/features/map/story-map.js?v=beta1112-stage-journal'),'JS cache key stale');
 assert.equal(info.version,role==='play'?'1.11.2-beta.1':'1.11.2-beta.1-dev');
 assert.equal(info.mapStageDetails.readOnly,true);
 assert.equal(info.mapStageDetails.allowStageSkipping,false);
 assert(fs.statSync(path.join(root,'assets/maps/pirali-approved.webp')).size>700000,'Approved HD map changed');
 assert(fs.existsSync(path.join(root,'js/features/map/live-minimap.js')),'In-game mini map missing');
 if(role==='play')assert(!html.includes('<script src="js/preview-controls.js'),'DEV controls leaked to Player');
 else assert(html.includes('<script src="js/preview-controls.js'),'DEV controls missing');
 console.log('PASS PIRALI BETA 1.11.2 '+role+': selectable 11 stages, 4 languages, locked previews, read-only, cached assets');
}
console.log('PASS PIRALI BETA 1.11.2 campaign journal tests');
