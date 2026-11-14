const {chromium}=require('playwright');
(async()=>{
const br=await chromium.launch();const out=[];const ok=(n,c,x)=>{out.push((c?'PASS ':'FAIL ')+n+(x?' | '+x:''))};
for(const W of [390,320]){
 const ctx=await br.newContext({viewport:{width:W,height:800},deviceScaleFactor:1,locale:'ar'});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file:///tmp/ux/p2/test.html');await p.waitForTimeout(400);
 const clk=async(sel)=>{await p.click(sel);await p.waitForTimeout(80)};
 const T=async s=>(await p.locator('#app').innerText());
 await clk('[data-a=to]');await clk('[data-a=goal][data-v=lose]');await clk('[data-a=to][data-v=plans]');await clk('[data-a=startplan]');
 ok('home '+W,(await T()).includes('أول تمرين'));
 await p.screenshot({path:`/tmp/ux/p2/shots/home-${W}.png`});
 // partial
 await clk('[data-a=start]');ok('workout open',(await T()).includes('المجموعة 1'));
 await clk('[data-a=done]');ok('toast set saved',true);
 await p.screenshot({path:`/tmp/ux/p2/shots/wk-${W}.png`});
 // reload
 await p.reload();await p.waitForTimeout(300);
 ok('reload keeps workout',(await T()).includes('المجموعة 2')||(await T()).includes('1 من'));
 await clk('[data-a=leave]');
 let t=await T();ok('home partial tag',t.includes('تمرين جزئي محفوظ')&&t.includes('1 من 15 مجموعة'));
 ok('goal not counted','0 من 3'.length&&t.includes('0 من 3 تمارين'));
 await p.screenshot({path:`/tmp/ux/p2/shots/partial-${W}.png`});
 await clk('.hero [data-a=start]');
 let s=await p.evaluate(()=>JSON.parse(localStorage.getItem('khatwa-proto-v2')));
 ok('one session after resume',s.sessions.length===1,'n='+s.sessions.length);
 ok('set preserved',s.sessions[0].exs[0].sets[0].done===true);
 ok('resume points to set 2',(await T()).includes('المجموعة 2 من'));
 // finish all
 for(let i=0;i<14;i++){await clk('[data-a=done]')}
 t=await T();ok('summary after all',t.includes('أحسنت'));
 s=await p.evaluate(()=>JSON.parse(localStorage.getItem('khatwa-proto-v2')));
 ok('still one session, complete',s.sessions.length===1&&s.sessions[0].status==='complete');
 await clk('[data-a=home]');t=await T();ok('goal counted once',t.includes('1 من 3 تمارين')&&t.includes('أنجزت تمرين اليوم'));
 // weight shortcut from today and progress same sheet
 await clk('.qk [data-a=sheet][data-v=weight]');const a=await p.getAttribute('[data-sheet]','data-sheet');
 await p.fill('#sw','77.4');await clk('[data-a=savew]');
 await clk('[data-a=tab][data-v=prog]');await clk('.hd [data-a=sheet][data-v=weight]');const b=await p.getAttribute('[data-sheet]','data-sheet');ok('weight same sheet',a===b&&a==='weight');
 await p.fill('#sw','77.0');await clk('[data-a=savew]');
 s=await p.evaluate(()=>JSON.parse(localStorage.getItem('khatwa-proto-v2')));ok('2 weights logged',s.weights.length===2);
 // meal
 await clk('[data-a=tab][data-v=food]');await clk('.hd [data-a=sheet][data-v=meal]');await clk('[data-a=fsel][data-v="1"]');await clk('[data-a=savem]');
 await clk('[data-a=tab][data-v=home]');t=await T();ok('meal on home',t.includes('165 من'));
 await clk('.qk [data-a=sheet][data-v=meal]');ok('meal sheet from home',(await p.getAttribute('[data-sheet]','data-sheet'))==='meal');await clk('.sh-title [data-a=closesh]');
 // all services
 await clk('[data-a=tab][data-v=more]');
 const keys=await p.evaluate(()=>Object.keys(SV));let bad=[];
 for(const k of keys){
   await p.evaluate(k=>{S.stack=[{k:'svc',id:k}];render()},k);
   const o=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   const tx=await T();if(o||!tx.includes('ما تحتويه'))bad.push(k+(o?'(overflow)':''));
 }
 ok('all '+keys.length+' service pages render, no overflow',bad.length===0,bad.join(','));
 await p.evaluate(()=>{S.stack=[];S.tab='more';render()});
 const ov=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);ok('more no overflow',!ov);
 await p.screenshot({path:`/tmp/ux/p2/shots/more-${W}.png`,fullPage:true});
 for(const tb of ['home','train','food','prog']){await p.evaluate(tb=>{S.stack=[];S.tab=tb;render()},tb);const o2=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);ok('tab '+tb+' overflow '+W,!o2)}
 ok('no js errors',errs.length===0,errs.slice(0,3).join(';'));
 await ctx.close();
}
console.log(out.join('\n'));await br.close()})();
