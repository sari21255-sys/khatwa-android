// اختبارات المزامنة على مستوى السجل: متصفحان (جهازان) ↔ Supabase وهمي ↔ Postgres حقيقي (دوال P1). بيانات اصطناعية فقط.
// الاستعمال: PSQL="psql -h localhost -U postgres -d t1 -q -At" NODE_PATH=$(npm root -g) node tests/sync.e2e.mjs
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
import W from '../worker/ai-proxy.js';import {startMock,dbq} from './mock-supabase.mjs';
const {chromium}=createRequire(import.meta.url)(path.join(process.env.NODE_PATH||'','playwright'));
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),WWW=ROOT+'/www';
const results=[];const rec=(id,name,ok,ev)=>{results.push({id,name,result:ok?'PASS':'FAIL',evidence:ev});console.log((ok?'PASS ':'FAIL ')+id+' '+name+(ok?'':' — '+ev))};
const sb=await startMock(8791);
// وسيط قديم (وضع الانتقال) بذاكرة KV لاختبار ترحيل اللقطات القديمة
const kvm=new Map();const KV={get:async(k,t)=>{const v=kvm.get(k);return v==null?null:(t==='json'?JSON.parse(v):v)},put:async(k,v)=>kvm.set(k,String(v)),delete:async k=>{kvm.delete(k)}};
const wenv={STATE:KV,ANTHROPIC_API_KEY:'k',ALLOW_ORIGIN:'http://127.0.0.1:8790',AUTH_MODE:'transition'};
const wk=http.createServer((q,res)=>{const ch=[];q.on('data',c=>ch.push(c));q.on('end',async()=>{const r=await W.fetch(new Request('http://w'+q.url,{method:q.method,headers:q.headers,body:['GET','HEAD'].includes(q.method)?undefined:Buffer.concat(ch)}),wenv);const h={};r.headers.forEach((v,k)=>h[k]=v);res.writeHead(r.status,h);res.end(Buffer.from(await r.arrayBuffer()))})}).listen(8792);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
const st=http.createServer((q,res)=>{let f=q.url.split('?')[0];if(f==='/')f='/index.html';
 if(f==='/config.js'){res.writeHead(200,{'content-type':'text/javascript'});return res.end(`window.APP_CONFIG={${cfgMode==='full'?'sbUrl:"http://127.0.0.1:8791",sbKey:"anon",':''}syncUrl:"http://127.0.0.1:8792/api/state",aiUrl:"http://127.0.0.1:8792/api/ai"};`)}
 const p=path.join(WWW,f);if(!p.startsWith(WWW)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){res.writeHead(404);return res.end()}res.writeHead(200,{'content-type':MIME[path.extname(p)]||'application/octet-stream'});res.end(fs.readFileSync(p))}).listen(8790);
let cfgMode='full';const A='http://127.0.0.1:8790';const b=await chromium.launch();
const SEED=`S.prof.ob=1;S.prof.name='اختبار';S.prof.sex='m';S.prof.age=30;S.prof.ht=178;S.prof.startW=85;S.prof.goalType='lose';calcTargets();genPlan();save();`;
async function device(){const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(A+'/');await p.waitForFunction(()=>typeof S!=='undefined'&&typeof rsSync==='function');p.errs=errs;p.ctx=c;return p}
const email=n=>`u${Date.now()}${n}@test.invalid`;
const edit=async(p,js)=>{await p.evaluate(js+';save();0');await p.waitForTimeout(300)};
const sync=p=>p.evaluate(()=>rsSync());
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
