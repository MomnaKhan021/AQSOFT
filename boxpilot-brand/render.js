const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const [f,w,h,o] of [['logo',1024,1024,'boxpilot-logo'],['banner',851,315,'boxpilot-banner'],['logo-transparent',1100,300,'boxpilot-logo-transparent']]){const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});
await p.goto('file://'+__dirname+'/'+f+'.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);await p.screenshot({path:__dirname+'/'+o+'.png',omitBackground:true});}
await b.close();})();
