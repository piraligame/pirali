const WW=2000,WH=3800;let CHURCH_X=WW/2;const CHURCH_Y=120;
const SPD=1.42,BSPD=6.8,CAM_EASE=0.075;
const DASH_FORCE=7.5,DASH_DUR=12,DASH_COOLDOWN=180;
const CAM_ZOOM=0.72; // zoom in (lower = more zoomed in)

// Titles are configured in js/config/levels.js
const LEVEL_NAMES=['',...PIRALI_LEVELS.map(l=>'ტური '+l.number+' — '+l.ka)];
// Environment per level: {weather, groundColor, pathColor, skyTop, skyBot, treeStyle, timeLabel}
const LEVEL_ENV=[null,
  {w:'clear', ground:'forest',  sky:['#6090b8','#a8c8d8','#c0d8b8'], tod:'დღე'},
  {w:'mist',  ground:'forest',  sky:['#7898a8','#9ab0b0','#b0c0a8'], tod:'შუადღე'},
  {w:'hot',   ground:'desert',  sky:['#e8c068','#f0a840','#e87820'], tod:'ცხელი სიცხე'},
  {w:'dusk',  ground:'desert',  sky:['#b04818','#7a2808','#3a1808'], tod:'მწუხრი'},
  {w:'night', ground:'night',   sky:['#080c18','#101828','#0c1420'], tod:'ღამე'},
];

let running=false,score=0,health=5,maxHealth=5,ammo=8,maxAmmo=8,level=1;
let camX=0,camY=0,frame=0;
let done=false,invincible=false;
let swordOn=false,swordCD=0,shootCD=0,swordT=0,parryActive=false;
let dashT=0,dashCD=0,dashDx=0,dashDy=0,dashing=false;
let weatherTime=0;
let weather='clear',weatherAlpha=0;
let boss=null;
let finalLordSpawned=false,finalVictoryPending=false,finalChurchNotice=false;
const inventory={herbs:0,medals:0};
let swordCombo=0,swordComboTimer=0;
// Screen shake
let shakeX=0,shakeY=0,shakePow=0;
// Combo popup
let comboDisplay=0,comboTimer=0;
// Blood decals on ground (persistent)
let bloodDecals=[];
// Kill streak
let killStreak=0,killStreakTimer=0;
// Low health warning pulse
let lowHpPulse=0;

const P={x:WW/2,y:WH-180,r:16,vx:0,vy:0,ang:-Math.PI/2,wf:0,wt:0,dead:false,stepT:0};
let path=[],signNode=null,trees=[],enemies=[],bullets=[],parts=[],pickups=[],corpses=[],ambients=[];
let mountains=[];

// ── HASH ──
function hash(x,y){let h=((x*1664525+y*1013904223)&0x7fffffff);h^=h>>13;return(h*1540483477&0x7fffffff)/0x7fffffff;}

// ── PATH DIST ──
function dpth(px,py){
  let m=1e9;
  for(let i=0;i<path.length-1;i++){
    const a=path[i],b=path[i+1];
    const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy;
    if(l2<1)continue;
    const t=Math.max(0,Math.min(1,((px-a.x)*dx+(py-a.y)*dy)/l2));
    m=Math.min(m,Math.hypot(a.x+t*dx-px,a.y+t*dy-py));
  }
  return m;
}

// ── WORLD GEN ──
function genWorld(){
  PiraliFX.reset(); // Reset visual-only effects between stages.
  PiraliBetaGear.reset();
  path=[];trees=[];enemies=[];bullets=[];parts=[];pickups=[];corpses=[];ambients=[];bloodDecals=[];_floats.length=0;done=false;boss=null;finalLordSpawned=false;finalVictoryPending=false;finalChurchNotice=false;
  const env=LEVEL_ENV[Math.min(level,5)];
  CHURCH_X=level===1?650:WW/2;
  weather=env.w;weatherAlpha=0;

  // Mountains — regenerate each level
  mountains=[];
  const mCount=level>=3?8:16; // fewer mountains in desert levels
  for(let i=0;i<mCount;i++) mountains.push({
    x:Math.random()*WW*1.3-WW*.15,
    h:180+Math.random()*360,w:240+Math.random()*420,
    snow:level<=2&&Math.random()>.4,layer:Math.random()>.5?0:1
  });
  mountains.sort((a,b)=>a.layer-b.layer);

  // Beta 0.12 level one follows the painted Chokhatauri lane. Other levels
  // keep the old randomized path exactly as before.
  if(level===1){
    path.push(...[
      {x:940,y:WH-100},{x:850,y:3350},{x:770,y:2950},{x:710,y:2550},
      {x:670,y:2150},{x:625,y:1750},{x:600,y:1350},{x:595,y:950},
      {x:610,y:600},{x:650,y:300}
    ]);
  }else{
    let ppx=WW/2,ppy=WH-100;
    path.push({x:ppx,y:ppy});
    const totalSteps=14+level*2;
    for(let i=0;i<totalSteps;i++){
      ppy-=190+Math.random()*140;
      const steerFrac=Math.max(0,(i-(totalSteps-3))/3);
      const drift=(Math.random()-.5)*270*(1-steerFrac);
      const steer=(CHURCH_X-ppx)*steerFrac*.55;
      ppx+=drift+steer;
      ppx=Math.max(210,Math.min(WW-210,ppx));
      path.push({x:ppx,y:ppy});
    }
  }
  // Final approach: two guide points straight down to church
  const lastPt=path[path.length-1];
  const midY=(lastPt.y+CHURCH_Y)/2;
  path.push({x:CHURCH_X,y:midY});          // intermediate — straight to center
  path.push({x:CHURCH_X,y:CHURCH_Y+70});   // church entrance
  signNode={x:path[Math.floor(path.length*.5)].x,y:path[Math.floor(path.length*.5)].y};

  // Trees — variety depends on environment
  const isDesert=env.ground==='desert';
  const isNight=env.ground==='night';
  for(let i=0;i<360;i++){
    const tx=40+Math.random()*(WW-80),ty=220+Math.random()*(WH-380);
    if(dpth(tx,ty)>114&&Math.hypot(tx-CHURCH_X,ty-CHURCH_Y)>168){
      let kind,sz;
      if(isDesert){
        const r=Math.random();
        kind=r<.5?'dead':r<.72?'rock':'bush';
        sz=kind==='rock'?14+Math.random()*18:kind==='dead'?10+Math.random()*10:8+Math.random()*7;
      } else if(isNight){
        const r=Math.random();
        kind=r<.35?'pine':r<.55?'dead':r<.75?'oak':'bush';
        sz=kind==='bush'?9+Math.random()*8:kind==='dead'?11+Math.random()*9:16+Math.random()*20;
      } else {
        const r=Math.random();
        kind=r<.28?'oak':r<.52?'pine':r<.68?'birch':r<.84?'bush':'dead';
        sz=kind==='bush'?9+Math.random()*8:kind==='dead'?11+Math.random()*9:16+Math.random()*20;
      }
      trees.push({x:tx,y:ty,r:sz,kind,off:Math.random()*6.28});
    }
  }

  PiraliBetaArt.begin(level,path,WW,WH,dpth);

  // Enemies — evenly distributed, STOP 4 segments before church, +30% count
  const ehp=level<=2?1:level<=4?2:PIRALI_BALANCE.finalBaseEnemyHp;
  const usableSegs=path.length-6; // skip first 2 (start) + last 4 (church approach)
  const normalCount=Math.floor(usableSegs*(0.85+level*0.096));
  const totalEnemies=level===5?Math.max(1,Math.ceil(normalCount*PIRALI_BALANCE.finalEnemyMultiplier)):normalCount;
  for(let e2=0;e2<totalEnemies;e2++){
    const segIdx=2+Math.floor((e2/totalEnemies)*usableSegs);
    const ep=path[Math.min(segIdx,path.length-5)]; // clamp away from church
    const a=Math.random()*6.28,d=28+Math.random()*65;
    const rng=Math.random();
    const etype=rng<.4?'rifle':rng<.75?'saber':'officer';
    const ehp2=etype==='officer'?ehp+1:ehp;
    enemies.push({
      x:ep.x+Math.cos(a)*d,y:ep.y+Math.sin(a)*d,
      r:etype==='officer'?14:12,
      hp:ehp2,maxHp:ehp2,vx:0,vy:0,ang:Math.random()*6.28,
      patrol:{cx:ep.x,cy:ep.y,radius:38+Math.random()*48,t:Math.random()*6.28,spd:.24+Math.random()*.16+level*.025},
      sT:58+Math.random()*88,alive:true,hf:0,wf:0,etype,
      alertTimer:0,state:'patrol',flankTimer:0,groupId:segIdx,
      retreating:false,retreatTimer:0
    });
  }

  // BOSS only on level 5 — Russian General with Phase 2
  if(level===5){
    const bp=path[Math.floor(path.length*0.55)];
    boss={
      x:bp.x,y:bp.y,r:24,hp:PIRALI_BALANCE.finalBossHp,maxHp:PIRALI_BALANCE.finalBossHp,
      vx:0,vy:0,ang:0,alive:true,hf:0,wf:0,
      sT:50*PIRALI_BALANCE.finalBossFireInterval,chargeT:0,charging:false,chargeDx:0,chargeDy:0,
      rageMode:false,enrageHp:PIRALI_BALANCE.finalBossRageHp,
      phase:1, // phase 2 when hp<=enrageHp
      groundSlamCD:0,groundSlamActive:false,groundSlamT:0,groundSlamX:0,groundSlamY:0
    };
  }

  // Pickups: ammo, health, herbs (restore 2hp), medals (score bonus)
  for(let i=0;i<6+level;i++){
    const pp=path[1+Math.floor(Math.random()*(path.length-2))];
    const rng=Math.random();
    const type=rng<.52?'ammo':rng<.62?'health':rng<.82?'herb':'medal';
    pickups.push({x:pp.x+(Math.random()-.5)*100,y:pp.y+(Math.random()-.5)*100,bob:Math.random()*6.28,col:false,type});
  }

  PiraliBetaGear.scatterOnFinal(path,pickups,level);

  // Ambient nature: flowers, mushrooms along path edges
  ambients=[];
  for(let i=0;i<path.length-1;i++){
    const a=path[i],b=path[i+1];
    const steps=4;
    for(let s=0;s<steps;s++){
      const t2=s/steps;
      const mx=a.x+(b.x-a.x)*t2,my=a.y+(b.y-a.y)*t2;
      const nx=-(b.y-a.y),ny=(b.x-a.x),nl=Math.hypot(nx,ny)||1;
      for(const side of[-1,1]){
        const dist=48+Math.random()*36;
        const ax=mx+(nx/nl)*dist*side+(Math.random()-.5)*20;
        const ay=my+(ny/nl)*dist*side+(Math.random()-.5)*20;
        if(ax>50&&ax<WW-50&&ay>200&&ay<WH-50){
          const kind=Math.random()>.6?'flower':'mushroom';
          ambients.push({x:ax,y:ay,kind,col:kind==='flower'?
            ['#ff6688','#ffaa22','#aaddff','#88ff88'][Math.floor(Math.random()*4)]:
            '#cc4422',sz:3+Math.random()*4,off:Math.random()*6.28});
        }
      }
    }
  }

  P.x=path[0]?.x||WW/2;P.y=WH-180;P.vx=P.vy=0;P.dead=false;P.ang=-Math.PI/2;
  camX=P.x-W*CAM_ZOOM;camY=P.y-H*CAM_ZOOM;
  dashCD=0;dashing=false;
}

// ── JOYSTICK ──
