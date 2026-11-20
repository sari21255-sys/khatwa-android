// مزامنة سجل الجلسات (S.sx) بجهازين + 50 دورة عشوائية. Supabase وهمي ↔ Postgres حقيقي (دوال P1). بيانات اصطناعية فقط. SEED=عدد لإعادة تشغيل متسلسلة محددة.
// الاستعمال: PSQL="psql -h localhost -U postgres -d t1 -q -At" NODE_PATH=$(npm root -g) node tests/sync-sx.e2e.mjs
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
const SEEDJS=`S.plan=eval(`+JSON.stringify('(()=>{const d=()=>({t:"يوم",ex:[E("بنش",3,8,40),E("سحب",3,10,30)]});return[0,1,2,3,4,5,6].map(d)})()')+`);S.prof.ob=1;S.prof.name='اختبار';S.prof.sex='m';S.prof.age=30;S.prof.ht=178;S.prof.startW=85;S.prof.goalType='lose';calcTargets();genPlan();rdS().geoAsked=1;save();`;
/* الإزاحة نفسها لكل الأجهزة (فلا يختل ترتيب الأحدث-يفوز) والغاية يوم تمرين لا يوم راحة */
const SHIFT=((new Date().getUTCDay()+6)%7)*86400000;
async function device(){const c=await b.newContext({viewport:{width:390,height:844}});await c.clock.install({time:new Date(Date.now()-SHIFT)});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(A+'/');await p.waitForFunction(()=>typeof S!=='undefined'&&typeof rsSync==='function');p.errs=errs;p.ctx=c;return p}
const email=n=>`u${Date.now()}${n}@test.invalid`;
const edit=async(p,js)=>{await p.evaluate(js+';save();0');await p.waitForTimeout(300)};
/* ينتظر انتهاء أي مزامنة جارية (مثل مزامنة الإقلاع بعد إعادة التحميل) قبل أن يشغّل مزامنته، وإلا ردّ rsSync بـ«busy» دون عمل */
const sync=p=>p.evaluate(async()=>{const idle=async()=>{for(let i=0;i<100&&RS.busy;i++)await new Promise(r=>setTimeout(r,100))};await idle();const o=await rsSync();await idle();return o});
const get=(p,expr)=>p.evaluate(expr);
/* بعد الدخول يُنقل الجهاز إلى مساحة الحساب (مساحة الزائر لا تزامن أبدًا) ثم يُعاد التحميل كما يفعل التطبيق */
const toAcct=async p=>{const had=await p.evaluate(()=>!!window.H);await p.evaluate(()=>{save();localStorage.setItem('fit_space',JSON.stringify({a:'u_'+SB.uid()}))});await p.reload();await p.waitForFunction(()=>typeof rsSync==='function'&&typeof S!=='undefined');await p.waitForTimeout(250);if(had)await p.evaluate(HELP);return 1};
const up=async(p,e)=>{await p.evaluate(e=>SB.up(e,'password123','t').then(()=>1),e);return toAcct(p)};
const login=async(p,e)=>{await p.evaluate(e=>SB.in(e,'password123').then(()=>1),e);return toAcct(p)};
const uidOf=p=>p.evaluate(()=>SB.uid());

/* ---- أدوات داخل الصفحة ---- */
const SETUP=`(()=>{S.plan=eval('(()=>{const d=()=>({t:"يوم",ex:[E("بنش",3,8,40),E("سحب",3,10,30)]});return[0,1,2,3,4,5,6].map(d).map(p=>{p.ex.forEach((e,i)=>{e.id="e"+i});return p})})()');S.prof.ob=1;S.prof.name='مختبر';S.prof.sex='m';S.prof.age=30;S.prof.ht=178;S.prof.startW=85;S.prof.goalType='lose';save()})()`;
const HELP=`window.H={
 sess:()=>sxList().map(s=>s),
 start:()=>{const ks=dayKeys(TI());const s=sxNew(ks);save();return s.id},
 add:(id,ei,w,r,ty)=>{const s=S.sx[id],x=s.ex[ei],now=Date.now();x.sets.push({i:sxRid(),w:w,r:r,ty:ty||'n',rp:0,at:now,up:now});s.up=now;sxReconcile(s);save();return x.sets[x.sets.length-1].i},
 undo:(id,ei)=>{const s=S.sx[id],x=s.ex[ei],ws=x.sets.filter(q=>q.ty!=='w'),l=ws[ws.length-1];if(!l)return null;x.sets.splice(x.sets.indexOf(l),1);x.rm=(x.rm||[]).concat([sxSid(l)]);if(x.dn){x.dn=0;delete S.done[x.k]}if(s.st==='c'){s.st='p';delete s.fin}s.up=Date.now();save();return sxSid(l)},
 edit:(id,ei,si,w)=>{const q=S.sx[id].ex[ei].sets[si];q.w=w;q.up=Date.now();S.sx[id].up=Date.now();save()},
 snap:()=>JSON.stringify(Object.values(S.sx).map(s=>sxCanon(s)).sort((a,b)=>a.id<b.id?-1:1)),
 ids:()=>{const o={};Object.values(S.sx).forEach(s=>s.ex.forEach(x=>x.sets.forEach(q=>{o[sxSid(q)]=1})));return Object.keys(o).sort()},
 done:()=>Object.keys(S.done).sort(),
 inv:()=>{const bad=[];Object.values(S.sx).forEach(s=>s.ex.forEach(x=>{const cnt=sxCnt(x),want=cnt>=x.tg||!!S.done[x.k];if((x.dn?1:0)!==(want?1:0))bad.push(x.k+':dn='+x.dn+' cnt='+cnt+' done='+!!S.done[x.k])}));return bad}
}`;
const sess=async p=>p.evaluate(()=>H.snap());
/* يزامن بالتناوب حتى يستقر الجهازان: بلا سجلات معلّقة وبصمة الجلسات وS.done متطابقة في دورتين متتاليتين (سقف 12 دورة). يعيد عدد الدورات */
const pend=p=>p.evaluate('Object.values(RSM.rec).filter(v=>v.p).length');
const settle=async(a,c)=>{let ok=0,i=0;for(;i<12&&ok<2;i++){await sync(a);await sync(c);const same=(await sess(a))===(await sess(c))&&(await a.evaluate('JSON.stringify(H.done())'))===(await c.evaluate('JSON.stringify(H.done())'))&&!(await pend(a))&&!(await pend(c));ok=same?ok+1:0}return i};
try{
 const em=email('s');const d1=await device(),d2=await device();
 for(const d of[d1,d2]){await d.evaluate(SETUP);await d.evaluate(HELP)}
 await up(d1,em);await login(d2,em);await sync(d1);await sync(d2);
 await d2.evaluate(SETUP);await d2.evaluate(HELP);   // الخطة نفسها على الجهازين (الخادم قد يرسل خطة الجهاز الأول)
 await settle(d1,d2);
 const planSig=p=>p.evaluate("JSON.stringify(S.plan.map(d=>[d.t,d.ex.map(e=>[e.id,e.n,e.s,e.r,e.w])]))");
 const equalPlan=async()=>(await planSig(d1))===(await planSig(d2));
 rec('SX-00','الجهازان على الخطة نفسها قبل الاختبار',await equalPlan(),'');

 /* SX-01: جلسة جزئية على الأول تُستكمل على الثاني */
 {const id=await d1.evaluate("H.start()");await d1.evaluate(i=>H.add(i,0,50,8,'d'),id);await settle(d1,d2);
  const seen=await d2.evaluate(i=>{const s=S.sx[i];return s?{st:s.st,n:sxCnt(s.ex[0]),part:!!sxPart(TI()),hero:/أكمل التمرين/.test(sxHero(0,0).btn)}:null},id);
  rec('SX-01a','الجلسة الجزئية تصل الجهاز الثاني وتظهر مجموعاتها المحفوظة (بلا زر استئناف)',!!seen&&seen.st==='p'&&seen.n===1&&seen.part&&!seen.hero,JSON.stringify(seen));
  await d2.evaluate(i=>{H.add(i,0,52,8,'n');H.add(i,0,54,8,'f');H.add(i,1,30,10);H.add(i,1,30,10);H.add(i,1,30,10)},id);await settle(d1,d2);
  const r1=await d1.evaluate(i=>({st:S.sx[i].st,cnt:S.sx[i].ex.map(x=>sxCnt(x)),first:S.sx[i].ex[0].sets[0],done:Object.keys(S.done).length,inv:H.inv()}),id);
  rec('SX-01b','استكمال الجلسة على الثاني: تكتمل على الأول، المجموعة الأولى (RPE/نوع/وزن) محفوظة، S.done مرة واحدة لكل تمرين',r1.st==='c'&&r1.cnt.join()==='3,3'&&r1.first.ty==='d'&&r1.first.w===50&&r1.done===2&&r1.inv.length===0,JSON.stringify(r1));
  rec('SX-01c','الجلسة متطابقة على الجهازين',(await sess(d1))===(await sess(d2)),'');}

 /* SX-02: مجموعتان مختلفتان للجلسة نفسها أثناء الانقطاع */
 {await d1.evaluate(()=>{Object.keys(S.sx).forEach(k=>delete S.sx[k]);Object.keys(S.done).forEach(k=>delete S.done[k]);save()});await settle(d1,d2);
  await d2.evaluate(()=>{Object.keys(S.sx).forEach(k=>delete S.sx[k]);save()});await settle(d1,d2);
  const id=await d1.evaluate("H.start()");await d1.evaluate(i=>H.add(i,0,40,8),id);await settle(d1,d2);
  const a=await d1.evaluate(i=>H.add(i,0,42,8),id),c=await d2.evaluate(i=>H.add(i,1,30,10),id);   // انقطاع: كلٌّ يسجّل وحده
  await settle(d1,d2);
  const r=await d1.evaluate(i=>({ids:H.ids().length,ex0:S.sx[i].ex[0].sets.length,ex1:S.sx[i].ex[1].sets.length}),id),r2=await d2.evaluate(i=>({ids:H.ids().length,ex0:S.sx[i].ex[0].sets.length,ex1:S.sx[i].ex[1].sets.length}),id);
  const RR=p=>p.evaluate('JSON.stringify(Object.entries(RSM.rec).filter(([k])=>/^sx/.test(k)).map(([k,v])=>[k.slice(3,9),v.t,String(v.h).slice(0,5),v.p,v.x,v.d]))');
  rec('SX-02','مجموعتان من جهازين أثناء الانقطاع (تمرينان مختلفان): الاثنتان محفوظتان على الجهازين وبلا فقد للأولى',r.ex0===2&&r.ex1===1&&JSON.stringify(r)===JSON.stringify(r2)&&(await sess(d1))===(await sess(d2)),JSON.stringify({r,r2,rec1:await RR(d1),rec2:await RR(d2),err:[await d1.evaluate('RS.err'),await d2.evaluate('RS.err')],srv:dbq("select left(kind,3)||' '||left(rid,6)||' '||ts||' '||coalesce(dev,'') from public.sync_records where kind='sx' order by ts")}));
  const a2=await d1.evaluate(i=>H.add(i,0,44,8),id),c2=await d2.evaluate(i=>H.add(i,0,45,8),id);const settleRounds=await settle(d1,d2);
  const q=await d1.evaluate(i=>S.sx[i].ex[0].sets.map(s=>s.w),id);
  const s1=await sess(d1),s2=await sess(d2),dd1=await d1.evaluate('H.done()'),dd2=await d2.evaluate('H.done()');
  const W=p=>p.evaluate(i=>JSON.stringify(S.sx[i].ex.map(x=>x.sets.map(q=>q.w))),id),RR3=p=>p.evaluate('JSON.stringify(Object.entries(RSM.rec).filter(([k])=>/^sx/.test(k)).map(([k,v])=>[k.slice(-4),v.t,String(v.h).slice(0,4),v.p,v.x,String(v.d).slice(-3)]))');
  rec('SX-03','المجموعة التالية نفسها على جهازين أثناء الانقطاع: تظهر مجموعتان (لا تُحذف إحداهما) ويكتمل التمرين مرة واحدة',q.length===4&&s1===s2&&JSON.stringify(dd1)===JSON.stringify(dd2),JSON.stringify({q,same:s1===s2,rounds:settleRounds,w1:await W(d1),w2:await W(d2),rec1:await RR3(d1),rec2:await RR3(d2),srv:dbq("select ts||' '||right(coalesce(dev,''),3) from public.sync_records where kind='sx' order by ts desc limit 3"),err:[await d1.evaluate('RS.err'),await d2.evaluate('RS.err')]}));
  /* SX-04: تعارض تعديل المجموعة نفسها: الأحدث يفوز */
  const sid=await d1.evaluate(i=>S.sx[i].ex[0].sets[0].i,id);
  await d1.evaluate(i=>H.edit(i,0,0,60),id);await new Promise(r=>setTimeout(r,30));await d2.evaluate(i=>H.edit(i,0,0,62),id);
  await sync(d1);await settle(d2,d1);
  const w1=await d1.evaluate((i,s)=>S.sx[i].ex[0].sets.find(q=>q.i===s).w,id,sid).catch(()=>null);
  const wa=await d1.evaluate(([i,s])=>S.sx[i].ex[0].sets.find(q=>q.i===s).w,[id,sid]),wb=await d2.evaluate(([i,s])=>S.sx[i].ex[0].sets.find(q=>q.i===s).w,[id,sid]);
  rec('SX-04','تعديل المجموعة نفسها على الجهازين: الأحدث (62) يفوز على الجهازين',wa===62&&wb===62,JSON.stringify({wa,wb}));
  /* SX-05: حذف (تراجع) على جهاز وإضافة على آخر */
  const gone=await d1.evaluate(i=>H.undo(i,1),id),added=await d2.evaluate(i=>H.add(i,1,31,10),id);await settle(d1,d2);
  const ids=await d2.evaluate(()=>H.ids()),ids1=await d1.evaluate(()=>H.ids()),t1=await sess(d1),t2=await sess(d2);
  rec('SX-05','تراجع على جهاز وإضافة على آخر: المحذوفة تبقى محذوفة والمضافة تبقى',!ids.includes(gone)&&ids.includes(added)&&t1===t2,JSON.stringify({gone,added,in2:ids,in1:ids1,same:t1===t2,t1:t1===t2?'':t1.slice(0,1200),t2:t1===t2?'':t2.slice(0,1200)}));
 }

 /* SX-04b: تعادل تعديل المجموعة نفسها في اللحظة نفسها (up متطابق)، بالترتيبين، مع إعادة تحميل وإعادة إرسال */
 {const id=await d1.evaluate(()=>{const s=sxList()[0];return s&&s.id}),sid=await d1.evaluate(i=>S.sx[i].ex[0].sets[0].i,id);
  const setW=(d,w,T)=>d.evaluate(([i,s,w,T])=>{const q=S.sx[i].ex[0].sets.find(x=>x.i===s);q.w=w;q.up=T;S.sx[i].up=T;sxReconcile(S.sx[i]);S.sx[i].vol=sxVol(S.sx[i]);save()},[id,sid,w,T]);
  const wOf=d=>d.evaluate(([i,s])=>S.sx[i].ex[0].sets.find(q=>q.i===s).w,[id,sid]);
  const volOf=d=>d.evaluate(i=>({v:S.sx[i].vol,d:sxVol(S.sx[i])}),id);
  const T1=Date.now()+60000;
  await setW(d1,30,T1);await setW(d2,40,T1);await sync(d1);await settle(d2,d1);
  let a=await wOf(d1),b=await wOf(d2);
  rec('SX-04b1','تعادل 30 (جهاز 1) و40 (جهاز 2) في اللحظة نفسها: 40 على الجهازين',a===40&&b===40,JSON.stringify({a,b}));
  /* عكس ترتيب الوصول: الجهاز 2 يرسل أولًا */
  const T2=T1+60000;await setW(d1,31,T2);await setW(d2,41,T2);await sync(d2);await settle(d1,d2);
  a=await wOf(d1);b=await wOf(d2);rec('SX-04b2','العكس: 31 و41 بالتعادل وبترتيب وصول معاكس: 41 على الجهازين',a===41&&b===41,JSON.stringify({a,b}));
  /* إعادة تحميل الجهازين ثم مزامنة: القيمة لا تتغير والسجل السحابي يتفق */
  for(const d of[d1,d2]){await d.reload();await d.waitForFunction(()=>typeof S!=='undefined'&&typeof rsSync==='function');await d.evaluate(HELP)}await d1.waitForTimeout(1200);await settle(d1,d2);
  a=await wOf(d1);b=await wOf(d2);rec('SX-04b3','بعد إعادة التحميل وإعادة الإرسال: 41 على الجهازين وبصمة الجلسة متطابقة',a===41&&b===41&&(await sess(d1))===(await sess(d2)),JSON.stringify({a,b}));
  /* جهاز ثالث نظيف يسحب من السحابة */
  const d3=await device();await d3.evaluate(HELP);await login(d3,em);await sync(d3);await settle(d3,d1);
  const c3=await wOf(d3).catch(()=>null);rec('SX-04b4','جهاز ثالث نظيف يسحب من السحابة: القيمة نفسها (41)',c3===41,String(c3));
  const v1=await volOf(d1),v2=await volOf(d2);rec('SX-04b5','الحجم المخزّن = المشتق من المجموعات على الجهازين',v1.v===v1.d&&v2.v===v2.d&&v1.v===v2.v,JSON.stringify({v1,v2}));
 }

 /* SX-06: 50 دورة عشوائية */
 {await d1.evaluate(()=>{Object.keys(S.sx).forEach(k=>delete S.sx[k]);Object.keys(S.done).forEach(k=>delete S.done[k]);save()});await settle(d1,d2);await d2.evaluate(()=>{Object.keys(S.sx).forEach(k=>delete S.sx[k]);save()});await settle(d1,d2);
  let seed=+(process.env.SEED||20261115);const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const pick=a=>a[Math.floor(rnd()*a.length)];
  const id=await d1.evaluate("H.start()");await settle(d1,d2);
  const live=new Set(),dead=new Set(),bw={};let log=[];
  const D=[d1,d2];
  for(let c=0;c<50;c++){
   const dv=pick(D),n=1+Math.floor(rnd()*3);
   for(let k=0;k<n;k++){const op=rnd();
    if(op<.55){const ei=Math.floor(rnd()*2),sid=await dv.evaluate(([i,e,w])=>H.add(i,e,w,8),[id,ei,Math.round(20+rnd()*60)]);live.add(sid);log.push(c+':add')}
    else if(op<.72){const ei=Math.floor(rnd()*2),sid=await dv.evaluate(([i,e])=>H.undo(i,e),[id,ei]);if(sid){live.delete(sid);dead.add(sid)}log.push(c+':undo')}
    else if(op<.85){const key='2030-01-'+String(c*3+k).padStart(2,'0');bw[key]=70+c;await dv.evaluate(([k2,v])=>{S.bw[k2]=v;save()},[key,70+c]);log.push(c+':bw')}
    else{await dv.evaluate(([i])=>{const s=S.sx[i],x=s.ex[0];if(x.sets.length)H.edit(i,0,0,77)},[id]);log.push(c+':edit')}
   }
   if(rnd()<.6)await sync(pick(D));   // أحيانًا بلا مزامنة: انقطاع
   if(rnd()<.2){await sync(d1);await sync(d2)}
  }
  await settle(d1,d2);await settle(d2,d1);
  const A=await d1.evaluate("H.ids()"),B=await d2.evaluate("H.ids()");
  const missing=[...live].filter(x=>!A.includes(x)||!B.includes(x)),resurrected=[...dead].filter(x=>A.includes(x)||B.includes(x));
  rec('SX-06a','50 دورة عشوائية: لا مجموعة حيّة مفقودة على أي جهاز (seed='+(process.env.SEED||20261115)+')',missing.length===0,JSON.stringify(missing.slice(0,5)));
  rec('SX-06b','50 دورة عشوائية: لا مجموعة محذوفة عادت',resurrected.length===0,JSON.stringify(resurrected.slice(0,5)));
  rec('SX-06c','50 دورة عشوائية: الجهازان متطابقان في الجلسة بالبصمة القانونية',(await sess(d1))===(await sess(d2)),'');
  const bwA=await d1.evaluate(ks=>ks.filter(k=>S.bw[k]==null),Object.keys(bw)),bwB=await d2.evaluate(ks=>ks.filter(k=>S.bw[k]==null),Object.keys(bw));
  rec('SX-06d','50 دورة عشوائية: كل أوزان السجلات المستقلة ('+Object.keys(bw).length+') موجودة على الجهازين',bwA.length===0&&bwB.length===0,JSON.stringify({bwA,bwB}));
  const inv1=await d1.evaluate("H.inv()"),inv2=await d2.evaluate("H.inv()"),dn1=await d1.evaluate("H.done()"),dn2=await d2.evaluate("H.done()");
  rec('SX-06e','50 دورة عشوائية: اتساق الإكمال (dn ↔ المجموعات/S.done) وتطابق S.done على الجهازين',inv1.length===0&&inv2.length===0&&JSON.stringify(dn1)===JSON.stringify(dn2),JSON.stringify({inv1,inv2,dn1,dn2}));
  const st1=await d1.evaluate("RS.err"),st2=await d2.evaluate("RS.err");rec('SX-06f','لا أخطاء مزامنة ظاهرة',!st1&&!st2,JSON.stringify({st1,st2}));
 }
 rec('SX-09','لا أخطاء JavaScript أثناء السيناريوهات',d1.errs.length===0&&d2.errs.length===0,JSON.stringify([...d1.errs,...d2.errs].slice(0,3)));
}catch(e){rec('SX-FATAL','استثناء غير متوقع في الاختبار',false,String(e&&e.stack||e).slice(0,700))}
await b.close();sb.close();wk.close();st.close();
fs.writeFileSync(process.env.OUT||'/tmp/sync-sx-results.json',JSON.stringify(results,null,1));
const f=results.filter(r=>r.result!=='PASS').length;console.log('\n'+(results.length-f)+' PASS / '+f+' FAIL');process.exit(f?1:0);
