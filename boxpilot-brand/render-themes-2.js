const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const t of ['black-yellow','green-lime','blue-cyan','burgundy-gold'])for(const [f,w,h] of [['logo',1024,1024],['banner',851,315],['logo-transparent',1100,300]]){const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});
await p.goto('file://'+__dirname+'/'+f+'-'+t+'.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);await p.screenshot({path:__dirname+'/themes/'+t+'/boxpilot-'+f+'.png',omitBackground:true});await p.close();}
// comparison sheet
const p=await b.newPage({viewport:{width:900,height:1500},deviceScaleFactor:2});
const rows=[['black-yellow','D · Black & Yellow'],['green-lime','E · Forest Green & Lime'],['blue-cyan','F · Royal Blue & Cyan'],['burgundy-gold','G · Burgundy & Gold']].map(([t,l])=>`<h3>${l}</h3><img src="themes/${t}/boxpilot-banner.png" width="851"><div class=lg><img src="themes/${t}/boxpilot-logo-transparent.png" width="420"></div>`).join('');
require('fs').writeFileSync(__dirname+'/compare.html',`<html><head><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=block" rel="stylesheet"></head><body style="margin:0;padding:12px 24px;background:#eee;font-family:Poppins"><style>h3{margin:14px 0 6px;font-size:16px}.lg{background:#fff;width:851px;margin-top:6px;border-radius:6px}</style>${rows}</body></html>`);
await p.goto('file://'+__dirname+'/compare.html');await p.waitForTimeout(800);await p.screenshot({path:__dirname+'/themes/compare-themes-2.png',fullPage:true});
await b.close();})();
