/*
 PIRALI • Alpha 0.14, Atelier F — three genuinely re-rendered, ANIMATED characters.
 Important: three distinct complete character illustrations, NOT overlay stitches.
 - Orthographic top-down + face forward at local -Y, correctly rotates toward SOUTH.
 - Short tucked-in sleeves: elbows not visible.
 - One connected square-ish chokha hem: no split/scissor tails.
 - 0.14 approved weapons are drawn by simona-weapons-only.js above these models.
 - No changes to physics, collision, combat, firearm recoil logic, UI, or Firebase.
 */
(function(){
'use strict';
const PI=Math.PI,TAU=PI*2;
const palettes={
  1:{name:'ტრადიციული',coat:'#7b382a',coatLit:'#a7593c',coatDeep:'#43231d',
     shoulder:'#ad694d',hem:'#582b23',waist:'#3c1e17',metal:'#d6b16f',
     metalHi:'#efd7a7',belt:'#5a3521',hat:'#302d22',hatLit:'#67624b',
     cloth:'#b68563',skin:'#bd8d68',wear:false},
  2:{name:'კინემატოგრაფიული',coat:'#552e27',coatLit:'#92543d',coatDeep:'#251a18',
     shoulder:'#8f4939',hem:'#37211d',waist:'#2b1917',metal:'#c7a77c',
     metalHi:'#f0d9b0',belt:'#372a23',hat:'#242721',hatLit:'#565447',
     cloth:'#8e6751',skin:'#b68567',wear:false},
  3:{name:'მებრძოლი',coat:'#583528',coatLit:'#916048',coatDeep:'#28221d',
     shoulder:'#79503d',hem:'#423227',waist:'#37251d',metal:'#9e8d64',
     metalHi:'#d2c19a',belt:'#564330',hat:'#31372d',hatLit:'#676b50',
     cloth:'#8d7f56',skin:'#b48a65',wear:true}
};
function fill(c,p,color,stroke=null,sw=1){
 c.beginPath();for(let i=0;i<p.length;i++)i?c.lineTo(...p[i]):c.moveTo(...p[i]);
 c.closePath();c.fillStyle=color;c.fill();
 if(stroke){c.lineWidth=sw;c.strokeStyle=stroke;c.lineJoin='round';c.stroke()}
}
function ell(c,x,y,rx,ry,col,rot=0){
 c.beginPath();c.ellipse(x,y,rx,ry,rot,0,TAU);c.fillStyle=col;c.fill();
}
function ln(c,x,y,X,Y,color,w=1){
 c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);
 c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.stroke();
}
function cv(c,x1,y1,xc,yc,x2,y2,col,w=1){
 c.beginPath();c.moveTo(x1,y1);c.quadraticCurveTo(xc,yc,x2,y2);
 c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.stroke();
}
function gradient(c,x1,y1,x2,y2,colors){
 const g=c.createLinearGradient(x1,y1,x2,y2);
 for(const [pos,col] of colors)g.addColorStop(pos,col);
 return g;
}
function radial(c,x,y,r,colors){
 const g=c.createRadialGradient(x-r*.32,y-r*.38,0,x,y,r);
 for(const [t,col] of colors)g.addColorStop(t,col);
 return g;
}
function hslNoiseCanvas(){
 const n=document.createElement('canvas');n.width=112;n.height=112;
 const o=n.getContext('2d');const im=o.createImageData(112,112);
 let x=92237119;
 for(let i=0;i<im.data.length;i+=4){
  x=(Math.imul(1664525,x)+1013904223)>>>0;
  const light=60+(x%132),alpha=15+((x>>>13)%33);
  im.data[i]=light;im.data[i+1]=light;im.data[i+2]=light;im.data[i+3]=alpha;
 }
 o.putImageData(im,0,0);
 return n;
}
const noise=hslNoiseCanvas();
function texture(c,points,opacity=.27){
 c.save();c.beginPath();
 for(let i=0;i<points.length;i++)i?c.lineTo(...points[i]):c.moveTo(...points[i]);
 c.closePath();c.clip();
 c.globalAlpha*=opacity;
 c.fillStyle=c.createPattern(noise,'repeat');c.fillRect(-38,-48,80,106);
 c.restore();
}
function clothHem(c,p,step,mode,time){
 // Shadow and SINGLE connected trailing hem - no individual coat tails.
 const pull=step*.65;
 const back=mode===2?24:mode===3?22:21.5;
 const silhouette=[
  [-11.7,3],[-13.4,12],[-13.2,back-2],
  [-11.4,back+.4+pull],[-4.5,back+.7+pull*.42],
  [4.5,back+.7-pull*.42],[11.4,back+.4-pull],
  [13.2,back-2],[13.4,12],[11.7,3]
 ];
 const base=gradient(c,-14,3,16,back,[
  [0,p.coatLit],[.28,p.coat],[.65,p.hem],[1,p.coatDeep]
 ]);
 fill(c,silhouette,base,'#211713',1.6);texture(c,silhouette,.38);
 // Broad natural cloth folds respond to the step phase.
 const k=step*1.5;
 cv(c,-10.4,7.5,-11.1+k*.35,14.8,-9.9+k*.6,back-2,'rgba(230,172,111,.35)',1.0);
 cv(c,-4.8,9,-6.1+k*.5,17.3,-5.2+k*.4,back-1,'rgba(25,14,14,.4)',1.3);
 cv(c,3.9,8,4.3-k*.5,16,5.2-k*.5,back-1,'rgba(217,145,91,.21)',.9);
 cv(c,10.5,8,11.7-k*.4,15.8,10.1-k*.6,back-2,'rgba(21,15,12,.59)',1.1);
 // Ends stay tied into one elegant rectangular line.
 ln(c,-11,back-.55,11,back-.55,p.metal,.85);
 return silhouette;
}
function torso(c,p,mode,step,breath,lean){
 c.save();c.rotate(lean*.45);
 // Side shadow beneath body adds top-down volume.
 ell(c,2.2,0.3,16.5,14.1,'rgba(8,10,8,.2)');
 const silhouette=[[-9.7,-11.6],[-12.8,-9.3],[-16.6,-5.5],[-16.2,1],
  [-12,10],[-8.1,13],[8.1,13],[12,10],[16.2,1],[16.6,-5.5],
  [12.8,-9.3],[9.7,-11.6]];
 const material=radial(c,-5,-4,31,[[0,p.shoulder],[.26,p.coatLit],[.58,p.coat],[1,p.coatDeep]]);
 fill(c,silhouette,material,'#211712',1.6);texture(c,silhouette,.42);
 // Shoulders and lapels are shaped cloth, not bare arms.
 const left=gradient(c,-15,-10,-7,12,[[0,p.shoulder],[1,p.coat]]);
 const right=gradient(c,9,-9,19,10,[[0,p.coat],[1,p.coatDeep]]);
 fill(c,[[-10.2,-10.5],[-15.5,-7.2],[-14.8,.8],[-10.6,7.4],[-8.2,3.5]],left,'#372018',.9);
 fill(c,[[10.2,-10.5],[15.5,-7.2],[14.8,.8],[10.6,7.4],[8.2,3.5]],right,'#241615',.9);
 cv(c,-13.3,-6,-14.5,0,-10.2,6,'rgba(255,205,152,.3)',1.0);
 cv(c,12.6,-6,14.1,-.2,10.7,6,'rgba(19,14,12,.5)',1.4);
 // Two overlapped triangular waist panels make a real chokha.
 const lapelL=[[-7.8,-10.8],[-1.5,-9.8],[-.6,10],[-6.4,9.3]];
 const lapelR=[[1.5,-9.8],[7.8,-10.8],[6.4,9.3],[.6,10]];
 fill(c,lapelL,gradient(c,-8,-10,0,11,[[0,p.coatLit],[1,p.coat]]),'rgba(30,17,14,.6)',.65);
 fill(c,lapelR,gradient(c,1,-10,8,11,[[0,p.coat],[1,p.coatDeep]]),'rgba(30,17,14,.6)',.65);
 ln(c,0,-9,0,11,'rgba(12,12,9,.56)',1);
 cv(c,-6.8,-9.3,-5.7,-.4,-5.5,8.7,'rgba(246,203,135,.5)',.84);
 cv(c,6.8,-9.3,5.9,-.4,5.5,8.7,'rgba(245,194,127,.22)',.84);
 // Separate darker belt with steel/bronze highlights and leather cross-strap.
 ln(c,-9.4,9.4,9.4,9.4,'#1a120e',3.9);
 ln(c,-9.3,8.3,9.3,8.3,p.belt,2.1);
 fill(c,[[-3,7.45],[3,7.45],[3,11.6],[-3,11.6]],p.metal,'#28180e',.9);
 fill(c,[[-1.8,8.2],[1.8,8.2],[1.8,10.8],[-1.8,10.8]],'#493021');
 ln(c,-10.5,-9.5,7.4,9.8,p.belt,3.9);
 ln(c,-10.1,-9.3,7.1,9.5,'#bc9565',.95);
 ell(c,-10.4,-9.5,1.35,1.45,p.metal);
 // Dress gazyrs: metal cartridges have SHADOWED volume, not drawn-on lines.
 for(let side of[-1,1]){
  for(let i=0;i<5;i++){
   const gx=side*(8.6-i*.36),gy=-6.4+i*2.63;
   fill(c,[[gx-1.75,gy-1],[gx+1.75,gy-1],[gx+1.9,gy+1],[gx-1.9,gy+1]],'#251815');
   ln(c,gx-1.23,gy-.38,gx+1.24,gy-.38,p.metal,1.9);
   ln(c,gx-1.23,gy-.64,gx+1.24,gy-.64,p.metalHi,.58);
   ln(c,gx-1.18,gy+.52,gx+1.14,gy+.52,'#62402a',.82);
  }
 }
 if(mode===1){
  // A: bright historical silk chokha lining, embroidered edging, brass buckle.
  cv(c,-12.2,2,-13.8,7,-12.8,12,'rgba(247,202,139,.42)',1.1);
  cv(c,12.2,2,13.8,7,12.8,12,'rgba(232,183,120,.32)',1);
  ln(c,-8,12,8,12,p.metal,.7);
 } else if(mode===2){
  // B: silk-like layered fabric and depth, understated refined metalwork.
  fill(c,[[-9.5,-10.4],[-5,-11.2],[-3.2,1.8],[-7,7.4]],'rgba(225,173,121,.13)');
  fill(c,[[9.5,-10.4],[5,-11.2],[3.2,1.8],[7,7.4]],'rgba(15,11,10,.24)');
  ell(c,0,9.45,2.2,1.8,p.metal);
  cv(c,-12,-7,-8.5,-12,-4,-11,'rgba(224,189,134,.43)',.74);
 }else if(mode===3){
  // C: worn-but-real leather pouch, thicker fabric and clay-colored harness.
  const pouch=[[7.5,4],[12.3,3.3],[13.2,9],[8.1,10.3]];
  fill(c,pouch,'#37291d','#aa8c5b',1.1);
  fill(c,[[9,4],[12,4],[12,5.8],[9,6]],'#8e754c');
  ln(c,-11.7,2,-12.9,7,'rgba(226,164,108,.42)',1.1);
  ln(c,-9.7,3,-10.5,7,'rgba(31,21,16,.5)',.8);
 }
 // Dynamic highlight from a breathing torso, gently changes with motion.
 c.globalAlpha=.09+.035*Math.sin(breath);
 ell(c,-4.8,-1.5,5.6,10,'#f7e1b0',-.25);
 c.globalAlpha=1;c.restore();
}
function sleeve(c,p,side,step,weapon,fire){
 // Articulated shoulder fabric with cuffs that animate inside the silhouette.
 // Geometry NEVER has a visible round or elbow joint.
 const s=side;
 const leftGun=weapon==='shotgun'&&side===-1;
 const handY=leftGun?-13.5:(side===1?-9.2+fire*2.4:1.1-step*3.3);
 const hx=leftGun?-3.4:s*(side===1?11.5:13.1);
 const sy=-8.1,outer=s*16.7;
 const contours=[
  [s*10.2,-11.1],[s*14.9,-10.1],[outer,-4.9+step*s*.78],
  [hx+s*1.1,handY+.65],[hx-s*2.7,handY+1.4],[s*10.5,-3.6]
 ];
 const grad=gradient(c,-18,-12,20,11,[[0,p.shoulder],[.56,p.coat],[1,p.coatDeep]]);
 fill(c,contours,grad,'#281a15',1.1);texture(c,contours,.22);
 cv(c,s*14.5,-8.1,s*16.2,-2+step*s*.5,hx,handY+.5,
  side===-1?'rgba(246,183,130,.47)':'rgba(16,13,12,.33)',.78);
 // Wrists remain under fabric, none of the previously rejected bare elbows.
 ln(c,hx-2,handY,hx+2,handY,side<0?'#a87150':'#5c3326',1.8);
}
function head(c,p,mode,moving,step){
 // Back nape stays positive Y, face FRONT stays local -Y.
 ell(c,0,-8.85,7.3,4.8,'#231712');
 ell(c,0,-10.1,5.8,2.95,p.skin);
 // Forehead and nose at negative Y remain visible when facing down onscreen.
 const face=[[-5.3,-21.2],[-5.4,-24.1],[-3.6,-27.3],
             [-1.8,-28.4],[0,-30.6],[1.8,-28.4],[3.6,-27.3],[5.4,-24.1],[5.3,-21.2]];
 fill(c,face,gradient(c,-6,-24,6,-28,
  [[0,'#ca9872'],[.44,p.skin],[1,'#835d45']]),'#39261b',.7);
 ell(c,-5.3,-22.7,1.75,2.2,p.skin,-.22);
 ell(c,5.3,-22.7,1.75,2.2,'#a97b55',.22);
 // Jaw and nose are clear at real sprite resolution.
 ln(c,-3.2,-25.1,-1.9,-25.1,'#493025',.75);
 ln(c,1.9,-25.1,3.2,-25.1,'#493025',.75);
 ln(c,0,-26,0,-29,'#e0aa80',1.15);
 ell(c,0,-29.2,1.0,.7,'#9b6043');
 // Crown above forehead. All variations retain traditional Georgian headwrap.
 const hat=radial(c,-2,-15,12,
  [[0,p.hatLit],[.35,p.hat],[.78,'#201a16'],[1,'#161311']]);
 ell(c,0,-16.7,9.7,10.5,'#15130e');
 ell(c,-.15,-17,8.55,9.55,hat);
 // Cloth folds are actual curves following head shape, not rigid decoration.
 cv(c,-7.5,-16.3,-2.3,-12.1,7.2,-15.5,p.cloth,1);
 cv(c,-5.5,-22.1,0,-20.2,5.8,-22.1,'rgba(10,9,8,.75)',1.18);
 cv(c,-6.7,-18.8,-2.3,-17,3.7,-18.4,'rgba(224,199,140,.38)',.94);
 ell(c,-3.5,-19.2,3.5,2.3,'rgba(228,210,157,.15)',-.25);
 if(mode===1){
  // Dark brown traditional hood with restrained pin, not long streaming scarf.
  ell(c,0,-23.5,1.4,1.18,'#e7be7d');
  cv(c,-6.2,-12.4,-3.2,-10,1.5,-10.3,'#8b7558',.83);
 }else if(mode===2){
  // Deep-green charcoal woven hood and subtle squared rim.
  cv(c,-7,-14,-6,-22,-3.5,-24.5,p.metal,.75);
  ell(c,0,-23.2,1.5,1.2,p.metalHi);
  cv(c,3.5,-14.4,5.2,-13.4,6,-10.2,'#85725a',.8);
 }else{
  // Field rough wool band; no cape-tail at all.
  cv(c,-7,-13,-2.5,-10.3,6,-13,p.metal,1.1);
  ell(c,-.2,-22.8,1.25,1.05,'#c6b98d');
  cv(c,-6.1,-20,-6.6,-18,-5.1,-15.5,'#a9a883',.72);
 }
}
function draw(c,{x=0,y=0,angle=-PI/2,variant=1,motion=null,speed=0,dash=false,
 time=performance.now(),weapon='mauser',scale=1}={}){
 const p=palettes[variant]||palettes[1];
 const moving=speed>.11,gait=Number.isFinite(motion?.step)?motion.step:Math.sin(time*.008);
 const step=moving?gait*Math.min(1,Math.max(.42,speed/3.1)):0;
 const bob=Number.isFinite(motion?.bob)?motion.bob:moving?Math.abs(gait)*1.5:Math.sin(time*.0012)*.28;
 const lean=Number.isFinite(motion?.lean)?motion.lean:step*.04;
 const kick=Number.isFinite(motion?.kick)?motion.kick:0;
 const facing=Number.isFinite(motion?.angle)?motion.angle:angle;
 c.save();c.translate(x,y);
 // Ground contact never rotates with the character.
 ell(c,4.2,12.5,17.5,7.2,'rgba(9,13,9,.39)',-.06);
 ell(c,0,13.4,12.5,4.2,'rgba(15,18,12,.20)');
 c.rotate(facing+PI/2+lean);
 c.scale(scale,scale);
 c.translate(0,-bob*.7-(dash?1.5:0));
 // Leather shoes briefly emerge beneath ONE connected hem.
 for(const s of[-1,1]){
  // Boots only peek through briefly, never read as coat tails / two rigid prongs.
  const footY=19.2+step*s*2.7;
  ell(c,s*6.1,footY+1.4,3.0,4.8,'#251b15');
  ln(c,s*4.7,footY+4.0,s*7.5,footY+4.0,'#75553a',.7);
 }
 clothHem(c,p,step,variant,time);
 sleeve(c,p,-1,step,weapon,kick);
 sleeve(c,p,1,step,weapon,kick);
 torso(c,p,variant,step,time*.003,lean);
 // Head is a little dynamically forward when running, but always faces aim.
 c.save();c.translate(0,step*.25);head(c,p,variant,moving,step);c.restore();
 // No additional weapon painting: kept EXACT from approved Study D.
 c.restore();
}
window.PiraliAtelier=Object.freeze({
 version:'alpha014-atelier-f-multiple-animated-renderers',
 draw,
 variants:[
  {id:0,title:'Study D / დამტკიცებული',note:'შენ მიერ არჩეული ალფა 0.13 სიმონა + 0.14 იარაღები.'},
  {id:1,title:'A / ისტორიული',note:'ახალი, მოცულობითი ჩოხა, რეალისტური ქსოვილი, მოკლე სახელოები და ზუსტი ზედხედი.'},
  {id:2,title:'B / კინემატოგრაფიული',note:'მუქი, ბუნებრივი მატერია, სინათლის სიღრმე, მოძრაობადი ჩოხის ნაკეცები.'},
  {id:3,title:'C / ბრძოლის ველიდან',note:'უფრო გამოცდილი მებრძოლის იერი, ნამდვილი ტყავის აღჭურვილობა და ბუნებრივი ქსოვილი.'}
 ]
});
})();
