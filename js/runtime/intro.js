// PIRALI intro: local cinematic video, replacing the old animated sequence.
// Original animation backed up outside the Git repository.
function showIntro(onDone) {
  if(document.getElementById('pirali-video-intro')) return;
  const callback = typeof onDone === 'function' ? onDone : startGame;
  let finished = false;

  const overlay = document.createElement('div');
  overlay.id = 'pirali-video-intro';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden';
  const video = document.createElement('video');
  video.id = 'pirali-intro-video';
  video.src = 'assets/video/intro-local.mp4';
  video.preload = 'auto';
  video.playsInline = true;
  video.setAttribute('playsinline','');
  video.setAttribute('webkit-playsinline','');
  video.controls = false;
  video.muted = false;
  video.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000';

  const skip = document.createElement('button');
  skip.type = 'button';
  skip.textContent = 'გამოტოვება ›';
  skip.setAttribute('aria-label','გამოტოვე შესავალი');
  skip.style.cssText = 'position:absolute;top:20px;right:18px;z-index:2;min-height:44px;padding:10px 18px;border:1px solid #e0a820;border-radius:9px;background:rgba(0,0,0,.8);color:#f5d855;font:bold 14px sans-serif;cursor:pointer';

  const status = document.createElement('div');
  status.textContent = 'ვიდეო იტვირთება…';
  status.style.cssText = 'position:absolute;bottom:24px;left:50%;transform:translateX(-50%);z-index:2;padding:8px 14px;border-radius:8px;background:rgba(0,0,0,.75);color:#f5d855;font:13px sans-serif;text-align:center;pointer-events:none';

  const replay = document.createElement('button');
  replay.type = 'button';
  replay.textContent = '▶ ვიდეოს გაშვება';
  replay.style.cssText = 'display:none;position:absolute;z-index:3;top:50%;left:50%;transform:translate(-50%,-50%);padding:15px 20px;border:1px solid #e0a820;border-radius:9px;background:#111;color:#f5d855;font:bold 17px sans-serif;cursor:pointer';

  function onEscape(e){ if(e.key === 'Escape') finish(); }
  function finish(){
    if(finished)return;
    finished = true;
    video.pause();
    document.removeEventListener('keydown',onEscape);
    overlay.remove();
    callback();
  }
  async function play(){
    if(finished)return;
    replay.style.display = 'none';
    try{ await video.play(); }
    catch(e){ if(!finished){ status.style.display='block';status.textContent='დააჭირე ▶ ვიდეოს საყურებლად';replay.style.display='block'; } }
  }
  video.addEventListener('playing',function(){status.style.display='none';});
  video.addEventListener('ended',finish,{once:true});
  video.addEventListener('error',function(){status.style.display='block';status.textContent='ვიდეო ვერ ჩაიტვირთა — გამოიყენე გამოტოვება';replay.style.display='none';});
  skip.addEventListener('click',finish);
  replay.addEventListener('click',play);
  document.addEventListener('keydown',onEscape);
  overlay.append(video,skip,status,replay);
  document.body.appendChild(overlay);
  play();
}
