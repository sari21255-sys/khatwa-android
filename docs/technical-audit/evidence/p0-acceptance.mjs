// اختبارات قبول P0: ترويسات الأمان تحت CSP فعلية، أوفلاين قاعدة الأجهزة، تنظيف الكاش، الفيض الأفقي، فشل الوسيط، الانحدار.
// الاستعمال: NODE_PATH=$(npm root -g) node p0-acceptance.mjs      (يبني نسخة اختبار من pwa/ ويطبّق _headers كما يفعل Netlify)
import fs from 'node:fs';import path from 'node:path';import cp from 'node:child_process';
const ROOT=path.resolve(new URL('../../../',import.meta.url).pathname)+'/';
const SWV=(fs.readFileSync(ROOT+'pwa/sw.js','utf8').match(/khatwa-v\d+/)||['?'])[0];   // إصدار الكاش الحالي من sw.js
const TMP='/tmp/p0site';fs.rmSync(TMP,{recursive:true,force:true});fs.cpSync(ROOT+'pwa',TMP,{recursive:true});
fs.writeFileSync(TMP+'/config.js','window.APP_CONFIG={aiUrl:"http://127.0.0.1:8788/api/ai",syncUrl:"http://127.0.0.1:8788/api/state",sbUrl:"",sbKey:"",supportEmail:"",storeUrl:""};\n');
cp.execSync(`python3 ${ROOT}tools/gen-headers.py ${TMP}`,{stdio:'pipe'});
process.env.SITE=TMP;
const {chromium,staticServer,workerServer,MODE,KV,rec,results,siteHeaders}=await import('./lib.mjs');
const A='http://127.0.0.1:8081';const st=await staticServer(8081),wk=await workerServer(8788,A);
const b=await chromium.launch();const seed=`S.prof.ob=1;S.prof.name='اختبار';S.prof.sex='m';S.prof.age=30;S.prof.ht=178;S.prof.startW=85;S.prof.goalType='lose';S.prof.lvl='b';S.prof.eq='gym';S.prof.dpw=4;S.bw[TD()]=85;calcTargets();genPlan();render()`;
const watch=p=>{const o={viol:[],err:[],con:[]};p.on('pageerror',e=>o.err.push(e.message));p.on('console',m=>{if(m.type()==='error')o.con.push(m.text().slice(0,160))});
  p.exposeFunction('__vr',s=>{o.viol.push(s)}).catch(()=>{});
  p.addInitScript(()=>{window.__v=[];document.addEventListener('securitypolicyviolation',e=>{const s=e.violatedDirective+' '+(e.blockedURI||'').slice(0,80)+' @'+location.pathname;window.__v.push(s);if(window.__vr)window.__vr(s)})});return o};
const viol=p=>p.evaluate(()=>window.__v||[]);
try{
 /* T22b: الترويسات تصل فعليًا على الصفحات والملفات */
 const need=['x-content-type-options','referrer-policy','content-security-policy','x-frame-options','permissions-policy'];
 const bad=[];for(const u of ['/','/index.html','/privacy.html','/delete-account.html','/sw.js','/eq-db.js','/manifest.webmanifest']){const r=await fetch(A+u);for(const h of need)if(!r.headers.get(h))bad.push(u+' بلا '+h)}
 rec('T22b','ترويسات الأمان تصل فعليًا على 7 مسارات (CSP، nosniff، Referrer-Policy، X-Frame-Options، Permissions-Policy)',bad.length===0,bad.length?bad.join('; '):'7 مسارات × 5 ترويسات','P2');
 const csp=(await fetch(A+'/')).headers.get('content-security-policy');
 const dir=n=>(csp.match(new RegExp('(?:^|; )'+n+' ([^;]*)'))||[])[1]||'';
 const cspOk=!/unsafe-eval/.test(csp)&&!/unsafe-inline/.test(dir('script-src'))&&dir('frame-ancestors')==="'none'"&&dir('object-src')==="'none'"&&dir('base-uri')==="'self'"&&/'sha256-/.test(dir('script-src'));
 rec('T22b-csp','CSP: لا unsafe-eval ولا unsafe-inline في script-src، frame-ancestors/object-src none، سكربتات مضمّنة بالتجزئة',cspOk,'script-src: '+dir('script-src').slice(0,90)+'… | style-src: '+dir('style-src'),'P2');
 /* حداثة التجزئات: _headers المُلتزَم به يطابق ما يولّده المولّد من الصفحات الحالية */
 const gen=fs.readFileSync(ROOT+'pwa/_headers','utf8');fs.mkdirSync('/tmp/p0chk',{recursive:true});fs.cpSync(ROOT+'pwa','/tmp/p0chk',{recursive:true});cp.execSync(`python3 ${ROOT}tools/gen-headers.py /tmp/p0chk`,{stdio:'pipe'});
 rec('T22b-fresh','ملف pwa/_headers المُلتزَم به محدّث (تجزئات السكربتات تطابق الصفحات الحالية)',gen===fs.readFileSync('/tmp/p0chk/_headers','utf8'),'إن فشل: python3 tools/gen-headers.py pwa','P2');

 /* T22c: كل الوظائف تعمل تحت CSP: صفر مخالفات وصفر أخطاء */
 const ctx=await b.newContext({viewport:{width:390,height:844},acceptDownloads:true});const p=await ctx.newPage();const w=watch(p);
 await p.goto(A+'/');await p.waitForFunction(()=>typeof S!=='undefined');await p.evaluate(seed);
 const TABS=['dash','train','food','pg','me','club','ex'],SUBS=['plan','prog','arch','tools','watch','prg','mpg','ach','cul','wgt','exl','set','coach','aip','gyms','vis','rem','rpt','link','nau','comm','nc'];
 await p.evaluate(async({TABS,SUBS})=>{for(const t of TABS){S.tab=t;S.sub=null;render();await new Promise(r=>setTimeout(r,50))}for(const s of SUBS){S.tab='ex';S.sub=s;render();await new Promise(r=>setTimeout(r,60))}},{TABS,SUBS});
 await p.evaluate(()=>localStorage.setItem('fit_ai_ok','1'));   /* موافقة المستخدم على الذكاء الاصطناعي (بوابة الموافقة أُضيفت بعد هذا الاختبار؛ tests/consent.e2e.js يغطي حالة عدم الموافقة) */
 MODE.ai='ok';const ai=await p.evaluate(async()=>{S.sub=null;S.tab='train';render();UI.ai=UI.ai||{};const a=UI.ai;a.lvl='b';a.eq='gym';a.dpw=4;a.min=60;a.focus='';a.notes='';a.res=null;await aiGenPlan();return{days:a.res&&a.res.days,msg:a.msg||UI.msg||''}});
 await p.evaluate(()=>{S.ts=Date.now();save();return syncPush()});await p.waitForTimeout(400);
 const syncOk=await p.evaluate(()=>SYNC.st);
 // التقرير: يفتح نافذة blob ويطبع من النافذة الأم دون سكربت مضمّن
 await p.evaluate(()=>{window.__printed=0;const o=window.open;window.open=function(u,t){const w=o.call(window,u,t);if(w){const pr=w.print;w.print=()=>{window.__printed++}}return w};S.sub='rpt';render();ACT.report()});
 await p.waitForFunction(()=>window.__printed>0,null,{timeout:8000}).catch(()=>{});const printed=await p.evaluate(()=>window.__printed);
 await p.goto(A+'/privacy.html');await p.goto(A+'/delete-account.html');
 const v=await viol(p);const v1=w.viol;
 rec('T22c','التطبيق يعمل تحت CSP: 29 شاشة + خطة ذكاء + مزامنة + تقرير مطبوع، صفر مخالفات CSP وصفر أخطاء JS',w.err.length===0&&w.viol.length===0&&syncOk==='ok'&&(ai.days||[]).length>=1&&printed>=1,JSON.stringify({err:w.err,csp_violations:w.viol.slice(0,5),con:w.con.filter(x=>!/Failed to load resource|fonts\.(googleapis|gstatic)/.test(x)).slice(0,3),plan_days:(ai.days||[]).length,sync:syncOk,report_print_called:printed}),'P1');
 const pv=await ctx.newPage();await pv.addInitScript(()=>{window.__v=[];document.addEventListener('securitypolicyviolation',e=>window.__v.push(e.violatedDirective))});await pv.goto(A+'/index.html');await pv.waitForFunction(()=>typeof S!=='undefined');await pv.waitForTimeout(800);
 rec('T22c-load','فتح الصفحة الرئيسية بلا أي مخالفة CSP (تشمل تسجيل الـService Worker)',(await viol(pv)).length===0,JSON.stringify(await viol(pv)),'P1');
 await ctx.close();

 /* T10c الكامل: ثبّت ← أغلق ← اقطع الاتصال ← افتح ← تصفّح قاعدة الأجهزة وابحث ← أعد الاتصال */
 const c2=await b.newContext({viewport:{width:390,height:844}});const q=await c2.newPage();const w2=watch(q);
 await q.goto(A+'/privacy.html');await q.evaluate(async()=>{const c=await caches.open('khatwa-v63');await c.put('/old.txt',new Response('old'))});   // كاش قديم من إصدار سابق
 await q.goto(A+'/');await q.waitForFunction(()=>typeof S!=='undefined');await q.evaluate(seed);
 await q.waitForFunction(async()=>{const r=await navigator.serviceWorker.getRegistration();return !!(r&&r.active)},null,{timeout:15000});await q.waitForTimeout(1500);
 const pre=await q.evaluate(async()=>({keys:await caches.keys(),eq:!!(await caches.match('eq-db.js')),idx:!!(await caches.match('index.html'))}));
 rec('T10c-1','بعد التثبيت: eq-db.js وindex.html في الكاش، والكاش القديم حُذف (المفتاح الوحيد هو إصدار sw.js الحالي)',pre.eq&&pre.idx&&pre.keys.length===1&&pre.keys[0]===SWV,JSON.stringify(pre),'P2');
 await q.close();await c2.setOffline(true);
 const q2=await c2.newPage();const w3=watch(q2);await q2.goto(A+'/');await q2.waitForFunction(()=>typeof S!=='undefined',null,{timeout:15000});await q2.evaluate(seed);
 const off=await q2.evaluate(async()=>{S.tab='ex';S.sub='nau';render();for(let i=0;i<60&&NAUS<2&&NAUS!==3;i++)await new Promise(r=>setTimeout(r,100));const n=NAUR.length;
  UI.nq='press';render();const found=document.querySelectorAll('[data-a="nad"]').length;UI.nq='';UI.ng='chest';render();const chest=document.querySelectorAll('[data-a="nad"]').length;
  const first=document.querySelector('[data-a="nad"]');let det=false;if(first){first.click();await new Promise(r=>setTimeout(r,150));det=S.sub==='nad'}return{status:NAUS,machines:n,searchHits:found,chestHits:chest,detailOpens:det,ng:UI.ng,emp:(document.querySelector('.emp')||{}).textContent}});
 rec('T10c','قاعدة الأجهزة دون اتصال بعد التثبيت: تحميل + بحث + تصفية بالعضلة + فتح تفاصيل جهاز',off.status===2&&off.machines>800&&off.searchHits>0&&off.chestHits>0&&off.detailOpens,JSON.stringify(off)+' | js_errors='+JSON.stringify(w3.err),'P2');
 await c2.setOffline(false);await q2.reload();await q2.waitForFunction(()=>typeof S!=='undefined');await q2.evaluate(seed);
 const back=await q2.evaluate(async()=>{const k=await caches.keys();const r=await fetch('eq-db.js',{cache:'no-store'});return{keys:k,status:r.status,ok:typeof S!=='undefined'}});
 rec('T10c-2','عودة الاتصال: لا تعارض كاش (مفتاح واحد هو إصدار sw.js الحالي) والتطبيق يعمل',back.keys.length===1&&back.keys[0]===SWV&&back.status===200&&back.ok,JSON.stringify(back)+' | js_errors='+JSON.stringify(w3.err),'P2');
 // فشل التحميل: رسالة واضحة وإعادة محاولة تعمل
 const fail=await q2.evaluate(async()=>{NAUS=3;NAUR=[];S.tab='ex';S.sub='nau';render();const msg=document.querySelector('.emp')?.textContent||'';const hasRetry=!!document.querySelector('[data-a="nauretry"]');ACT.nauretry();for(let i=0;i<60&&NAUS<2;i++)await new Promise(r=>setTimeout(r,100));return{msg:msg.slice(0,60),hasRetry,after:NAUS,machines:NAUR.length}});
 rec('T10c-3','فشل تحميل القاعدة: رسالة واضحة وزر إعادة محاولة يستعيدها',fail.hasRetry&&fail.after===2&&fail.machines>800,JSON.stringify(fail),'P3');
 await c2.close();

 /* T20: الفيض الأفقي على 6 أحجام × 29 شاشة، ولا overflow-x:hidden عام يخفي المشكلة */
 const sizes=[[320,568],[360,640],[390,844],[412,915],[768,1024],[1024,768]];const ov={};
 for(const [W,H] of sizes){const c=await b.newContext({viewport:{width:W,height:H}});const pg=await c.newPage();const e=[];pg.on('pageerror',x=>e.push(x.message));await pg.goto(A+'/');await pg.waitForFunction(()=>typeof S!=='undefined');await pg.evaluate(seed);
  const r=await pg.evaluate(async({TABS,SUBS})=>{const out=[];const chk=n=>{const d=document.documentElement;if(d.scrollWidth>innerWidth+1)out.push(n+':'+d.scrollWidth)};for(const t of TABS){S.tab=t;S.sub=null;render();await new Promise(r=>setTimeout(r,50));chk('tab:'+t)}for(const s of SUBS){S.tab='ex';S.sub=s;render();await new Promise(r=>setTimeout(r,60));chk('sub:'+s)}
   const cs=x=>getComputedStyle(x).overflowX;return{out,html:cs(document.documentElement),body:cs(document.body)}},{TABS,SUBS});ov[W]=r;
  rec('T20-'+W,'لا فيض أفقي على '+W+'px عبر 29 شاشة',r.out.length===0&&e.length===0,r.out.length?r.out.join(', '):'لا فيض، لا أخطاء','P3');await c.close()}
 const hid=ov[320].html==='hidden'||ov[320].body==='hidden';
 rec('T20-nohide','الإصلاح بمعالجة السبب: لا overflow-x:hidden عام على html/body',!hid,'html='+ov[320].html+' body='+ov[320].body,'P3');

 /* فشل الوسيط: غير متاح / ممنوع الأصل / 500 — رسالة واضحة بلا انهيار */
 const c3=await b.newContext({viewport:{width:390,height:844}});await c3.addInitScript(()=>{try{localStorage.setItem('fit_ai_ok','1')}catch(e){}});   /* موافقة الذكاء الاصطناعي */const f=await c3.newPage();const w4=watch(f);await f.goto(A+'/');await f.waitForFunction(()=>typeof S!=='undefined');await f.evaluate(seed);
 const aiTry=mode=>f.evaluate(async()=>{S.sub=null;S.tab='train';render();UI.ai=UI.ai||{};const a=UI.ai;a.lvl='b';a.eq='gym';a.dpw=4;a.min=60;a.focus='';a.notes='';a.res=null;UI.msg='';await aiGenPlan();return{res:!!a.res,msg:UI.msg||a.msg||'',busy:UI.busy||0}});
 MODE.ai='500';let r6=await aiTry();rec('P0-06a','وسيط يرد 500: رسالة خطأ واضحة بلا انهيار',!r6.res&&!!r6.msg&&!r6.busy,JSON.stringify(r6),'P1');MODE.ai='ok';
 wk.close();await new Promise(r=>setTimeout(r,200));
 r6=await aiTry();const syncOff=await f.evaluate(async()=>{await syncPush();return SYNC.st});
 rec('P0-06b','الوسيط غير متاح (انقطاع الشبكة): رسالة واضحة، التطبيق لا ينهار، والمزامنة تُبلغ بالفشل',!r6.res&&!!r6.msg&&!r6.busy&&w4.err.length===0&&syncOff==='err',JSON.stringify({ai:r6,sync:syncOff,js_errors:w4.err}),'P1');
 await c3.close();
 // أصل غير مسموح و"*" مرفوضان (اختبارات الوحدة للوسيط؛ هنا فحص المصدر)
 const wsrc=fs.readFileSync(ROOT+'worker/ai-proxy.js','utf8');rec('P0-06c','الوسيط لا يقبل ALLOW_ORIGIN=* ولا يعيد ACAO:* (مصدر + اختبار الوحدة)',!/indexOf\('\*'\)/.test(wsrc)&&/ok=!!og&&al\.indexOf\(og\)>=0/.test(wsrc),'tests/worker.test.mjs يغطي السلوك','P2');
}catch(e){console.log('EXCEPTION',e.stack.split('\n').slice(0,4).join(' | '));if(process.env.GITHUB_ACTIONS)console.log('::error title=exception::'+e.stack.split('\n').slice(0,3).join(' | ').slice(0,400));rec('P0-run','تنفيذ السكربت اكتمل بلا استثناء',false,String(e.message).slice(0,200),'P1')}finally{await b.close();st.close();try{wk.close()}catch(e){}
 fs.writeFileSync(new URL('./p0/results-p0.json',import.meta.url).pathname,JSON.stringify(results,null,1));
 const fail=results.filter(r=>r.result==='FAIL');if(process.env.GITHUB_ACTIONS)fail.forEach(r=>console.log('::error title='+r.id+'::'+String(r.evidence).replace(/[\r\n]+/g,' ').slice(0,400)));console.log('\n'+results.filter(r=>r.result==='PASS').length+' PASS / '+fail.length+' FAIL');process.exit(fail.length?1:0)}
