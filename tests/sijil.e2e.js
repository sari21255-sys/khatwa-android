/* SIJIL: التسجيل السريع (+)، الأرقام الغربية، جدول المجموعات الأخضر في كل سمة، الاستئناف بعد إعادة الفتح،
   والترقية من بيانات النسخة السابقة. تشغيل: NODE_PATH=$(npm root -g) node tests/sijil.e2e.js [index.html]. بيانات اصطناعية. */
const {chromium}=require('playwright'),path=require('path');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let fail=0,pass=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok   '+m)}else{fail++;console.log('  FAIL '+m+(x?'  ['+x+']':''))}};
const T=['black','white','blue','emerald','olive','purple'];
const seed=()=>{S.prof.ob=1;S.prof.name='مختبر';S.prof.sex='m';S.prof.age=30;S.prof.ht=178;S.prof.startW=85;S.prof.goalType='lose';S.prof.lvl='b';S.prof.eq='gym';S.prof.dpw=7;S.bw[TD()]=85;calcTargets();genPlan();S.plan=[0,1,2,3,4,5,6].map(()=>({t:'يوم',ex:[E('بنش',3,8,40)]}));S.tab='dash';S.sub=null;save();render()};
const IND=/[٠-٩]/;
(async()=>{const b=await chromium.launch();
 const mk=async(w,theme,pre)=>{const ctx=await b.newContext({viewport:{width:w||390,height:844}});if(theme)await ctx.addInitScript(t=>{try{if(!sessionStorage.__s){sessionStorage.__s=1;localStorage.setItem('fit_theme',t)}}catch(e){}},theme);if(pre)await ctx.addInitScript(pre);const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto('file://'+file);await p.waitForFunction(()=>typeof S!=='undefined');return{ctx,p}};
 /* 1) شريط التنقّل: الشعار في الوسط يعيد إلى «اليوم»، ولا قائمة «+» */
 {const {ctx,p}=await mk(390);await p.evaluate(seed);await p.waitForTimeout(200);
  const ids=await p.$$eval('#nav [data-a]',a=>a.map(x=>x.dataset.v||x.dataset.a));
  ok(ids.length===5,'خمس وجهات في الشريط السفلي',ids.join());
  ok(!!await p.$('#nav .sjhome')&&!await p.$('.sjq'),'الشعار يحلّ محل «+» ولا درج تسجيل سريع مكرّر');
  const lab=await p.$eval('#nav .sjhome',e=>e.getAttribute('aria-label')||e.textContent);ok(/اليوم/.test(lab),'وسم قارئ الشاشة للشعار يذكر «اليوم»',lab);
  await p.evaluate(()=>{S.tab='pg';S.sub=null;render()});await p.click('#nav .sjhome');await p.waitForTimeout(200);
  ok(await p.evaluate(()=>S.tab==='dash'),'الضغط على الشعار يعيد إلى «اليوم»');
  const sel=await p.$eval('#nav .sjhome',e=>e.classList.contains('on')||e.getAttribute('aria-current')==='page'||e.getAttribute('aria-selected')==='true');ok(sel,'حالة التحديد واضحة للشعار في «اليوم»');
  /* التمرين: الشريط مخفي داخل المشغّل */
  await p.evaluate(()=>{S.tab='train';S.sub=null;render()});
  ok(p.errs.length===0,'لا أخطاء سكربت',p.errs.join('|'));await ctx.close()}
 /* 2) لا أرقام هندية في الشاشات الرئيسية */
 {const {ctx,p}=await mk(390);await p.evaluate(seed);const bad=[];
  for(const [t,s] of [['dash',null],['train',null],['pg',null],['ex',null],['ex','set'],['ex','rpt'],['ex','wgt']]){await p.evaluate(([t,s])=>{S.tab=t;S.sub=s;render()},[t,s]);await p.waitForTimeout(120);
   const txt=await p.evaluate(()=>document.body.innerText);if(IND.test(txt))bad.push(t+':'+(s||''))}
  ok(bad.length===0,'الأرقام 0–9 وحدها في اليوم/التمرين/التقدّم/المزيد/الإعدادات/التقارير/الوزن',bad.join(','));await ctx.close()}
 /* 3) جدول المجموعات الأخضر في كل سمة + الاستئناف */
 for(const th of T){
  const {ctx,p}=await mk(390,th);await p.evaluate(seed);
  await p.evaluate(()=>{sxGo(sxPart(TI()),TI());render()});await p.waitForTimeout(300);
  const has=await p.$('#wk-w');if(!has){ok(false,th+': مشغّل التمرين يفتح');await ctx.close();continue}
  await p.fill('#wk-w','40');await p.fill('#wk-r','10');await p.click('[data-a=wkset]');await p.waitForTimeout(300);
  const g=await p.evaluate(()=>{const r=document.querySelector('.sjsr.sv');const c=r&&r.querySelector('.sjck.on');const ck=c&&getComputedStyle(c);const rs=r&&getComputedStyle(r);const nx=document.querySelector('.sjsr.cur');return{row:!!r,chk:!!c,rbg:rs&&rs.backgroundColor,cbg:ck&&ck.backgroundColor,cur:!!nx,saved:(S.sx&&Object.values(S.sx).some(x=>x.ex&&x.ex.some(e=>e.sets&&e.sets.length)))}});
  const green=s=>{const m=/rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(s||'');return !!m&&(+m[2]>+m[1]&&+m[2]>=+m[3])};
  ok(g.row&&g.chk&&green(g.rbg)&&green(g.cbg)&&g.cur&&g.saved,th+': صف المجموعة المحفوظة أخضر بعلامة صح بيضاء والصف التالي محايد',JSON.stringify(g));
  await p.screenshot({path:'/tmp/pl-'+th+'.png'});
  /* إعادة الفتح */
  const pre=await p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('fit1')).sx||{}).length);
  await p.reload();await p.waitForFunction(()=>typeof fxEnhance==='function'&&document.querySelector('#app')&&document.querySelector('#app').innerHTML.length>50);await p.waitForTimeout(400);
  const saved=await p.evaluate(()=>Object.values(S.sx||{}).some(x=>x.ex&&x.ex.some(e=>e.sets&&e.sets.length&&e.sets[0].w==40&&e.sets[0].r==10)));
  ok(saved,th+': المجموعة محفوظة بعد إعادة الفتح (الوزن والتكرارات)',await p.evaluate(pre=>JSON.stringify(Object.values(S.sx||{}).map(x=>({st:x.st,ex:(x.ex||[]).slice(0,2).map(e=>e.sets)})))+' pre='+pre+' now='+Object.keys(S.sx||{}).length+' ob='+S.prof.ob+' date='+TD(),pre));
  const resume=await p.evaluate(()=>{const e=document.querySelector('#sx-go');return e?e.innerText:''});
  ok(/أكمل|استئناف|متابعة/.test(resume),th+': «اليوم» يعرض زر الاستئناف مباشرة',resume);
  await p.click('#sx-go');await p.waitForTimeout(300);
  ok(await p.evaluate(()=>!!document.querySelector('.sjsr.sv')),th+': الاستئناف يفتح الجلسة نفسها والصف الأخضر باقٍ');
  ok(p.errs.length===0,th+': لا أخطاء سكربت',p.errs.join('|'));await ctx.close()}
 /* 4) ترقية من بيانات النسخة السابقة (اصطناعية: حالة مولَّدة بنفس البنية القديمة + سمة light القديمة) */
 {const {ctx,p}=await mk(390);await p.evaluate(seed);await p.evaluate(()=>{S.bw['2026-10-01']=90;save()});const old=await p.evaluate(()=>localStorage.getItem('fit1'));await ctx.close();
  const ctx2=await b.newContext({viewport:{width:390,height:844}});await ctx2.addInitScript(o=>{try{if(!localStorage.getItem('fit1')){localStorage.setItem('fit1',o);localStorage.setItem('fit_theme','light');localStorage.setItem('fit_font','c')}}catch(e){}},old);
  const q=await ctx2.newPage();const errs=[];q.on('pageerror',e=>errs.push(e.message));await q.goto('file://'+file);await q.waitForFunction(()=>typeof S!=='undefined');await q.waitForTimeout(500);
  const r=await q.evaluate(()=>({n:S.prof.name,bw:Object.keys(S.bw).length,th:document.documentElement.getAttribute('data-sj'),home:!!document.querySelector('#nav'),welcome:!!document.querySelector('#wel-go')}));
  ok(r.n==='مختبر'&&r.bw>=2&&r.home&&!r.welcome,'الترقية: المستخدم القديم وبياناته يدخلان «اليوم» مباشرة بلا ترحيب',JSON.stringify(r));
  ok(r.th==='white','الترقية: السمة الفاتحة القديمة تُحوَّل إلى الأبيض',r.th);
  for(const t of ['dash','train','pg','ex']){await q.click('#nav button[data-v='+t+']');await q.waitForTimeout(100)}
  ok(errs.length===0,'الترقية: التنقل بين التبويبات بلا أخطاء',errs.join('|'));await ctx2.close()}
 /* 5) خطة التمارين: نوع اليوم منسدل، تمارين تناسب اليوم بلغتين وأيقونة، وخيار «أخرى» */
 {const {ctx,p}=await mk(390);await p.evaluate(seed);await p.evaluate(()=>{S.tab='ex';S.sub='plan';render()});await p.waitForTimeout(200);
  const opts=await p.$$eval('[data-dt="0"] option',a=>a.map(x=>x.value));ok(['ظهر','باي','تراي','أكتاف','جسم علوي','جسم سفلي','ظهر وبايسبس'].every(x=>opts.includes(x)),'قائمة نوع اليوم تضم الظهر والباي والتراي والأكتاف والجسم العلوي والسفلي',opts.join());
  const hues=await p.$$eval('.sjday',a=>new Set(a.map(x=>x.style.getPropertyValue('--dc'))).size);ok(hues===7,'لكل يوم لون خاص (7)',String(hues));
  await p.selectOption('[data-dt="1"]','ظهر وبايسبس');await p.waitForTimeout(150);
  const L=await p.$$eval('.sjday[data-d="1"] .sjxo:not(.oth)',a=>a.map(x=>({n:x.dataset.n,en:x.querySelector('small').textContent,ico:!!x.querySelector('svg')})));
  const grp=await p.evaluate(n=>n.map(x=>XL.find(a=>a.n===x).g),L.map(x=>x.n));
  ok(L.length>5&&grp.every(g=>g==='back'||g==='bic')&&L.every(x=>x.en&&x.ico),'«ظهر وبايسبس» يعرض تمارين الظهر والباي فقط بالعربية والإنجليزية وأيقونة',L.length+' '+[...new Set(grp)].join());
  await p.click('.sjday[data-d="1"] summary');await p.click('.sjday[data-d="1"] .sjxo >> nth=0');await p.click('.sjday[data-d="1"] [data-a=add]');await p.waitForTimeout(200);
  ok(await p.evaluate(n=>S.plan[1].ex.some(e=>e.n===n),L[0].n),'اختيار تمرين من القائمة وإضافته إلى اليوم');
  await p.click('.sjday[data-d="1"] summary');await p.click('.sjday[data-d="1"] .sjxo.oth');await p.fill('.sjday[data-d="1"] [data-f=n]','تمرين كتبته');await p.click('.sjday[data-d="1"] [data-a=add]');await p.waitForTimeout(200);
  ok(await p.evaluate(()=>S.plan[1].ex.some(e=>e.n==='تمرين كتبته')),'خيار «أخرى» يقبل اسمًا يكتبه المستخدم');
  ok(p.errs.length===0,'لا أخطاء سكربت',p.errs.join('|'));await ctx.close()}
 /* 6) مسارات التمرين الكبرى */
 {const {ctx,p}=await mk(390);await p.evaluate(seed);await p.click('#nav button[data-v=train]');await p.waitForTimeout(200);
  const ks=await p.$$eval('.sjtk',a=>a.map(x=>x.dataset.v));ok(JSON.stringify(ks)===JSON.stringify(['iron','run','swim','cali','fn']),'خمسة مسارات: الحديد، الجري، السباحة، الكالسثينكس، التدريب الوظيفي',ks.join());
  await p.click('.sjtk[data-v=iron]');await p.waitForTimeout(150);
  const segs=await p.$$eval('.seg [data-a=seg]',a=>a.map(x=>x.dataset.v));ok(segs.join()==='today,plan,disc','مسار الحديد: اليوم، الخطة، اكتشف فقط (بلا الأسبوع ولا لم تتحقق ولا الكارديو)',segs.join());
  ok(!await p.$('.tm')&&!await p.$('[data-k=machine]'),'لا بطاقة مؤقت منفصلة ولا زر تصوير الجهاز');
  ok(!!await p.$('#sx-go,[data-a=wkstart],[data-a=sxgo]')||/ابدأ|أكمل/.test(await p.evaluate(()=>document.body.innerText)),'مسار الحديد يعرض بدء التمرين');
  await p.click('[data-a=seg][data-v=disc]');await p.waitForTimeout(150);const dv=await p.$$eval('[data-a=sub]',a=>a.map(x=>x.dataset.v));ok(['exl','nau','prg'].every(x=>dv.includes(x))&&!dv.includes('aip')&&!await p.$('#bld-n,[data-a=bldsave]'),'«اكتشف» في الحديد يضم المكتبة والأجهزة والبرامج دون الذكاء الاصطناعي ومولّد الجلسات',dv.join());
  await p.click('[data-a=trkhub]');await p.click('#nav button[data-v=pg]');ok(/جاهزية العضلات/.test(await p.evaluate(()=>document.body.textContent)),'جاهزية العضلات انتقلت إلى «التقدّم»');await p.click('#nav button[data-v=train]');await p.click('.sjtk[data-v=iron]');
  await p.click('[data-a=trkhub]');await p.click('.sjtk[data-v=run]');await p.click('[data-a=trk][data-v=cardio]');await p.waitForTimeout(150);ok(/الكارديو/.test(await p.evaluate(()=>document.querySelector('h1').innerText))&&!!await p.$('[data-a=ss]'),'مسار الكارديو يضم تسجيل الجلسات والبيانات');
  for(const k of ['cali','swim','run','fn']){await p.click('[data-a=trkhub]');await p.click('.sjtk[data-v='+k+']');await p.waitForTimeout(100);ok(!await p.$('.sjemp')&&!!await p.$('.sjtabs'),'مسار '+k+' يعرض تبويباته')}
  await p.click('#nav button[data-v=train]');ok(!!await p.$('.sjtk'),'زر التمرين في الشريط يعيد إلى قائمة المسارات');
  ok(p.errs.length===0,'لا أخطاء سكربت',p.errs.join('|'));await ctx.close()}
 await b.close();console.log('\n'+pass+' ناجح، '+fail+' فاشل');process.exit(fail?1:0)})();
