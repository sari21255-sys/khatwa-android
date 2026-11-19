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

 console.log('5) منتقيات بيانات الجسم المشتركة');
 {const {ctx,p}=await mk();
  const mkin=async(v)=>{await p.evaluate(v=>{const i=document.createElement('input');i.id='tin';i.value=v;document.body.appendChild(i)},v)};
  /* العمر: حساب قديم بعمر فقط */
  await p.evaluate(()=>{delete S.prof.dob;S.prof.age=30;save()});await mkin('30');
  await p.evaluate(()=>fxDob(document.getElementById('tin')));await p.waitForTimeout(100);
  let t=await p.evaluate(()=>document.getElementById('fx-sheet').innerText);
  ok(/العمر المحفوظ حاليًا/.test(t)&&/30/.test(t),'عمر قديم يظهر للمراجعة بلا فقدان');
  await p.click('[data-fxs]');await p.waitForTimeout(80);
  ok(await p.evaluate(()=>!!document.getElementById('fx-sheet'))&&/اختر اليوم/.test(await p.evaluate(()=>document.getElementById('bp-e').textContent)),'لا حفظ قبل اختيار تاريخ الميلاد');
  ok(await p.evaluate(()=>S.prof.age===30&&!S.prof.dob),'العمر القديم باقٍ إلى أن يُختار التاريخ');
  await p.selectOption('#bp-d','15');await p.selectOption('#bp-m','6');await p.selectOption('#bp-y','1995');
  const age=await p.evaluate(()=>document.getElementById('bp-age').textContent);ok(age==='31','العمر يُحسب تلقائيًا (31)',age);
  await p.selectOption('#bp-d','31');await p.selectOption('#bp-m','2');await p.waitForTimeout(50);
  ok(await p.evaluate(()=>document.getElementById('bp-d').value)==='28','فبراير يقصّ اليوم إلى 28');
  await p.click('[data-fxs]');await p.waitForTimeout(80);
  ok(await p.evaluate(()=>S.prof.dob==='1995-02-28'&&S.prof.age===31&&!document.getElementById('fx-sheet')),'حفظ تاريخ الميلاد وتحديث العمر');
  ok(await p.evaluate(()=>/[^0-9‎‏\s·]/.test(document.getElementById('tin').value)===false),'أرقام 0–9 في الحقل');
  /* الطول */
  await p.evaluate(()=>{S.prof.ht=0;document.getElementById('tin').value=''});
  await p.evaluate(()=>fxHeight(document.getElementById('tin')));await p.waitForTimeout(500);
  await p.click('[data-fxs]');await p.waitForTimeout(80);
  ok(await p.evaluate(()=>!!document.getElementById('fx-sheet')&&/اختر القيمة/.test(document.querySelector('#fx-sheet [role=alert]').textContent)),'الطول: لا حفظ قبل الاختيار عند غياب قيمة سابقة');
  ok(await p.evaluate(()=>/سم/.test(document.querySelector('#fx-sheet .fxu').textContent)),'الوحدة ظاهرة: سم');
  await p.click('#fx-sheet .fxw .fxi[data-v="180"]');await p.waitForTimeout(100);await p.click('[data-fxs]');await p.waitForTimeout(80);
  ok(await p.evaluate(()=>document.getElementById('tin').value==='180'&&!document.getElementById('fx-sheet')),'الطول يُحفظ بعد الاختيار');
  await p.evaluate(()=>fxHeight(document.getElementById('tin')));await p.waitForTimeout(300);
  ok(await p.evaluate(()=>/القيمة السابقة/.test(document.getElementById('fx-sheet').innerText)&&/تأكيد/.test(document.querySelector('[data-fxs]').textContent)),'الطول: القيمة السابقة للمراجعة وزر تأكيد');
  await p.click('[data-fxs]');await p.waitForTimeout(80);
  ok(await p.evaluate(()=>document.getElementById('tin').value==='180'),'التأكيد يبقي القيمة السابقة');
  /* الوزن يبدأ من آخر وزن محفوظ */
  await p.evaluate(()=>{S.bw={};S.bw['2026-11-10']=85.5;document.getElementById('tin').value=''});
  await p.evaluate(()=>fxWeight(document.getElementById('tin'),'الوزن'));await p.waitForTimeout(500);
  t=await p.evaluate(()=>document.getElementById('fx-sheet').innerText);
  ok(/آخر وزن محفوظ/.test(t)&&/85\.5/.test(t)&&/2026-11-10/.test(t),'الوزن: آخر وزن محفوظ بتاريخه');
  await p.click('[data-fxs]');await p.waitForTimeout(100);
  ok(await p.evaluate(()=>document.getElementById('tin').value==='85.5'),'التأكيد يحفظ 85.5 (كسر)',await p.evaluate(()=>document.getElementById('tin').value));
  /* بلا وزن سابق */
  await p.evaluate(()=>{S.bw={};document.getElementById('tin').value=''});
  await p.evaluate(()=>fxWeight(document.getElementById('tin'),'الوزن'));await p.waitForTimeout(500);await p.click('[data-fxs]');await p.waitForTimeout(80);
  ok(await p.evaluate(()=>!!document.getElementById('fx-sheet')&&document.getElementById('tin').value===''),'الوزن: لا حفظ دون اختيار عند غياب وزن سابق');
  ok(!p.errs.length,'لا أخطاء صفحة',p.errs.join('|'));
  await ctx.close()}

 console.log('6) ألبوم الصور الزمني');
 {const {ctx,p}=await mk();
  const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  /* ترقية صور قديمة */
  await p.evaluate(png=>{localStorage.setItem('fit_pp',JSON.stringify([{d:'2026-09-01',w:92.4,img:png},{d:'2026-10-15',w:88,img:png}]))},png);
  await p.reload();await p.waitForFunction(()=>typeof alView==='function');
  const up=await p.evaluate(()=>PP.map(q=>({id:!!q.id,d:q.d,w:q.w,bf:q.bf})));
  ok(up.length===2&&up.every(q=>q.id&&q.bf===null)&&up[0].w===92.4&&up[1].d==='2026-10-15','الترقية تبقي التاريخ والوزن كما سُجّلا وتضيف معرّفًا ولا تستنتج نسبة',JSON.stringify(up));
  await p.evaluate(()=>{S.tab='me';S.sub='ppg';render()});await p.waitForTimeout(100);
  let t=await txt(p);
  ok(/على هذا الجهاز فقط ولا تُرفع إلى السحابة/.test(t),'حالة الحفظ واضحة: محلي لا سحابي');
  const order=await p.$$eval('.alit .alinfo b',a=>a.map(x=>x.textContent));
  ok(order.join()==='2026-10-15,2026-09-01','الخط الزمني: الأحدث أولًا',order.join());
  ok(/92\.4/.test(t)&&/88/.test(t),'الوزن المرتبط بالصورة ظاهر');
  /* إضافة صورة بتاريخ سابق مع وزن ونسبة */
  await p.evaluate(()=>{S.bw={};S.bw['2026-11-10']=85.5;UI.alp={img:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',d:TD(),w:0,bf:0};render()});await p.waitForTimeout(100);
  ok(await p.evaluate(()=>document.getElementById('al-d-d').value==='16'&&document.getElementById('al-d-m').value==='11'),'التاريخ الافتراضي اليوم');
  ok(/آخر وزن محفوظ/.test(await txt(p))&&/85\.5/.test(await txt(p))&&/2026-11-10/.test(await txt(p)),'يقترح آخر وزن محفوظ بتاريخه');
  await p.selectOption('#al-d-d','3');await p.selectOption('#al-d-m','11');
  await p.click('#al-w');await p.waitForTimeout(500);await p.click('[data-fxs]');await p.waitForTimeout(100);
  ok(await p.evaluate(()=>document.getElementById('al-w').value==='85.5'&&UI.alp.w===85.5),'اختيار الوزن يبدأ من 85.5');
  await p.fill('#al-bf','18.5');
  await p.click('#al-save');await p.waitForTimeout(150);
  const n=await p.evaluate(()=>PP.find(q=>q.d==='2026-11-03'));
  ok(n&&n.w===85.5&&n.bf===18.5&&await p.evaluate(()=>PP.length)===3,'حُفظت الصورة بالتاريخ والوزن والنسبة',JSON.stringify(n&&{d:n.d,w:n.w,bf:n.bf}));
  ok(await p.evaluate(()=>PP.length)===3,'لا تكرار');
  /* الوزن المسجّل لا يتغير بتغيّر وزن الجسم لاحقًا */
  await p.evaluate(()=>{S.bw[TD()]=80;save()});
  ok(await p.evaluate(()=>PP.find(q=>q.d==='2026-11-03').w===85.5),'وزن الصورة ثابت كما سُجّل');
  /* مقارنة */
  const ids=await p.evaluate(()=>PP.map(q=>q.id));
  await p.evaluate(([a,b])=>{UI.alc=[a,b];render()},[ids[0],ids[2]]);
  ok(await p.$('#al-cmp')!==null&&/بين الصورتين/.test(await txt(p)),'مقارنة صورتين بتاريخين مختلفين');
  /* تعديل */
  await p.evaluate(id=>{ACT.aledit({dataset:{v:id}});render()},ids[2]);await p.waitForTimeout(100);
  await p.fill('#al-bf','17');await p.click('#al-save');await p.waitForTimeout(100);
  ok(await p.evaluate(id=>PP.find(q=>q.id===id).bf===17,ids[2]),'تعديل النسبة');
  /* تكبير */
  await p.evaluate(id=>{UI.alz=id;render()},ids[0]);ok(await p.$('#al-zoom')!==null,'التكبير');
  await p.evaluate(()=>{UI.alz=null;render()});
  /* حذف بخطوتين */
  await p.evaluate(id=>{ACT.aldel({dataset:{v:id}});render()},ids[0]);ok(await p.evaluate(()=>PP.length)===3,'الحذف يحتاج تأكيدًا');
  await p.evaluate(id=>{ACT.aldel({dataset:{v:id}});render()},ids[0]);ok(await p.evaluate(()=>PP.length)===2,'الحذف بعد التأكيد');
  /* استعادة بعد إغلاق وفتح */
  await p.reload();await p.waitForFunction(()=>typeof alView==='function');
  ok(await p.evaluate(()=>PP.length)===2,'الصور باقية بعد إعادة الفتح دون تكرار');
  ok(!p.errs.length,'لا أخطاء صفحة',p.errs.join('|'));
  await ctx.close()}

 console.log('7) يومية التغذية المبسّطة');
 {const {ctx,p}=await mk();
  await p.evaluate(()=>{S.meals={};S.lib=[];S.nt.kcal=2000;S.nt.p=150;S.nt.c=200;S.nt.f=60;S.tab='food';S.sub=null;UI.fm='today';UI.fd='';render()});await p.waitForTimeout(150);
  let t=await txt(p);
  ok(/المسجّل/.test(t)&&/الهدف/.test(t)&&/المتبقي/.test(t)&&/بروتين/.test(t)&&/كربوهيدرات/.test(t)&&/دهون/.test(t),'الأعلى: المسجّل والهدف والمتبقي ثم الماكروز');
  const secs=await p.$$eval('.fdsec h2',a=>a.map(x=>x.textContent));ok(secs.join('|')==='الفطور|الغداء|العشاء|الوجبات الخفيفة','الأقسام بالترتيب: '+secs.join('|'));
  ok((await p.$$eval('[data-a=fdadd]',a=>a.map(x=>x.textContent.trim()))).every(x=>/إضافة طعام/.test(x)),'زر «إضافة طعام» في كل قسم');
  ok(await p.evaluate(()=>document.getElementById('fd-logged').textContent.trim())==='0','المسجّل 0');
  await p.click('#fd-add-b');await p.waitForTimeout(100);
  ok(await p.$('#fds')!==null&&await p.$('#fds-q')!==null,'نافذة موحّدة فيها بحث');
  ok((await p.$$eval('#fds [data-a=fdtab]',a=>a.map(x=>x.textContent))).join('|')==='الأخيرة|المفضلة|وجباتي المحفوظة','تبويبات: الأخيرة والمفضلة ووجباتي');
  await p.fill('#fds-q','دجاج');await p.waitForTimeout(100);
  const first=await p.$eval('#fds-l .fpr b',e=>e.textContent);ok(!!first,'نتائج البحث: '+first);
  await p.click('#fds-l .fpr');await p.waitForTimeout(100);
  const per=await p.evaluate(()=>{const it=UI.fds.pick;return{n:it.n,k:it.per100.k,sg:it.sg}});
  await p.fill('#fds-g','200');await p.waitForTimeout(80);
  const live=await p.evaluate(()=>document.getElementById('fds-m').innerText);
  ok(new RegExp(String(Math.round(per.k*2))).test(live),'القيم تتحدث مباشرة بالكمية (200 غ → '+Math.round(per.k*2)+')',live.replace(/\n/g,' '));
  await p.click('#fds-save');await p.waitForTimeout(150);
  ok(!await p.$('#fds'),'النافذة تُغلق بعد الحفظ');
  let logged=await p.evaluate(()=>+document.getElementById('fd-logged').textContent.replace(/\D/g,''));
  ok(logged===Math.round(per.k*2),'المسجّل تحدّث فورًا: '+logged);
  ok(/200 غ/.test(await txt(p)),'الكمية بالغرام ظاهرة');
  /* تعديل الكمية */
  await p.click('[data-a=fded]');await p.fill('#fde-q','100');await p.click('[data-a=fdesave]');await p.waitForTimeout(100);
  logged=await p.evaluate(()=>+document.getElementById('fd-logged').textContent.replace(/\D/g,''));ok(logged===Math.round(per.k),'تعديل الكمية يعيد الحساب ('+logged+')');
  /* نقل إلى الغداء */
  await p.click('[data-a=fded]');await p.selectOption('#fde-s','l');await p.click('[data-a=fdesave]');await p.waitForTimeout(100);
  ok(await p.evaluate(()=>S.meals[TD()][0].slot==='l')&&(await p.$$eval('.fdsec[data-slot=l] .fdrow',a=>a.length))===1,'نُقل الطعام إلى الغداء');
  ok(await p.evaluate(()=>S.meals[TD()].length)===1,'لا تكرار بعد النقل');
  /* الأخيرة والمفضلة */
  await p.click('#fd-add-d');await p.waitForTimeout(100);
  ok((await p.$$eval('#fds-l .fpr b',a=>a.map(x=>x.textContent))).indexOf(per.n)>=0,'الأخيرة تعرض الطعام المسجّل');
  await p.click('#fds-l .fpr');await p.waitForTimeout(80);await p.click('[data-a=fdfav]');await p.waitForTimeout(60);
  ok(await p.evaluate(n=>!!S.ffav[n],per.n),'تفضيل ★');
  await p.click('[data-a=fdclose] >> nth=-1').catch(()=>{});await p.evaluate(()=>{UI.fds=null;render()});
  await p.click('#fd-add-s');await p.click('[data-v=fav]');await p.waitForTimeout(80);
  ok((await p.$$eval('#fds-l .fpr b',a=>a.map(x=>x.textContent))).indexOf(per.n)>=0,'المفضلة تعرضه');
  await p.evaluate(()=>{UI.fds=null;render()});
  /* نسخ وجبة سابقة بعد المراجعة */
  await p.evaluate(()=>{const y=addDays(TD(),-1);S.meals[y]=[{id:'a1',n:'أرز أبيض مطبوخ',kcal:200,p:4,c:44,f:0,slot:'d',gm:150,ub:'g',pr:{k:133,p:3,c:29,f:0},sg:150,su:'حصة'},{id:'a2',n:'سلطة',kcal:50,p:1,c:5,f:3,slot:'d',sq:1,pm:{k:50,p:1,c:5,f:3}}];save();render()});
  await p.click('[data-a=fdcopy][data-s=d]');await p.waitForTimeout(100);
  ok((await p.$$eval('[data-fdc]',a=>a.length))===2,'مراجعة العناصر قبل النسخ (2)');
  await p.uncheck('[data-fdc=a2]');await p.click('#fdc-go');await p.waitForTimeout(120);
  ok(await p.evaluate(()=>S.meals[TD()].filter(m=>m.slot==='d').map(m=>m.n).join()==='أرز أبيض مطبوخ'),'نُسخ العنصر المحدد فقط');
  ok(await p.evaluate(()=>S.meals[TD()].filter(m=>m.slot==='d')[0].id!=='a1'),'نسخة جديدة بمعرّف مختلف');
  /* طعام مخصص */
  await p.click('#fd-add-s');await p.click('[data-a=fdcust]');await p.fill('#fdk-n','ساندويتش منزلي');await p.fill('#fdk-k','350');await p.fill('#fdk-p','20');await p.check('#fdk-save');await p.click('#fdk-go');await p.waitForTimeout(120);
  ok(await p.evaluate(()=>S.meals[TD()].some(m=>m.n==='ساندويتش منزلي'&&m.kcal===350&&m.slot==='s')&&S.lib.some(x=>x.n==='ساندويتش منزلي')),'طعام مخصص أُضيف وحُفظ في وجباتي');
  /* خلف اليومية */
  await p.click('[data-a=fdgo][data-v=month]');await p.waitForTimeout(100);
  ok(/العودة إلى اليومية/.test(await txt(p)),'التخطيط خلف اليومية ومعه رجوع');
  await p.click('[data-a=fdgo][data-v=today]');await p.waitForTimeout(80);ok(await p.$('#fd-sum')!==null,'العودة إلى اليومية');
  /* التاريخ */
  await p.click('[data-a=fdday][data-v="-1"]');await p.waitForTimeout(80);
  ok(await p.evaluate(()=>UI.fd===addDays(TD(),-1))&&/سلطة|أرز/.test(await txt(p)),'الانتقال لأمس');
  ok(!p.errs.length,'لا أخطاء صفحة',p.errs.join('|'));
  await ctx.close()}

 console.log('8) الرئيسية: مشهد الوقت');
 {const mkAt=async(time,o)=>{o=o||{};const ctx=await b.newContext({viewport:{width:o.w||390,height:844},timezoneId:o.tz||'Asia/Riyadh',reducedMotion:o.rm?'reduce':'no-preference'});await ctx.clock.install({time:new Date(time)});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
   await p.goto('file://'+file);await p.waitForFunction(()=>typeof scCard==='function');
   await p.evaluate(g=>{S.prof.ob=1;S.prof.name='مختبر';S.prof.sex='m';S.prof.age=30;S.prof.ht=178;S.prof.startW=85;S.prof.goalType='lose';S.prof.lvl='b';S.prof.eq='gym';S.prof.dpw=7;S.bw[TD()]=85;calcTargets();genPlan();const s=rdS();if(g){s.geo=1;s.cus=g}else{s.geo=0;s.cus=null}s.wxOn=1;s.sunOn=1;save()},o.geo===undefined?{n:'المدينة المنورة',lat:24.47,lon:39.61,tz:'Asia/Riyadh'}:o.geo);
   await p.reload();await p.waitForFunction(()=>typeof scCard==='function');await p.evaluate(()=>{S.tab='dash';S.sub=null;render()});await p.waitForTimeout(250);return{ctx,p}};
  const per=async t=>{const {ctx,p}=await mkAt(t);const r=await p.evaluate(()=>({per:document.getElementById('sc-per').textContent,cls:document.getElementById('sc-card').className}));await ctx.close();return r.per};
  const cases=[['2026-11-16T03:00:00+03:00','آخر الليل'],['2026-11-16T05:30:00+03:00','الفجر'],['2026-11-16T08:00:00+03:00','الصباح'],['2026-11-16T12:30:00+03:00','الظهر'],['2026-11-16T15:45:00+03:00','العصر'],['2026-11-16T17:20:00+03:00','الغروب'],['2026-11-16T19:30:00+03:00','الليل'],['2026-11-16T23:00:00+03:00','الليل'],['2026-11-17T02:30:00+03:00','آخر الليل']];
  for(const [t,e] of cases){const got=await per(t);ok(got===e,'الفترة عند '+t.slice(11,16)+' = '+e,got)}
  /* مواعيد الشروق والغروب = بيانات الموقع، والمعروض يطابق */
  {const {ctx,p}=await mkAt('2026-11-16T10:30:00+03:00');
   const r=await p.evaluate(()=>{const c=rdCity(),t=rdPray(rdP(rdNow(),c.tz).d);return{sr:rdF(t.sunrise,c.tz),ss:rdF(t.sunset,c.tz),txt:document.getElementById('sc-card').innerText,sunY:+document.querySelector('.scsun').getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/)[2],sunX:+document.querySelector('.scsun').getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/)[1],p:scGeo(rdNow(),scState().D).sun}});
   ok(r.txt.includes(r.sr)&&r.txt.includes(r.ss),'الشروق والغروب المعروضان من بيانات الموقع: '+r.sr+' / '+r.ss);
   ok(r.p>0.3&&r.p<0.5&&r.sunY<50,'الشمس على القوس بحسب الوقت الفعلي (p='+(+r.p).toFixed(2)+')');
   ok(await p.evaluate(()=>!document.querySelector('.scmoon')),'لا قمر نهارًا');
   /* التباين على مدار اليوم */
   const worst=await p.evaluate(()=>{const st=scState();let w=99,at='';for(let m=0;m<1440;m+=10){const ms=rdAt(st.D.ds,m,st.c.tz),k=scDay(ms,st.c)||st.D,c=scContrast(ms,k);if(c<w){w=c;at=m}}return{w:w,at:at}});
   ok(worst.w>=4.5,'أقل تباين للنص على مدار اليوم ≥ 4.5 ('+worst.w.toFixed(2)+')');
   /* السمات: النص أبيض على لوحة داكنة في الفاتح والأسود */
   for(const th of ['light','dark']){await p.evaluate(t=>{document.documentElement.setAttribute('data-theme',t);render()},th);const cc=await p.evaluate(()=>{const e=document.querySelector('.scin');return getComputedStyle(e).color+'|'+getComputedStyle(document.querySelector('.scdate')).fontSize});ok(/^rgb\(255, 255, 255\)/.test(cc),'نص المشهد أبيض ('+th+')',cc)}
   /* المقاسات على 320 */
   await p.setViewportSize({width:320,height:700});await p.waitForTimeout(100);
   const g=await p.evaluate(()=>({ov:document.documentElement.scrollWidth>innerWidth+1,btn:Math.min(...[...document.querySelectorAll('.scin button')].map(b=>b.getBoundingClientRect().height)),fs:Math.min(...[...document.querySelectorAll('.scin .scs,.scin .scdate,.scchip')].map(e=>parseFloat(getComputedStyle(e).fontSize)))}));
   ok(!g.ov,'لا تمرير أفقي على 320');ok(g.btn>=44,'أزرار ≥ 44px ('+g.btn+')');ok(g.fs>=13,'خط ≥ 13px ('+g.fs+')');
   await ctx.close()}
  /* ليلًا: القمر */
  {const {ctx,p}=await mkAt('2026-11-16T22:30:00+03:00');ok(await p.evaluate(()=>!!document.querySelector('.scmoon')&&!document.querySelector('.scsun')),'قمر ليلًا بلا شمس');
   const x1=await p.evaluate(()=>document.querySelector('.scmoon').getAttribute('transform'));await p.clock.fastForward(3*3600*1000);await p.waitForTimeout(100);
   const x2=await p.evaluate(()=>document.querySelector('.scmoon').getAttribute('transform'));ok(x1!==x2,'القمر يتحرك مع الوقت (تأثير بصري)');
   ok(/تأثير بصري/.test(await txt(p)),'توضيح أن حركة القمر تأثير بصري');await ctx.close()}
  /* تغيّر اليوم والوقت يحدّث المشهد */
  {const {ctx,p}=await mkAt('2026-11-16T16:50:00+03:00');const d1=await p.evaluate(()=>document.getElementById('sc-date').textContent+'|'+document.getElementById('sc-per').textContent);
   await p.clock.fastForward(2*3600*1000);await p.waitForTimeout(100);const d2=await p.evaluate(()=>document.getElementById('sc-date').textContent+'|'+document.getElementById('sc-per').textContent);ok(d1!==d2&&/الليل/.test(d2),'الفترة تتغير مع الوقت: '+d2);
   await p.clock.fastForward(24*3600*1000);await p.waitForTimeout(100);await p.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await p.waitForTimeout(100);
   ok(/17 نوفمبر|18 نوفمبر/.test(await p.evaluate(()=>document.getElementById('sc-date').textContent)),'تغيّر اليوم يحدّث التاريخ');
   /* تغيّر الموقع: القاهرة */
   const before=await p.evaluate(()=>document.querySelector('.scsr').innerText);
   await p.evaluate(()=>{const s=rdS();s.cus={n:'القاهرة',lat:30.04,lon:31.24,tz:'Africa/Cairo'};s.geo=1;save();render()});await p.waitForTimeout(100);
   const after=await p.evaluate(()=>document.querySelector('.scsr').innerText+'|'+document.getElementById('sc-card').innerText);
   ok(after.indexOf(before)!==0||/القاهرة/.test(after),'تغيّر الموقع يغيّر المواعيد والاسم');
   ok(/القاهرة/.test(after),'اسم المدينة الجديدة ظاهر');
   await ctx.close()}
  /* إيقاف التحديث عند إخفاء الصفحة */
  {const {ctx,p}=await mkAt('2026-11-16T10:30:00+03:00');
   await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});
   ok(await p.evaluate(()=>SCT===0&&document.documentElement.classList.contains('sc-hid')),'عند الإخفاء: لا مؤقت تحديث ورسوم متوقفة');
   await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))});
   ok(await p.evaluate(()=>SCT!==0&&!document.documentElement.classList.contains('sc-hid')),'عند الظهور: يُستأنف');
   await ctx.close()}
  /* تقليل الحركة */
  {const {ctx,p}=await mkAt('2026-11-16T22:30:00+03:00',{rm:1});
   const r=await p.evaluate(()=>({cls:document.getElementById('sc-card').classList.contains('sc-rm'),an:getComputedStyle(document.querySelector('.scstars i')).animationName}));ok(r.cls&&r.an==='none','تقليل الحركة: بلا رسوم متحركة',JSON.stringify(r));await ctx.close()}
  /* بلا موقع */
  {const {ctx,p}=await mkAt('2026-11-16T10:30:00+03:00',{geo:null});const t=await txt(p);
   ok(/استخدم موقعي/.test(t)&&/اسمح بالموقع/.test(t)&&/تقريبي بحسب ساعة الجهاز/.test(t),'بلا موقع: حالة مفهومة وزر «استخدم موقعي»');
   ok(await p.evaluate(()=>!document.querySelector('.scchip')),'بلا موقع: لا مواعيد شروق وغروب مختلقة');
   await p.evaluate(()=>{const s=rdS();s.geoDeny=1;render()});ok(/لم يُمنح إذن الموقع/.test(await txt(p)),'حالة رفض الإذن واضحة');
   ok(!p.errs.length,'لا أخطاء صفحة',p.errs.join('|'));await ctx.close()}}
 await b.close();console.log(fail?'FAILED '+fail:'all PASS');process.exit(fail?1:0)})();
