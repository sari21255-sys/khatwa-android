const {chromium}=require('playwright');
(async()=>{const br=await chromium.launch();const out=[];const ok=(n,c,x)=>out.push((c?'PASS ':'FAIL ')+n+(x?' | '+x:''));
for(const W of [390,320]){
 const ctx=await br.newContext({viewport:{width:W,height:800},locale:'ar'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///tmp/ux/p2/test.html');await p.waitForTimeout(300);
 const clk=async s=>{await p.click(s);await p.waitForTimeout(80)};const T=()=>p.locator('#app').innerText();
 await p.evaluate(()=>{S.screen='home';S.goal='lose';S.planId='fb3';S.hint=false;render()});
 // access from home
 const tests=[['archive','الأرشيف'],['reports','تقاريري'],['culture','الثقافة']];
 for(const [k,n] of tests){
  await clk(`#shortcuts [data-v=${k}]`);
  const t=await T();ok(`${W} home→${k} opens`,t.includes(n));
  await clk('.hd [data-a=back]');
  ok(`${W} back to home from ${k}`,(await T()).includes('اختصاراتي'));
 }
 // from home through المزيد to culture and back returns to more
 await clk('.nav [data-v=more]');await clk('[data-a=svc][data-v=culture]');await clk('.hd [data-a=back]');
 ok(W+' back returns to المزيد',(await T()).includes('كل خدمة في مكان واحد'));
 // reports empty then with data
 await p.evaluate(()=>{S.stack=[{k:'svc',id:'reports'}];render()});
 ok(W+' reports empty state',(await T()).includes('لا بيانات كافية'));
 await p.evaluate(()=>{seed();render()});
 let t=await T();ok(W+' reports labelled تجريبي + weights text',t.includes('تجريبي')&&t.includes('التمارين 35٪')&&t.includes('النوم'));
 const sc=[];for(const n of ['4','8','12']){await clk(`[data-a=rpw][data-v="${n}"]`);sc.push(await p.evaluate(()=>reportData(S.rpw).score));}
 ok(W+' window selector changes period',(await T()).includes('آخر 12 أسابيع')||(await T()).includes('آخر 12'),sc.join('/'));
 // archive export is demo
 await p.evaluate(()=>{S.stack=[{k:'svc',id:'archive'}];render()});
 await clk('[data-a=exp]');ok(W+' archive export shows demo notice',(await p.locator('#toast').innerText()).includes('عرض فقط'));
 // RPE persists
 await p.evaluate(()=>{S.stack=[];S.sessions=[];S.screen='home';S.tab='home';save();render()});
 await clk('.hero [data-a=start]');await clk('[data-a=done]');await clk('[data-a=rpe][data-v="9"]');
 const rp=await p.evaluate(()=>S.sessions[0].exs[0].sets[0].rpe);ok(W+' RPE saved on set',rp===9);
 await p.reload();await p.waitForTimeout(300);
 ok(W+' RPE survives reload',await p.evaluate(()=>S.sessions[0].exs[0].sets[0].rpe===9));
 const ov=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);ok(W+' no overflow',!ov);
 await p.evaluate(()=>{S.screen='home';S.cur=null;S.stack=[];S.tab='home';render()});
 await p.screenshot({path:`/tmp/ux/p2/shots/home3-${W}.png`,fullPage:true});
 ok(W+' no js errors',errs.length===0,errs.join(';'));
 await ctx.close()}
console.log(out.join('\n'));await br.close()})();
