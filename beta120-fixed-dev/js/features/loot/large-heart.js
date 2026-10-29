/* PIRALI BETA 1.08 — large-heart upgrades; per run, no Firebase. */
(function(){'use strict';
const L={
ka:['გენერალმა დიდი გული ჩამოაგდო! აიღე!','ეშმაკმა დიდი გული დატოვა კარიბჭესთან! აიღე!','დიდი გული აღებულია! მაქსიმუმი: ','აიღე გენერლის დიდი გული!','აიღე ეშმაკის დიდი გული!'],
en:['General dropped a BIG HEART! Pick it up!','Devil left a BIG HEART near the gate! Pick it up!','Big heart collected! Maximum: ','Collect the General\'s big heart!','Collect the Devil\'s big heart!'],
ru:['Генерал оставил БОЛЬШОЕ СЕРДЦЕ! Подбери!','Дьявол оставил БОЛЬШОЕ СЕРДЦЕ у ворот! Подбери!','Большое сердце получено! Максимум: ','Подбери большое сердце генерала!','Подбери большое сердце дьявола!'],
zh:['将军掉落大爱心！快拾取！','恶魔在大门附近掉落大爱心！快拾取！','获得大爱心！生命上限：','拾取将军的大爱心！','拾取恶魔的大爱心！']};
let seven=false,ten=false,spawned7=false,spawned10=false;
const text=k=>(L[window.PiraliLanguage?.getLanguage?.()]||L.ka)[({drop7:0,drop10:1,taken:2,need7:3,need10:4})[k]];
function reset(saved=null){seven=saved?.seven===true;ten=saved?.ten===true;spawned7=false;spawned10=false;}
function claimed(n){return n===7?seven:n===10?ten:false;}
function status(){return {seven,ten};}
function spawn(n,b){
 if(!b||n!==7&&n!==10||claimed(n)||n===7&&spawned7||n===10&&spawned10)return null;
 if(n===7)spawned7=true;else spawned10=true;
 const pk={x:Math.max(60,Math.min(WW-60,b.x+(n===7?-72:48))),y:Math.max(150,Math.min(WH-60,b.y+(n===7?-42:-106))),bob:0,col:false,type:'large-heart',sourceStage:n};
 pickups.push(pk);
 if(typeof showFloatingText==='function')showFloatingText(pk.x,pk.y-52,'❤ +1 MAX','#ffe4eb');
 showBanner(text(n===7?'drop7':'drop10'));return pk;
}
function collect(pk){
 if(!pk||pk.type!=='large-heart')return false;
 if(claimed(pk.sourceStage)||pk.sourceStage!==level)return true;
 if(pk.sourceStage===7)seven=true;else if(pk.sourceStage===10)ten=true;else return true;
 maxHealth=Math.min(7,maxHealth+1);health=Math.min(maxHealth,health+1);updateHealthUI();
 showBanner(text('taken')+maxHealth);
 for(let i=0;i<22;i++){const a=i*Math.PI/11;spawnPart(pk.x,pk.y,Math.cos(a)*3,Math.sin(a)*3,23,i%2?'#ff638d':'#ffe3b5',3);}
 return true;
}
function draw(ctx,pk,x,y){
 if(pk.type!=='large-heart')return false;
 ctx.save();ctx.translate(x,y-13);
 const g=ctx.createRadialGradient(0,0,2,0,0,48);
 g.addColorStop(0,'rgba(255,238,214,.7)');g.addColorStop(.45,'rgba(255,90,120,.4)');g.addColorStop(1,'rgba(255,60,100,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,48,0,Math.PI*2);ctx.fill();
 ctx.shadowColor='#ff4e7c';ctx.shadowBlur=20;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 38px serif';ctx.fillText('❤️',0,0);ctx.shadowBlur=0;
 ctx.strokeStyle='#ffe2ad';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,28+Math.sin(frame*.09)*3,0,Math.PI*2);ctx.stroke();
 ctx.fillStyle='#fff7d9';ctx.font='bold 13px sans-serif';ctx.fillText('+1',0,36);ctx.restore();return true;
}
window.PiraliBigHearts=Object.freeze({reset,claimed,status,spawn,collect,draw,text});
})();