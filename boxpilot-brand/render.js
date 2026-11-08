const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const [f,w,h] of [['logo',1024,1024],['banner',851,315],['logo-transparent',1100,300],['profile',800,800]]){const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});
await p.goto('file://'+__dirname+'/'+f+'.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);await p.screenshot({path:__dirname+'/boxpilot-'+f+'.png',omitBackground:true});await p.close();}
await b.close();})();
