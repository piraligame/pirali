# PIRALI BETA 1.14: reproducible visual-polish patch; does not mutate Android 1.13 builds.
import pathlib, shutil, json, re
ROOT=pathlib.Path(__file__).resolve().parents[1]
def edit(path, find, replacement, *, count=1):
    p=ROOT/path
    s=p.read_text(encoding="utf-8")
    hits=s.count(find)
    if hits!=count: raise RuntimeError(f"Expected {count} occurrence(s) in {path} for {find[:70]!r}; got {hits}")
    p.write_text(s.replace(find,replacement),encoding="utf-8")

for role in ("play","dev"):
    source=ROOT/f"beta113-{role}"
    destination=ROOT/f"beta114-{role}"
    if destination.exists():raise RuntimeError(f"Preserve existing {destination}")
    shutil.copytree(source,destination)
    d=f"beta114-{role}"
    idx=f"{d}/index.html"
    edit(idx, f"ფირალი BETA 1.13{' DEV' if role=='dev' else ''} —",f"ფირალი BETA 1.14{' DEV' if role=='dev' else ''} —")
    old="1.13.0-beta.1-dev" if role=="dev" else "1.13.0-beta.1"
    new="1.14.0-beta.1-dev" if role=="dev" else "1.14.0-beta.1"
    edit(idx,f"window.PiraliGameVersion='{old}';",f"window.PiraliGameVersion='{new}';")
    edit(idx,"js/features/scoring/kill-combos.js?v=beta105-waves","js/features/scoring/kill-combos.js?v=beta114-combo-visual")
    edit(idx,"js/runtime/update.js?v=beta111-stage7-reinforcements","js/runtime/update.js?v=beta114-pickups-stage-card")
    edit(idx,"js/runtime/combat.js?v=beta112-keyboard-route","js/runtime/combat.js?v=beta114-kill-feedback")
    edit(idx,"js/runtime/game-init.js?v=beta107-landlord","js/runtime/game-init.js?v=beta114-stage-init")
    edit(idx,"js/runtime/ui.js?v=beta106-progress","js/runtime/ui.js?v=beta114-input-banner")
    edit(idx,"js/runtime/outcome.js?v=beta106-outcome","js/runtime/outcome.js?v=beta114-result-label")
    edit(idx,"js/features/map/story-map.js?v=beta112-stage-map","js/features/map/story-map.js?v=beta114-milestones")
    edit(idx,"js/features/map/live-minimap.js?v=beta110-red-enemies","js/features/map/live-minimap.js?v=beta114-legend")
    edit(idx,"css/story-map.css?v=beta112-stage-map","css/story-map.css?v=beta114-milestones")
    edit(idx,"css/live-minimap.css?v=beta1092","css/live-minimap.css?v=beta114-legend") if "css/live-minimap.css?v=beta1092" in (ROOT/idx).read_text(encoding="utf-8") else None
    # Append only after the game modules, preserving original dependency order.
    edit(idx,"</head>",'<link rel="stylesheet" href="css/beta114-polish.css?v=1.14.0">\n</head>')
    edit(idx,"</body>",'<script src="js/features/polish/feedback.js?v=1.14.0"></script>\n</body>')

    combat=f"{d}/js/runtime/combat.js"
    edit(combat,"  e.alive=false;\n  window.PiraliStats?.kill();",
         "  e.alive=false;\n  window.PiraliPolish?.onKill(level);\n  window.PiraliStats?.kill();")
    edit(combat,"if(b.hp<=0){b.alive=false;window.PiraliStats?.kill();",
         "if(b.hp<=0){b.alive=false;window.PiraliPolish?.onKill(level);window.PiraliStats?.kill();")

    combo=f"{d}/js/features/scoring/kill-combos.js"
    edit(combo,"let previousStage=null;","let previousStage=null;\nlet chain=0;")
    edit(combo,"function reset(){lastKill=null;previousStage=level;}","function reset(){lastKill=null;previousStage=level;chain=0;}")
    edit(combo,"const paired=lastKill!==null&&now-lastKill>=0&&now-lastKill<=windowMs;\n lastKill=now;",
         "const paired=lastKill!==null&&now-lastKill>=0&&now-lastKill<=windowMs;\n chain=paired?Math.min(99,chain+1):1;\n lastKill=now;\n if(paired)window.PiraliPolish?.onCombo(chain);")
    edit(combo,"(paired?'⚡ '+comboLabel()+' ×2 ':'')+'+'+gained,",
         "(paired?'⚡ '+comboLabel()+' '+chain+' (×2) ':'')+'+'+gained,")
    # Streak length display ≠ score multiplier: old capped 2x award remains intact.

    up=f"{d}/js/runtime/update.js"
    edit(up,"done=true;window.PiraliStats?.completeStage(oldLevel);",
         "done=true;window.PiraliPolish?.onStageComplete(oldLevel,score);window.PiraliStats?.completeStage(oldLevel);")
    edit(up,"genWorld();window.PiraliStats?.stageReady(level);",
         "genWorld();window.PiraliStats?.stageReady(level);window.PiraliPolish?.onStageBegin(level);")
    edit(up,"ammo=Math.min(maxAmmo,ammo+pack);updateAmmoUI();",
         "ammo=Math.min(maxAmmo,ammo+pack);updateAmmoUI();\n         window.PiraliPolish?.onPickup('ammo',gained);")
    edit(up,"else if(pk.type==='health'){health=Math.min(maxHealth,health+1);updateHealthUI();}",
         "else if(pk.type==='health'){const beforeHealth=health;health=Math.min(maxHealth,health+1);updateHealthUI();window.PiraliPolish?.onPickup('health',health-beforeHealth);}")
    edit(up,"else if(pk.type==='herb'){health=Math.min(maxHealth,health+2);updateHealthUI();inventory.herbs++;updateInventoryUI();}",
         "else if(pk.type==='herb'){const beforeHealth=health;health=Math.min(maxHealth,health+2);updateHealthUI();window.PiraliPolish?.onPickup('health',health-beforeHealth);inventory.herbs++;updateInventoryUI();}")

    init=f"{d}/js/runtime/game-init.js"
    edit(init,"  showBanner(LEVEL_NAMES[level]);\n}","  showBanner(LEVEL_NAMES[level]);\n  window.PiraliPolish?.onStageBegin(level);\n}")

    ui=f"{d}/js/runtime/ui.js"
    edit(ui,"document.addEventListener('keydown',e=>{if(e.key==='Escape'||e.key==='p'||e.key==='P'){if(running||paused)togglePause();}});",
         """document.addEventListener('keydown',e=>{
  if(e.repeat||e.altKey||e.ctrlKey||e.metaKey)return;
  if(e.target?.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName||''))return;
  if(e.key==='Escape'||e.key==='p'||e.key==='P'){
    // Overlay interaction (map, personal stats, exit dialog) must never toggle game pause.
    if(document.getElementById('pirali-story-map')||
       window.PiraliStats?.visible?.()||
       document.getElementById('pirali-exit-dialog')?.hidden===false)return;
    if(running||paused){e.preventDefault();togglePause();}
  }
});""")
    edit(ui,"function showBanner(text){const b=document.getElementById('lvlbanner');",
         "let bannerSequence=0;\nfunction showBanner(text){const seq=++bannerSequence;const b=document.getElementById('lvlbanner');")
    edit(ui,"setTimeout(()=>{b.style.transition='opacity 1.1s';b.style.opacity='0';},3000);}",
         "setTimeout(()=>{if(seq!==bannerSequence)return;b.style.transition='opacity 1.1s';b.style.opacity='0';},3000);}")
    outcome=f"{d}/js/runtime/outcome.js"
    edit(outcome,"BETA 1.07","BETA 1.14")

    story=f"{d}/js/features/map/story-map.js"
    edit(story,"  const name=element.querySelector('.story-map-name');\n  name.textContent=label(n);",
         """  const name=element.querySelector('.story-map-name');
  name.textContent=label(n);
  const medal=element.querySelector('.story-map-medal');
  // Historic markers use permanent player progress, never an unreached preview.
  // The last-stage crown requires a recorded full victory.
  const won=Number(window.PiraliStats?.get?.()?.wins||0)>0;
  medal.textContent=n===11?(won?'👑':''):n<current?(n===7?'❤️':n===10?'🔥':'★'):'';
  medal.hidden=!medal.textContent;""")
    edit(story,"const name=document.createElement('span');name.className='story-map-name';e.appendChild(name);",
         """const name=document.createElement('span');name.className='story-map-name';e.appendChild(name);
  const medal=document.createElement('span');medal.className='story-map-medal';medal.setAttribute('aria-hidden','true');medal.hidden=true;e.appendChild(medal);""")
    css=f"{d}/css/story-map.css"
    with (ROOT/css).open("a",encoding="utf-8") as f:
        f.write("""
/* BETA 1.14: badges are earned from local permanent progress. */
.story-map-stage{overflow:visible}
.story-map-medal[hidden]{display:none!important}
.story-map-medal{position:absolute;right:-7px;top:-13px;min-width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;background:#523716;color:#ffdf74;border:1px solid #f7cf7a;border-radius:50%;box-shadow:0 2px 6px #0007;pointer-events:none}
""")

    minimap=f"{d}/js/features/map/live-minimap.js"
    edit(minimap,"root.append(control,canvas);document.body.appendChild(root);",
         """const legend=document.createElement('div');legend.className='pirali-mini-legend';legend.setAttribute('aria-hidden','true');
root.append(control,canvas,legend);document.body.appendChild(root);""")
    edit(minimap,"function updateLabel(){const s=txt();control.textContent='🧭 '+s.map+' · '+(collapsed?s.show:s.hide);control.setAttribute('aria-expanded',String(!collapsed));canvas.setAttribute('aria-label',s.map+' — '+s.simona+' / '+s.goal);}",
         """function updateLabel(){const s=txt();control.textContent='🧭 '+s.map+' · '+(collapsed?s.show:s.hide);control.setAttribute('aria-expanded',String(!collapsed));canvas.setAttribute('aria-label',s.map+' — '+s.simona+' / '+s.goal+' / '+s.enemy);
legend.textContent='';for(const [label,cls] of [[s.simona,'self'],[s.enemy,'enemy'],[s.goal,'goal']]){
 const item=document.createElement('span');item.className='mini-legend-item';const dot=document.createElement('i');dot.className='mini-dot mini-'+cls;item.append(dot,document.createTextNode(label));legend.appendChild(item);
}}""")
    edit(minimap,"drawMarker(p.x,p.y,'#ff2a2a',4.2,'#5a0000')",
         "drawMarker(p.x,p.y,'#ff4242',5,'#3c0303')")
    edit(minimap,"if(p.x>=0&&p.x<=w&&p.y>=0&&p.y<=h)drawMarker(p.x,p.y,'#fa9d26',4);",
         "if(p.x>=0&&p.x<=w&&p.y>=0&&p.y<=h)drawMarker(p.x,p.y,'#ffaa20',6,'#fff3d3');")
    edit(minimap,"drawMarker(tx,ty,'#61dcef',6,'#fff');",
         "drawMarker(tx,ty,'#44e7ff',7,'#fff');")
    mincss=f"{d}/css/live-minimap.css"
    with (ROOT/mincss).open("a",encoding="utf-8") as f:
        f.write("""
/* Beta 1.14: readable three-item legend; shrinks for narrow Fold/phone layouts. */
.pirali-mini-legend{display:flex;align-items:center;justify-content:center;gap:5px;flex-wrap:wrap;margin-top:4px;color:#fff0c8;font:700 9px/1.35 'Noto Sans Georgian',system-ui,sans-serif}
.mini-legend-item{display:inline-flex;align-items:center;gap:2px}
.mini-dot{display:inline-block;width:7px;height:7px;border:1px solid #fff5;box-sizing:border-box;border-radius:50%}
.mini-self{background:#fff7af}.mini-enemy{background:#ff4242}.mini-goal{background:#44e7ff}
#pirali-mini-map.collapsed .pirali-mini-legend{display:none}
@media(max-width:530px){.pirali-mini-legend{max-width:110px;font-size:8px;gap:3px}.mini-dot{width:6px;height:6px}}
""")

    info=f"{d}/RELEASE_INFO.json"
    doc=json.loads((ROOT/info).read_text(encoding="utf-8"))
    doc["version"]=new
    doc["displayVersion"]="BETA 1.14 DEVELOPER" if role=="dev" else "BETA 1.14 PLAYER"
    doc["revision"]="beta114-polish-seven-improvements"
    doc["androidBuilt"]=False;doc["aabBuilt"]=False;doc["releaseReady"]=False
    doc["androidArtifactsPrepared"]=False
    doc.pop("apkDownloadUrl",None);doc.pop("aabDownloadUrl",None)
    doc["polish"]={"healthAmmoFeedback":True,"comboStreakVisual":True,
       "minimapColoredLegend":True,"physicalActionFeedback":True,
       "nonBlockingStageSummary":True,"lifetimeMapMedals":True,
       "stabilityAndQA":True,"gameplayBalancePreserved":True}
    doc["qaEvidence"]=(doc.get("qaEvidence") or [])+["qa/pirali-beta114-polish.cjs"]
    (ROOT/info).write_text(json.dumps(doc,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    readme=ROOT/d/"README.md"
    readme.write_text("# PIRALI BETA 1.14 — Polish Update\n\n"+(
        "- Seven improvements: loot feedback, combo streak UI, localized minimap legend, touch/PC button flashes, non-blocking stage completion summary, lifetime map achievements, and stability fixes/QA.\n"
        "- Combos preserve ×2 score rules; ×3 indicates consecutive kills only, not points multiplier.\n"
        "- Completed stage toast never pauses / slows the transition to the next level.\n"
        "- No APK/AAB in this web-only beta; signed Beta 1.13 remains the Google Play upload candidate.\n"
        "- URL: https://piraligame.github.io/pirali/beta114-"+role+"/\n\n")+readme.read_text(encoding="utf-8"),encoding="utf-8")

print("STAGED_BETA114_PLAY_DEV")
