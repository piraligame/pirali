'use strict';
// Bundle the production PLAYER web sources of Beta 1.13 into the EXISTING Capacitor app.
// No sensitive signing material belongs in this script or in the repository.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const input=path.join(root,'beta113-play');
const target=path.join(root,'dist','android-web');
const marker=path.join(target,'.pirali-generated-bundle');
if(!fs.existsSync(path.join(input,'index.html')))throw Error('Beta 1.13 Player source missing');
const oldGenerated=fs.existsSync(target)&&fs.existsSync(marker);
if(fs.existsSync(target)&&!oldGenerated)throw Error('Refusing to overwrite unmarked directory '+target);
if(oldGenerated)fs.rmSync(target,{recursive:true,force:true});
fs.mkdirSync(target,{recursive:true});
const included=[];
function copy(rel){
 if(!rel||path.isAbsolute(rel)||rel.includes('..')||rel.includes(':'))throw Error('Unsafe path: '+rel);
 const src=path.resolve(input,rel),dest=path.resolve(target,rel);
 if(!src.startsWith(input+path.sep)||!dest.startsWith(target+path.sep))throw Error('Directory traversal: '+rel);
 if(!fs.existsSync(src))throw Error('Missing file: '+rel);
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 fs.copyFileSync(src,dest);
 if(!fs.readFileSync(dest).equals(fs.readFileSync(src)))throw Error('File copy mismatch: '+rel);
 included.push(rel);
}
function copyTree(name){
 const source=path.join(input,name);
 if(!fs.existsSync(source))return;
 function walk(dir){
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
   const file=path.join(dir,e.name);
   if(e.isDirectory())walk(file);
   else if(e.isFile()&&!e.name.startsWith('.'))
    copy(path.relative(input,file).replace(/\\/g,'/'));
  }
 }
 walk(source);
}
for(const p of ['index.html','manifest.json','RELEASE_INFO.json','privacy.html'])copy(p);
for(const name of ['assets','css','js','data','firebase'])copyTree(name);
const html=fs.readFileSync(path.join(target,'index.html'),'utf8');
const resources=[
 ...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi),
 ...html.matchAll(/<link\b[^>]*\bhref="([^"]+)"/gi)
].map(m=>m[1].split('?')[0]).filter(x=>x&&!/^https?:\/\//i.test(x)&&!/^data:/i.test(x));
for(const rel of resources){
 if(rel.startsWith('/')||rel.includes('..')||!fs.existsSync(path.join(target,rel)))
  throw Error('Missing packaged reference '+rel);
}
if(!html.includes("window.PiraliGameVersion='1.13.0-beta.1'"))throw Error('Packaged game is not Beta 1.13 Player');
if(!html.includes("window.PiraliSeasonReleaseEnabled=true;")||
   !html.includes("window.PiraliVisualPreviewReadonly=false;"))
 throw Error('DEV or offline preview accidentally selected');
if(html.includes('<script src="js/preview-controls.js'))throw Error('DEV controls leaked into production game');
const rel=JSON.parse(fs.readFileSync(path.join(target,'RELEASE_INFO.json'),'utf8'));
if(rel.version!=='1.13.0-beta.1'||rel.developerOnly||rel.androidVersionCode!==19)throw Error('Android release metadata mismatch');
const manifest=JSON.parse(fs.readFileSync(path.join(target,'manifest.json'),'utf8'));
for(const icon of manifest.icons||[]){
 if(!fs.existsSync(path.join(target,icon.src)))throw Error('App manifest icon missing: '+icon.src);
}
fs.writeFileSync(marker,'PIRALI Beta 1.13 generated signed-Android source; safe to replace.\n');
const report={ok:true,source:'beta113-play/',version:'1.13.0-beta.1',
 applicationId:'ge.piraligame.pirali',versionCode:19,versionName:'1.13',
 files:included.length,bytes:included.reduce((n,x)=>n+fs.statSync(path.join(target,x)).size,0),
 output:target,signing:'Local protected keystore only; never put signing secrets on GitHub'};
fs.writeFileSync(path.join(target,'BUILD_INFO.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
