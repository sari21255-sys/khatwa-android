// اختبارات المزامنة على مستوى السجل: متصفحان (جهازان) ↔ Supabase وهمي ↔ Postgres حقيقي (دوال P1). بيانات اصطناعية فقط.
// الاستعمال: PSQL="psql -h localhost -U postgres -d t1 -q -At" NODE_PATH=$(npm root -g) node tests/sync.e2e.mjs
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
import W from '../worker/ai-proxy.js';import {startMock,dbq} from './mock-supabase.mjs';
const {chromium}=createRequire(import.meta.url)(path.join(process.env.NODE_PATH||'','playwright'));
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),WWW=ROOT+'/www';
const results=[];const rec=(id,name,ok,ev)=>{results.push({id,name,result:ok?'PASS':'FAIL',evidence:ev});console.log((ok?'PASS ':'FAIL ')+id+' '+name+(ok?'':' — '+ev))};
const sb=await startMock(8791);
// وسيط قديم (وضع الانتقال) بذاكرة KV لاختبار ترحيل اللقطات القديمة
let failMig=false;const kvm=new Map();const KV={get:async(k,t)=>{const v=kvm.get(k);return v==null?null:(t==='json'?JSON.parse(v):v)},put:async(k,v)=>kvm.set(k,String(v)),delete:async k=>{kvm.delete(k)}};
const wenv={STATE:KV,ANTHROPIC_API_KEY:'k',ALLOW_ORIGIN:'http://127.0.0.1:8790',AUTH_MODE:'transition'};
const wk=http.createServer((q,res)=>{const ch=[];q.on('data',c=>ch.push(c));q.on('end',async()=>{if(failMig&&q.method==='POST'&&q.url.endsWith('/api/migrated')){res.writeHead(500);return res.end('x')}const r=await W.fetch(new Request('http://w'+q.url,{method:q.method,headers:q.headers,body:['GET','HEAD'].includes(q.method)?undefined:Buffer.concat(ch)}),wenv);const h={};r.headers.forEach((v,k)=>h[k]=v);res.writeHead(r.status,h);res.end(Buffer.from(await r.arrayBuffer()))})}).listen(8792);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
const st=http.createServer((q,res)=>{let f=q.url.split('?')[0];if(f==='/')f='/index.html';
 if(f==='/config.js'){res.writeHead(200,{'content-type':'text/javascript'});return res.end(`window.APP_CONFIG={${cfgMode==='full'?'sbUrl:"http://127.0.0.1:8791",sbKey:"anon",':''}syncUrl:"http://127.0.0.1:8792/api/state",aiUrl:"http://127.0.0.1:8792/api/ai"};`)}
 const p=path.join(WWW,f);if(!p.startsWith(WWW)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){res.writeHead(404);return res.end()}res.writeHead(200,{'content-type':MIME[path.extname(p)]||'application/octet-stream'});res.end(fs.readFileSync(p))}).listen(8790);
let cfgMode='full';const A='http://127.0.0.1:8790';const b=await chromium.launch();
const SEED=`S.prof.ob=1;S.prof.name='اختبار';S.prof.sex='m';S.prof.age=30;S.prof.ht=178;S.prof.startW=85;S.prof.goalType='lose';calcTargets();genPlan();save();`;
async function device(){const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(A+'/');await p.waitForFunction(()=>typeof S!=='undefined'&&typeof rsSync==='function');p.errs=errs;p.ctx=c;return p}
const email=n=>`u${Date.now()}${n}@test.invalid`;
const edit=async(p,js)=>{await p.evaluate(js+';save();0');await p.waitForTimeout(300)};
/* ينتظر انتهاء أي مزامنة جارية (مثل مزامنة الإقلاع بعد إعادة التحميل) قبل أن يشغّل مزامنته، وإلا ردّ rsSync بـ«busy» دون عمل */
const sync=p=>p.evaluate(async()=>{const idle=async()=>{for(let i=0;i<100&&RS.busy;i++)await new Promise(r=>setTimeout(r,100))};await idle();const o=await rsSync();await idle();return o});
const get=(p,expr)=>p.evaluate(expr);
const up=(p,e)=>p.evaluate(e=>SB.up(e,'password123','t').then(()=>1),e);
const login=(p,e)=>p.evaluate(e=>SB.in(e,'password123').then(()=>1),e);
const uidOf=p=>p.evaluate(()=>SB.uid());
try{
 /* ---- تفكيك الحالة وإعادة تركيبها بلا فقد ---- */
 {const p=await device();await p.evaluate(SEED);await p.evaluate(()=>{S.bw['2026-11-01']=84;S.meals['2026-11-01']=[{n:'بيض',kcal:150}];S.lib.push({id:'m_custom',n:'وجبتي',kcal:300,p:1,c:1,f:1});S.prof.name='سارة';S.done['2026-11-02|0|e1']={n:'بنش',w:60,r:8,date:'2026-11-02'};save()});
  const r=await p.evaluate(()=>{const d=rsDecomp(S),recs=Object.values(d).map(c=>({k:c.k,r:c.r,v:{m:c.m,e:c.e,v:c.v},ts:5,d:'x',x:false}));const keep=['bw','meals','lib','prof','done','plan','nt','gy','mp','fast'];const before={};keep.forEach(k=>before[k]=JSON.stringify(S[k]));
   const src=JSON.parse(JSON.stringify(S));S=def();norm();RSM.rec={};rsApply(recs);const bad=keep.filter(k=>JSON.stringify(S[k])!==before[k]&&k!=='lib');const libOk=src.lib.every(x=>S.lib.some(y=>y.id===x.id&&JSON.stringify(y)===JSON.stringify(x)))&&S.lib.length===src.lib.length;return{n:recs.length,bad,libOk}});
  rec('RS-01','تفكيك الحالة إلى سجلات وإعادة تركيبها يطابق الأصل (خرائط، مصفوفات id، حقول)',r.bad.length===0&&r.libOk&&r.n>20,JSON.stringify(r));await p.ctx.close()}
 /* ---- T09b: تعديلان مستقلان من جهازين يظهران على كليهما ---- */
 const em=email('a');const d1=await device(),d2=await device();await d1.evaluate(SEED);await up(d1,em);await login(d2,em);
 await sync(d1);await sync(d2);
 await edit(d1,"S.bw['2026-11-01']=80");await edit(d2,"S.meals['2026-11-02']=[{n:'رز',kcal:260}]");
 await sync(d1);await sync(d2);await sync(d1);
 {const x=await get(d1,"({bw:S.bw['2026-11-01'],meal:(S.meals['2026-11-02']||[]).length})"),y=await get(d2,"({bw:S.bw['2026-11-01'],meal:(S.meals['2026-11-02']||[]).length})");
  rec('T09b','تعديلان مستقلان من جهازين (وزن من الأول ووجبة من الثاني) يظهران على كليهما',x.bw===80&&x.meal===1&&y.bw===80&&y.meal===1,JSON.stringify({d1:x,d2:y}))}
 /* ---- الجهاز الجديد النظيف لا يطغى بإعداداته الافتراضية على بيانات الحساب ---- */
 {const d3=await device();await login(d3,em);await sync(d3);const x=await get(d3,"({bw:S.bw['2026-11-01'],name:S.prof.name,plan:S.plan.length})");const d1n=await get(d1,"S.prof.name");
  rec('RS-02','جهاز جديد بحالة افتراضية يسحب بيانات الحساب ولا يرفع افتراضياته فوقها',x.bw===80&&x.name===d1n&&x.plan===7,JSON.stringify(x));await d3.ctx.close()}
 /* ---- تعديل السجل نفسه: الأحدث يفوز على الجهازين ---- */
 await edit(d1,"S.bw['2026-11-05']=70");await new Promise(r=>setTimeout(r,15));await edit(d2,"S.bw['2026-11-05']=71");   // d2 أحدث، لكنه يُزامن أولًا أو أخيرًا
 await sync(d2);await sync(d1);await sync(d2);
 {const a=await get(d1,"S.bw['2026-11-05']"),c=await get(d2,"S.bw['2026-11-05']");rec('RS-03','تعديل السجل نفسه من جهازين: الأحدث (وليس الأسبق وصولًا) يفوز على كليهما',a===71&&c===71,JSON.stringify({a,c}))}
 /* ---- حذف أحدث من التعديل يفوز؛ وتعديل أحدث من الحذف يُبقي السجل ---- */
 await edit(d1,"S.meals['2026-11-07']=[{n:'م1',kcal:1}];S.meals['2026-11-08']=[{n:'م2',kcal:2}]");await sync(d1);await sync(d2);
 await edit(d2,"S.meals['2026-11-07']=[{n:'م1 معدّلة',kcal:5}]");await new Promise(r=>setTimeout(r,15));await edit(d1,"delete S.meals['2026-11-07']");   // الحذف أحدث → يفوز
 await edit(d1,"delete S.meals['2026-11-08']");await new Promise(r=>setTimeout(r,15));await edit(d2,"S.meals['2026-11-08']=[{n:'م2 معدّلة',kcal:9}]");   // التعديل أحدث → يبقى
 await sync(d1);await sync(d2);await sync(d1);await sync(d2);
 {const f=p=>get(p,"({m7:!!S.meals['2026-11-07'],m8:(S.meals['2026-11-08']||[{}])[0].n})");const a=await f(d1),c=await f(d2);
  rec('RS-04','حذف أحدث من التعديل يفوز، وتعديل أحدث من الحذف يُبقي السجل (وبالتساوي على الجهازين)',a.m7===false&&c.m7===false&&a.m8==='م2 معدّلة'&&c.m8==='م2 معدّلة',JSON.stringify({a,c}))}
 /* ---- انقطاع: التعديلات المعلّقة تبقى بعد إعادة التحميل ثم تُرسل ---- */
 await d1.ctx.route('**/rest/v1/rpc/**',r=>r.abort());await edit(d1,"S.bw['2026-11-09']=66;S.meals['2026-11-09']=[{n:'أوفلاين',kcal:3}]");const failed=await sync(d1);
 const pend=await get(d1,"rsPend()");await d1.reload();await d1.waitForFunction(()=>typeof rsSync==='function');
 const pend2=await get(d1,"(rsMark(),rsPend())"),keep=await get(d1,"S.bw['2026-11-09']");
 rec('RS-05','انقطاع الشبكة: المزامنة تفشل بأمان، والتعديلات المعلّقة تبقى بعد إعادة تحميل التطبيق',failed==='err'&&pend>=2&&pend2>=2&&keep===66,JSON.stringify({failed,pend,pend2,keep}));
 await d1.ctx.unroute('**/rest/v1/rpc/**');await sync(d1);await sync(d2);
 {const c=await get(d2,"({w:S.bw['2026-11-09'],m:(S.meals['2026-11-09']||[]).length})");rec('RS-06','عودة الاتصال: التعديلات المعلّقة تصل الجهاز الآخر',c.w===66&&c.m===1,JSON.stringify(c))}
 /* ---- إعادة إرسال الطلب: وصل للخادم لكن ضاع الرد ---- */
 await d1.ctx.route('**/rest/v1/rpc/sync_exchange',async r=>{await r.fetch();await r.abort()});await edit(d1,"S.bw['2026-11-10']=65");const lost=await sync(d1);await d1.ctx.unroute('**/rest/v1/rpc/sync_exchange');
 const pendLost=await get(d1,"rsPend()");const again=await sync(d1);await sync(d2);
 {const n=dbq(`select count(*) from public.sync_records where user_id='${await uidOf(d1)}' and kind='bw' and rid='2026-11-10'`),c=await get(d2,"S.bw['2026-11-10']"),pend3=await get(d1,"rsPend()");
  rec('RS-07','ضياع رد الخادم بعد التطبيق: إعادة الإرسال لا تكرّر ولا تُفسد، وتُؤكَّد التعديلات',lost==='err'&&pendLost>=1&&again==='ok'&&n==='1'&&c===65&&pend3===0,JSON.stringify({lost,pendLost,again,rows:n,d2:c,pend3}))}
 /* ---- عزل الحسابات ---- */
 {const o=await device();const e2=email('b');await up(o,e2);await sync(o);const x=await get(o,"({bw:S.bw['2026-11-01']||null,n:Object.keys(S.bw).length})");
  const uo=await uidOf(o),foreign=dbq(`select count(*) from public.sync_records where user_id='${uo}' and kind='bw' and rid in ('2026-11-01','2026-11-05')`),mine=dbq(`select count(*) from public.sync_records where user_id='${uo}'`);
  rec('RS-08','حساب آخر لا يرى بيانات الأول ولا يرفع إليه (عزل على الخادم)',x.bw===null&&foreign==='0'&&Number(mine)>0,JSON.stringify({x,foreign,mine}));await o.ctx.close()}
 /* ---- ترحيل لقطة الوسيط القديمة وتكراره ---- */
 {const lt='legacylegacylegacy0123456789ab';const snapState=await d1.evaluate(()=>JSON.parse(JSON.stringify(S)));
  const old=JSON.parse(JSON.stringify(snapState));old.ts=Date.now()-86400000;old.bw={'2026-10-01':99,'2026-11-01':1};old.meals={'2026-10-02':[{n:'قديمة',kcal:7}]};old.lib=[{id:'old_lib',n:'وجبة قديمة',kcal:1,p:1,c:1,f:1}];
  await fetch('http://127.0.0.1:8792/api/state',{method:'PUT',headers:{Authorization:'Bearer '+lt,Origin:'http://127.0.0.1:8790'},body:JSON.stringify(old)});
  const m=await device();await m.evaluate(SEED);await m.evaluate(t=>{SYNC.token=t},lt);await up(m,email('m'));
  await edit(m,"S.bw['2026-11-01']=82");   // محلي أحدث من اللقطة القديمة لنفس السجل
  const r1=await m.evaluate(()=>rsLegacyImport());await sync(m);const s1=await get(m,"JSON.stringify([S.bw,S.meals['2026-10-02'],S.lib.filter(x=>x.id==='old_lib').length,S.lib.length])");
  const r2=await m.evaluate(()=>rsLegacyImport());await sync(m);const s2=await get(m,"JSON.stringify([S.bw,S.meals['2026-10-02'],S.lib.filter(x=>x.id==='old_lib').length,S.lib.length])");
  const j=JSON.parse(s1);
  rec('MIG-01','ترحيل اللقطة القديمة يدمج سجلًا بسجل: بياناتها القديمة تظهر، والتعديل المحلي الأحدث يبقى',j[0]['2026-10-01']===99&&j[0]['2026-11-01']===82&&j[1].length===1&&j[2]===1,s1);
  rec('MIG-02','تكرار الترحيل لا يضاعف ولا يغيّر شيئًا (idempotent)',s1===s2,s1+' vs '+s2);
  // تجميد اللقطة القديمة بعد الترحيل: جهاز قديم يكتب = 410
  await fetch('http://127.0.0.1:8792/api/migrated',{method:'POST',headers:{Authorization:'Bearer '+lt,Origin:'http://127.0.0.1:8790'}});
  const w=await fetch('http://127.0.0.1:8792/api/state',{method:'PUT',headers:{Authorization:'Bearer '+lt,Origin:'http://127.0.0.1:8790'},body:JSON.stringify(old)});
  rec('MIG-03','جهاز قديم لا يستطيع الكتابة فوق النسخة بعد الترحيل (410)',w.status===410,'status '+w.status);await m.ctx.close()}
 /* ---- جهاز جديد بلا رمز قديم: دخول الحساب القديم بالبريد وكلمة المرور ثم النقل ---- */
 {const o=await fetch('http://127.0.0.1:8792/api/register',{method:'POST',headers:{'content-type':'application/json',Origin:'http://127.0.0.1:8790','CF-Connecting-IP':'9.9.9.'+(Date.now()%200)},body:JSON.stringify({email:email('lg'),password:'legacypass123'})});const reg=await o.json();
  const lem=email('lg2');const o2=await fetch('http://127.0.0.1:8792/api/register',{method:'POST',headers:{'content-type':'application/json',Origin:'http://127.0.0.1:8790','CF-Connecting-IP':'8.8.8.'+(Date.now()%200)},body:JSON.stringify({email:lem,password:'legacypass123'})});const tk=(await o2.json()).token;
  const st=await d1.evaluate(()=>JSON.parse(JSON.stringify(S)));st.ts=Date.now()-5000;st.bw={'2026-09-09':91};st.meals={};
  await fetch('http://127.0.0.1:8792/api/state',{method:'PUT',headers:{Authorization:'Bearer '+tk,Origin:'http://127.0.0.1:8790'},body:JSON.stringify(st)});
  const n=await device();await n.evaluate(SEED);await up(n,email('nl'));await n.evaluate(()=>{S.tab='me';S.sub='set';render()});
  await n.fill('#olem',lem);await n.fill('#olpw','legacypass123');await n.click('[data-a=lglogin]');await n.waitForFunction(()=>!!SYNC.token);
  await n.click('[data-a=rsmig]');await n.waitForFunction(()=>RSM.migrated===1,null,{timeout:8000});const v=await get(n,"S.bw['2026-09-09']");const frozen=await fetch('http://127.0.0.1:8792/api/state',{method:'PUT',headers:{Authorization:'Bearer '+tk,Origin:'http://127.0.0.1:8790'},body:JSON.stringify(st)});
  rec('MIG-04','حساب مزامنة قديم (بريد وكلمة مرور) على جهاز جديد: الدخول من الإعدادات ثم النقل يجلب بياناته ويجمّد النسخة القديمة',v===91&&frozen.status===410&&!!reg.token,JSON.stringify({v,frozen:frozen.status}));await n.ctx.close()}
 /* ---- F-TIE: تعادل التوقيت والحذف بين جهازين: الطرفان يحسمان بالقاعدة نفسها (الجهاز الأكبر يفوز) ---- */
 {const em=email('tie');const X=await device();await X.evaluate(SEED);await up(X,em);await sync(X);const u=await uidOf(X);const Y=await device();await login(Y,em);await sync(Y);
  const dx=await get(X,'RSM.dev'),dy=await get(Y,'RSM.dev'),xWins=dx>dy,[W1,L1]=xWins?[X,Y]:[Y,X];
  const T0=Date.now()+30000;let tn=0;const tie=async k=>{const v=T0+(++tn)*10000;for(const p of[X,Y])await p.evaluate(([k,v])=>{const e=RSM.rec['bw\u0001'+k];e.t=v;RSLT=Math.max(RSLT,v);rsSave()},[k,v])};
  const srv=k=>dbq(`select data->>'v' from public.sync_records where user_id='${u}' and kind='bw' and rid='${k}'`);
  const pend=p=>get(p,"Object.values(RSM.rec).filter(e=>e.p).length");
  const loc=(p,k)=>get(p,`S.bw['${k}']`);
  const state=async k=>({x:await loc(X,k),y:await loc(Y,k),s:Number(await srv(k)),px:await pend(X),py:await pend(Y)});
  const same=(st,v)=>st.x===v&&st.y===v&&st.s===v&&st.px===0&&st.py===0;
  // أ) X يصل الخادم أولًا ثم Y
  await edit(X,"S.bw['2026-09-10']=61");await edit(Y,"S.bw['2026-09-10']=62");await tie('2026-09-10');const tsx=await get(X,"RSM.rec['bw\\u00012026-09-10'].t"),tsy=await get(Y,"RSM.rec['bw\\u00012026-09-10'].t");
  await sync(X);await sync(Y);await sync(X);const v1=xWins?61:62,a=await state('2026-09-10');
  rec('TIE-01','توقيتان متطابقان لقيمتين مختلفتين (X ثم Y): الجهازان والخادم على قيمة الجهاز الأكبر ولا انتظار باقٍ',tsx===tsy&&same(a,v1),JSON.stringify({tsx,tsy,xWins,a}));
  // ب) عكس ترتيب وصول الطلبين
  await edit(X,"S.bw['2026-09-11']=71");await edit(Y,"S.bw['2026-09-11']=72");await tie('2026-09-11');const t2x=await get(X,"RSM.rec['bw\\u00012026-09-11'].t"),t2y=await get(Y,"RSM.rec['bw\\u00012026-09-11'].t");await sync(Y);await sync(X);await sync(Y);const v2=xWins?71:72,b=await state('2026-09-11');
  rec('TIE-02','عكس ترتيب وصول الطلبين (Y ثم X): النتيجة نفسها (قيمة الجهاز الأكبر) على الجهازين والخادم',same(b,v2),JSON.stringify({xWins,dx,dy,t2x,t2y,b}));
  // ج) إعادة التحميل ثم المزامنة: لا يتغير شيء ولا ينتظر شيء
  for(const p of[X,Y]){await p.reload();await p.waitForFunction(()=>typeof RSM!=='undefined');await p.waitForTimeout(800)}await sync(X);await sync(Y);
  const c1=await state('2026-09-10'),c2=await state('2026-09-11');
  rec('TIE-03','بعد إعادة تحميل الجهازين ومزامنة جديدة: القيم والانتظار كما هي',same(c1,v1)&&same(c2,v2),JSON.stringify({c1,c2}));
  // د) ضياع الرد: الخاسر يرسل أولًا بعد وصول الفائز، يضيع ردّ الخادم، ثم يعيد
  await edit(X,"S.bw['2026-09-12']=81");await edit(Y,"S.bw['2026-09-12']=82");await tie('2026-09-12');await sync(W1);
  await L1.route('**/rest/v1/rpc/sync_exchange',async r=>{await r.fetch();await r.abort()});const lostRes=await sync(L1);await L1.unroute('**/rest/v1/rpc/sync_exchange');
  const mid=await pend(L1);await sync(L1);await sync(W1);const v3=xWins?81:82,d=await state('2026-09-12');
  rec('TIE-04','ضياع ردّ الخادم عند الجهاز الخاسر ثم إعادة الإرسال: يستقر الجهازان والخادم على الفائز ويُسوّى الانتظار',same(d,v3),JSON.stringify({lostRes,mid,d}));
  // هـ) حذف مقابل تعديل بالتوقيت نفسه: التعديل يغلب الحذف على الجهازين والخادم
  await edit(X,"S.bw['2026-09-13']=91");await sync(X);await sync(Y);
  await edit(X,"S.bw['2026-09-13']=92");await edit(Y,"delete S.bw['2026-09-13']");await tie('2026-09-13');
  const tx2=await get(X,"RSM.rec['bw\\u00012026-09-13'].t"),ty2=await get(Y,"RSM.rec['bw\\u00012026-09-13'].t");
  await sync(Y);await sync(X);await sync(Y);const e1=await state('2026-09-13');
  rec('TIE-05','تعديل وحذف بالتوقيت نفسه: التعديل يغلب في الجهازين والخادم',tx2===ty2&&e1.x===92&&e1.y===92&&e1.s===92&&e1.px===0&&e1.py===0,JSON.stringify({tx2,ty2,e1}));
  for(const p of[X,Y])await p.ctx.close()}
 /* ---- F1: البيانات المرحّلة تصل السحابة فعلًا (جهاز 1 يرحّل، جهاز 2 فارغ يستقبل) ---- */
 {const LT='http://127.0.0.1:8792',O={Origin:'http://127.0.0.1:8790'};
  const mkLegacy=async(tag)=>{const o2=await fetch(LT+'/api/register',{method:'POST',headers:{'content-type':'application/json',...O,'CF-Connecting-IP':'7.7.'+(Date.now()%200)+'.'+Math.floor(Math.random()*200)},body:JSON.stringify({email:email('f1'+tag),password:'legacypass123'})});const tk=(await o2.json()).token;
   const st=await d1.evaluate(()=>JSON.parse(JSON.stringify(S)));st.ts=Date.now()-86400000;st.bw={'2026-08-01':71,'2026-08-02':72};st.meals={'2026-08-01':[{n:'قديمة',kcal:9}]};st.lib=[{id:'f1_lib',n:'قديمة',kcal:1,p:1,c:1,f:1}];
   await fetch(LT+'/api/state',{method:'PUT',headers:{Authorization:'Bearer '+tk,...O},body:JSON.stringify(st)});return tk};
  const cnt=u=>Number(dbq(`select count(*) from public.sync_records where user_id='${u}'`));
  const tk=await mkLegacy('a');const em=email('f1u');
  const m1=await device();await m1.evaluate(SEED);await m1.evaluate(t=>{SYNC.token=t;localStorage.setItem('fit_sync',t)},tk);await up(m1,em);const u1=await uidOf(m1);
  await edit(m1,"S.bw['2026-08-02']=69");  // تعديل محلي أحدث من اللقطة
  // (أ) استيراد ثم انقطاع الشبكة: لا تأكيد، المرحلة محفوظة، السجلات معلّقة
  await m1.evaluate(()=>rsLegacyImport());const pend0=await get(m1,"Object.values(RSM.rec).filter(e=>e.p).length");
  await m1.route('**/127.0.0.1:8791/**',r=>r.abort());const off=await m1.evaluate(()=>ACT.rsmig());const stOff=await get(m1,"({stage:RSM.mig&&RSM.mig.stage,mig:RSM.migrated||0,p:Object.values(RSM.rec).filter(e=>e.p).length,msg:UI.msg})");const srvOff=cnt(u1);
  rec('F1-01','بعد الاستيراد وانقطاع الشبكة: لا يُعلَن اكتمال، تبقى المرحلة «imported» والسجلات معلّقة، ولا شيء على الخادم',stOff.stage==='imported'&&!stOff.mig&&stOff.p>=pend0&&pend0>3&&srvOff===0&&/رفع/.test(stOff.msg),JSON.stringify({pend0,stOff,srvOff}));
  // (ب) إعادة التحميل بلا شبكة: الحالة تبقى
  await m1.reload();await m1.waitForFunction(()=>typeof RSM!=='undefined');const afterReload=await get(m1,"({stage:RSM.mig&&RSM.mig.stage,p:Object.values(RSM.rec).filter(e=>e.p).length,bw:S.bw['2026-08-01']})");
  rec('F1-02','إعادة التحميل تحفظ مرحلة الترحيل والسجلات المعلّقة والبيانات المحلية',afterReload.stage==='imported'&&afterReload.p>=pend0&&afterReload.bw===71,JSON.stringify(afterReload));
  // (ج) عودة الشبكة + رفض التجميد: الرفع يتم لكن الاكتمال لا يُعلَن
  await m1.unroute('**/127.0.0.1:8791/**');failMig=true;await m1.evaluate(()=>ACT.rsmig());
  const stFz=await get(m1,"({stage:RSM.mig&&RSM.mig.stage,mig:RSM.migrated||0,p:Object.values(RSM.rec).filter(e=>e.p).length,msg:UI.msg})");const srvFz=cnt(u1);
  rec('F1-03','رفض طلب التجميد: البيانات على الخادم، المرحلة «uploaded»، لا اكتمال، والرسالة تذكر المرحلة',stFz.stage==='uploaded'&&!stFz.mig&&stFz.p===0&&srvFz>=pend0&&/تجميد/.test(stFz.msg),JSON.stringify({stFz,srvFz}));
  // (د) جهاز 2 فارغ على الحساب نفسه يستقبل المرحَّل ويبقى التعديل الأحدث (قبل التجميد)
  const m2=await device();await login(m2,em);await sync(m2);
  const d2s=await get(m2,"({a:S.bw['2026-08-01'],b:S.bw['2026-08-02'],meal:(S.meals['2026-08-01']||[]).length,lib:S.lib.filter(x=>x.id==='f1_lib').length})");
  rec('F1-04','جهاز ثانٍ بسجل محلي فارغ على الحساب نفسه يستقبل السجلات المرحّلة ويبقى التعديل الأحدث (69 لا 72)',d2s.a===71&&d2s.b===69&&d2s.meal===1&&d2s.lib===1,JSON.stringify(d2s));
  // (هـ) إعادة المحاولة بعد زوال الرفض تكمل التجميد دون تكرار سجلات
  failMig=false;const before=cnt(u1);await m1.evaluate(()=>ACT.rsmig());const fin=await get(m1,"({stage:RSM.mig&&RSM.mig.stage,mig:RSM.migrated||0,msg:UI.msg})");
  const fr=await fetch(LT+'/api/state',{method:'PUT',headers:{Authorization:'Bearer '+tk,...O},body:'{}'});
  rec('F1-05','إعادة المحاولة بعد الرفض تكمل التجميد: المرحلة «frozen» والنسخة القديمة 410، وعدد السجلات على الخادم لم يتغير',fin.stage==='frozen'&&fin.mig===1&&fr.status===410&&cnt(u1)===before,JSON.stringify({fin,fr:fr.status,before,after:cnt(u1)}));
  // (و) تكرار الترحيل بعد الاكتمال لا يغيّر شيئًا
  const s1=await get(m1,"JSON.stringify([Object.entries(S.bw).sort(),S.meals,S.lib.length])"),c1=cnt(u1);await m1.evaluate(()=>ACT.rsmig());await sync(m1);await sync(m2);
  const s2=await get(m1,"JSON.stringify([Object.entries(S.bw).sort(),S.meals,S.lib.length])"),s3=await get(m2,"JSON.stringify([Object.entries(S.bw).sort(),S.meals,S.lib.length])");
  rec('F1-06','تكرار الترحيل بعد الاكتمال لا يضاعف ولا يغيّر: لا تغيير محليًا ولا على الخادم ولا على الجهاز الثاني',s1===s2&&s2===s3&&cnt(u1)===c1,JSON.stringify({c1,c2:cnt(u1),s1:s1.slice(0,150),s2:s2.slice(0,150),s3:s3.slice(0,150)}));
  // (ز) تعديل أحدث على الخادم من جهاز آخر قبل رفع المرحَّل: يبقى الأحدث
  const tk2=await mkLegacy('b'),em2=email('f1v');const n1=await device();await n1.evaluate(SEED);await up(n1,em2);await n1.evaluate(t=>{SYNC.token=t},tk2);
  const n2=await device();await login(n2,em2);await sync(n2);await edit(n2,"S.bw['2026-08-01']=55");await sync(n2);  // الخادم فيه 55 أحدث من اللقطة
  await n1.evaluate(()=>ACT.rsmig());const g1=await get(n1,"S.bw['2026-08-01']");await sync(n2);const g2=await get(n2,"S.bw['2026-08-01']");
  rec('F1-07','سجل أحدث موجود على الخادم يغلب المرحَّل: الجهازان ينتهيان على 55 والترحيل يكتمل',g1===55&&g2===55&&(await get(n1,"RSM.migrated"))===1,JSON.stringify({g1,g2}));
  for(const x of [m1,m2,n1,n2])await x.ctx.close()}
 /* ---- F3: بعد حذف السحابة لا يرفع أي جهاز (قديم أو فاقد معلومات المزامنة) إلا بقرار صريح ---- */
 {const em=email('f3');const cnt=u=>Number(dbq(`select count(*) from public.sync_records where user_id='${u}'`));
  const a=await device();await a.evaluate(SEED);await up(a,em);await edit(a,"S.bw['2026-07-01']=77;S.bw['2026-07-02']=76");await sync(a);const u=await uidOf(a);
  const b=await device();await login(b,em);await sync(b);await edit(b,"S.bw['2026-07-03']=75");await sync(b);   // الجهاز ب: يحمل epoch 1
  const before=cnt(u);
  await a.evaluate(()=>ACT.rsdel());const afterDel=cnt(u);
  // الجهاز ب يحتفظ ببياناته ويفقد معلومات المزامنة (مثل مسح بيانات المتصفح للمزامنة أو إعادة تثبيت مع بقاء النسخة المحلية)
  const keepB=await get(b,"JSON.stringify([S.bw['2026-07-01'],S.bw['2026-07-03']])");
  await b.evaluate(()=>{localStorage.removeItem('fit_rs');localStorage.removeItem('fit_rs_off')});
  await b.reload();await b.waitForFunction(()=>typeof RSM!=='undefined'&&typeof rsSync==='function');await b.waitForTimeout(1500);
  const afterOpen=cnt(u),st1=await get(b,"({ep:RSM.epoch,closed:RS.closed||0,bw:S.bw['2026-07-03']})");
  for(let i=0;i<3;i++){await edit(b,"S.bw['2026-07-0"+(4+i)+"']="+(70+i));await sync(b)}await b.reload();await b.waitForFunction(()=>typeof RSM!=='undefined');await b.waitForTimeout(1200);
  const afterAuto=cnt(u),st2=await get(b,"({closed:RS.closed||0,bw:S.bw['2026-07-06']})");
  rec('F3-01','بعد حذف السحابة: جهاز يحتفظ بالبيانات المحلية ويفقد معلومات المزامنة لا يرفع شيئًا عند الدخول ولا عند إعادة الفتح ولا في المحاولات التلقائية (السحابة تبقى فارغة)',Number(before)>5&&afterDel===0&&afterOpen===0&&afterAuto===0&&st1.closed===1&&st2.closed===1&&st2.bw===72&&keepB==='[77,75]',JSON.stringify({before,afterDel,afterOpen,afterAuto,st1,st2,keepB}));
  // جهاز ثالث بلا بيانات محلية ولا معلومات مزامنة: يقرأ الحالة (مغلقة) ولا يرفع افتراضياته
  const c=await device();await login(c,em);await sync(c);const cst=await get(c,"({closed:RS.closed||0,ep:RSM.epoch})");
  rec('F3-02','جهاز جديد يقرأ حالة المزامنة الحالية (مغلقة) دون رفع شيء ودون معلومات إصدار مفروضة',cst.closed===1&&cst.ep===null&&cnt(u)===0,JSON.stringify({cst,n:cnt(u)}));
  // الجهاز القديم الذي يحمل الإصدار السابق (ب قبل الفقد يمثّله بـ epoch=1): يُرفض كذلك
  const old=await device();await login(old,em);await old.evaluate(()=>{RSM.epoch=1;RSM.cursor=0;rsSave()});await edit(old,"S.bw['2026-07-09']=60");const ro=await sync(old);
  rec('F3-03','جهاز يحمل الإصدار القديم يُرفض ويُطلب قراره، والسحابة فارغة',ro==='reset'&&cnt(u)===0&&(await get(old,"S.bw['2026-07-09']"))===60,JSON.stringify({ro,n:cnt(u)}));
  // قرار صريح من ب: يبدأ مزامنة جديدة ببياناته المحلية
  const bBefore=await get(b,"JSON.stringify(S.bw)");await b.evaluate(()=>ACT.rsstart());const afterStart=cnt(u),bAfter=await get(b,"JSON.stringify(S.bw)");
  rec('F3-04','الرفع يحدث فقط بعد اختيار المستخدم الصريح، وبيانات الجهاز المحلية سليمة',afterStart>=5&&bBefore===bAfter&&(await get(b,"RS.closed||0"))===0,JSON.stringify({afterStart}));
  // الجهاز القديم بعد البدء: ما زال بإصدار قديم فيُعاد طلب قراره ولا يكتب
  const n1=cnt(u);const ro2=await sync(old);const n2=cnt(u);
  rec('F3-05','بعد بدء مزامنة جديدة يبقى الجهاز ذو الإصدار القديم مرفوضًا حتى يقرر هو',ro2==='reset'&&n2===n1,JSON.stringify({ro2,n1,n2}));
  await old.evaluate(()=>ACT.rsadopt());const n3=cnt(u);
  await sync(b);const gb=await get(b,"S.bw['2026-07-09']"),go=await get(old,"S.bw['2026-07-06']");
  rec('F3-06','قرار صريح من الجهاز القديم يدمج بياناته بقاعدة الفوز المعتادة: يصل ب تعديله (60) ويصله ما رفعه ب (72)',n3>n2&&gb===60&&go===72,JSON.stringify({n2,n3,gb,go}));
  for(const x of [a,b,c,old])await x.ctx.close()}
 /* ---- حذف نسخة المزامنة: جهاز قديم لا يعيد رفعها ---- */
 {const uid=await uidOf(d1);const before=dbq(`select count(*) from public.sync_records where user_id='${uid}'`);
  await d1.evaluate(()=>ACT.rsdel());const after=dbq(`select count(*) from public.sync_records where user_id='${uid}'`),pausedD1=await get(d1,"RS.pause");
  await edit(d2,"S.bw['2026-11-20']=60");const r=await sync(d2);const stale=dbq(`select count(*) from public.sync_records where user_id='${uid}'`);const local=await get(d2,"S.bw['2026-11-20']");const resetFlag=await get(d2,"RS.reset");
  rec('DEL-01','حذف النسخة السحابية يمسح السجلات ويوقف المزامنة على الجهاز الحاذف دون مسّ بياناته المحلية',Number(before)>20&&after==='0'&&pausedD1===1&&(await get(d1,"S.bw['2026-11-01']"))===80,JSON.stringify({before,after,pausedD1}));
  rec('DEL-02','جهاز قديم (epoch أقدم) لا يعيد رفع النسخة المحذوفة؛ يبقى محليًا ويُطلب قراره',r==='reset'&&stale==='0'&&local===60&&resetFlag===1,JSON.stringify({r,stale,local,resetFlag}));
  await d2.evaluate(()=>ACT.rsadopt());const re=dbq(`select count(*) from public.sync_records where user_id='${uid}'`);
  rec('DEL-03','بقرار المستخدم يُرفع الجهاز القديم كنسخة جديدة ويعود للعمل',Number(re)>20,'rows '+re);
  }
 /* ---- حذف الحساب: لا يعيد جهاز آخر الرفع ---- */
 {const em3=email('z');const x=await device(),y=await device();await x.evaluate(SEED);await up(x,em3);await login(y,em3);await sync(x);await sync(y);const uid=await uidOf(x);
  await x.evaluate(async()=>{await SB.q('rpc/delete_my_account','POST',{});SB.set(null)});
  await edit(y,"S.bw['2026-11-30']=50");const r=await sync(y);const err=await get(y,"RS.err"),rows=dbq(`select count(*) from public.sync_records where user_id='${uid}'`),usr=dbq(`select count(*) from auth.users where id='${uid}'`),loc=await get(y,"S.bw['2026-11-30']");
  rec('DEL-04','بعد حذف الحساب: السجلات محذوفة، والجهاز الآخر لا يعيد الرفع ويبقى محليًا مع رسالة جلسة منتهية',r==='err'&&err==='auth'&&rows==='0'&&usr==='0'&&loc===50,JSON.stringify({r,err,rows,usr,loc}));await x.ctx.close();await y.ctx.close()}
 /* ---- إبطال الجلسة وانتهاء الرمز ---- */
 {const e5=email('s');const x=await device();await x.evaluate(SEED);await up(x,e5);await sync(x);
  await x.evaluate(()=>{SB.ses.expires_at=Math.floor(Date.now()/1000)-5});await edit(x,"S.bw['2026-11-11']=61");const r1=await sync(x);const ref=await get(x,"SB.ses.expires_at>Math.floor(Date.now()/1000)");
  rec('SES-01','رمز دخول منتهٍ يُجدَّد تلقائيًا بـrefresh token ثم تنجح المزامنة',r1==='ok'&&ref===true,JSON.stringify({r1,ref}));
  const tok=await get(x,"SB.ses.access_token");await fetch('http://127.0.0.1:8791/auth/v1/logout',{method:'POST',headers:{authorization:'Bearer '+tok}});
  await edit(x,"S.bw['2026-11-12']=62");const r2=await sync(x);const e=await get(x,"RS.err"),loc=await get(x,"S.bw['2026-11-12']");
  rec('SES-02','جلسة مُبطلة على الخادم (تسجيل خروج) ترفض المزامنة فورًا ولو لم ينتهِ الرمز؛ البيانات تبقى محليًا',r2==='err'&&e==='auth'&&loc===62,JSON.stringify({r2,e,loc}));await x.ctx.close()}
 /* ---- تبديل الحساب على الجهاز نفسه لا يخلط البيانات ---- */
 {const e6=email('q'),e7=email('r');const x=await device();await x.evaluate(SEED);await up(x,e6);await edit(x,"S.bw['2026-11-13']=77");await sync(x);
  await x.evaluate(async e=>{await SB.out();await SB.up(e,'password123','t')},e7);const r=await sync(x);const acct=await get(x,"RS.acct"),u2=await uidOf(x),rows=dbq(`select count(*) from public.sync_records where user_id='${u2}'`);
  rec('ACC-01','تسجيل دخول حساب آخر على جهاز فيه بيانات حساب سابق: لا رفع تلقائي ولا خلط، ويُطلب قرار المستخدم',r==='acct'&&acct===1&&rows==='0',JSON.stringify({r,acct,rows}));await x.ctx.close()}
 /* ---- سكون: بلا تعديلات لا ترسل المزامنة شيئًا (لا تذبذب بين الأجهزة) ---- */
 {await sync(d1);await sync(d2);await sync(d1);await sync(d2);const uid=await uidOf(d2);const s0=dbq(`select seq from public.sync_meta where user_id='${uid}'`);
  for(let i=0;i<3;i++){await sync(d1);await sync(d2)}const s1=dbq(`select seq from public.sync_meta where user_id='${uid}'`),p1=await get(d1,"rsPend()"),p2=await get(d2,"rsPend()");
  rec('RS-10','بلا تعديلات جديدة: لا سجلات معلّقة ولا كتابات على الخادم عبر مزامنات متكررة من الجهازين',s0===s1&&p1===0&&p2===0,JSON.stringify({s0,s1,p1,p2}))}
 /* ---- انقطاع الشبكة عند انتهاء الرمز لا يُخرج المستخدم ---- */
 {const x=await device();await x.evaluate(SEED);await up(x,email('o'));await sync(x);await x.evaluate(()=>{SB.ses.expires_at=Math.floor(Date.now()/1000)-5});await x.ctx.route('**/auth/v1/**',r=>r.abort());await edit(x,"S.bw['2026-11-21']=55");const r=await sync(x);const ses=await get(x,"!!SB.ses"),err=await get(x,"RS.err");await x.ctx.unroute('**/auth/v1/**');const r2=await sync(x);
  rec('SES-03','انقطاع الشبكة وقت تجديد الرمز: تبقى الجلسة (لا تسجيل خروج)، وتنجح المزامنة لاحقًا',r==='err'&&ses===true&&err==='net'&&r2==='ok',JSON.stringify({r,ses,err,r2}));await x.ctx.close()}
 /* ---- ساعة متقدمة جدًا ترفضها المزامنة بوضوح ---- */
 {const x=await device();await x.evaluate(SEED);await up(x,email('c'));await sync(x);await x.evaluate(()=>{const o=Date.now;Date.now=()=>o()+3*864e5});await edit(x,"S.bw['2026-11-22']=54");const r=await sync(x);const err=await get(x,"RS.err");
  rec('CLK-01','ساعة جهاز متقدمة بأيام: يرفضها الخادم (لا تفوز بكل التعارضات) وتظهر رسالة واضحة والبيانات محلية سليمة',r==='err'&&err==='clock'&&(await get(x,"S.bw['2026-11-22']"))===54,JSON.stringify({r,err}));await x.ctx.close()}
 /* ---- واجهة الحذف والمسح: التأكيد المزدوج، والمسح المحلي مستقل عن السحابة ---- */
 {const e8=email('u');const w=await device();await w.evaluate(SEED);await up(w,e8);await edit(w,"S.bw['2026-11-15']=58");await sync(w);const uid=await uidOf(w);
  await w.evaluate(()=>{S.tab='me';S.sub='set';render()});const html=await w.evaluate(()=>document.body.innerText);
  const has=html.includes('حذف نسخة المزامنة السحابية')&&html.includes('مسح بيانات هذا الجهاز')&&html.includes(e8);
  await w.click('[data-a=rsdelq]');const conf=await w.evaluate(()=>document.body.innerText.includes('تأكيد حذف النسخة السحابية'));const rowsBefore=dbq(`select count(*) from public.sync_records where user_id='${uid}'`);
  await w.click('[data-a=rsdelc]');const gone=await w.evaluate(()=>!document.body.innerText.includes('تأكيد حذف النسخة السحابية'));const rowsAfterCancel=dbq(`select count(*) from public.sync_records where user_id='${uid}'`);
  rec('UI-01','بطاقة المزامنة تعرض الحساب وخياري الحذف والمسح المستقلين؛ الحذف يحتاج تأكيدًا والإلغاء لا يحذف شيئًا',has&&conf&&gone&&rowsBefore===rowsAfterCancel&&Number(rowsBefore)>10,JSON.stringify({has,conf,gone,rowsBefore,rowsAfterCancel}));
  await w.click('[data-a=rswipeq]');const wc=await w.evaluate(()=>document.body.innerText.includes('تأكيد مسح بيانات هذا الجهاز'));await w.click('[data-a=rswipec]');const stillThere=await get(w,"S.bw['2026-11-15']");
  await Promise.all([w.waitForNavigation(),w.click('[data-a=rswipeq]').then(()=>w.click('[data-a=rswipe]'))]);await w.waitForFunction(()=>typeof S!=='undefined');
  const after=await get(w,"({bw:Object.keys(S.bw).length,ses:!!SB.ses,fit1:localStorage.getItem('fit1')===null||JSON.parse(localStorage.getItem('fit1')).bw&&Object.keys(JSON.parse(localStorage.getItem('fit1')).bw).length===0})");const cloud=dbq(`select count(*) from public.sync_records where user_id='${uid}'`);
  rec('UI-02','مسح بيانات الجهاز: يحتاج تأكيدًا، يمسح المحلي ويُخرج الحساب، ولا يمسّ النسخة السحابية',wc&&stillThere===58&&after.bw===0&&after.ses===false&&cloud===rowsBefore,JSON.stringify({wc,stillThere,after,cloud,rowsBefore}));await w.ctx.close()}
 /* ---- التراجع: إزالة إعداد Supabase من التطبيق تُبقي بيانات الجهاز سليمة ويعمل التطبيق بالنمط القديم ---- */
 {const keep=await get(d1,"S.bw['2026-11-01']");cfgMode='legacy';await d1.reload();await d1.waitForFunction(()=>typeof S!=='undefined');
  const rb=await get(d1,"({bw:S.bw['2026-11-01'],rsOn:rsOn(),sb:SB.on()})");cfgMode='full';
  rec('RB-01','تراجع العميل: بدون إعداد Supabase يعمل التطبيق ببياناته المحلية كاملة (لا حذف ولا إعادة ضبط)',keep===80&&rb.bw===80&&rb.rsOn===false&&rb.sb===false,JSON.stringify({keep,rb}))}
 /* ---- أخطاء JS ---- */
 rec('RS-09','لا أخطاء JavaScript أثناء كل السيناريوهات',d1.errs.length===0&&d2.errs.length===0,JSON.stringify([...d1.errs,...d2.errs].slice(0,3)));
}catch(e){rec('RS-FATAL','استثناء غير متوقع في الاختبار',false,String(e&&e.stack||e).slice(0,600))}
await b.close();sb.close();wk.close();st.close();
fs.writeFileSync(process.env.OUT||'/tmp/sync-results.json',JSON.stringify(results,null,1));
const f=results.filter(r=>r.result!=='PASS').length;console.log('\n'+(results.length-f)+' PASS / '+f+' FAIL');process.exit(f?1:0);
