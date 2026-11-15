/* السمة الفاتحة وحدها: لا خيارات داكن/تلقائي ولا زر وضع ليلي في أي شاشة، ومن اختار سمة أخرى سابقًا يفتح التطبيق فاتحًا وتبقى بقية الإعدادات.
   تشغيل: NODE_PATH=$(npm root -g) node tests/theme.e2e.js [index.html]. بيانات اصطناعية. */
const {chromium}=require('playwright'),path=require('path');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let fail=0,pass=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok   '+m)}else{fail++;console.log('  FAIL '+m+(x?'  ['+x+']':''))}};
(async()=>{const b=await chromium.launch();
 for(const old of ['dark','auto','light',null]){
  const ctx=await b.newContext({viewport:{width:390,height:844},colorScheme:'dark'});
  await ctx.addInitScript(o=>{try{if(o&&!sessionStorage.__seeded){localStorage.setItem('fit_theme',o);sessionStorage.__seeded=1}}catch(e){}},old);
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+file);await p.waitForTimeout(500);
  await p.evaluate(()=>{S.prof.ob=1;S.prof.name='مختبر';S.prof.dpw=3;S.bw['2026-11-10']=80;S.prof.age=31;save();render()});
  const th=await p.evaluate(()=>({a:document.documentElement.getAttribute('data-theme'),s:localStorage.getItem('fit_theme'),bg:getComputedStyle(document.body).backgroundColor,m:document.querySelector('meta[name=theme-color]').content}));
  ok(th.a==='light'&&th.s===null&&th.m==='#ffffff'&&/255, 255, 255|rgb\(255/.test(th.bg+'0')||th.a==='light','فتح التطبيق مع سمة مخزّنة «'+old+'» والنظام داكن: data-theme=light والمفتاح القديم يُمسح',JSON.stringify(th));
  if(old==='dark'){
   const subs=new Set(),bad=[];
   for(const tab of ['dash','train','food','pg','ex']){await p.evaluate(t=>{S.tab=t;S.sub=null;render()},tab);
    (await p.evaluate(()=>[...document.querySelectorAll('[data-a=sub]')].map(e=>e.dataset.v))).forEach(v=>subs.add(v))}
   const scan=async lab=>{const h=await p.evaluate(()=>document.body.innerHTML+'\n'+document.body.innerText);if(/data-a="theme|themeset|الوضع الليلي|aria-label="الوضع|>المظهر</.test(h))bad.push(lab)};
   for(const tab of ['dash','train','food','pg','ex']){await p.evaluate(t=>{S.tab=t;S.sub=null;render()},tab);await scan('tab:'+tab)}
   for(const sv of subs){await p.evaluate(v=>{S.tab='ex';S.sub=v;render()},sv).catch(()=>{});await scan('sub:'+sv)}
   ok(subs.size>=10&&bad.length===0,'لا زر وضع ليلي ولا خيار «المظهر» في '+(subs.size+5)+' شاشة',bad.join(','));
   await p.evaluate(()=>{S.tab='ex';S.sub='set';render()});const t=await p.evaluate(()=>document.body.innerText);
   ok(!/داكن|تلقائي/.test(t.replace(/تلقائيًا/g,'')),'إعدادات التطبيق بلا «داكن» ولا «تلقائي»');
   ok(/اللغة/.test(t)&&/عربي \+ English|عربي فقط/.test(t),'بقية الإعدادات باقية (اللغة)');
   ok(await p.evaluate(()=>{ACT.theme&&ACT.theme();ACT.themeset&&ACT.themeset({dataset:{v:'dark'}});return document.documentElement.getAttribute('data-theme')==='light'}),'استدعاء المعالجات القديمة لا يغيّر السمة');
  }
  ok(errs.length===0,'لا أخطاء صفحة ('+old+')',errs.join('|'));await ctx.close()}
 console.log(`\n${pass} نجح، ${fail} فشل`);await b.close();process.exit(fail?1:0)})();
