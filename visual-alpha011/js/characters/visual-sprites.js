/* PIRALI Alpha 0.11 visual prototype — semi-realistic top-down sprite atlas.
 * Canvas-only generated sprites: no downloaded assets, no collisions/AI/gameplay changes.
 * Original drawPlayer/drawEnemy remain available and can be restored instantly.
 */
(function(){
  'use strict';
  const originalPlayer=drawPlayer, originalEnemy=drawEnemy;
  const cache=new Map();
  let enabled=true, painted=0;
  const TAU=Math.PI*2;
  const palette={
    simona:{edge:'#120c0b',cloth:'#622519',light:'#a14b34',shade:'#321311',trousers:'#261a15',boots:'#150f0b',skin:'#b77b4c',accent:'#e6b65c',cap:'#30261b',strap:'#7e502a'},
    rifle:{edge:'#160c0e',cloth:'#65362d',light:'#96604c',shade:'#362221',trousers:'#393027',boots:'#171311',skin:'#b98b64',accent:'#a3483b',cap:'#34312c',strap:'#9b7045'},
    sword:{edge:'#10130c',cloth:'#424f32',light:'#708053',shade:'#273023',trousers:'#353b26',boots:'#141811',skin:'#a87955',accent:'#b85e4a',cap:'#3e4b30',strap:'#796744'},
    officer:{edge:'#171719',cloth:'#333c42',light:'#627178',shade:'#20272c',trousers:'#282c30',boots:'#151517',skin:'#c1936d',accent:'#d6ab53',cap:'#202529',strap:'#977340'}
  };
  const v2Path=(g,pts)=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();};
  function stroke(g,col,w){g.strokeStyle=col;g.lineWidth=w;g.lineJoin='round';g.lineCap='round';g.stroke();}
  function ellipse(g,x,y,rx,ry,col,rotation=0){g.fillStyle=col;g.beginPath();g.ellipse(x,y,rx,ry,rotation,0,TAU);g.fill();}
  function poly(g,pts,col,outline,width=1.5){v2Path(g,pts);g.fillStyle=col;g.fill();if(outline)stroke(g,outline,width);}
  function line(g,pts,col,w){g.beginPath();for(let i=0;i<pts.length;i++)i?g.lineTo(...pts[i]):g.moveTo(...pts[i]);stroke(g,col,w);}
  // All figures face up before directional rotation; this allows full 8-way movement.
  function drawBoots(g,p,step){
    const swing=[0,3,0,-3][step], bounce=[0,-1,0,-1][step];
    for(const side of [-1,1]){
      const x=side*7+(side===1?swing:-swing)*.65;
      poly(g,[[side*5,7],[side*10,8],[x+side*2,21+bounce],[x-side*2,23+bounce]],p.trousers,p.edge,1.35);
      poly(g,[[x-side*3,18+bounce],[x+side*4,18+bounce],[x+side*5,25+bounce],[x-side*5,25+bounce]],p.boots,p.edge,1.5);
      line(g,[[x-2,20+bounce],[x+3,20+bounce]],'rgba(226,210,178,.21)',.7);
    }
  }
  function drawCloth(g,p,kind,step){
    const sway=[0,1.8,0,-1.8][step];
    if(kind==='simona'){
      // Split chokha skirt: tapered coat panels, unlike the original oval body.
      poly(g,[[-12,5],[-3,6],[-3,23],[-13+sway,26],[-17+sway,18]],p.shade,p.edge,2);
      poly(g,[[3,6],[12,5],[17+sway,18],[13+sway,26],[3,23]],p.cloth,p.edge,2);
      line(g,[[-9,13],[-12+sway,22]],'rgba(235,168,100,.42)',1);
      line(g,[[9,13],[12+sway,22]],'rgba(235,168,100,.40)',1);
    }else{
      poly(g,[[-12,5],[12,5],[10,16],[-10,16]],p.shade,p.edge,1.8);
      for(let i=-1;i<=1;i++)line(g,[[i*7,8],[i*6,15]],'rgba(225,218,188,.12)',.7);
    }
    // Human shoulders/waist silhouette with a neck instead of circles.
    const chest=[[-12,-9],[-17,-4],[-12,9],[-8,13],[8,13],[12,9],[17,-4],[12,-9],[5,-11],[-5,-11]];
    poly(g,chest,p.cloth,p.edge,2.3);
    poly(g,[[-10,-7],[-5,-10],[5,-10],[10,-7],[8,8],[-8,8]],p.light,null);
    poly(g,[[-5,-7],[5,-7],[8,10],[-8,10]],p.cloth,null);
    // Central seam and raised color stitching.
    line(g,[[0,-8],[0,11]],p.shade,1.8);
    line(g,[[-9,-7],[-7,6]],'rgba(244,209,135,.28)',1);
    line(g,[[9,-7],[7,6]],'rgba(244,209,135,.28)',1);
    // A belt splits upper body and hip; gold buckle does not dominate silhouette.
    line(g,[[-10,9],[10,9]],p.strap,3.6);
    poly(g,[[-2,7],[2,7],[2,11],[-2,11]],p.accent,p.edge,.55);
    if(kind==='simona'){
      // Gasyrs: five gold cartridge pockets on each chest side, very readable in zoom.
      for(const side of [-1,1])for(let i=0;i<5;i++){
        const x=side*(5.2+i*.9), y=-5+i*2.0;
        line(g,[[x,y],[x+side*.5,y+4]],p.edge,2.1);
        line(g,[[x,y],[x+side*.3,y+2.9]],p.accent,1.2);
      }
      line(g,[[-10,-9],[10,10]],'#3b2316',2.2);
      line(g,[[-9,-8],[9,9]],'#b9874e',.8);
    } else if(kind==='officer'){
      for(const side of [-1,1]){
        poly(g,[[side*9,-9],[side*16,-7],[side*15,-4],[side*8,-6]],p.accent,'#231e11',.65);
      }
      line(g,[[-7,-5],[7,7]],p.accent,1.1);
      ellipse(g,5,0,2.0,2.4,'#cdbb80');
    } else {
      line(g,[[-8,-8],[8,9]],p.strap,2.5);
      poly(g,[[-4,-2],[1,-2],[1,5],[-4,5]],'#393326',p.edge,.7);
      line(g,[[-4,-2],[1,-2]],p.accent,.9);
    }
  }
  function drawHead(g,p,kind){
    // Collar, neck and head set forward of shoulders.
    ellipse(g,0,-10,6,4,p.shade);
    ellipse(g,0,-15,7.5,8.5,p.skin);
    ellipse(g,-1.9,-17,2.0,2.4,'rgba(245,207,161,.23)');
    line(g,[[-5,-12],[-2,-11],[3,-11]],'#573923',1.2);
    if(kind==='simona'){
      poly(g,[[-11,-15],[-10,-25],[-3,-29],[4,-28],[11,-21],[10,-14],[6,-18],[-6,-18]],p.cap,p.edge,2);
      poly(g,[[-8,-20],[-2,-26],[4,-24],[7,-21]],'#56412a',null);
      // Narrow visible face below the qabalakhi shadow.
      ellipse(g,0,-15,4.2,3.2,p.skin);
      line(g,[[-4,-14],[-1,-12],[3,-13]],'#24180e',1.1);
      line(g,[[-1,-11],[1,-11]],'#1d1109',1.5);
      poly(g,[[7,-20],[11,-18],[17,-8],[12,-12]],'#33291c','#16100a',.7);
    }else if(kind==='sword'){
      poly(g,[[-9,-18],[-8,-24],[-2,-31],[3,-30],[9,-20],[7,-15]],p.cap,p.edge,1.8);
      ellipse(g,0,-20,6,3.2,p.light);
      ellipse(g,0,-21,2.3,2.3,p.accent);
    }else{
      // Human peaked cap with visor, not a detached round hat.
      poly(g,[[-10,-17],[-9,-25],[-6,-28],[6,-28],[9,-25],[10,-17]],p.cap,p.edge,1.7);
      poly(g,[[-9,-20],[9,-20],[11,-16],[-11,-16]],p.shade,p.edge,1.1);
      ellipse(g,0,-20,2,2,p.accent);
      line(g,[[-9,-26],[9,-26]],kind==='officer'?p.accent:'#a04b3d',1.6);
    }
    ellipse(g,-2.4,-14,.72,.65,'#23170f');
    ellipse(g,2.4,-14,.72,.65,'#23170f');
    if(kind!=='simona')line(g,[[-2,-11],[0,-10],[3,-11]],'#442d1f',.7);
  }
  function drawArms(g,p,kind,weapon,step){
    const swing=[0,-2,0,2][step],leftEl=[-19,-1+swing],rightEl=[19,-1-swing];
    // Upper sleeves and elbows form separated angular arms.
    poly(g,[[-13,-8],[-18,-9],[-22,-3+swing],[-18,4+swing],[-11,1]],p.shade,p.edge,1.8);
    poly(g,[[13,-8],[18,-9],[22,-3-swing],[18,4-swing],[11,1]],p.cloth,p.edge,1.8);
    line(g,[[-18,-2+swing],[-17,4+swing]],p.light,1.0);
    line(g,[[18,-2-swing],[17,4-swing]],p.light,1.0);
    if(weapon==='sword'){
      line(g,[[18,-3-swing],[22,-13]],p.shade,5.5);
      ellipse(g,22,-13,3,3,p.skin);
      line(g,[[21,-17],[24,-25],[27,-34]],'#a5b1b6',4);
      line(g,[[21,-17],[24,-25],[27,-34]],'#e4e8df',1.45);
      line(g,[[16,-16],[26,-19]],p.accent,2.3);
    }else if(weapon==='shotgun'){
      line(g,[[-17,-4],[0,-16],[11,-19]],p.shade,5.5);
      line(g,[[17,-3],[8,-17],[6,-22]],p.cloth,5.4);
      ellipse(g,8,-19,3.1,3,p.skin);
      line(g,[[7,-18],[8,-34]],'#181c21',5.2);
      line(g,[[7,-20],[8,-34]],'#93a4a2',2.2);
      line(g,[[7,-6],[7,-19]],'#7c5034',4.8);
      line(g,[[3,-23],[10,-23]],'#4b3427',1.5);
    }else if(weapon==='rifle'){
      line(g,[[-17,-3],[-6,-16],[7,-17]],p.shade,6);
      line(g,[[17,-3],[8,-18]],p.cloth,5.5);
      ellipse(g,8,-19,2.8,2.8,p.skin);
      line(g,[[7,-9],[8,-34]],'#202328',4.6);
      line(g,[[8,-23],[8,-34]],'#b5ae98',1.1);
      line(g,[[7,-6],[7,-17]],'#80563a',5.0);
      line(g,[[4,-29],[11,-29]],'#292e30',1.4);
    }else{
      line(g,[[17,-3],[18,-16],[12,-18]],p.shade,5.5);
      ellipse(g,12,-18,3.2,3.2,p.skin);
      line(g,[[13,-18],[16,-31]],'#1b2025',4.8);
      line(g,[[13,-18],[16,-31]],'#6b7978',1.2);
      poly(g,[[11,-19],[15,-19],[17,-13],[13,-10]],'#3a302b','#131414',1);
    }
    ellipse(g,-18,3+swing,3.1,3.5,p.skin);
    // Cuff seam gives hands their own silhouette.
    line(g,[[-20,0+swing],[-16,0+swing]],p.strap,1.0);
  }
  function makeSprite(kind,angleIndex,frame,weapon){
    const canvas=document.createElement('canvas');canvas.width=160;canvas.height=160;
    const g=canvas.getContext('2d',{alpha:true});g.translate(80,80);g.scale(2,2);
    g.rotate((angleIndex/8)*TAU+Math.PI/2);
    const p=palette[kind];
    drawBoots(g,p,frame);
    drawCloth(g,p,kind,frame);
    drawArms(g,p,kind,weapon,frame);
    drawHead(g,p,kind);
    // Fine ambient silhouette light gives visual depth without costly live shadows.
    line(g,[[-13,-8],[-17,-6]],'rgba(246,226,183,.24)',.9);
    return canvas;
  }
  function sprite(kind,angle,frame,weapon){
    const ang=(((angle+TAU)%(TAU))/TAU*8);
    const direction=Math.round(ang)%8;
    const key=kind+':'+direction+':'+frame+':'+weapon;
    if(!cache.has(key)){
      cache.set(key,makeSprite(kind,direction,frame,weapon));painted++;
    }
    return cache.get(key);
  }
  function motionFrame(x,y,vx,vy){
    const speed=Math.hypot(vx||0,vy||0);
    if(speed<.08)return 0;
    const tick=Math.floor(performance.now()/(speed>1.7?115:170));
    return tick%4;
  }
  function drawSpriteWorld(kind,worldX,worldY,angle,frame,weapon,scale=1){
    const x=sx(worldX),y=sy(worldY);const length=80*scale;
    if(x<-(length/2+5)||x>W+length/2+5||y<-(length/2+5)||y>H+length/2+5)return;
    ctx.save();
    ellipse(ctx,x+2,y+8*scale,14*scale,5*scale,'rgba(0,0,0,.36)',0);
    const art=sprite(kind,Number.isFinite(angle)?angle:-Math.PI/2,frame,weapon);
    ctx.drawImage(art,x-length/2,y-length/2,length,length);
    ctx.restore();
  }
  drawPlayer=function(){
    if(!enabled)return originalPlayer();
    if(P.dead)return;
    ctx.save();
    if(invincible&&Math.floor(performance.now()/110)%2===0)ctx.globalAlpha=.64;
    if(dashing)ctx.globalAlpha=.7;
    const frame=motionFrame(P.x,P.y,P.vx,P.vy);
    const selected=window.PiraliAlphaGear?.status?.().selected;
    const weapon=swordOn?'sword':selected==='shotgun'?'shotgun':'pistol';
    drawSpriteWorld('simona',P.x,P.y,P.ang,frame,weapon,1);
    // Preserve combat readability from the original renderer (visual only).
    const px=sx(P.x),py=sy(P.y);
    if(parryActive){
      ctx.strokeStyle='rgba(255,221,74,.86)';ctx.lineWidth=2.7;
      ctx.shadowBlur=10;ctx.shadowColor='#f8e838';
      ctx.beginPath();ctx.arc(px,py,P.r+9,0,TAU);ctx.stroke();ctx.shadowBlur=0;
    }
    if(dashing){
      ctx.strokeStyle='rgba(90,206,255,.76)';ctx.lineWidth=2.7;
      ctx.beginPath();ctx.arc(px,py,P.r+7,0,TAU);ctx.stroke();
      ctx.strokeStyle='rgba(138,219,255,.45)';ctx.lineWidth=1.8;
      for(let i=0;i<3;i++){
        const t=P.ang+Math.PI+(i-1)*.22;
        ctx.beginPath();ctx.moveTo(px+Math.cos(t)*19,py+Math.sin(t)*19);
        ctx.lineTo(px+Math.cos(t)*(28+i*4),py+Math.sin(t)*(28+i*4));ctx.stroke();
      }
    }
    ctx.restore();
  };
  drawEnemy=function(e){
    if(!enabled||e?.etype==='landlord'||!e?.alive)return originalEnemy(e);
    const kind=e.etype==='rifle'?'rifle':e.etype==='officer'?'officer':'sword';
    const x=sx(e.x),y=sy(e.y),r=e.r||14;
    if(x<-70||x>W+70||y<-70||y>H+70)return;
    ctx.save();
    if(e.hf>0&&e.hf%2===0)ctx.globalAlpha=.68;
    drawSpriteWorld(kind,e.x,e.y,e.ang,motionFrame(e.x,e.y,e.vx,e.vy),kind==='sword'?'sword':kind==='rifle'?'rifle':'pistol',.91);
    if(e.maxHp>1){
      ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(x-18,y-r-20,36,5);
      ctx.fillStyle=kind==='officer'?'#e1b35d':'#b85b3c';
      ctx.fillRect(x-18,y-r-20,36*Math.max(0,Math.min(1,e.hp/e.maxHp)),5);
    }
    if(e.state==='alert'){
      ctx.fillStyle='#ffcc55';ctx.font='bold 12px sans-serif';ctx.textAlign='center';
      ctx.fillText('!',x,y-r-23);
    }
    ctx.restore();
  };
  window.PiraliVisualV2=Object.freeze({
    enable:value=>{enabled=!!value;return enabled;},
    isEnabled:()=>enabled,
    stats:()=>({enabled,generatedSprites:painted,cacheSize:cache.size,styles:Object.keys(palette),directions:8,animationFrames:4}),
    previewSprite:(kind,direction,frame,weapon)=>{if(!palette[kind])throw Error('Unknown sprite '+kind);return sprite(kind,(direction%8)*TAU/8,frame%4,weapon)},
    originalPlayer,originalEnemy
  });
})();
