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
function execute(mapSource,isDeveloper){
 let language='ka',reached=1,starts=0,saves=0;
 const events={},body=new Element(),menu=new Element(),screen=new Element();
 const document={
  body,createElement:type=>new Element(type),
  querySelector:selector=>selector==='#screen .main-menu-panel .menu-actions'?menu:null,
  getElementById:id=>id==='screen'?screen:null,
  addEventListener:(type,handler)=>{events[type]=handler;},
  dispatchEvent:event=>events[event.type]?.(event)
 };
 const window={
  PiraliVisualPreviewReadonly:isDeveloper,
  PiraliLanguage:{
   getLanguage:()=>language,getLevelName:n=>language.toUpperCase()+'-'+n,
   setLanguage:()=>{throw Error('Map must not set language');}
  },
  PiraliStats:{highestReached:()=>reached},
  PiraliCheckpoint:{get:()=>null,save:()=>{saves++;}},
  startGame:()=>{starts++;}
 };
 vm.runInNewContext(mapSource,{
  document,window,level:1,
  PIRALI_LEVELS:Array.from({length:11},(_,i)=>({ka:'Stage '+(i+1)})),
  Math,Number,Set,Object,MutationObserver:class{observe(){}},
  requestAnimationFrame:callback=>callback()
 },{timeout:5000});
 const map=window.PiraliStoryMap;
 assert(map&&map.stops.length===11,'Missing 11 stage pins');
 assert.equal(menu.children.length,1,'Map menu button missing');
 menu.children[0].listeners.click();
 const overlay=body.children[0],pane=overlay.querySelector('.story-map-details');
 const markers=overlay.querySelectorAll('.story-map-stage');
 assert.equal(markers.length,11);
 assert.equal(map.selectedStage(),1,'Chokhatauri must be selected by default');
 assert.equal(pane.hidden,false,'Chokhatauri details must be visible without a click');
 assert(overlay.querySelector('.story-map-details-heading').textContent.includes('KA-1'),'First stage title missing');
 assert(overlay.querySelector('.story-map-details-story').textContent.includes('ჩოხატაურიდან'),'First stage story missing');
 assert.equal(markers[0].disabled,false,'Stage 1 must always be accessible');
 assert.equal(markers[5].disabled,!isDeveloper,'Stage 6 should be locked initially only for player');
 markers[6].listeners.click();
 assert.equal(map.selectedStage(),isDeveloper?7:1,'Locked stage details opened in Player');
 assert.equal(pane.hidden,false,'No empty details allowed after locked click');
 if(isDeveloper){
  assert(markers.every(x=>x.disabled===false),'DEV must unlock all stages');
  assert(overlay.querySelector('.story-map-details-goal').textContent.includes('ბატონი'),'DEV stage 7 not accessible');
  map.closeDetails();
  assert.equal(map.selectedStage(),1,'Close details should return to Chokhatauri');
 }else{
  reached=5;map.refresh();
  assert.equal(markers[4].disabled,false,'Stage 5 must unlock on reaching');
  assert.equal(markers[5].disabled,true,'Stage 6 must stay locked');
  markers[4].listeners.click();
  assert.equal(map.selectedStage(),5,'Last reached stage did not open');
  markers[6].listeners.click();
  assert.equal(map.selectedStage(),5,'Player jumped to locked stage 7');
  reached=11;map.refresh();
  assert(markers.every(x=>x.disabled===false),'Stage 11 completion must unlock all cards');
  markers[6].listeners.click();
  assert.equal(map.selectedStage(),7,'Stage 7 should unlock after being reached');
  assert(overlay.querySelector('.story-map-details-reward').textContent.includes('5-დან 6-მდე'),'Stage 7 reward missing');
 }
 for(const lang of ['en','ru','zh','ka']){
  language=lang;document.dispatchEvent({type:'pirali:languagechange'});
  const expectedStage=map.selectedStage();
  assert(overlay.querySelector('.story-map-details-heading').textContent.includes(lang.toUpperCase()+'-'+expectedStage),'Language sync broke for '+lang);
  assert(overlay.querySelector('.story-map-details-story').textContent.length>12,'Story absent in '+lang);
 }
 language='en';document.dispatchEvent({type:'pirali:languagechange'});
 markers[9].listeners.click();
 assert(overlay.querySelector('.story-map-details-reward').textContent.includes('250'),'Stage 10 reward missing');
 markers[10].listeners.click();
 assert(overlay.querySelector('.story-map-details-goal').textContent.includes('five enemy waves'),'Stage 11 objective missing');
 assert(overlay.querySelector('.story-map-details-reward').textContent.includes('2,000'),'Stage 11 reward missing');
 assert.equal(starts,0,'Map unexpectedly launches game');
 assert.equal(saves,0,'Map unexpectedly saves checkpoint');
 events.keydown({key:'Escape',preventDefault(){}});
 assert.equal(map.selectedStage(),1,'Escape should restore stage 1 default, not blank');
 assert.equal(pane.hidden,false,'Escape left the bottom pane blank');
 events.keydown({key:'Escape',preventDefault(){}});
 assert.equal(overlay.removed,true,'Second Escape should close map');
 menu.children[0].listeners.click();
 const reopened=body.children.at(-1);
 assert(reopened&&!reopened.removed,'Map could not reopen');
 assert.equal(map.selectedStage(),1,'Fresh open must start with stage 1');
 assert.equal(reopened.querySelector('.story-map-details').hidden,false,'Reopened details were blank');
 return {stages:markers.length,localeCount:4};
}
for(const role of ['play','dev']){
 const isDeveloper=role==='dev',root=path.join(__dirname,'..','beta111-'+role);
 const source=fs.readFileSync(path.join(root,'js/features/map/story-map.js'),'utf8');
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const info=JSON.parse(fs.readFileSync(path.join(root,'RELEASE_INFO.json'),'utf8'));
 const result=execute(source,isDeveloper);
 assert.equal(result.stages,11);
 assert.equal(result.localeCount,4);
 assert(!source.includes('data-map-lang'),'Duplicate map language selector returned');
 assert(!source.includes('startGame('),'Map may not launch a stage');
 assert(!source.includes('PiraliCheckpoint?.save'),'Map may not alter checkpoint');
 assert(html.includes('js/features/map/story-map.js?v=beta1113-persistent-unlocks'),'Map cache key stale');
 assert.equal(info.version,role==='play'?'1.11.3-beta.1':'1.11.3-beta.1-dev');
 assert.equal(info.mapStageDetails.defaultSelectedStage,1);
 assert.equal(info.mapStageDetails.developerAllStagesUnlocked,true);
 assert.equal(info.mapStageDetails.checkpointIndependent,true);
 assert(fs.statSync(path.join(root,'assets/maps/pirali-approved.webp')).size>700000,'HD map compressed');
 assert(fs.existsSync(path.join(root,'js/features/map/live-minimap.js')),'In-game mini-map missing');
 if(isDeveloper)assert(html.includes('<script src="js/preview-controls.js'),'Dev test controls missing');
 else assert(!html.includes('<script src="js/preview-controls.js'),'Test controls leaked to Player');
 console.log('PASS BETA 1.11.3 '+role+' map: stage-1 default, 11 stage pins, gate by lifetime progress, 4 languages');
}
console.log('PASS BETA 1.11.3 campaign map');
