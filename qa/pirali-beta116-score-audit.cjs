/* Scan active beta116 game JavaScript for additional direct point writers. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
for(const v of ['play','dev']){
 let count=0;
 const root=path.join(__dirname,'..','beta116-'+v,'js');
 function walk(dir){
  for(const item of fs.readdirSync(dir,{withFileTypes:true})){
   const p=path.join(dir,item.name);
   if(item.isDirectory())walk(p);
   else if(p.endsWith('.js')){
    fs.readFileSync(p,'utf8').split('\n').forEach((line,i)=>{
      const code=line.trim();
      if(code.startsWith('//')||code.startsWith('*'))return;
      if(/(?<![\w.])score\s*(?:\+=|-=|\*=|\/=|\+\+|--|=(?!=|>))/.test(code)){
        console.log(v+' '+path.relative(root,p)+':'+(i+1)+' '+code.slice(0,180));
        count++;
      }
    });
   }
  }
 }
 walk(root);console.log('TOTAL SCORE ASSIGNMENT SITES '+v+': '+count);
}
