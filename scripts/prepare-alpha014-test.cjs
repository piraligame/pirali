// Publish the approved Alpha 0.14 player game separately as a developer preview.
// This script never modifies the main /play or alpha-0.13 installation assets.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'alpha014-test');
const src=path.join(root,'play');
if(fs.existsSync(out))throw Error('Already exists, refusing overwrite: '+out);
fs.cpSync(src,out,{recursive:true});
let html=fs.readFileSync(path.join(out,'index.html'),'utf8');
if(!html.includes('simona-weapons-only.js')||!html.includes('PiraliHybrid014.enable(true)'))throw Error('Study D not enabled!');
const cssMeta='<meta name="robots" content="noindex,nofollow">\n';
const shield=`<script>
window.PiraliVisualPreviewReadonly=true;
window.PiraliAlpha014Test=true;
// Developer preview should never alter the real Firebase score database.
(function(){
 const nativeFetch=window.fetch.bind(window);
 window.fetch=function(input,init){
  const url=typeof input==='string'?input:input?.url||'';
  const method=String(init?.method||input?.method||'GET').toUpperCase();
  if(/firebaseio\\.com/i.test(url)&&method!=='GET'&&method!=='HEAD'){
   return Promise.reject(new Error('PIRALI Alpha 0.14 test: Firebase writes disabled'));
  }
  return nativeFetch(input,init);
 };
})();
</script>\n`;
html=html.replace('</head>',cssMeta+shield+'</head>');
if(!html.includes('window.PiraliVisualPreviewReadonly=true'))throw Error('Preview read-only flag not inserted');
html=html.replace('</body>','<script src="js/preview-controls.js?v=alpha014-studyD-test"></script>\n</body>');
html=html.replace('<title>ფირალი — სიმონას გზა</title>',
 '<title>ფირალი — Alpha 0.14 სატესტო თამაში • სიმონა Study D</title>');
fs.writeFileSync(path.join(out,'index.html'),html);
const panel=fs.readFileSync(path.join(root,'alpha013-graphics-phase1','js','preview-controls.js'),'utf8');
fs.writeFileSync(path.join(out,'js','preview-controls.js'),
 panel.replace('Alpha 0.13 PHASE 1','Alpha 0.14 Study D dedicated test').replaceAll('🌲 ტესტი','🧪 ტესტი'));
const l=fs.readFileSync(path.join(out,'js/runtime/leaderboard.js'),'utf8');
if(!l.includes('async function lbPush('))throw Error('Could not protect leaderboard');
fs.writeFileSync(path.join(out,'js/runtime/leaderboard.js'),
 l.replace('async function lbPush(name, sc, lv, win){','async function lbPush(name, sc, lv, win){\n  // NEVER send alpha014 test points to production leaderboard.\n  if(window.PiraliVisualPreviewReadonly)return lcLoad();'));
const files=[];
function walk(folder){for(const e of fs.readdirSync(folder,{withFileTypes:true})){
 const f=path.join(folder,e.name);
 if(e.isDirectory())walk(f);else if(e.isFile())files.push(path.relative(out,f).replace(/\\/g,'/'))
}}walk(out);
for(const ref of html.matchAll(/(?:src|href)="([^"]+)"/g)){
 const rel=ref[1].split('?')[0];
 if(rel.includes('://')||rel.startsWith('/')||rel.startsWith('#')||rel.startsWith('data:'))continue;
 if(!fs.existsSync(path.join(out,rel)))throw Error('Preview missing resource: '+rel);
}
const info={version:'0.14',role:'developer-test-not-player-release',source:'approved Study D, all five original game tours',
previewControls:true,firebaseWritesBlocked:true,files:files.length,
oldMainPlayerUnchanged:true,installableAPK:'downloads/PIRALI_Alpha_Test_0.14.apk'};
fs.writeFileSync(path.join(out,'TEST_INFO.json'),JSON.stringify(info,null,2));
console.log('ALPHA014_TEST_STAGED '+JSON.stringify(info));
