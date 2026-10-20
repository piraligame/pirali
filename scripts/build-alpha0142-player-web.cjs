// PIRALI 0.14.2 approved Android web bundle. Keep the public 0.13 player site untouched.
// Import ONLY the confirmed player channel (play/), NOT root index.html development shell.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const src=path.join(root,'alpha0142-play');
const out=path.join(root,'dist','android-web');
const marker=path.join(out,'.pirali-generated-bundle');
if(!fs.existsSync(path.join(src,'js','characters','simona-weapons-only.js')))
 throw Error('Approved Alpha 0.14.2 Study D weapons missing from player source');
const h=fs.readFileSync(path.join(src,'index.html'),'utf8');
if(!h.includes('PiraliHybrid014.enable(true)')||!h.includes('simona-weapons-only.js'))
 throw Error('Refusing to build APK without approved Study D character / equipment');
const label=fs.readFileSync(path.join(src,'js','menu.js'),'utf8');
if(!label.includes('ALPHA TEST 0.14.2'))throw Error('Wrong player channel version: menu must display Alpha Test 0.14.2');
if(fs.existsSync(out)){
 if(!fs.existsSync(marker))throw Error('Refusing to remove non-generated dist/android-web directory');
 fs.rmSync(out,{recursive:true,force:true});
}
fs.cpSync(src,out,{recursive:true,force:true,filter:p=>!p.includes(path.sep+'.git')});
fs.writeFileSync(marker,'Build generated from approved play/ Alpha 0.14.2 channel.\n');
const files=[];
function walk(dir){
 for(const f of fs.readdirSync(dir,{withFileTypes:true})){
  const full=path.join(dir,f.name);
  if(f.isDirectory())walk(full);
  else if(f.isFile())files.push(path.relative(out,full).replace(/\\/g,'/'));
 }
}
walk(out);
for(const ref of h.matchAll(/(?:src|href)="([^"]+)"/g)){
 const p=ref[1].split('?')[0];
 if(p.includes('://')||p.startsWith('#')||p.startsWith('data:')||p.startsWith('/'))continue;
 if(!fs.existsSync(path.join(out,p)))throw Error('Broken relative player asset: '+p);
}
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const report={
 origin:'approved Alpha 0.13 player + new Alpha 0.14.2 Study D weapons',
 version:'0.14.2',src,
 count:files.length,totalBytes:files.reduce((s,f)=>s+fs.statSync(path.join(out,f)).size,0),
 mainIndexSha256:hash(path.join(src,'index.html')),
 androidIndexSha256:hash(path.join(out,'index.html')),
 exactPlayerIndex:hash(path.join(src,'index.html'))===hash(path.join(out,'index.html')),
 approvedEquipmentIncluded:files.includes('js/characters/simona-weapons-only.js'),
 restrictedToPlayerChannel:true
};
if(!report.exactPlayerIndex||!report.approvedEquipmentIncluded)throw Error('Bundle verification failed');
fs.writeFileSync(path.join(out,'BUILD_INFO.json'),JSON.stringify(report,null,2)+'\n');
console.log('PIRALI_ALPHA014_PLAYER_WEB_OK '+JSON.stringify(report));
