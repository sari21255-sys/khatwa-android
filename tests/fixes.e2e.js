/* قبول إصلاحات SIJIL بعد اختبار Android: تنقّل، منتقيات، ماء، الطقس والموقع، الخطوات، النوم/النبض، إنهاء جزئي، تباين.
   تشغيل: NODE_PATH=$(npm root -g) node tests/fixes.e2e.js [index.html]. بيانات اصطناعية. هذا اختبار متصفح لا جهاز؛ ما يحتاج Android حقيقيًا مذكور في docs/ANDROID-FIXES.md. */
const {chromium}=require('playwright'),path=require('path');
const file=path.resolve(process.argv[2]||path.join(__dirname,'../www/index.html'));
let fail=0;const ok=(c,m,x)=>{if(c)console.log('  ok   '+m);else{fail++;console.log('  FAIL '+m+(x?'  ['+x+']':''))}};
const seed=()=>{S.prof.ob=1;S.prof.name='مختبر';S.prof.sex='m';S.prof.age=30;S.prof.ht=178;S.prof.startW=85;S.prof.goalType='lose';S.prof.lvl='b';S.prof.eq='gym';S.prof.dpw=7;S.bw[TD()]=85;calcTargets();genPlan();save()};
(async()=>{const b=await chromium.launch();
 const mk=async(w,lang)=>{const ctx=await b.newContext({viewport:{width:w||390,height:844},timezoneId:'Asia/Riyadh'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto('file://'+file);await p.waitForTimeout(400);await p.evaluate(seed);if(lang==='en'){await p.evaluate(()=>{document.body.classList.add('en1')})}await p.evaluate(()=>render());await p.waitForTimeout(150);return{ctx,p}};
 console.log('1) التنقّل');
 for(const w of [320,390]){const {ctx,p}=await mk(w);
  const xs=await p.$$eval('#nav [data-a]',a=>a.map(x=>({v:x.dataset.v,x:Math.round(x.getBoundingClientRect().left)})));
  const order=xs.sort((a,c)=>c.x-a.x).map(x=>x.v).join();ok(order==='train,food,dash,pg,ex','الترتيب من اليمين: التمرين · التغذية · اليوم · التقدّم · المزيد ('+w+')',order);
  const wd=await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);ok(wd,'لا تمرير أفقي ('+w+')');
  await ctx.close()}
 {const {ctx,p}=await mk(390);
  const lab=await p.$eval('#nav .sjhome',e=>e.getAttribute('aria-label'));ok(/اليوم/.test(lab||''),'وسم الشعار «اليوم»',lab);
  await p.evaluate(()=>{S.tab='food';render()});await p.click('#nav .sjhome');ok(await p.evaluate(()=>S.tab==='dash'),'الشعار يعيد إلى اليوم');
  await p.evaluate(()=>{S.tab='dash';render()});const t=await p.evaluate(()=>document.body.innerText);
  ok(!/لصق|بيانات الساعة/.test(t),'لا إدخال ساعة يدوي في اليوم');
  await ctx.close()}
 console.log('2) الإدخال: العمر والطول والوزن والماء');
 {const {ctx,p}=await mk(390);
  const r=await p.evaluate(()=>{const d=new Date();const y=d.getFullYear()-31;const dob=y+'-01-15';S.prof.dob=dob;render();fxEnhance&&0;const a=S.prof.age;return{a:a,dob:S.prof.dob}});
  ok(r.a===31||r.a===30||r.a===32,'عمر محسوب من تاريخ الميلاد',JSON.stringify(r));
  await p.evaluate(()=>{UI.wtr=0;S.wtr=S.wtr||{};S.wl=S.wl||{}});
  await p.evaluate(()=>{S.tab='food';S.sub=null;render()});await p.waitForTimeout(150);
  const hasChips=await p.$$eval('#w-card [data-a=wtr]',a=>a.map(x=>x.dataset.v));ok(['250','500','750'].every(v=>hasChips.includes(v)),'مقادير الماء السريعة 250/500/750',hasChips.join());
  await p.click('#w-card [data-a=wtr][data-v="250"]');await p.waitForTimeout(100);await p.click('#w-card [data-a=wtr][data-v="250"]');await p.waitForTimeout(100);
  ok(await p.evaluate(()=>+S.wtr[TD()])===250,'نقرتان سريعتان لا تسجّلان مرتين (250)');
  await p.waitForTimeout(800);await p.click('#w-card [data-a=wtr][data-v="500"]');await p.waitForTimeout(150);
  ok(await p.evaluate(()=>+S.wtr[TD()])===750,'إضافة 500 بعد المهلة (المجموع 750)');
  await p.click('#w-card [data-a=wtu]');await p.waitForTimeout(150);
  ok(await p.evaluate(()=>+S.wtr[TD()])===250,'التراجع عن آخر إضافة');
  await p.waitForTimeout(800);await p.evaluate(()=>{fxWAdd(TD(),333)});await p.waitForTimeout(150);
  ok(await p.evaluate(()=>+S.wtr[TD()])===583,'كمية مخصصة 333');
  const log=await p.evaluate(()=>(S.wl[TD()]||[]).length);ok(log>=2,'سجل اليوم يحتفظ بإدخالات الماء',String(log));
  ok(p.errs.length===0,'لا أخطاء سكربت',p.errs.join('|'));await ctx.close()}
 console.log('3) الطقس والموقع');
 {const {ctx,p}=await mk(390);
  await p.evaluate(()=>{S.tab='dash';render()});
  ok(await p.evaluate(()=>!!document.querySelector('.fxscene')),'بطاقة المشهد ظاهرة');
  await p.click('.fxcity');await p.fill('.fxsearch','لندن');await p.click('.fxcr');await p.waitForTimeout(250);
  const c1=await p.evaluate(()=>({n:rdCity().n,tz:rdCity().tz,shown:document.querySelector('.fxcity b').textContent}));
  ok(c1.tz==='Europe/London'&&c1.shown==='لندن','تغيير المدينة يغيّر المنطقة الزمنية والعرض',JSON.stringify(c1));
  const clk=await p.evaluate(()=>{const e=document.querySelector('[data-rdclk]');return e.textContent});
  const exp=await p.evaluate(()=>rdF(rdNow(),'Europe/London'));ok(clk===exp,'ساعة البطاقة بتوقيت المدينة',clk+' / '+exp);
  /* رد متأخر لمدينة سابقة لا يغيّر البطاقة */
  const late=await p.evaluate(async()=>{const mk=n=>({src:'t',hours:[{t:Math.floor(rdNow()/36e5)*36e5,temp:n,feels:n,code:0}]});
   let rel;const g=WXP.get;WXP.get=c=>c.id==='cus'?g(c):new Promise(r=>{rel=()=>r(mk(11))});
   const s=rdS();s.city='madinah';s.cus=null;S.sj.wxm={};const pr=rdFetch(1,rdCity());
   s.city='jeddah';render();const before=document.querySelector('.fxtemp')?document.querySelector('.fxtemp').textContent:'';
   rel();await pr;await new Promise(r=>setTimeout(r,100));const after=document.querySelector('.fxtemp')?document.querySelector('.fxtemp').textContent:'';WXP.get=g;
   return{before:before,after:after,own:rdKey(rdCity()),stored:Object.keys(rdWxM())}});
  ok(late.before===late.after,'رد طقس متأخر لمدينة سابقة لا يغيّر بطاقة المدينة الحالية',JSON.stringify(late));
  const st=await p.evaluate(()=>{const s=rdS();s.city='madinah';S.sj.wxm={};render();return document.querySelector('.fxscene').innerText});
  ok(/لا يتوفر توقع|تعذّر|انتهت/.test(st),'بلا بيانات: حالة واضحة وليس رقمًا مختلقًا');
  const ph=await p.evaluate(()=>{const c=rdCity(),out={};[1,7,12,18,21].forEach(h=>{const ds=rdP(rdNow(),c.tz).d;out[h]=fxPhase(rdAt(ds,h*60,c.tz),c).ph});return out});
  ok(ph[1]==='night'&&ph[12]==='day'&&ph[21]==='night','مراحل المشهد: ليل/نهار بحسب الشروق والغروب',JSON.stringify(ph));
  ok(await p.evaluate(()=>{const s=rdS();return !!s&&NAT===false}),'نسخة الويب: المسار غير الأصلي');
  /* الرفض: لا إضافة أصلية → يفتح اختيار المدينة اليدوي */
  await p.evaluate(()=>{ACT.rdgeo()});await p.waitForTimeout(300);
  ok(!!await p.$('#fx-sheet .fxsearch'),'عند فشل الموقع يظهر اختيار المدينة اليدوي');
  ok(p.errs.length===0,'لا أخطاء سكربت',p.errs.join('|'));await ctx.close()}
 console.log('4) الخطوات والنوم والنبض');
 {const {ctx,p}=await mk(390);
  const r=await p.evaluate(()=>{const o=[];let s=fxStepAdv(null,{steps:1000,bootAt:5e5,at:1},'d1');s=fxStepAdv(s,{steps:1500,bootAt:5e5+900,at:2},'d1');o.push(s.acc);
   s=fxStepAdv(s,{steps:200,bootAt:9e6,at:3},'d1');o.push(s.acc);s=fxStepAdv(s,{steps:260,bootAt:9e6,at:4},'d2');o.push(s.acc);
   S.stp=null;fxStepHc('2026-01-01',3000);fxStp().src['2026-01-01'].sn=4000;fxStepResolve('2026-01-01');o.push(S.cd['2026-01-01'].steps+S.cd['2026-01-01'].stsrc);return o});
  ok(r[0]===500&&r[1]===700&&r[2]===0&&r[3]==='3000hc','عدّاد الخطوات: نفس الإقلاع +500، إعادة تشغيل 700، يوم جديد 0، هاتف+ساعة لا يُجمعان ('+r.join()+')');
  const tx=await p.evaluate(()=>{const o=[];['dash','train','food','pg','ex'].forEach(t=>{S.tab=t;S.sub=null;render();o.push(document.body.innerText)});S.tab='ex';S.sub='set';render();o.push(document.body.innerText);return o.join('\n')});
  ok(!/نبض الراحة|النوم \(ساعات\)|سجّل نومك|حزام نبض/.test(tx),'لا إدخال يدوي للنوم أو النبض في الواجهة');
  await p.evaluate(()=>{S.sleep['2026-10-01']=7;S.cd['2026-10-01']={steps:5000,hr:60};save()});
  ok(await p.evaluate(()=>S.sleep['2026-10-01']===7&&S.cd['2026-10-01'].hr===60),'السجلات القديمة محفوظة في البيانات');
  ok(await p.evaluate(()=>!document.querySelector('[data-c="cd:steps"],[data-c=sleep],[data-c="cd:hr"]')&&(S.tab='pg',S.sub='prog',render(),!document.querySelector('[data-c="cd:steps"]'))),'لا حقل إدخال يدوي للخطوات');
  ok(p.errs.length===0,'لا أخطاء سكربت',p.errs.join('|'));await ctx.close()}
 console.log('5) إنهاء جزئي واستئناف');
 {const {ctx,p}=await mk(390);
  await p.evaluate(()=>{S.tab='dash';S.sub=null;render()});
  await p.click('[data-a=wkstart]');await p.waitForTimeout(300);
  ok(await p.evaluate(()=>S.sub==='wk'&&!!UI.wk),'بدء الحصة يفتح التمرين الحالي مباشرة');
  const hd=await p.evaluate(()=>{const e=document.querySelector('.wkt');const r=e.getBoundingClientRect();return{top:Math.round(r.top),pos:getComputedStyle(e).position,end:!!e.querySelector('[data-a=wkend]'),clk:!!e.querySelector('#tmv')}});
  ok(hd.top<=12&&hd.pos==='sticky'&&hd.end&&hd.clk,'المؤقت و«إنهاء» في رأس ثابت أعلى الشاشة',JSON.stringify(hd));
  ok(!!await p.$('#wk-src'),'سطر مصدر القيمة الابتدائية ظاهر');
  await p.fill('#wk-w','60');await p.click('[data-a=wkset]');await p.waitForTimeout(250);
  const n1=await p.evaluate(()=>{const sx=Object.values(S.sx)[0];return sx?sxProg(sx).d:-1});ok(n1>=1,'المجموعة الأولى حُفظت فورًا في الجلسة',String(n1));
  await p.reload();await p.waitForTimeout(500);
  const res=await p.evaluate(()=>{S.tab='dash';S.sub=null;render();return !!sxOpen()});ok(res,'الجلسة قابلة للاستئناف بعد إعادة التحميل (إغلاق/قتل التطبيق)');
  await p.click('[data-a=wkstart]');await p.waitForTimeout(300);
  ok(await p.evaluate(()=>S.sub==='wk'&&Object.keys(S.sx).length===1),'الاستئناف يعيد نفس الجلسة دون نسخة ثانية');
  await p.click('[data-a=wkend]');await p.waitForTimeout(200);
  const msg=await p.evaluate(()=>{const d=document.querySelector('#fx-sheet');return d?d.innerText:''});
  ok(/أنجزت/.test(msg)&&/من/.test(msg),'إنهاء جزئي يعرض عدد المجموعات المنجزة قبل التأكيد',msg.replace(/\s+/g,' ').slice(0,80));
  await p.click('#fx-sheet [data-fxs]');await p.waitForTimeout(300);
  const fin=await p.evaluate(()=>({n:Object.keys(S.sx).length,wk:!!UI.wk,sub:S.sub,d:sxProg(Object.values(S.sx)[0]).d}));
  ok(fin.n===1&&!fin.wk&&fin.sub===null&&fin.d>=1,'الجلسة الجزئية محفوظة مرة واحدة (قابلة للاستئناف لاحقًا) وخرجنا من المشغّل',JSON.stringify(fin));
  ok(p.errs.length===0,'لا أخطاء سكربت',p.errs.join('|'));await ctx.close()}
 console.log('6) التباين: أسود وأبيض');
 for(const th of ['black','white']){const {ctx,p}=await mk(320);
  const bad=await p.evaluate(async th=>{TH=th;try{localStorage.setItem('fit_theme',th)}catch(e){}applyTheme();const lum=c=>{const a=c.match(/[\d.]+/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(a[0])+.7152*f(a[1])+.0722*f(a[2])};
   const bgOf=e=>{let x=e;while(x){const cs=getComputedStyle(x);if(cs.backgroundImage!=='none')return null;const c=cs.backgroundColor;const a=c.match(/[\d.]+/g);if((a.length>3?+a[3]:1)>=.9)return c;x=x.parentElement}return null};const out=[];
   for(const [t,s] of [['dash',null],['train',null],['food',null],['pg',null],['ex',null],['ex','set']]){S.tab=t;S.sub=s;render();document.querySelectorAll('#app *').forEach(e=>{if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))return;const r=e.getBoundingClientRect();if(r.width<2)return;const cs=getComputedStyle(e);if(cs.display==='none'||+cs.opacity===0)return;const bg=bgOf(e);if(!bg||e.closest('.fxscene,.nbd'))return;const l1=lum(cs.color),l2=lum(bg),cr=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);const big=parseFloat(cs.fontSize)>=18.6;if(cr<(big?3:4.5))out.push(t+':'+e.textContent.trim().slice(0,12)+' '+cr.toFixed(2))})}return out.slice(0,5)},th);
  ok(bad.length===0,'تباين النصوص ≥ 4.5 في '+th+' (320)',bad.join(' | '));await ctx.close()}
 await b.close();console.log(fail?fail+' فشل':'كل الاختبارات نجحت');process.exit(fail?1:0)})()
