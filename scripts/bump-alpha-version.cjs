const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),tag=process.argv[2];
if(!/^0\.\d{2}$/.test(tag)){throw Error('Usage: npm run alpha:next -- 0.08')}
const newCode=Number(tag.slice(-2));
const gradle=path.join(root,'android/app/build.gradle'),menu=path.join(root,'js/menu.js'),pkg=path.join(root,'package.json');
let a=fs.readFileSync(gradle,'utf8'),b=fs.readFileSync(menu,'utf8');
const m=a.match(/versionCode (\d+)\s*\n\s*versionName "([^"]+)"/),menuMatch=b.match(/PIRALI [^']*ALPHA TEST (\d+\.\d+)/i);
if(!m||!menuMatch)throw Error('Current alpha version format unknown; refusing to change');
const oldCode=Number(m[1]);
if(oldCode<7||newCode!==oldCode+1)throw Error('Next version must increment versionCode by exactly 1: '+oldCode+' -> '+(oldCode+1));
const oldTag=m[2];
if(!/^0\.\d{2}$/.test(oldTag))throw Error('Existing version is not Alpha 0.xx');
a=a.replace('versionCode '+oldCode,'versionCode '+newCode).replace('versionName "'+oldTag+'"','versionName "'+tag+'"');
b=b.replace(menuMatch[0],menuMatch[0].replace(oldTag,tag));
const pj=JSON.parse(fs.readFileSync(pkg,'utf8'));pj.version='0.'+newCode+'.0';
fs.writeFileSync(gradle,a);fs.writeFileSync(menu,b);fs.writeFileSync(pkg,JSON.stringify(pj,null,2)+'\n');
console.log('PIRALI version advanced from '+oldTag+' / '+oldCode+' to '+tag+' / '+newCode+'. Build with scripts/build-alpha-local.ps1. NEVER replace signing key.');
