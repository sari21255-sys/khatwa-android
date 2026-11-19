/* التسجيل السريع: خطتي بتبويبين، تسجيل الأداء بتاريخ سابق، الشاملة، الترحيل. بيانات اصطناعية. */
const {chromium}=require('playwright'),path=require('path');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let fail=0;const ok=(c,m,x)=>{if(c)console.log('  ok   '+m);else{fail++;console.log('  FAIL '+m+(x?'  ['+x+']':''))}};
const seed=()=>{S.prof.ob=1;S.prof.name='مختبر';S.prof.sex='m';S.prof.age=30;S.prof.ht=178;S.prof.startW=85;S.prof.goalType='lose';S.prof.lvl='b';S.prof.eq='gym';S.prof.dpw=7;S.bw[TD()]=85;calcTargets();genPlan();save()};
(async()=>{const b=await chromium.launch();
 const mk=async(o)=>{o=o||{};const ctx=await b.newContext(Object.assign({viewport:{width:390,height:844},timezoneId:'Asia/Riyadh'},o.ctx||{}));
  if(o.native)await ctx.addInitScript(o.native);
  await ctx.clock.install({time:new Date('2026-11-16T10:00:00+03:00')});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.goto('file://'+file);await p.waitForFunction(()=>typeof qSave==='function');if(!o.noseed){await p.evaluate(seed);await p.reload();await p.waitForFunction(()=>S.prof.ob===1)}await p.waitForTimeout(300);return{ctx,p}};
 const go=async(p,tab,sub)=>{await p.evaluate(([t,s])=>{S.tab=t;S.sub=s||null;UI.trk='hub';render()},[tab,sub]);await p.waitForTimeout(150)};

 const plan=async(p,t)=>{await p.evaluate(t=>{S.tab='train';S.sub=null;UI.trk='irs';UI.qt=t||'cur';UI.qd=TD();UI.qx=null;render()},t);await p.waitForTimeout(150)};
 const txt=p=>p.evaluate(()=>document.body.innerText);
 console.log('1) خطتي: تبويبان وإضافة تمرين مرة واحدة في الشاملة');
 {const {ctx,p}=await mk();await plan(p);
  const tabs=await p.$$eval('.irtabs button',a=>a.map(x=>x.textContent.trim()));
  ok(tabs.join('|')==='الخطة الحالية|الخطة الشاملة','التبويبان: '+tabs.join('|'));
  ok(!/ابدأ الحصة|استئناف|إنهاء الحصة|أنهِ/.test(await txt(p)),'لا أزرار بدء أو استئناف أو إنهاء');
  const di=await p.evaluate(()=>qDi(TD()));
  await p.evaluate(d=>{S.plan[d].ex=[];render()},di);
  await p.fill('#ir-an','سحب أرضي بالبار');await p.evaluate(()=>{});
  await p.click('[data-a=qadd]');await p.waitForTimeout(150);
  await p.fill('#ir-an','سحب أرضي بالبار');await p.click('[data-a=qadd]');await p.waitForTimeout(150);
  ok(await p.evaluate(d=>S.plan[d].ex.length,di)===1,'التكرار لا يضيف صفًا ثانيًا');
  await plan(p,'all');
  const rows=await p.$$eval('.qar',a=>a.map(x=>x.innerText));
  ok(rows.filter(x=>/سحب أرضي بالبار/.test(x)).length===1,'يظهر مرة واحدة في الشاملة');
  ok(/لم يُسجّل أداء بعد/.test(rows.find(x=>/سحب أرضي/.test(x))||''),'«لم يُسجّل أداء بعد»');
  ok(/في الخطة الحالية/.test(rows.find(x=>/سحب أرضي/.test(x))||''),'علامة ضمن الخطة الحالية');
  await ctx.close()}

 console.log('2) تسجيل الأداء بتاريخ حالي وسابق، الأرقام القياسية، التصحيح والحذف');
 {const {ctx,p}=await mk();await plan(p);
  const di=await p.evaluate(()=>qDi(TD()));
  await p.evaluate(d=>{S.plan[d].ex=[];irPlanAdd(d,'سحب أرضي بالبار',3,5,0);render()},di);
  const xv=await p.evaluate(()=>irXv('سحب أرضي بالبار'));
  /* اليوم: مجموعتان بوزنين مختلفين */
  await p.click('[data-a=qxopen]');await p.waitForTimeout(100);
  await p.fill('[data-qr="0,w"]','100');await p.fill('[data-qr="0,r"]','5');
  await p.click('[data-a=qradd]');await p.waitForTimeout(80);
  await p.fill('[data-qr="1,w"]','110');await p.fill('[data-qr="1,r"]','3');
  await p.click('[data-a=qxsave]');await p.waitForTimeout(150);
  let n=await p.evaluate(x=>qSets(TD(),x).length,xv);ok(n===2,'حُفظت مجموعتان بوزنين مختلفين',n);
  ok(await p.evaluate(()=>!!S.sx['sxql-'+TD()]&&S.sx['sxql-'+TD()].st==='c'),'سجل اليوم مكتمل بلا بدء حصة');
  /* تاريخ سابق */
  await p.evaluate(()=>{UI.qd='2026-11-10';UI.qx=null;render()});
  await p.evaluate(x=>{qSave('2026-11-10',x,'سحب أرضي بالبار',[{w:120,r:4},{w:120,r:4}])},xv);
  ok(await p.evaluate(x=>{const r=qRefLast(x,TD(),'w');return r&&r.date==='2026-11-10'&&r.sets.length===2},xv),'المرجع لليوم = آخر أداء سابق (10 نوفمبر)');
  const A=await p.evaluate(()=>{const e=qAll();const k=Object.keys(e).find(k=>/سحب/.test(e[k].n));return{max:e[k].max,rec:e[k].rec.map(q=>q.date+':'+q.w+'x'+q.r),n:e[k].sets.length,last:e[k].lastDate}});
  ok(A.max.w===120&&A.max.date==='2026-11-10','الأقصى 120 بتاريخ 10 (سجل سابق)',JSON.stringify(A));
  ok(A.rec.join()==='2026-11-10:120x4','سجل الأرقام القياسية مرتّب بالتاريخ',A.rec.join());
  ok(A.last===await p.evaluate(()=>TD())&&A.n===4,'آخر تسجيل اليوم و4 مجموعات',JSON.stringify(A));
  /* تصحيح أعلى وزن */
  const sid=await p.evaluate(x=>{const h=qSets('2026-11-10',x)[0];return{s:h.s.id,k:h.x.k,i:sxSid(h.q)}},xv);
  await p.evaluate(([s,x])=>{irEditSet(s.s,s.k,s.i,125,4)},[sid,xv]);
  ok(await p.evaluate(()=>{const e=qAll(),k=Object.keys(e).find(k=>/سحب/.test(e[k].n));return e[k].max.w===125}),'التصحيح يعيد حساب الأقصى');
  await p.evaluate(x=>{qSave('2026-11-10',x,'سحب أرضي بالبار',[])},xv);
  const A2=await p.evaluate(()=>{const e=qAll(),k=Object.keys(e).find(k=>/سحب/.test(e[k].n));return e[k].max.w+':'+e[k].sets.length});
  ok(A2==='110:2','حذف مجموعات 10 يعيد الأقصى إلى 110 والمجموعات 2',A2);
  /* إزالة من الجدول تُبقي التاريخ */
  await p.evaluate(d=>{S.plan[d].ex=[];render()},di);
  await plan(p,'all');
  const r=(await p.$$eval('.qar',a=>a.map(x=>x.innerText))).find(x=>/سحب أرضي بالبار/.test(x))||'';
  ok(r&&!/في الخطة الحالية/.test(r)&&/110/.test(r),'بعد الإزالة يبقى في الشاملة بتاريخه وبلا علامة الخطة',r.slice(0,80));
  /* توسيع: السجل الكامل */
  await p.click('.qar[data-xv="'+xv+'"] .qarh');await p.waitForTimeout(100);
  ok(/سجل الأرقام القياسية/.test(await txt(p)),'التوسيع يعرض سجل الأرقام القياسية');
  await p.click('[data-a=qfull]');await p.waitForTimeout(100);
  ok((await p.$$eval('#q-full .irset',a=>a.length))===2,'كامل سجل الأداء يعرض كل المجموعات');
  ok(!p.errs.length,'لا أخطاء صفحة',p.errs.join('|'));
  await ctx.close()}

 console.log('3) ترحيل الحصص القديمة والجزئية');
 {const {ctx,p}=await mk();
  await p.evaluate(()=>{S.sx.old1={id:'old1',wk:wkey('2026-11-09'),date:'2026-11-09',ts:Date.parse('2026-11-09T09:00:00'),up:1,dy:2,kd:'t',t:'تمرين',st:'p',sec:0,vol:0,u:'l:guest',ex:[{k:'k1',id:'a1',n:'بنش بريس بالبار',d:2,tg:3,tr:8,o:0,sets:[{i:'s1',w:60,r:8,ty:'n',rp:0,at:1,up:1}],rm:[],dn:0,sk:0}]};save()});
  await p.reload();await p.waitForFunction(()=>typeof qSave==='function');await p.waitForTimeout(300);
  const s=await p.evaluate(()=>({st:S.sx.old1.st,id:S.sx.old1.id,sets:S.sx.old1.ex[0].sets.map(q=>q.i)}));
  ok(s.st==='c'&&s.id==='old1'&&s.sets.join()==='s1','الحصة الجزئية صارت مكتملة بمعرّفها ومجموعتها');
  ok(await p.evaluate(()=>{const e=qAll(),k=Object.keys(e).find(k=>/بنش/.test(e[k].n));return k&&e[k].max.w===60&&e[k].max.date==='2026-11-09'}),'تدخل التقارير والشاملة بتاريخها');
  await ctx.close()}

 console.log('4) تسجيل مباشر لكل الرياضات، ويوم التدريب مرة واحدة');
 {const {ctx,p}=await mk();
  const tr=async k=>{await p.evaluate(k=>{S.tab='train';S.sub=null;UI.trk=k;UI.qd=TD();render()},k);await p.waitForTimeout(150)};
  await tr('hub');let t=await txt(p);
  ok(!/ابدأ أول حصة|ابدأ تمرين اليوم|عوّض تمرينًا|لم تبدأ بعد|جلسات مكتملة/.test(t),'صفحة التدريب بلا «ابدأ»');
  ok(/سجّل أداء اليوم/.test(t)||/سجّل أول نشاط/.test(t),'أزرار تسجيل بدل البدء');
  await tr('run');ok(!/ابدأ الآن|ابدأ</.test(await txt(p)),'صفحة الجري بلا بدء');
  await p.fill('[data-tf=mmrun]','32');await p.fill('[data-tf=mlrun]','5.2');await p.click('#q-tk-save');await p.waitForTimeout(150);
  let r=await p.evaluate(()=>{const s=SJ().ss.filter(x=>x.k==='run');return{n:s.length,d:s[0]&&s[0].day,km:s[0]&&s[0].res.km,acc:s[0]&&s[0].acc,st:s[0]&&s[0].st}});
  ok(r.n===1&&r.d==='2026-11-16'&&r.km===5.2&&r.acc===1920000&&r.st==='done','جري: يحفظ المدة والمسافة بتاريخ اليوم',JSON.stringify(r));
  /* تاريخ سابق */
  await p.evaluate(()=>{UI.qd='2026-11-15';render()});await p.fill('[data-tf=mmrun]','20');await p.fill('[data-tf=mlrun]','3');await p.click('#q-tk-save');await p.waitForTimeout(100);
  ok(await p.evaluate(()=>SJ().ss.filter(x=>x.k==='run'&&x.day==='2026-11-15').length)===1,'جري بتاريخ سابق');
  await tr('swim');await p.fill('[data-tf=mmswim]','40');await p.fill('[data-tf=mlswim]','1200');await p.click('#q-tk-save');await p.waitForTimeout(100);
  ok(await p.evaluate(()=>{const s=SJ().ss.find(x=>x.k==='swim');return s&&s.res.dist===1200&&s.acc===2400000}),'سباحة: مسافة ومدة');
  await tr('cali');await p.fill('[data-qc="0,v"]','12');await p.click('[data-a=qcdup]');await p.waitForTimeout(80);await p.fill('[data-qc="1,v"]','10');await p.click('#q-tk-save');await p.waitForTimeout(100);
  ok(await p.evaluate(()=>{const s=SJ().ss.find(x=>x.k==='cali');return s&&s.d.ents.length===2&&s.d.ents[0].val===12&&s.d.ents[1].val===10}),'كالسثينكس: مجموعتان بتكرارين مختلفين');
  await tr('fn');await p.fill('[data-tf=fr]','5');await p.fill('[data-tf=fx]','7');await p.click('#q-tk-save');await p.waitForTimeout(100);
  ok(await p.evaluate(()=>{const s=SJ().ss.find(x=>x.k==='fn');return s&&s.res.fmt==='amrap'&&s.res.rounds===5&&s.res.extra===7}),'كروسفت AMRAP: جولات وتكرارات');
  /* حديد في نفس اليوم: اليوم يُحسب مرة واحدة */
  await p.evaluate(()=>{const di=qDi(TD());S.plan[di].ex=[];irPlanAdd(di,'سكوات',3,5,0);qSave(TD(),irXv('سكوات'),'سكوات',[{w:100,r:5}]);qSave(TD(),irXv('سكوات'),'سكوات',[{w:100,r:5},{w:90,r:6}])});
  const wd=await p.evaluate(()=>({n:wkDays().n,dates:[...qTrainDays(W())].sort().join()}));
  ok(wd.dates==='2026-11-15,2026-11-16'&&wd.n===2,'أيام التدريب: 12 و16 فقط رغم تعدد الإدخالات',JSON.stringify(wd));
  await p.evaluate(()=>{S.tab='dash';S.sub=null;UI.trk='hub';render()});await p.evaluate(()=>{S.tab='train';render()});
  ok(/أيام تدريب/.test(await txt(p)),'الهدف الأسبوعي «أيام تدريب»');
  ok(!p.errs.length,'لا أخطاء صفحة',p.errs.join('|'));
  await ctx.close()}
 await b.close();console.log(fail?'FAILED '+fail:'all PASS');process.exit(fail?1:0)})();
