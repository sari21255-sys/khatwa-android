/* السمات الست (SIJIL): الأسود افتراضي لتثبيت جديد، معاينات الست في المظهر، تطبيق فوري وحفظ محلي،
   بقاء الصفحة والتمرير والمدخلات عند التبديل، وتحويل المفتاح القديم «light» إلى الأبيض.
   تشغيل: NODE_PATH=$(npm root -g) node tests/theme.e2e.js [index.html]. بيانات اصطناعية. */
const {chromium}=require('playwright'),path=require('path');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let fail=0,pass=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok   '+m)}else{fail++;console.log('  FAIL '+m+(x?'  ['+x+']':''))}};
const T=['black','white','blue','emerald','olive','purple'];
const seed=()=>{S.prof.ob=1;S.prof.name='مختبر';S.prof.dpw=3;S.bw['2026-11-10']=80;S.prof.age=31;save();render()};
const info=p=>p.evaluate(()=>({t:document.documentElement.getAttribute('data-sj'),d:document.documentElement.getAttribute('data-theme'),s:localStorage.getItem('fit_theme'),bg:getComputedStyle(document.body).backgroundColor,m:document.querySelector('meta[name=theme-color]').content}));
(async()=>{const b=await chromium.launch();
 /* 1) تثبيت جديد: أسود */
 {const ctx=await b.newContext({viewport:{width:390,height:844},colorScheme:'light'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+file);await p.waitForTimeout(400);await p.evaluate(seed);
  const i=await info(p);ok(i.t==='black'&&i.d==='dark'&&i.bg==='rgb(16, 16, 16)','تثبيت جديد: الأسود افتراضي حتى مع نظام فاتح',JSON.stringify(i));
  /* 2) المظهر في الإعدادات: ست معاينات */
  await p.evaluate(()=>{S.tab='ex';S.sub='set';UI.sgo={ap:true};render()});await p.waitForTimeout(200);
  const n=await p.$$eval('#sj-theme [data-a=thset]',a=>a.map(x=>x.dataset.v));ok(JSON.stringify(n)===JSON.stringify(T),'ست معاينات في المظهر بالترتيب',n.join(','));
  /* 3) التبديل الفوري، الحفظ، وبقاء الصفحة والتمرير */
  await p.evaluate(()=>{window.scrollTo(0,200)});
  for(const t of T){
   await p.click('#sj-theme [data-v='+t+']');await p.waitForTimeout(120);
   const r=await info(p);const st=await p.evaluate(()=>({tab:S.tab,sub:S.sub,y:Math.round(scrollY)}));
   ok(r.t===t&&r.s===t&&r.d===(t==='white'?'light':'dark'),'تطبيق فوري وحفظ: '+t,JSON.stringify(r));
   ok(st.tab==='ex'&&st.sub==='set','بقاء الصفحة عند التبديل إلى '+t);
   await p.screenshot({path:'/tmp/th-'+t+'.png'});
  }
  ok(errs.length===0,'لا أخطاء سكربت أثناء التبديل',errs.join('|'));
  /* 4) إعادة الفتح: يبقى الاختيار */
  await p.click('#sj-theme [data-v=olive]');await p.waitForTimeout(100);
  await p.reload();await p.waitForTimeout(400);const re=await info(p);ok(re.t==='olive'&&re.s==='olive','بعد إعادة الفتح تبقى السمة المحفوظة',JSON.stringify(re));
  await ctx.close()}
 /* 5) مفتاح قديم */
 for(const [old,exp] of [['light','white'],['dark','black'],['auto','black'],['bogus','black']]){
  const ctx=await b.newContext({viewport:{width:390,height:844},colorScheme:'dark'});
  await ctx.addInitScript(o=>{try{if(!sessionStorage.__seeded){localStorage.setItem('fit_theme',o);sessionStorage.__seeded=1}}catch(e){}},old);
  const p=await ctx.newPage();await p.goto('file://'+file);await p.waitForTimeout(400);await p.evaluate(seed);
  const i=await info(p);ok(i.t===exp&&i.s===exp,'مفتاح قديم «'+old+'» يتحوّل إلى '+exp,JSON.stringify(i));await ctx.close()}
 /* 6) الأبيض: ترويسة سوداء بحافة مائلة، وفي بقية السمات الترويسة موجودة */
 {const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{localStorage.setItem('fit_theme','white')});const p=await ctx.newPage();
  await p.goto('file://'+file);await p.waitForTimeout(400);await p.evaluate(seed);
  const h=await p.evaluate(()=>{const e=document.querySelector('.sjhd');if(!e)return null;const c=getComputedStyle(e);return{bg:c.backgroundColor,clip:c.clipPath}});
  ok(h&&h.bg==='rgb(16, 16, 16)'&&/polygon/.test(h.clip),'الأبيض: ترويسة سوداء بقص مائل',JSON.stringify(h));await ctx.close()}
 await b.close();console.log(pass+' ناجح، '+fail+' فاشل');process.exit(fail?1:0)})();
