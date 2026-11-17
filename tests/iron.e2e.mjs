// قسم «تمارين الحديد» (متصفح، بيانات اصطناعية، ساعة ثابتة على يوم تمرين). الأرقام تُدخل بالأرقام العربية لاختبار التحويل.
import path from 'node:path';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(import.meta.url)(path.join(process.env.NODE_PATH||'','playwright'));
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let fails=0;const rec=(id,name,ok,ev)=>{if(!ok)fails++;console.log((ok?'PASS ':'FAIL ')+id+' '+name+(ok?'':' — '+String(ev).slice(0,400)))};
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844},timezoneId:'Asia/Riyadh'});await ctx.clock.install({time:new Date('2026-11-16T10:00:00+03:00')});
const ready=p=>p.waitForFunction(()=>typeof S!=='undefined'&&typeof irHist==='function'&&S.prof&&S.prof.ob===1);
async function open(){const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto('file://'+ROOT+'/www/index.html');await p.waitForFunction(()=>typeof S!=='undefined'&&typeof irHist==='function');return p}
const SEED=`S.prof.ob=1;S.prof.name='اختبار';S.prof.sex='m';S.prof.age=30;S.prof.ht=178;S.prof.startW=85;S.prof.goalType='lose';S.prof.lvl='b';S.prof.eq='gym';S.prof.dpw=7;calcTargets();genPlan();S.plan[TI()]={t:'صدر',ex:[E('ضغط الصدر بالبار',4,8,0),E('تفتيح دمبل',3,12,0)]};save();`;
const go=async(p,t)=>{await p.evaluate(t=>{S.tab='train';S.sub=null;UI.trk='irs';UI.irt=t;render()},t);await p.waitForTimeout(150)};
const tab=async(p,t)=>{await p.click('.irtabs [data-v='+t+']');await p.waitForTimeout(150)};
const txt=p=>p.evaluate(()=>document.querySelector('#ir-body').textContent.replace(/\s+/g,' '));
let p=await open();await p.evaluate(SEED);await p.reload();await p.waitForFunction(()=>typeof irHist==='function'&&S.prof.ob===1);await p.waitForTimeout(300);
const TIDX=await p.evaluate(()=>TI());
/* 1) البداية والتبويبات الأربعة */
await go(p,'day');
const tabs=await p.$$eval('.irtabs button',e=>e.map(x=>x.textContent.trim()));
rec('I1','أربعة تبويبات متجاورة بالعربية: خطة اليوم، جدولي، السجل، التقدّم',JSON.stringify(tabs)===JSON.stringify(['خطة اليوم','جدولي','السجل','التقدّم'])&&await p.evaluate(()=>getComputedStyle(document.documentElement).direction==='rtl'||document.dir==='rtl'||getComputedStyle(document.body).direction==='rtl'),tabs);
rec('I2','عرض البدء: حصة اليوم وحصة حرة وقالب وجدول',await p.$('#ir-start-plan')&&await p.$('#ir-start-free')&&/قالب جاهز/.test(await txt(p))&&/جدولًا أسبوعيًا/.test(await txt(p)),await txt(p));
await p.click('#ir-start-plan');await p.waitForTimeout(200);
const ex0=await p.$$eval('.irx .nm',e=>e.map(x=>x.textContent.trim()));
rec('I3','خطة اليوم تعرض تمارين الحصة المقرّرة بمجموعاتها وتكراراتها',ex0.join('|')==='ضغط الصدر بالبار|تفتيح دمبل'&&/0\/4 × 8/.test(await txt(p)),ex0.join('|')+await txt(p));
/* 2) تسجيل ٥٢٫٥ × ٨ بالأرقام العربية */
await p.fill('#ir-w-0','٥٢٫٥');await p.fill('#ir-r-0','٨');await p.click('[data-a=irset][data-n="0"]');await p.waitForTimeout(250);
const S1=await p.evaluate(()=>{const s=irCur();const x=s&&s.ex[0];return{n:x&&x.sets.length,w:x&&x.sets[0].w,r:x&&x.sets[0].r,ar:s&&s.ar,st:s&&s.st,ev:irEvents().filter(e=>e.t==='set+').length,u:s&&s.u,xv:x&&x.xv,saved:document.querySelector('.irset .irok')&&document.querySelector('.irset .irok').textContent.trim()}});
rec('I4','تسجيل «ضغط الصدر بالبار ٥٢٫٥ × ٨»: مجموعة واحدة 52.5×8 محفوظة فورًا وحالتها «محفوظ»، مرتبطة بالمستخدم ونسخة التمرين',S1.n===1&&S1.w===52.5&&S1.r===8&&S1.ar&&S1.st==='p'&&S1.ev===1&&/^l:guest$/.test(S1.u)&&/^C\./.test(S1.xv)&&/محفوظ/.test(S1.saved),JSON.stringify(S1));
rec('I5','حالة الحفظ والمزامنة ظاهرة',/محفوظ/.test(await p.textContent('#ir-sync')),'');
/* 3) جدولي فورًا */
await tab(p,'sch');
const sch=await p.evaluate(()=>{const r=document.querySelector('.irday.today .irrow');return r?r.textContent.replace(/\s+/g,' '):''});
rec('I6','«جدولي» (الأسبوع): آخر وزن 52.5×8 وتاريخ الحصة وعلامة «حصة جارية» فور التسجيل',/52\.5 كغ × 8/.test(sch)&&/2026-11-16/.test(sch)&&/حصة جارية/.test(sch),sch);
rec('I7','«جدولي» يعرض كل أيام الأسبوع وأيام الراحة',await p.$$eval('.irday',e=>e.length)===7&&(await p.$$eval('.irrest',e=>e.length))>=1,'');
await p.click('.irsub [data-v=all]');await p.waitForTimeout(150);
rec('I8','عرض «كل التمارين» يجمع تمارين الخطة مع آخر أداء',/ضغط الصدر بالبار/.test(await txt(p))&&/52\.5 كغ × 8/.test(await txt(p)),await txt(p));
/* 4) السجل */
await tab(p,'log');
const lg=await txt(p);
rec('I9','«السجل» يوثّق المجموعة بتاريخ التنفيذ ووقت التسجيل',/سُجّلت مجموعة/.test(lg)&&/52\.5 كغ × 8/.test(lg)&&/2026-11-16/.test(lg)&&/سُجّل 2026-11-16 \d\d:\d\d/.test(lg),lg);
await p.click('.irev[data-i]');await p.waitForTimeout(200);
const det=await p.evaluate(()=>({hi:!!document.querySelector('.irset.hi'),t:document.querySelector('#ir-detail').textContent.replace(/\s+/g,' ')}));
rec('I10','كل إدخال يفتح المجموعة/الحصة المرتبطة به مع إبراز المجموعة',det.hi&&/جارية|حصة جارية/.test(det.t),JSON.stringify(det));
await p.click('[data-a=irclose]');
/* 5) التقدّم: لا شيء قبل الإنهاء */
await tab(p,'prog');
rec('I11','«التقدّم» لا يعرض الحصة الجارية (المكتملة فقط)',!!(await p.$('#ir-prog-empty')),await txt(p));
/* 6) إضافة «سحب علوي» من خطة اليوم */
await tab(p,'day');await p.fill('#ir-an','سحب علوي');await p.fill('#ir-as','3');await p.fill('#ir-ar','10');await p.click('[data-a=iradd]');await p.waitForTimeout(200);
const ban=await p.textContent('#ir-added');
const plan1=await p.evaluate(()=>S.plan[TI()].ex.map(e=>e.n));
rec('I12','إضافة «سحب علوي» تظهر رسالة «أُضيف إلى جدولي» مع «تراجع» وتضيفه إلى يومه',/أُضيف إلى جدولي/.test(ban)&&!!(await p.$('#ir-undoadd'))&&plan1.indexOf('سحب علوي')===2,ban+JSON.stringify(plan1));
await tab(p,'sch');await p.click('.irsub [data-v=wk]');await p.waitForTimeout(150);
rec('I13','«جدولي» يعرض «سحب علوي» في يومه',/سحب علوي/.test(await p.evaluate(()=>document.querySelector('.irday.today').textContent)),'');
await tab(p,'log');
rec('I14','السجل يوثّق إضافة التمرين',/أُضيف تمرين · سحب علوي/.test(await txt(p)),await txt(p));
await tab(p,'day');await p.fill('#ir-an','سحب علوي');await p.click('[data-a=iradd]');await p.waitForTimeout(150);
rec('I15','إضافة التمرين نفسه إلى اليوم نفسه تعيد استعمال الصف ولا تكرّره',/موجود في جدولي/.test(await p.textContent('#ir-added'))&&(await p.evaluate(()=>S.plan[TI()].ex.filter(e=>e.n==='سحب علوي').length))===1,'');
await p.fill('#ir-an','تمرين تجريبي');await p.click('[data-a=iradd]');await p.waitForTimeout(150);await p.click('#ir-undoadd');await p.waitForTimeout(150);
rec('I16','«تراجع» عن الإضافة يزيل الصف من الجدول والحصة ويوثّق ذلك',(await p.evaluate(()=>[S.plan[TI()].ex.some(e=>e.n==='تمرين تجريبي'),irCur().ex.some(x=>x.n==='تمرين تجريبي'),irEvents().some(e=>e.t==='ex-'&&e.n==='تمرين تجريبي')])).join()==='false,false,true','');
/* 7) تعديل مجموعة ثم إنهاء الحصة */
await p.click('[data-a=iredit]');await p.waitForTimeout(100);await p.fill('#ir-ew','٥٥');await p.click('[data-a=irsave]');await p.waitForTimeout(200);
const ed=await p.evaluate(()=>({w:irCur().ex[0].sets[0].w,up:irCur().ex[0].sets[0].up>irCur().ex[0].sets[0].at,ev:irEvents().find(e=>e.t==='set~')}));
rec('I17','تعديل مجموعة (52.5→55) يحفظ وقت التعديل ويوثّق القيمة القديمة والجديدة',ed.w===55&&ed.up&&ed.ev&&ed.ev.ow===52.5&&ed.ev.w===55,JSON.stringify(ed));
await p.click('#ir-fin');await p.waitForTimeout(100);await p.click('#ir-fin-ok');await p.waitForTimeout(250);
const fin=await p.evaluate(()=>({st:Object.values(S.sx).map(s=>s.st),cur:!!irCur(),H:Object.keys(irHist()).length}));
rec('I18','إنهاء الحصة يجعلها مكتملة',fin.st.join()==='c'&&!fin.cur&&fin.H>=1,JSON.stringify(fin));
await tab(p,'prog');
const pr=await txt(p);
rec('I19','بعد الإنهاء تظهر النتائج في «التقدّم» (الرسم والأثقل 55)',!!(await p.$('#ir-chart'))&&/ضغط الصدر بالبار/.test(pr)&&/55/.test(await p.textContent('#ir-chart')),pr);
const mus=await p.evaluate(()=>{const M=irMuscle(W());return{chest:M.chest&&M.chest.dir,items:M.chest&&M.chest.items.length}});
rec('I20','عدّ المجموعات الأسبوعي لكل عضلة من الحصص المكتملة (الصدر مباشر 1) مع التمارين المكوّنة',mus.chest===1&&mus.items===1&&/الصدر/.test(await p.textContent('#ir-muscle')),JSON.stringify(mus));
await p.click('.irmh');await p.waitForTimeout(150);
rec('I21','فتح العضلة يعرض التمارين التي كوّنت العدد ويفتح حصتها',!!(await p.$('.irmit')),'');
await p.click('.irmit');await p.waitForTimeout(150);
rec('I22','الرسم يفتح السجل: اضغط نقطة → الحصة',!!(await p.$('#ir-detail')),'');
await tab(p,'prog');await p.click('.irpt');await p.waitForTimeout(150);
rec('I23','نقطة الرسم تفتح الحصة والمجموعة في السجل',!!(await p.$('#ir-detail'))&&!!(await p.$('.irset.hi')),'');
/* 8) حذف مجموعة يعيد الحساب */
await p.click('[data-a=irdel]');await p.waitForTimeout(200);
const after=await p.evaluate(()=>({H:Object.keys(irHist()).length,mus:irMuscle(W()).chest||null,done:Object.keys(S.done).length}));
rec('I24','حذف المجموعة يعيد حساب التقدّم والعضلات من السجل المحدّث ويوثّق الحذف',after.H===0&&!after.mus&&/حُذفت مجموعة/.test(await p.evaluate(()=>irEvents().map(e=>irEvTx(e)).join('|'))),JSON.stringify(after));
rec('I25','لا أخطاء سكربت',p.errs.length===0,p.errs.join('|'));
await b.close();console.log(fails?`\n${fails} FAIL`:'\nall PASS');process.exit(fails?1:0)
