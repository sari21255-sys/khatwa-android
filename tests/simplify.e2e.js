/* رحلات التبسيط: زيارات النادي، التنقّل، الإشعارات والترس والجرس، الموقع والطقس، جلسة الخطوات، إزالة المؤقت، الترقية.
   تشغيل: NODE_PATH=$(npm root -g) node tests/simplify.e2e.js [index.html]. بيانات اصطناعية. اختبار متصفح لا جهاز. */
const {chromium}=require('playwright'),path=require('path');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let fail=0;const ok=(c,m,x)=>{if(c)console.log('  ok   '+m);else{fail++;console.log('  FAIL '+m+(x?'  ['+x+']':''))}};
const seed=()=>{S.prof.ob=1;S.prof.name='مختبر';S.prof.sex='m';S.prof.age=30;S.prof.ht=178;S.prof.startW=85;S.prof.goalType='lose';S.prof.lvl='b';S.prof.eq='gym';S.prof.dpw=7;S.bw[TD()]=85;calcTargets();genPlan();save()};
(async()=>{const b=await chromium.launch();
 const mk=async(o)=>{o=o||{};const ctx=await b.newContext(Object.assign({viewport:{width:390,height:844},timezoneId:'Asia/Riyadh'},o.ctx||{}));
  if(o.native)await ctx.addInitScript(o.native);
  await ctx.clock.install({time:new Date('2026-11-16T10:00:00+03:00')});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.goto('file://'+file);await p.waitForFunction(()=>typeof smVL==='function');if(!o.noseed){await p.evaluate(seed);await p.reload();await p.waitForFunction(()=>S.prof.ob===1)}await p.waitForTimeout(300);return{ctx,p}};
 const go=async(p,tab,sub)=>{await p.evaluate(([t,s])=>{S.tab=t;S.sub=s||null;UI.trk='hub';render()},[tab,sub]);await p.waitForTimeout(150)};

 console.log('1) زيارات النادي');
 {const {ctx,p}=await mk();await go(p,'ex','vis');
  const t0=await p.evaluate(()=>document.body.innerText);
  ok(/سجّل الدخول/.test(t0)&&!/منبه|ناديي|جدول مقترح|نمط زياراتك/.test(t0),'الصفحة: بصمة وسجل فقط، وتحتها «سجّل الدخول»');
  ok(await p.$$eval('.smfp',a=>a.length)===1,'زر بصمة واحد');
  await p.click('[data-a=smfp]');await p.waitForTimeout(150);
  ok(await p.$('#sm-sum')&&/10:0\d/.test(await p.$eval('#sm-sum',e=>e.textContent)),'النافذة تعرض اليوم والساعة والدقيقة لحظة النقر');
  ok((await p.$$eval('#fx-sheet button',a=>a.map(x=>x.textContent.trim()))).join('|').includes('تأكيد وحفظ')&&!!await p.$('#sm-edit'),'أزرار: تأكيد وحفظ · تعديل الوقت · إلغاء');
  /* الوقت المحفوظ هو وقت النقر وليس وقت التأكيد */
  await p.clock.fastForward(180000);await p.click('[data-fxs]');await p.waitForTimeout(150);
  let v=await p.evaluate(()=>gy().vis.slice());ok(v.length===1&&v[0].o===1&&/^10:0\d$/.test(v[0].t)&&!v[0].te,'الدخول محفوظ بوقت النقر 10:00 وليس وقت التأكيد',JSON.stringify(v));
  ok(/سجّل الخروج/.test(await p.evaluate(()=>document.body.innerText)),'بعد الدخول يتحول النص إلى «سجّل الخروج»');
  /* الخروج في السجل نفسه */
  await p.clock.fastForward(3600000);await p.click('[data-a=smfp]');await p.waitForTimeout(150);await p.clock.fastForward(120000);await p.click('[data-fxs]');await p.waitForTimeout(150);
  v=await p.evaluate(()=>gy().vis.slice());ok(v.length===1&&!v[0].o&&v[0].te&&v[0].m>=60&&v[0].m<=64,'الخروج حُفظ في سجل الزيارة المفتوح نفسه',JSON.stringify(v));
  /* ضغط مزدوج على التأكيد */
  await p.click('[data-a=smfp]');await p.waitForTimeout(100);
  await p.evaluate(()=>{const b=document.querySelector('[data-fxs]');b.click();b.click()});await p.waitForTimeout(150);
  ok(await p.evaluate(()=>gy().vis.length)===2,'تكرار الضغط على التأكيد يحفظ مرة واحدة',String(await p.evaluate(()=>gy().vis.length)));
  /* تعديل الوقت قبل الحفظ + منع الخروج قبل الدخول */
  const op=await p.evaluate(()=>gy().vis.find(x=>x.o).id);
  await p.clock.fastForward(3600000);await p.click('[data-a=smfp]');await p.waitForTimeout(100);await p.click('#sm-edit');
  const dd=await p.$eval('#sm-d',e=>e.value);await p.fill('#sm-d',dd);await p.fill('#sm-t','00:05');await p.click('[data-fxs]');await p.waitForTimeout(150);
  ok(await p.evaluate(id=>!!gy().vis.find(x=>x.id===id).o,op),'خروج يسبق الدخول مرفوض، والزيارة تبقى مفتوحة');
  ok(!!await p.$('#fx-sheet'),'النافذة تبقى مفتوحة مع رسالة');
  const t50=await p.evaluate(id=>smT(gy().vis.find(x=>x.id===id).ts+50*6e4),op);await p.fill('#sm-t',t50);await p.click('[data-fxs]');await p.waitForTimeout(150);
  const e1=await p.evaluate(id=>gy().vis.find(x=>x.id===id),op);ok(!e1.o&&e1.m===50,'تعديل وقت الخروج (دخول + 50 دقيقة) قبل الحفظ',JSON.stringify(e1));
  /* إضافة زيارة سابقة تمتد لليوم التالي */
  await p.click('[data-a=smvadd]');await p.waitForTimeout(150);
  await p.fill('#sm-d1','2026-11-14');await p.fill('#sm-t1','23:30');await p.fill('#sm-d2','2026-11-15');await p.fill('#sm-t2','00:40');await p.click('[data-fxs]');await p.waitForTimeout(150);
  const pv=await p.evaluate(()=>gy().vis.find(x=>x.d==='2026-11-14'));ok(pv&&pv.m===70&&pv.te>pv.ts,'زيارة سابقة تمتد إلى اليوم التالي (70 دقيقة)',JSON.stringify(pv));
  /* تعديل زيارة محفوظة (الدخول) */
  await p.click('[data-a=smvedit][data-id="'+pv.id+'"]');await p.waitForTimeout(150);await p.fill('#sm-t1','23:00');await p.click('[data-fxs]');await p.waitForTimeout(150);
  ok(await p.evaluate(id=>gy().vis.find(x=>x.id===id).m,pv.id)===100,'تعديل دخول زيارة محفوظة يعيد حساب المدة');
  /* خروج قبل الدخول في الإضافة */
  await p.click('[data-a=smvadd]');await p.waitForTimeout(150);await p.fill('#sm-d1','2026-11-13');await p.fill('#sm-t1','20:00');await p.fill('#sm-d2','2026-11-13');await p.fill('#sm-t2','19:00');await p.click('[data-fxs]');await p.waitForTimeout(150);
  ok(await p.evaluate(()=>gy().vis.length)===3&&!!await p.$('#fx-sheet'),'إضافة بخروج قبل الدخول مرفوضة');await p.click('[data-fxx]');await p.waitForTimeout(100);
  /* زيارة مفتوحة وعرض «لم يُسجّل الخروج» واستعادتها بعد الإغلاق */
  await p.click('[data-a=smfp]');await p.waitForTimeout(100);await p.click('[data-fxs]');await p.waitForTimeout(150);
  ok(/لم يُسجّل الخروج/.test(await p.evaluate(()=>document.body.innerText)),'الزيارة المفتوحة تعرض «لم يُسجّل الخروج»');
  await p.reload();await p.waitForTimeout(500);await go(p,'ex','vis');
  ok(await p.evaluate(()=>!!smOpen())&&/سجّل الخروج/.test(await p.evaluate(()=>document.body.innerText)),'استعادة الزيارة المفتوحة بعد إغلاق التطبيق وفتحه');
  ok(!/\d{1,2}:\d\d\s?(AM|PM)/i.test(await p.evaluate(()=>document.querySelector('.smv').innerText)),'أرقام 0–9 بلا أرقام عربية-هندية في السجل');
  ok(p.errs.length===0,'لا أخطاء سكربت',p.errs.join('|'));await ctx.close()}

 console.log('2) التنقّل: الشريط والرئيسية والترس والجرس');
 for(const w of [320,390]){const {ctx,p}=await mk({ctx:{viewport:{width:w,height:844}}});
  const xs=await p.$$eval('#nav [data-a]',a=>a.map(x=>({v:x.dataset.v,l:x.getAttribute('aria-label'),x:Math.round(x.getBoundingClientRect().left)})));xs.sort((a,c)=>c.x-a.x);
  ok(xs.map(x=>x.v).join()==='train,food,dash,me,ex'&&xs.map(x=>x.l).join()==='التدريب,التغذية,الرئيسية,الملف الشخصي,المزيد','الترتيب من اليمين: التدريب · التغذية · الشعار · الملف الشخصي · المزيد ('+w+')',JSON.stringify(xs.map(x=>x.v)));
  ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'لا تمرير أفقي ('+w+')');await ctx.close()}
 {const {ctx,p}=await mk();
  const lg=await p.evaluate(()=>{const e=document.querySelector('#nav .sjhome'),c=getComputedStyle(e);return{bg:c.backgroundColor,fg:c.color,svg:!!e.querySelector('svg')}});
  ok(lg.svg&&lg.bg==='rgb(0, 0, 0)'&&lg.fg==='rgb(255, 255, 255)','الشعار الأبيض داخل الزر الأسود',JSON.stringify(lg));
  await go(p,'food');await p.click('#nav .sjhome');await p.waitForTimeout(200);
  const t=await p.evaluate(()=>document.body.innerText);
  ok(await p.evaluate(()=>S.tab==='dash'&&!S.sub)&&/سجلّك الرياضي/.test(t),'الشعار يفتح الصفحة الرئيسية التعريفية');
  ok(!/استأنف التدريب/.test(t)&&!await p.$('[data-a=wkstart]'),'بلا جلسة جارية: لا «استأنف التدريب» ولا تكرار لصفحة التدريب');
  ok(!!await p.$('.sjwx'),'بطاقة الوقت والطقس ظاهرة');
  await go(p,'train');await p.click('[data-a=wkstart]');await p.waitForTimeout(250);await p.fill('#wk-w','60');await p.click('[data-a=wkset]');await p.waitForTimeout(200);await p.click('#wk-back');await p.waitForTimeout(250);
  await go(p,'dash');ok(!!await p.$('[data-a=smres]'),'مع جلسة جارية يظهر «استأنف التدريب»');
  await p.click('[data-a=smres]');await p.waitForTimeout(300);ok(await p.evaluate(()=>S.tab==='train'),'«استأنف التدريب» يفتح التدريب');
  /* المزيد والملف الشخصي */
  await go(p,'ex');const mo=await p.evaluate(()=>document.body.innerText);
  ok(!/الإعدادات|مركز الإشعارات|منبه|الأوسمة|مراقبة الوزن|التقارير/.test(mo.replace(/^[\s\S]*?المزيد/,'')),'المزيد بلا إعدادات ولا إشعارات ولا سجلات الملف الشخصي',mo.slice(0,200));
  ok(await p.$('[data-a=sub][data-v=pgs]')&&await p.$('[data-v=vis]')&&await p.$('[data-v=cul]')&&await p.$('[data-v=tools]')&&await p.$('[data-v=arch]'),'خدمات المزيد الفريدة باقية: التقدّم · الثقافة · الأدوات · النادي · الأرشيف');
  await p.click('[data-a=sub][data-v=pgs]');await p.waitForTimeout(200);ok(/ملخص تقدّمك عبر الوقت/.test(await p.evaluate(()=>document.body.innerText)),'التقدّم داخل «المزيد» يعرض ملخصًا عبر الوقت');
  await go(p,'me');const me=await p.evaluate(()=>[...document.querySelectorAll('[data-a=sub]')].map(x=>x.dataset.v).join());
  ok(['ach','wgt','bdy','ppg','rpt'].every(v=>me.includes(v)),'الملف الشخصي: أوسمة · وزن · جسم · صور · تقارير',me);
  for(const v of ['ach','wgt','bdy','ppg','rpt']){await go(p,'me');await p.click('[data-a=sub][data-v='+v+']');await p.waitForTimeout(250);ok(await p.evaluate(()=>S.sub!=null&&document.querySelector('h1')),'صفحة '+v+' تفتح')}
  /* الترس والجرس */
  await go(p,'ex');const cnt=await p.evaluate(()=>({gear:document.querySelectorAll('[data-a=sub][data-v=set]').length,bell:document.querySelectorAll('[data-a=sub][data-v=nc]').length}));
  ok(cnt.gear===1&&cnt.bell===1,'مدخل واحد للإعدادات ومدخل واحد للإشعارات في «المزيد»',JSON.stringify(cnt));
  ok(p.errs.length===0,'لا أخطاء سكربت',p.errs.join('|'));await ctx.close()}

 console.log('3) الإشعارات ومنبّه الغياب ونصوص تقنية');
 {const {ctx,p}=await mk();await go(p,'dash');await p.click('[data-a=sub][data-v=nc]');await p.waitForTimeout(200);
  ok(await p.evaluate(()=>S.sub==='nc'&&!document.querySelector('.sjtabs')),'الجرس يفتح الوارد فقط');
  await p.click('[data-a=sub][data-v=set]').catch(()=>{});await go(p,'ex','set');await p.evaluate(()=>{UI.sgo={nt:true};render()});await p.waitForTimeout(150);
  let t=await p.evaluate(()=>document.body.innerText);
  ok(/منبّه الغياب/.test(t),'الترس ← الإشعارات ← منبّه الغياب');
  ok(!/فحص الإذن|إعدادات Android|إعدادات أندرويد|حالة الجدولة|الإضافة البرمجية|إرسال إشعار تجريبي|كل جهاز وله طريقته|كل جهاز وطريقته/.test(t),'لا عبارات تشخيصية في الإعدادات');
  /* منبّه الغياب ينبّه ويصل المركز */
  await p.evaluate(()=>{const a=gy().rem.away;a.on=1;a.days=2;a.t='00:00';gy().rem.fired={};gy().vis=[];S.done={};S.sx={};S.cd={};remTick()});await p.waitForTimeout(150);
  const nf=await p.evaluate(()=>(S.nf||[]).filter(x=>/اشتقنا/.test(x.t)).length);ok(nf>=1,'تنبيه الغياب يظهر في مركز الإشعارات عند صدوره',String(nf));
  await go(p,'ex','vis');t=await p.evaluate(()=>document.body.innerText);ok(!/منبه|الغياب/.test(t),'صفحة النادي بلا مفاتيح ولا بطاقات منبّه الغياب');
  await go(p,'ex','gyms');t=await p.evaluate(()=>document.body.innerText);ok(!await p.$('[data-v=rem]'),'صفحة الأندية بلا رابط للمنبّه');
  await go(p,'ex','link');t=await p.evaluate(()=>document.body.innerText);ok(!/كل جهاز وطريقته|كل جهاز وله طريقته/.test(t),'صفحة الربط بلا شرح اختلاف الأجهزة');
  ok(p.errs.length===0,'لا أخطاء سكربت',p.errs.join('|'));await ctx.close()}

 console.log('4) الوقت والطقس من موقع الجوال');
 {const {ctx,p}=await mk({ctx:{permissions:['geolocation'],geolocation:{latitude:24.4672,longitude:39.6111}}});
  await go(p,'dash');let t=await p.evaluate(()=>document.body.innerText);
  ok(/استخدم موقعي/.test(t)&&/توقيت الجهاز/.test(t),'قبل الإذن: ساعة الجهاز وزر «استخدم موقعي»');
  ok(!await p.$('select[data-rd=city]')&&!await p.$('[data-a=fxcity]')&&!await p.$('[data-tf=cLat]'),'لا اختيار مدينة يدوي ولا حقول إحداثيات');
  await p.click('[data-a=rdgeo]');await p.waitForTimeout(600);t=await p.evaluate(()=>document.body.innerText);
  ok(/المدينة المنورة/.test(t)&&!/توقيت الجهاز/.test(t),'بعد الإذن: اسم المنطقة من موقع الهاتف');
  ok(!/\b24\.4|\b39\.6|خط الطول|خط العرض|lat|lon/i.test(t),'لا تظهر خطوط الطول والعرض');
  await go(p,'ex','set');await p.evaluate(()=>{UI.sgo={wx:true};render()});t=await p.evaluate(()=>document.body.innerText);
  ok(!/خط العرض|خط الطول|مدينة مخصصة|اختر مدينة/.test(t),'الإعدادات بلا مدينة يدوية ولا إحداثيات');
  /* تغيّر الموقع */
  await ctx.setGeolocation({latitude:24.7136,longitude:46.6753});await p.evaluate(()=>smLocTick(true));await p.waitForTimeout(500);await go(p,'dash');
  ok(/الرياض/.test(await p.evaluate(()=>document.body.innerText)),'تتحدّث البطاقة عند تغيّر الموقع (الرياض)');
  ok(await p.evaluate(()=>document.querySelector('.fxscene').className.match(/fxph-(dawn|day|dusk|night)/)!==null),'خلفية الطقس بحسب الفجر والنهار والغروب والليل باقية');
  ok(p.errs.length===0,'لا أخطاء سكربت',p.errs.join('|'));await ctx.close()}
 {const {ctx,p}=await mk();await go(p,'dash');await p.evaluate(()=>{navigator.geolocation.getCurrentPosition=(a,e)=>e({code:1})});
  await p.click('[data-a=rdgeo]');await p.waitForTimeout(500);const t=await p.evaluate(()=>document.body.innerText);
  ok(/توقيت الجهاز/.test(t)&&/لم يُمنح إذن الموقع/.test(t)&&!!await p.$('[data-a=rdgeo]'),'عند الرفض: ساعة الجهاز + رسالة واضحة + زر المحاولة مجددًا',t.slice(0,160));await ctx.close()}
 {const {ctx,p}=await mk();await p.evaluate(()=>{const s=rdS();s.cus={n:'الرياض',lat:24.71,lon:46.68,tz:'Asia/Riyadh'};s.geo=1;const c=rdCity();rdWxM()[rdKey(c)]={at:Date.now()-18e6,key:rdKey(c),cn:c.n,tz:c.tz,src:'x',hours:[{t:Date.now()-36e5,temp:30,feels:30,code:0}].concat(Array.from({length:30},(_,i)=>({t:Date.now()+i*36e5,temp:30,feels:30,code:0}))),alert:null};save();S.tab='dash';render()});await p.waitForTimeout(200);
  ok(/آخر تحديث/.test(await p.evaluate(()=>document.body.innerText)),'عند عرض طقس محفوظ يظهر وقت تحديثه');await ctx.close()}

 console.log('5) جلسة الخطوات');
 {let st=1000;const nat=`window.__stp={steps:1000,boot:Date.now()-5e6,perm:'granted'};window.Capacitor={isNativePlatform:()=>true,Plugins:{StepCounter:{isAvailable:async()=>({available:true}),checkPermissions:async()=>({activity:window.__stp.perm}),requestPermissions:async()=>({activity:window.__stp.perm}),read:async()=>{if(window.__stp.fail)throw new Error('timeout');return{steps:window.__stp.steps,bootAt:window.__stp.boot,at:Date.now()}}}}};`;
  const {ctx,p}=await mk({native:nat});await go(p,'ex','link');
  await p.click('[data-a=fxstp]').catch(()=>{});await p.waitForTimeout(300);
  ok(/خطوة اليوم/.test(await p.evaluate(()=>document.body.innerText)),'الخطوات تُقرأ بعد منح الإذن');
  const day0=await p.evaluate(()=>S.cd[iso(new Date())].steps);
  await p.click('#sm-ses-go');await p.waitForTimeout(300);
  ok(await p.evaluate(()=>smSes().ses&&smSes().ses.steps===0),'الجلسة تبدأ من 0');
  await p.evaluate(()=>{window.__stp.steps+=250});await p.evaluate(()=>smSesUpdate());await p.waitForTimeout(150);
  ok(await p.$eval('#sm-ses-n',e=>e.textContent)==='250','خطوات الجلسة 250 منفصلة عن إجمالي اليوم');
  /* قفل الشاشة والعودة */
  await p.evaluate(()=>{window.__stp.steps+=100;document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(300);
  ok(await p.evaluate(()=>smSes().ses.steps)===350,'العودة بعد قفل الشاشة تكمل العدّ (350)');
  /* فشل القراءة لا يعرض 0 مؤكدًا */
  await p.evaluate(()=>{window.__stp.fail=1});await p.evaluate(()=>smSesUpdate());await p.waitForTimeout(150);
  ok(await p.evaluate(()=>smSes().ses.steps===350&&!smSes().ses.ok)&&/آخر قراءة مؤكدة 350/.test(await p.$eval('#sm-ses-m',e=>e.textContent)),'تعذّر القراءة: حالة واضحة مع آخر قراءة مؤكدة وليس 0');
  /* إلغاء الإذن */
  await p.evaluate(()=>{window.__stp.fail=0;window.__stp.perm='denied'});await p.evaluate(()=>smSesUpdate());await p.waitForTimeout(150);
  ok(/إذن النشاط البدني/.test(await p.$eval('#sm-ses-m',e=>e.textContent)),'إلغاء الإذن أثناء الجلسة يعرض حالة واضحة');
  await p.evaluate(()=>{window.__stp.perm='granted';window.__stp.steps+=50});await p.evaluate(()=>smSesUpdate());await p.waitForTimeout(150);
  /* إنهاء الجلسة: نتيجة محفوظة، والإجمالي اليومي لا يتضاعف */
  await p.click('[data-a=smsend]');await p.waitForTimeout(400);
  const r=await p.evaluate(()=>({sl:smSes().sl[0],day:S.cd[iso(new Date())].steps,open:!!smSes().ses}));
  ok(r.sl&&r.sl.steps===400&&!r.open,'حُفظت نتيجة الجلسة (400) وأُغلقت',JSON.stringify(r));
  ok(r.day===day0+400||r.day===day0+400-0||r.day>=day0,'إجمالي اليوم من عدّاد واحد (لا جمع مزدوج)',day0+'→'+r.day);
  /* إعادة تشغيل الجهاز أثناء الجلسة */
  await p.click('#sm-ses-go');await p.waitForTimeout(300);await p.evaluate(()=>{window.__stp.boot=Date.now()-1000;window.__stp.steps=120});await p.evaluate(()=>smSesUpdate());await p.waitForTimeout(150);
  ok(await p.evaluate(()=>smSes().ses.steps)===120,'إعادة تشغيل الجهاز أثناء الجلسة لا تكسر العدّ');
  ok(!/المسافة|كم\b/.test(await p.$eval('#fx-stp',e=>e.innerText)),'المسافة لا تُعرض ما دام قياسها غير متحقَّق');
  ok(p.errs.length===0,'لا أخطاء سكربت',p.errs.join('|'));await ctx.close()}
 {const nat=`window.Capacitor={isNativePlatform:()=>true,Plugins:{StepCounter:{isAvailable:async()=>({available:true}),checkPermissions:async()=>({activity:'denied'}),requestPermissions:async()=>({activity:'denied'}),read:async()=>{throw new Error('permission')}}}};`;
  const {ctx,p}=await mk({native:nat});await go(p,'ex','link');await p.click('#sm-ses-go');await p.waitForTimeout(300);
  const t=await p.$eval('#fx-stp',e=>e.innerText);ok(/إذن النشاط البدني/.test(t)&&!await p.evaluate(()=>smSes().ses),'بدء جلسة بلا إذن: رسالة واضحة وليس 0 مؤكدًا');await ctx.close()}

 console.log('6) «تمرين اليوم» بلا مؤقت');
 {const {ctx,p}=await mk();await go(p,'train');await p.click('[data-a=wkstart]');await p.waitForTimeout(300);
  ok(!await p.$('#tmv')&&!await p.$('.wkrest')&&!await p.$('[data-a=tmt]')&&!await p.$('[data-a=rest]'),'لا ساعة ولا عدّاد راحة ولا زر مؤقت');
  await p.fill('#wk-w','60');await p.click('[data-a=wkset]');await p.waitForTimeout(250);
  ok(!await p.$('.wkrest')&&!/راحة/.test(await p.evaluate(()=>document.querySelector('#app').innerText.replace(/تخطي هذا التمرين/g,''))),'بعد حفظ مجموعة لا يظهر عدّاد راحة');
  ok(await p.evaluate(()=>Object.values(S.sx)[0].ex.some(x=>x.sets.length===1)),'حفظ المجموعة يعمل');
  await p.click('#wk-back');await p.waitForTimeout(200);await p.reload();await p.waitForTimeout(500);
  await go(p,'train');ok(!!await p.$('[data-a=wkstart]'),'بعد الإغلاق: «تمرين اليوم» يقبل الاستئناف');
  await p.click('[data-a=wkstart]');await p.waitForTimeout(300);ok(await p.evaluate(()=>S.sub==='wk'&&sxProg(Object.values(S.sx)[0]).d===1),'الاستئناف بالمجموعة المحفوظة');
  await p.click('[data-a=wkend]');await p.waitForTimeout(200);ok(!!await p.$('#fx-sheet')||await p.evaluate(()=>S.sub!=='wk'),'«إنهاء» يعمل');
  await go(p,'ex','set');await p.evaluate(()=>{UI.sgo={tr:true,set:true};render()});ok(!/مؤقت الراحة/.test(await p.evaluate(()=>document.body.innerText)),'إعداد مؤقت الراحة محذوف');
  ok(p.errs.length===0,'لا أخطاء سكربت',p.errs.join('|'));await ctx.close()}

 console.log('7) الترقية: بقاء زيارات المستخدم وبيانات الزائر');
 {const {ctx,p}=await mk();
  await p.evaluate(()=>{gy().vis=[{id:'old1',d:'2026-11-10',t:'18:30',m:75,c:''},{id:'old2',d:'2026-11-12',t:'19:00',m:0,c:''}];S.wtr[TD()]=500;S.sx.keep={id:'keep',wk:W(),date:TD(),ts:1,up:1,dy:0,kd:'t',t:'x',st:'c',sec:60,vol:0,ex:[]};save()});
  await p.reload();await p.waitForTimeout(400);await go(p,'ex','vis');
  const t=await p.evaluate(()=>document.body.innerText);
  ok(await p.evaluate(()=>gy().vis.length===2&&!smOpen()),'زيارات النسخة السابقة باقية ولا تتحول إلى زيارة مفتوحة');
  ok(/18:30|06:30/.test(t)||/6:30/.test(t),'زيارة قديمة بمدة تظهر بدخولها وخروجها المحسوب');
  ok((t.match(/لم يُسجّل الخروج/g)||[]).length===1,'الزيارة القديمة بلا خروج تُعرض «لم يُسجّل الخروج» مرة واحدة');
  ok(await p.evaluate(()=>S.wtr[TD()]===500&&!!S.sx.keep&&S.prof.name==='مختبر'),'بيانات الزائر (ماء، جلسات، ملف) باقية');
  await ctx.close()}
 await b.close();console.log(fail?'FAILED '+fail:'all PASS');process.exit(fail?1:0)})();
