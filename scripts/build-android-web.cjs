// Package ONLY the active browser game into dist/android-web for a future Android wrapper.
// Nothing here writes to Firebase or changes the public GitHub Pages build.
const fs=require('fs');
const path=require('path');
const project=path.resolve(__dirname,'..');
const dest=path.join(project,'dist','android-web');
const marker=path.join(dest,'.pirali-generated-bundle');
if(fs.existsSync(dest)){
  if(!fs.existsSync(marker))throw Error('Refusing to delete unknown directory '+dest);
  fs.rmSync(dest,{recursive:true,force:true});
}
fs.mkdirSync(dest,{recursive:true});
const html=fs.readFileSync(path.join(project,'index.html'),'utf8');
const refs=[
  'index.html',
  ...Array.from(html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi),m=>m[1].split('?')[0]),
  ...Array.from(html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/gi),m=>m[1].split('?')[0])
];
const files=new Set();
let totalBytes=0;
function add(rel){
  if(files.has(rel))return;
  if(!rel||rel.startsWith('/')||rel.includes('..')||rel.includes(':'))throw Error('Unsafe path: '+rel);
  const source=path.resolve(project,rel),target=path.resolve(dest,rel);
  if(!source.startsWith(project+path.sep)||!target.startsWith(dest+path.sep))throw Error('Out of project: '+rel);
  if(!fs.existsSync(source))throw Error('Missing active game file: '+rel);
  fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);
  if(!fs.readFileSync(target).equals(fs.readFileSync(source)))throw Error('Copy integrity failure '+rel);
  files.add(rel);totalBytes+=fs.statSync(target).size;
}
for(const rel of refs)add(rel);
function addTree(directory){
  const src=path.join(project,directory);
  if(!fs.existsSync(src))return;
  function visit(folder){
    for(const item of fs.readdirSync(folder,{withFileTypes:true})){
      const full=path.join(folder,item.name),rel=path.relative(project,full).replace(/\\/g,'/');
      if(item.isDirectory())visit(full);
      else if(item.isFile()&&!item.name.startsWith('.')&&rel!=='assets/video/intro-video.mp4')add(rel);
    }
  }
  visit(src);
}
addTree('assets');addTree('data');
add('manifest.json');
const manifest=JSON.parse(fs.readFileSync(path.join(project,'manifest.json'),'utf8'));
const missingAppIcons=[...new Set([...(manifest.icons||[]).map(i=>i.src),'assets/icon-192.png'])].filter(s=>!fs.existsSync(path.join(project,s)));
fs.writeFileSync(marker,'PIRALI generated bundle. Safe to replace with npm run build:android-web.\n');
const report={ok:true,files:files.size,bytes:totalBytes,output:dest,missingAppIcons,important:'Static web export ONLY; signed Play Store AAB not yet created.'};
fs.writeFileSync(path.join(dest,'BUILD_INFO.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
