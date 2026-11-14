// سيناريوهات استخدام فعلية: node scenarios.mjs  (NODE_PATH=$(npm root -g))
import {chromium,staticServer,workerServer,MODE,KV,rec,results,SITE} from './lib.mjs';
import fs from 'node:fs';
const A='http://127.0.0.1:8080';
const st=await staticServer(8080),wk=await workerServer(8788,A);
const b=await chromium.launch();
const newDev=async(o={})=>{const c=await b.newContext({viewport:{width:390,height:844},...o});const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto(A+'/');await p.waitForFunction(()=>typeof S!=='undefined'&&typeof ACT!=='undefined',null,{timeout:8000});return{c,p}};
const ev=(p,f,a)=>p.evaluate(f,a);
const click=(p,sel)=>p.click(sel,{timeout:3000});
try{
 /* T01 مستخدم جديد: التسجيل الأولي عبر الواجهة */
 let {c:cA,p:pA}=await newDev();
 try{
  await ev(pA,()=>{});
  const steps=[];
  await pA.waitForSelector('#wz-v',{timeout:3000});
  await pA.fill('#wz-v','سالم');await click(pA,'[data-a="wznext"]');
  await click(pA,'[data-a="wzopt"][data-v="m"]');
  await pA.waitForSelector('#wz-m-age');await pA.fill('#wz-m-age','30');await pA.fill('#wz-m-ht','178');await pA.fill('#wz-m-startW','85');await click(pA,'[data-a="wznext"]');
  await click(pA,'[data-a="wzopt"][data-v="lose"]');await click(pA,'[data-a="wzopt"][data-v="b"]');await click(pA,'[data-a="wzopt"][data-v="gym"]');await click(pA,'[data-a="wzopt"][data-v="4"]');
  await click(pA,'[data-a="obgo"]');await pA.waitForTimeout(400);
  const s=await ev(pA,()=>({ob:S.prof.ob,name:S.prof.name,kcal:S.nt&&S.nt.kcal,p:S.nt&&S.nt.p,days:S.plan.filter(d=>d.ex.length).length,ex:S.plan.reduce((a,d)=>a+d.ex.length,0),mp:Object.keys(S.mp||{}).length,prg:S.prg||S.prof.prg||null}));
  rec('T01','مستخدم جديد يكمل التسجيل الأولي عبر الواجهة (7 خطوات)',s.ob===1&&s.kcal>1200&&s.days>=3&&s.ex>=10,JSON.stringify(s),'P1');
 }catch(e){rec('T01','مستخدم جديد يكمل التسجيل الأولي عبر الواجهة',false,String(e).slice(0,200),'P1')}
 /* T02 استمرارية بعد إغلاق وفتح التطبيق */
 await pA.reload();await pA.waitForFunction(()=>typeof S!=='undefined');
 const s2=await ev(pA,()=>({name:S.prof.name,ob:S.prof.ob,ex:S.plan.reduce((a,d)=>a+d.ex.length,0)}));
 rec('T02','إغلاق وفتح التطبيق يحفظ الملف والخطة',s2.name==='سالم'&&s2.ob===1&&s2.ex>=10,JSON.stringify(s2),'P0');
 /* T03 تسجيل جلسة تمرين */
 const t3=await ev(pA,()=>{const t=tasks()[0];if(!t)return{err:'no tasks'};const w=(t.e.w||20)+5;mark(t.k,w,10);save();return{n:t.e.n,w,done:!!S.done[t.k],base:S.base[t.e.n],inLifts:!!(lifts()[t.e.n]||[]).length}});
 rec('T03','تسجيل تمرين (وزن×تكرار) يُحفظ ويدخل سجل الأداء',t3.done&&t3.inLifts,JSON.stringify(t3),'P0');
 /* T04 تسجيل وجبة عبر منتقي الأطعمة (التدفق الحقيقي) */
 const t4=await ev(pA,async()=>{S.tab='food';S.sub=null;render();ACT.fpopen({dataset:{m:'log',d:TD(),s:'b'}});render();const q=$('#fp-q');q.value='ستيك';q.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(r=>setTimeout(r,300));const f=UI.fp;f.sel=f.list.findIndex(x=>x.n.indexOf('ستيك')>=0);render();$('#fp-g').value='200';const n0=(S.meals[TD()]||[]).length;ACT.fpadd();const m=(S.meals[TD()]||[]).slice(-1)[0]||{};return{foods:FOODS.length,found:f.list.length,added:(S.meals[TD()]||[]).length-n0,kcal:m.kcal,name:m.n}});
 rec('T04a','منتقي الأطعمة: بحث بالعربية وإضافة وجبة بالجرامات',t4.added===1&&t4.found>0,JSON.stringify(t4),'P1');
 rec('T04b','حساب السعرات حسب الجرامات (القيم لكل 100 غ: 250 × 2 = 500)',Math.abs(t4.kcal-500)<=1,'الفعلي '+t4.kcal,'P1');
 /* T05 وزن */
 const t5=await ev(pA,()=>{S.sub='wgt';render();$('#we-d').value=TD();$('#we-w').value='84.2';$('#we-b').value='22';ACT.wadd();render();return{bw:S.bw[TD()],bf:S.bf&&S.bf[TD()]}});
 rec('T05','تسجيل الوزن ونسبة الدهون',t5.bw===84.2,JSON.stringify(t5),'P1');
 /* T06 التقدّم */
 const t6=await ev(pA,()=>{S.sub='prog';render();const h=document.body.innerHTML;return{svg:(h.match(/<svg/g)||[]).length,len:h.length}});
 rec('T06','شاشة التقدّم ترسم رسومًا وأرقامًا',t6.len>3000,JSON.stringify(t6),'P2');
 /* T07-T08 الذكاء الاصطناعي عبر الوسيط */
 await ev(pA,()=>{S.sub=null;S.tab='train';render()});
 const aiRun=async(mode)=>{MODE.ai=mode;return ev(pA,async()=>{UI.ai=UI.ai||{};const a=UI.ai;a.lvl='b';a.eq='gym';a.dpw=4;a.min=60;a.focus='';a.notes='';a.res=null;await aiGenPlan();return{res:a.res&&{name:a.res.name,days:a.res.days.length,ex:a.res.days.reduce((x,d)=>x+d.ex.length,0),skipped:a.res.skipped},msg:a.msg,busy:a.busy,SM:!!SM}})};
 let r7=await aiRun('ok');rec('T07','بناء خطة بالذكاء الاصطناعي (وسيط حقيقي + Anthropic وهمي)',!!r7.res&&r7.res.days>=1&&r7.res.ex>=3,JSON.stringify(r7),'P1');
 r7=await aiRun('badjson');rec('T08a','رد غير JSON من الذكاء: رسالة خطأ بلا انهيار',!r7.res&&!!r7.msg&&!r7.busy,JSON.stringify(r7),'P1');
 r7=await aiRun('500');rec('T08b','فشل المزوّد 500: رسالة خطأ بلا انهيار',!r7.res&&!!r7.msg&&!r7.busy,JSON.stringify(r7),'P1');
 r7=await aiRun('unknown');rec('T08c','تمارين غير موجودة في المكتبة تُستبعد',!r7.res||r7.res.ex===0||r7.res.skipped>0,JSON.stringify(r7),'P2');
 MODE.ai='ok';
 /* T09 مزامنة جهازين */
 const tokA=await ev(pA,()=>SYNC.token);
 await ev(pA,()=>{S.ts=Date.now();save();return syncPush()});await pA.waitForTimeout(300);
 const {c:cB,p:pB}=await newDev();
 await ev(pB,t=>{localStorage.setItem('fit_sync',t)},tokA);await pB.reload();await pB.waitForFunction(()=>typeof S!=='undefined');
 const pull=await ev(pB,async()=>{SYNC.token=localStorage.getItem('fit_sync');const r=await syncPull(true);return{r,name:S.prof.name,ex:S.plan.reduce((a,d)=>a+d.ex.length,0)}});
 rec('T09a','الجهاز الثاني يسحب حالة الأول عبر الرمز',pull.r==='pulled'&&pull.name==='سالم',JSON.stringify(pull),'P1');
 /* تعارض: تعديل من الجهازين */
 await ev(pA,()=>{S.ts=Date.now();S.nt.note='edit-A';save();return syncPush()});await pA.waitForTimeout(200);
 await ev(pB,()=>{S.ts=Date.now()+5;(S.bw[TD()+'x']=1);S.cd['2026-01-01']={steps:999};save();return syncPush()});await pB.waitForTimeout(200);
 const srv=JSON.parse(KV.m.get('s:'+tokA)||KV.m.get([...KV.m.keys()].find(k=>k.startsWith('s:'))||'')||'{}');
 const lostA=!(srv.nt&&srv.nt.note==='edit-A');
 rec('T09b-legacy','نمط المزامنة القديم (لقطة كاملة برمز الوسيط، بلا Supabase): تعديلان متزامنان من جهازين. الاختبار المعتمد لمسار P1 هو T09b في tests/sync.e2e.mjs',!lostA,'الخادم يحتفظ بآخر كتابة كاملة؛ تعديل الجهاز الأول '+(lostA?'فُقد (last-write-wins بلا دمج)':'محفوظ'),'P1');
 /* T10 دون اتصال */
 await cA.close();
 const {c:cO,p:pO}=await newDev();
 await ev(pO,()=>{S.prof.ob=1;S.prof.name='أوفلاين';save()});await pO.reload();await pO.waitForFunction(()=>typeof S!=='undefined');
 await pO.waitForFunction(()=>navigator.serviceWorker&&navigator.serviceWorker.controller||navigator.serviceWorker.ready.then(()=>true),null,{timeout:8000}).catch(()=>{});
 await pO.waitForTimeout(1500);await pO.reload();await pO.waitForTimeout(800);
 const swOk=await ev(pO,async()=>{const r=await navigator.serviceWorker.getRegistration();const ks=await caches.keys();return{reg:!!r,active:!!(r&&r.active),caches:ks}});
 rec('T10a','تسجيل Service Worker وملء الكاش',swOk.reg&&swOk.active&&swOk.caches.length>0,JSON.stringify(swOk),'P1');
 await cO.setOffline(true);
 let off={};try{await pO.reload({timeout:8000});await pO.waitForFunction(()=>typeof S!=='undefined',null,{timeout:5000});off=await ev(pO,()=>{S.meals[TD()]=[{id:uid(),n:'x',kcal:100,p:1,c:1,f:1,slot:'b'}];save();return{name:S.prof.name,saved:JSON.parse(localStorage.getItem('fit1')).meals[TD()].length}})}catch(e){off={err:String(e).slice(0,120)}}
 rec('T10b','فتح التطبيق دون إنترنت وإضافة وجبة',off.name==='أوفلاين'&&off.saved===1,JSON.stringify(off),'P0');
 /* قاعدة الأجهزة دون اتصال (لم تُحمَّل مسبقًا) */
 const nauOff=await ev(pO,async()=>{try{const r=await fetch('eq-db.js');return{status:r.status}}catch(e){return{err:'fetch failed offline'}}});
 rec('T10c','قاعدة الأجهزة (eq-db.js) متاحة دون اتصال قبل أول فتح',nauOff.status===200,JSON.stringify(nauOff)+' — محاولة جلب eq-db.js دون اتصال بعد تثبيت الـService Worker','P2');
 await cO.setOffline(false);
 /* T11 تصدير واستيراد */
 const exp=await ev(pO,()=>JSON.stringify(S));
 const {c:cC,p:pC}=await newDev();
 const imp=await ev(pC,j=>{const x=JSON.parse(j);const ok=load(x);save();return{ok,name:S.prof.name,meals:(S.meals[TD()]||[]).length}},exp);
 rec('T11','تصدير ثم استيراد في جهاز نظيف يعيد البيانات',imp.ok&&imp.name==='أوفلاين'&&imp.meals===1,JSON.stringify(imp),'P1');
 /* T12 عزل بيانات المستخدمين على الوسيط */
 const x1=await fetch('http://127.0.0.1:8788/api/state',{headers:{Authorization:'Bearer '+'q'.repeat(30),Origin:A}});
 rec('T12','رمز غريب لا يرى حالة مستخدم آخر',x1.status===404,'status '+x1.status,'P0');
 rec('T13','أخطاء JS خلال كل السيناريوهات',[pA,pB,pO,pC].every(p=>p.errs.length===0),JSON.stringify([pA,pB,pO,pC].map(p=>p.errs.slice(0,2))),'P1');
}finally{
 fs.writeFileSync(new URL('./results-scenarios.json',import.meta.url),JSON.stringify(results,null,1));
 await b.close();st.close();wk.close();process.exit(0)}
