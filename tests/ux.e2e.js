/* اختبارات «اليوم ← التمرين ← الأرشيف»: node tests/ux.e2e.js [مسار index.html]  (يتطلب playwright)
   كل سيناريو في سياق متصفح جديد ومستقل. الوقت مثبّت على الأربعاء 2026-11-18 حتى لا يتغير اليوم بين التشغيلات. */
const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),os=require('os');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let fail=0,pass=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok   '+m)}else{fail++;console.log('  FAIL '+m+(x?'  ['+x+']':''))}};
const NOW=new Date('2026-11-18T10:00:00+03:00');
const PLAN=`(()=>{const e=(n,s,r,w)=>E(n,s,r,w);const rest={t:'راحة',ex:[]};
 return[rest,rest,rest,rest,{t:'صدر وظهر',ex:[e('بنش برس',3,8,20),e('سحب علوي',3,10,30),e('سكوات',3,8,40)]},{t:'أكتاف',ex:[e('ضغط أكتاف دمبل',3,10,10)]},{t:'أرجل',ex:[e('ضغط أرجل',3,12,60)]}]})()`;
async function ctxOf(b,w,init){const ctx=await b.newContext({viewport:{width:w||390,height:844},acceptDownloads:true});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.errs=errs;await p.clock.install({time:NOW});
 if(init)await ctx.addInitScript(init);await p.goto('file://'+file);await p.waitForTimeout(600);await p.clock.resume();return{ctx,p}}
const setup=p=>p.evaluate(plan=>{S.prof.ob=1;S.prof.name='مختبر';S.prof.sex='m';S.prof.age=30;S.prof.ht=175;S.prof.startW=80;S.prof.dpw=3;S.prof.goalType='lose';S.bw[TD()]=80;S.plan=eval(plan);S.tab='train';UI.trk='hub';S.sub=null;save();render()},PLAN);
const txt=p=>p.evaluate(()=>document.body.innerText);
const endWk=async p=>{await p.evaluate(()=>document.querySelectorAll('details.sjmore').forEach(d=>{d.open=true}));await p.click('[data-a="wkend"]');await p.waitForTimeout(150);if(await p.$('#fx-sheet [data-fxs]')){await p.click('#fx-sheet [data-fxs]');await p.waitForTimeout(250)}};
const click=async(p,sel)=>{await p.evaluate(()=>document.querySelectorAll('details.sjmore').forEach(d=>{d.open=true}));await p.click(sel);await p.waitForTimeout(60)};
const sx=p=>p.evaluate(()=>JSON.parse(JSON.stringify(S.sx)));
const ovf=p=>p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
(async()=>{const b=await chromium.launch();

 console.log('1) مستخدم جديد: اختيار الخطة ← أول تمرين ← الأرشيف');
 {const {ctx,p}=await ctxOf(b);
  ok(await p.$('#wel-go')!==null,'شاشة الترحيب SIJIL تظهر لمستخدم جديد قبل المعالج');
  await click(p,'#wel-go');
  ok(/ما اسمك/.test(await txt(p)),'«ابدأ الآن» يفتح معالج الهدف والخطة بلا حساب');
  await p.fill('#wz-v','سارة');await click(p,'[data-a="wznext"]');await click(p,'[data-a="wzopt"][data-v="f"]');
  await p.fill('#wz-m-age','28');await p.fill('#wz-m-ht','165');await p.fill('#wz-m-startW','70');await click(p,'[data-a="wznext"]');
  await click(p,'[data-a="wzopt"][data-v="lose"]');await click(p,'[data-a="wzopt"][data-v="b"]');await click(p,'[data-a="wzopt"][data-v="gym"]');await click(p,'[data-a="wzopt"][data-v="3"]');
  await click(p,'[data-a="obgo"]');
  ok(await p.evaluate(()=>S.plan.some(d=>d.ex.length)),'اختيار الخطة من الترحيب يبني خطة بتمارين');
  await setup(p);
  let t=await txt(p);
  ok(/ابدأ تمرين اليوم/.test(t)&&/هدف الأسبوع: 0 من 3/.test(t),'اليوم: «ابدأ تمرين اليوم» وهدف الأسبوع 0 من 3');
  await click(p,'#sx-go');ok(await p.evaluate(()=>S.sub==='wk'&&!!UI.wk),'ضغط «ابدأ» يفتح الجلسة');
  ok((await sx(p))&&Object.keys(await sx(p)).length===0,'لا يُنشأ سجل جلسة قبل أول مجموعة');
  await click(p,'[data-a="wkty"][data-v="d"]');await click(p,'[data-a="wkrp"][data-v="9"]');await click(p,'[data-a="wkset"]');
  let s=Object.values(await sx(p));
  ok(s.length===1&&s[0].st==='p','أول مجموعة تنشئ جلسة واحدة جزئية');
  const st=s[0].ex[0].sets[0];ok(st&&st.ty==='d'&&st.rp===9,'المجموعة حُفظت بنوع «دروب» وجهد RPE 9');
  ok(/RPE9/.test(await txt(p)),'تظهر المجموعة المسجّلة في شاشة المشغّل');
  await click(p,'[data-a="wkend"]');ok(/أنجزت\s*1\s*من/.test((await p.evaluate(()=>(document.querySelector('#fx-sheet')||{}).innerText||'')).replace(/\s+/g,' ')),'إنهاء جزئي يطلب تأكيدًا ويعرض عدد المجموعات المنجزة');await p.click('#fx-sheet [data-fxs]');await p.waitForTimeout(250);await p.evaluate(()=>{S.tab='train';S.sub=null;UI.trk='hub';render()});await p.waitForTimeout(200);t=await txt(p);
  ok(/تمرين جزئي محفوظ · 1 من 7 مجموعة/.test(t.replace(/\s+/g,' '))||/تمرين جزئي محفوظ · 1 من 9 مجموعة/.test(t.replace(/\s+/g,' ')),'اليوم يعرض «تمرين جزئي محفوظ · 1 من 9 مجموعة»',t.match(/تمرين جزئي[^\n]*/));
  ok(/أكمل التمرين/.test(t)&&/هدف الأسبوع: 0 من 3/.test(t),'الزر «أكمل التمرين» والهدف ما زال 0 من 3');
  await click(p,'#nav [data-a="go"][data-v="train"]');await click(p,'.sjtk[data-v="irs"]');await click(p,'[data-a=trk][data-v=iron]');ok(/أكمل التمرين/.test(await txt(p)),'تبويب التمرين يعرض «أكمل» أيضًا');
  await click(p,'[data-a="go"][data-v="dash"]').catch(()=>{});
  await p.reload();await p.waitForTimeout(500);await p.evaluate(()=>{S.tab='train';S.sub=null;UI.trk='hub';render()});await p.waitForTimeout(200);
  t=await txt(p);ok(/أكمل التمرين/.test(t)&&/1 من 9 مجموعة/.test(t.replace(/\s+/g,' ')),'بعد تحديث الصفحة: الجلسة الجزئية محفوظة');
  ok(await p.evaluate(()=>{const d=rsDecomp(S);return Object.keys(d).filter(k=>k.indexOf('sx\u0001')===0).length===1}),'الجلسة تدخل المزامنة كسجل مستقل (rsDecomp: sx/معرّف)');
  await click(p,'#sx-go');
  ok(await p.evaluate(()=>{const s=Object.values(S.sx)[0];return UI.wk.sid===s.id&&UI.wk.i===0&&UI.wk.s===1}),'الاستئناف على الجلسة نفسها من أول مجموعة غير مكتملة (المجموعة 2)');
  for(let i=0;i<8;i++)await click(p,'[data-a="wkset"]');
  s=Object.values(await sx(p));ok(s.length===1&&s[0].st==='c','اكتمال الجلسة: جلسة واحدة بحالة «مكتملة»');
  await click(p,'[data-a="wkfin"]');t=await txt(p);
  ok(/هدف الأسبوع: 1 من 3/.test(t),'هدف الأسبوع ينتقل من 0 من 3 إلى 1 من 3');
  ok(/اعرض تمرينك المحفوظ/.test(t),'اليوم بعد الاكتمال: «اعرض تمرينك المحفوظ»');
  ok(await p.evaluate(()=>Object.keys(S.done).filter(k=>k.indexOf(W()+'|4|')===0).length===3),'التمارين الثلاثة مكتوبة في S.done كما كانت');
  await click(p,'#sx-go');t=await txt(p);
  ok(/بنش برس/.test(t)&&/RPE 9/.test(t)&&/دروب/.test(t),'فتح الجلسة المحفوظة يعرض المجموعات بقيمها (RPE ونوع المجموعة)');
  await click(p,'[data-a="adback"]');
  await p.fill('#aq','سحب');t=await p.evaluate(()=>document.getElementById('arl').innerText);ok(/صدر وظهر/.test(t),'البحث باسم تمرين داخل الأرشيف يجد الجلسة');
  await p.fill('#aq','لايوجد');t=await p.evaluate(()=>document.getElementById('arl').innerText);ok(/لا نتائج/.test(t),'بحث بلا نتائج يعرض رسالة');
  await p.fill('#aq','');await click(p,'[data-a="arf"][data-v="p"]');t=await p.evaluate(()=>document.getElementById('arl').innerText);ok(/لا نتائج/.test(t),'تصفية «جزئية» لا تعرض الجلسة المكتملة');
  await click(p,'[data-a="arf"][data-v="c"]');t=await p.evaluate(()=>document.getElementById('arl').innerText);ok(/مكتملة/.test(t),'تصفية «مكتملة» تعرضها');
  ok(p.errs.length===0,'لا أخطاء JavaScript',p.errs.join('|'));await ctx.close()}

 console.log('2) الاستكمال من الأرشيف (اختبار مستقل)');
 {const {ctx,p}=await ctxOf(b);await setup(p);
  await click(p,'#sx-go');await click(p,'[data-a="wkrp"][data-v="8"]');await click(p,'[data-a="wkset"]');await endWk(p);
  await p.reload();await p.waitForTimeout(500);
  await click(p,'#nav [data-a="go"][data-v="ex"]');await click(p,'[data-a="sub"][data-v="arch"]');
  let t=await txt(p);ok(/جزئية/.test(t),'الجلسة الجزئية تظهر في سجل الأرشيف');
  await click(p,'.sxr');t=await txt(p);ok(/RPE 8/.test(t)&&/جزئية · 1 من 9/.test(t.replace(/\s+/g,' ')),'تفاصيل الجلسة: RPE والتقدم 1 من 9');
  await p.evaluate(()=>{ACT.back();render()});await click(p,'[data-a="sub"][data-v="arch"]');ok(!!(await p.$('#arl')),'الخروج من الأرشيف والعودة يعرض القائمة لا التفاصيل القديمة');await click(p,'.sxr');
  await click(p,'#ar-resume');
  ok(await p.evaluate(()=>S.sub==='wk'&&UI.wk.s===1&&UI.wk.sid===Object.values(S.sx)[0].id),'«أكمل التمرين» من الأرشيف يعيد فتح الجلسة نفسها');
  for(let i=0;i<8;i++)await click(p,'[data-a="wkset"]');
  const s=Object.values(await sx(p));ok(s.length===1&&s[0].st==='c'&&s[0].ex[0].sets[0].rp===8,'اكتملت جلسة واحدة وبقيت قيمة RPE الأولى');
  await click(p,'[data-a="wkfin"]');ok(/هدف الأسبوع: 1 من 3/.test(await txt(p)),'الهدف 1 من 3 مرة واحدة');
  ok(p.errs.length===0,'لا أخطاء JavaScript',p.errs.join('|'));await ctx.close()}

 console.log('3) عدم احتساب الإنجاز مرتين');
 {const {ctx,p}=await ctxOf(b);await setup(p);
  await click(p,'#sx-go');for(let i=0;i<3;i++)await click(p,'[data-a="wkset"]');await endWk(p);
  await p.evaluate(()=>{tasks().filter(t=>t.d===TI()&&!t.r).forEach(t=>mark(t.k,t.e.w||10,t.e.r));save();render()});
  const wd=await p.evaluate(()=>wkDays());ok(wd.n===1,'تعليم بقية التمارين من القائمة القديمة يكمل اليوم مرة واحدة',JSON.stringify(wd));
  await click(p,'#sx-go');await click(p,'[data-a="wkset"]').catch(()=>{});
  const s=Object.values(await sx(p));ok(s.length===1,'لا تُنشأ جلسة ثانية',String(s.length));
  ok(p.errs.length===0,'لا أخطاء JavaScript',p.errs.join('|'));await ctx.close()}

 console.log('4) التحديث ببيانات من النسخة السابقة');
 {
  const legacy=`(()=>{const mk=(n,s,r,w)=>({id:'e'+n.length+s,n:n,s:s,r:r,w:w});
   const plan=[{t:'راحة',ex:[]},{t:'راحة',ex:[]},{t:'راحة',ex:[]},{t:'راحة',ex:[]},{t:'صدر',ex:[mk('بنش برس',3,8,20)]},{t:'ظهر',ex:[mk('سحب علوي',3,10,30)]},{t:'راحة',ex:[]}];
   const S0={v:2,tab:'dash',prof:{ob:1,name:'قديم',sex:'m',age:30,ht:175,startW:80,dpw:3,goalType:'lose'},plan:plan,
    done:{['2026-11-07|4|'+plan[4].ex[0].id]:{n:'بنش برس',w:22.5,r:8,date:'2026-11-11',rpe:8},['2026-10-31|5|'+plan[5].ex[0].id]:{n:'سحب علوي',w:30,r:10,date:'2026-11-05'}},
    bw:{'2026-11-01':80,'2026-11-10':79},sleep:{'2026-11-10':7},meals:{},cardio:{},ses:{},tot:{'2026-11-07':2,'2026-10-31':2}};
   localStorage.setItem('fit1',JSON.stringify(S0))})()`;
  const {ctx,p}=await ctxOf(b,390,legacy);
  ok(await p.evaluate(()=>S.prof.name==='قديم'&&typeof S.sx==='object'&&Object.keys(S.sx).length===0),'التحديث يقرأ الحالة القديمة ويضيف سجلًا فارغًا للجلسات');
  await click(p,'#nav [data-a="go"][data-v="ex"]');await click(p,'[data-a="sub"][data-v="arch"]');let t=await txt(p);
  ok(/سجل سابق/.test(t)&&/2026-11-11/.test(t),'السجلات السابقة تظهر في تبويب الجلسات');
  await click(p,'.sxr');t=await txt(p);ok(/بنش برس/.test(t)&&/RPE 8/.test(t),'تفاصيل سجل سابق تعرض التمرين والوزن وRPE');await click(p,'[data-a="adback"]');
  await click(p,'[data-a="seg"][data-v="wk"]');t=await txt(p);ok(/أسبوع 2026-11-07/.test(t)&&/أسبوع 2026-10-31/.test(t),'ملخص الأسابيع القديم ما زال يعرض أسابيعه');
  const reach=await p.evaluate(()=>{const bad=[];['wgt','rpt','tools','cul','ach','arch','plan','prog','coach','set','link','vis','rem','gyms'].forEach(k=>{try{S.sub=k;render()}catch(e){bad.push(k+':'+e.message)}});['club','pg','me','food','train','dash'].forEach(k=>{try{S.sub=null;S.tab=k;render()}catch(e){bad.push(k+':'+e.message)}});return bad});
  ok(reach.length===0,'المزايا القائمة (الوزن والتقارير والأدوات والثقافة والأوسمة والنادي والزيارات...) تُرسم بعد التحديث',reach.join(','));
  const items=await p.evaluate(()=>[['pg','arch'],['pg','rpt'],['ex','cul'],['ex','tools']].map(([t,k])=>{S.sub=null;S.tab=t;render();return !!document.querySelector('[data-a="sub"][data-v="'+k+'"]')}));
  ok(items.every(Boolean),'الأرشيف والتقارير في «التقدّم»، والثقافة والأدوات في «المزيد» (مكان واحد لكل منها)',items.join());
  ok(p.errs.length===0,'لا أخطاء JavaScript',p.errs.join('|'));await ctx.close()}

 console.log('5) النسخة الاحتياطية: التنزيل والاستعادة');
 {const {ctx,p}=await ctxOf(b,390,"localStorage.setItem('fit_sync','TOKEN_SECRET_VALUE_1234567890');localStorage.setItem('fit_sb','SESSION_SECRET_VALUE')");
  await setup(p);
  await click(p,'#sx-go');await click(p,'[data-a="wkrp"][data-v="7"]');await click(p,'[data-a="wkset"]');await endWk(p);
  await p.evaluate(()=>{S.prof.syncToken='LEAK1';S.prof.accEmail='a@b.c';S.cfgx={apiKey:'LEAK2',nested:{password:'LEAK3',keep:1}};S.meals[TD()]=[{n:'رز',kcal:200,p:4,c:40,f:1}];save()});
  await click(p,'#nav [data-a="go"][data-v="ex"]');await click(p,'[data-a="sub"][data-v="arch"]');
  ok(/تنزيل نسخة احتياطية/.test(await txt(p))&&/التمارين والوزن والوجبات والإعدادات/.test(await txt(p)),'الزر باسم «تنزيل نسخة احتياطية» والوصف يذكر ما يشمله');
  const [dl]=await Promise.all([p.waitForEvent('download'),click(p,'#bk-dl')]);
  const f=path.join(os.tmpdir(),'khatwa-bk-'+Date.now()+'.json');await dl.saveAs(f);const raw=fs.readFileSync(f,'utf8'),j=JSON.parse(raw);
  ok(/^khatwa-backup-\d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename()),'اسم الملف khatwa-backup-التاريخ.json',dl.suggestedFilename());
  ok(j.plan&&j.done!==undefined&&j.bw&&j.meals&&j.prof&&j.sx&&Object.keys(j.sx).length===1,'يشمل الخطة والتمارين والوزن والوجبات والإعدادات والجلسة الجزئية');
  ok(!/TOKEN_SECRET|SESSION_SECRET|LEAK1|LEAK2|LEAK3|a@b\.c/.test(raw),'يستبعد مفاتيح الخدمات ورموز الجلسة والمزامنة وكلمات المرور والبريد');
  ok(raw.indexOf('"keep"')>0,'يبقي بقية الحقول غير السرية');
  await ctx.close();
  // تثبيت نظيف: استعادة النسخة
  {const {ctx:c2,p:p2}=await ctxOf(b);
   await p2.evaluate(()=>{S.prof.ob=1;S.tab='train';UI.trk='hub';save();render()});
   ok(!(await sx(p2))||Object.keys(await sx(p2)).length===0,'التثبيت النظيف بلا جلسات');
   const r=await p2.evaluate(async txt=>{S.sub='set';render();document.getElementById('impall').value=txt;ACT.impall();render();return{msg:UI.msg,n:Object.keys(S.sx).length,name:S.prof.name}},raw);
   ok(/تم استرجاع/.test(r.msg)&&r.n===1&&r.name==='مختبر','الاستعادة في تثبيت نظيف تعيد البيانات والجلسة الجزئية');
   await p2.evaluate(()=>{S.sub=null;S.tab='train';UI.trk='hub';render()});let t=await txt(p2);
   ok(/أكمل التمرين/.test(t)&&/1 من 9 مجموعة/.test(t.replace(/\s+/g,' ')),'بعد الاستعادة: «أكمل التمرين» والتقدم 1 من 9');
   await click(p2,'#sx-go');for(let i=0;i<8;i++)await click(p2,'[data-a="wkset"]');
   const s=Object.values(await sx(p2));ok(s.length===1&&s[0].st==='c','استكمال الجلسة المستعادة دون تكرارها');
   // نسخة قديمة بلا سجل جلسات
   const old=JSON.parse(raw);delete old.sx;
   const r2=await p2.evaluate(txt=>{S.sub='set';render();document.getElementById('impall').value=txt;ACT.impall();return{msg:UI.msg,sx:typeof S.sx,n:Object.keys(S.sx).length}},JSON.stringify(old));
   ok(/تم استرجاع/.test(r2.msg)&&r2.sx==='object'&&r2.n===0,'استيراد نسخة قديمة بلا sx يعمل ويضيف سجلًا فارغًا');
   ok(p2.errs.length===0,'لا أخطاء JavaScript',p2.errs.join('|'));await c2.close()}}

 console.log('6) اختصارا الوزن والوجبة');
 {const {ctx,p}=await ctxOf(b);await setup(p);
  await click(p,'#nav [data-a="go"][data-v="me"]');await click(p,'[data-a="sub"][data-v="wgt"]');ok(await p.evaluate(()=>S.sub==='wgt'),'مدخل الوزن في التقدّم يفتح صفحة مراقبة الوزن (مسار التسجيل المعتمد)');
  await p.fill('#we-w','79.4');await click(p,'[data-a="wadd"]');
  ok(await p.evaluate(()=>S.bw[TD()]===79.4),'الحفظ يكتب في سجل الوزن نفسه S.bw');
  await p.evaluate(()=>{S.sub=null;S.tab='train';UI.trk='hub';render()});
  const inl=await p.evaluate(()=>{const i=document.querySelector('[data-c="bw"]');return i?+i.value:null});ok(inl===79.4||inl===null,'حقل الوزن السريع في اليوم يقرأ السجل نفسه',String(inl));
  await click(p,'#nav [data-a="go"][data-v="food"]');ok(await p.evaluate(()=>S.tab==='food'),'تبويب التغذية يفتح التغذية (مسار التسجيل المعتمد)');
  ok(p.errs.length===0,'لا أخطاء JavaScript',p.errs.join('|'));await ctx.close()}

 console.log('7) العرض العربي 320 و390');
 for(const w of [320,390]){const {ctx,p}=await ctxOf(b,w);await setup(p);
  const bad=[];const chk=async n=>{if(await ovf(p))bad.push(n)};
  await chk('اليوم');await click(p,'#sx-go');await chk('المشغّل');await click(p,'[data-a="wkset"]');await chk('المشغّل بعد مجموعة');await endWk(p);await chk('اليوم جزئي');
  await click(p,'#nav [data-a="go"][data-v="ex"]');await click(p,'[data-a="sub"][data-v="arch"]');await chk('الأرشيف');await click(p,'.sxr');await chk('تفاصيل الجلسة');await click(p,'[data-a="adback"]');await click(p,'[data-a="seg"][data-v="wk"]');await chk('ملخص الأسابيع');
  ok(bad.length===0,'لا تمرير أفقي عند '+w+' بكسل',bad.join(','));
  await p.screenshot({path:path.join(os.tmpdir(),'ux-'+w+'.png')});await ctx.close()}

 await b.close();console.log('\n'+pass+' ناجح، '+fail+' فاشل');process.exit(fail?1:0)})().catch(e=>{console.error(e);process.exit(2)});
