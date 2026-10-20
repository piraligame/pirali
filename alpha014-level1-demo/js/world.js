/* PIRALI 0.14 Chokhatauri environmental visual prototype.
   Cached handcrafted 2D paint layers; new demo ONLY, never changes alpha 0.13. */
(function(){
'use strict';
const WIDTH=1650,HEIGHT=2420,TAU=Math.PI*2;
let seed=531793;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const rand=(a,b)=>a+(b-a)*random();
const lerp=(a,b,t)=>a+(b-a)*t;
const route=y=>820+70*Math.sin(y*.0032+.95)+34*Math.sin(y*.0071+1.3);
const ccache=document.createElement('canvas');ccache.width=WIDTH;ccache.height=HEIGHT;
const g=ccache.getContext('2d',{alpha:false});
function poly(pts,fill,stroke,w=1){
 g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();
 g.fillStyle=fill;g.fill();if(stroke){g.lineWidth=w;g.strokeStyle=stroke;g.stroke();}
}
function circle(x,y,r,fill){g.fillStyle=fill;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
function oval(x,y,rx,ry,color,rot=0){g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,rot,0,TAU);g.fill();}
function segment(x1,y1,x2,y2,col,w=1){g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
function pathStroke(color,width,delta=0){
 g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.beginPath();
 for(let y=HEIGHT+85;y>=-85;y-=24){const x=route(y)+delta;if(y===HEIGHT+85)g.moveTo(x,y);else g.lineTo(x,y)}
 g.stroke();
}
function ground(){
 g.fillStyle='#50553d';g.fillRect(0,0,WIDTH,HEIGHT);
 let gr=g.createLinearGradient(0,0,WIDTH,HEIGHT);
 gr.addColorStop(0,'rgba(197,165,99,.14)');gr.addColorStop(.52,'rgba(72,91,46,.03)');gr.addColorStop(1,'rgba(39,54,32,.24)');
 g.fillStyle=gr;g.fillRect(0,0,WIDTH,HEIGHT);
 for(let i=0;i<530;i++){
  const x=rand(-100,WIDTH+100),y=rand(-100,HEIGHT+100);
  oval(x,y,rand(20,145),rand(12,115),
   ['rgba(19,47,22,.15)','rgba(27,53,29,.11)','rgba(194,155,88,.10)','rgba(99,105,57,.13)'][i%4],
    rand(0,Math.PI));
 }
 // Road occupies actual world geometry: soft irregular rocky earthen lane.
 pathStroke('rgba(23,31,22,.39)',260,-10);
 pathStroke('#8b7757',228);
 pathStroke('#a48d67',199);
 pathStroke('#b19a75',169);
 pathStroke('rgba(171,143,96,.46)',142);
 // Inner compacted path, with nonrepeating stone-and-gravel texture.
 for(let i=0;i<9300;i++){
  const y=rand(0,HEIGHT),cx=route(y);
  const x=rand(0,WIDTH),dist=Math.abs(x-cx);
  if(dist<112){
   const col=['#bba780','#786950','#9b8160','#e1c79c','#584d3b','#ccbc97'][i%6];
   g.globalAlpha=rand(.2,.62);
   oval(x,y,rand(.6,3.8),rand(.5,2.4),col,rand(-1,1));
  }else if(dist>142){
   const col=['#182f1f','#6b7345','#a18f5f','#a48d56','#a3aa6a','#243c25'][i%6];
   g.globalAlpha=rand(.21,.7);
   segment(x,y,x+rand(-5,5),y-rand(1,10),col,rand(.5,2));
  }
 }
 g.globalAlpha=1;
 for(let i=0;i<330;i++){
  const y=rand(0,HEIGHT),x=route(y)+rand(-95,95);
  oval(x,y,rand(2,8),rand(1,5),'rgba(77,65,48,.34)',rand(-.7,.7));
 }
}
function rock(x,y,r,kind=0){
 g.save();g.translate(x,y);g.rotate(rand(-.75,.75));
 oval(9,11,r*1.22,r*.45,'rgba(8,14,9,.43)');
 poly([[-r*.85,0],[-r*.73,-r*.65],[-r*.2,-r*1.04],[r*.72,-r*.72],[r*.96,-r*.16],[r*.65,r*.45],[-r*.4,r*.52]],
  kind?'#6f6e5b':'#8e8d7a','#42453c',1.3);
 poly([[-r*.74,-r*.42],[-r*.2,-r*.92],[r*.69,-r*.65],[r*.2,-r*.17],[-r*.54,-r*.07]],
  kind?'#9b9b81':'#b4ac95');
 poly([[r*.21,-r*.15],[r*.74,-r*.65],[r*.9,-r*.07],[r*.5,r*.4],[0,r*.37]],'#656e5e');
 segment(-r*.25,-r*.57,r*.04,-r*.27,'rgba(226,207,168,.65)',1.2);
 g.restore();
}
function shrubs(x,y,s=1){
 oval(x+6*s,y+7*s,20*s,9*s,'rgba(11,25,13,.26)');
 for(let i=0;i<9;i++){
  const a=rand(0,TAU),d=rand(1,12)*s,r=rand(4,13)*s;
  oval(x+Math.cos(a)*d,y+Math.sin(a)*d,r,r*.7,
     ['#354d2d','#536a35','#687242','#475d2f','#243d28'][i%5],a*.4);
 }
 for(let i=0;i<56;i++){
  const px=x+rand(-19,19)*s,py=y+rand(-14,14)*s;
  const d=Math.hypot((px-x)/(22*s),(py-y)/(17*s));
  if(d>1)continue;
  oval(px,py,rand(.8,2.8)*s,rand(.5,1.6)*s,
   ['#819353','#b1a465','#a39c60','#455931','#74894f'][i%5],rand(-1,1));
 }
 for(let i=0;i<5;i++)circle(x+rand(-12,12)*s,y+rand(-8,8)*s,rand(.8,2)*s,
    i%2?'#d4ad5d':'#e8d4a2');
}
function tree(x,y,r=50){
 g.save();g.translate(x,y);
 oval(16,20,r*1.1,r*.55,'rgba(7,19,12,.46)');
 oval(0,5,r*.18,r*.45,'#2e271e');
 for(let i=0;i<17;i++){
   const a=rand(0,TAU),d=rand(0,r*.56),s=rand(.23,.48)*r;
   const xx=Math.cos(a)*d,yy=Math.sin(a)*d*.81;
   oval(xx+2,yy+4,s*1.1,s*.76,'#1f3520');
   oval(xx,yy,s,s*.76,['#314d2b','#536d36','#4d602e','#64723c','#354f2b'][i%5]);
 }
 // Tiny individual sunlit leaves turn large flat canopy circles into dense foliage.
 for(let i=0;i<420;i++){
  const a=rand(0,TAU),d=Math.sqrt(random())*r*.90;
  const xx=Math.cos(a)*d,yy=Math.sin(a)*d*.76;
  oval(xx-2.6,yy-2.8,rand(.7,2.5),rand(.7,1.8),
   ['rgba(29,54,27,.55)','rgba(164,166,85,.56)','rgba(206,181,86,.54)',
    'rgba(108,138,63,.54)','rgba(65,103,42,.64)'][i%5],rand(0,3));
 }
 for(let i=0;i<28;i++){
  const a=rand(0,TAU),d=rand(0,r*.75);
  oval(Math.cos(a)*d-4,Math.sin(a)*d*.8-3,rand(1.5,5),rand(1,3),
       i%3?'rgba(202,192,113,.29)':'rgba(235,196,101,.48)');
 }
 g.restore();
}
function bushLine(x1,y1,x2,y2,count=10){
 for(let i=0;i<count;i++){
  const t=(i+.18+rand(-.15,.15))/count,x=lerp(x1,x2,t),y=lerp(y1,y2,t);
  if(i%4===0)tree(x,y,rand(35,63));else shrubs(x,y,rand(.7,1.6));
 }
}
function fence(x1,y1,x2,y2){
 const d=Math.hypot(x2-x1,y2-y1),nx=(y2-y1)/d,ny=-(x2-x1)/d;
 g.save();g.strokeStyle='rgba(16,18,12,.49)';g.lineWidth=10;g.beginPath();g.moveTo(x1+6,y1+8);g.lineTo(x2+6,y2+8);g.stroke();
 for(let o of[-7,7]){
  segment(x1+nx*o,y1+ny*o,x2+nx*o,y2+ny*o,'#503920',4);
  segment(x1+nx*o-1,y1+ny*o-1,x2+nx*o-1,y2+ny*o-1,'#92714a',1.2);
 }
 for(let t=0;t<=d;t+=20){
  const q=t/d,x=lerp(x1,x2,q),y=lerp(y1,y2,q);
  segment(x+2,y+7,x+2,y-12,'#38291f',8);
  segment(x,y+5,x,y-16,'#836140',5);
  segment(x-2,y-15,x+2,y-18,'#ceaa70',2);
 }
 g.restore();
}
function house(x,y,s=1,flip=false){
 // Top-down old wooden cottage: steep dark wood-and-slate roof, lit stoop.
 g.save();g.translate(x,y);g.scale(s*(flip?-1:1),s);
 oval(17,41,146,93,'rgba(8,15,11,.50)',-.13);
 poly([[-106,-78],[101,-78],[119,68],[-108,72]],'#5d4b32','#30291f',3);
 for(let i=0;i<27;i++){
  const yy=-68+i*5;
  segment(-97,yy,105,yy-1,['#5a5546','#918572','#565b55','#6b6b60'][i%4],3.6);
 }
 // Sloped roof: broad middle ridge and stepped shadows.
 poly([[-106,-80],[0,-112],[105,-80],[105,60],[0,43],[-108,70]],'rgba(31,35,34,.24)');
 segment(0,-110,0,47,'#b7a58a',4);
 segment(-96,-75,-96,58,'#c0ad87',2);
 segment(103,-78,103,58,'#22231f',5);
 for(let i=0;i<50;i++){
  const xx=rand(-90,93),yy=rand(-69,52);
  segment(xx,yy,xx+rand(8,25),yy,'rgba(16,17,16,.36)',1);
 }
 // Chimney and barrel beside door.
 poly([[61,-57],[82,-57],[87,-35],[65,-33]],'#948071','#3b332e',2);
 poly([[63,-58],[81,-59],[82,-49],[64,-48]],'#beae91');
 g.fillStyle='#a97636';g.fillRect(-19,59,43,14);
 g.fillStyle='#f0ba65';g.fillRect(-16,69,38,3);
 for(let j=0;j<3;j++){oval(130-j*15,63+j*23,14,9,'#755534');oval(130-j*15,60+j*23,12,5,'#ab8656');}
 g.restore();
}
function wagon(x,y){
 g.save();g.translate(x,y);g.rotate(-.2);
 oval(14,14,90,26,'rgba(11,17,13,.34)');
 poly([[-81,-26],[63,-26],[72,17],[-69,20]],'#68462a','#281e17',4);
 poly([[-70,-21],[57,-21],[61,11],[-59,13]],'#9d7647');
 for(let i=0;i<8;i++)segment(-57+i*15,-20,-50+i*15,12,'#5d3e24',2);
 for(let x of[-55,43]){circle(x,25,17,'#1c1a17');circle(x,25,10,'#816340');circle(x,25,4,'#d0b081')}
 segment(68,-4,104,-6,'#9e784e',5);
 g.restore();
}
function bridge(){
 const y=1115,x=route(y);
 g.save();
 // creek crosses road diagonally; curling bank with illuminated water.
 g.beginPath();g.moveTo(-45,y-82);g.bezierCurveTo(410,y-160,830,y+94,WIDTH+55,y+15);
 g.strokeStyle='#2e382c';g.lineWidth=130;g.stroke();
 g.strokeStyle='#777b54';g.lineWidth=109;g.stroke();
 g.strokeStyle='#2c5958';g.lineWidth=83;g.stroke();
 g.strokeStyle='#5e9992';g.lineWidth=42;g.stroke();
 for(let i=0;i<180;i++){
  const xx=rand(0,WIDTH),cy=(y-90)+Math.sin(xx/170)*82,yy=cy+rand(-25,27);
  segment(xx,yy,xx+rand(4,28),yy-2,['rgba(199,226,210,.41)','rgba(33,75,76,.59)'][i%2],rand(1,3));
 }
 // Bridge set over creek, aligned to vertical walk path.
 oval(x+20,y+18,118,111,'rgba(10,19,15,.62)');
 poly([[x-79,y-100],[x+81,y-99],[x+81,y+116],[x-79,y+116]],'#453321','#1f211c',3);
 for(let k=0;k<12;k++){
  const by=y-92+k*17;
  poly([[x-73,by],[x+75,by-2],[x+76,by+13],[x-75,by+15]],
       ['#856c4a','#917a52','#a28a5d'][k%3],'#382d22',1);
  segment(x-60,by+3,x+61,by+1,'rgba(202,174,118,.40)',1.2);
 }
 for(let side of[-1,1]){
  const xx=x+side*88;
  segment(xx,y-111,xx,y+123,'#4f3522',6);
  segment(xx+side*5,y-108,xx+side*5,y+117,'#9c784d',2);
  for(let i=0;i<8;i++){
   const by=y-103+i*30;
   segment(xx-3,by,xx-3,by-24,'#7c5836',6);
  }
 }
 g.restore();
}
function gate(){
 const x=route(207),y=215;
 // Small medieval Georgian church with cross/stone apses and rounded roof from above.
 oval(x+30,y+30,164,130,'rgba(7,18,14,.5)');
 poly([[x-98,y-99],[x+98,y-99],[x+104,y+57],[x-101,y+57]],
  '#7d7869','#2c3934',5);
 poly([[x-85,y-88],[x,y-130],[x+90,y-88],[x+82,y+42],[x,y+68],[x-81,y+42]],
  '#92958c','#3c4741',4);
 for(let i=0;i<16;i++){
  const yy=y-75+i*8;
  segment(x-69,yy,x+67,yy,['#6b716d','#a9ac9d','#73786f'][i%3],2);
 }
 // Cross and nave details
 segment(x,y-110,x,y+50,'#c8bb9f',5);segment(x-25,y-17,x+25,y-17,'#c8bb9f',5);
 circle(x,y-17,5,'#ece0bb');
 poly([[x-25,y+51],[x+25,y+51],[x+26,y+94],[x-26,y+94]],'#b6a68a','#51483b',3);
 g.fillStyle='#302a24';g.fillRect(x-14,y+74,28,21);
 for(let side of[-1,1]){
  rock(x+side*136,y+76,rand(13,27),1);
  shrubs(x+side*175,y+85,1.8);
 }
}
function props(){
 // Stone boundary to the village and scattered boulders.
 for(let i=0;i<73;i++){
  const y=i*31+rand(-9,9),lx=route(y)-170-rand(0,25),rx=route(y)+165+rand(0,36);
  if(Math.abs(y-1115)>160&&Math.abs(y-215)>145){
   if(i%2===0)rock(lx,y,rand(11,29),i%3);
   if(i%3!==0)rock(rx,y,rand(10,23),i%2);
  }
 }
 house(370,1670,1.15,false);house(1290,1880,.96,true);
 house(1250,620,.89,false);house(400,440,1.05,true);
 fence(310,1780,580,1700);fence(1150,1975,1450,1950);
 fence(1130,710,1435,790);fence(213,530,570,610);
 wagon(1200,1510);
 for(let j=0;j<94;j++){
  const x=rand(90,WIDTH-90),y=rand(100,HEIGHT-100);
  if(Math.abs(x-route(y))<148)continue;
  if(j%6===0)tree(x,y,rand(43,75));else if(j%3===0)rock(x,y,rand(9,27));
  else shrubs(x,y,rand(.7,1.8));
 }
 for(let i=0;i<180;i++){
  const y=rand(0,HEIGHT),x=route(y)+rand(-240,240);
  if(Math.abs(x-route(y))<115)continue;
  if(rand(0,1)<.6)shrubs(x,y,rand(.42,.85));
 }
 // Roadside historical landmarks
 rock(route(1800)+133,1848,40,1);
 rock(route(600)-139,605,36,1);
 // Tiny field altar
 poly([[452,1388],[485,1350],[516,1387],[515,1424],[456,1424]],'#858578','#3a4036',3);
 segment(483,1369,483,1410,'#d4c7ab',3);
 segment(470,1382,498,1382,'#d4c7ab',3);
}
function create(){
 seed=531793;ground();
 // Props behind creek and bridge.
 props();bridge();gate();
 // Foreground flowers and grasses, placed off road for visual depth.
 for(let i=0;i<1850;i++){
  const y=rand(0,HEIGHT),x=rand(0,WIDTH);
  if(Math.abs(x-route(y))<122)continue;
  const n=i%11;
  if(n<4){
   segment(x,y,x+rand(-3,3),y-rand(3,9),['#30472b','#7c8849','#6a7242'][n%3],1.3);
  }else if(n<9){
   circle(x,y,rand(1.1,3.3),n%2?'#cfaa48':'#e8d29a');
   circle(x+1,y-1,rand(.6,1.2),'#f0e1af');
  }else shrubs(x,y,rand(.26,.55));
 }
 // Filmic surface grain, cached once. Reduces flat vector-like terrain.
 const noise=document.createElement('canvas');noise.width=104;noise.height=104;
 const ng=noise.getContext('2d'),pix=ng.createImageData(104,104);
 for(let k=0;k<pix.data.length;k+=4){
  const n=Math.floor(rand(35,220));pix.data[k]=n;pix.data[k+1]=n;
  pix.data[k+2]=n;pix.data[k+3]=Math.floor(rand(12,37));
 }
 ng.putImageData(pix,0,0);
 g.fillStyle=g.createPattern(noise,'repeat');g.fillRect(0,0,WIDTH,HEIGHT);
}
function draw(c,camera){
 const {left,top,width,height}=camera;
 c.drawImage(ccache,left,top,width,height,0,0,c.canvas.width,c.canvas.height);
}
create();
window.PiraliDemoWorld=Object.freeze({
 width:WIDTH,height:HEIGHT,route,start:{x:route(2050),y:2050},
 finish:{x:route(300),y:300},
 enemySpawns:[{x:route(1735),y:1735,kind:'rifle'},{x:route(1480)-18,y:1480,kind:'sword'},
              {x:route(800)+15,y:800,kind:'rifle'},{x:route(485),y:485,kind:'officer'}],
 background:ccache,draw
});
})();
