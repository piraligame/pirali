'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}
 const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
});
function box(r){if(!r)return null;return {top:Math.round(r.top),bottom:Math.round(r.bottom),left:Math.round(r.left),right:Math.round(r.right),height:Math.round(r.height)};}
async function test(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
 try{
  for(const variant of ['play','dev']){
   for(const viewport of [{width:360,height:760},{width:412,height:915},{width:760,height:360}]){
    const context=await browser.newContext({viewport,deviceScaleFactor:2,isMobile:true,hasTouch:true});
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route(/firebaseio\.com/,route=>route.abort());
    const res=await page.goto(url+'/beta1272-'+variant+'/index.html',{waitUntil:'load',timeout:40000});assert.equal(res.status(),200);
    const baseline=await page.evaluate(()=>({version:window.PiraliGameVersion,legend:document.querySelector('.pirali-mini-legend'),minimap:!!window.PiraliMiniMap}));
    assert.equal(baseline.version,'1.27.2-classic.'+variant);assert.equal(baseline.legend,null);assert.equal(baseline.minimap,true);
    await page.evaluate(()=>startGame());
    await page.locator('#pirali-name-input').fill('Dato');await page.locator('.pirali-name-confirm').click();
    const geometry=await page.evaluate(()=>{
      window.PiraliStageStars.onStageComplete(1);
      showBanner('ტური 2 — გოგოლესუბანი');
      const star=document.querySelector('#pirali-stage-stars'),banner=document.querySelector('#lvlbanner'),mini=document.querySelector('#pirali-mini-map');
      window.PiraliMiniMap.render();
      const geom=e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height};};
      return {stars:geom(star),banner:geom(banner),map:geom(mini),miniChildren:mini.children.length,legend:!!mini.querySelector('.pirali-mini-legend'),mapToggle:!!mini.querySelector('#pirali-mini-map-toggle'),stageText:banner.textContent};
    });
    assert.equal(geometry.miniChildren,2);assert.equal(geometry.legend,false);assert.equal(geometry.mapToggle,true);
    const gap=geometry.banner.top-geometry.stars.bottom;
    console.log(variant+' '+viewport.width+'x'+viewport.height+': results top='+Math.round(geometry.stars.top)+' bottom='+Math.round(geometry.stars.bottom)+' title top='+Math.round(geometry.banner.top)+' vertical gap='+Math.round(gap)+' minimap height='+Math.round(geometry.map.height));
    if(viewport.height>550)assert.ok(gap>=5,'Stage stars overlap next-stage banner ('+gap+')');
    else assert.ok(geometry.stars.bottom<=viewport.height,'Landscape stage stars offscreen');
    assert.deepEqual(errors,[],'JS errors '+variant);
    await context.close();
   }
  }
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
test().catch(e=>{console.error(e);server.close();process.exitCode=1});
