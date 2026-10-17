  if(window.PIRALI_BETA)window.PIRALI_BETA=Object.freeze({...window.PIRALI_BETA,version:'0.09'});
  document.querySelectorAll('.menu-version').forEach(el=>{el.textContent=el.textContent.replace(/0\.08/g,'0.09');});
/* PIRALI Beta 0.09: outcome navigation and cosmetic-only visual polish. */
(function(){
  'use strict';
  const labels={ka:{menu:'🏠 მთავარ მენიუში დაბრუნება',records:'🏆 რეკორდები'},en:{menu:'🏠 RETURN TO MAIN MENU',records:'🏆 LEADERBOARD'},ru:{menu:'🏠 ВЕРНУТЬСЯ В ГЛАВНОЕ МЕНЮ',records:'🏆 РЕКОРДЫ'},zh:{menu:'🏠 返回主菜单',records:'🏆 排行榜'}};
  function decorateOutcome(){
    const screen=document.getElementById('screen');
    if(!screen?.matches('.gameover-screen,.victory-screen'))return;
    let records=screen.querySelector('#outcome-records');
    if(!records){records=screen.querySelector('button.sbtn');if(records){records.id='outcome-records';records.classList.add('beta-outcome-action');}}
    let menu=screen.querySelector('#outcome-menu');
    if(!menu){
      menu=document.createElement('button');menu.type='button';menu.id='outcome-menu';menu.className='sbtn beta-outcome-action beta-outcome-menu';
      menu.addEventListener('click',()=>{document.getElementById('lb-overlay').style.display='none';window.PiraliStats?.hide?.();goToMenu();});
      records?.after(menu);
    }
    const lang=window.PiraliLanguage?.getLanguage?.()||'ka';const copy=labels[lang]||labels.ka;
    if(records){records.textContent=copy.records;records.setAttribute('aria-label',copy.records);}
    menu.textContent=copy.menu;menu.setAttribute('aria-label',copy.menu);
  }
  const style=document.createElement('style');style.textContent=
    '#screen.gameover-screen,#screen.victory-screen{gap:8px}'+
    '#screen.gameover-screen .sbox,#screen.victory-screen .sbox{margin-bottom:8px}'+
    '#screen .beta-outcome-action{box-sizing:border-box;width:min(340px,calc(100vw - 42px));min-height:54px;padding:12px 18px;letter-spacing:1px;font-size:14px}'+
    '#screen .beta-outcome-menu{background:linear-gradient(180deg,#263b22,#132315);border-color:rgba(153,190,113,.8);color:#e0efc2;box-shadow:0 0 22px rgba(89,139,53,.23),inset 0 1px 0 rgba(220,248,170,.16),0 4px 12px rgba(0,0,0,.6)}'+
    '#screen .beta-outcome-menu:hover{background:linear-gradient(180deg,#34552b,#1b3820);border-color:#c3db8e}'+
    '@media(max-height:700px){#screen.gameover-screen,#screen.victory-screen{justify-content:flex-start;padding-top:28px;padding-bottom:28px}}';document.head.appendChild(style);
  const originalGameOver=window.showGameOver,originalVictory=window.showVictory;
  if(typeof originalGameOver==='function')window.showGameOver=function(){const r=originalGameOver.apply(this,arguments);decorateOutcome();return r;};
  if(typeof originalVictory==='function')window.showVictory=function(){const r=originalVictory.apply(this,arguments);decorateOutcome();return r;};
  document.addEventListener('pirali:languagechange',decorateOutcome);
  // Painted size and highlights only; the collision radius and game balance stay intact.
  const originalDrawPlayer=window.drawPlayer;
  if(typeof originalDrawPlayer==='function')window.drawPlayer=function(){if(P.dead)return originalDrawPlayer.apply(this,arguments);const cx=sx(P.x),cy=sy(P.y);ctx.save();ctx.translate(cx,cy);ctx.scale(1.10,1.10);ctx.translate(-cx,-cy);originalDrawPlayer.apply(this,arguments);ctx.restore();};
  // Warm/cool bounce light changes by level without covering the HUD.
  const originalDrawBG=window.drawBG;
  if(typeof originalDrawBG==='function')window.drawBG=function(){
    originalDrawBG.apply(this,arguments);const env=LEVEL_ENV[Math.min(level,5)]||LEVEL_ENV[1];const night=env.ground==='night';
    const hue=night?'90,125,195':env.ground==='desert'?'244,179,76':'168,204,132';
    const glow=ctx.createRadialGradient(W*.50,H*.38,Math.min(W,H)*.06,W*.50,H*.38,Math.max(W,H)*.78);
    glow.addColorStop(0,'rgba('+hue+',.075)');glow.addColorStop(.58,'rgba(0,0,0,0)');glow.addColorStop(1,night?'rgba(0,4,18,.24)':'rgba(14,10,4,.18)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
  };
  // Subtle moving glints add depth to tree crowns on small screens.
  const originalDrawTrees=window.drawTrees;
  if(typeof originalDrawTrees==='function')window.drawTrees=function(){
    originalDrawTrees.apply(this,arguments);
    for(let i=0;i<trees.length;i++){const t=trees[i];if(t.kind!=='oak'&&t.kind!=='birch'&&t.kind!=='pine')continue;const tx=sx(t.x),ty=sy(t.y);if(tx<-t.r||tx>W+t.r||ty<-t.r*2||ty>H+t.r)continue;
      const phase=frame*.018+t.off+i,hx=tx+Math.sin(phase)*t.r*.22,hy=ty-t.r*.32+Math.cos(phase*.7)*t.r*.08;ctx.save();ctx.globalAlpha=.18+Math.sin(phase)*.05;
      ctx.fillStyle=LEVEL_ENV[Math.min(level,5)].ground==='night'?'#c0d6ff':'#e7f4a8';ctx.beginPath();ctx.ellipse(hx,hy,Math.max(1,t.r*.14),Math.max(1,t.r*.07),-.35,0,Math.PI*2);ctx.fill();ctx.restore();
    }
  };
  decorateOutcome();
})();
